import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    GraduationCap,
    ShieldCheck,
    UserCheck,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Lock,
    Mail,
    Phone,
    School,
    UserPlus,
    LogIn,
    AlertCircle,
    Building2,
    Hash,
    BadgeCheck,
    KeyRound,
} from 'lucide-react';
import Toast from '@/Components/Toast';

export default function Login({ classrooms = [], departments = [], currentUser = null }) {
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'reset'
    const [selectedRole, setSelectedRole] = useState('siswa'); // 'siswa', 'guru', 'admin'
    const [showPassword, setShowPassword] = useState(false);

    // Login Form State
    const {
        data: loginData,
        setData: setLoginData,
        post: postLogin,
        processing: loginProcessing,
        errors: loginErrors,
    } = useForm({
        email: 'siswa@edusync.sch.id',
        password: 'password',
        remember: true,
    });

    // Register Form State
    const {
        data: regData,
        setData: setRegData,
        post: postRegister,
        processing: regProcessing,
        errors: regErrors,
        reset: resetRegister,
    } = useForm({
        role: 'siswa',
        name: '',
        email: '',
        password: '',
        nisn: '',
        nip: '',
        classroom_id: classrooms[0]?.id || '',
        department_id: departments[0]?.id || '',
        title: 'Guru Pengampu',
        phone: '',
        student_role: 'siswa_biasa',
    });

    // Password Reset State
    const {
        data: resetData,
        setData: setResetData,
        post: postReset,
        processing: resetProcessing,
        errors: resetErrors,
        reset: resetPasswordForm,
    } = useForm({
        email: '',
    });

    const handleRoleSwitch = (role) => {
        setSelectedRole(role);
        setRegData('role', role);

        if (role === 'siswa') {
            setLoginData('email', 'siswa@edusync.sch.id');
        } else if (role === 'guru') {
            setLoginData('email', 'guru@edusync.sch.id');
        } else if (role === 'admin') {
            setLoginData('email', 'admin@edusync.sch.id');
        }
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        postLogin('/login');
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        postRegister('/register', {
            onSuccess: () => {
                resetRegister();
                setAuthMode('login');
            },
        });
    };

    const handleResetSubmit = (e) => {
        e.preventDefault();
        postReset('/password/reset', {
            onSuccess: () => {
                resetPasswordForm();
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
            <Head
                title={
                    authMode === 'login'
                        ? 'Masuk ke Portal — EDUSYNC'
                        : authMode === 'register'
                        ? 'Daftar Akun Baru — EDUSYNC'
                        : 'Reset Kata Sandi — EDUSYNC'
                }
            />
            <Toast />

            {/* HEADER NAVBAR */}
            <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            E
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 tracking-tight leading-none text-base">
                                EDUSYNC
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                                Portal Akademik SMKN 1 Ciomas
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-3 text-xs">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-semibold transition-colors duration-200 ease-bouncy bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>Server Aktif</span>
                        </span>
                    </nav>
                </div>
            </header>

            {/* MAIN CONTENT CONTAINER */}
            <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[560px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col">
                    {/* Top Row: Prominent Back to Home Button on Card */}
                    <div className="flex items-center justify-between w-full mb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-all duration-200 ease-bouncy shadow-2xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        {currentUser && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                Sesi Aktif: {currentUser.role}
                            </span>
                        )}
                    </div>

                    {/* Active Session Notice Banner (If user has existing session) */}
                    {currentUser && (
                        <div className="mb-5 p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-slate-800 shadow-xs">
                            <div>
                                <div className="text-[10px] uppercase font-bold text-indigo-400">
                                    Sesi Akun Sedang Masuk
                                </div>
                                <div className="font-semibold text-white mt-0.5">
                                    {currentUser.name} ({currentUser.sub_role || currentUser.role})
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/dashboard"
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors duration-200 ease-bouncy flex items-center gap-1"
                                >
                                    <span>Ke Dashboard</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors duration-200 ease-bouncy"
                                >
                                    Keluar / Ganti Akun
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Header Branding */}
                    <div className="flex flex-col items-center text-center">


                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {authMode === 'login'
                                ? 'Selamat Datang di EduSync'
                                : authMode === 'register'
                                ? 'Pendaftaran Akun Baru'
                                : 'Atur Ulang Kata Sandi'}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            {authMode === 'login'
                                ? 'Pilih peran Anda dan masukkan akun untuk mengakses portal.'
                                : authMode === 'register'
                                ? 'Akun baru akan diverifikasi oleh Admin Kurikulum sebelum dapat digunakan.'
                                : 'Masukkan email terdaftar Anda untuk mengatur ulang kata sandi.'}
                        </p>
                    </div>

                    {/* Mode Switcher: Masuk vs Daftar Baru vs Reset */}
                    {authMode !== 'reset' ? (
                        <div className="w-full h-11 p-1 bg-slate-100 rounded-xl my-5 grid grid-cols-2 gap-1 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setAuthMode('login')}
                                className={`h-full flex items-center justify-center gap-2 rounded-lg transition-all duration-200 ease-bouncy ${
                                    authMode === 'login'
                                        ? 'bg-white text-indigo-700 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Masuk ke Akun</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMode('register');
                                    if (selectedRole === 'admin') setSelectedRole('siswa');
                                }}
                                className={`h-full flex items-center justify-center gap-2 rounded-lg transition-all duration-200 ease-bouncy ${
                                    authMode === 'register'
                                        ? 'bg-white text-indigo-700 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Daftar Akun Baru</span>
                            </button>
                        </div>
                    ) : (
                        <div className="my-5 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setAuthMode('login')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Kembali ke Halaman Masuk</span>
                            </button>
                        </div>
                    )}

                    {/* Role Selector Tabs (Only on Login & Register) */}
                    {authMode !== 'reset' && (
                        <div
                            className="w-full h-11 p-1 bg-slate-100/80 rounded-xl mb-5 grid gap-1 transition-all duration-200 ease-bouncy"
                            style={{
                                gridTemplateColumns:
                                    authMode === 'login' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => handleRoleSwitch('siswa')}
                                className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-bouncy ${
                                    selectedRole === 'siswa'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <GraduationCap className="w-4 h-4 text-indigo-600" />
                                <span>Siswa</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleSwitch('guru')}
                                className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-bouncy ${
                                    selectedRole === 'guru'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <UserCheck className="w-4 h-4 text-indigo-600" />
                                <span>Guru</span>
                            </button>
                            {authMode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => handleRoleSwitch('admin')}
                                    className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-bouncy ${
                                        selectedRole === 'admin'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                    <span>Admin</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* A. FORM MASUK (LOGIN) */}
                    {/* ========================================================= */}
                    {authMode === 'login' && (
                        <div>
                            {/* 1-Click Demo Shortcut Pill */}
                            {selectedRole === 'siswa' ? (
                                <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5 text-xs">
                                    <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="font-semibold text-slate-800">Pilih Akun Demo Siswa:</span>
                                        </div>
                                        <span className="text-[10px] text-indigo-600 font-medium">Uji Peran Terpisah</span>
                                    </div>

                                    {/* Option A: Ketua Kelas */}
                                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-100">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-800">Ahmad Fauzan</span>
                                                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                                                    ⭐ Ketua Kelas XI PPLG 1
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Ada fitur Presensi Harian Kelas (Absensi) & Piket
                                            </p>
                                        </div>
                                        <a
                                            href="/quick-login/ketua-kelas"
                                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors duration-200 ease-bouncy shrink-0 ml-2"
                                        >
                                            <span>Masuk</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </a>
                                    </div>

                                    {/* Option B: Siswa Biasa */}
                                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-800">Bintang Aditya</span>
                                                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                                    Siswa Biasa XI PPLG 1
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Tanpa fitur absensi kelas (hanya izin/sakit & jadwal)
                                            </p>
                                        </div>
                                        <a
                                            href="/quick-login/siswa-biasa"
                                            className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors duration-200 ease-bouncy shrink-0 ml-2"
                                        >
                                            <span>Masuk</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-slate-700">
                                            Akun demo siap pakai:{' '}
                                            <strong className="text-indigo-700">
                                                {selectedRole === 'guru'
                                                    ? 'Rizky Muhamad Ramdan, S.Kom'
                                                    : 'Operator Kurikulum'}
                                            </strong>
                                        </span>
                                    </div>
                                    <a
                                        href={
                                            selectedRole === 'guru'
                                                ? '/quick-login/guru'
                                                : '/quick-login/admin'
                                        }
                                        className="font-bold text-indigo-700 hover:underline flex items-center gap-1 shrink-0 ml-2"
                                    >
                                        <span>1-Klik Masuk</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Email Akun ({selectedRole.toUpperCase()})
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData('email', e.target.value)}
                                            required
                                            placeholder="nama@edusync.sch.id"
                                            className="w-full h-11 px-3.5 pl-9 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 ease-bouncy"
                                        />
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                    {loginErrors.email && (
                                        <span className="text-rose-500 text-[11px] mt-1 block font-medium">
                                            {loginErrors.email}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-semibold uppercase tracking-wider text-slate-700 text-[11px]">
                                            Kata Sandi
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('reset')}
                                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 ease-bouncy"
                                        >
                                            Lupa kata sandi?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={loginData.password}
                                            onChange={(e) => setLoginData('password', e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="w-full h-11 px-3.5 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 ease-bouncy"
                                        />
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {loginErrors.password && (
                                        <span className="text-rose-500 text-[11px] mt-1 block font-medium">
                                            {loginErrors.password}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={loginData.remember}
                                            onChange={(e) => setLoginData('remember', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Ingat sesi saya</span>
                                    </label>
                                    <span className="text-slate-400 text-[11px]">
                                        Default sandi: <strong className="text-slate-600">password</strong>
                                    </span>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loginProcessing}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <span>{loginProcessing ? 'Memproses Masuk...' : 'Masuk ke Portal'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <Link
                                        href="/"
                                        className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Kembali ke Halaman Beranda</span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* B. FORM DAFTAR AKUN BARU (REGISTER & VERIFICATION NOTICE) */}
                    {/* ========================================================= */}
                    {authMode === 'register' && (
                        <div>
                            {/* Security Notice for Verifying Accounts */}
                            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-amber-800">Verifikasi Keamanan Wajib</p>
                                    <p className="text-[11px] text-amber-700 mt-0.5">
                                        Untuk mencegah pihak luar mendaftar akun tidak sah, akun baru Anda akan berstatus <strong>Menunggu Persetujuan Admin Kurikulum</strong> sebelum dapat masuk.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                                {/* Common: Full Name */}
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Nama Lengkap {selectedRole === 'guru' && '& Gelar'}{' '}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={regData.name}
                                        onChange={(e) => setRegData('name', e.target.value)}
                                        required
                                        placeholder={
                                            selectedRole === 'siswa'
                                                ? 'Contoh: Ahmad Fauzan Pratama'
                                                : 'Contoh: Drs. Hendra Gunawan, M.Pd'
                                        }
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {regErrors.name && (
                                        <span className="text-rose-500 text-[11px] mt-1 block">
                                            {regErrors.name}
                                        </span>
                                    )}
                                </div>

                                {/* SISWA FIELDS */}
                                {selectedRole === 'siswa' && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                                    NISN Siswa <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={regData.nisn}
                                                    onChange={(e) => setRegData('nisn', e.target.value)}
                                                    required
                                                    maxLength={15}
                                                    placeholder="10 digit NISN"
                                                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                                {regErrors.nisn && (
                                                    <span className="text-rose-500 text-[11px] mt-1 block">
                                                        {regErrors.nisn}
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                                    Kelas / Rombel <span className="text-rose-500">*</span>
                                                </label>
                                                <select
                                                    value={regData.classroom_id}
                                                    onChange={(e) => setRegData('classroom_id', e.target.value)}
                                                    required
                                                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    {classrooms.map((cls) => (
                                                        <option key={cls.id} value={cls.id}>
                                                            {cls.name} ({cls.department?.code || 'SMK'})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* PILIHAN PERAN SISWA: KETUA KELAS ATAU SISWA BIASA */}
                                        <div>
                                            <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1.5 text-[11px]">
                                                Peran Siswa <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <label
                                                    onClick={() => setRegData('student_role', 'siswa_biasa')}
                                                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all duration-200 ease-bouncy ${
                                                        regData.student_role === 'siswa_biasa'
                                                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                                                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.97] will-change-transform text-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold">Siswa Biasa</span>
                                                        <input
                                                            type="radio"
                                                            name="student_role"
                                                            value="siswa_biasa"
                                                            checked={regData.student_role === 'siswa_biasa'}
                                                            onChange={() => setRegData('student_role', 'siswa_biasa')}
                                                            className="text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <span className="text-[11px] text-slate-500 leading-tight">
                                                        Akses jadwal KBM, melihat tugas modul, dan pengajuan izin/sakit mandiri (tanpa fitur absensi kelas).
                                                    </span>
                                                </label>

                                                <label
                                                    onClick={() => setRegData('student_role', 'ketua_kelas')}
                                                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all duration-200 ease-bouncy ${
                                                        regData.student_role === 'ketua_kelas'
                                                            ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold shadow-xs'
                                                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.97] will-change-transform text-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold flex items-center gap-1 text-amber-900">
                                                            <span>Ketua Kelas</span>
                                                            <span className="text-xs">⭐</span>
                                                        </span>
                                                        <input
                                                            type="radio"
                                                            name="student_role"
                                                            value="ketua_kelas"
                                                            checked={regData.student_role === 'ketua_kelas'}
                                                            onChange={() => setRegData('student_role', 'ketua_kelas')}
                                                            className="text-amber-600 focus:ring-amber-500"
                                                        />
                                                    </div>
                                                    <span className="text-[11px] text-slate-500 leading-tight">
                                                        Hak istimewa: mengelola presensi harian kelas (absensi siswa), lapor piket, dan menerima tugas guru.
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* GURU FIELDS */}
                                {selectedRole === 'guru' && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                                    NIP (Opsional / Guru Non-PNS kosongkan)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={regData.nip}
                                                    onChange={(e) => setRegData('nip', e.target.value)}
                                                    placeholder="197508122000031001"
                                                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                                    Konsentrasi Keahlian / Jurusan
                                                </label>
                                                <select
                                                    value={regData.department_id}
                                                    onChange={(e) => setRegData('department_id', e.target.value)}
                                                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="">Guru Umum / Muatan Nasional</option>
                                                    {departments.map((dept) => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.name} [{dept.code}]
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                                Jabatan / Gelar Tugas
                                            </label>
                                            <input
                                                type="text"
                                                value={regData.title}
                                                onChange={(e) => setRegData('title', e.target.value)}
                                                placeholder="Guru Produktif Kejuruan / Wali Kelas"
                                                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Common: Email & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                            Email Aktif <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={regData.email}
                                            onChange={(e) => setRegData('email', e.target.value)}
                                            required
                                            placeholder="email@sekolah.sch.id"
                                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        {regErrors.email && (
                                            <span className="text-rose-500 text-[11px] mt-1 block">
                                                {regErrors.email}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                            No. WhatsApp / HP
                                        </label>
                                        <input
                                            type="text"
                                            value={regData.phone}
                                            onChange={(e) => setRegData('phone', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Common: Password */}
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Kata Sandi Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={regData.password}
                                            onChange={(e) => setRegData('password', e.target.value)}
                                            required
                                            placeholder="Minimal 6 karakter"
                                            className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {regErrors.password && (
                                        <span className="text-rose-500 text-[11px] mt-1 block">
                                            {regErrors.password}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={regProcessing}
                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <span>
                                            {regProcessing ? 'Mendaftarkan Akun...' : 'Ajukan Pendaftaran Akun'}
                                        </span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <Link
                                        href="/"
                                        className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Kembali ke Halaman Beranda</span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* C. FORM LUPA KATA SANDI (PASSWORD RESET) */}
                    {/* ========================================================= */}
                    {authMode === 'reset' && (
                        <div className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex gap-2.5 items-start">
                                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-indigo-800">
                                        Pemulihan Akses Akun Sekolah
                                    </p>
                                    <p className="text-[11px] text-indigo-700 mt-0.5">
                                        Masukkan email akun Anda. Sistem akan mengatur ulang kata sandi Anda ke kata sandi standar (<strong>password</strong>).
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleResetSubmit} className="space-y-4">
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Alamat Email Terdaftar <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={resetData.email}
                                            onChange={(e) => setResetData('email', e.target.value)}
                                            required
                                            placeholder="nama@edusync.sch.id"
                                            className="w-full h-11 px-3.5 pl-9 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                    {resetErrors.email && (
                                        <span className="text-rose-500 text-[11px] mt-1 block font-medium">
                                            {resetErrors.email}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={resetProcessing}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <span>
                                            {resetProcessing
                                                ? 'Memproses Reset...'
                                                : 'Atur Ulang Kata Sandi Akun'}
                                        </span>
                                        <KeyRound className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('login')}
                                        className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2"
                                    >
                                        <span>Kembali ke Halaman Masuk</span>
                                    </button>

                                    <Link
                                        href="/"
                                        className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors duration-200 ease-bouncy flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Kembali ke Beranda Utama</span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Helpdesk link */}
                    <div className="mt-6 text-center pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">
                            Kendala akun atau verifikasi tertunda? Hubungi Koordinator Kurikulum & Dapodik Sekolah.
                        </span>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-[11px] uppercase tracking-wide text-slate-700">
                            Sistem Terverifikasi Dapodik & Kemendikbudristek
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                        © 2026 EDUSYNC SMKN 1 Ciomas. Hak Cipta Dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
