import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    CheckSquare,
    ArrowLeftRight,
    LogOut,
    ExternalLink,
    ChevronRight,
    User,
    GraduationCap,
} from 'lucide-react';
import Toast from '@/Components/Toast';

export default function TeacherLayout({ children, title = 'Ruang Kerja Guru', teacher }) {
    const { auth } = usePage().props;
    const currentTeacher = teacher || auth?.user?.teacher || {
        name: auth?.user?.name || 'Rizky Muhamad Ramdan, S.Kom',
        nip: auth?.user?.nip || '199208152020121008',
        title: auth?.user?.sub_role || 'Guru Produktif PPLG',
    };

    const initials = currentTeacher.name
        ? currentTeacher.name.split(' ').filter(n => !n.includes('.')).map(n => n[0]).slice(0, 2).join('')
        : 'GR';

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex">
            <Toast />

            {/* PERSISTENT DARK SIDEBAR (Width 260px, bg-[#0F172A]) */}
            <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Header */}
                    <div className="p-5 pb-4 border-b border-slate-800/80 shrink-0">
                        <Link href="/guru/dashboard" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                                <span className="material-symbols-outlined text-[20px]">school</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-base tracking-tight leading-none">EDUSYNC</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        Guru
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[160px] mt-0.5">
                                    SMK Negeri Vokasi
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Teacher Quick Identity Card */}
                    <div className="mx-3 mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-inner">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate leading-tight">
                                {currentTeacher.name}
                            </p>
                            <p className="text-[10px] text-indigo-300 font-mono mt-0.5 truncate">
                                NIP: {currentTeacher.nip || '199208152020121008'}
                            </p>
                            <span className="inline-block text-[10px] text-slate-400 uppercase tracking-wider">
                                {auth?.user?.sub_role || 'Guru Produktif PPLG'}
                            </span>
                        </div>
                    </div>

                    {/* Nav Section */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Menu Pengajar
                            </div>
                            <ul className="space-y-1">
                                <li>
                                    <Link
                                        href="/guru/dashboard"
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-sm transition-all"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-white" />
                                        <span>Ruang Kerja / Dashboard</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

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
                                    href="/quick-login/siswa"
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>Portal Siswa</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                            </div>
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0">
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

            {/* MAIN CONTENT */}
            <div className="pl-[260px] flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-indigo-600">EDUSYNC</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span>Portal Guru</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-900">{title}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-tight border border-emerald-200">
                            TA 2024/2025 Genap Aktif
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Quick Role Switcher for tester */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                            <a
                                href="/quick-login/admin"
                                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Admin
                            </a>
                            <span className="px-2 py-1 rounded-lg bg-white text-indigo-700 font-bold shadow-xs">
                                Guru
                            </span>
                            <a
                                href="/quick-login/siswa"
                                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Siswa
                            </a>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <span>Beranda</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                    </div>
                </header>

                <main className="p-6 sm:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
