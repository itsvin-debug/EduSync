<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Departments (Jurusan)
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('head_teacher_name')->nullable();
            $table->string('color')->default('indigo');
            $table->string('icon')->default('code');
            $table->timestamps();
        });

        // 2. Teachers (Guru)
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code')->unique(); // e.g. 1, 2A, 2B, 41A
            $table->string('name');
            $table->string('nip')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('title')->nullable();
            $table->integer('max_weekly_hours')->default(32);
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // 3. Subjects (Mata Pelajaran)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->integer('weekly_hours')->default(4);
            $table->string('category')->default('kejuruan'); // umum, kejuruan, muatan_lokal
            $table->string('color')->default('indigo');
            $table->timestamps();
        });

        // 4. Physical Rooms (Ruangan & Lab)
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('building');
            $table->integer('capacity')->default(36);
            $table->string('type')->default('lab'); // lab, bengkel, teori, lapangan
            $table->timestamps();
        });

        // 5. Classrooms (Rombel / Kelas)
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->string('code')->unique(); // X_PPLG_1
            $table->string('name'); // X PPLG 1
            $table->integer('grade'); // 10, 11, 12
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('academic_year')->default('2024/2025');
            $table->string('semester')->default('Genap');
            $table->boolean('is_pkl')->default(false);
            $table->timestamps();
        });

        // 6. Time Slots (Slot Jam Pelajaran & Istirahat)
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->integer('period_number'); // 1 to 10
            $table->string('day_type')->default('regular'); // regular, friday
            $table->string('name'); // Jam 1
            $table->string('start_time'); // 06:30
            $table->string('end_time'); // 07:30
            $table->boolean('is_break')->default(false);
            $table->string('label')->nullable();
            $table->timestamps();
        });

        // 7. Update Users Table with School RBAC & Foreign Keys
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('siswa'); // admin, guru, siswa
            $table->string('sub_role')->nullable(); // Ketua Kelas, Wali Kelas, etc.
            $table->string('nisn')->nullable();
            $table->string('nip')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('status')->default('active');
        });

        // 8. Schedules (Matriks Jadwal Pelajaran)
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->string('day'); // Senin, Selasa, Rabu, Kamis, Jumat
            $table->integer('period_start'); // 1 to 10
            $table->integer('period_end'); // 1 to 10
            $table->string('academic_year')->default('2024/2025');
            $table->string('semester')->default('Genap');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 9. Inval & Schedule Swap Requests
        Schema::create('inval_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('substitute_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->date('date');
            $table->text('reason');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 10. Student Picket Submissions
        Schema::create('picket_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->date('date');
            $table->string('photo_url')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreignId('validator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('validation_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        // 11. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('description');
            $table->json('details')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('picket_reports');
        Schema::dropIfExists('inval_requests');
        Schema::dropIfExists('schedules');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['classroom_id']);
            $table->dropForeign(['department_id']);
            $table->dropColumn([
                'role',
                'sub_role',
                'nisn',
                'nip',
                'phone',
                'avatar',
                'teacher_id',
                'classroom_id',
                'department_id',
                'status'
            ]);
        });

        Schema::dropIfExists('time_slots');
        Schema::dropIfExists('classrooms');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('departments');
    }
};
