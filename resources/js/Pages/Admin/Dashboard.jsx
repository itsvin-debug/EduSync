import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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
} from 'lucide-react';

export default function Dashboard({
    metrics,
    attendanceStats = {},
    studentAttendancesToday = [],
    teacherAttendancesToday = [],
    conflicts = [],
    auditLogs = [],
    departments = [],
    classrooms = [],
}) {
    const { clock, engineState } = useScheduleEngine([]);
    const [attendanceTab, setAttendanceTab] = useState('siswa'); // siswa, guru
    const [statusFilter, setStatusFilter] = useState('all');

    const statCards = [
        {
            title: 'Total Guru Pengampu',
            value: `${metrics.total_teachers} Guru`,
            subtext: '100% Beban Jam Linear',
            icon: Users,
            color: 'indigo',
        },
        {
            title: 'Total Siswa Terdaftar',
            value: `${metrics.total_students} Siswa`,
            subtext: 'Sinkron Dapodik Semester Genap',
            icon: GraduationCap,
            color: 'teal',
        },
        {
            title: 'Rombongan Belajar (Rombel)',
            value: `${metrics.active_classes} Kelas`,
            subtext: 'Kelas X, XI Aktif (XII PKL)',
            icon: School,
            color: 'amber',
        },
        {
            title: 'Ruang Fisik & Bengkel Lab',
            value: `${metrics.total_rooms} Unit`,
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
        <AdminLayout title="Dashboard & Presensi Terpadu">
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
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
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

            {/* 4. FEATURE 1: ATTENDANCE ANALYTICS CALCULATOR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Attendance Calculator Engine</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-mono">
                                Total Masuk: <strong>{attendanceStats.total_submitted || 0} Siswa</strong>
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Persentase Kehadiran Siswa Hari Ini
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Dihitung otomatis dari laporan perwakilan kelas. Diperbarui setiap hari belajar.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/recap-export"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Export Rekap Bulanan</span>
                        </Link>
                    </div>
                </div>

                {/* Percentage Cards (Hadir, Sakit, Izin, Alpha) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {/* Hadir */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-800">Hadir</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-2">
                                {attendanceStats.hadir_percent || 0}%
                            </div>
                            <div className="text-xs text-emerald-600 mt-0.5">
                                {attendanceStats.count_hadir || 0} Siswa Tercatat
                            </div>
                        </div>
                        <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-emerald-600 h-full transition-all duration-700"
                                style={{ width: `${attendanceStats.hadir_percent || 0}%` }}
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
                                {attendanceStats.sakit_percent || 0}%
                            </div>
                            <div className="text-xs text-amber-600 mt-0.5">
                                {attendanceStats.count_sakit || 0} Siswa (Surat Dokter)
                            </div>
                        </div>
                        <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-amber-600 h-full transition-all duration-700"
                                style={{ width: `${attendanceStats.sakit_percent || 0}%` }}
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
                                {attendanceStats.izin_percent || 0}%
                            </div>
                            <div className="text-xs text-sky-600 mt-0.5">
                                {attendanceStats.count_izin || 0} Siswa Berizin
                            </div>
                        </div>
                        <div className="w-full bg-sky-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-sky-600 h-full transition-all duration-700"
                                style={{ width: `${attendanceStats.izin_percent || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Alpha */}
                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-800">Tanpa Keterangan</span>
                                <UserX className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-rose-700 font-mono mt-2">
                                {attendanceStats.alpha_percent || 0}%
                            </div>
                            <div className="text-xs text-rose-600 mt-0.5">
                                {attendanceStats.count_alpha || 0} Siswa Alpha
                            </div>
                        </div>
                        <div className="w-full bg-rose-200 h-1.5 rounded-full overflow-hidden mt-3">
                            <div
                                className="bg-rose-600 h-full transition-all duration-700"
                                style={{ width: `${attendanceStats.alpha_percent || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* DETAILED INSPECTION TABLES TABS */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAttendanceTab('siswa')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    attendanceTab === 'siswa'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Presensi Siswa Hari Ini ({studentAttendancesToday.length})
                            </button>
                            <button
                                onClick={() => setAttendanceTab('guru')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudentAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400">
                                                Tidak ada data presensi siswa yang cocok dengan filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudentAttendances.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
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
                                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                        {item.status}
                                                    </span>
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
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
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
        </AdminLayout>
    );
}
