<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolOrganization extends Model
{
    protected $fillable = [
        'name',
        'type',
        'leader_student_id',
        'leader_name',
        'supervisor_teacher_id',
        'schedule_day',
        'schedule_time',
        'location',
        'member_count',
        'description',
        'status',
    ];

    public function leaderStudent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_student_id');
    }

    public function supervisorTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'supervisor_teacher_id');
    }
}
