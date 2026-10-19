<?php

namespace App\Services;

use App\Models\StudentLeaveRequest;
use App\Models\StudentAttendance;
use Carbon\Carbon;

class AutoAttendanceService
{
    /**
     * Check and auto-approve pending leave requests when past 13:00 WIB
     */
    public static function checkAndAutoApproveLeaves(): int
    {
        $nowJakarta = Carbon::now('Asia/Jakarta');
        if ($nowJakarta->hour < 13) {
            return 0;
        }

        $today = $nowJakarta->toDateString();
        $pendingLeaves = StudentLeaveRequest::where('status', 'pending')
            ->whereDate('start_date', '<=', $today)
            ->get();

        $count = 0;
        foreach ($pendingLeaves as $leave) {
            $leave->update([
                'status' => 'approved',
                'reviewed_by_user_id' => null,
                'rejection_note' => 'Disetujui Otomatis oleh Sistem (Batas 13:00 WIB)',
                'reviewed_at' => now(),
            ]);

            $start = Carbon::parse($leave->start_date);
            $end = Carbon::parse($leave->end_date);
            $typeStatus = in_array($leave->type, ['sakit', 'izin', 'dispensasi']) ? $leave->type : 'izin';

            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                if ($date->isWeekend()) {
                    continue;
                }

                StudentAttendance::updateOrCreate(
                    [
                        'user_id' => $leave->student_id,
                        'date' => $date->toDateString(),
                    ],
                    [
                        'classroom_id' => $leave->classroom_id,
                        'submitted_by_user_id' => null,
                        'status' => $typeStatus,
                        'notes' => "Surat {$leave->type} disetujui otomatis oleh sistem (Batas 13:00 WIB): " . ($leave->notes ?? '-'),
                        'submitted_time' => '13:00 WIB',
                        'is_locked' => true,
                        'overridden_by_admin' => true,
                    ]
                );
            }
            $count++;
        }

        return $count;
    }
}
