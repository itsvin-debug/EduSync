import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClassMonitoringGrid from '@/Components/ClassMonitoringGrid';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine } from '@/hooks/useScheduleEngine';
import {
    Clock,
    Tv,
    ArrowLeft,
    Sparkles,
    Calendar,
    Activity,
} from 'lucide-react';

export default function KbmMonitor({ classrooms = [], departments = [] }) {
    const { clock, engineState } = useScheduleEngine([]);

    return (
        <AdminLayout title="Monitoring KBM Sekolah">
            <Head title="Live KBM Monitor - EDUSYNC" />

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mr-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                        <span className="text-slate-300">|</span>
                        <span className="font-mono font-bold text-slate-800 text-xs px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{clock.timeString}</span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            {clock.dayName}, {clock.dateFormatted} • {clock.academicYear}
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Tv className="w-6 h-6 text-indigo-600" />
                        <span>Live Monitor Kegiatan Belajar Mengajar (KBM)</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pemantauan serentak jam pelajaran, mata pelajaran aktif, guru di kelas, dan hitung mundur sisa waktu slot pembelajaran.
                    </p>
                </div>
            </div>

            {/* Full-width Class Monitoring Grid */}
            <ClassMonitoringGrid
                classrooms={classrooms}
                title="Status Seluruh Rombongan Belajar (Tingkat X, XI, XII)"
            />
        </AdminLayout>
    );
}
