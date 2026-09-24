<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Schedule;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->load(['teacher', 'classroom.department', 'department']);
            if (!$user->teacher && $user->role === 'guru') {
                $teacher = \App\Models\Teacher::where('user_id', $user->id)->first() ?? \App\Models\Teacher::where('name', $user->name)->first();
                if ($teacher) {
                    $user->setRelation('teacher', $teacher);
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'app' => [
                'name' => config('app.name', 'EDUSYNC'),
                'academic_year' => '2024/2025',
                'semester' => 'Genap',
                'version' => 'v3.4.2',
            ],
        ];
    }
}
