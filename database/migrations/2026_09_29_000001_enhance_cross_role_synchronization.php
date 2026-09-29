<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users table: is_class_leader flag
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_class_leader')->default(false)->after('sub_role');
        });

        // 2. Classrooms table: designated class_leader_id
        Schema::table('classrooms', function (Blueprint $table) {
            $table->foreignId('class_leader_id')->nullable()->after('homeroom_teacher_id')->constrained('users')->nullOnDelete();
        });

        // 3. Student Leave / Sick Requests (Dispensasi, Izin, Sakit)
        Schema::create('student_leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('type')->default('izin'); // sakit, izin, dispensasi
            $table->date('start_date');
            $table->date('end_date');
            $table->string('proof_image')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreignId('reviewed_by_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // 4. Picket Reports: multi-photos, duty student participation, and area location
        Schema::table('picket_reports', function (Blueprint $table) {
            $table->json('photos')->nullable()->after('photo_url');
            $table->json('duty_students')->nullable()->after('photos');
            $table->string('area_location')->nullable()->after('delivery_time');
            $table->foreignId('submitted_by_user_id')->nullable()->after('classroom_id')->constrained('users')->nullOnDelete();
        });

        // 5. Learning Tasks: class leader delegation & assignment status
        Schema::table('learning_tasks', function (Blueprint $table) {
            $table->foreignId('class_leader_id')->nullable()->after('classroom_id')->constrained('users')->nullOnDelete();
            $table->string('status')->default('dispatched')->after('is_verified'); // dispatched, in_progress, completed
        });

        // 6. Trash Reports: multi-photos, location tag, and department connection
        Schema::table('trash_reports', function (Blueprint $table) {
            $table->json('photos')->nullable()->after('photo_url');
            $table->string('location_tag')->nullable()->after('period_time');
            $table->foreignId('department_id')->nullable()->after('classroom_id')->constrained('departments')->nullOnDelete();
        });

        // 7. Student Attendances: auto-lock and admin override flags
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->boolean('is_locked')->default(false)->after('submitted_time');
            $table->boolean('overridden_by_admin')->default(false)->after('is_locked');
        });
    }

    public function down(): void
    {
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->dropColumn(['is_locked', 'overridden_by_admin']);
        });

        Schema::table('trash_reports', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['photos', 'location_tag', 'department_id']);
        });

        Schema::table('learning_tasks', function (Blueprint $table) {
            $table->dropForeign(['class_leader_id']);
            $table->dropColumn(['class_leader_id', 'status']);
        });

        Schema::table('picket_reports', function (Blueprint $table) {
            $table->dropForeign(['submitted_by_user_id']);
            $table->dropColumn(['photos', 'duty_students', 'area_location', 'submitted_by_user_id']);
        });

        Schema::dropIfExists('student_leave_requests');

        Schema::table('classrooms', function (Blueprint $table) {
            $table->dropForeign(['class_leader_id']);
            $table->dropColumn('class_leader_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_class_leader');
        });
    }
};
