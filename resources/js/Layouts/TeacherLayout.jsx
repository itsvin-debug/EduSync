import React, { useState } from 'react';
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
    CheckCircle2,
    ClipboardList,
    Briefcase,
    Trash2,
    Clock,
    ShieldCheck,
    Menu,
    X,
} from 'lucide-react';
import Toast from '@/Components/Toast';

export default function TeacherLayout({ children, title = 'Ruang Kerja Guru', teacher, activeTab, onTabChange }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const navItems = [
        { id: 'workspace', label: 'Ruang Kerja Hari Ini', icon: Clock },
        { id: 'personal', label: 'Jadwal Mingguan Pribadi', icon: CalendarDays },
        { id: 'presensi', label: 'Presensi Kehadiran Guru', icon: ShieldCheck },
        { id: 'tugas', label: 'Tugas KBM / Jamkos', icon: ClipboardList },
        { id: 'izin_dinas', label: 'Izin Keluar Dinas', icon: Briefcase },
        { id: 'piket', label: 'Verifikasi Piket Siswa', icon: CheckCircle2 },
        { id: 'lapor_sampah', label: 'Lapor Kebersihan Kelas', icon: Trash2 },
        { id: 'master', label: 'Cek Jadwal Rombel Lain', icon: BookOpen },
    ];

    const handleItemClick = (id) => {
        if (onTabChange) {
            onTabChange(id);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col md:flex-row">
            <Toast />

            {/* MOBILE TOP BAR */}
            <div className="md:hidden bg-[#0F172A] text-white p-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
                        E
                    </div>
                    <div>
                        <div className="font-bold text-sm leading-none">EDUSYNC</div>
                        <div className="text-[10px] text-indigo-300 font-semibold mt-0.5">Portal Guru</div>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* PERSISTENT DARK SIDEBAR */}
            <aside
                className={`fixed md:sticky top-0 bottom-0 left-0 w-[260px] bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none transition-transform duration-200 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } h-screen`}
            >
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
                            <span className="inline-block text-[10px] text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
                                {currentTeacher.title || auth?.user?.sub_role || 'Guru Pengampu'}
                            </span>
                        </div>
                    </div>

                    {/* Nav Section */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 text-xs">
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Menu Pengajar
                            </div>
                            <ul className="space-y-1">
                                {navItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => handleItemClick(item.id)}
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all text-left ${
                                                    isActive
                                                        ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                                }`}
                                            >
                                                <IconComponent className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                        </li>
                                    );
                                })}
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
                                    <span>Portal Admin</span>
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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-800">Ruang Kerja Guru</span>
                            <span>/</span>
                            <span className="text-indigo-600 font-medium">{title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="hidden sm:flex items-center gap-2 text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Koneksi Real-time Aktif</span>
                        </div>
                    </div>
                </header>

                <main className="p-6 sm:p-8 flex-1">
                    {children}
                </main>

                <footer className="px-6 sm:px-8 py-4 bg-white border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>© 2026 EDUSYNC SMK Negeri — Sistem Manajemen Kehadiran & Aktivitas Kelas</span>
                    <span className="text-slate-400">Portal Guru Terintegrasi Dapodik</span>
                </footer>
            </div>
        </div>
    );
}
