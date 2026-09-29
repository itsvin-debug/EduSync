<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAttendance extends Model
{
    protected $fillable = [
        'user_id',
        'classroom_id',
        'submitted_by_user_id',
        'date',
        'status',
        'notes',
        'submitted_time',
        'is_locked',
        'overridden_by_admin',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
        'overridden_by_admin' => 'boolean',
        'date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'classroom_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }
}
