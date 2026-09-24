<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\Department;
use App\Models\AuditLog;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->status !== 'active') {
                Auth::logout();
                request()->session()->invalidate();
                request()->session()->regenerateToken();
                return redirect()->route('login')->withErrors(['email' => 'Akun Anda tidak aktif atau sedang menunggu verifikasi oleh Admin Kurikulum.']);
            }
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
            $user = Auth::user();

            // Verification & Status Check
            if ($user->status === 'pending_verification') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'Akun Anda sedang dalam proses verifikasi oleh Admin Kurikulum. Mohon menunggu persetujuan sebelum dapat masuk ke sistem.',
                ])->onlyInput('email');
            }

            if ($user->status === 'rejected') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'Pendaftaran akun Anda telah ditolak oleh Admin Kurikulum. Silakan hubungi bagian TU/Kurikulum.',
                ])->onlyInput('email');
            }

            if ($user->status === 'inactive') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'Akun Anda saat ini berstatus non-aktif. Silakan hubungi Administrator Sekolah.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'USER_LOGIN',
                'description' => "Pengguna {$user->name} ({$user->role}) berhasil masuk ke sistem.",
                'ip_address' => $request->ip(),
            ]);

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

    public function register(Request $request)
    {
        $role = $request->input('role', 'siswa');

        if ($role === 'siswa') {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'nisn' => 'required|string|max:20|unique:users,nisn',
                'classroom_id' => 'required|exists:classrooms,id',
                'phone' => 'nullable|string|max:20',
            ]);

            $classroom = Classroom::findOrFail($validated['classroom_id']);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'siswa',
                'sub_role' => 'Siswa',
                'nisn' => $validated['nisn'],
                'phone' => $validated['phone'] ?? null,
                'classroom_id' => $classroom->id,
                'department_id' => $classroom->department_id,
                'status' => 'pending_verification',
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'STUDENT_REGISTERED',
                'description' => "Pendaftaran akun siswa baru oleh {$user->name} ({$classroom->name}), menunggu verifikasi.",
                'ip_address' => $request->ip(),
            ]);

            return back()->with('success', 'Pendaftaran akun siswa berhasil diajukan! Akun Anda sedang menunggu verifikasi oleh Admin Kurikulum untuk mencegah akun tidak sah.');
        }

        if ($role === 'guru') {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'nip' => 'nullable|string|max:30',
                'department_id' => 'nullable|exists:departments,id',
                'title' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:20',
            ]);

            // Check if teacher record already exists with same name/nip or create new
            $teacher = null;
            if (!empty($validated['nip'])) {
                $teacher = Teacher::where('nip', $validated['nip'])->first();
            }
            if (!$teacher) {
                $teacher = Teacher::where('name', $validated['name'])->first();
            }

            if (!$teacher) {
                // Generate a code for new teacher
                $lastId = Teacher::max('id') ?? 0;
                $teacherCode = ($lastId + 1) . 'A';
                $teacher = Teacher::create([
                    'code' => $teacherCode,
                    'name' => $validated['name'],
                    'nip' => $validated['nip'] ?? null,
                    'phone' => $validated['phone'] ?? null,
                    'email' => $validated['email'],
                    'title' => $validated['title'] ?? 'Guru Pengampu',
                    'department_id' => $validated['department_id'] ?? null,
                    'status' => 'active',
                ]);
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'guru',
                'sub_role' => $validated['title'] ?? ($teacher->title ?? 'Guru Pengampu'),
                'nip' => $validated['nip'] ?? $teacher->nip,
                'phone' => $validated['phone'] ?? $teacher->phone,
                'teacher_id' => $teacher->id,
                'department_id' => $validated['department_id'] ?? $teacher->department_id,
                'status' => 'pending_verification',
            ]);

            $teacher->update([
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'TEACHER_REGISTERED',
                'description' => "Pendaftaran akun guru baru oleh {$user->name}, menunggu verifikasi kurikulum.",
                'ip_address' => $request->ip(),
            ]);

            return back()->with('success', 'Pendaftaran akun guru berhasil diajukan! Akun Anda sedang menunggu verifikasi oleh Admin Kurikulum.');
        }

        return back()->withErrors(['email' => 'Peran pendaftaran tidak valid.']);
    }

    public function quickLogin($role)
    {
        $user = match($role) {
            'admin' => User::where('role', 'admin')->where('status', 'active')->first(),
            'guru' => User::where('role', 'guru')->where('status', 'active')->where('sub_role', '!=', 'Wali Kelas')->first() ?? User::where('role', 'guru')->where('status', 'active')->first(),
            'wali' => User::where('role', 'guru')->where('status', 'active')->where('sub_role', 'Wali Kelas')->first() ?? User::where('role', 'guru')->where('status', 'active')->first(),
            'siswa' => User::where('role', 'siswa')->where('status', 'active')->first(),
            default => null,
        };

        if ($user) {
            Auth::login($user);
            request()->session()->regenerate();

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'DEMO_QUICK_LOGIN',
                'description' => "Quick-login 1-klik sebagai {$user->name} ({$user->role})",
                'ip_address' => request()->ip(),
            ]);

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
