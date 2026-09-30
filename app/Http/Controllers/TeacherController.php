<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Schedule;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\InvalRequest;
use App\Models\PicketReport;
use App\Models\TeacherAttendance;
use App\Models\LearningTask;
use App\Models\OfficialDutyLeave;
use App\Models\TrashReport;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use App\Models\User;
use App\Models\Department;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Carbon\Carbon;

class TeacherController extends Controller
{
    private function getTeacher(): Teacher
    {
        $user = auth()->user();
        return $user?->teacher
            ?? ($user?->id ? Teacher::where('user_id', $user->id)->first() : null)
            ?? ($user?->name ? Teacher::where('name', $user->name)->first() : null)
            ?? Teacher::first();
    }

    public function dashboard(Request $request)
    {
        $user = auth()->user();
        $teacher = $this->getTeacher();

        // Get personal weekly schedule for this teacher
        $personalSchedules = Schedule::where('teacher_id', $teacher->id)
            ->with(['classroom.department', 'classroom.room', 'subject', 'room'])
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

        $nowJakarta = Carbon::now('Asia/Jakarta');
        $todaySchedules = $personalSchedules->where('day', $todayName)->values();
        $activeSchedule = $todaySchedules->first(fn ($s) => $s->status === 'ONGOING')
            ?? $todaySchedules->first(fn ($s) => $s->status === 'UPCOMING')
            ?? $todaySchedules->last();

        // Master class schedule lookup
        $classrooms = Classroom::with(['department', 'room'])->orderBy('grade')->orderBy('name')->get();
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

        // Picket submissions to review
        $picketReports = PicketReport::with(['student', 'classroom'])
            ->latest()
            ->get();

        $allTeachers = Teacher::where('id', '!=', $teacher->id)->orderBy('name')->get();

        // Sync with Admin features: Presensi Hari Ini
        $todayAttendance = TeacherAttendance::where('teacher_id', $teacher->id)
            ->where('date', now()->toDateString())
            ->first();

        // Sync with Admin features: Tugas KBM Mandiri
        $myLearningTasks = LearningTask::where('teacher_id', $teacher->id)
            ->with(['classroom.department', 'subject', 'classLeader'])
            ->latest()
            ->take(15)
            ->get();

        // Sync with Admin features: Izin Keluar Dinas
        $myDutyLeaves = OfficialDutyLeave::where('teacher_id', $teacher->id)
            ->latest()
            ->take(10)
            ->get();

        // Sync with Admin features: Laporan Sampah / Kebersihan
        $myTrashReports = TrashReport::where('teacher_id', $teacher->id)
            ->with(['classroom.department', 'department'])
            ->latest()
            ->take(15)
            ->get();

        $subjects = Subject::orderBy('name')->get();
        $departments = Department::all();

        // Registered Class Leaders across departments & classes for task delegation
        $classLeaders = User::where('role', 'siswa')
            ->where('is_class_leader', true)
            ->with('classroom.department')
            ->orderBy('name')
            ->get();

        // Student Leave & Sickness Applications
        $studentLeaveRequests = StudentLeaveRequest::with(['student.classroom.department', 'classroom'])
            ->latest()
            ->take(20)
            ->get();

        // Aggregate class attendance metrics across this teacher's assigned classes
        $myClassIds = $personalSchedules->pluck('classroom_id')->unique()->values();
        $todayClassAttendances = StudentAttendance::where('date', now()->toDateString())
            ->whereIn('classroom_id', $myClassIds)
            ->with(['student', 'classroom'])
            ->get();

        $attendanceMetrics = [
            'hadir' => $todayClassAttendances->where('status', 'hadir')->count(),
            'sakit' => $todayClassAttendances->where('status', 'sakit')->count(),
            'izin' => $todayClassAttendances->where('status', 'izin')->count(),
            'dispensasi' => $todayClassAttendances->where('status', 'dispensasi')->count(),
            'alpha' => $todayClassAttendances->where('status', 'alpha')->count(),
            'total' => $todayClassAttendances->count(),
        ];

        // Live Class Attendance for selected lookup classroom
        $selectedClassAttendances = StudentAttendance::where('date', now()->toDateString())
            ->where('classroom_id', $selectedClassroomId)
            ->with('student')
            ->get();

        $selectedClassStudents = User::where('classroom_id', $selectedClassroomId)
            ->where('role', 'siswa')
            ->orderBy('name')
            ->get();

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
            'todayAttendance' => $todayAttendance,
            'myLearningTasks' => $myLearningTasks,
            'myDutyLeaves' => $myDutyLeaves,
            'myTrashReports' => $myTrashReports,
            'subjects' => $subjects,
            'departments' => $departments,
            'classLeaders' => $classLeaders,
            'studentLeaveRequests' => $studentLeaveRequests,
            'attendanceMetrics' => $attendanceMetrics,
            'selectedClassAttendances' => $selectedClassAttendances,
            'selectedClassStudents' => $selectedClassStudents,
        ]);
    }

    public function checkInAttendance(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:hadir,izin_dinas,sakit',
            'notes' => 'nullable|string|max:255',
        ]);

        $teacher = $this->getTeacher();
        $now = now();
        $timeStr = $now->format('H:i') . ' WIB';

        $attendance = TeacherAttendance::updateOrCreate(
            [
                'teacher_id' => $teacher->id,
                'date' => $now->toDateString(),
            ],
            [
                'status' => $validated['status'],
                'check_in_time' => $timeStr,
                'notes' => $validated['notes'] ?? ($validated['status'] === 'hadir' ? 'Check-in mandiri guru' : ucfirst($validated['status'])),
            ]
        );

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'TEACHER_ATTENDANCE_CHECKIN',
            'description' => "Presensi harian ({$validated['status']}) dicatat oleh {$teacher->name} pada {$timeStr}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Presensi harian ({$validated['status']}) berhasil disimpan!");
    }

    public function storeLearningTask(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'class_leader_id' => 'nullable|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'period_start' => 'required|integer|min:1|max:10',
            'period_end' => 'required|integer|min:1|max:10',
            'title' => 'required|string|max:255',
            'instructions' => 'required|string',
            'file_url' => 'nullable|string|max:500',
        ]);

        $teacher = $this->getTeacher();

        // Dynamic auto-detect Class Leader if not chosen
        $classLeaderId = $validated['class_leader_id'] ?? null;
        if (!$classLeaderId) {
            $classLeaderId = Classroom::find($validated['classroom_id'])?->class_leader_id
                ?? User::where('classroom_id', $validated['classroom_id'])->where('is_class_leader', true)->value('id');
        }

        $task = LearningTask::create([
            'teacher_id' => $teacher->id,
            'classroom_id' => $validated['classroom_id'],
            'class_leader_id' => $classLeaderId,
            'subject_id' => $validated['subject_id'],
            'date' => now()->toDateString(),
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'title' => $validated['title'],
            'instructions' => $validated['instructions'],
            'file_url' => $validated['file_url'] ?? null,
            'is_verified' => true,
            'status' => 'dispatched',
        ]);

        $leaderName = $task->classLeader?->name ?? 'Ketua Kelas';
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'LEARNING_TASK_CREATED',
            'description' => "Guru {$teacher->name} membuat tugas KBM mandiri '{$task->title}' didelegasikan ke {$leaderName}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Tugas KBM mandiri / modul pengganti berhasil dikirimkan ke {$leaderName} dan tersinkronisasi ke Admin.");
    }

    public function storeDutyLeave(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'destination' => 'required|string|max:255',
            'purpose' => 'required|string',
            'letter_number' => 'nullable|string|max:100',
        ]);

        $teacher = $this->getTeacher();

        $duty = OfficialDutyLeave::create([
            'teacher_id' => $teacher->id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'destination' => $validated['destination'],
            'purpose' => $validated['purpose'],
            'letter_number' => $validated['letter_number'] ?? null,
            'status' => 'pending',
            'duty_status' => 'di_luar_dinas',
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'DUTY_LEAVE_REQUESTED',
            'description' => "Pengajuan izin keluar dinas oleh {$teacher->name} ke {$duty->destination}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Permohonan izin keluar dinas berhasil dikirimkan ke Admin Kurikulum.');
    }

    public function storeTrashReport(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'quantity_description' => 'required|string',
            'period_time' => 'nullable|string|max:100',
            'location_tag' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'photos' => 'nullable|array',
            'photos.*' => 'nullable|string',
        ]);

        $teacher = $this->getTeacher();
        $classroom = Classroom::find($validated['classroom_id']);

        $trash = TrashReport::create([
            'classroom_id' => $validated['classroom_id'],
            'department_id' => $validated['department_id'] ?? $classroom?->department_id,
            'teacher_id' => $teacher->id,
            'quantity_description' => $validated['quantity_description'],
            'location_tag' => $validated['location_tag'] ?? ("Dekat " . ($classroom?->name ?? 'Ruang Kelas')),
            'photos' => $validated['photos'] ?? null,
            'date' => now()->toDateString(),
            'period_time' => $validated['period_time'] ?? ('Jam ke-' . (now()->hour > 12 ? '7' : '3')),
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'TRASH_REPORTED',
            'description' => "Guru {$teacher->name} melaporkan kebersihan lokasi {$trash->location_tag}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Laporan kebersihan ruang kelas/area berhasil dicatat untuk verifikasi Admin & Kurikulum.');
    }

    public function approveStudentLeave(Request $request, $id)
    {
        $teacher = $this->getTeacher();
        $leave = StudentLeaveRequest::with(['student', 'classroom'])->findOrFail($id);

        $leave->update([
            'status' => 'approved',
            'reviewed_by_teacher_id' => $teacher->id,
            'reviewed_by_user_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Auto-sync into student_attendances table for date range without manual intervention
        $start = Carbon::parse($leave->start_date);
        $end = Carbon::parse($leave->end_date);
        $status = in_array($leave->type, ['sakit', 'izin', 'dispensasi']) ? $leave->type : 'izin';

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            if ($date->isWeekend()) continue;

            StudentAttendance::updateOrCreate(
                [
                    'user_id' => $leave->student_id,
                    'date' => $date->toDateString(),
                ],
                [
                    'classroom_id' => $leave->classroom_id,
                    'submitted_by_user_id' => auth()->id(),
                    'status' => $status,
                    'notes' => "Surat {$leave->type} diverifikasi oleh Wali Kelas/Guru ({$teacher->name})",
                    'submitted_time' => now()->format('H:i') . ' WIB',
                    'is_locked' => true,
                ]
            );
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'TEACHER_APPROVED_LEAVE',
            'description' => "Guru {$teacher->name} menyetujui surat {$leave->type} siswa {$leave->student?->name} ({$leave->classroom?->name})",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Permohonan {$leave->type} siswa {$leave->student?->name} berhasil disetujui dan data presensi kelas otomatis terisi.");
    }

    public function rejectStudentLeave(Request $request, $id)
    {
        $teacher = $this->getTeacher();
        $leave = StudentLeaveRequest::with('student')->findOrFail($id);

        $leave->update([
            'status' => 'rejected',
            'reviewed_by_teacher_id' => $teacher->id,
            'reviewed_by_user_id' => auth()->id(),
            'rejection_note' => $request->input('notes', 'Bukti surat izin tidak memenuhi kriteria.'),
            'reviewed_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'TEACHER_REJECTED_LEAVE',
            'description' => "Guru {$teacher->name} menolak surat {$leave->type} siswa {$leave->student?->name}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Permohonan izin siswa telah ditolak.");
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

        $teacher = $this->getTeacher();

        // 1. Cannot request oneself as substitute
        if ((int) $validated['substitute_teacher_id'] === (int) $teacher->id) {
            return back()->withErrors(['substitute_teacher_id' => 'Guru pengganti tidak boleh diri Anda sendiri.'])->withInput();
        }

        $schedule = Schedule::with(['classroom', 'subject', 'teacher'])->findOrFail($validated['schedule_id']);

        // 2. Must own the schedule (unless admin)
        if ($schedule->teacher_id !== $teacher->id && auth()->user()->role !== 'admin') {
            return back()->withErrors(['schedule_id' => 'Anda hanya dapat mengajukan permohonan inval untuk jadwal mengajar Anda sendiri.'])->withInput();
        }

        // 3. Verify date matches schedule day of week
        $targetDate = \Carbon\Carbon::parse($validated['date']);
        $dayName = match($targetDate->dayOfWeekIso) {
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            default => null,
        };

        if (!$dayName || $dayName !== $schedule->day) {
            $formattedDay = $targetDate->locale('id')->isoFormat('dddd');
            return back()->withErrors([
                'date' => "Tanggal {$validated['date']} jatuh pada hari {$formattedDay}, sedangkan jadwal ini berada di hari {$schedule->day}."
            ])->withInput();
        }

        // 4. Verify no pending duplicate request
        $duplicate = InvalRequest::where('schedule_id', $schedule->id)
            ->where('date', $validated['date'])
            ->where('status', 'pending')
            ->exists();

        if ($duplicate) {
            return back()->withErrors(['schedule_id' => 'Sudah ada permohonan inval yang sedang menunggu persetujuan untuk jadwal dan tanggal ini.'])->withInput();
        }

        // 5. Verify substitute teacher is not busy teaching at that exact slot
        $substituteBusy = Schedule::where('teacher_id', $validated['substitute_teacher_id'])
            ->where('day', $schedule->day)
            ->where('period_start', '<=', $schedule->period_end)
            ->where('period_end', '>=', $schedule->period_start)
            ->with('classroom')
            ->first();

        if ($substituteBusy) {
            $subTeacher = Teacher::find($validated['substitute_teacher_id']);
            $subName = $subTeacher?->name ?? 'Guru Pengganti';
            $busyClass = $substituteBusy->classroom?->name ?? 'kelas lain';
            return back()->withErrors([
                'substitute_teacher_id' => "{$subName} tidak dapat dipilih karena memiliki jadwal mengajar di {$busyClass} pada hari {$schedule->day} (Jam ke-{$substituteBusy->period_start}-{$substituteBusy->period_end})."
            ])->withInput();
        }

        $inval = InvalRequest::create([
            'requester_teacher_id' => $teacher->id,
            'substitute_teacher_id' => $validated['substitute_teacher_id'],
            'schedule_id' => $validated['schedule_id'],
            'date' => $validated['date'],
            'reason' => $validated['reason'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'INVAL_REQUESTED',
            'description' => "Pengajuan tukar jam mengajar diajukan oleh {$teacher->name}",
            'details' => $inval->toArray(),
            'ip_address' => $request->ip(),
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
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', $validated['status'] === 'approved' ? 'Bukti piket siswa berhasil disetujui (ACC).' : 'Laporan piket ditolak untuk revisi.');
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'nip' => 'nullable|string|max:30',
            'title' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|max:5120',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'nip' => $validated['nip'] ?? $user->nip,
            'sub_role' => $validated['title'] ?? $user->sub_role,
        ];

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $userData['avatar'] = '/storage/' . $path;
        }

        $user->update($userData);

        if ($user->teacher) {
            $user->teacher->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'nip' => $validated['nip'] ?? $user->teacher->nip,
                'title' => $validated['title'] ?? $user->teacher->title,
            ]);
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'TEACHER_PROFILE_UPDATED',
            'description' => "Guru {$user->name} memperbarui data profil akun.",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Profil guru berhasil diperbarui.');
    }

    public function updatePassword(Request $request)
    {
        $user = auth()->user();
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'Kata sandi saat ini tidak sesuai.',
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'TEACHER_PASSWORD_UPDATED',
            'description' => "Guru {$user->name} berhasil mengubah kata sandi akun.",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Kata sandi akun guru berhasil diperbarui.');
    }
}
