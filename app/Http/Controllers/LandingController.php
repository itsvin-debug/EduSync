<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\Schedule;
use Inertia\Inertia;

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

        return Inertia::render('Landing/Index', [
            'departments' => $departments,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'featuredSchedules' => $featuredSchedules,
            'stats' => [
                'total_schedules' => $totalSchedules,
                'total_teachers' => $totalTeachers,
                'total_classrooms' => $totalClassrooms,
                'academic_year' => '2024/2025 Genap',
            ],
        ]);
    }
}
