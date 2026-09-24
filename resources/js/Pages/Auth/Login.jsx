import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    GraduationCap,
    ShieldCheck,
    UserCheck,
    Eye,
    EyeOff,
    ArrowRight,
    School,
    CheckCircle2,
    Check,
    Lock,
    Mail,
    Phone,
    Plus,
    X,
    Hash,
    HelpCircle,
} from 'lucide-react';
import Toast from '@/Components/Toast';

export default function Login({ classrooms = [], departments = [] }) {
    const [selectedRole, setSelectedRole] = useState('siswa'); // 'siswa', 'guru', 'admin'
    const [showPassword, setShowPassword] = useState(false);
    const [teacherTags, setTeacherTags] = useState(['Pemrograman Web & REST API', 'Cloud Architecture']);

    const { data, setData, post, processing, errors } = useForm({
        email: 'siswa@edusync.sch.id',
        password: 'password',
        remember: true,
        nisn: '006841289',
        name: 'Muhammad Farhan',
        classroom_id: classrooms[0]?.id || '',
        phone: '081234567890',
        nip: '198204122008011005',
    });

    const handleRoleSwitch = (role) => {
        setSelectedRole(role);
        if (role === 'siswa') {
            setData('email', 'siswa@edusync.sch.id');
        } else if (role === 'guru') {
            setData('email', 'guru@edusync.sch.id');
        } else if (role === 'admin') {
            setData('email', 'admin@edusync.sch.id');
        }
    };

    const handleAddTag = () => {
        const newTag = prompt('Masukkan nama mata pelajaran / modul kejuruan:');
        if (newTag && newTag.trim()) {
            setTeacherTags([...teacherTags, newTag.trim()]);
        }
    };

    const handleRemoveTag = (index) => {
        setTeacherTags(teacherTags.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
            <Head title="Masuk ke Portal — EDUSYNC SMK Negeri" />
            <Toast />

            {/* 1. FIXED TOP NAVBAR (Stitch Screen 3) */}
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
                                Portal SMK Negeri
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4 text-xs">
                        <Link
                            href="/"
                            className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                            Kembali ke Beranda
                        </Link>
                        <a
                            href="#bantuan"
                            className="text-slate-600 hover:text-slate-900 font-medium transition-colors hidden sm:block"
                        >
                            Pusat Bantuan
                        </a>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                            E
                        </div>
                    </nav>
                </div>
            </header>

            {/* 2. MAIN CENTER FORM CONTAINER (Stitch Screen 3) */}
            <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[560px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col">
                    {/* Institutional Branding Header */}
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Portal Resmi Vokasi Kemendikbudristek</span>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-slate-900 p-2 flex items-center justify-center mb-3 shadow-sm">
                            <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
                                <rect width="120" height="120" rx="24" fill="#0F172A" />
                                <path d="M30 40H90V48H30V40Z" fill="#FFFFFF" />
                                <path d="M30 56H72V64H30V56Z" fill="#4F46E5" />
                                <path d="M30 72H84V80H30V72Z" fill="#94A3B8" />
                                <circle cx="86" cy="60" r="6" fill="#4F46E5" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Selamat Datang di Portal EduSync
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Silakan masuk sesuai peran Anda di lingkungan akademik SMK Negeri.
                        </p>
                    </div>

                    {/* Segmented Role Selector (Stitch Screen 3) */}
                    <div className="w-full h-12 p-1.5 bg-slate-100 rounded-xl my-6 grid grid-cols-3 gap-1">
                        <button
                            type="button"
                            onClick={() => handleRoleSwitch('siswa')}
                            className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
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
                            className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedRole === 'guru'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <UserCheck className="w-4 h-4 text-indigo-600" />
                            <span>Guru</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleSwitch('admin')}
                            className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedRole === 'admin'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span>Admin</span>
                        </button>
                    </div>

                    {/* 1-Click Demo Shortcut Pill */}
                    <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-slate-700">
                                Akun demo aktif:{' '}
                                <strong className="text-indigo-700">
                                    {selectedRole === 'siswa'
                                        ? 'M. Farhan (XI PPLG 1)'
                                        : selectedRole === 'guru'
                                        ? 'Drs. Hendra Gunawan'
                                        : 'Operator Kurikulum'}
                                </strong>
                            </span>
                        </div>
                        <a
                            href={
                                selectedRole === 'siswa'
                                    ? '/quick-login/siswa'
                                    : selectedRole === 'guru'
                                    ? '/quick-login/guru'
                                    : '/quick-login/admin'
                            }
                            className="font-bold text-indigo-700 hover:underline flex items-center gap-1"
                        >
                            <span>1-Klik Masuk</span>
                            <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Authentication Form (Stitch Screen 3) */}
                    <form onSubmit={submit} className="flex flex-col space-y-4">
                        {/* PANEL SISWA */}
                        {selectedRole === 'siswa' && (
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        NISN (Nomor Induk Siswa Nasional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nisn}
                                        onChange={(e) => setData('nisn', e.target.value)}
                                        placeholder="10 digit NISN aktif"
                                        maxLength={10}
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <span className="text-[11px] text-slate-400 mt-1 block">
                                        Periksa NISN pada kartu pelajar atau rapor semester terakhir
                                    </span>
                                </div>

                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Email Akun Siswa
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="siswa@edusync.sch.id"
                                        required
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {errors.email && (
                                        <span className="text-rose-500 text-[11px] mt-1 block">{errors.email}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PANEL GURU */}
                        {selectedRole === 'guru' && (
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        NIP / ID Pendidik
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="18 digit NIP atau ID Pengajar"
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Mata Pelajaran & Praktik Diampu
                                    </label>
                                    <div className="w-full p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 items-center min-h-11">
                                        {teacherTags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-xs"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(idx)}
                                                    className="hover:text-rose-600 ml-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Tambah Mapel</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Email Institusi Guru
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="guru@edusync.sch.id"
                                        required
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PANEL ADMIN */}
                        {selectedRole === 'admin' && (
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="font-semibold uppercase tracking-wider text-slate-700 block mb-1 text-[11px]">
                                        Email / ID Operator Kurikulum
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@edusync.sch.id"
                                        required
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password Field (Common to all roles) */}
                        <div className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                                <label className="font-semibold uppercase tracking-wider text-slate-700 text-[11px]">
                                    Kata Sandi
                                </label>
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <Check className="w-3 h-3" />
                                    <span>Akun Terverifikasi</span>
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-rose-500 text-[11px] mt-1 block">{errors.password}</span>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Ingat sesi saya di perangkat ini</span>
                            </label>
                            <a href="#bantuan" className="font-semibold text-indigo-600 hover:underline">
                                Lupa Kata Sandi?
                            </a>
                        </div>

                        {/* Submit Button (Stitch Screen 3) */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <span>{processing ? 'Memproses Masuk...' : 'Masuk ke Sistem'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Helpdesk link */}
                    <div id="bantuan" className="mt-6 text-center pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">
                            Butuh bantuan akses akun? Hubungi Tim Kurikulum & Dapodik Sekolah.
                        </span>
                    </div>
                </div>
            </main>

            {/* 3. FOOTER (Stitch Screen 3) */}
            <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-[11px] uppercase tracking-wide text-slate-700">
                            Sistem Terenkripsi ISO/IEC 27001
                        </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                        © 2024 Dinas Pendidikan & Kebudayaan RI. Hak Cipta Dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
