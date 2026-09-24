<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\Department;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin') return redirect()->route('admin.dashboard');
            if ($user->role === 'guru') return redirect()->route('guru.dashboard');
            return redirect()->route('siswa.dashboard');
        }

        $classrooms = Classroom::with('department')->orderBy('grade')->orderBy('name')->get();
        $departments = Department::all();

        return Inertia::render('Auth/Login', [
            'classrooms' => $classrooms,
            'departments' => $departments,
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            if ($user->role === 'admin') {
                return redirect()->intended(route('admin.dashboard'))->with('success', 'Selamat datang di Control Center EDUSYNC Admin!');
            }
            if ($user->role === 'guru') {
                return redirect()->intended(route('guru.dashboard'))->with('success', 'Selamat datang di Ruang Kerja Guru!');
            }
            return redirect()->intended(route('siswa.dashboard'))->with('success', 'Selamat datang di Dashboard Siswa!');
        }

        return back()->withErrors([
            'email' => 'Kombinasi email dan kata sandi yang Anda masukkan tidak sesuai.',
        ])->onlyInput('email');
    }

    public function quickLogin($role)
    {
        $user = match($role) {
            'admin' => User::where('role', 'admin')->first(),
            'guru' => User::where('role', 'guru')->where('sub_role', '!=', 'Wali Kelas')->first() ?? User::where('role', 'guru')->first(),
            'wali' => User::where('role', 'guru')->where('sub_role', 'Wali Kelas')->first() ?? User::where('role', 'guru')->first(),
            'siswa' => User::where('role', 'siswa')->first(),
            default => null,
        };

        if ($user) {
            Auth::login($user);
            request()->session()->regenerate();

            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard')->with('success', 'Masuk sebagai Administrator Kurikulum');
            }
            if ($user->role === 'guru') {
                return redirect()->route('guru.dashboard')->with('success', 'Masuk sebagai ' . $user->name);
            }
            return redirect()->route('siswa.dashboard')->with('success', 'Masuk sebagai ' . $user->name);
        }

        return redirect()->route('login')->with('error', 'Akun demo peran tersebut belum terdaftar.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Anda telah berhasil keluar dari sistem EDUSYNC.');
    }
}
