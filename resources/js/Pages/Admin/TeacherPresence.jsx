import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    UserCheck,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Clock,
    Calendar,
    Users,
    Search,
    BookOpen,
    ExternalLink,
    ShieldAlert,
    Building2,
    FileSpreadsheet,
    ArrowUpRight,
} from 'lucide-react';
import { useRealtimeClock } from '@/Hooks/useRealtimeClock';
import { SCHOOL_PERIODS } from '@/Hooks/useScheduleEvaluator';

export default function TeacherPresence({
    teachers = [],
    attendances = {},
    tasks = [],
    schedulesToday = [],
}) {
    const { currentTimeString, currentPeriod } = useRealtimeClock();
    const [search, setSearch] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // all, hadir, tidak_hadir, tugas_pending

    // Compute status for scheduled teachers
    const periodNumber = currentPeriod ? currentPeriod.period : null;

    // Filtered schedules for today
    const schedulesWithPresence = schedulesToday.map((sch) => {
        const attendance = attendances[sch.teacher_id];
        const isPresent = attendance && attendance.status === 'hadir';
        const taskForClass = tasks.find(
            (t) => t.teacher_id === sch.teacher_id && t.classroom_id === sch.classroom_id
        );

        let presenceStatus = 'hadir';
        if (!attendance) {
            presenceStatus = 'belum_hadir';
        } else if (attendance.status === 'dinas_luar') {
            presenceStatus = 'dinas_luar';
        } else if (attendance.status === 'izin') {
            presenceStatus = 'izin';
        } else if (attendance.status === 'sakit') {
            presenceStatus = 'sakit';
        } else if (attendance.status === 'alpha') {
            presenceStatus = 'alpha';
        }

        const isCurrentPeriod = periodNumber >= sch.period_start && periodNumber <= sch.period_end;

        return {
            ...sch,
            attendance,
            presenceStatus,
            isPresent,
            isCurrentPeriod,
            task: taskForClass,
        };
    });

    // Counts
    const totalTeachers = teachers.length;
    const presentCount = Object.values(attendances).filter((a) => a.status === 'hadir').length;
    const dutyLeaveCount = Object.values(attendances).filter((a) => a.status === 'dinas_luar').length;
    const absentCount = Object.values(attendances).filter((a) => ['izin', 'sakit', 'alpha'].includes(a.status)).length;
    const unrecordedCount = Math.max(0, totalTeachers - Object.keys(attendances).length);

    // Filter schedules
    const filteredSchedules = schedulesWithPresence.filter((item) => {
        const matchesSearch =
            item.teacher?.name.toLowerCase().includes(search.toLowerCase()) ||
            item.classroom?.name.toLowerCase().includes(search.toLowerCase()) ||
            item.subject?.name.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'hadir') return item.isPresent;
        if (statusFilter === 'tidak_hadir') return !item.isPresent;
        if (statusFilter === 'tugas_pending') return item.task && !item.task.is_verified;
        if (statusFilter === 'active_now') return item.isCurrentPeriod;

        return true;
    });

    const handleVerifyTask = (taskId) => {
        router.post(`/admin/learning-tasks/${taskId}/verify`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedTask && selectedTask.id === taskId) {
                    setSelectedTask((prev) => ({ ...prev, is_verified: !prev.is_verified }));
                }
            },
        });
    };

    return (
        <AdminLayout title="Pantau Guru & Tugas KBM">
            <Head title="Pantau Guru & Tugas KBM — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header & Live Clock Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <UserCheck className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Pantau Kehadiran Guru & Modul Tugas KBM
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Deteksi dini kelas tanpa pengajar aktif, sinkronisasi izin dinas luar, dan verifikasi modul tugas mandiri.
                            </p>
                        </div>

                        {/* Server Time Indicator */}
                        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-sm shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                            <div>
                                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                    Waktu Sistem
                                </div>
                                <div className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                                    {currentTimeString}
                                    {currentPeriod && (
                                        <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded font-medium">
                                            {currentPeriod.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                Guru Hadir di Sekolah
                            </div>
                            <div className="text-2xl font-bold text-emerald-950 mt-1">
                                {presentCount} <span className="text-xs font-medium text-emerald-700">/ {totalTeachers} Guru</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">
                                Presensi Fingerprint / RFID aktif
                            </div>
                        </div>

                        <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                            <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                Sedang Dinas Luar
                            </div>
                            <div className="text-2xl font-bold text-indigo-950 mt-1">
                                {dutyLeaveCount} <span className="text-xs font-medium text-indigo-700">Pengajar</span>
                            </div>
                            <div className="text-[11px] text-indigo-600 mt-0.5">
                                Surat Tugas resmi diverifikasi
                            </div>
                        </div>

                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                                Izin / Sakit / Alpha
                            </div>
                            <div className="text-2xl font-bold text-amber-950 mt-1">
                                {absentCount} <span className="text-xs font-medium text-amber-700">Pengajar</span>
                            </div>
                            <div className="text-[11px] text-amber-600 mt-0.5">
                                Memerlukan pantauan tugas KBM
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Modul Tugas Terunggah
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">
                                {tasks.length} <span className="text-xs font-medium text-slate-500">Tugas Mandiri</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                {tasks.filter(t => t.is_verified).length} telah diverifikasi admin
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Table Container */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 w-full md:w-80">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari guru, kelas, mapel..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'all'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Semua Jadwal ({schedulesToday.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('active_now')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'active_now'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                Sesi Sedang Berlangsung
                            </button>
                            <button
                                onClick={() => setStatusFilter('tidak_hadir')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'tidak_hadir'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                                Guru Berhalangan
                            </button>
                            <button
                                onClick={() => setStatusFilter('tugas_pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'tugas_pending'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                Verifikasi Tugas ({tasks.filter(t => !t.is_verified).length})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Sesi & Jam</th>
                                    <th className="px-6 py-3.5">Kelas & Ruang</th>
                                    <th className="px-6 py-3.5">Mata Pelajaran</th>
                                    <th className="px-6 py-3.5">Guru Pengampu</th>
                                    <th className="px-6 py-3.5">Status Kehadiran</th>
                                    <th className="px-6 py-3.5">Modul Tugas KBM</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSchedules.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                                            Tidak ada alokasi jadwal mengajar hari ini yang sesuai dengan kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSchedules.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${
                                                item.isCurrentPeriod ? 'bg-indigo-50/30 font-medium' : 'hover:bg-slate-50/70'
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {item.isCurrentPeriod && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                                                    )}
                                                    <div className="font-mono text-xs font-bold text-slate-900">
                                                        Jam {item.period_start} - {item.period_end}
                                                    </div>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {item.day}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {item.classroom?.name}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                    {item.room?.name || 'Ruang Teori'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800 leading-snug">
                                                    {item.subject?.name}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                    {item.subject?.code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {item.teacher?.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {item.teacher?.title || 'Guru Pengampu'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.presenceStatus === 'hadir' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        Hadir di Sekolah
                                                    </span>
                                                )}
                                                {item.presenceStatus === 'dinas_luar' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                                        Dinas Luar
                                                    </span>
                                                )}
                                                {['izin', 'sakit'].includes(item.presenceStatus) && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                        {item.presenceStatus.toUpperCase()}
                                                    </span>
                                                )}
                                                {['alpha', 'belum_hadir'].includes(item.presenceStatus) && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                                        Belum Hadir
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.task ? (
                                                    <div className="space-y-1">
                                                        <button
                                                            onClick={() => setSelectedTask(item.task)}
                                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 text-left"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate max-w-[150px]">{item.task.title}</span>
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                                item.task.is_verified
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {item.task.is_verified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">
                                                        {item.isPresent ? 'KBM Tatap Muka' : 'Belum ada tugas diunggah'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.task && (
                                                    <button
                                                        onClick={() => handleVerifyTask(item.task.id)}
                                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                                            item.task.is_verified
                                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        }`}
                                                    >
                                                        {item.task.is_verified ? 'Batalkan Verifikasi' : 'Verifikasi Tugas'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Detail Tugas Mandiri */}
            <Modal show={!!selectedTask} onClose={() => setSelectedTask(null)} maxWidth="md">
                {selectedTask && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    {selectedTask.title}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Modul KBM Mandiri • {selectedTask.classroom?.name}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Instruksi / Penugasan Guru:
                                </span>
                                <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedTask.instructions || 'Tidak ada petunjuk tertulis.'}
                                </div>
                            </div>

                            {selectedTask.attachment_url && (
                                <div>
                                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Lampiran Lembar Kerja:
                                    </span>
                                    <div className="mt-1">
                                        <a
                                            href={selectedTask.attachment_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Buka Berkas Materi ({selectedTask.attachment_url})
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-between text-xs">
                                <span className="text-slate-500">Status Verifikasi:</span>
                                <span className={`font-semibold px-2 py-0.5 rounded ${
                                    selectedTask.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {selectedTask.is_verified ? 'Terverifikasi Lengkap' : 'Belum Diverifikasi'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => handleVerifyTask(selectedTask.id)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                {selectedTask.is_verified ? 'Tandai Belum Verifikasi' : 'Setujui & Verifikasi'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
