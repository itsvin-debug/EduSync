<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentLeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'classroom_id',
        'homeroom_teacher_id',
        'type', // sakit, izin, dispensasi
        'start_date',
        'end_date',
        'proof_image',
        'notes',
        'status', // pending, approved, rejected
        'reviewed_by_teacher_id',
        'reviewed_by_user_id',
        'rejection_note',
        'reviewed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'verifier_label',
        'proof_image_url',
    ];

    public function getProofImageUrlAttribute(): ?string
    {
        if (!$this->proof_image) {
            return null;
        }
        if (str_starts_with($this->proof_image, 'http') || str_starts_with($this->proof_image, '/storage/')) {
            return $this->proof_image;
        }
        return '/storage/' . $this->proof_image;
    }

    public function getVerifierLabelAttribute(): string
    {
        if ($this->status !== 'approved' && $this->status !== 'rejected') {
            return 'Menunggu Verifikasi';
        }

        if (str_contains($this->rejection_note ?? '', 'Otomatis oleh Sistem') || (!$this->reviewed_by_user_id && !$this->reviewed_by_teacher_id && $this->status === 'approved')) {
            return 'Disetujui Otomatis oleh Sistem (Batas 13:00 WIB)';
        }

        if ($this->reviewedByUser) {
            $user = $this->reviewedByUser;
            if ($user->role === 'guru') {
                return 'Disetujui oleh Wali Kelas: ' . $user->name;
            } elseif ($user->is_class_leader || $user->sub_role === 'Ketua Kelas') {
                return 'Diverifikasi oleh Ketua Kelas: ' . $user->name;
            } elseif ($user->role === 'admin') {
                return 'Disetujui oleh Admin: ' . $user->name;
            }
            return 'Diverifikasi oleh: ' . $user->name;
        }

        if ($this->reviewedByTeacher) {
            return 'Disetujui oleh Wali Kelas: ' . $this->reviewedByTeacher->name;
        }

        return 'Disetujui Otomatis oleh Sistem (Batas 13:00 WIB)';
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id');
    }

    public function reviewedByTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'reviewed_by_teacher_id');
    }

    public function reviewedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
