<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // admin, guru, siswa
        'sub_role',
        'nisn',
        'attendance_number',
        'nip',
        'phone',
        'avatar',
        'teacher_id',
        'classroom_id',
        'department_id',
        'status',
        'is_class_leader',
        'two_factor_enabled',
        'two_factor_code',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
    ];

    protected $appends = [
        'is_online',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'password' => 'hashed',
            'is_class_leader' => 'boolean',
            'two_factor_enabled' => 'boolean',
        ];
    }

    public function getIsOnlineAttribute(): bool
    {
        if ($this->last_seen_at && $this->last_seen_at->gt(now()->subMinutes(5))) {
            return true;
        }

        return \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $this->id)
            ->where('last_activity', '>=', now()->subMinutes(5)->getTimestamp())
            ->exists();
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function picketReports(): HasMany
    {
        return $this->hasMany(PicketReport::class, 'student_id');
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(StudentLeaveRequest::class, 'student_id');
    }
}
