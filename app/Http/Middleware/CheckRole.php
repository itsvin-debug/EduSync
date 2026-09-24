<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login')->withErrors(['email' => 'Silakan masuk ke akun Anda terlebih dahulu.']);
        }

        $user = Auth::user();

        // 1. Check account verification status
        if ($user->status !== 'active') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $message = match($user->status) {
                'pending_verification' => 'Akun Anda sedang dalam proses verifikasi oleh Admin Kurikulum. Mohon menunggu persetujuan.',
                'rejected' => 'Pendaftaran akun Anda telah ditolak oleh Admin Kurikulum.',
                default => 'Akun Anda dinonaktifkan. Silakan hubungi Administrator Sekolah.',
            };

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return redirect()->route('login')->withErrors(['email' => $message]);
        }

        // 2. Parse allowed roles (supports comma-separated string e.g. 'role:guru,admin' or separate parameters)
        $allowedRoles = [];
        foreach ($roles as $role) {
            foreach (explode(',', $role) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        if (!in_array($user->role, $allowedRoles, true)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Anda tidak memiliki hak akses ke halaman ini.'], 403);
            }
            abort(403, 'Akses Ditolak: Anda tidak memiliki izin untuk mengakses portal ini.');
        }

        return $next($request);
    }
}
