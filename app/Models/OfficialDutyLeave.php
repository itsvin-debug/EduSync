<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficialDutyLeave extends Model
{
    protected $fillable = [
        'teacher_id',
        'date',
        'start_time',
        'end_time',
        'destination',
        'purpose',
        'letter_number',
        'document_url',
        'status',
        'duty_status',
        'completion_report',
        'completion_proof_url',
        'reviewed_by_user_id',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
