<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'period_number',
        'day_type',
        'name',
        'start_time',
        'end_time',
        'is_break',
        'label',
    ];
}
