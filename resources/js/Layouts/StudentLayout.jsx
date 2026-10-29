import React, { useState } from 'react';
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
    GraduationCap,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    FileText,
    AlertCircle,
    Settings,
    Menu,
    X,
} from 'lucide-react';
import Toast from '@/Components/Toast';
import ThemeToggle from '@/Components/ThemeToggle';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';

export default function StudentLayout({
    children,
    title = 'Dashboard Siswa',
    student,
    classroom,
    activeTab,
    onTabChange,
    isClassLeader: propIsClassLeader,
}) {
    const { auth, app } = usePage().props;
    const appName = app?.name || 'EDUSYNC';
    const schoolName = app?.school_name || 'SMKN 1 Ciomas';
    const clock = useRealtimeClock();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const currentStudent = student || auth?.user || {
        name: 'Muhammad Farhan',
        nisn: '006841289',
        sub_role: 'Siswa',
    };
    const isClassLeader = propIsClassLeader !== undefined
        ? Boolean(propIsClassLeader)
        : Boolean(currentStudent.is_class_leader || currentStudent.sub_role === 'Ketua Kelas');
    const currentClass = classroom || auth?.user?.classroom || {
        name: 'XI PPLG 1',
        department: { name: 'Rekayasa Perangkat Lunak' },
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const initials = currentStudent.name
        ? currentStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'ST';

    const handleTabClick = (tabId) => {
        if (onTabChange) {
            onTabChange(tabId);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans flex flex-col lg:flex-row transition-colors duration-200">
            <Toast />

            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* Mobile Top Header */}
            <div className="lg:hidden bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-xs">
                <Link href="/siswa/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
                        <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm tracking-tight">{appName}</span>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {isClassLeader ? 'Ketua Kelas' : 'Siswa'}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[170px]">
                            {currentClass.name}
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        aria-label="Buka Menu Navigasi"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* SIDEBAR (Drawer on Mobile, Persistent on Desktop lg:w-[264px]) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 w-[264px] bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none shadow-md transition-transform duration-200 ease-in-out ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Header */}
                    <div className="p-4 sm:p-5 pb-4 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
                        <Link href="/siswa/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-base tracking-tight leading-tight">
                                        {appName}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        {isClassLeader ? 'Ketua Kelas' : 'Siswa'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[155px] mt-0.5">
                                    {schoolName}
                                </p>
                            </div>
                        </Link>

                        {/* Close button inside mobile drawer */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            aria-label="Tutup Menu"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Student Quick Identity Card (Un-cramped & Elegant) */}
                    <div className="mx-3 mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 shrink-0">
                        {currentStudent.avatar ? (
                            <img
                                src={currentStudent.avatar}
                                alt={currentStudent.name}
                                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-indigo-400/50 shadow-inner"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-inner">
                                {initials}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate leading-tight" title={currentStudent.name}>
                                {currentStudent.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                                    {currentStudent.nisn || '006841289'}
                                </span>
                                {isClassLeader && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Piket
                                    </span>
                                )}
                            </div>
                            <span className="block text-[11px] text-slate-400 font-medium truncate mt-1">
                                {currentClass.name}
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
                                        onClick={() => handleTabClick('today')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'today'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                                        <span>Dashboard & Jadwal Hari Ini</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick('weekly')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'weekly'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <CalendarDays className="w-4 h-4 shrink-0" />
                                        <span>Jadwal Mingguan Lengkap</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section: PRESENSI & PERIZINAN */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <span>{isClassLeader ? 'Presensi & Perizinan' : 'Perizinan Siswa'}</span>
                                {isClassLeader && (
                                    <span className="text-[9px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">
                                        Ketua Kelas
                                    </span>
                                )}
                            </div>
                            <ul className="space-y-1">
                                {isClassLeader && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => handleTabClick('absensi')}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                                activeTab === 'absensi'
                                                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-300" />
                                                <span>Presensi Harian Kelas</span>
                                            </div>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                                                13:00
                                            </span>
                                        </button>
                                    </li>
                                )}

                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick('izin')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'izin'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <Calendar className="w-4 h-4 shrink-0 text-sky-400" />
                                        <span>Pengajuan Izin / Sakit</span>
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
                                        onClick={() => handleTabClick('tugas')}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'tugas'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <FileText className="w-4 h-4 shrink-0" />
                                            <span>{isClassLeader ? 'Tugas Guru Pengganti' : 'Tugas KBM / Jamkos'}</span>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick('piket')}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'piket'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <CheckSquare className="w-4 h-4 shrink-0" />
                                            <span>{isClassLeader ? 'Verifikasi Piket Kelas' : 'Piket & Kebersihan Lab'}</span>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick('denda')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'denda'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>Denda Kebersihan Kelas</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick('guru')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'guru'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>Kontak Guru & Wali Kelas</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section: PENGATURAN */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Pengaturan Akun
                            </div>
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick('settings')}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            activeTab === 'settings'
                                                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                    >
                                        <Settings className="w-4 h-4 shrink-0 text-slate-300" />
                                        <span>Pengaturan Profil & Sandi</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Bottom Dapodik Sync & Logout */}
                    <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0 space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[11px]">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span className="text-slate-300 font-medium">Dapodik</span>
                            </div>
                            <span className="text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">
                                Sinkron Aktif
                            </span>
                        </div>

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

            {/* MAIN CONTENT WRAPPER WITH TOP HEADER */}
            <div className="lg:pl-[264px] flex-1 flex flex-col min-w-0">
                {/* Desktop Top Header */}
                <header className="sticky top-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 z-30 px-4 sm:px-8 flex items-center justify-between shadow-2xs transition-colors duration-200">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Portal Siswa</span>
                        <span className="text-slate-300 dark:text-slate-600">›</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Ruang Belajar</span>
                        <span className="text-slate-300 dark:text-slate-600">›</span>
                        <span className="text-slate-900 dark:text-white font-bold truncate">
                            {currentClass.name} • {currentStudent.name}
                        </span>
                    </div>

                    {/* Right Badges & Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Semester Badge */}
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                            {clock.semester} {clock.academicYear}
                        </span>

                        {/* Hadir Status Pill */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{isClassLeader ? 'Ketua Kelas Aktif' : 'Hadir Tepat Waktu'}</span>
                        </div>

                        {/* Dark / Light Mode Toggle */}
                        <ThemeToggle />

                        {/* User Profile Badge (Clickable to open Settings) */}
                        <button
                            type="button"
                            onClick={() => onTabChange && onTabChange('settings')}
                            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700 hover:opacity-85 transition-opacity cursor-pointer text-left overflow-hidden"
                            title="Buka Pengaturan Akun"
                        >
                            {currentStudent.avatar ? (
                                <img
                                    src={currentStudent.avatar}
                                    alt={currentStudent.name}
                                    className="w-8 h-8 rounded-full object-cover shadow-2xs border border-indigo-200 dark:border-indigo-700 shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                    {initials}
                                </div>
                            )}
                            <div className="hidden md:flex flex-col text-left max-w-[140px] overflow-hidden">
                                <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate">
                                    {currentStudent.name}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                    {currentClass.name} {isClassLeader && '• Ketua Kelas'}
                                </span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
                    <div key={usePage().url.split('?')[0]} className="animate-fade-in-up will-change-transform">{children}</div>
                </main>

                {/* Clean Bottom Footer */}
                <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            <span className="font-bold text-slate-900 dark:text-white">{appName}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>Portal Akademik & Aktivitas Belajar {schoolName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[11px] flex-wrap justify-center sm:justify-end">
                            <span>Tahun Ajaran {clock.academicYear} • {clock.semester}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Validasi Dapodik 100%</span>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

