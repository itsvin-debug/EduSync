<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'classroom_id',
        'subject_id',
        'teacher_id',
        'room_id',
        'day',
        'period_start',
        'period_end',
        'academic_year',
        'semester',
        'notes',
    ];

    protected $appends = ['start_time', 'end_time'];

    public function getStartTimeAttribute(): string
    {
        $times = [
            'Senin' => [1 => '06:30', 2 => '07:30', 3 => '08:10', 4 => '08:50', 5 => '10:00', 6 => '10:40', 7 => '11:20', 8 => '13:00', 9 => '13:40', 10 => '14:20'],
            'Selasa' => [1 => '06:30', 2 => '07:30', 3 => '08:10', 4 => '08:50', 5 => '10:00', 6 => '10:40', 7 => '11:20', 8 => '13:00', 9 => '13:40', 10 => '14:20'],
            'Rabu' => [1 => '06:30', 2 => '07:30', 3 => '08:10', 4 => '08:50', 5 => '10:00', 6 => '10:40', 7 => '11:20', 8 => '13:00', 9 => '13:40', 10 => '14:20'],
            'Kamis' => [1 => '06:30', 2 => '07:30', 3 => '08:10', 4 => '08:50', 5 => '10:00', 6 => '10:40', 7 => '11:20', 8 => '13:00', 9 => '13:40', 10 => '14:20'],
            'Jumat' => [1 => '06:30', 2 => '07:30', 3 => '08:10', 4 => '08:50', 5 => '09:45', 6 => '10:25', 7 => '11:05', 8 => '13:00', 9 => '13:40', 10 => '14:20'],
        ];
        $day = $this->day ?? 'Senin';
        return $times[$day][$this->period_start] ?? '07:30';
    }

    public function getEndTimeAttribute(): string
    {
        $times = [
            'Senin' => [1 => '07:30', 2 => '08:10', 3 => '08:50', 4 => '09:30', 5 => '10:40', 6 => '11:20', 7 => '12:00', 8 => '13:40', 9 => '14:20', 10 => '15:00'],
            'Selasa' => [1 => '07:30', 2 => '08:10', 3 => '08:50', 4 => '09:30', 5 => '10:40', 6 => '11:20', 7 => '12:00', 8 => '13:40', 9 => '14:20', 10 => '15:00'],
            'Rabu' => [1 => '07:30', 2 => '08:10', 3 => '08:50', 4 => '09:30', 5 => '10:40', 6 => '11:20', 7 => '12:00', 8 => '13:40', 9 => '14:20', 10 => '15:00'],
            'Kamis' => [1 => '07:30', 2 => '08:10', 3 => '08:50', 4 => '09:30', 5 => '10:40', 6 => '11:20', 7 => '12:00', 8 => '13:40', 9 => '14:20', 10 => '15:00'],
            'Jumat' => [1 => '07:30', 2 => '08:10', 3 => '08:50', 4 => '09:30', 5 => '10:25', 6 => '11:05', 7 => '11:45', 8 => '15:00', 9 => '15:00', 10 => '15:00'],
        ];
        $day = $this->day ?? 'Senin';
        return $times[$day][$this->period_end] ?? '08:10';
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function invalRequests(): HasMany
    {
        return $this->hasMany(InvalRequest::class);
    }
}
