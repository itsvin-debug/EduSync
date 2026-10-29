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
    Users,
    Settings,
} from 'lucide-react';
import Toast from '@/Components/Toast';
import ThemeToggle from '@/Components/ThemeToggle';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';

export default function TeacherLayout({ children, title = 'Ruang Kerja Guru', teacher, activeTab, onTabChange }) {
    const { auth, app } = usePage().props;
    const appName = app?.name || 'EDUSYNC';
    const schoolName = app?.school_name || 'SMKN 1 Ciomas';
    const clock = useRealtimeClock();
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
        { id: 'presensi_kelas', label: 'Presensi Siswa', icon: Users },
        { id: 'perizinan_siswa', label: 'Verifikasi Izin & Sakit Siswa', icon: ShieldCheck },
        { id: 'tugas', label: 'Delegasi Tugas (Ketua Kelas)', icon: ClipboardList },
        { id: 'presensi', label: 'Presensi Mandiri Guru', icon: CheckCircle2 },
        { id: 'izin_dinas', label: 'Izin Keluar Dinas', icon: Briefcase },
        { id: 'piket', label: 'Verifikasi Piket Siswa', icon: CheckSquare },
        { id: 'lapor_sampah', label: 'Lapor Sampah & Kebersihan', icon: Trash2 },
        { id: 'master', label: 'Cek Jadwal Rombel Lain', icon: BookOpen },
        { id: 'settings', label: 'Pengaturan Profil & Sandi', icon: Settings },
    ];

    const handleItemClick = (id) => {
        if (onTabChange) {
            onTabChange(id);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans flex flex-col md:flex-row transition-colors duration-200">
            <Toast />

            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* MOBILE TOP BAR */}
            <div className="md:hidden bg-[#0F172A] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-xs">
                        {appName.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-sm leading-none">{appName}</div>
                        <div className="text-[10px] text-indigo-300 font-semibold mt-0.5">Portal Guru</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* PERSISTENT DARK SIDEBAR */}
            <aside
                className={`fixed md:sticky top-0 bottom-0 left-0 w-[264px] bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none shadow-md transition-transform duration-200 ease-in-out ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } h-screen shrink-0`}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Header */}
                    <div className="p-5 pb-4 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
                        <Link href="/guru/dashboard" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                                <GraduationCap className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-base tracking-tight leading-none">{appName}</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        Guru
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[160px] mt-0.5">
                                    {schoolName}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Teacher Quick Identity Card */}
                    <div className="mx-3 mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-inner">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate leading-tight">
                                {currentTeacher.name}
                            </p>
                            <p className="text-[10px] text-indigo-300 font-mono mt-0.5 truncate">
                                NIP: {currentTeacher.nip || '199208152020121008'}
                            </p>
                            <span className="inline-block text-[10px] text-slate-400 uppercase tracking-wider truncate max-w-[150px] mt-0.5">
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
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all duration-200 text-left cursor-pointer ${
                                                    isActive
                                                        ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-200 text-xs font-medium cursor-pointer"
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
                <header className="sticky top-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 z-30 px-4 sm:px-8 flex items-center justify-between transition-colors duration-200">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Ruang Kerja Guru</span>
                            <span>/</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">{title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs">
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                            {clock.semester} {clock.academicYear}
                        </span>
                        <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Koneksi Terhubung</span>
                        </div>

                        {/* Dark Mode Toggle */}
                        <ThemeToggle />

                        <button
                            type="button"
                            onClick={() => onTabChange && onTabChange('settings')}
                            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-700 dark:text-slate-200 cursor-pointer"
                            title="Pengaturan Profil & Sandi"
                        >
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                                {initials}
                            </div>
                            <span className="font-semibold text-xs hidden md:inline truncate max-w-[130px]">
                                {currentTeacher.name}
                            </span>
                        </button>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 flex-1">
                    <div key={usePage().url.split('?')[0]} className="animate-fade-in-up will-change-transform">{children}</div>
                </main>

                <footer className="px-4 sm:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left transition-colors duration-200">
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        <span>© {clock.year} <strong className="text-slate-800 dark:text-slate-200">{appName}</strong> • {schoolName}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>Sistem Manajemen Kehadiran & Aktivitas Kelas (TA {clock.academicYear})</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Portal Guru Terintegrasi Dapodik</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

