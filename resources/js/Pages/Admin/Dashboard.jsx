import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import ConflictBanner from '@/Components/ConflictBanner';
import ClassMonitoringGrid from '@/Components/ClassMonitoringGrid';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine } from '@/hooks/useScheduleEngine';
import {
    Users,
    GraduationCap,
    School,
    Building2,
    CalendarDays,
    ArrowRight,
    Clock,
    Activity,
    CheckCircle2,
    Sparkles,
    UserCheck,
    AlertCircle,
    UserX,
    FileSpreadsheet,
    Tv,
    Edit3,
    PieChart,
    BarChart3,
    TrendingUp,
    Layers,
} from 'lucide-react';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({
    metrics = {},
    attendanceStats = {},
    studentAttendanceStats = {},
    teacherAttendanceStats = {},
    studentAttendancesToday = [],
    teacherAttendancesToday = [],
    conflicts = [],
    auditLogs = [],
    departments = [],
    classrooms = [],
}) {
    const { clock, engineState } = useScheduleEngine([]);
    const [analyticsTab, setAnalyticsTab] = useState('siswa'); // 'siswa', 'guru', 'komparasi'
    const [attendanceTab, setAttendanceTab] = useState('siswa'); // siswa, guru
    const [statusFilter, setStatusFilter] = useState('all');
    const [overrideModal, setOverrideModal] = useState(null);
    const [overrideStatus, setOverrideStatus] = useState('hadir');
    const [overrideNotes, setOverrideNotes] = useState('');

    const handleOverrideSubmit = (e) => {
        e.preventDefault();
        if (!overrideModal) return;
        router.post(`/admin/attendance/${overrideModal.id}/override`, {
            status: overrideStatus,
            notes: overrideNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setOverrideModal(null);
                setOverrideNotes('');
            },
        });
    };

    const sStats = (studentAttendanceStats && studentAttendanceStats.total_submitted !== undefined)
        ? studentAttendanceStats
        : (attendanceStats || {});
    const tStats = teacherAttendanceStats || {};

    const studentTotal = sStats?.total_submitted || 0;
    const studentHadir = sStats?.count_hadir || 0;
    const studentIzin = sStats?.count_izin || 0;
    const studentSakit = sStats?.count_sakit || 0;
    const studentAlpha = sStats?.count_alpha || 0;

    const teacherTotal = tStats?.total_submitted || 0;
    const teacherHadir = tStats?.count_hadir || 0;
    const teacherIzin = tStats?.count_izin || 0;
    const teacherSakit = tStats?.count_sakit || 0;
    const teacherAlpha = tStats?.count_alpha || 0;

    const currentStats = analyticsTab === 'guru' ? {
        title: 'Presensi Guru & Staf',
        sub: 'Rekap kehadiran fingerprint, izin mengajar, dan dinas luar guru',
        total: teacherTotal,
        hadir: teacherHadir,
        izin: teacherIzin,
        sakit: teacherSakit,
        alpha: teacherAlpha,
        hadirPercent: tStats?.hadir_percent || 0,
        izinPercent: tStats?.izin_percent || 0,
        sakitPercent: tStats?.sakit_percent || 0,
        alphaPercent: tStats?.alpha_percent || 0,
        role: 'Guru',
    } : {
        title: 'Presensi Siswa',
        sub: 'Rekapitulasi otomatis presensi harian siswa dari seluruh rombel',
        total: studentTotal,
        hadir: studentHadir,
        izin: studentIzin,
        sakit: studentSakit,
        alpha: studentAlpha,
        hadirPercent: sStats?.hadir_percent || 0,
        izinPercent: sStats?.izin_percent || 0,
        sakitPercent: sStats?.sakit_percent || 0,
        alphaPercent: sStats?.alpha_percent || 0,
        role: 'Siswa',
    };

    // Donut Chart Data
    const donutData = {
        labels: ['Hadir', 'Izin', 'Sakit', 'Tanpa Keterangan'],
        datasets: [
            {
                data: currentStats.total === 0 
                    ? [0, 0, 0, 0] 
                    : [currentStats.hadir, currentStats.izin, currentStats.sakit, currentStats.alpha],
                backgroundColor: ['#10B981', '#0284C7', '#F59E0B', '#EF4444'],
                hoverBackgroundColor: ['#059669', '#0369A1', '#D97706', '#DC2626'],
                borderWidth: 2,
                borderColor: '#FFFFFF',
            },
        ],
    };

    // Bar Chart Data
    const barData = analyticsTab === 'komparasi' ? {
        labels: ['Hadir', 'Izin', 'Sakit', 'Tanpa Keterangan'],
        datasets: [
            {
                label: `Siswa (${studentTotal})`,
                data: [studentHadir, studentIzin, studentSakit, studentAlpha],
                backgroundColor: '#6366F1',
                borderRadius: 6,
            },
            {
                label: `Guru & Staf (${teacherTotal})`,
                data: [teacherHadir, teacherIzin, teacherSakit, teacherAlpha],
                backgroundColor: '#0EA5E9',
                borderRadius: 6,
            },
        ],
    } : {
        labels: ['Hadir', 'Izin', 'Sakit', 'Tanpa Keterangan'],
        datasets: [
            {
                label: `Total ${currentStats.role}`,
                data: [currentStats.hadir, currentStats.izin, currentStats.sakit, currentStats.alpha],
                backgroundColor: ['#10B981', '#0284C7', '#F59E0B', '#EF4444'],
                borderRadius: 6,
            },
        ],
    };

    const donutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 12,
                    font: { size: 11, family: 'Inter, system-ui, sans-serif', weight: 500 },
                    color: '#475569',
                },
            },
            tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { size: 12 },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 8,
            },
        },
        cutout: '70%',
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: analyticsTab === 'komparasi',
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 12,
                    font: { size: 11, family: 'Inter, system-ui, sans-serif', weight: 500 },
                    color: '#475569',
                },
            },
            tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { size: 12 },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11, family: 'Inter, system-ui, sans-serif' },
                    color: '#64748B',
                },
            },
            y: {
                beginAtZero: true,
                grid: { color: '#F1F5F9' },
                ticks: {
                    precision: 0,
                    font: { size: 11, family: 'Inter, system-ui, sans-serif' },
                    color: '#64748B',
                },
            },
        },
    };

    const statCards = [
        {
            title: 'Total Guru Pengampu',
            value: `${metrics?.total_teachers ?? 0} Guru`,
            subtext: '100% Beban Jam Linear',
            icon: Users,
            color: 'indigo',
        },
        {
            title: 'Total Siswa Terdaftar',
            value: `${metrics?.total_students ?? 0} Siswa`,
            subtext: 'Sinkron Dapodik Semester Genap',
            icon: GraduationCap,
            color: 'teal',
        },
        {
            title: 'Rombongan Belajar (Rombel)',
            value: `${metrics?.active_classes ?? 0} Kelas`,
            subtext: 'Kelas X, XI Aktif (XII PKL)',
            icon: School,
            color: 'amber',
        },
        {
            title: 'Ruang Fisik & Bengkel Lab',
            value: `${metrics?.total_rooms ?? 0} Unit`,
            subtext: '12 Ruang Praktik / Teori',
            icon: Building2,
            color: 'emerald',
        },
    ];

    const filteredStudentAttendances = studentAttendancesToday.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard - EDUSYNC" />

            {/* 1. Real-Time Schedule Conflict Detector Banner */}
            <ConflictBanner conflicts={conflicts} />

            {/* 2. Top Header & Live Temporal Status Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-mono font-bold text-slate-800 text-xs px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{clock.timeString}</span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            {clock.dateFormatted} • {clock.academicYear}
                        </span>
                        {engineState.state === 'CLASS_ACTIVE' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>KBM Aktif ({engineState.label})</span>
                            </span>
                        ) : engineState.state === 'BREAK_TIME' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                <span>{engineState.label}</span>
                            </span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                                {engineState.label}
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Ringkasan Sistem & Presensi Harian
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Rekapitulasi dinamis presensi harian siswa, status kehadiran guru, dan alokasi KBM sekolah.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/kbm-monitor"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all duration-200 ease-bouncy"
                    >
                        <Tv className="w-4 h-4 text-emerald-400" />
                        <span>Buka KBM Monitor Penuh</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* 3. Metric Cards Grid (4 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</div>
                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span>{card.subtext}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 4. FEATURE 1: DASHBOARD STATISTIK KEHADIRAN & CHARTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
                {/* Header & Filter Switcher */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Statistik Presensi Terpadu</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-mono">
                                Total Masuk: <strong className="text-slate-900">{studentTotal + teacherTotal} Absen</strong>
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {currentStats.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {currentStats.sub}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Tab Switcher: Siswa / Guru / Komparasi */}
                        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                            <button
                                type="button"
                                onClick={() => setAnalyticsTab('siswa')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                                    analyticsTab === 'siswa'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Presensi Siswa ({studentTotal})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAnalyticsTab('guru')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                                    analyticsTab === 'guru'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Presensi Guru ({teacherTotal})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAnalyticsTab('komparasi')}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                                    analyticsTab === 'komparasi'
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Komparasi Data
                            </button>
                        </div>

                        <Link
                            href="/admin/recap-export"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-bouncy shadow-2xs"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Export Rekap</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Breakdown Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {/* Hadir */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-800">Hadir</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-2">
                                {currentStats.hadirPercent}%
                            </div>
                            <div className="text-xs text-emerald-600 mt-0.5">
                                {currentStats.hadir} {currentStats.role} Tercatat
                            </div>
                        </div>
                        <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-emerald-600 h-full transition-all duration-700"
                                style={{ width: `${currentStats.hadirPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Izin */}
                    <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-sky-800">Izin</span>
                                <Clock className="w-4 h-4 text-sky-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-sky-700 font-mono mt-2">
                                {currentStats.izinPercent}%
                            </div>
                            <div className="text-xs text-sky-600 mt-0.5">
                                {currentStats.izin} {currentStats.role} Berizin
                            </div>
                        </div>
                        <div className="w-full bg-sky-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-sky-600 h-full transition-all duration-700"
                                style={{ width: `${currentStats.izinPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Sakit */}
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-800">Sakit</span>
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-amber-700 font-mono mt-2">
                                {currentStats.sakitPercent}%
                            </div>
                            <div className="text-xs text-amber-600 mt-0.5">
                                {currentStats.sakit} {currentStats.role} Sakit
                            </div>
                        </div>
                        <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-amber-600 h-full transition-all duration-700"
                                style={{ width: `${currentStats.sakitPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Alpha / Tanpa Keterangan */}
                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-800">Tanpa Keterangan</span>
                                <UserX className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-rose-700 font-mono mt-2">
                                {currentStats.alphaPercent}%
                            </div>
                            <div className="text-xs text-rose-600 mt-0.5">
                                {currentStats.alpha} {currentStats.role} Alpha
                            </div>
                        </div>
                        <div className="w-full bg-rose-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-rose-600 h-full transition-all duration-700"
                                style={{ width: `${currentStats.alphaPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* DUAL INTERACTIVE CHARTS: STATISTIK LINGKARAN & STATISTIK BATANG */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-6 border-t border-slate-100">
                    {/* Statistik Lingkaran (Doughnut Chart) */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50/60 border border-slate-200/90 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                                    <PieChart className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Statistik Lingkaran
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Distribusi Persentase Kehadiran {currentStats.role}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                Total: {currentStats.total}
                            </span>
                        </div>

                        <div className="relative h-64 sm:h-72 w-full flex items-center justify-center my-auto pt-2">
                            {currentStats.total === 0 ? (
                                <div className="text-center p-6 text-slate-400 text-xs">
                                    <PieChart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <span>Belum ada data presensi {currentStats.role.toLowerCase()} yang tercatat hari ini.</span>
                                </div>
                            ) : (
                                <Doughnut data={donutData} options={donutOptions} />
                            )}
                        </div>
                    </div>

                    {/* Statistik Batang (Bar Chart) */}
                    <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50/60 border border-slate-200/90 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Statistik Batang
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        {analyticsTab === 'komparasi'
                                            ? 'Perbandingan Jumlah Riil Siswa vs Guru per Kategori'
                                            : `Frekuensi Jumlah Riil Kehadiran ${currentStats.role}`}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                Realtime Sync
                            </span>
                        </div>

                        <div className="relative h-64 sm:h-72 w-full pt-2">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>
                </div>

                {/* DETAILED INSPECTION TABLES TABS */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAttendanceTab('siswa')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-bouncy ${
                                    attendanceTab === 'siswa'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Presensi Siswa Hari Ini ({studentAttendancesToday.length})
                            </button>
                            <button
                                onClick={() => setAttendanceTab('guru')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-bouncy ${
                                    attendanceTab === 'guru'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Presensi Guru Hari Ini ({teacherAttendancesToday.length})
                            </button>
                        </div>

                        {attendanceTab === 'siswa' && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-400 text-[11px]">Filter Status:</span>
                                {['all', 'hadir', 'sakit', 'izin', 'alpha'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setStatusFilter(st)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors duration-200 ease-bouncy ${
                                            statusFilter === st
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {st === 'all' ? 'Semua' : st}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TABLE: SISWA ATTENDANCE */}
                    {attendanceTab === 'siswa' && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-4">Nama Siswa & NISN</th>
                                        <th className="py-3 px-4">Kelas / Rombel</th>
                                        <th className="py-3 px-4 text-center">Status Kehadiran</th>
                                        <th className="py-3 px-4">Waktu & Petugas Input</th>
                                        <th className="py-3 px-4">Keterangan</th>
                                        <th className="py-3 px-4 text-center">Aksi Override</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudentAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">
                                                Tidak ada data presensi siswa yang cocok dengan filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudentAttendances.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors duration-200 ease-bouncy">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900">{item.student?.name}</div>
                                                    <div className="text-[11px] font-mono text-slate-400">
                                                        NISN: {item.student?.nisn || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-700">
                                                    {item.classroom?.name}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                                        item.status === 'hadir'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : item.status === 'sakit'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : item.status === 'izin'
                                                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                                    : item.status === 'dispensasi'
                                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                    {item.overridden_by_admin && (
                                                        <span className="block text-[9px] text-indigo-600 font-bold mt-0.5">
                                                            (Override Admin)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-mono text-slate-800 font-medium">
                                                        {item.submitted_time || new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Oleh: {item.submitted_by?.name || 'Ketua Kelas'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                                                    {item.notes || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOverrideModal(item);
                                                            setOverrideStatus(item.status);
                                                            setOverrideNotes(item.notes || '');
                                                        }}
                                                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors duration-200 ease-bouncy flex items-center justify-center gap-1 mx-auto"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                        <span>Override</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TABLE: GURU ATTENDANCE */}
                    {attendanceTab === 'guru' && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-4">Nama Guru & NIP</th>
                                        <th className="py-3 px-4">Tugas / Mata Pelajaran</th>
                                        <th className="py-3 px-4 text-center">Status Hari Ini</th>
                                        <th className="py-3 px-4 text-center">Jam Fingerprint</th>
                                        <th className="py-3 px-4">Keterangan / Dokumen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {teacherAttendancesToday.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400">
                                                Belum ada data presensi pengajar tercatat hari ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        teacherAttendancesToday.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors duration-200 ease-bouncy">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900">{item.teacher?.name}</div>
                                                    <div className="text-[11px] font-mono text-slate-400">
                                                        NIP: {item.teacher?.nip || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700">
                                                    {item.teacher?.title || 'Guru Pengampu'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                                        item.status === 'hadir'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : item.status === 'izin_dinas'
                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                : item.status === 'sakit'
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                                                    {item.check_in_time ? `${item.check_in_time}` : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {item.notes || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. FEATURE 2: CLASS MONITORING MATRIX FOR ALL CLASSES (GRADE 10, 11, 12) */}
            <div className="mb-8">
                <ClassMonitoringGrid classrooms={classrooms} title="Monitoring Sesi KBM Seluruh Rombel" />
            </div>

            {/* 6. Quick Overview & Audit Log Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Distribution */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 text-sm">Konsentrasi Keahlian</h3>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            5 Jurusan
                        </span>
                    </div>

                    <div className="space-y-3">
                        {departments.map((dept) => (
                            <div key={dept.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-xs text-slate-900">{dept.code}</div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{dept.name}</div>
                                </div>
                                <span className="text-xs font-semibold text-slate-700 font-mono bg-white px-2 py-1 rounded-md border border-slate-200">
                                    {dept.classrooms_count} Rombel
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Logs Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Histori Aktivitas Sistem & Admin</h3>
                        </div>
                        <Link href="/admin/audit-logs" className="text-[11px] text-indigo-600 hover:underline font-semibold">
                            Lihat Semua
                        </Link>
                    </div>

                    {auditLogs.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                            Belum ada aktivitas tercatat hari ini.
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {auditLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                                        <div>
                                            <span className="font-semibold text-slate-900 block">{log.description}</span>
                                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                Oleh: {log.user?.name || 'Sistem'} • IP: {log.ip_address || '127.0.0.1'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-[10px] text-slate-400 font-mono">
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: OVERRIDE PRESENSI SISWA */}
            {overrideModal && (
                <Modal isOpen={Boolean(overrideModal)} onClose={() => setOverrideModal(null)} title="Override Presensi Siswa (Hak Akses Admin)">
                    <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                            <div className="font-bold text-sm text-indigo-950">
                                {overrideModal.student?.name}
                            </div>
                            <div className="text-indigo-800 text-[11px]">
                                Kelas: <strong>{overrideModal.classroom?.name}</strong> • NISN: {overrideModal.student?.nisn || '-'} • Tanggal: {overrideModal.date}
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1.5">
                                Status Kehadiran Baru
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { val: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-600 text-white' },
                                    { val: 'sakit', label: 'Sakit', activeClass: 'bg-amber-600 text-white' },
                                    { val: 'izin', label: 'Izin', activeClass: 'bg-sky-600 text-white' },
                                    { val: 'dispensasi', label: 'Dispensasi', activeClass: 'bg-indigo-600 text-white' },
                                    { val: 'alpha', label: 'Alpa', activeClass: 'bg-rose-600 text-white' },
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setOverrideStatus(opt.val)}
                                        className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all duration-200 ease-bouncy ${
                                            overrideStatus === opt.val
                                                ? `${opt.activeClass} border-transparent shadow-xs`
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.97] will-change-transform'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Catatan / Justifikasi Override Admin
                            </label>
                            <textarea
                                value={overrideNotes}
                                onChange={(e) => setOverrideNotes(e.target.value)}
                                rows={3}
                                placeholder="Contoh: Perbaikan status sakit berdasar verifikasi surat dokter fisik via BK / Kurikulum."
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setOverrideModal(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
                            >
                                Simpan Override Presensi
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AdminLayout>
    );
}
