import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { GraduationCap, ShieldCheck, UserCheck, Eye, EyeOff, ArrowRight, Sparkles, School } from 'lucide-react';
import Logo from '@/Components/Logo';
import Toast from '@/Components/Toast';

export default function Login({ classrooms = [], departments = [] }) {
    const [selectedRole, setSelectedRole] = useState('siswa'); // 'siswa', 'guru', 'admin'
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: 'siswa@edusync.sch.id',
        password: 'password',
        remember: true,
    });

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        if (role === 'siswa') {
            setData('email', 'siswa@edusync.sch.id');
        } else if (role === 'guru') {
            setData('email', 'guru@edusync.sch.id');
        } else if (role === 'admin') {
            setData('email', 'admin@edusync.sch.id');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
            <Head title="Masuk ke Portal - EDUSYNC SMK Negeri" />
            <Toast />

            {/* Top Navigation */}
            <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/">
                        <Logo size="default" subtitle="Portal SMK Negeri" />
                    </Link>
                    <nav className="flex items-center gap-4 text-xs">
                        <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                            Kembali ke Beranda
                        </Link>
                        <a
                            href="#demo-credentials"
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                            Akun Demo Siap Pakai
                        </a>
                    </nav>
                </div>
            </header>

            {/* Main Form Center */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
                    {/* Institutional Header */}
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Portal Resmi Vokasi Kemendikbudristek</span>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-slate-900 p-2 flex items-center justify-center mb-3 shadow-md">
                            <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
                                <rect width="120" height="120" rx="24" fill="#0F172A" />
                                <path d="M30 40H90V48H30V40Z" fill="#FFFFFF" />
                                <path d="M30 56H72V64H30V56Z" fill="#4F46E5" />
                                <path d="M30 72H84V80H30V72Z" fill="#94A3B8" />
                                <circle cx="86" cy="60" r="6" fill="#4F46E5" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang di EduSync</h1>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Silakan masuk sesuai peran Anda di lingkungan akademik SMK Negeri.
                        </p>
                    </div>

                    {/* Segmented Role Selector */}
                    <div className="w-full h-12 p-1 bg-slate-100 rounded-xl my-6 grid grid-cols-3 gap-1">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('siswa')}
                            className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedRole === 'siswa'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                            <span>Siswa</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('guru')}
                            className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedRole === 'guru'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <UserCheck className="w-4 h-4 text-indigo-600" />
                            <span>Guru</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('admin')}
                            className={`h-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                                selectedRole === 'admin'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span>Admin</span>
                        </button>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                {selectedRole === 'siswa' ? 'Email / Akun Siswa' : selectedRole === 'guru' ? 'Email Guru Pengampu' : 'Email Administrator'}
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                                    errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                                }`}
                                placeholder="nama@edusync.sch.id"
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Kata Sandi
                                </label>
                                <span className="text-[11px] text-slate-400">Default: password</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full h-11 px-3.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                                        errors.password ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                                    }`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                                />
                                <span className="text-xs text-slate-600">Ingat saya</span>
                            </label>
                            <span className="text-xs text-slate-400">Dapodik v3.4.2</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span>Masuk ke Ruang {selectedRole === 'admin' ? 'Admin' : selectedRole === 'guru' ? 'Guru' : 'Siswa'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Quick Demo Access Buttons */}
                    <div id="demo-credentials" className="mt-6 pt-5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Masuk Instan (1-Click Demo)
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                                Langsung Terhubung
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <a
                                href="/quick-login/admin"
                                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center gap-2"
                            >
                                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-semibold text-slate-900 truncate">Admin Kurikulum</div>
                                    <div className="text-[10px] text-slate-500 truncate">Control Center</div>
                                </div>
                            </a>

                            <a
                                href="/quick-login/guru"
                                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center gap-2"
                            >
                                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                    <UserCheck className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-semibold text-slate-900 truncate">Guru (Pak Rizky)</div>
                                    <div className="text-[10px] text-slate-500 truncate">Produktif PPLG</div>
                                </div>
                            </a>

                            <a
                                href="/quick-login/wali"
                                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center gap-2"
                            >
                                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                                    <School className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-semibold text-slate-900 truncate">Wali Kelas XI PPLG 1</div>
                                    <div className="text-[10px] text-slate-500 truncate">Pak Didin, M.Kom</div>
                                </div>
                            </a>

                            <a
                                href="/quick-login/siswa"
                                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center gap-2"
                            >
                                <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="font-semibold text-slate-900 truncate">Siswa (Ahmad F.)</div>
                                    <div className="text-[10px] text-slate-500 truncate">Ketua Kelas XI PPLG 1</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
                © 2026 EDUSYNC SMK Negeri • Terintegrasi Dapodik & Kurikulum Merdeka Vokasi
            </footer>
        </div>
    );
}
