<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PicketReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'classroom_id',
        'submitted_by_user_id',
        'date',
        'photo_url',
        'photos',
        'duty_students',
        'area_location',
        'notes',
        'status',
        'validator_user_id',
        'validation_notes',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'date' => 'date',
        'photos' => 'array',
        'duty_students' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validator_user_id');
    }
}
