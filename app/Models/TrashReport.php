<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TrashReport extends Model
{
    protected $fillable = [
        'classroom_id',
        'department_id',
        'teacher_id',
        'quantity_description',
        'photo_url',
        'photos',
        'location_tag',
        'date',
        'period_time',
        'status',
    ];

    protected $casts = [
        'photos' => 'array',
        'date' => 'date',
    ];

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function fine(): HasOne
    {
        return $this->hasOne(ClassFine::class);
    }
}
