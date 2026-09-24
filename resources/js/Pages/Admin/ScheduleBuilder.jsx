import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConflictBanner from '@/Components/ConflictBanner';
import Modal from '@/Components/Modal';
import {
    CalendarDays,
    Clock,
    Plus,
    Sparkles,
    FileSpreadsheet,
    FileText,
    Users,
    Building2,
    CheckCircle2,
    AlertTriangle,
    Trash2,
    Edit3,
    BookOpen,
    Filter,
    RefreshCw,
    Download,
} from 'lucide-react';

export default function ScheduleBuilder({
    classrooms = [],
    selectedClassroomId,
    selectedClassroom,
    schedules = [],
    allSchedules = [],
    teachers = [],
    subjects = [],
    rooms = [],
    timeSlots = [],
    conflicts = [],
    perspective = 'class',
    selectedTeacherId,
    selectedRoomId,
}) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedSlotForEdit, setSelectedSlotForEdit] = useState(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        classroom_id: selectedClassroomId || classrooms[0]?.id || '',
        subject_id: subjects[0]?.id || '',
        teacher_id: teachers[0]?.id || '',
        room_id: rooms[0]?.id || '',
        day: 'Senin',
        period_start: 2,
        period_end: 4,
        notes: '',
    });

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    const handleClassChange = (id) => {
        router.get('/admin/schedules', { classroom_id: id, perspective: 'class' }, { preserveState: true });
    };

    const handlePerspectiveChange = (newPerspective) => {
        if (newPerspective === 'class') {
            router.get('/admin/schedules', { perspective: 'class', classroom_id: selectedClassroomId });
        } else if (newPerspective === 'teacher') {
            router.get('/admin/schedules', { perspective: 'teacher', teacher_id: teachers[0]?.id });
        } else if (newPerspective === 'room') {
            router.get('/admin/schedules', { perspective: 'room', room_id: rooms[0]?.id });
        }
    };

    const handleAutoGenerate = () => {
        if (confirm('Jalankan Algoritma Auto-Generate Jadwal Sekolah? Sistem akan meregenerasi seluruh jadwal bebas tabrakan sesuai kurikulum SMK.')) {
            router.post('/admin/schedules/auto-generate');
        }
    };

    const openAddModal = (day = 'Senin', period = 2) => {
        setSelectedSlotForEdit(null);
        setData({
            classroom_id: selectedClassroomId || classrooms[0]?.id || '',
            subject_id: subjects[0]?.id || '',
            teacher_id: teachers[0]?.id || '',
            room_id: rooms[0]?.id || '',
            day: day,
            period_start: period,
            period_end: Math.min(period + 2, 10),
            notes: '',
        });
        setIsAddModalOpen(true);
    };

    const handleSaveSlot = (e) => {
        e.preventDefault();
        if (selectedSlotForEdit) {
            put(`/admin/schedules/${selectedSlotForEdit.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/schedules', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteSlot = (id) => {
        if (confirm('Hapus alokasi jadwal ini?')) {
            router.delete(`/admin/schedules/${id}`);
        }
    };

    // Printable view / export
    const handlePrint = () => {
        window.print();
    };

    // Export CSV
    const handleExportCSV = () => {
        const headers = ['Hari', 'Jam Ke', 'Kelas', 'Mata Pelajaran', 'Kode Guru', 'Nama Guru', 'Ruang'];
        const rows = schedules.map(s => [
            s.day,
            `${s.period_start}-${s.period_end}`,
            s.classroom?.name || '',
            s.subject?.name || '',
            s.teacher?.code || '',
            s.teacher?.name || '',
            s.room?.name || '',
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Jadwal_${selectedClassroom?.name || 'Sekolah'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Compute slot occupant for a given day and period
    const getScheduleAt = (day, period) => {
        return schedules.find(s => s.day === day && period >= s.period_start && period <= s.period_end);
    };

    return (
        <AdminLayout title="Schedule Builder & Matrix Editor">
            <Head title="Schedule Builder & Matrix Editor - EDUSYNC Admin" />

            {/* Live Conflict Banner */}
            <ConflictBanner conflicts={conflicts} />

            {/* Page Title and Utility Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Schedule Builder & Matrix Editor
                        </h1>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Status Validasi Dapodik: Terverifikasi 100%</span>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                        Kelola alokasi jam mengajar, pembagian lab/bengkel praktik kejuruan, dan otomatisasi deteksi tabrakan instruktur secara real-time.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleAutoGenerate}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-xs transition-colors"
                        type="button"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Auto-Generate Algoritma AI</span>
                    </button>
                    <button
                        onClick={() => openAddModal('Senin', 2)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
                        type="button"
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ Tambah Sesi Jadwal</span>
                    </button>
                </div>
            </div>

            {/* Operational Metrics 4-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Total Jam Pelajaran Terjadwal</span>
                            <Clock className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-slate-900">1,248 JP</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                97.5% Terplot
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 bg-slate-50 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Kapasitas Maksimal</span>
                        <span className="font-semibold text-slate-800 font-mono">1,280 JP</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Okupansi Bengkel & Lab</span>
                            <Building2 className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-slate-900">91.6%</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Optimal
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 bg-slate-50 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Penggunaan Unit</span>
                        <span className="font-semibold text-slate-800 font-mono">11 dari 12 Lab Aktif</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Guru Terjadwal / Beban</span>
                            <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-slate-900">48 / 48 Guru</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                100% Linear
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 bg-slate-50 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Rata-rata Distribusi</span>
                        <span className="font-semibold text-slate-800 font-mono">24–32 JP / Minggu</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Status Integritas Jadwal</span>
                            {conflicts.length === 0 ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                            )}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className={`text-2xl font-bold ${conflicts.length === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {conflicts.length === 0 ? '0 Bentrok' : `${conflicts.length} Bentrok`}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                conflicts.length === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                                {conflicts.length === 0 ? 'Validasi Lolos' : 'Perlu Revisi'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 bg-slate-50 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Kesiapan Cetak</span>
                        <span className="font-semibold text-slate-800 font-mono">Siap Digunakan</span>
                    </div>
                </div>
            </div>

            {/* Interactive Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Class Selector */}
                    <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Rombongan Belajar (Rombel)
                        </label>
                        <select
                            value={selectedClassroomId}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="h-9 px-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.is_pkl ? '(PKL - Industri)' : `(${c.department?.name || 'Vokasi'})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semester */}
                    <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Tahun & Semester
                        </label>
                        <select className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                            <option>Semester Genap 2024/2025</option>
                            <option>Semester Ganjil 2024/2025</option>
                        </select>
                    </div>

                    {/* Matrix Perspective Switcher */}
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Perspektif Matriks
                        </span>
                        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => handlePerspectiveChange('class')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    perspective === 'class' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Kelas
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePerspectiveChange('teacher')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    perspective === 'teacher' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Guru
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePerspectiveChange('room')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    perspective === 'room' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Lab / Bengkel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 flex-wrap self-end xl:self-center">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-xs"
                    >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak / PDF</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-xs"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* MAIN SCHEDULE MATRIX TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[980px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold tracking-wider uppercase text-slate-500">
                            <th className="py-3 px-4 text-center w-[120px]">Waktu & JP</th>
                            {days.map((d) => (
                                <th key={d} className="py-3 px-4 w-[18%]">
                                    <div className="flex items-center justify-between">
                                        <span>{d}</span>
                                        <button
                                            onClick={() => openAddModal(d, 2)}
                                            title={`Tambah sesi di hari ${d}`}
                                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {/* JAM 1: Upacara / Karakter */}
                        <tr className="bg-slate-50/30">
                            <td className="p-3 text-center bg-slate-50/80 border-r border-slate-100">
                                <div className="font-bold text-slate-900">Jam 1</div>
                                <div className="text-[10px] text-slate-400 font-mono">06.30 - 07.30</div>
                            </td>
                            <td className="p-2 align-top">
                                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                                    <span className="font-semibold text-slate-800 block truncate">Upacara Bendera</span>
                                    <span className="text-[10px] text-slate-500 block">Wali Kelas / Kesiswaan</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">Lapangan Utama</span>
                                </div>
                            </td>
                            {['Selasa', 'Rabu', 'Kamis'].map((d) => (
                                <td key={d} className="p-2 align-top">
                                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                                        <span className="font-semibold text-slate-700 block truncate">Penguatan Karakter</span>
                                        <span className="text-[10px] text-slate-400 block">Wali Kelas</span>
                                    </div>
                                </td>
                            ))}
                            <td className="p-2 align-top">
                                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                                    <span className="font-semibold text-emerald-950 block truncate">Jumat Berkah / Sehat</span>
                                    <span className="text-[10px] text-emerald-700 block">Taqwa & Literasi</span>
                                </div>
                            </td>
                        </tr>

                        {/* JAM 2, 3, 4 */}
                        {[2, 3, 4].map((period) => {
                            const timeText = period === 2 ? '07.30 - 08.10' : period === 3 ? '08.10 - 08.50' : '08.50 - 09.30';
                            return (
                                <tr key={period} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-3 text-center bg-slate-50/50 border-r border-slate-100">
                                        <div className="font-bold text-slate-900">Jam {period}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{timeText}</div>
                                    </td>
                                    {days.map((d) => {
                                        const slot = getScheduleAt(d, period);
                                        const isStart = slot && slot.period_start === period;
                                        const spanCount = slot ? (slot.period_end - slot.period_start + 1) : 1;

                                        // If this slot is covered by a multi-period card starting earlier, don't render td if handled by rowspan or render continuous block
                                        if (slot && !isStart && period <= 4) {
                                            return null; // Handled by rowspan or continuous visual
                                        }

                                        return (
                                            <td
                                                key={d}
                                                rowSpan={isStart && slot.period_end <= 4 ? spanCount : 1}
                                                className="p-2 align-top border-r border-slate-100 last:border-0"
                                            >
                                                {slot ? (
                                                    <div className={`p-3 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
                                                        slot.subject?.category === 'kejuruan'
                                                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                                                            : slot.subject?.code === 'PJOK'
                                                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                                            : 'bg-white border-slate-200 text-slate-900'
                                                    }`}>
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 font-mono">
                                                                    JP {slot.period_start}-{slot.period_end}
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="font-bold text-xs leading-snug line-clamp-2">
                                                                {slot.subject?.name}
                                                            </div>
                                                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                                                <span className="font-mono font-bold text-indigo-600">[{slot.teacher?.code}]</span>
                                                                <span className="truncate">{slot.teacher?.name}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                                                            <span className="truncate font-medium">{slot.room?.name || 'Ruang Teori'}</span>
                                                            {slot.classroom && perspective !== 'class' && (
                                                                <span className="font-bold text-slate-700">{slot.classroom.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => openAddModal(d, period)}
                                                        className="h-16 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors group"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}

                        {/* ISTIRAHAT 1 */}
                        <tr className="bg-slate-100/60 border-y border-slate-200">
                            <td className="p-2 text-center bg-slate-200/50 border-r border-slate-200">
                                <span className="font-bold text-[11px] text-slate-700">Istirahat 1</span>
                                <div className="text-[10px] text-slate-500 font-mono">09.30 - 10.00</div>
                            </td>
                            <td colSpan={5} className="p-2 text-center text-xs font-semibold text-slate-500 tracking-wider uppercase">
                                ☕ Istirahat Pertama & Refresing Siswa / Pengajar (30 Menit)
                            </td>
                        </tr>

                        {/* JAM 5, 6, 7 */}
                        {[5, 6, 7].map((period) => {
                            const timeText = period === 5 ? '10.00 - 10.40' : period === 6 ? '10.40 - 11.20' : '11.20 - 12.00';
                            return (
                                <tr key={period} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-3 text-center bg-slate-50/50 border-r border-slate-100">
                                        <div className="font-bold text-slate-900">Jam {period}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{timeText}</div>
                                    </td>
                                    {days.map((d) => {
                                        const slot = getScheduleAt(d, period);
                                        const isStart = slot && slot.period_start === period;
                                        const spanCount = slot ? (slot.period_end - slot.period_start + 1) : 1;

                                        if (slot && !isStart && period >= 5 && period <= 7) {
                                            return null;
                                        }

                                        return (
                                            <td
                                                key={d}
                                                rowSpan={isStart && slot.period_end <= 7 ? spanCount : 1}
                                                className="p-2 align-top border-r border-slate-100 last:border-0"
                                            >
                                                {slot ? (
                                                    <div className={`p-3 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
                                                        slot.subject?.category === 'kejuruan'
                                                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                                                            : slot.subject?.code === 'PJOK'
                                                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                                            : 'bg-white border-slate-200 text-slate-900'
                                                    }`}>
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 font-mono">
                                                                    JP {slot.period_start}-{slot.period_end}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            <div className="font-bold text-xs leading-snug line-clamp-2">
                                                                {slot.subject?.name}
                                                            </div>
                                                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                                                <span className="font-mono font-bold text-indigo-600">[{slot.teacher?.code}]</span>
                                                                <span className="truncate">{slot.teacher?.name}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                                                            <span className="truncate font-medium">{slot.room?.name || 'Ruang Teori'}</span>
                                                            {slot.classroom && perspective !== 'class' && (
                                                                <span className="font-bold text-slate-700">{slot.classroom.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => openAddModal(d, period)}
                                                        className="h-16 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors group"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}

                        {/* ISTIRAHAT 2 / ISOMA */}
                        <tr className="bg-slate-100/60 border-y border-slate-200">
                            <td className="p-2 text-center bg-slate-200/50 border-r border-slate-200">
                                <span className="font-bold text-[11px] text-slate-700">Istirahat 2</span>
                                <div className="text-[10px] text-slate-500 font-mono">12.00 - 13.00</div>
                            </td>
                            <td colSpan={5} className="p-2 text-center text-xs font-semibold text-slate-500 tracking-wider uppercase">
                                🕌 Istirahat Kedua / ISOMA (Sholat Dzuhur & Makan Siang / Jumat Berjamaah)
                            </td>
                        </tr>

                        {/* JAM 8, 9, 10 */}
                        {[8, 9, 10].map((period) => {
                            const timeText = period === 8 ? '13.00 - 13.40' : period === 9 ? '13.40 - 14.20' : '14.20 - 15.00';
                            return (
                                <tr key={period} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-3 text-center bg-slate-50/50 border-r border-slate-100">
                                        <div className="font-bold text-slate-900">Jam {period}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{timeText}</div>
                                    </td>
                                    {days.map((d) => {
                                        // Friday afternoon has Extracurricular after 13:00
                                        if (d === 'Jumat') {
                                            if (period === 8) {
                                                return (
                                                    <td key={d} rowSpan={3} className="p-2 align-middle bg-slate-50/60 text-center">
                                                        <span className="text-[11px] font-semibold text-slate-500 block">
                                                            Ekstrakurikuler & Pembinaan Administrasi Guru
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">13.00 - 15.00</span>
                                                    </td>
                                                );
                                            }
                                            return null;
                                        }

                                        const slot = getScheduleAt(d, period);
                                        const isStart = slot && slot.period_start === period;
                                        const spanCount = slot ? (slot.period_end - slot.period_start + 1) : 1;

                                        if (slot && !isStart && period >= 8) {
                                            return null;
                                        }

                                        return (
                                            <td
                                                key={d}
                                                rowSpan={isStart && slot.period_end <= 10 ? spanCount : 1}
                                                className="p-2 align-top border-r border-slate-100 last:border-0"
                                            >
                                                {slot ? (
                                                    <div className={`p-3 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
                                                        slot.subject?.category === 'kejuruan'
                                                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                                                            : slot.subject?.code === 'PJOK'
                                                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                                            : 'bg-white border-slate-200 text-slate-900'
                                                    }`}>
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 font-mono">
                                                                    JP {slot.period_start}-{slot.period_end}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            <div className="font-bold text-xs leading-snug line-clamp-2">
                                                                {slot.subject?.name}
                                                            </div>
                                                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                                                <span className="font-mono font-bold text-indigo-600">[{slot.teacher?.code}]</span>
                                                                <span className="truncate">{slot.teacher?.name}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                                                            <span className="truncate font-medium">{slot.room?.name || 'Ruang Teori'}</span>
                                                            {slot.classroom && perspective !== 'class' && (
                                                                <span className="font-bold text-slate-700">{slot.classroom.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => openAddModal(d, period)}
                                                        className="h-16 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors group"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL: + TAMBAH / EDIT SESI JADWAL */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={selectedSlotForEdit ? 'Perbarui Sesi Jadwal' : 'Plot Sesi Jadwal Baru'}
                description={`Alokasi waktu pembelajaran untuk ${selectedClassroom?.name || 'Kelas'}`}
            >
                <form onSubmit={handleSaveSlot} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                            <select
                                value={data.classroom_id}
                                onChange={(e) => setData('classroom_id', e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                                required
                            >
                                {classrooms.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Hari</label>
                            <select
                                value={data.day}
                                onChange={(e) => setData('day', e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                                required
                            >
                                {days.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                        <select
                            value={data.subject_id}
                            onChange={(e) => setData('subject_id', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                            required
                        >
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.category === 'kejuruan' ? 'Praktik Vokasi' : 'Umum'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengampu</label>
                        <select
                            value={data.teacher_id}
                            onChange={(e) => setData('teacher_id', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                            required
                        >
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    [{t.code}] {t.name} - {t.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Ruang / Bengkel Lab</label>
                            <select
                                value={data.room_id}
                                onChange={(e) => setData('room_id', e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                            >
                                <option value="">Auto-Assign Berdasarkan Mapel</option>
                                {rooms.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.building})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai</label>
                                <select
                                    value={data.period_start}
                                    onChange={(e) => setData('period_start', parseInt(e.target.value))}
                                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs"
                                >
                                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                                        <option key={p} value={p}>Jam {p}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai</label>
                                <select
                                    value={data.period_end}
                                    onChange={(e) => setData('period_end', parseInt(e.target.value))}
                                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs"
                                >
                                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                                        <option key={p} value={p}>Jam {p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                        <input
                            type="text"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Contoh: Praktik Blok Pemrograman, Ujian Praktik, dll."
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                            {selectedSlotForEdit ? 'Simpan Perubahan' : 'Alokasikan Sesi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
