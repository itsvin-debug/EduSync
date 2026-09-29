<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningTask extends Model
{
    protected $fillable = [
        'teacher_id',
        'classroom_id',
        'class_leader_id',
        'subject_id',
        'date',
        'period_start',
        'period_end',
        'title',
        'instructions',
        'file_url',
        'is_verified',
        'status',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function classLeader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'class_leader_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
