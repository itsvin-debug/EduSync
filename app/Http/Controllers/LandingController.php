<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\Schedule;
use Inertia\Inertia;

use App\Models\CocurricularSchedule;

class LandingController extends Controller
{
    public function index()
    {
        $departments = Department::withCount('classrooms')->get();
        $classrooms = Classroom::with([
            'department',
            'homeroomTeacher',
            'room',
            'schedules' => function ($q) {
                $q->with(['subject', 'teacher', 'room'])->orderBy('day')->orderBy('period_start');
            }
        ])->orderBy('grade')->orderBy('name')->get();
        $teachers = Teacher::whereNotNull('name')->take(8)->get();
        $totalSchedules = Schedule::count();
        $totalTeachers = Teacher::distinct('name')->count();
        $totalClassrooms = Classroom::count();

        $featuredSchedules = Schedule::with(['classroom.department', 'subject', 'teacher', 'room'])
            ->where('period_start', '>=', 2)
            ->take(12)
            ->get();

        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));

        $todayKoku = CocurricularSchedule::with('classroom.department')
            ->whereDate('date', $today)
            ->first();

        $tomorrowKoku = CocurricularSchedule::with('classroom.department')
            ->whereDate('date', $tomorrow)
            ->first();

        $nextUpcomingKoku = CocurricularSchedule::with('classroom.department')
            ->whereDate('date', '>', $today)
            ->orderBy('date')
            ->first();

        $upcomingKokus = CocurricularSchedule::with('classroom.department')
            ->whereDate('date', '>=', $today)
            ->orderBy('date')
            ->take(6)
            ->get();

        if ($upcomingKokus->isEmpty()) {
            $upcomingKokus = CocurricularSchedule::with('classroom.department')
                ->orderBy('date')
                ->take(6)
                ->get();
        }

        $allKokus = CocurricularSchedule::with('classroom.department')
            ->orderBy('date')
            ->get();

        $month = (int) date('n');
        $year = (int) date('Y');
        $academicYear = $month >= 7 ? "{$year}/" . ($year + 1) . " Ganjil" : ($year - 1) . "/{$year} Genap";

        return Inertia::render('Landing/Index', [
            'departments' => $departments,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'featuredSchedules' => $featuredSchedules,
            'cocurricular' => [
                'today' => $todayKoku,
                'tomorrow' => $tomorrowKoku,
                'next_upcoming' => $nextUpcomingKoku,
                'upcoming' => $upcomingKokus,
                'all' => $allKokus,
                'current_date' => $today,
            ],
            'stats' => [
                'total_schedules' => $totalSchedules,
                'total_teachers' => $totalTeachers,
                'total_classrooms' => $totalClassrooms,
                'academic_year' => $academicYear,
            ],
        ]);
    }
}
