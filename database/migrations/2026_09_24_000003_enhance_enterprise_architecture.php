<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Departments enhancements
        Schema::table('departments', function (Blueprint $table) {
            $table->string('icon_image')->nullable()->after('icon');
            $table->foreignId('head_teacher_id')->nullable()->after('head_teacher_name')->constrained('teachers')->nullOnDelete();
            $table->text('description')->nullable()->after('icon_image');
        });

        // 2. Classrooms: Physical Room Relocation support & indexes
        Schema::table('classrooms', function (Blueprint $table) {
            $table->foreignId('room_id')->nullable()->after('homeroom_teacher_id')->constrained('rooms')->nullOnDelete();
            $table->index(['department_id', 'grade']);
        });

        // 3. Teachers: Nickname & Major / Department connection
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('nickname')->nullable()->after('name');
            $table->foreignId('department_id')->nullable()->after('user_id')->constrained('departments')->nullOnDelete();
        });

        // 4. Pivot Table: Teacher Assigned Subjects (Multi-select)
        Schema::create('teacher_subject', function (Blueprint $table) {
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->primary(['teacher_id', 'subject_id']);
        });

        // 5. Users: Two-Factor Authentication (2FA) & Security
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('two_factor_enabled')->default(false)->after('status');
            $table->string('two_factor_code')->nullable()->after('two_factor_enabled');
        });

        // 6. High-Performance Indexes
        Schema::table('schedules', function (Blueprint $table) {
            $table->index(['classroom_id', 'day']);
            $table->index(['teacher_id', 'day']);
            $table->index(['room_id', 'day']);
        });

        Schema::table('student_attendances', function (Blueprint $table) {
            $table->index(['date', 'classroom_id']);
            $table->index(['date', 'status']);
        });

        Schema::table('teacher_attendances', function (Blueprint $table) {
            $table->index(['date', 'teacher_id']);
        });

        Schema::table('class_fines', function (Blueprint $table) {
            $table->index(['classroom_id', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subject');

        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_teacher_id']);
            $table->dropColumn(['icon_image', 'head_teacher_id', 'description']);
        });

        Schema::table('classrooms', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn('room_id');
            $table->dropIndex(['department_id', 'grade']);
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['nickname', 'department_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['two_factor_enabled', 'two_factor_code']);
        });
    }
};
