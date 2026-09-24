<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Models\PicketReport;
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
            ->take(5)
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
        ]);
    }

    public function submitPicket(Request $request)
    {
        $validated = $request->validate([
            'notes' => 'required|string|min:5',
            'photo' => 'nullable|image|max:5120', // 5MB
        ]);

        $user = auth()->user();
        $classroomId = $user->classroom_id ?? Classroom::first()->id;

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
        ]);

        return back()->with('success', 'Laporan piket kelas berhasil dikirimkan ke Wali Kelas. Menunggu verifikasi.');
    }
}
