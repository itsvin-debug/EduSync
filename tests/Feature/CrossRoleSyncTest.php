<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Department;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use Carbon\Carbon;

class CrossRoleSyncTest extends TestCase
{
    /**
     * Test: Login gateway renders unified selection page and does NOT auto-redirect logged-in users to Admin Dashboard.
     */
    public function test_login_page_renders_without_auto_redirect(): void
    {
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            $response = $this->actingAs($admin)->get('/login');
            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
        } else {
            $response = $this->get('/login');
            $response->assertStatus(200);
        }
    }

    /**
     * Test: Dynamic Academic Year shared prop calculation based on real-time clock.
     */
    public function test_dynamic_academic_year_calculation(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $now = now();
        $expectedYear = $now->month >= 7
            ? "{$now->year}/" . ($now->year + 1)
            : ($now->year - 1) . "/{$now->year}";

        $response->assertInertia(fn ($page) =>
            $page->has('academic_year')
                ->where('academic_year', $expectedYear)
        );
    }

    /**
     * Test: Student Leave Approval by Teacher automatically updates Class Attendance records.
     */
    public function test_teacher_approve_student_leave_auto_syncs_attendance(): void
    {
        $department = Department::first() ?? Department::create(['name' => 'Teknik Komputer', 'code' => 'TK']);
        $classroom = Classroom::first() ?? Classroom::create([
            'name' => 'X TK 1',
            'code' => 'X_TK_1',
            'grade' => 'X',
            'department_id' => $department->id,
        ]);

        $uniqueSuffix = uniqid();
        $teacherUser = User::create([
            'name' => 'Guru Wali Kelas ' . $uniqueSuffix,
            'email' => 'wali.kelas.' . $uniqueSuffix . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'guru',
            'status' => 'active',
        ]);

        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'name' => $teacherUser->name,
            'code' => 'G' . rand(1000, 9999),
            'email' => $teacherUser->email,
            'department_id' => $department->id,
            'status' => 'active',
        ]);

        $student = User::create([
            'name' => 'Siswa Izin Test',
            'email' => 'siswa.izin.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'siswa',
            'classroom_id' => $classroom->id,
            'status' => 'active',
        ]);

        // Next Monday date
        $startDate = Carbon::now()->next(Carbon::MONDAY)->toDateString();
        $endDate = $startDate;

        $leave = StudentLeaveRequest::create([
            'student_id' => $student->id,
            'classroom_id' => $classroom->id,
            'homeroom_teacher_id' => $teacher->id,
            'type' => 'sakit',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'notes' => 'Demam tinggi butuh istirahat',
            'status' => 'pending',
        ]);

        // Teacher approves leave
        $this->actingAs($teacherUser)
            ->post("/guru/student-leaves/{$leave->id}/approve")
            ->assertRedirect();

        $this->assertDatabaseHas('student_leave_requests', [
            'id' => $leave->id,
            'status' => 'approved',
        ]);

        // Assert StudentAttendance table was automatically updated / created
        $syncedAttendance = StudentAttendance::where('user_id', $student->id)
            ->whereDate('date', $startDate)
            ->first();

        $this->assertNotNull($syncedAttendance);
        $this->assertEquals('sakit', $syncedAttendance->status);
        $this->assertTrue((bool) $syncedAttendance->is_locked);
    }

    /**
     * Test: Admin can override student attendance record.
     */
    public function test_admin_can_override_attendance(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::create([
            'name' => 'Admin Override Test',
            'email' => 'admin.override.' . uniqid() . '@example.test',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $student = User::where('role', 'siswa')->first();
        $classroom = Classroom::first();

        $attendance = StudentAttendance::create([
            'user_id' => $student->id,
            'classroom_id' => $classroom->id,
            'date' => now()->toDateString(),
            'status' => 'alpha',
            'notes' => 'Tidak ada kabar',
            'is_locked' => false,
        ]);

        $this->actingAs($admin)
            ->post("/admin/attendance/{$attendance->id}/override", [
                'status' => 'izin',
                'notes' => 'Dispensasi mengikuti lomba provinsi',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('student_attendances', [
            'id' => $attendance->id,
            'status' => 'izin',
            'overridden_by_admin' => true,
            'is_locked' => true,
        ]);
    }

    /**
     * Test: Admin can toggle Class Leader status.
     */
    public function test_admin_can_toggle_class_leader(): void
    {
        $admin = User::where('role', 'admin')->first();
        $student = User::where('role', 'siswa')->first();

        $originalStatus = (bool) $student->is_class_leader;

        $this->actingAs($admin)
            ->post("/admin/students/{$student->id}/toggle-class-leader")
            ->assertRedirect();

        $student->refresh();
        $this->assertEquals(!$originalStatus, (bool) $student->is_class_leader);
    }

    /**
     * Test: Student registration with student_role option (Ketua Kelas vs Siswa Biasa).
     */
    public function test_student_registration_with_class_leader_option(): void
    {
        $classroom = Classroom::first();

        // Register as Ketua Kelas
        $emailLeader = 'leader.' . uniqid() . '@example.test';
        $responseLeader = $this->post('/register', [
            'role' => 'siswa',
            'name' => 'Calon Ketua Kelas',
            'email' => $emailLeader,
            'password' => 'password123',
            'nisn' => (string) rand(1000000000, 9999999999),
            'classroom_id' => $classroom->id,
            'student_role' => 'ketua_kelas',
        ]);
        $responseLeader->assertSessionHasNoErrors();

        $userLeader = User::where('email', $emailLeader)->first();
        $this->assertNotNull($userLeader);
        $this->assertTrue((bool) $userLeader->is_class_leader);
        $this->assertEquals('Ketua Kelas', $userLeader->sub_role);

        // Register as Siswa Biasa
        $emailRegular = 'regular.' . uniqid() . '@example.test';
        $responseRegular = $this->post('/register', [
            'role' => 'siswa',
            'name' => 'Calon Siswa Biasa',
            'email' => $emailRegular,
            'password' => 'password123',
            'nisn' => (string) rand(1000000000, 9999999999),
            'classroom_id' => $classroom->id,
            'student_role' => 'siswa_biasa',
        ]);
        $responseRegular->assertSessionHasNoErrors();

        $userRegular = User::where('email', $emailRegular)->first();
        $this->assertNotNull($userRegular);
        $this->assertFalse((bool) $userRegular->is_class_leader);
        $this->assertEquals('Siswa', $userRegular->sub_role);
    }

    /**
     * Test: Quick login distinguishes Ketua Kelas and Siswa Biasa.
     */
    public function test_quick_login_handles_ketua_kelas_and_siswa_biasa(): void
    {
        $respLeader = $this->get('/quick-login/ketua-kelas');
        $respLeader->assertRedirect(route('siswa.dashboard'));
        $this->assertTrue((bool) auth()->user()->is_class_leader);

        $respRegular = $this->get('/quick-login/siswa-biasa');
        $respRegular->assertRedirect(route('siswa.dashboard'));
        $this->assertFalse((bool) auth()->user()->is_class_leader);
    }

    /**
     * Test: Teacher dashboard renders with HTTP 200 without undefined errors.
     */
    public function test_teacher_dashboard_renders_successfully(): void
    {
        $teacherUser = User::where('role', 'guru')->where('status', 'active')->first();
        $response = $this->actingAs($teacherUser)->get('/guru/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Teacher/Dashboard'));
    }

    /**
     * Test: Teacher can update profile and change password.
     */
    public function test_teacher_can_update_profile_and_password(): void
    {
        $teacherUser = User::where('role', 'guru')->where('status', 'active')->first();
        $teacherUser->update(['password' => \Illuminate\Support\Facades\Hash::make('password')]);

        // 1. Update Profile
        $updatedName = 'Guru Terupdate ' . uniqid();
        $respProfile = $this->actingAs($teacherUser)->post('/guru/settings/profile', [
            'name' => $updatedName,
            'title' => 'Guru Kejuruan Vokasi',
            'nip' => '199201012020121099',
            'email' => $teacherUser->email,
            'phone' => '089912345678',
        ]);
        $respProfile->assertSessionHasNoErrors();
        $this->assertEquals($updatedName, $teacherUser->fresh()->name);

        // 2. Update Password
        $respPass = $this->actingAs($teacherUser)->post('/guru/settings/password', [
            'current_password' => 'password',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);
        $respPass->assertSessionHasNoErrors();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('newpassword123', $teacherUser->fresh()->password));
    }

    /**
     * Test: Student can update profile and change password.
     */
    public function test_student_can_update_profile_and_password(): void
    {
        $studentUser = User::where('role', 'siswa')->where('status', 'active')->first();
        $studentUser->update(['password' => \Illuminate\Support\Facades\Hash::make('password')]);

        // 1. Update Profile
        $updatedName = 'Siswa Terupdate ' . uniqid();
        $respProfile = $this->actingAs($studentUser)->post('/siswa/settings/profile', [
            'name' => $updatedName,
            'email' => $studentUser->email,
            'phone' => '081233445566',
        ]);
        $respProfile->assertSessionHasNoErrors();
        $this->assertEquals($updatedName, $studentUser->fresh()->name);

        // 2. Update Password
        $respPass = $this->actingAs($studentUser)->post('/siswa/settings/password', [
            'current_password' => 'password',
            'password' => 'studentscret123',
            'password_confirmation' => 'studentscret123',
        ]);
        $respPass->assertSessionHasNoErrors();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('studentscret123', $studentUser->fresh()->password));
    }

    /**
     * Test: Class Leader can fast-input add a new student with attendance_number, name, and nisn.
     */
    public function test_class_leader_can_fast_input_new_student(): void
    {
        $classLeader = User::where('role', 'siswa')
            ->where('status', 'active')
            ->where(function($q) {
                $q->where('is_class_leader', true)->orWhere('sub_role', 'Ketua Kelas');
            })->first();

        if (!$classLeader) {
            $classLeader = User::where('role', 'siswa')->first();
            $classLeader->update(['is_class_leader' => true, 'sub_role' => 'Ketua Kelas']);
        }

        $randomNisn = '99' . str_pad((string) rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
        $studentName = 'Siswa Baru ' . uniqid();

        $response = $this->actingAs($classLeader)->post('/siswa/students', [
            'attendance_number' => 35,
            'name' => $studentName,
            'nisn' => $randomNisn,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', [
            'name' => $studentName,
            'nisn' => $randomNisn,
            'attendance_number' => 35,
            'role' => 'siswa',
        ]);
    }

    /**
     * Test: Class Leader can dispatch attendance report to teachers and download official PDF.
     */
    public function test_class_leader_can_dispatch_attendance_report_and_download_pdf(): void
    {
        $classLeader = User::where('role', 'siswa')
            ->where('status', 'active')
            ->where(function($q) {
                $q->where('is_class_leader', true)->orWhere('sub_role', 'Ketua Kelas');
            })->first();

        if (!$classLeader) {
            $classLeader = User::where('role', 'siswa')->first();
            $classLeader->update(['is_class_leader' => true, 'sub_role' => 'Ketua Kelas']);
        }

        // 1. Dispatch Attendance Report
        $respReport = $this->actingAs($classLeader)->post('/siswa/attendance/send-report');
        $respReport->assertSessionHasNoErrors();
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $classLeader->id,
            'action' => 'ATTENDANCE_REPORT_DISPATCHED_TO_TEACHERS',
        ]);

        // 2. Download Official PDF Attendance Sheet
        $respPdf = $this->actingAs($classLeader)->get('/siswa/attendance/export-pdf');
        $respPdf->assertStatus(200);
        $respPdf->assertHeader('content-type', 'application/pdf');
    }

    /**
     * Test: Midnight duty reset artisan command execution.
     */
    public function test_daily_duty_reset_scheduled_command(): void
    {
        $exitCode = $this->artisan('edusync:reset-duty')->run();
        $this->assertEquals(0, $exitCode);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'DUTY_CHECKLIST_MIDNIGHT_RESET',
        ]);
    }
}

