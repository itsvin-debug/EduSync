<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Student Attendances (Feature 1)
        Schema::create('student_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('submitted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date');
            $table->string('status')->default('hadir'); // hadir, sakit, izin, alpha
            $table->string('notes')->nullable();
            $table->string('submitted_time')->nullable(); // e.g. "07:15 WIB"
            $table->timestamps();
        });

        // 2. Teacher Attendances (Feature 1)
        Schema::create('teacher_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->date('date');
            $table->string('status')->default('hadir'); // hadir, izin_dinas, sakit, alpha
            $table->string('check_in_time')->nullable(); // e.g. "06:25"
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 3. Learning Tasks / Tugas KBM Guru Pengganti / Mandiri (Feature 5)
        Schema::create('learning_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->date('date');
            $table->integer('period_start')->default(1);
            $table->integer('period_end')->default(2);
            $table->string('title');
            $table->text('instructions');
            $table->string('file_url')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->timestamps();
        });

        // 4. Official Duty Leave / Izin Keluar Dinas Guru (Feature 6)
        Schema::create('official_duty_leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->date('date');
            $table->string('start_time'); // e.g. "08:00"
            $table->string('end_time');   // e.g. "14:00"
            $table->string('destination'); // e.g. "Dinas Pendidikan Provinsi Jawa Barat"
            $table->text('purpose');       // e.g. "Rakor Kurikulum Merdeka SMK PK"
            $table->string('letter_number')->nullable();
            $table->string('document_url')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('duty_status')->default('di_luar_dinas'); // di_luar_dinas, selesai
            $table->text('completion_report')->nullable();
            $table->string('completion_proof_url')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // 5. Enhance picket_reports with video_url and delivery_time if not present (Feature 7)
        Schema::table('picket_reports', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('photo_url');
            $table->string('delivery_time')->nullable()->after('notes');
        });

        // 6. Teacher Trash Reports / Laporan Sampah (Feature 8)
        Schema::create('trash_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->text('quantity_description'); // e.g. "Bungkus makanan ringan dan botol plastik berserakan"
            $table->string('photo_url')->nullable();
            $table->date('date');
            $table->string('period_time')->nullable(); // e.g. "Jam ke-4 (09:15 WIB)"
            $table->string('status')->default('pending'); // pending, fined, dismissed
            $table->timestamps();
        });

        // 7. Class Penalty Fines / Denda Kebersihan Kelas (Features 9 & 10)
        Schema::create('class_fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trash_report_id')->nullable()->constrained('trash_reports')->nullOnDelete();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('issued_by_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->integer('amount')->default(50000);
            $table->string('reason');
            $table->string('payment_status')->default('belum_dibayar'); // belum_dibayar, menunggu_konfirmasi, lunas
            $table->string('payment_proof_url')->nullable();
            $table->text('payment_notes')->nullable();
            $table->timestamp('submitted_payment_at')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        // 8. Extracurricular & Student Organizations (Feature 11)
        Schema::create('school_organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // OSIS, MPK, Pramuka, etc.
            $table->string('type')->default('ekskul'); // organisasi, ekskul
            $table->foreignId('leader_student_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('leader_name')->nullable();
            $table->foreignId('supervisor_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('schedule_day')->default('Jumat');
            $table->string('schedule_time')->default('13:00 - 15:00 WIB');
            $table->string('location')->default('Lingkungan Sekolah');
            $table->integer('member_count')->default(25);
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_organizations');
        Schema::dropIfExists('class_fines');
        Schema::dropIfExists('trash_reports');

        Schema::table('picket_reports', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'delivery_time']);
        });

        Schema::dropIfExists('official_duty_leaves');
        Schema::dropIfExists('learning_tasks');
        Schema::dropIfExists('teacher_attendances');
        Schema::dropIfExists('student_attendances');
    }
};
