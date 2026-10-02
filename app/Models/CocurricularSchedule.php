<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CocurricularSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'week_range',
        'activity_name',
        'day_name',
        'date',
        'class_name',
        'classroom_id',
        'time_start',
        'time_end',
        'location',
        'description',
        'status',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}
