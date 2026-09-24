<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\TrashReport;
use App\Models\ClassFine;
use Carbon\Carbon;

class BusinessLogicAuditTest extends TestCase
{
    /**
     * Test 1: Unauthenticated visitors cannot access protected admin, guru, or siswa portals.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/guru/dashboard')->assertRedirect('/login');
        $this->get('/siswa/dashboard')->assertRedirect('/login');
    }

    /**
     * Test 2: Role authorization prevents students from accessing admin portal.
     */
    public function test_student_cannot_access_admin_portal(): void
    {
        $student = User::where('role', 'siswa')->where('status', 'active')->first() 
            ?? User::create([
                'name' => 'Test Siswa',
                'email' => 'test.siswa@example.test',
                'password' => bcrypt('password'),
                'role' => 'siswa',
                'status' => 'active',
            ]);

        $response = $this->actingAs($student)->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    /**
     * Test 3: Inactive or pending_verification users are blocked and redirected to login.
     */
    public function test_pending_user_is_blocked_by_middleware(): void
    {
        $pendingUser = User::create([
            'name' => 'Pending User Test',
            'email' => 'pending.audit.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'siswa',
            'status' => 'pending_verification',
        ]);

        $response = $this->actingAs($pendingUser)->get('/siswa/dashboard');
        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    /**
     * Test 4: Admin cannot create a schedule with overlapping teacher slots.
     */
    public function test_schedule_conflict_validation_on_store(): void
    {
        $admin = User::where('role', 'admin')->where('status', 'active')->first();
        $teacher = Teacher::first();
        $classrooms = Classroom::take(2)->get();
        $subject = Subject::first();

        // Create initial base schedule
        $base = Schedule::create([
            'classroom_id' => $classrooms[0]->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'period_start' => 2,
            'period_end' => 4,
        ]);

        // Attempt to create overlapping schedule for the same teacher on the same day in another class
        $response = $this->actingAs($admin)->post('/admin/schedules', [
            'classroom_id' => $classrooms[1]->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'period_start' => 3, // Overlaps with 2-4
            'period_end' => 5,
        ]);

        $response->assertSessionHasErrors(['period_start']);

        // Clean up base
        $base->delete();
    }

    /**
     * Test 5: Teacher cannot request swap where substitute teacher is themselves.
     */
    public function test_teacher_cannot_swap_with_themselves(): void
    {
        $schedule = Schedule::with('teacher')->first();
        $this->assertNotNull($schedule);
        $teacher = $schedule->teacher;

        $teacherUser = $teacher->user ?? User::where('teacher_id', $teacher->id)->first() ?? User::create([
            'name' => $teacher->name,
            'email' => 'teacher.swap.audit.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'guru',
            'teacher_id' => $teacher->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($teacherUser)->post('/guru/swap-request', [
            'schedule_id' => $schedule->id,
            'substitute_teacher_id' => $teacher->id,
            'date' => Carbon::now()->addDays(7)->toDateString(),
            'reason' => 'Perjalanan dinas luar kota',
        ]);

        $response->assertSessionHasErrors(['substitute_teacher_id']);
    }

    /**
     * Test 6: Class fine that is already lunas cannot be re-settled by student.
     */
    public function test_student_cannot_resubmit_settled_fine(): void
    {
        $classroom = Classroom::first();
        $student = User::where('role', 'siswa')->where('classroom_id', $classroom->id)->first() ?? User::create([
            'name' => 'Siswa Fine Test',
            'email' => 'siswa.fine.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'siswa',
            'classroom_id' => $classroom->id,
            'status' => 'active',
        ]);

        $fine = ClassFine::create([
            'classroom_id' => $classroom->id,
            'amount' => 50000,
            'reason' => 'Denda audit kebersihan',
            'payment_status' => 'lunas',
        ]);

        $response = $this->actingAs($student)->post("/siswa/fines/{$fine->id}/pay", [
            'payment_notes' => 'Mencoba bayar denda yang sudah lunas',
        ]);

        $response->assertSessionHas('error');

        $fine->delete();
    }

    /**
     * Test 7: Duplicate trash report conversion is prevented.
     */
    public function test_trash_report_cannot_be_converted_twice(): void
    {
        $admin = User::where('role', 'admin')->where('status', 'active')->first();
        $classroom = Classroom::first();
        $teacher = Teacher::first();

        $trash = TrashReport::create([
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'quantity_description' => 'Sampah botol plastik berserakan',
            'date' => Carbon::today()->toDateString(),
            'period_time' => 'Jam ke-3',
            'status' => 'pending',
        ]);

        // First conversion
        $this->actingAs($admin)->post("/admin/trash-reports/{$trash->id}/convert-fine", [
            'amount' => 50000,
        ])->assertSessionHas('success');

        // Second conversion attempt must be rejected
        $this->actingAs($admin)->post("/admin/trash-reports/{$trash->id}/convert-fine", [
            'amount' => 50000,
        ])->assertSessionHas('error');

        // Clean up
        ClassFine::where('trash_report_id', $trash->id)->delete();
        $trash->delete();
    }

    /**
     * Test 8: Swap request date must match the schedule day of week.
     */
    public function test_swap_date_must_match_schedule_day(): void
    {
        $schedule = Schedule::where('day', 'Senin')->with('teacher')->first();
        if (!$schedule) return;

        $teacher = $schedule->teacher;
        $otherTeacher = Teacher::where('id', '!=', $teacher->id)->first();

        $teacherUser = $teacher->user ?? User::where('teacher_id', $teacher->id)->first() ?? User::create([
            'name' => $teacher->name,
            'email' => 'teacher.swap2.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'guru',
            'teacher_id' => $teacher->id,
            'status' => 'active',
        ]);

        // Find a next Tuesday (Selasa) to intentionally trigger day mismatch with Senin schedule
        $nextTuesday = Carbon::now()->next(Carbon::TUESDAY)->toDateString();

        $response = $this->actingAs($teacherUser)->post('/guru/swap-request', [
            'schedule_id' => $schedule->id,
            'substitute_teacher_id' => $otherTeacher->id,
            'date' => $nextTuesday,
            'reason' => 'Perjalanan dinas pelatihan',
        ]);

        $response->assertSessionHasErrors(['date']);
    }

    /**
     * Test 9: Teacher cannot swap another teacher's schedule.
     */
    public function test_teacher_cannot_swap_another_teachers_schedule(): void
    {
        $teachers = Teacher::take(2)->get();
        if ($teachers->count() < 2) return;

        $scheduleOfTeacher2 = Schedule::where('teacher_id', $teachers[1]->id)->first();
        if (!$scheduleOfTeacher2) return;

        $userOfTeacher1 = $teachers[0]->user ?? User::where('teacher_id', $teachers[0]->id)->first() ?? User::create([
            'name' => $teachers[0]->name,
            'email' => 'teacher1.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'guru',
            'teacher_id' => $teachers[0]->id,
            'status' => 'active',
        ]);

        $substitute = Teacher::where('id', '!=', $teachers[0]->id)->where('id', '!=', $teachers[1]->id)->first() ?? $teachers[1];

        $response = $this->actingAs($userOfTeacher1)->post('/guru/swap-request', [
            'schedule_id' => $scheduleOfTeacher2->id,
            'substitute_teacher_id' => $substitute->id,
            'date' => Carbon::now()->toDateString(),
            'reason' => 'Mencoba tukar jadwal milik guru lain',
        ]);

        $response->assertSessionHasErrors(['schedule_id']);
    }

    /**
     * Test 10: Duty leave status toggle requires leave to be approved first.
     */
    public function test_duty_status_toggle_requires_approved_leave(): void
    {
        $admin = User::where('role', 'admin')->where('status', 'active')->first();
        $teacher = Teacher::first();

        $leave = \App\Models\OfficialDutyLeave::create([
            'teacher_id' => $teacher->id,
            'date' => Carbon::today()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '12:00',
            'destination' => 'Dinas Pendidikan Provinsi',
            'purpose' => 'Rakor Kurikulum Merdeka',
            'status' => 'pending', // Pending, not approved
            'duty_status' => 'di_luar_dinas',
        ]);

        $response = $this->actingAs($admin)->post("/admin/duty-leaves/{$leave->id}/toggle-status");
        $response->assertSessionHas('error');

        $leave->delete();
    }
}
