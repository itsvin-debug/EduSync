<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\AuditLog;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Automated scheduled task / cron job to reset daily duty checklist statuses every midnight (12:00 AM / 24:00)
 */
Artisan::command('edusync:reset-duty', function () {
    $now = Carbon::now('Asia/Jakarta');
    AuditLog::create([
        'action' => 'DUTY_CHECKLIST_MIDNIGHT_RESET',
        'description' => "Automated midnight cron executed at {$now->toDateTimeString()} WIB: Daily class duty checklist reset for a new school day.",
    ]);
    $this->info("Class duty checklist successfully reset for date: {$now->toDateString()}");
})->purpose('Reset daily duty checklist statuses every midnight');

Schedule::command('edusync:reset-duty')->dailyAt('00:00');

