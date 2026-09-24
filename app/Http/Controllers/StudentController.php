<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Models\PicketReport;
use App\Models\ClassFine;
use App\Models\LearningTask;
use App\Models\StudentAttendance;
use App\Models\SchoolOrganization;
use App\Models\AuditLog;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        $classroom = $user->classroom ?? Classroom::where('code', 'XI_PPLG_1')->first() ?? Classroom::first();

        // Get all schedules for the student's class
        $classSchedules = Schedule::where('classroom_id', $classroom->id)
            ->with(['subject', 'teacher', 'room'])
            ->orderBy('period_start')
            ->get();

        $todayName = match(now()->dayOfWeekIso) {
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            default => 'Senin',
        };

        $todayTimeline = $classSchedules->where('day', $todayName)->values();
        $activeLesson = $todayTimeline->first();

        // Teachers teaching in this class
        $teacherIds = $classSchedules->pluck('teacher_id')->unique();
        $teachers = Teacher::whereIn('id', $teacherIds)->get();

        // Student's picket history
        $picketHistory = PicketReport::where('classroom_id', $classroom->id)
            ->with('student')
            ->latest()
            ->take(10)
            ->get();

        // Sync with Admin: Denda Kebersihan Kelas (Class Fines)
        $classFines = ClassFine::where('classroom_id', $classroom->id)
            ->latest()
            ->get();

        // Sync with Admin: Tugas KBM Mandiri Hari Ini (Learning Tasks)
        $learningTasks = LearningTask::where('classroom_id', $classroom->id)
            ->with(['subject', 'teacher'])
            ->whereDate('date', now()->toDateString())
            ->latest()
            ->get();

        // Sync with Admin: Presensi Kelas Hari Ini
        $todayAttendances = StudentAttendance::where('classroom_id', $classroom->id)
            ->whereDate('date', now()->toDateString())
            ->with('user')
            ->get();

        // Sync with Admin: Organisasi & Ekstrakurikuler
        $organizations = SchoolOrganization::where('status', 'active')
            ->with('supervisorTeacher')
            ->get();

        return Inertia::render('Student/Dashboard', [
            'student' => $user,
            'classroom' => $classroom->load(['department', 'homeroomTeacher', 'room']),
            'classSchedules' => $classSchedules,
            'todayTimeline' => $todayTimeline,
            'activeLesson' => $activeLesson,
            'todayName' => $todayName,
            'teachers' => $teachers,
            'picketHistory' => $picketHistory,
            'classFines' => $classFines,
            'learningTasks' => $learningTasks,
            'todayAttendances' => $todayAttendances,
            'organizations' => $organizations,
        ]);
    }

    public function submitPicket(Request $request)
    {
        $validated = $request->validate([
            'notes' => 'required|string|min:5',
            'photo' => 'nullable|image|max:5120',
        ]);

        $user = auth()->user();
        $classroomId = $user->classroom_id ?? Classroom::first()?->id;

        if (!$classroomId) {
            return back()->with('error', 'Data kelas Anda tidak ditemukan di sistem.');
        }

        $photoUrl = '/images/piket_demo.jpg';
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pickets', 'public');
            $photoUrl = '/storage/' . $path;
        }

        $report = PicketReport::create([
            'student_id' => $user->id,
            'classroom_id' => $classroomId,
            'date' => now()->toDateString(),
            'photo_url' => $photoUrl,
            'notes' => $validated['notes'],
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'PICKET_SUBMITTED',
            'description' => "Pengajuan bukti piket diajukan oleh {$user->name}",
            'details' => $report->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Laporan piket kelas berhasil dikirimkan ke Wali Kelas. Menunggu verifikasi.');
    }

    public function submitFinePayment(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_notes' => 'required|string|min:3',
        ]);

        $fine = ClassFine::findOrFail($id);
        $user = auth()->user();

        // 1. Authorization: Only students in the same class or admin can confirm
        if ($user->role !== 'admin' && $user->classroom_id && $user->classroom_id !== $fine->classroom_id) {
            return back()->with('error', 'Anda tidak memiliki hak untuk mengonfirmasi denda kelas lain.');
        }

        // 2. Prevent re-submission if already paid
        if ($fine->payment_status === 'lunas') {
            return back()->with('error', 'Denda kebersihan kelas ini sudah berstatus lunas.');
        }

        // 3. Prevent duplicate submission if already waiting confirmation
        if ($fine->payment_status === 'menunggu_konfirmasi') {
            return back()->with('info', 'Konfirmasi pelunasan sudah diajukan sebelumnya dan sedang menunggu verifikasi.');
        }

        $fine->update([
            'payment_status' => 'menunggu_konfirmasi',
            'payment_notes' => $validated['payment_notes'],
            'submitted_payment_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'FINE_SETTLEMENT_SUBMITTED',
            'description' => "Siswa {$user->name} mengajukan konfirmasi pelunasan denda kebersihan Rp " . number_format($fine->amount, 0, ',', '.'),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Konfirmasi penyelesaian denda kelas berhasil diajukan! Menunggu verifikasi Pembina/Admin.');
    }
}
