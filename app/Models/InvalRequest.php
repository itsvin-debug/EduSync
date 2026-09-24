<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_teacher_id',
        'substitute_teacher_id',
        'schedule_id',
        'date',
        'reason',
        'status',
        'reviewed_by_user_id',
        'notes',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'requester_teacher_id');
    }

    public function substitute(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'substitute_teacher_id');
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
