<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassFine extends Model
{
    protected $fillable = [
        'trash_report_id',
        'classroom_id',
        'issued_by_teacher_id',
        'homeroom_teacher_id',
        'amount',
        'reason',
        'payment_status',
        'payment_proof_url',
        'payment_notes',
        'submitted_payment_at',
        'verified_by_user_id',
        'verified_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'submitted_payment_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function trashReport(): BelongsTo
    {
        return $this->belongsTo(TrashReport::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function issuedByTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'issued_by_teacher_id');
    }

    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }
}
