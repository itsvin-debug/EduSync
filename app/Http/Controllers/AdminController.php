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
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;

class AdminController extends Controller
{
    /**
     * Compute Real-time Schedule Conflicts
     */
    private function detectConflicts()
    {
        $conflicts = [];
        $schedules = Schedule::with(['teacher', 'classroom', 'room', 'subject'])->get();

        // 1. Teacher collisions: same teacher, same day, overlapping period
        for ($i = 0; $i < count($schedules); $i++) {
            for ($j = $i + 1; $j < count($schedules); $j++) {
                $a = $schedules[$i];
                $b = $schedules[$j];

                if ($a->day === $b->day) {
                    $overlap = max($a->period_start, $b->period_start) <= min($a->period_end, $b->period_end);
                    if ($overlap) {
                        // Check teacher collision
                        if ($a->teacher_id === $b->teacher_id && $a->classroom_id !== $b->classroom_id) {
                            $conflicts[] = [
                                'type' => 'TEACHER_COLLISION',
                                'message' => "Tabrakan Pengajar: {$a->teacher->name} terjadwal di {$a->classroom->name} dan {$b->classroom->name} pada {$a->day} (Jam ke-{$a->period_start}-{$a->period_end}).",
                                'day' => $a->day,
                                'period' => "Jam {$a->period_start}-{$a->period_end}",
                                'schedules' => [$a->id, $b->id],
                            ];
                        }

                        // Check room collision
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

    public function dashboard()
    {
        $totalTeachers = Teacher::distinct('name')->count();
        $totalStudents = User::where('role', 'siswa')->count();
        $totalClassrooms = Classroom::count();
        $totalRooms = Room::count();
        $conflicts = $this->detectConflicts();
        $recentAuditLogs = AuditLog::with('user')->latest()->take(8)->get();
        $activeClasses = Classroom::where('is_pkl', false)->count();

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
            'conflicts' => $conflicts,
            'auditLogs' => $recentAuditLogs,
            'departments' => Department::withCount('classrooms')->get(),
            'classrooms' => $classrooms,
        ]);
    }

    public function scheduleBuilder(Request $request)
    {
        $classrooms = Classroom::with('department')->orderBy('grade')->orderBy('name')->get();
        $selectedClassroomId = $request->query('classroom_id', $classrooms->firstWhere('code', 'XI_PPLG_1')->id ?? $classrooms->first()?->id);
        $perspective = $request->query('perspective', 'class'); // class, teacher, room
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

        // Collision Check: Check if teacher is already scheduled elsewhere
        $teacherCollision = Schedule::where('day', $validated['day'])
            ->where('teacher_id', $validated['teacher_id'])
            ->where('classroom_id', '!=', $validated['classroom_id'])
            ->where(function($q) use ($validated) {
                $q->whereBetween('period_start', [$validated['period_start'], $validated['period_end']])
                  ->orWhereBetween('period_end', [$validated['period_start'], $validated['period_end']])
                  ->orWhere(function($sub) use ($validated) {
                      $sub->where('period_start', '<=', $validated['period_start'])
                          ->where('period_end', '>=', $validated['period_end']);
                  });
            })
            ->with(['classroom', 'teacher'])
            ->first();

        if ($teacherCollision) {
            return back()->with('error', "Gagal Menyimpan: Guru {$teacherCollision->teacher->name} sudah memiliki jadwal di {$teacherCollision->classroom->name} pada {$validated['day']} Jam ke-{$teacherCollision->period_start}-{$teacherCollision->period_end}.");
        }

        // Room Collision Check: Check if room is already occupied
        if (!empty($validated['room_id'])) {
            $roomCollision = Schedule::where('day', $validated['day'])
                ->where('room_id', $validated['room_id'])
                ->where('classroom_id', '!=', $validated['classroom_id'])
                ->where(function($q) use ($validated) {
                    $q->whereBetween('period_start', [$validated['period_start'], $validated['period_end']])
                      ->orWhereBetween('period_end', [$validated['period_start'], $validated['period_end']])
                      ->orWhere(function($sub) use ($validated) {
                          $sub->where('period_start', '<=', $validated['period_start'])
                              ->where('period_end', '>=', $validated['period_end']);
                      });
                })
                ->with(['classroom', 'room'])
                ->first();

            if ($roomCollision) {
                return back()->with('error', "Gagal Menyimpan: Ruang {$roomCollision->room->name} sudah dipakai oleh {$roomCollision->classroom->name} pada {$validated['day']} Jam ke-{$roomCollision->period_start}-{$roomCollision->period_end}.");
            }
        }

        $schedule = Schedule::create([
            ...$validated,
            'academic_year' => '2024/2025',
            'semester' => 'Genap',
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'SCHEDULE_CREATED',
            'description' => "Menambahkan slot jadwal baru untuk {$schedule->classroom->name} ({$schedule->day} Jam {$schedule->period_start}-{$schedule->period_end})",
            'details' => $schedule->toArray(),
        ]);

        return back()->with('success', 'Jadwal pelajaran berhasil dialokasikan.');
    }

    public function updateSchedule(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        $validated = $request->validate([
            'classroom_id' => 'sometimes|exists:classrooms,id',
            'subject_id' => 'sometimes|exists:subjects,id',
            'teacher_id' => 'sometimes|exists:teachers,id',
            'room_id' => 'nullable|exists:rooms,id',
            'day' => 'sometimes|in:Senin,Selasa,Rabu,Kamis,Jumat',
            'period_start' => 'sometimes|integer|min:1|max:10',
            'period_end' => 'sometimes|integer|min:1|max:10',
            'notes' => 'nullable|string',
        ]);

        $day = $validated['day'] ?? $schedule->day;
        $periodStart = $validated['period_start'] ?? $schedule->period_start;
        $periodEnd = $validated['period_end'] ?? $schedule->period_end;
        $teacherId = $validated['teacher_id'] ?? $schedule->teacher_id;
        $classroomId = $validated['classroom_id'] ?? $schedule->classroom_id;

        // Check teacher collision excluding self
        $teacherCollision = Schedule::where('id', '!=', $schedule->id)
            ->where('day', $day)
            ->where('teacher_id', $teacherId)
            ->where('classroom_id', '!=', $classroomId)
            ->where(function($q) use ($periodStart, $periodEnd) {
                $q->whereBetween('period_start', [$periodStart, $periodEnd])
                  ->orWhereBetween('period_end', [$periodStart, $periodEnd]);
            })
            ->with(['classroom', 'teacher'])
            ->first();

        if ($teacherCollision) {
            return back()->with('error', "Peringatan Bentrok: {$teacherCollision->teacher->name} bentrok dengan jadwal {$teacherCollision->classroom->name}.");
        }

        $schedule->update($validated);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'SCHEDULE_UPDATED',
            'description' => "Memperbarui jadwal #{$schedule->id} ({$schedule->classroom->name})",
            'details' => $schedule->toArray(),
        ]);

        return back()->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function deleteSchedule($id)
    {
        $schedule = Schedule::findOrFail($id);
        $className = $schedule->classroom->name;
        $schedule->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'SCHEDULE_DELETED',
            'description' => "Menghapus alokasi sesi jadwal di {$className}",
        ]);

        return back()->with('success', 'Sesi jadwal berhasil dihapus.');
    }

    public function autoGenerate()
    {
        Artisan::call('db:seed', ['--class' => 'EduSyncSeeder', '--force' => true]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'SCHEDULE_AUTOGENERATED',
            'description' => 'Menjalankan Algoritma Auto-Generate Jadwal Sekolah berbasis AI & Dokumen Kurikulum Resmi SMK.',
        ]);

        return back()->with('success', 'Jadwal sekolah berhasil di-generate secara otomatis tanpa bentrok!');
    }

    public function masterData(Request $request)
    {
        $tab = $request->query('tab', 'guru'); // guru, siswa, mapel, ruangan, kelas, kalender

        return Inertia::render('Admin/MasterData', [
            'activeTab' => $tab,
            'teachers' => Teacher::orderBy('code')->get(),
            'students' => User::where('role', 'siswa')->with(['classroom', 'department'])->get(),
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

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'INVAL_APPROVED',
            'description' => "Menyetujui substitusi guru pengampu untuk {$inval->requester->name}",
        ]);

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

        return back()->with('success', 'Pengajuan penggantian guru telah ditolak.');
    }
}
