import React from 'react';
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
} from 'lucide-react';

export default function Dashboard({ metrics, conflicts = [], auditLogs = [], departments = [], classrooms = [] }) {
    const { clock, engineState } = useScheduleEngine([]);

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
            subtext: '11 Ruang Praktik / Teori',
            icon: Building2,
            color: 'emerald',
        },
    ];

    return (
        <AdminLayout title="Dashboard Analitik">
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
                        Ringkasan Sistem & Kurikulum
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Monitoring alokasi jam pembelajaran sekolah vokasi Tahun Ajaran 2024/2025 Genap.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/schedules"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                        <CalendarDays className="w-4 h-4 text-indigo-400" />
                        <span>Buka Schedule Matrix Editor</span>
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

            {/* 4. Real-Time Class Monitoring Matrix for ALL Classes (Grade 10, 11, 12) */}
            <div className="mb-8">
                <ClassMonitoringGrid classrooms={classrooms} title="Matrix Monitoring Seluruh Rombel (Real-Time)" />
            </div>

            {/* 5. Quick Overview & Audit Log Feed */}
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
                            <h3 className="font-bold text-slate-900 text-sm">Audit Log & Aktivitas Kurikulum</h3>
                        </div>
                        <span className="text-[11px] text-slate-400">Sinkron Real-time</span>
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
