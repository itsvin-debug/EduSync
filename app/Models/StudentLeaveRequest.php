<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentLeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'classroom_id',
        'homeroom_teacher_id',
        'type', // sakit, izin, dispensasi
        'start_date',
        'end_date',
        'proof_image',
        'notes',
        'status', // pending, approved, rejected
        'reviewed_by_teacher_id',
        'reviewed_by_user_id',
        'rejection_note',
        'reviewed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id');
    }

    public function reviewedByTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'reviewed_by_teacher_id');
    }

    public function reviewedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
