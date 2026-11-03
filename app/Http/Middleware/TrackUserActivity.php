<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            try {
                $user = auth()->user();
                if (!$user->last_seen_at || $user->last_seen_at->lt(now()->subSeconds(30))) {
                    \App\Models\User::where('id', $user->id)->update([
                        'last_seen_at' => now(),
                    ]);
                }
            } catch (\Throwable $e) {
                // Jangan gagalkan request utama jika pembaruan aktivitas pengguna bermasalah
                report($e);
            }
        }

        return $next($request);
    }
}
