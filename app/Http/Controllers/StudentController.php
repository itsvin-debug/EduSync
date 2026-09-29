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
use App\Models\StudentLeaveRequest;
use App\Models\SchoolOrganization;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        $classroom = $user->classroom ?? Classroom::where('code', 'XI_PPLG_1')->first() ?? Classroom::first();
        $isClassLeader = (bool) ($user->is_class_leader || $user->sub_role === 'Ketua Kelas');

        // All schedules for student's classroom
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
        $allTeachers = Teacher::orderBy('name')->get();

        // Class students roster (for Class Leader attendance management)
        $classStudents = User::where('classroom_id', $classroom->id)
            ->where('role', 'siswa')
            ->orderBy('name')
            ->get();

        // Today's attendance records for the class
        $todayAttendances = StudentAttendance::where('classroom_id', $classroom->id)
            ->whereDate('date', now()->toDateString())
            ->with('student')
            ->get();

        // Auto-lock status at 13:00 (1:00 PM)
        $isAttendanceLocked = now()->hour >= 13;

        // Class statistics
        $attendanceStats = [
            'total' => $classStudents->count(),
            'hadir' => $todayAttendances->where('status', 'hadir')->count(),
            'sakit' => $todayAttendances->where('status', 'sakit')->count(),
            'izin' => $todayAttendances->where('status', 'izin')->count(),
            'dispensasi' => $todayAttendances->where('status', 'dispensasi')->count(),
            'alpha' => $todayAttendances->where('status', 'alpha')->count(),
        ];

        // Personal attendance for logged-in student
        $myAttendances = StudentAttendance::where('user_id', $user->id)
            ->latest('date')
            ->take(30)
            ->get();

        $myAttendanceStats = [
            'hadir' => $myAttendances->where('status', 'hadir')->count(),
            'sakit' => $myAttendances->where('status', 'sakit')->count(),
            'izin' => $myAttendances->where('status', 'izin')->count(),
            'dispensasi' => $myAttendances->where('status', 'dispensasi')->count(),
            'alpha' => $myAttendances->where('status', 'alpha')->count(),
        ];

        // Student's own leave requests
        $myLeaveRequests = StudentLeaveRequest::where('student_id', $user->id)
            ->with(['homeroomTeacher', 'reviewedByTeacher'])
            ->latest()
            ->take(15)
            ->get();

        // Class picket and cleanliness history
        $picketHistory = PicketReport::where('classroom_id', $classroom->id)
            ->with(['student', 'submittedBy'])
            ->latest()
            ->take(15)
            ->get();

        // Class Fines
        $classFines = ClassFine::where('classroom_id', $classroom->id)
            ->latest()
            ->get();

        // Substitute teacher tasks / Learning tasks
        $learningTasks = LearningTask::where('classroom_id', $classroom->id)
            ->with(['subject', 'teacher', 'classLeader'])
            ->latest()
            ->take(15)
            ->get();

        // School Organizations & Extracurriculars
        $organizations = SchoolOrganization::where('status', 'active')
            ->with('supervisorTeacher')
            ->get();

        return Inertia::render('Student/Dashboard', [
            'student' => $user,
            'isClassLeader' => $isClassLeader,
            'classroom' => $classroom->load(['department', 'homeroomTeacher', 'room', 'classLeader']),
            'classSchedules' => $classSchedules,
            'todayTimeline' => $todayTimeline,
            'activeLesson' => $activeLesson,
            'todayName' => $todayName,
            'teachers' => $teachers,
            'allTeachers' => $allTeachers,
            'classStudents' => $classStudents,
            'todayAttendances' => $todayAttendances,
            'attendanceStats' => $attendanceStats,
            'isAttendanceLocked' => $isAttendanceLocked,
            'myAttendances' => $myAttendances,
            'myAttendanceStats' => $myAttendanceStats,
            'myLeaveRequests' => $myLeaveRequests,
            'picketHistory' => $picketHistory,
            'classFines' => $classFines,
            'learningTasks' => $learningTasks,
            'organizations' => $organizations,
        ]);
    }

    public function submitLeaveRequest(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:sakit,izin,dispensasi',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'homeroom_teacher_id' => 'nullable|exists:teachers,id',
            'notes' => 'required|string|min:5',
            'photo' => 'nullable|image|max:5120',
        ]);

        $user = auth()->user();
        $classroom = $user->classroom ?? Classroom::first();

        $proofImage = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('leave_proofs', 'public');
            $proofImage = '/storage/' . $path;
        }

        $leave = StudentLeaveRequest::create([
            'student_id' => $user->id,
            'classroom_id' => $classroom->id,
            'homeroom_teacher_id' => $validated['homeroom_teacher_id'] ?? $classroom->homeroom_teacher_id,
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'proof_image' => $proofImage,
            'notes' => $validated['notes'],
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'STUDENT_LEAVE_SUBMITTED',
            'description' => "Pengajuan surat {$leave->type} oleh {$user->name} ({$classroom->name})",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Permohonan {$leave->type} berhasil dikirimkan ke Wali Kelas. Menunggu verifikasi.");
    }

    public function batchStoreAttendance(Request $request)
    {
        $user = auth()->user();
        $isLeader = (bool) ($user->is_class_leader || $user->sub_role === 'Ketua Kelas' || $user->role === 'admin');

        if (!$isLeader) {
            return back()->with('error', 'Hanya Ketua Kelas yang memiliki hak akses untuk mencatat presensi harian rombel.');
        }

        // 13:00 Auto-lock Check for non-admin
        if (now()->hour >= 13 && $user->role !== 'admin') {
            return back()->with('error', 'Presensi kelas hari ini telah terkunci otomatis pada pukul 13:00 WIB. Hubungi Admin Kurikulum jika ada perbaikan data.');
        }

        $validated = $request->validate([
            'attendances' => 'required|array',
            'attendances.*.user_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|in:hadir,sakit,izin,dispensasi,alpha',
            'attendances.*.notes' => 'nullable|string|max:255',
        ]);

        $classroom = $user->classroom ?? Classroom::first();
        $today = now()->toDateString();
        $now = now();
        $submittedTime = $now->format('H:i:s \W\I\B');

        foreach ($validated['attendances'] as $att) {
            // Check if existing attendance was already approved via leave permit (overridden by admin/teacher)
            $existing = StudentAttendance::where('user_id', $att['user_id'])
                ->where('date', $today)
                ->first();

            if ($existing && $existing->overridden_by_admin && $user->role !== 'admin') {
                // Keep the approved leave record intact without manual overwrite
                continue;
            }

            StudentAttendance::updateOrCreate(
                [
                    'user_id' => $att['user_id'],
                    'date' => $today,
                ],
                [
                    'classroom_id' => $classroom->id,
                    'submitted_by_user_id' => $user->id,
                    'status' => $att['status'],
                    'notes' => $att['notes'] ?? null,
                    'submitted_time' => $submittedTime,
                    'is_locked' => false,
                ]
            );
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'CLASS_ATTENDANCE_BATCH_STORED',
            'description' => "Ketua Kelas {$user->name} menyimpan presensi harian kelas {$classroom->name} pada {$submittedTime}",
            'details' => [
                'day' => $now->locale('id')->isoFormat('dddd'),
                'date' => $now->day,
                'month' => $now->locale('id')->isoFormat('MMMM'),
                'year' => $now->year,
                'timestamp' => $submittedTime,
            ],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "Presensi kelas {$classroom->name} hari ini berhasil disimpan & tersinkronisasi ke portal Guru dan Admin!");
    }

    public function submitDutyReport(Request $request)
    {
        $user = auth()->user();
        $isLeader = (bool) ($user->is_class_leader || $user->sub_role === 'Ketua Kelas' || $user->role === 'admin');

        if (!$isLeader) {
            return back()->with('error', 'Hanya Ketua Kelas yang berhak mengirimkan laporan verifikasi piket kelas harian.');
        }

        $validated = $request->validate([
            'notes' => 'required|string|min:5',
            'area_location' => 'nullable|string|max:255',
            'duty_students' => 'nullable|array',
            'photos' => 'nullable|array',
            'photo' => 'nullable|image|max:5120',
        ]);

        $classroom = $user->classroom ?? Classroom::first();

        $photoUrls = [];
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pickets', 'public');
            $photoUrls[] = '/storage/' . $path;
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $f) {
                $path = $f->store('pickets', 'public');
                $photoUrls[] = '/storage/' . $path;
            }
        }

        // Support direct array of photo urls if passed as demo/strings
        if (!empty($validated['photos']) && is_array($validated['photos'])) {
            foreach ($validated['photos'] as $p) {
                if (is_string($p) && !in_array($p, $photoUrls)) {
                    $photoUrls[] = $p;
                }
            }
        }

        if (empty($photoUrls)) {
            $photoUrls = ['/images/piket_demo_clean.jpg'];
        }

        $report = PicketReport::create([
            'student_id' => $user->id,
            'submitted_by_user_id' => $user->id,
            'classroom_id' => $classroom->id,
            'date' => now()->toDateString(),
            'photo_url' => $photoUrls[0] ?? null,
            'photos' => $photoUrls,
            'duty_students' => $validated['duty_students'] ?? null,
            'area_location' => $validated['area_location'] ?? "Ruang Kelas {$classroom->name} & Selasar",
            'delivery_time' => now()->format('H:i') . ' WIB',
            'notes' => $validated['notes'],
            'status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'DUTY_REPORT_SUBMITTED',
            'description' => "Ketua Kelas {$user->name} melaporkan verifikasi kebersihan piket {$classroom->name}",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Laporan piket kebersihan akhir hari berhasil dikirimkan ke Wali Kelas, Kaprog, dan Admin Kurikulum!');
    }

    public function submitPicket(Request $request)
    {
        return $this->submitDutyReport($request);
    }

    public function updateTaskStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:dispatched,in_progress,completed',
        ]);

        $task = LearningTask::findOrFail($id);
        $task->update(['status' => $validated['status']]);

        return back()->with('success', "Status pengerjaan tugas diperbarui menjadi: " . ucfirst(str_replace('_', ' ', $validated['status'])));
    }

    public function submitFinePayment(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_notes' => 'required|string|min:3',
        ]);

        $fine = ClassFine::findOrFail($id);
        $user = auth()->user();

        if ($user->role !== 'admin' && $user->classroom_id && $user->classroom_id !== $fine->classroom_id) {
            return back()->with('error', 'Anda tidak memiliki hak untuk mengonfirmasi denda kelas lain.');
        }

        if ($fine->payment_status === 'lunas') {
            return back()->with('error', 'Denda kebersihan kelas ini sudah berstatus lunas.');
        }

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

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'STUDENT_PROFILE_UPDATED',
            'description' => "Siswa {$user->name} memperbarui data profil akun.",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Profil akun siswa berhasil diperbarui.');
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
            'action' => 'STUDENT_PASSWORD_UPDATED',
            'description' => "Siswa {$user->name} berhasil mengubah kata sandi akun.",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Kata sandi akun siswa berhasil diperbarui.');
    }
}
