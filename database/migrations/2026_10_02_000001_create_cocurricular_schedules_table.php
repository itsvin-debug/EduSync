<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cocurricular_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('week_range'); // e.g. "29 September - 2 Oktober 2026"
            $table->string('activity_name'); // "Pentas Kreasi", "Makan Bersama", "Jumat Taqwa"
            $table->string('day_name'); // "Selasa", "Rabu", "Kamis", "Jumat"
            $table->date('date')->index();
            $table->string('class_name')->index(); // "OSIS", "ROHIS", "X BCF 1", etc.
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->string('time_start')->default('06:45');
            $table->string('time_end')->default('07:45');
            $table->string('location')->default('Lapangan Utama SMKN 1 Ciomas');
            $table->text('description')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, in_progress, completed
            $table->timestamps();

            $table->index(['date', 'day_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cocurricular_schedules');
    }
};
