import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Users,
    Building2,
    ShieldCheck,
    ArrowRight,
    Search,
    BookOpen,
    Clock,
    Sparkles,
    CheckCircle2,
    Laptop,
    Wrench,
    Video,
    Palette,
    Flame,
    ExternalLink,
    MapPin,
    Download,
    Check,
    Calendar,
    Award,
    Activity,
    Menu,
    X,
} from 'lucide-react';
import Logo from '@/Components/Logo';
import ThemeToggle from '@/Components/ThemeToggle';
import ClassMonitoringGrid from '@/Components/ClassMonitoringGrid';
import CocurricularCard from '@/Components/CocurricularCard';
import CocurricularModal from '@/Components/CocurricularModal';
import SincBot from '@/Components/SincBot';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine, SCHOOL_PERIODS } from '@/hooks/useScheduleEngine';

export default function Index({
    departments = [],
    classrooms = [],
    teachers = [],
    featuredSchedules = [],
    stats = {},
    cocurricular = {},
}) {
    const { app } = usePage().props;
    const appName = app?.name || 'EDUSYNC';
    const schoolName = app?.school_name || 'SMKN 1 Ciomas';
    const adminAvatar = app?.admin_avatar;

    const clock = useRealtimeClock();
    const engine = useScheduleEngine(featuredSchedules);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [selectedDept, setSelectedDept] = useState('all');
    const [isKokuModalOpen, setIsKokuModalOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Real-time schedule interval and live badge evaluator
    const getScheduleStatus = (sched) => {
        const isJumat = clock.dayName === 'Jumat';
        const periodDefs = isJumat ? SCHOOL_PERIODS.jumat : SCHOOL_PERIODS.regular;
        const startDef = periodDefs.find(p => p.period === sched.period_start);
        const endDef = periodDefs.find(p => p.period === sched.period_end);
        const startTime = startDef?.start || '07:30';
        const endTime = endDef?.end || '09:30';

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        const currentTotal = clock.hours * 60 + clock.minutes;

        if (clock.isWeekend) {
            return { label: 'Upcoming', status: 'upcoming', timeStr: `${startTime} - ${endTime}` };
        }
        if (currentTotal >= startTotal && currentTotal < endTotal) {
            return { label: 'In Progress', status: 'in_progress', timeStr: `${startTime} - ${endTime}` };
        }
        if (currentTotal < startTotal) {
            return { label: 'Upcoming', status: 'upcoming', timeStr: `${startTime} - ${endTime}` };
        }
        return { label: 'Completed', status: 'completed', timeStr: `${startTime} - ${endTime}` };
    };

    // Filter schedules for quick lookup
    const filteredSchedules = featuredSchedules.filter((sched) => {
        const matchesQuery =
            !searchQuery ||
            sched.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sched.classroom?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sched.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sched.room?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGrade =
            selectedGrade === 'all' ||
            sched.classroom?.grade === parseInt(selectedGrade);

        const matchesDept =
            selectedDept === 'all' ||
            sched.classroom?.department?.code === selectedDept;

        return matchesQuery && matchesGrade && matchesDept;
    });

    const getDeptIcon = (code) => {
        switch (code) {
            case 'PPLG': return Laptop;
            case 'ANM': return Palette;
            case 'BCF': return Video;
            case 'TO': return Wrench;
            case 'TPFL': return Flame;
            default: return BookOpen;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between transition-colors duration-200">
            <Head title={`${appName}: Portal Akademik & Penjadwalan ${schoolName}`} />

            {/* 1. TOP HEADER */}
            <header className="sticky top-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
                                {adminAvatar ? (
                                    <img src={adminAvatar} alt="Admin Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{appName.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">{appName}</span>
                                <span className="text-slate-300 dark:text-slate-700 font-normal">•</span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">{schoolName}</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <a href="#beranda" className="text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Beranda</a>
                            <a href="#fitur-web" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Fitur Portal</a>
                            <button
                                type="button"
                                onClick={() => setIsKokuModalOpen(true)}
                                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300"
                            >
                                Jadwal Kokurikuler
                            </button>
                            <a href="#jadwal-instan" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Jadwal Pelajaran</a>
                            <a href="#kejuruan" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Konsentrasi Keahlian</a>
                        </nav>

                        {/* Right Area: Dark/Light Mode Toggle, Login, & Mobile Menu Toggle */}
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            <ThemeToggle />
                            <Link
                                href="/login"
                                className="h-9 px-3.5 sm:px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-xs"
                            >
                                <span>Log In</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                                className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle Menu Navigasi"
                            >
                                {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileNavOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-1 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
                        <a
                            href="#beranda"
                            onClick={() => setIsMobileNavOpen(false)}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Beranda</span>
                        </a>
                        <a
                            href="#fitur-web"
                            onClick={() => setIsMobileNavOpen(false)}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Fitur Portal</span>
                        </a>
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileNavOpen(false);
                                setIsKokuModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                        >
                            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Jadwal Kokurikuler 2.0</span>
                        </button>
                        <a
                            href="#jadwal-instan"
                            onClick={() => setIsMobileNavOpen(false)}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Jadwal Pelajaran (KBM)</span>
                        </a>
                        <a
                            href="#kejuruan"
                            onClick={() => setIsMobileNavOpen(false)}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Konsentrasi Keahlian</span>
                        </a>
                    </div>
                )}
            </header>

            {/* 2. SUB-HEADER STATUS STRIP */}
            <div className="w-full bg-white dark:bg-slate-900/80 border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Live Digital Clock */}
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>{clock.timeString}</span>
                        </div>

                        <span className="text-slate-600 dark:text-slate-300 font-medium text-xs hidden sm:inline">
                            {clock.dayName}, {clock.dateFormatted}
                        </span>

                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                        {/* Realtime Temporal Status Badge */}
                        {engine.state === 'CLASS_ACTIVE' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>KBM Berlangsung • {engine.activePeriod?.name} (Sisa {engine.countdownFormatted})</span>
                            </span>
                        ) : engine.state === 'BREAK_TIME' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>{engine.breakInfo?.name || 'Waktu Istirahat'} • Sisa {engine.countdownFormatted}</span>
                            </span>
                        ) : engine.state === 'WEEKEND_HOLIDAY' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold">
                                Libur Akhir Pekan
                            </span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                                Sesi Belajar Selesai
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {clock.academicYear}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>
                        <div className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Dapodik: <strong className="text-slate-800 dark:text-slate-200">Sinkron 100%</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="w-full flex-1">
                {/* 3. HERO SECTION */}
                <section id="beranda" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                        {/* Left Column */}
                        <div className="lg:col-span-7 flex flex-col items-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800/60">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Portal Akademik & Penjadwalan Terintegrasi • {schoolName}</span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mt-5">
                                Portal Informasi & Penjadwalan {schoolName}
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mt-4 max-w-xl">
                                Pusat informasi resmi manajemen jadwal kegiatan belajar mengajar (KBM), rotasi bengkel dan laboratorium praktik, jadwal harian kokurikuler 2.0 (Pentas Kreasi, Makan Bersama, Jumat Taqwa), serta pemantauan presensi siswa dan guru {schoolName} secara akurat dan transparan.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-7 w-full sm:w-auto">
                                <a
                                    href="#jadwal-instan"
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
                                >
                                    <CalendarDays className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform duration-200" />
                                    <span>Lihat Jadwal Pelajaran (KBM)</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setIsKokuModalOpen(true)}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-800 dark:text-indigo-300 font-semibold text-xs border border-indigo-200/90 dark:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                                >
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>Jadwal Kokurikuler 2.0</span>
                                </button>
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 shadow-2xs"
                                >
                                    <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Akses Akun Pengguna</span>
                                </Link>
                            </div>

                            {/* Key Metrics Bar */}
                            <div className="mt-10 pt-7 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 w-full">
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                                        {stats.total_classrooms || 31}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">Rombel Terjadwal</div>
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Tingkat X, XI, XII</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                                        12
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">Lab & Ruang Praktik</div>
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Standar Praktik Kejuruan</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                                        100%
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">Bebas Bentrok</div>
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Validasi Kurikulum</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Kokurikuler Schedule Preview Card */}
                        <div className="lg:col-span-5 w-full">
                            <CocurricularCard
                                cocurricular={cocurricular}
                                clock={clock}
                                onOpenModal={() => setIsKokuModalOpen(true)}
                            />
                        </div>
                    </div>
                </section>

                {/* 3.5 FITUR UTAMA PORTAL WEB SMKN 1 CIOMAS */}
                <section id="fitur-web" className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/90 dark:border-slate-800 transition-colors duration-200 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                                Informasi & Fitur Terintegrasi
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Fitur Utama Portal Web SMKN 1 Ciomas
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Aplikasi manajemen terpadu yang mempermudah siswa, guru, dan staf sekolah mengakses data jadwal dan akademik harian.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Penjadwalan KBM & Rotasi Lab</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                    Akses instan susunan mata pelajaran per jam pelajaran (JP), nama guru pengampu, serta alokasi ruang teori dan laboratorium praktik kejuruan tanpa potensi bentrok.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Jadwal Kokurikuler 2.0 Otomatis</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                    Kalender rotasi petugas harian Pentas Kreasi (Selasa & Kamis), Makan Bersama (Rabu), dan Jumat Taqwa (Jumat) yang sinkron otomatis mengikuti kalender nyata semester ganjil.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Monitoring KBM & Presensi Harian</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                    Pemantauan sesi KBM secara transparan, status kehadiran siswa per kelas, presensi kehadiran guru mengajar, hingga verifikasi piket kebersihan kelas.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Portal Terpadu Multi-Role</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                    Ruang kerja khusus untuk Siswa & Ketua Kelas (ruang belajar & input absensi), Guru (rekap jam mengajar), dan Administrator (kelola jurusan, kelas, & jadwal).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. CLASS SCHEDULE QUICK LOOKUP SECTION */}
                <section id="jadwal-instan" className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Live Class Matrix Monitoring */}
                        <ClassMonitoringGrid
                            classrooms={classrooms}
                            title="Monitoring Sesi KBM Seluruh Rombel SMKN 1 Ciomas"
                        />

                        <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 mb-2">
                                    <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Pencarian Jadwal Cepat</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Penelusuran Jadwal Kelas & Laboratorium SMKN 1 Ciomas
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                                    Lihat susunan jadwal mata pelajaran dan ruang bengkel tanpa perlu login akun. Diperbarui langsung oleh staf kurikulum SMKN 1 Ciomas.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tahun Akademik</div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">{clock.academicYear}</div>
                                </div>
                                <a
                                    href="/quick-login/siswa"
                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 shadow-xs"
                                >
                                    <span>Buka Portal Siswa</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="mt-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                                {/* Search input */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari guru, kelas, atau ruang lab..."
                                        className="w-full h-10 pl-9 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50"
                                    />
                                </div>

                                {/* Tingkat Filter Tabs */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGrade('all')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                            selectedGrade === 'all'
                                                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        Semua Tingkat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGrade('10')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                            selectedGrade === '10'
                                                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        Kelas X
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGrade('11')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                            selectedGrade === '11'
                                                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        Kelas XI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGrade('12')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                            selectedGrade === '12'
                                                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        Kelas XII (PKL)
                                    </button>
                                </div>
                            </div>

                            {/* Program Kejuruan Filter Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline">
                                    Jurusan:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDept('all')}
                                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                        selectedDept === 'all'
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    Semua Kejuruan
                                </button>
                                {departments.map((dept) => (
                                    <button
                                        key={dept.id}
                                        type="button"
                                        onClick={() => setSelectedDept(dept.code)}
                                        className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                            selectedDept === dept.code
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {dept.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schedule Cards 3-Column Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {filteredSchedules.map((sched) => (
                                <div
                                    key={sched.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 font-bold text-xs">
                                                {sched.classroom?.name}
                                            </span>
                                            {(() => {
                                                const status = engine.getPeriodStatus(sched.period_start);
                                                if (status === 'berlangsung') {
                                                    return (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            <span>Berlangsung</span>
                                                        </span>
                                                    );
                                                }
                                                if (status === 'selesai') {
                                                    return (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            Selesai
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                                                        Mendatang
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-3 leading-snug line-clamp-2">
                                            {sched.subject?.name}
                                        </h3>

                                        <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-medium">
                                                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                <span className="font-mono">
                                                    Jam ke-{sched.period_start} - {sched.period_end} ({sched.day})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{sched.teacher?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                                <span>Ruang: {sched.room?.name || 'Ruang Teori'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                                        <span>Alokasi {sched.period_end - sched.period_start + 1} JP</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Sinkron Dapodik
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
                    </div>
                </section>

                {/* 5. 5 KONSENTRASI KEAHLIAN */}
                <section id="kejuruan" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                            Pendidikan Kejuruan Unggulan
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            5 Konsentrasi Keahlian SMKN 1 Ciomas
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Kurikulum Merdeka vokasi SMKN 1 Ciomas dengan sinkronisasi jam blok laboratorium & bengkel kejuruan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {departments.map((dept) => {
                            const Icon = getDeptIcon(dept.code);
                            return (
                                <div
                                    key={dept.id}
                                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold mb-3 overflow-hidden p-2">
                                            {dept.icon_image ? (
                                                <img src={dept.icon_image} alt={dept.code} className="w-full h-full object-contain" />
                                            ) : (
                                                <Icon className="w-5 h-5 text-indigo-400" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                                            {dept.name}
                                        </h3>
                                        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 block">
                                            [{dept.code}]
                                        </span>
                                        {dept.head_teacher_name && (
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                                Kaprog: {dept.head_teacher_name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span>{dept.classrooms_count || 4} Rombel</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Aktif</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* INSTITUTIONAL FOOTER */}
            <footer className="w-full bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 mt-12 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                        {/* Col 1: Brand & School Profile */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-xs">
                                    {adminAvatar ? (
                                        <img src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{appName.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 dark:text-white text-base leading-tight block">{appName}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{schoolName}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                Pusat informasi resmi penjadwalan kegiatan belajar mengajar (KBM), rotasi bengkel dan laboratorium praktik kejuruan, serta rekapitulasi presensi terpadu {schoolName}.
                            </p>
                            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                                    <span>Jl. Raya Laladon No. 52, Ciomas, Kab. Bogor, Jawa Barat 16610</span>
                                </div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono pl-6">
                                    NPSN: 20254135 • Akreditasi A Unggul
                                </div>
                            </div>
                        </div>

                        {/* Col 2: Academic & Schedule Navigation */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                Layanan & Jadwal KBM
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                <li>
                                    <a href="#jadwal-instan" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        Jadwal Pelajaran Harian
                                    </a>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsKokuModalOpen(true)}
                                        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
                                    >
                                        Jadwal Kokurikuler 2.0
                                    </button>
                                </li>
                                <li>
                                    <a href="#kejuruan" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        5 Konsentrasi Keahlian
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Portal Role Access */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                Akses Portal Pengguna
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                <li>
                                    <Link href="/quick-login/siswa" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                        <span>Portal Siswa & Ruang Belajar</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/quick-login/guru" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                        <span>Portal Guru & Ruang Kerja</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/quick-login/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                        <span>Portal Manajemen Kurikulum (Admin)</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        Masuk Akun Mandiri & Reset Sandi
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4: Accreditation & School Standards */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                                Standar & Kurikulum
                            </h4>
                            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                                    <div className="font-semibold text-slate-900 dark:text-white">Kurikulum Merdeka Vokasi</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Sinkronisasi jam blok kejuruan dan rotasi praktik bengkel standar industri.
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Sinkronisasi Data Pokok Pendidikan (Dapodik)</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span>Jam KBM: Senin - Jumat (07.00 - 16.00 WIB)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                        <div>
                            <span>© {clock.year || 2026} <strong>{appName}</strong> • {schoolName}. Seluruh Hak Cipta Dilindungi.</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[11px] flex-wrap justify-center sm:justify-end">
                            <span>Tahun Ajaran {clock.academicYearFull || clock.academicYear}</span>
                            <span>•</span>
                            <span>{clock.semester || 'Semester Genap'}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Sistem Terhubung</span>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* COCURRICULAR SCHEDULE MODAL */}
            <CocurricularModal
                isOpen={isKokuModalOpen}
                onClose={() => setIsKokuModalOpen(false)}
                allSchedules={cocurricular.all || []}
                currentDate={cocurricular.current_date}
            />

            {/* SINC-BOT VIRTUAL AI ASSISTANT WIDGET */}
            <SincBot />
        </div>
    );
}
