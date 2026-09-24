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

// 3. Admin Portal (Screen 1 & Admin Specification)
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
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
