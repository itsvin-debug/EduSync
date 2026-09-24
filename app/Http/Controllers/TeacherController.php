<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Schedule;
use App\Models\Classroom;
use App\Models\InvalRequest;
use App\Models\PicketReport;
use App\Models\AuditLog;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher ?? Teacher::where('name', $user->name)->first() ?? Teacher::first();

        // Get personal weekly schedule for this teacher
        $personalSchedules = Schedule::where('teacher_id', $teacher->id)
            ->with(['classroom.department', 'subject', 'room'])
            ->orderBy('period_start')
            ->get();

        // Compute current / next ongoing class
        $todayName = match(now()->dayOfWeekIso) {
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            default => 'Senin',
        };

        $todaySchedules = $personalSchedules->where('day', $todayName)->values();
        $activeSchedule = $todaySchedules->first();

        // Master class schedule lookup
        $classrooms = Classroom::with('department')->orderBy('grade')->orderBy('name')->get();
        $selectedClassroomId = $request->query('lookup_class_id', $classrooms->first()?->id);
        $masterClassSchedule = Schedule::where('classroom_id', $selectedClassroomId)
            ->with(['subject', 'teacher', 'room'])
            ->get();

        // Inval requests involving this teacher
        $myInvalRequests = InvalRequest::where('requester_teacher_id', $teacher->id)
            ->orWhere('substitute_teacher_id', $teacher->id)
            ->with(['requester', 'substitute', 'schedule.classroom', 'schedule.subject'])
            ->latest()
            ->get();

        // Picket submissions to review (if homeroom teacher / wali kelas or Kajur)
        $picketReports = PicketReport::with(['student', 'classroom'])
            ->latest()
            ->get();

        $allTeachers = Teacher::where('id', '!=', $teacher->id)->orderBy('name')->get();

        return Inertia::render('Teacher/Dashboard', [
            'teacher' => $teacher,
            'personalSchedules' => $personalSchedules,
            'todaySchedules' => $todaySchedules,
            'activeSchedule' => $activeSchedule,
            'todayName' => $todayName,
            'classrooms' => $classrooms,
            'selectedClassroomId' => (int) $selectedClassroomId,
            'masterClassSchedule' => $masterClassSchedule,
            'invalRequests' => $myInvalRequests,
            'picketReports' => $picketReports,
            'allTeachers' => $allTeachers,
        ]);
    }

    public function swapRequest(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'substitute_teacher_id' => 'required|exists:teachers,id',
            'date' => 'required|date|after_or_equal:today',
            'reason' => 'required|string|min:5',
            'notes' => 'nullable|string',
        ]);

        $teacher = auth()->user()->teacher ?? Teacher::first();

        $inval = InvalRequest::create([
            'requester_teacher_id' => $teacher->id,
            'substitute_teacher_id' => $validated['substitute_teacher_id'],
            'schedule_id' => $validated['schedule_id'],
            'date' => $validated['date'],
            'reason' => $validated['reason'],
            'notes' => $validated['notes'],
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'INVAL_REQUESTED',
            'description' => "Pengajuan tukar jam mengajar diajukan oleh {$teacher->name}",
            'details' => $inval->toArray(),
        ]);

        return back()->with('success', 'Pengajuan penggantian guru (inval) berhasil dikirimkan ke Kurikulum.');
    }

    public function verifyPicket(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'validation_notes' => 'nullable|string',
        ]);

        $picket = PicketReport::findOrFail($id);
        $picket->update([
            'status' => $validated['status'],
            'validator_user_id' => auth()->id(),
            'validation_notes' => $validated['validation_notes'] ?? ($validated['status'] === 'approved' ? 'Kebersihan dan kerapihan terverifikasi baik.' : 'Perlu pembersihan ulang.'),
            'verified_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'PICKET_VERIFIED',
            'description' => "Verifikasi piket kelas {$picket->classroom->name} disetujui oleh " . auth()->user()->name,
        ]);

        return back()->with('success', $validated['status'] === 'approved' ? 'Bukti piket siswa berhasil disetujui (ACC).' : 'Laporan piket ditolak untuk revisi.');
    }
}
