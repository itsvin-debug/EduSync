import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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
} from 'lucide-react';
import Logo from '@/Components/Logo';
import ClassMonitoringGrid from '@/Components/ClassMonitoringGrid';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine } from '@/hooks/useScheduleEngine';

export default function Index({
    departments = [],
    classrooms = [],
    teachers = [],
    featuredSchedules = [],
    stats = {},
}) {
    const clock = useRealtimeClock();
    const engine = useScheduleEngine(featuredSchedules);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [selectedDept, setSelectedDept] = useState('all');

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
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
            <Head title="EDUSYNC — Portal Akademik & Penjadwalan SMK Negeri" />

            {/* 1. TOP HEADER (Stitch Screen 4) */}
            <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                                E
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 tracking-tight text-lg">EDUSYNC</span>
                                <span className="text-slate-300 font-normal">—</span>
                                <span className="text-xs text-slate-600 font-medium hidden sm:inline">SMK Negeri Portal</span>
                            </div>
                        </Link>
                        <div className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                            SMK PK TERAKREDITASI A
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
                            <a href="#beranda" className="text-slate-900 hover:text-indigo-600 transition-colors">Beranda</a>
                            <a href="#jadwal-instan" className="hover:text-indigo-600 transition-colors">Jadwal Instan</a>
                            <a href="#kejuruan" className="hover:text-indigo-600 transition-colors">Konsentrasi Keahlian</a>
                            <a href="#pengumuman" className="hover:text-indigo-600 transition-colors">Agenda Sekolah</a>
                        </nav>

                        <div className="flex items-center gap-2.5">
                            <Link
                                href="/login"
                                className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                                <span>Masuk ke Portal</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. SUB-HEADER STATUS STRIP (Stitch Screen 4) */}
            <div className="w-full bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Live Digital Clock */}
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 text-xs px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{clock.timeString}</span>
                        </div>

                        <span className="text-slate-600 font-medium text-xs hidden sm:inline">
                            {clock.dayName}, {clock.dateFormatted}
                        </span>

                        <span className="text-slate-300 hidden sm:inline">|</span>

                        {/* Realtime Temporal Status Badge */}
                        {engine.state === 'CLASS_ACTIVE' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>KBM Berlangsung • {engine.activePeriod?.name} (Sisa {engine.countdownFormatted})</span>
                            </span>
                        ) : engine.state === 'BREAK_TIME' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                <span>{engine.breakInfo?.name || 'Waktu Istirahat'} • Sisa {engine.countdownFormatted}</span>
                            </span>
                        ) : engine.state === 'WEEKEND_HOLIDAY' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                                Libur Akhir Pekan
                            </span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                                Sesi Belajar Selesai
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {clock.academicYear}
                        </span>
                        <span className="text-slate-300 hidden md:inline">|</span>
                        <div className="hidden md:flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dapodik: <strong>Sinkron 100%</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="w-full flex-1">
                {/* 3. HERO SECTION (Stitch Screen 4) */}
                <section id="beranda" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                        {/* Left Column */}
                        <div className="lg:col-span-7 flex flex-col items-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Portal Resmi Vokasi • Standar Industri DUDI</span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mt-5">
                                Sistem Informasi & Penjadwalan Terpadu
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-4 max-w-xl">
                                Platform tata kelola jadwal akademik, rotasi bengkel praktik kejuruan, dan sinkronisasi presensi harian guru serta peserta didik SMK Negeri dalam satu portal terpusat berstandar industri.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-7 w-full sm:w-auto">
                                <a
                                    href="#jadwal-instan"
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <CalendarDays className="w-4 h-4 text-indigo-300" />
                                    <span>Lihat Jadwal Hari Ini</span>
                                </a>
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2 shadow-xs"
                                >
                                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                                    <span>Akses Akun Guru / Siswa</span>
                                </Link>
                            </div>

                            {/* Key Metrics Bar (Stitch Screen 4) */}
                            <div className="mt-10 pt-7 border-t border-slate-200 grid grid-cols-3 gap-6 w-full">
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                                        {stats.total_classrooms || 24}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 mt-1">Rombel Aktif</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Tingkat X, XI, XII</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                                        12
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 mt-1">Lab & Bengkel</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Standar Mitra DUDI</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600 font-mono tracking-tight">
                                        100%
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 mt-1">Bebas Bentrok</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Validasi Dapodik</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Schedule Preview Card (Stitch Screen 4) */}
                        <div className="lg:col-span-5 w-full">
                            <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-2xl shadow-xs">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Live Monitor
                                        </span>
                                        <h2 className="font-bold text-slate-900 text-base mt-0.5">
                                            Jadwal Aktif Sesi Ini
                                        </h2>
                                    </div>
                                    {engine.state === 'CLASS_ACTIVE' ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span>{engine.activePeriod?.name} ({engine.activePeriod?.time}) • Sisa {engine.countdownFormatted}</span>
                                        </div>
                                    ) : engine.state === 'BREAK_TIME' ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                            <span>{engine.breakInfo?.name || 'Waktu Istirahat'} • Sisa {engine.countdownFormatted}</span>
                                        </div>
                                    ) : engine.state === 'WEEKEND_HOLIDAY' ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                                            <span>Libur Akhir Pekan</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                            <span>Jam Sekolah Selesai</span>
                                        </div>
                                    )}
                                </div>

                                {engine.state === 'CLASS_ACTIVE' && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                            <span>Progress Sesi {engine.activePeriod?.name}</span>
                                            <span className="font-mono font-semibold text-slate-700">{engine.progressPercent}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${engine.progressPercent}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule list items */}
                                <div className="mt-4 flex flex-col gap-3">
                                    {featuredSchedules.slice(0, 3).map((sched, idx) => (
                                        <div
                                            key={sched.id || idx}
                                            className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                                                            {sched.classroom?.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                            {sched.room?.name || 'Lab Komputer'}
                                                        </span>
                                                    </div>
                                                    <div className="font-bold text-xs text-slate-900 mt-1.5 line-clamp-1">
                                                        {sched.subject?.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                        <Users className="w-3 h-3 text-slate-400" />
                                                        <span className="font-medium text-slate-700">{sched.teacher?.name}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${
                                                    engine.state === 'CLASS_ACTIVE'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {engine.state === 'CLASS_ACTIVE' ? 'Berlangsung' : 'Terjadwal'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                                    <span className="text-slate-400 text-[11px]">Sinkronisasi Dapodik otomatis</span>
                                    <a
                                        href="#jadwal-instan"
                                        className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                        <span>Buka Seluruh Jadwal</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. CLASS SCHEDULE QUICK LOOKUP SECTION (Stitch Screen 4) */}
                <section id="jadwal-instan" className="py-16 bg-white border-y border-slate-200 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Live Class Matrix Monitoring */}
                        <ClassMonitoringGrid
                            classrooms={classrooms}
                            title="Matrix Monitoring Real-Time Seluruh Rombel"
                        />

                        <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-2">
                                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Pencarian Instan</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                    Penelusuran Jadwal Kelas & Laboratorium
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                                    Lihat susunan jadwal mata pelajaran dan ruang bengkel tanpa perlu login akun. Diperbarui langsung oleh staf kurikulum.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tahun Akademik</div>
                                    <div className="text-xs font-bold text-slate-900">2024/2025 Genap</div>
                                </div>
                                <a
                                    href="/quick-login/siswa"
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                >
                                    <span>Buka Portal Siswa</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Filter Controls (Stitch Screen 4) */}
                        <div className="mt-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                                {/* Search input */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari guru, kelas, atau ruang lab..."
                                        className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Tingkat Filter Tabs */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                                    <button
                                        onClick={() => setSelectedGrade('all')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                                            selectedGrade === 'all'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        Semua Tingkat
                                    </button>
                                    <button
                                        onClick={() => setSelectedGrade('10')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                                            selectedGrade === '10'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        Kelas X
                                    </button>
                                    <button
                                        onClick={() => setSelectedGrade('11')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                                            selectedGrade === '11'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        Kelas XI
                                    </button>
                                    <button
                                        onClick={() => setSelectedGrade('12')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                                            selectedGrade === '12'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        Kelas XII (PKL)
                                    </button>
                                </div>
                            </div>

                            {/* Program Kejuruan Filter Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">
                                    Jurusan:
                                </span>
                                <button
                                    onClick={() => setSelectedDept('all')}
                                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                                        selectedDept === 'all'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Semua Kejuruan
                                </button>
                                {departments.map((dept) => (
                                    <button
                                        key={dept.id}
                                        onClick={() => setSelectedDept(dept.code)}
                                        className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                                            selectedDept === dept.code
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {dept.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schedule Cards 3-Column Grid (Stitch Screen 4) */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {filteredSchedules.map((sched) => (
                                <div
                                    key={sched.id}
                                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs">
                                                {sched.classroom?.name}
                                            </span>
                                            {(() => {
                                                const status = engine.getPeriodStatus(sched.period_start);
                                                if (status === 'berlangsung') {
                                                    return (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            <span>Berlangsung</span>
                                                        </span>
                                                    );
                                                }
                                                if (status === 'selesai') {
                                                    return (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                            Selesai
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        Mendatang
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug line-clamp-2">
                                            {sched.subject?.name}
                                        </h3>

                                        <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-600">
                                            <div className="flex items-center gap-2 text-slate-900 font-medium">
                                                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                                <span className="font-mono">
                                                    Jam ke-{sched.period_start} - {sched.period_end} ({sched.day})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="font-medium text-slate-700">{sched.teacher?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>Ruang: {sched.room?.name || 'Ruang Teori'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Alokasi {sched.period_end - sched.period_start + 1} JP</span>
                                        <span className="text-emerald-600 font-medium flex items-center gap-1">
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

                {/* 5. 5 KONSENTRASI KEAHLIAN (Stitch Screen 4) */}
                <section id="kejuruan" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                            Pendidikan Kejuruan Unggulan
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            5 Konsentrasi Keahlian Berstandar Industri
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-2">
                            Kurikulum Merdeka SMK Pusat Keunggulan dengan sinkronisasi jam blok laboratorium.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {departments.map((dept) => {
                            const Icon = getDeptIcon(dept.code);
                            return (
                                <div
                                    key={dept.id}
                                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-3">
                                            <Icon className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm leading-tight">
                                            {dept.name}
                                        </h3>
                                        <span className="font-mono text-xs font-semibold text-indigo-600 mt-1 block">
                                            [{dept.code}]
                                        </span>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <span>{dept.classrooms_count || 4} Rombel</span>
                                        <span className="text-emerald-600 font-medium">Aktif</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 6. MULTI-ROLE ENTRY CARDS (Stitch Screen 4) */}
                <section className="py-14 bg-slate-100 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Admin */}
                            <a
                                href="/quick-login/admin"
                                className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base">Portal Admin & Kurikulum</h3>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                        Schedule Matrix Builder, deteksi tabrakan instruktur, master data guru & siswa, dan plotting guru inval.
                                    </p>
                                </div>
                                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                                    <span>Buka Control Center</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </a>

                            {/* Card 2: Guru */}
                            <a
                                href="/quick-login/guru"
                                className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                                        <CalendarDays className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base">Portal Guru Pengampu</h3>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                        Jadwal mengajar mingguan pribadi, kartu aktif mengajar real-time, verifikasi piket siswa, dan tukar jam.
                                    </p>
                                </div>
                                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                                    <span>Buka Ruang Kerja Guru</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </a>

                            {/* Card 3: Siswa */}
                            <a
                                href="/quick-login/siswa"
                                className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base">Portal Siswa & Ruang Belajar</h3>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                        Linimasa pelajaran hari ini, jadwal mingguan, lapor bukti foto piket kebersihan, dan kontak guru WhatsApp.
                                    </p>
                                </div>
                                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                                    <span>Buka Dashboard Siswa</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* 7. INSTITUTIONAL FOOTER */}
            <footer className="w-full bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            E
                        </div>
                        <div>
                            <span className="font-bold text-slate-900">EDUSYNC</span> • SMK Negeri 1 Rekayasa Teknologi
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                        <span>Tahun Ajaran 2024/2025 Genap</span>
                        <span>•</span>
                        <span>Standar Kurikulum Merdeka</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">Dapodik 100% Online</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
