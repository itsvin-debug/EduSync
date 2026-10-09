<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Schedules Performance Indexes
        Schema::table('schedules', function (Blueprint $table) {
            $table->index(['day', 'period_start'], 'idx_schedules_day_period');
            $table->index(['classroom_id', 'day'], 'idx_schedules_classroom_day');
            $table->index(['teacher_id', 'day'], 'idx_schedules_teacher_day');
        });

        // 2. Student Attendances Performance Indexes
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->index(['date', 'status'], 'idx_student_att_date_status');
            $table->index(['classroom_id', 'date'], 'idx_student_att_class_date');
        });

        // 3. Teacher Attendances Performance Indexes
        Schema::table('teacher_attendances', function (Blueprint $table) {
            $table->index(['date', 'status'], 'idx_teacher_att_date_status');
        });

        // 4. Users Table Indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'status'], 'idx_users_role_status');
        });

        // 5. Classrooms Indexes
        Schema::table('classrooms', function (Blueprint $table) {
            $table->index(['grade', 'department_id'], 'idx_classrooms_grade_dept');
            $table->index('is_pkl', 'idx_classrooms_is_pkl');
        });

        // 6. Audit Logs Index
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('created_at', 'idx_audit_logs_created_at');
        });

        // 7. Learning Tasks Index
        Schema::table('learning_tasks', function (Blueprint $table) {
            $table->index(['classroom_id', 'date'], 'idx_learning_tasks_class_date');
        });

        // 8. Picket Reports Index
        Schema::table('picket_reports', function (Blueprint $table) {
            $table->index(['classroom_id', 'date'], 'idx_picket_reports_class_date');
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex('idx_schedules_day_period');
            $table->dropIndex('idx_schedules_classroom_day');
            $table->dropIndex('idx_schedules_teacher_day');
        });

        Schema::table('student_attendances', function (Blueprint $table) {
            $table->dropIndex('idx_student_att_date_status');
            $table->dropIndex('idx_student_att_class_date');
        });

        Schema::table('teacher_attendances', function (Blueprint $table) {
            $table->dropIndex('idx_teacher_att_date_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_status');
        });

        Schema::table('classrooms', function (Blueprint $table) {
            $table->dropIndex('idx_classrooms_grade_dept');
            $table->dropIndex('idx_classrooms_is_pkl');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_logs_created_at');
        });

        Schema::table('learning_tasks', function (Blueprint $table) {
            $table->dropIndex('idx_learning_tasks_class_date');
        });

        Schema::table('picket_reports', function (Blueprint $table) {
            $table->dropIndex('idx_picket_reports_class_date');
        });
    }
};
