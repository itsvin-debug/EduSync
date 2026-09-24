<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;

// 1. Landing & Public Portal (Screen 4)
Route::get('/', [LandingController::class, 'index'])->name('home');

// 2. Authentication & Quick Role Switching (Screen 3)
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/quick-login/{role}', [AuthController::class, 'quickLogin'])->name('quick-login');

// 3. Admin Portal (The 13 Core Features)
Route::prefix('admin')->group(function () {
    // Feature 1 & 2: Real-time Attendance Analytics & Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/kbm-monitor', [AdminController::class, 'kbmMonitor'])->name('admin.kbm');

    // Feature 3: Student Account Management
    Route::get('/students', [AdminController::class, 'students'])->name('admin.students');
    Route::post('/students', [AdminController::class, 'storeStudent'])->name('admin.students.store');
    Route::put('/students/{id}', [AdminController::class, 'updateStudent'])->name('admin.students.update');
    Route::post('/students/{id}/reset-password', [AdminController::class, 'resetStudentPassword'])->name('admin.students.reset-password');
    Route::delete('/students/{id}', [AdminController::class, 'deleteStudent'])->name('admin.students.delete');

    // Feature 4: Teacher Account Management
    Route::get('/teachers', [AdminController::class, 'teachers'])->name('admin.teachers');
    Route::post('/teachers', [AdminController::class, 'storeTeacher'])->name('admin.teachers.store');
    Route::put('/teachers/{id}', [AdminController::class, 'updateTeacher'])->name('admin.teachers.update');
    Route::post('/teachers/{id}/reset-password', [AdminController::class, 'resetTeacherPassword'])->name('admin.teachers.reset-password');
    Route::delete('/teachers/{id}', [AdminController::class, 'deleteTeacher'])->name('admin.teachers.delete');

    // Feature 5: Real-Time Teacher Presence Monitor & Learning Tasks
    Route::get('/teacher-presence', [AdminController::class, 'teacherPresence'])->name('admin.teacher-presence');
    Route::post('/learning-tasks/{id}/verify', [AdminController::class, 'verifyLearningTask'])->name('admin.learning-tasks.verify');

    // Feature 6: Teacher Official Duty Leave Management
    Route::get('/duty-leaves', [AdminController::class, 'dutyLeaves'])->name('admin.duty-leaves');
    Route::post('/duty-leaves/{id}/approve', [AdminController::class, 'approveDutyLeave'])->name('admin.duty-leaves.approve');
    Route::post('/duty-leaves/{id}/reject', [AdminController::class, 'rejectDutyLeave'])->name('admin.duty-leaves.reject');
    Route::post('/duty-leaves/{id}/toggle-status', [AdminController::class, 'toggleDutyStatus'])->name('admin.duty-leaves.toggle-status');

    // Feature 7: Class Cleanliness / Picket Monitor
    Route::get('/picket', [AdminController::class, 'picket'])->name('admin.picket');
    Route::post('/picket/{id}/verify', [AdminController::class, 'verifyPicket'])->name('admin.picket.verify');

    // Feature 8: Teacher Trash Reporting Module
    Route::get('/trash-reports', [AdminController::class, 'trashReports'])->name('admin.trash-reports');
    Route::post('/trash-reports/{id}/convert-fine', [AdminController::class, 'convertTrashReportToFine'])->name('admin.trash-reports.convert-fine');
    Route::post('/trash-reports/{id}/dismiss', [AdminController::class, 'dismissTrashReport'])->name('admin.trash-reports.dismiss');

    // Feature 9 & 10: Class Penalty Fines & Settlement Approval
    Route::get('/class-fines', [AdminController::class, 'classFines'])->name('admin.class-fines');
    Route::post('/class-fines', [AdminController::class, 'storeClassFine'])->name('admin.class-fines.store');
    Route::post('/class-fines/{id}/settle', [AdminController::class, 'settleClassFine'])->name('admin.class-fines.settle');
    Route::post('/class-fines/{id}/reject-settlement', [AdminController::class, 'rejectClassFineSettlement'])->name('admin.class-fines.reject-settlement');

    // Feature 11: Extracurricular & Student Organization Management
    Route::get('/organizations', [AdminController::class, 'organizations'])->name('admin.organizations');
    Route::post('/organizations', [AdminController::class, 'storeOrganization'])->name('admin.organizations.store');
    Route::put('/organizations/{id}', [AdminController::class, 'updateOrganization'])->name('admin.organizations.update');
    Route::delete('/organizations/{id}', [AdminController::class, 'deleteOrganization'])->name('admin.organizations.delete');

    // Feature 12: Admin Activity Audit Logs
    Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->name('admin.audit-logs');

    // Feature 13: Data Export & Attendance Recap Engine
    Route::get('/recap-export', [AdminController::class, 'recapExport'])->name('admin.recap-export');

    // Jurusan, Kaprog & Guru Jurusan Module
    Route::get('/departments', [AdminController::class, 'departments'])->name('admin.departments');
    Route::post('/departments', [AdminController::class, 'storeDepartment'])->name('admin.departments.store');
    Route::post('/departments/{id}', [AdminController::class, 'updateDepartment'])->name('admin.departments.update');
    Route::post('/departments/{id}/assign-kaprog', [AdminController::class, 'assignKaprog'])->name('admin.departments.assign-kaprog');

    // Dynamic Class Room Relocation Module
    Route::get('/classrooms-relocation', [AdminController::class, 'classroomsRelocation'])->name('admin.classrooms-relocation');
    Route::post('/classrooms/{id}/relocate-room', [AdminController::class, 'relocateClassroomRoom'])->name('admin.classrooms.relocate-room');

    // Admin Account Settings & Security
    Route::get('/settings', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('/settings/profile', [AdminController::class, 'updateAdminProfile'])->name('admin.settings.profile');
    Route::post('/settings/password', [AdminController::class, 'updateAdminPassword'])->name('admin.settings.password');
    Route::post('/settings/2fa', [AdminController::class, 'toggleAdmin2FA'])->name('admin.settings.2fa');

    // Matrix Builder & Inval
    Route::get('/schedules', [AdminController::class, 'scheduleBuilder'])->name('admin.schedules');
    Route::post('/schedules', [AdminController::class, 'storeSchedule'])->name('admin.schedules.store');
    Route::put('/schedules/{id}', [AdminController::class, 'updateSchedule'])->name('admin.schedules.update');
    Route::delete('/schedules/{id}', [AdminController::class, 'deleteSchedule'])->name('admin.schedules.delete');
    Route::post('/schedules/auto-generate', [AdminController::class, 'autoGenerate'])->name('admin.schedules.autogenerate');
    Route::get('/master-data', [AdminController::class, 'masterData'])->name('admin.master');
    Route::get('/inval', [AdminController::class, 'invalManagement'])->name('admin.inval');
    Route::post('/inval/{id}/approve', [AdminController::class, 'approveInval'])->name('admin.inval.approve');
    Route::post('/inval/{id}/reject', [AdminController::class, 'rejectInval'])->name('admin.inval.reject');
});

// 4. Teacher Portal (Screen 5 & Teacher Specification)
Route::prefix('guru')->group(function () {
    Route::get('/dashboard', [TeacherController::class, 'dashboard'])->name('guru.dashboard');
    Route::post('/swap-request', [TeacherController::class, 'swapRequest'])->name('guru.swap');
    Route::post('/picket/{id}/verify', [TeacherController::class, 'verifyPicket'])->name('guru.picket.verify');
});

// 5. Student Portal (Screen 6 & Student Mobile-First Specification)
Route::prefix('siswa')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('siswa.dashboard');
    Route::post('/picket', [StudentController::class, 'submitPicket'])->name('siswa.picket.submit');
});
