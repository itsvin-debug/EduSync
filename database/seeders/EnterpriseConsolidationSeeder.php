<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Department;
use App\Models\Classroom;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\User;
use App\Models\InvalRequest;
use App\Models\OfficialDutyLeave;
use App\Models\TeacherAttendance;
use App\Models\LearningTask;
use App\Models\TrashReport;
use App\Models\ClassFine;
use App\Models\SchoolOrganization;
use Illuminate\Support\Facades\DB;

class EnterpriseConsolidationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. DEDUPLICATE TEACHERS (UNIQUE TEACHER ENFORCEMENT)
        $groupedTeachers = Teacher::all()->groupBy('name');

        foreach ($groupedTeachers as $name => $teachers) {
            if ($teachers->count() > 1) {
                // Pick the first teacher as the primary canonical teacher
                $primaryTeacher = $teachers->first();
                $duplicateTeachers = $teachers->slice(1);

                foreach ($duplicateTeachers as $dup) {
                    $dupId = $dup->id;
                    $primaryId = $primaryTeacher->id;

                    // Reassign all foreign keys pointing to duplicate ID
                    Schedule::where('teacher_id', $dupId)->update(['teacher_id' => $primaryId]);
                    Classroom::where('homeroom_teacher_id', $dupId)->update(['homeroom_teacher_id' => $primaryId]);
                    InvalRequest::where('requester_teacher_id', $dupId)->update(['requester_teacher_id' => $primaryId]);
                    InvalRequest::where('substitute_teacher_id', $dupId)->update(['substitute_teacher_id' => $primaryId]);
                    OfficialDutyLeave::where('teacher_id', $dupId)->update(['teacher_id' => $primaryId]);
                    TeacherAttendance::where('teacher_id', $dupId)->update(['teacher_id' => $primaryId]);
                    LearningTask::where('teacher_id', $dupId)->update(['teacher_id' => $primaryId]);
                    TrashReport::where('teacher_id', $dupId)->update(['teacher_id' => $primaryId]);
                    ClassFine::where('issued_by_teacher_id', $dupId)->update(['issued_by_teacher_id' => $primaryId]);
                    ClassFine::where('homeroom_teacher_id', $dupId)->update(['homeroom_teacher_id' => $primaryId]);
                    SchoolOrganization::where('supervisor_teacher_id', $dupId)->update(['supervisor_teacher_id' => $primaryId]);

                    // Remove duplicate teacher's user account if separate
                    if ($dup->user_id && $dup->user_id !== $primaryTeacher->user_id) {
                        User::where('id', $dup->user_id)->delete();
                    }

                    // Delete the duplicate teacher record
                    $dup->delete();
                }
            }
        }

        // 2. GENERATE NICKNAMES & ASSOCIATE DEPARTMENTS
        $departments = Department::all()->keyBy('code');

        $teachers = Teacher::all();
        foreach ($teachers as $t) {
            // Generate clean human Indonesian nickname from name
            $nameParts = explode(' ', $t->name);
            $firstName = $nameParts[0];
            $salutation = 'Bpk/Ibu';

            if (in_array(strtolower($firstName), ['dra.', 'dr.', 'hj.', 'h.', 'ir.', 'drs.'])) {
                $firstName = $nameParts[1] ?? $firstName;
            }

            $isFemale = preg_match('/(dra\.|hj\.|sri|rina|lina|neti|nani|nidia|cynthia|hanna|lily|eri|dewi|fatma|fitri|ayu|nur|siti|retno)/i', $t->name);
            $salutation = $isFemale ? 'Bu' : 'Pak';
            $nickname = "{$salutation} " . rtrim(trim($firstName), ',');

            // Determine primary department based on title or schedule subjects
            $assignedSubjectIds = Schedule::where('teacher_id', $t->id)->pluck('subject_id')->unique();
            $deptId = null;

            if (stripos($t->title, 'PPLG') !== false || stripos($t->title, 'Informatika') !== false) {
                $deptId = $departments['PPLG']->id ?? null;
            } elseif (stripos($t->title, 'ANM') !== false || stripos($t->title, 'Animasi') !== false) {
                $deptId = $departments['ANM']->id ?? null;
            } elseif (stripos($t->title, 'BCF') !== false || stripos($t->title, 'Broadcasting') !== false) {
                $deptId = $departments['BCF']->id ?? null;
            } elseif (stripos($t->title, 'Otomotif') !== false || stripos($t->title, 'TO') !== false) {
                $deptId = $departments['TO']->id ?? null;
            } elseif (stripos($t->title, 'Pengelasan') !== false || stripos($t->title, 'TPFL') !== false) {
                $deptId = $departments['TPFL']->id ?? null;
            }

            $t->update([
                'nickname' => $nickname,
                'department_id' => $deptId,
            ]);

            // Sync assigned subjects to pivot table `teacher_subject`
            if ($assignedSubjectIds->isNotEmpty()) {
                $t->subjects()->sync($assignedSubjectIds->toArray());
            } else {
                // If no schedule yet, pick a subject matching title
                $sub = Subject::where('name', 'like', "%{$t->title}%")->first();
                if ($sub) {
                    $t->subjects()->sync([$sub->id]);
                }
            }
        }

        // 3. ASSIGN KAPROG (HEAD OF DEPARTMENT) IN DEPARTMENTS TABLE
        $kaprogMappings = [
            'PPLG' => 'Didin Sahrudin, M.Kom',
            'ANM' => 'Hanna Elhaq, S.Ds',
            'BCF' => 'Cynthia Gema Lestari, S.I.Kom',
            'TO' => 'Bachtiar, S.Pd',
            'TPFL' => 'Bambang Nurcahyono, M.Pd',
        ];

        foreach ($kaprogMappings as $deptCode => $teacherName) {
            $dept = Department::where('code', $deptCode)->first();
            $teacher = Teacher::where('name', 'like', "%{$teacherName}%")->first();
            if ($dept && $teacher) {
                $dept->update([
                    'head_teacher_id' => $teacher->id,
                    'head_teacher_name' => $teacher->name,
                    'description' => "Program keahlian unggulan {$dept->name} berbasis industri 4.0 dan sertifikasi kompetensi BNSP.",
                ]);

                // Ensure the Kaprog's department is set
                $teacher->update(['department_id' => $dept->id]);
            }
        }

        // 4. MAP CLASSROOMS PHYSICAL ROOMS (DYNAMIC ROOM RELOCATION READY)
        $rooms = Room::all()->keyBy('code');

        $classroomRoomMapping = [
            'X_PPLG_1' => 'LAB_PPLG_1',
            'X_PPLG_2' => 'LAB_PPLG_1',
            'X_PPLG_3' => 'LAB_PPLG_2',
            'XI_PPLG_1' => 'LAB_PPLG_1',
            'XI_PPLG_2' => 'LAB_PPLG_2',
            'XI_PPLG_3' => 'LAB_PPLG_2',
            'XII_PPLG_1' => 'LAB_PPLG_1',
            'XII_PPLG_2' => 'LAB_PPLG_2',
            'XII_PPLG_3' => 'LAB_PPLG_2',

            'X_ANIMASI_1' => 'STUDIO_ANM_1',
            'X_ANIMASI_2' => 'STUDIO_ANM_1',
            'XI_ANIMASI_1' => 'STUDIO_ANM_2',
            'XI_ANIMASI_2' => 'STUDIO_ANM_2',
            'XII_ANIMASI_1' => 'STUDIO_ANM_1',
            'XII_ANIMASI_2' => 'STUDIO_ANM_2',

            'X_BCF_1' => 'STUDIO_BCF',
            'X_BCF_2' => 'STUDIO_BCF',
            'XI_BCF_1' => 'STUDIO_BCF',
            'XI_BCF_2' => 'STUDIO_BCF',
            'XII_BCF_1' => 'STUDIO_BCF',
            'XII_BCF_2' => 'STUDIO_BCF',

            'X_TO_1' => 'BENGKEL_TO_1',
            'X_TO_2' => 'BENGKEL_TO_1',
            'XI_TO_1' => 'BENGKEL_TO_2',
            'XI_TO_2' => 'BENGKEL_TO_2',
            'XII_TO_1' => 'BENGKEL_TO_1',
            'XII_TO_2' => 'BENGKEL_TO_2',

            'X_TPFL_1' => 'BENGKEL_TPFL',
            'X_TPFL_2' => 'BENGKEL_TPFL',
            'XI_TPFL_1' => 'BENGKEL_TPFL',
            'XI_TPFL_2' => 'BENGKEL_TPFL',
        ];

        foreach ($classroomRoomMapping as $classCode => $roomCode) {
            $cls = Classroom::where('code', $classCode)->first();
            $rm = $rooms[$roomCode] ?? null;
            if ($cls && $rm) {
                $cls->update(['room_id' => $rm->id]);
            }
        }

        // Also assign default room for any classroom missing a room
        $defaultRoom = Room::where('code', 'R_TEORI_101')->first() ?? Room::first();
        if ($defaultRoom) {
            Classroom::whereNull('room_id')->update(['room_id' => $defaultRoom->id]);
        }
    }
}
