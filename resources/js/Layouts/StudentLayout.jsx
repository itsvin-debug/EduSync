import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    CheckSquare,
    Phone,
    Users,
    LogOut,
    ExternalLink,
    ChevronRight,
    Bell,
    Sparkles,
    GraduationCap,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    FileText,
    AlertCircle,
} from 'lucide-react';
import Toast from '@/Components/Toast';

export default function StudentLayout({
    children,
    title = 'Dashboard Siswa',
    student,
    classroom,
    activeTab,
    onTabChange,
}) {
    const { auth } = usePage().props;
    const currentStudent = student || auth?.user || {
        name: 'Muhammad Farhan',
        nisn: '006841289',
        sub_role: 'Siswa',
    };
    const currentClass = classroom || auth?.user?.classroom || {
        name: 'XI PPLG 1',
        department: { name: 'Rekayasa Perangkat Lunak' },
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Calculate avatar initials
    const initials = currentStudent.name
        ? currentStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'MF';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex">
            <Toast />

            {/* 1. PERSISTENT DARK LEFT SIDEBAR (Width 260px, bg-[#0F172A]) matching Stitch Screen 6 */}
            <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Header */}
                    <div className="p-4 sm:p-5 pb-4 border-b border-slate-800/80 shrink-0">
                        <Link href="/siswa/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                                <span className="material-symbols-outlined text-[20px]">school</span>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-base tracking-tight leading-tight">
                                        EDUSYNC
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        Siswa
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[155px] mt-0.5">
                                    SMKN 1 Rekayasa Tek.
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Student Quick Identity Card */}
                    <div className="mx-3 mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-inner">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate leading-tight">
                                {currentStudent.name}
                            </p>
                            <p className="text-[11px] text-indigo-300 font-mono mt-0.5 truncate">
                                NISN: {currentStudent.nisn || '006841289'}
                            </p>
                            <span className="inline-block text-[10px] text-slate-400 uppercase tracking-wider truncate">
                                {currentClass.name} • {currentClass.department?.name || 'Rekayasa PL'}
                            </span>
                        </div>
                    </div>

                    {/* Nav Section */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 text-xs">
                        {/* Section: MENU UTAMA */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Menu Utama
                            </div>
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('today')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'today'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                                        <span>Dashboard & Jadwal Hari Ini</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('weekly')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'weekly'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <CalendarDays className="w-4 h-4 shrink-0" />
                                        <span>Jadwal Mingguan Lengkap</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section: AKADEMIK & KEJURUAN */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Akademik & Kejuruan
                            </div>
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('piket')}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'piket'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <CheckSquare className="w-4 h-4 shrink-0" />
                                            <span>Piket & Kebersihan Lab</span>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('tugas')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'tugas'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4 shrink-0" />
                                        <span>Tugas KBM / Jamkos</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('denda')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'denda'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>Denda Kebersihan Kelas</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('ekskul')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'ekskul'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Users className="w-4 h-4 shrink-0" />
                                        <span>Organisasi & Ekskul</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => onTabChange && onTabChange('guru')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            activeTab === 'guru'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>Kontak Guru & Wali Kelas</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section: BERALIH PORTAL (DEMO) */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Beralih Portal (Demo)
                            </div>
                            <div className="space-y-1">
                                <a
                                    href="/quick-login/admin"
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>Portal Admin Kurikulum</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                                <a
                                    href="/quick-login/guru"
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>Portal Guru Pengampu</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                            </div>
                        </div>
                    </nav>

                    {/* Bottom Dapodik Sync & Logout */}
                    <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0 space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[11px]">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-slate-300 font-medium">Dapodik</span>
                            </div>
                            <span className="text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">
                                Sinkron Online
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium"
                        >
                            <span className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                <span>Keluar Sistem</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* 2. MAIN CONTENT WRAPPER WITH TOP HEADER AT pl-[260px] */}
            <div className="pl-[260px] flex-1 flex flex-col min-w-0">
                {/* Fixed Top Header */}
                <header className="sticky top-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-6 sm:px-8 flex items-center justify-between shadow-xs">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                        <span className="font-semibold text-indigo-600">Portal Siswa</span>
                        <span className="text-slate-300">›</span>
                        <span className="text-slate-600 font-medium">Ruang Belajar</span>
                        <span className="text-slate-300">›</span>
                        <span className="text-slate-900 font-bold truncate">
                            {currentClass.name} • {currentStudent.name}
                        </span>
                    </div>

                    {/* Right Badges & User Info */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Semester Badge */}
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                            Semester Genap 2024/2025
                        </span>

                        {/* Hadir Status Pill */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Hadir Tepat Waktu</span>
                        </div>

                        {/* Quick Switcher */}
                        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                            <a
                                href="/quick-login/admin"
                                className="px-2 py-0.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                            >
                                Admin
                            </a>
                            <a
                                href="/quick-login/guru"
                                className="px-2 py-0.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                            >
                                Guru
                            </a>
                            <span className="px-2 py-0.5 rounded-lg bg-white text-indigo-700 font-bold shadow-xs">
                                Siswa
                            </span>
                        </div>

                        {/* User Profile Badge */}
                        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                {initials}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="font-bold text-xs text-slate-900 leading-tight">
                                    {currentStudent.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {currentClass.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="w-full flex-1 p-6 sm:p-8">
                    {children}
                </main>

                {/* Clean Bottom Footer */}
                <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 sm:px-8 text-xs text-slate-500">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div>
                            <span className="font-semibold text-slate-800">EDUSYNC</span> • Portal Akademik & Jadwal SMK Negeri 1 Rekayasa Teknologi
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                            <span>Tahun Ajaran 2024/2025 Genap</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Validasi Dapodik 100%</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
