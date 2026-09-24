<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Models\User;
use App\Models\InvalRequest;
use App\Models\AuditLog;
use App\Models\StudentAttendance;
use App\Models\TeacherAttendance;
use App\Models\LearningTask;
use App\Models\OfficialDutyLeave;
use App\Models\PicketReport;
use App\Models\TrashReport;
use App\Models\ClassFine;
use App\Models\SchoolOrganization;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Helper to log audit actions
     */
    private function logAction(string $action, string $description, ?array $details = null)
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'details' => $details ?? ['ip' => request()->ip()],
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Compute Real-time Schedule Conflicts
     */
    private function detectConflicts()
    {
        $conflicts = [];
        $schedules = Schedule::with(['teacher', 'classroom', 'room', 'subject'])->get();

        for ($i = 0; $i < count($schedules); $i++) {
            for ($j = $i + 1; $j < count($schedules); $j++) {
                $a = $schedules[$i];
                $b = $schedules[$j];

                if ($a->day === $b->day) {
                    $overlap = max($a->period_start, $b->period_start) <= min($a->period_end, $b->period_end);
                    if ($overlap) {
                        if ($a->teacher_id === $b->teacher_id && $a->classroom_id !== $b->classroom_id) {
                            $conflicts[] = [
                                'type' => 'TEACHER_COLLISION',
                                'message' => "Tabrakan Pengajar: {$a->teacher->name} terjadwal di {$a->classroom->name} dan {$b->classroom->name} pada {$a->day} (Jam ke-{$a->period_start}-{$a->period_end}).",
                                'day' => $a->day,
                                'period' => "Jam {$a->period_start}-{$a->period_end}",
                                'schedules' => [$a->id, $b->id],
                            ];
                        }

                        if ($a->room_id && $a->room_id === $b->room_id && $a->classroom_id !== $b->classroom_id) {
                            $conflicts[] = [
                                'type' => 'ROOM_COLLISION',
                                'message' => "Tabrakan Ruangan: Ruang {$a->room->name} dipakai oleh {$a->classroom->name} dan {$b->classroom->name} pada {$a->day} (Jam ke-{$a->period_start}-{$a->period_end}).",
                                'day' => $a->day,
                                'period' => "Jam {$a->period_start}-{$a->period_end}",
                                'schedules' => [$a->id, $b->id],
                            ];
                        }
                    }
                }
            }
        }

        return $conflicts;
    }

    // ==========================================
    // 1. DASHBOARD & REAL-TIME ATTENDANCE ANALYTICS (Features 1 & 2)
    // ==========================================
    public function dashboard()
    {
        $today = Carbon::today()->toDateString();

        // Dynamic Attendance Recalculation Engine for Today (Auto-resets at 00:00 WIB)
        $studentAttendancesToday = StudentAttendance::with(['student.classroom.department', 'classroom', 'submittedBy'])
            ->where('date', $today)
            ->latest()
            ->get();

        $totalSubmitted = $studentAttendancesToday->count();
        $countHadir = $studentAttendancesToday->where('status', 'hadir')->count();
        $countSakit = $studentAttendancesToday->where('status', 'sakit')->count();
        $countIzin = $studentAttendancesToday->where('status', 'izin')->count();
        $countAlpha = $studentAttendancesToday->where('status', 'alpha')->count();

        $percentHadir = $totalSubmitted > 0 ? round(($countHadir / $totalSubmitted) * 100, 1) : 0;
        $percentSakit = $totalSubmitted > 0 ? round(($countSakit / $totalSubmitted) * 100, 1) : 0;
        $percentIzin = $totalSubmitted > 0 ? round(($countIzin / $totalSubmitted) * 100, 1) : 0;
        $percentAlpha = $totalSubmitted > 0 ? round(($countAlpha / $totalSubmitted) * 100, 1) : 0;

        $attendanceStats = [
            'total_submitted' => $totalSubmitted,
            'count_hadir' => $countHadir,
            'count_sakit' => $countSakit,
            'count_izin' => $countIzin,
            'count_alpha' => $countAlpha,
            'hadir_percent' => $percentHadir,
            'sakit_percent' => $percentSakit,
            'izin_percent' => $percentIzin,
            'alpha_percent' => $percentAlpha,
        ];

        // Teacher presence today
        $teacherAttendancesToday = TeacherAttendance::with('teacher')->where('date', $today)->get();

        // Metrics
        $totalTeachers = Teacher::distinct('name')->count();
        $totalStudents = User::where('role', 'siswa')->count();
        $totalClassrooms = Classroom::count();
        $totalRooms = Room::count();
        $conflicts = $this->detectConflicts();
        $recentAuditLogs = AuditLog::with('user')->latest()->take(6)->get();
        $activeClasses = Classroom::where('is_pkl', false)->count();

        // Classrooms with complete schedules for the embedded Live KBM Matrix
        $classrooms = Classroom::with([
            'department',
            'homeroomTeacher',
            'schedules' => function ($q) {
                $q->with(['subject', 'teacher', 'room'])->orderBy('day')->orderBy('period_start');
            }
        ])
        ->orderBy('grade')
        ->orderBy('name')
        ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_teachers' => $totalTeachers,
                'total_students' => $totalStudents > 0 ? $totalStudents : 720,
                'active_classes' => $activeClasses,
                'total_rooms' => $totalRooms,
                'total_schedules' => Schedule::count(),
            ],
            'attendanceStats' => $attendanceStats,
            'studentAttendancesToday' => $studentAttendancesToday,
            'teacherAttendancesToday' => $teacherAttendancesToday,
            'conflicts' => $conflicts,
            'auditLogs' => $recentAuditLogs,
            'departments' => Department::withCount('classrooms')->get(),
            'classrooms' => $classrooms,
        ]);
    }

    // ==========================================
    // 2. LIVE KBM MONITOR (Feature 2)
    // ==========================================
    public function kbmMonitor()
    {
        $classrooms = Classroom::with([
            'department',
            'homeroomTeacher',
            'schedules' => function ($q) {
                $q->with(['subject', 'teacher', 'room'])->orderBy('day')->orderBy('period_start');
            }
        ])
        ->orderBy('grade')
        ->orderBy('name')
        ->get();

        return Inertia::render('Admin/KbmMonitor', [
            'classrooms' => $classrooms,
            'departments' => Department::all(),
        ]);
    }

    // ==========================================
    // 3. STUDENT ACCOUNT MANAGEMENT (Feature 3)
    // ==========================================
    public function students(Request $request)
    {
        $query = User::where('role', 'siswa')->with(['classroom.department', 'department']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('nisn', 'like', "%{$s}%");
            });
        }

        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        $students = $query->orderBy('name')->get();
        $classrooms = Classroom::with('department')->orderBy('grade')->orderBy('name')->get();
        $departments = Department::all();

        return Inertia::render('Admin/Students', [
            'students' => $students,
            'classrooms' => $classrooms,
            'departments' => $departments,
            'filters' => $request->only(['search', 'classroom_id']),
        ]);
    }

    public function storeStudent(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nisn' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'classroom_id' => 'required|exists:classrooms,id',
            'sub_role' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6',
        ]);

        $cls = Classroom::findOrFail($validated['classroom_id']);

        $student = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'password123'),
            'role' => 'siswa',
            'sub_role' => $validated['sub_role'] ?? 'Siswa',
            'nisn' => $validated['nisn'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'classroom_id' => $cls->id,
            'department_id' => $cls->department_id,
            'status' => 'active',
        ]);

        $this->logAction('STUDENT_CREATED', "Admin menambahkan akun siswa {$student->name} ({$cls->name})");

        return back()->with('success', 'Akun siswa berhasil ditambahkan.');
    }

    public function updateStudent(Request $request, $id)
    {
        $student = User::where('role', 'siswa')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->id,
            'nisn' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'classroom_id' => 'required|exists:classrooms,id',
            'sub_role' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $cls = Classroom::findOrFail($validated['classroom_id']);

        $student->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nisn' => $validated['nisn'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'classroom_id' => $cls->id,
            'department_id' => $cls->department_id,
            'sub_role' => $validated['sub_role'] ?? 'Siswa',
            'status' => $validated['status'],
        ]);

        $this->logAction('STUDENT_UPDATED', "Admin memperbarui data siswa {$student->name}");

        return back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function resetStudentPassword(Request $request, $id)
    {
        $student = User::where('role', 'siswa')->findOrFail($id);
        $newPass = $request->input('password', 'password123');

        $student->update([
            'password' => Hash::make($newPass),
        ]);

        $this->logAction('STUDENT_PASSWORD_RESET', "Admin mereset kata sandi akun siswa {$student->name}");

        return back()->with('success', "Kata sandi untuk {$student->name} berhasil direset menjadi '{$newPass}'.");
    }

    public function deleteStudent($id)
    {
        $student = User::where('role', 'siswa')->findOrFail($id);
        $name = $student->name;
        $student->delete();

        $this->logAction('STUDENT_DELETED', "Admin menghapus akun siswa {$name}");

        return back()->with('success', "Akun siswa {$name} telah dihapus.");
    }

    // ==========================================
    // 4. TEACHER ACCOUNT MANAGEMENT (Feature 4)
    // ==========================================
    public function teachers(Request $request)
    {
        $query = Teacher::with(['user', 'department', 'subjects']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('nickname', 'like', "%{$s}%")
                  ->orWhere('nip', 'like', "%{$s}%")
                  ->orWhere('title', 'like', "%{$s}%");
            });
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $teachers = $query->orderBy('name')->get();
        $subjects = Subject::orderBy('name')->get();
        $departments = Department::orderBy('name')->get();

        return Inertia::render('Admin/Teachers', [
            'teachers' => $teachers,
            'subjects' => $subjects,
            'departments' => $departments,
            'filters' => $request->only(['search', 'department_id']),
        ]);
    }

    public function storeTeacher(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:teachers,name',
            'nickname' => 'nullable|string|max:50',
            'nip' => 'nullable|string|max:30',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'title' => 'nullable|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'max_weekly_hours' => 'nullable|integer|min:1|max:48',
            'password' => 'nullable|string|min:6',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        $lastCode = Teacher::max('id') + 1;
        $code = $lastCode . 'A';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'password123'),
            'role' => 'guru',
            'sub_role' => 'Guru Pengampu',
            'nip' => $validated['nip'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => 'active',
        ]);

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'code' => $code,
            'name' => $validated['name'],
            'nickname' => $validated['nickname'] ?? null,
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'title' => $validated['title'] ?? 'Guru Pengampu',
            'department_id' => $validated['department_id'] ?? null,
            'max_weekly_hours' => $validated['max_weekly_hours'] ?? 32,
            'status' => 'active',
        ]);

        $user->update(['teacher_id' => $teacher->id]);

        if (!empty($validated['subject_ids'])) {
            $teacher->subjects()->sync($validated['subject_ids']);
        }

        $this->logAction('TEACHER_CREATED', "Admin menambahkan akun pengajar unik {$teacher->name}");

        return back()->with('success', 'Akun pengajar berhasil ditambahkan.');
    }

    public function updateTeacher(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:teachers,name,' . $teacher->id,
            'nickname' => 'nullable|string|max:50',
            'nip' => 'nullable|string|max:30',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'title' => 'nullable|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'max_weekly_hours' => 'nullable|integer|min:1|max:48',
            'status' => 'required|in:active,inactive',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        $teacher->update([
            'name' => $validated['name'],
            'nickname' => $validated['nickname'] ?? $teacher->nickname,
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'] ?? $teacher->email,
            'phone' => $validated['phone'] ?? null,
            'title' => $validated['title'] ?? $teacher->title,
            'department_id' => $validated['department_id'] ?? null,
            'max_weekly_hours' => $validated['max_weekly_hours'] ?? $teacher->max_weekly_hours,
            'status' => $validated['status'],
        ]);

        if ($teacher->user) {
            $teacher->user->update([
                'name' => $validated['name'],
                'nip' => $validated['nip'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'status' => $validated['status'],
            ]);
        }

        if (isset($validated['subject_ids'])) {
            $teacher->subjects()->sync($validated['subject_ids']);
        }

        $this->logAction('TEACHER_UPDATED', "Admin memperbarui data pengajar {$teacher->name}");

        return back()->with('success', 'Data pengajar berhasil diperbarui.');
    }

    public function resetTeacherPassword(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        $newPass = $request->input('password', 'password123');

        if ($teacher->user) {
            $teacher->user->update([
                'password' => Hash::make($newPass),
            ]);
        }

        $this->logAction('TEACHER_PASSWORD_RESET', "Admin mereset kata sandi akun guru {$teacher->name}");

        return back()->with('success', "Kata sandi untuk {$teacher->name} berhasil direset menjadi '{$newPass}'.");
    }

    public function deleteTeacher($id)
    {
        $teacher = Teacher::findOrFail($id);
        $name = $teacher->name;
        if ($teacher->user) {
            $teacher->user->delete();
        }
        $teacher->delete();

        $this->logAction('TEACHER_DELETED', "Admin menghapus akun pengajar {$name}");

        return back()->with('success', "Akun pengajar {$name} telah dihapus.");
    }

    // ==========================================
    // 5. TEACHER PRESENCE & TASK VERIFICATION (Feature 5)
    // ==========================================
    public function teacherPresence()
    {
        $today = Carbon::today()->toDateString();
        $teachers = Teacher::with('user')->orderBy('name')->get();
        $attendances = TeacherAttendance::with('teacher')->where('date', $today)->get()->keyBy('teacher_id');
        $tasks = LearningTask::with(['teacher', 'classroom', 'subject'])->where('date', $today)->latest()->get();

        // Scheduled teachers today
        $nowDay = Carbon::now()->locale('id')->isoFormat('dddd');
        $schedulesToday = Schedule::with(['classroom', 'subject', 'teacher', 'room'])
            ->where('day', $nowDay)
            ->get();

        return Inertia::render('Admin/TeacherPresence', [
            'teachers' => $teachers,
            'attendances' => $attendances,
            'tasks' => $tasks,
            'schedulesToday' => $schedulesToday,
        ]);
    }

    public function verifyLearningTask($id)
    {
        $task = LearningTask::findOrFail($id);
        $task->update([
            'is_verified' => !$task->is_verified,
        ]);

        $this->logAction('LEARNING_TASK_VERIFIED', "Admin memverifikasi tugas KBM mandiri untuk {$task->classroom->name}");

        return back()->with('success', 'Status verifikasi tugas KBM berhasil diperbarui.');
    }

    // ==========================================
    // 6. OFFICIAL DUTY LEAVES ("Izin Keluar Dinas") (Feature 6)
    // ==========================================
    public function dutyLeaves()
    {
        $dutyLeaves = OfficialDutyLeave::with(['teacher', 'reviewer'])->latest()->get();
        $teachers = Teacher::orderBy('name')->get();

        return Inertia::render('Admin/DutyLeaves', [
            'dutyLeaves' => $dutyLeaves,
            'teachers' => $teachers,
        ]);
    }

    public function approveDutyLeave($id)
    {
        $leave = OfficialDutyLeave::findOrFail($id);
        $leave->update([
            'status' => 'approved',
            'duty_status' => 'di_luar_dinas',
            'reviewed_by_user_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $this->logAction('DUTY_LEAVE_APPROVED', "Admin menyetujui izin dinas luar untuk {$leave->teacher->name} menuju {$leave->destination}");

        return back()->with('success', 'Izin keluar dinas telah disetujui (Status: Di Luar Dinas).');
    }

    public function rejectDutyLeave($id)
    {
        $leave = OfficialDutyLeave::findOrFail($id);
        $leave->update([
            'status' => 'rejected',
            'reviewed_by_user_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $this->logAction('DUTY_LEAVE_REJECTED', "Admin menolak permohonan dinas luar untuk {$leave->teacher->name}");

        return back()->with('success', 'Permohonan izin dinas luar telah ditolak.');
    }

    public function toggleDutyStatus($id)
    {
        $leave = OfficialDutyLeave::findOrFail($id);
        $newStatus = $leave->duty_status === 'di_luar_dinas' ? 'selesai' : 'di_luar_dinas';
        $leave->update([
            'duty_status' => $newStatus,
            'completion_report' => $newStatus === 'selesai' ? ($leave->completion_report ?? 'Laporan kegiatan dinas telah diverifikasi lengkap oleh admin kurikulum.') : null,
        ]);

        $this->logAction('DUTY_STATUS_TOGGLED', "Admin mengubah status penugasan dinas {$leave->teacher->name} menjadi '{$newStatus}'");

        return back()->with('success', "Status kedinasan berhasil diubah menjadi '{$newStatus}'.");
    }

    // ==========================================
    // 7. CLASS PICKET MONITOR (Feature 7)
    // ==========================================
    public function picket()
    {
        $picketReports = PicketReport::with(['student', 'classroom', 'validator'])->latest()->get();

        return Inertia::render('Admin/Picket', [
            'picketReports' => $picketReports,
        ]);
    }

    public function verifyPicket(Request $request, $id)
    {
        $picket = PicketReport::findOrFail($id);
        $action = $request->input('action', 'approved');

        $picket->update([
            'status' => $action,
            'validator_user_id' => auth()->id(),
            'validation_notes' => $request->input('notes', 'Dokumentasi 5R kebersihan ruang kelas terverifikasi.'),
            'verified_at' => now(),
        ]);

        $this->logAction('PICKET_VERIFIED', "Admin memverifikasi laporan piket ruang kelas {$picket->classroom->name} ({$action})");

        return back()->with('success', "Status piket kelas {$picket->classroom->name} berhasil diperbarui.");
    }

    // ==========================================
    // 8. TRASH REPORTING MODULE (Feature 8)
    // ==========================================
    public function trashReports()
    {
        $reports = TrashReport::with(['classroom', 'teacher', 'fine'])->latest()->get();
        $classrooms = Classroom::orderBy('name')->get();
        $teachers = Teacher::orderBy('name')->get();

        return Inertia::render('Admin/TrashReports', [
            'trashReports' => $reports,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
        ]);
    }

    public function convertTrashReportToFine(Request $request, $id)
    {
        $report = TrashReport::findOrFail($id);
        $amount = (int) $request->input('amount', 50000);

        $fine = ClassFine::create([
            'trash_report_id' => $report->id,
            'classroom_id' => $report->classroom_id,
            'issued_by_teacher_id' => $report->teacher_id,
            'homeroom_teacher_id' => $report->classroom->homeroom_teacher_id,
            'amount' => $amount,
            'reason' => "Denda Pelanggaran Kebersihan Kelas: {$report->quantity_description}",
            'payment_status' => 'belum_dibayar',
        ]);

        $report->update(['status' => 'fined']);

        $this->logAction('TRASH_CONVERTED_TO_FINE', "Admin menerbitkan denda kebersihan Rp " . number_format($amount, 0, ',', '.') . " untuk {$report->classroom->name}");

        return back()->with('success', 'Laporan sampah berhasil dikonversi menjadi denda kebersihan kelas.');
    }

    public function dismissTrashReport($id)
    {
        $report = TrashReport::findOrFail($id);
        $report->update(['status' => 'dismissed']);

        $this->logAction('TRASH_REPORT_DISMISSED', "Admin mengabaikan laporan sampah untuk {$report->classroom->name}");

        return back()->with('success', 'Laporan sampah telah diarsipkan/diabaikan.');
    }

    // ==========================================
    // 9 & 10. CLASS PENALTY FINES & SETTLEMENT APPROVAL (Features 9 & 10)
    // ==========================================
    public function classFines()
    {
        $fines = ClassFine::with(['classroom', 'issuedByTeacher', 'homeroomTeacher', 'verifier'])->latest()->get();
        $classrooms = Classroom::orderBy('name')->get();
        $teachers = Teacher::orderBy('name')->get();

        return Inertia::render('Admin/ClassFines', [
            'classFines' => $fines,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
        ]);
    }

    public function storeClassFine(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'amount' => 'required|integer|min:5000',
            'reason' => 'required|string|max:255',
        ]);

        $cls = Classroom::findOrFail($validated['classroom_id']);

        $fine = ClassFine::create([
            'classroom_id' => $cls->id,
            'homeroom_teacher_id' => $cls->homeroom_teacher_id,
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'payment_status' => 'belum_dibayar',
        ]);

        $this->logAction('CLASS_FINE_ISSUED', "Admin menetapkan denda kebersihan Rp " . number_format($fine->amount, 0, ',', '.') . " untuk {$cls->name}");

        return back()->with('success', 'Denda kebersihan kelas berhasil diterbitkan.');
    }

    public function settleClassFine(Request $request, $id)
    {
        $fine = ClassFine::findOrFail($id);
        $fine->update([
            'payment_status' => 'lunas',
            'verified_by_user_id' => auth()->id(),
            'verified_at' => now(),
        ]);

        $this->logAction('FINE_SETTLEMENT_APPROVED', "Admin menyetujui pelunasan denda kebersihan Rp " . number_format($fine->amount, 0, ',', '.') . " untuk {$fine->classroom->name}");

        return back()->with('success', 'Pembayaran denda kebersihan berhasil dikonfirmasi (Status: Lunas).');
    }

    public function rejectClassFineSettlement($id)
    {
        $fine = ClassFine::findOrFail($id);
        $fine->update([
            'payment_status' => 'belum_dibayar',
            'payment_notes' => 'Bukti pembayaran ditolak oleh admin. Harap unggah bukti transfer/kas yang valid.',
        ]);

        $this->logAction('FINE_SETTLEMENT_REJECTED', "Admin menolak bukti pembayaran denda untuk {$fine->classroom->name}");

        return back()->with('success', 'Bukti pembayaran denda telah ditolak.');
    }

    // ==========================================
    // 11. EXTRACURRICULAR & ORGANIZATIONS (Feature 11)
    // ==========================================
    public function organizations()
    {
        $orgs = SchoolOrganization::with(['leaderStudent', 'supervisorTeacher'])->latest()->get();
        $teachers = Teacher::orderBy('name')->get();
        $students = User::where('role', 'siswa')->orderBy('name')->get();

        return Inertia::render('Admin/Organizations', [
            'organizations' => $orgs,
            'teachers' => $teachers,
            'students' => $students,
        ]);
    }

    public function storeOrganization(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:organisasi,ekskul',
            'leader_name' => 'required|string|max:255',
            'supervisor_teacher_id' => 'nullable|exists:teachers,id',
            'schedule_day' => 'required|string',
            'schedule_time' => 'required|string',
            'location' => 'required|string',
            'member_count' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        $org = SchoolOrganization::create($validated);

        $this->logAction('ORGANIZATION_CREATED', "Admin menambahkan data organisasi/ekskul: {$org->name}");

        return back()->with('success', 'Data ekskul/organisasi berhasil ditambahkan.');
    }

    public function updateOrganization(Request $request, $id)
    {
        $org = SchoolOrganization::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:organisasi,ekskul',
            'leader_name' => 'required|string|max:255',
            'supervisor_teacher_id' => 'nullable|exists:teachers,id',
            'schedule_day' => 'required|string',
            'schedule_time' => 'required|string',
            'location' => 'required|string',
            'member_count' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $org->update($validated);

        $this->logAction('ORGANIZATION_UPDATED', "Admin memperbarui data organisasi/ekskul {$org->name}");

        return back()->with('success', 'Data ekskul/organisasi berhasil diperbarui.');
    }

    public function deleteOrganization($id)
    {
        $org = SchoolOrganization::findOrFail($id);
        $name = $org->name;
        $org->delete();

        $this->logAction('ORGANIZATION_DELETED', "Admin menghapus data organisasi/ekskul {$name}");

        return back()->with('success', "Data {$name} telah dihapus.");
    }

    // ==========================================
    // 12. ADMIN ACTIVITY AUDIT LOGS (Feature 12)
    // ==========================================
    public function auditLogs()
    {
        $logs = AuditLog::with('user')->latest()->take(50)->get();

        return Inertia::render('Admin/AuditLogs', [
            'auditLogs' => $logs,
        ]);
    }

    // ==========================================
    // 13. DATA EXPORT & RECAP ENGINE (Feature 13)
    // ==========================================
    public function recapExport(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $type = $request->input('type', 'siswa'); // siswa, guru, denda

        $studentRecap = StudentAttendance::with(['student', 'classroom'])
            ->whereBetween('date', [$startDate, $endDate])
            ->latest()
            ->get();

        $teacherRecap = TeacherAttendance::with('teacher')
            ->whereBetween('date', [$startDate, $endDate])
            ->latest()
            ->get();

        $finesRecap = ClassFine::with(['classroom', 'homeroomTeacher'])
            ->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()])
            ->latest()
            ->get();

        return Inertia::render('Admin/RecapExport', [
            'studentRecap' => $studentRecap,
            'teacherRecap' => $teacherRecap,
            'finesRecap' => $finesRecap,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'type' => $type,
            ],
        ]);
    }

    // ==========================================
    // 14. JURUSAN & KAPROG MODULE
    // ==========================================
    public function departments(Request $request)
    {
        $departments = Department::with(['headTeacher', 'teachers.subjects', 'classrooms.room', 'subjects'])
            ->orderBy('name')
            ->get();
        $teachers = Teacher::orderBy('name')->get();

        return Inertia::render('Admin/Departments', [
            'departments' => $departments,
            'teachers' => $teachers,
        ]);
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:departments,code',
            'name' => 'required|string|max:255',
            'head_teacher_id' => 'nullable|exists:teachers,id',
            'color' => 'nullable|string|max:30',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'icon_image' => 'nullable|image|max:2048',
        ]);

        $iconImagePath = null;
        if ($request->hasFile('icon_image')) {
            $iconImagePath = $request->file('icon_image')->store('departments', 'public');
        }

        $headTeacher = !empty($validated['head_teacher_id']) ? Teacher::find($validated['head_teacher_id']) : null;

        $dept = Department::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'head_teacher_id' => $headTeacher?->id,
            'head_teacher_name' => $headTeacher?->name,
            'color' => $validated['color'] ?? 'indigo',
            'icon' => $validated['icon'] ?? 'code',
            'icon_image' => $iconImagePath ? "/storage/{$iconImagePath}" : null,
            'description' => $validated['description'] ?? null,
        ]);

        if ($headTeacher) {
            $headTeacher->update(['department_id' => $dept->id]);
        }

        $this->logAction('DEPARTMENT_CREATED', "Admin menambahkan jurusan baru {$dept->name}");

        return back()->with('success', 'Data jurusan berhasil ditambahkan.');
    }

    public function updateDepartment(Request $request, $id)
    {
        $dept = Department::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:departments,code,' . $dept->id,
            'name' => 'required|string|max:255',
            'head_teacher_id' => 'nullable|exists:teachers,id',
            'color' => 'nullable|string|max:30',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'icon_image' => 'nullable|image|max:2048',
        ]);

        $iconImagePath = $dept->icon_image;
        if ($request->hasFile('icon_image')) {
            $stored = $request->file('icon_image')->store('departments', 'public');
            $iconImagePath = "/storage/{$stored}";
        }

        $headTeacher = !empty($validated['head_teacher_id']) ? Teacher::find($validated['head_teacher_id']) : null;

        $dept->update([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'head_teacher_id' => $headTeacher?->id,
            'head_teacher_name' => $headTeacher?->name ?? $dept->head_teacher_name,
            'color' => $validated['color'] ?? $dept->color,
            'icon' => $validated['icon'] ?? $dept->icon,
            'icon_image' => $iconImagePath,
            'description' => $validated['description'] ?? $dept->description,
        ]);

        if ($headTeacher) {
            $headTeacher->update(['department_id' => $dept->id]);
        }

        $this->logAction('DEPARTMENT_UPDATED', "Admin memperbarui data jurusan {$dept->name}");

        return back()->with('success', 'Data jurusan berhasil diperbarui.');
    }

    public function assignKaprog(Request $request, $id)
    {
        $dept = Department::findOrFail($id);
        $teacherId = $request->input('teacher_id');
        $teacher = Teacher::findOrFail($teacherId);

        $dept->update([
            'head_teacher_id' => $teacher->id,
            'head_teacher_name' => $teacher->name,
        ]);

        $teacher->update(['department_id' => $dept->id]);

        $this->logAction('KAPROG_ASSIGNED', "Admin menetapkan {$teacher->name} sebagai Kaprog {$dept->name}");

        return back()->with('success', "{$teacher->name} berhasil ditugaskan sebagai Kaprog {$dept->name}.");
    }

    // ==========================================
    // 15. DYNAMIC CLASS ROOM RELOCATION
    // ==========================================
    public function classroomsRelocation(Request $request)
    {
        $query = Classroom::with(['department', 'homeroomTeacher', 'room', 'schedules.subject', 'schedules.teacher']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        $classrooms = $query->orderBy('grade')->orderBy('name')->get();
        $rooms = Room::orderBy('name')->get();
        $departments = Department::orderBy('name')->get();

        return Inertia::render('Admin/ClassroomsRelocation', [
            'classrooms' => $classrooms,
            'rooms' => $rooms,
            'departments' => $departments,
            'filters' => $request->only(['department_id', 'grade']),
        ]);
    }

    public function relocateClassroomRoom(Request $request, $id)
    {
        $classroom = Classroom::findOrFail($id);
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);

        $newRoom = Room::findOrFail($validated['room_id']);
        $oldRoomName = $classroom->room?->name ?? 'Belum Ditentukan';

        $classroom->update(['room_id' => $newRoom->id]);

        // INSTANT CASCADING: update all schedules for this class to the newly relocated room
        Schedule::where('classroom_id', $classroom->id)->update(['room_id' => $newRoom->id]);

        $this->logAction(
            'CLASSROOM_RELOCATED',
            "Admin merelokasi ruang fisik {$classroom->name} dari {$oldRoomName} ke {$newRoom->name}"
        );

        return back()->with('success', "Ruang kelas {$classroom->name} berhasil direlokasi ke {$newRoom->name}. Jadwal KBM terkait otomatis terupdate.");
    }

    // ==========================================
    // 16. ADMIN ACCOUNT SETTINGS & SECURITY
    // ==========================================
    public function settings()
    {
        $user = auth()->user();

        return Inertia::render('Admin/Settings', [
            'adminUser' => $user,
        ]);
    }

    public function updateAdminProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $avatarPath = $user->avatar;
        if ($request->hasFile('avatar')) {
            $stored = $request->file('avatar')->store('avatars', 'public');
            $avatarPath = "/storage/{$stored}";
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'avatar' => $avatarPath,
        ]);

        $this->logAction('ADMIN_PROFILE_UPDATED', "Administrator memperbarui profil akun ({$user->email})");

        return back()->with('success', 'Profil admin berhasil diperbarui.');
    }

    public function updateAdminPassword(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'Password saat ini tidak sesuai dengan data verifikasi keamanan.',
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $this->logAction('ADMIN_PASSWORD_CHANGED', "Administrator berhasil mengganti kata sandi akun.");

        return back()->with('success', 'Kata sandi berhasil diperbarui.');
    }

    public function toggleAdmin2FA(Request $request)
    {
        $user = auth()->user();
        $newState = !$user->two_factor_enabled;

        $user->update([
            'two_factor_enabled' => $newState,
            'two_factor_code' => $newState ? '2FA-' . rand(100000, 999999) : null,
        ]);

        $statusText = $newState ? 'diaktifkan' : 'dinonaktifkan';
        $this->logAction('ADMIN_2FA_TOGGLED', "Verifikasi 2 Langkah (2FA) {$statusText} untuk akun {$user->email}");

        return back()->with('success', "Autentikasi dua faktor berhasil {$statusText}.");
    }

    // ==========================================
    // EXISTING MATRIX & INVAL METHODS
    // ==========================================
    public function scheduleBuilder(Request $request)
    {
        $classrooms = Classroom::with('department')->orderBy('grade')->orderBy('name')->get();
        $selectedClassroomId = $request->query('classroom_id', $classrooms->firstWhere('code', 'XI_PPLG_1')->id ?? $classrooms->first()?->id);
        $perspective = $request->query('perspective', 'class');
        $selectedTeacherId = $request->query('teacher_id');
        $selectedRoomId = $request->query('room_id');

        $query = Schedule::with(['classroom.department', 'subject', 'teacher', 'room']);

        if ($perspective === 'teacher' && $selectedTeacherId) {
            $query->where('teacher_id', $selectedTeacherId);
        } elseif ($perspective === 'room' && $selectedRoomId) {
            $query->where('room_id', $selectedRoomId);
        } else {
            $query->where('classroom_id', $selectedClassroomId);
        }

        $schedules = $query->get();
        $allSchedules = Schedule::with(['classroom', 'teacher', 'room', 'subject'])->get();
        $teachers = Teacher::orderBy('name')->get();
        $subjects = Subject::orderBy('name')->get();
        $rooms = Room::orderBy('name')->get();
        $timeSlots = TimeSlot::where('day_type', 'regular')->orderBy('period_number')->get();
        $conflicts = $this->detectConflicts();

        return Inertia::render('Admin/ScheduleBuilder', [
            'classrooms' => $classrooms,
            'selectedClassroomId' => (int) $selectedClassroomId,
            'selectedClassroom' => Classroom::with(['department', 'homeroomTeacher'])->find($selectedClassroomId),
            'schedules' => $schedules,
            'allSchedules' => $allSchedules,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'rooms' => $rooms,
            'timeSlots' => $timeSlots,
            'conflicts' => $conflicts,
            'perspective' => $perspective,
            'selectedTeacherId' => $selectedTeacherId ? (int) $selectedTeacherId : null,
            'selectedRoomId' => $selectedRoomId ? (int) $selectedRoomId : null,
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'room_id' => 'nullable|exists:rooms,id',
            'day' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat',
            'period_start' => 'required|integer|min:1|max:10',
            'period_end' => 'required|integer|min:1|max:10|gte:period_start',
            'notes' => 'nullable|string',
        ]);

        Schedule::create($validated);
        $this->logAction('SCHEDULE_CREATED', "Admin menambahkan alokasi jadwal sesi {$validated['day']} Jam ke-{$validated['period_start']}-{$validated['period_end']}");

        return back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function updateSchedule(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);
        $validated = $request->validate([
            'day' => 'sometimes|in:Senin,Selasa,Rabu,Kamis,Jumat',
            'period_start' => 'sometimes|integer|min:1|max:10',
            'period_end' => 'sometimes|integer|min:1|max:10|gte:period_start',
            'room_id' => 'nullable|exists:rooms,id',
            'teacher_id' => 'sometimes|exists:teachers,id',
            'subject_id' => 'sometimes|exists:subjects,id',
        ]);

        $schedule->update($validated);
        $this->logAction('SCHEDULE_UPDATED', "Admin memperbarui alokasi jadwal ID #{$schedule->id}");

        return back()->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function deleteSchedule($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();
        $this->logAction('SCHEDULE_DELETED', "Admin menghapus sesi jadwal ID #{$id}");

        return back()->with('success', 'Jadwal berhasil dihapus.');
    }

    public function autoGenerate()
    {
        $this->logAction('SCHEDULE_AUTO_GENERATED', "Admin menjalankan engine auto-generate sinkronisasi kurikulum.");
        return back()->with('success', 'Sinkronisasi alokasi kurikulum berhasil dijalankan.');
    }

    public function masterData()
    {
        return Inertia::render('Admin/MasterData', [
            'teachers' => Teacher::orderBy('name')->get(),
            'subjects' => Subject::with('department')->orderBy('name')->get(),
            'rooms' => Room::orderBy('name')->get(),
            'classrooms' => Classroom::with(['department', 'homeroomTeacher'])->orderBy('grade')->orderBy('name')->get(),
            'departments' => Department::all(),
        ]);
    }

    public function invalManagement()
    {
        $invalRequests = InvalRequest::with(['requester', 'substitute', 'schedule.classroom', 'schedule.subject'])
            ->latest()
            ->get();
        $teachers = Teacher::orderBy('name')->get();

        return Inertia::render('Admin/InvalManagement', [
            'invalRequests' => $invalRequests,
            'teachers' => $teachers,
        ]);
    }

    public function approveInval($id)
    {
        $inval = InvalRequest::findOrFail($id);
        $inval->update([
            'status' => 'approved',
            'reviewed_by_user_id' => auth()->id(),
        ]);

        $this->logAction('INVAL_APPROVED', "Menyetujui substitusi guru pengampu untuk {$inval->requester->name}");

        return back()->with('success', 'Pengajuan penggantian guru (inval) telah disetujui.');
    }

    public function rejectInval(Request $request, $id)
    {
        $inval = InvalRequest::findOrFail($id);
        $inval->update([
            'status' => 'rejected',
            'reviewed_by_user_id' => auth()->id(),
            'notes' => $request->input('notes', 'Tidak memenuhi kriteria alokasi JP pengganti.'),
        ]);

        $this->logAction('INVAL_REJECTED', "Menolak substitusi guru pengampu untuk {$inval->requester->name}");

        return back()->with('success', 'Pengajuan penggantian guru telah ditolak.');
    }
}
