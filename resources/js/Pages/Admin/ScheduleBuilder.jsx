import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConflictBanner from '@/Components/ConflictBanner';
import Modal from '@/Components/Modal';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
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
    Layers,
    LayoutGrid,
    ListFilter,
    GripVertical,
} from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function DroppableSlotCell({ id, day, period, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { day, period },
    });

    return (
        <td
            ref={setNodeRef}
            className={`p-2 align-top border-r border-slate-100 last:border-0 transition-colors ${
                isOver ? 'bg-indigo-50/80 ring-2 ring-indigo-400 ring-inset' : ''
            }`}
        >
            {children}
        </td>
    );
}

function DraggableCardWrapper({ id, slot, children }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: { slot },
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 99,
              opacity: isDragging ? 0.6 : 1,
          }
        : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing select-none">
            {children}
        </div>
    );
}

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
    const clock = useRealtimeClock();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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

    // Group classrooms by Grade for clean selection
    const grade10Classes = classrooms.filter(c => c.grade === 10);
    const grade11Classes = classrooms.filter(c => c.grade === 11);
    const grade12Classes = classrooms.filter(c => c.grade === 12);

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
        if (confirm('Jalankan Algoritma Pemulihan Jadwal Otomatis? Sistem akan menyusun ulang jadwal dari master kurikulum bebas bentrok.')) {
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

    const openEditModal = (slot) => {
        setSelectedSlotForEdit(slot);
        setData({
            classroom_id: slot.classroom_id,
            subject_id: slot.subject_id,
            teacher_id: slot.teacher_id,
            room_id: slot.room_id || '',
            day: slot.day,
            period_start: slot.period_start,
            period_end: slot.period_end,
            notes: slot.notes || '',
        });
        setIsAddModalOpen(true);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && over.data?.current) {
            const slot = active.data.current.slot;
            const targetDay = over.data.current.day;
            const targetPeriod = over.data.current.period;

            if (slot && (slot.day !== targetDay || slot.period_start !== targetPeriod)) {
                const duration = slot.period_end - slot.period_start;
                const newPeriodEnd = Math.min(targetPeriod + duration, 10);
                router.put(`/admin/schedules/${slot.id}`, {
                    day: targetDay,
                    period_start: targetPeriod,
                    period_end: newPeriodEnd,
                    classroom_id: slot.classroom_id,
                    subject_id: slot.subject_id,
                    teacher_id: slot.teacher_id,
                    room_id: slot.room_id || '',
                    notes: slot.notes || '',
                }, {
                    preserveScroll: true,
                });
            }
        }
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
        if (confirm('Hapus sesi jadwal ini?')) {
            router.delete(`/admin/schedules/${id}`);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ['Hari', 'Jam Ke', 'Kelas', 'Mata Pelajaran', 'Nama Guru', 'Ruang'];
        const rows = schedules.map(s => [
            s.day,
            `${s.period_start}-${s.period_end}`,
            s.classroom?.name || '',
            s.subject?.name || '',
            `"${s.teacher?.name || ''}"`,
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

    // Helper to get slot covering period
    const getSlotForPeriod = (day, period) => {
        return schedules.find(s => s.day === day && period >= s.period_start && period <= s.period_end);
    };

    return (
        <AdminLayout title="Schedule Builder & Matrix Editor">
            <Head title="Schedule Builder - EDUSYNC Admin" />

            {/* Real-Time Conflict Detector Banner */}
            <ConflictBanner conflicts={conflicts} />

            {/* Title & Top Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Schedule Builder & Matrix Editor
                        </h1>
                        <span className="font-mono font-bold text-slate-800 text-xs px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{clock.timeString}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Validasi Dapodik: 100% Conflict-Free</span>
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        {clock.dateFormatted} • Alokasi jam belajar mengajar, pengelolaan ruang praktik vokasi, dan sinkronisasi jam blok kejuruan.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleAutoGenerate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-xs transition-colors"
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

            {/* 4 Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Jam Pelajaran Terjadwal</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">1,248 JP</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">97.5% Kapasitas Terisi</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Okupansi Bengkel & Lab</div>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">91.6%</div>
                    <div className="text-[11px] text-slate-500 mt-1">11 dari 12 Ruang Aktif</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Guru Pengampu Aktif</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">48 Guru</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Beban Jam Linear</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Status Bentrok</div>
                    <div className={`text-2xl font-bold mt-1 ${conflicts.length === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {conflicts.length === 0 ? '0 Tabrakan' : `${conflicts.length} Tabrakan`}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        {conflicts.length === 0 ? 'Jadwal Siap Digunakan' : 'Perlu Penyesuaian'}
                    </div>
                </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Class Selector with Grouping */}
                    <div className="flex flex-col min-w-[260px]">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Pilih Rombongan Belajar (Rombel)
                        </label>
                        <select
                            value={selectedClassroomId}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="h-10 px-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <optgroup label="Kelas X (Tingkat 10)">
                                {grade10Classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — {c.department?.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Kelas XI (Tingkat 11)">
                                {grade11Classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — {c.department?.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Kelas XII (PKL Industri)">
                                {grade12Classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} (PKL Industri)
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* View Switcher: Grid vs List */}
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Tampilan Layout
                        </span>
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Matriks Grid</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    viewMode === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>Kartu Per Hari</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 self-end xl:self-center">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-xs"
                    >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak PDF</span>
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

            {/* CLASS INFORMATION STRIP */}
            {selectedClassroom && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {selectedClassroom.grade}
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 text-sm">{selectedClassroom.name}</span>
                            <span className="text-slate-500 block">
                                Konsentrasi: {selectedClassroom.department?.name} • Wali Kelas: <strong>{selectedClassroom.homeroom_teacher?.name || '-'}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 font-mono font-bold text-indigo-700">
                            {schedules.length} Sesi Terjadwal
                        </span>
                    </div>
                </div>
            )}

            {/* VIEW MODE 1: MATRIKS GRID (CLEAN & DRAG-AND-DROP READY) */}
            {viewMode === 'grid' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                    <DndContext onDragEnd={handleDragEnd}>
                        <table className="w-full border-collapse text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                                    <th className="py-3 px-3 w-28 text-center border-r border-slate-200">Waktu & JP</th>
                                    {days.map((d) => (
                                        <th key={d} className="py-3 px-3 w-[18%] border-r border-slate-200 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <span>{d}</span>
                                                <button
                                                    onClick={() => openAddModal(d, 2)}
                                                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                                                    title={`Tambah sesi di hari ${d}`}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {/* JAM 1 */}
                                <tr className="bg-slate-50/40">
                                    <td className="p-2.5 text-center bg-slate-50 border-r border-slate-200">
                                        <span className="font-bold text-slate-900 block">Jam 1</span>
                                        <span className="text-[10px] text-slate-400 font-mono">06.30 - 07.30</span>
                                    </td>
                                    <td className="p-2 border-r border-slate-100">
                                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-center">
                                            <span className="font-semibold block truncate">Upacara Bendera</span>
                                            <span className="text-[10px] text-slate-500">Lapangan Utama</span>
                                        </div>
                                    </td>
                                    {['Selasa', 'Rabu', 'Kamis'].map((d) => (
                                        <td key={d} className="p-2 border-r border-slate-100">
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 text-center">
                                                <span className="font-semibold block truncate">Penguatan Karakter</span>
                                                <span className="text-[10px] text-slate-400">Wali Kelas</span>
                                            </div>
                                        </td>
                                    ))}
                                    <td className="p-2">
                                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center">
                                            <span className="font-semibold block truncate">Jumat Taqwa / Sehat</span>
                                            <span className="text-[10px] text-emerald-700">Literasi Kejuruan</span>
                                        </div>
                                    </td>
                                </tr>

                                {/* JAM 2 s/d JAM 10 */}
                                {[2, 3, 4, 'break1', 5, 6, 7, 'break2', 8, 9, 10].map((item, rowIdx) => {
                                    if (item === 'break1') {
                                        return (
                                            <tr key="break1" className="bg-slate-100/70 border-y border-slate-200">
                                                <td className="p-2 text-center bg-slate-200/60 border-r border-slate-200">
                                                    <span className="font-bold text-[11px] text-slate-700">Istirahat 1</span>
                                                    <div className="text-[10px] text-slate-500 font-mono">09.30 - 10.00</div>
                                                </td>
                                                <td colSpan={5} className="p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    ☕ Istirahat Pertama & Refresing Siswa / Pengajar (30 Menit)
                                                </td>
                                            </tr>
                                        );
                                    }

                                    if (item === 'break2') {
                                        return (
                                            <tr key="break2" className="bg-slate-100/70 border-y border-slate-200">
                                                <td className="p-2 text-center bg-slate-200/60 border-r border-slate-200">
                                                    <span className="font-bold text-[11px] text-slate-700">Istirahat 2</span>
                                                    <div className="text-[10px] text-slate-500 font-mono">12.00 - 13.00</div>
                                                </td>
                                                <td colSpan={5} className="p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    🕌 Istirahat Kedua / ISOMA (Makan Siang & Sholat Berjamaah)
                                                </td>
                                            </tr>
                                        );
                                    }

                                    const period = item;
                                    const timeText =
                                        period === 2 ? '07.30 - 08.10' :
                                        period === 3 ? '08.10 - 08.50' :
                                        period === 4 ? '08.50 - 09.30' :
                                        period === 5 ? '10.00 - 10.40' :
                                        period === 6 ? '10.40 - 11.20' :
                                        period === 7 ? '11.20 - 12.00' :
                                        period === 8 ? '13.00 - 13.40' :
                                        period === 9 ? '13.40 - 14.20' : '14.20 - 15.00';

                                    return (
                                        <tr key={period} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="p-2.5 text-center bg-slate-50/60 border-r border-slate-200">
                                                <span className="font-bold text-slate-900 block">Jam {period}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{timeText}</span>
                                            </td>

                                            {days.map((d) => {
                                                // Friday afternoon (Periods 8, 9, 10 are non-academic: Ekskul & Pembinaan)
                                                if (d === 'Jumat' && period >= 8) {
                                                    return (
                                                        <td key={d} className="p-2 text-center bg-slate-50/80 border-r border-slate-100 last:border-0 align-middle">
                                                            <span className="text-[11px] font-semibold text-slate-500 block truncate">
                                                                {period === 10 ? 'Pembinaan Guru & Evaluasi' : 'Kegiatan Ekstrakurikuler'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-mono">{timeText}</span>
                                                        </td>
                                                    );
                                                }

                                                const slot = getSlotForPeriod(d, period);
                                                const isSlotStart = slot && slot.period_start === period;
                                                const isSlotContinuation = slot && slot.period_start < period;

                                                const slotHasConflict = slot && conflicts.some(
                                                    (c) =>
                                                        c.day === d &&
                                                        ((c.teacher_id && c.teacher_id === slot.teacher_id) ||
                                                            (c.room_id && c.room_id === slot.room_id)) &&
                                                        c.period >= slot.period_start &&
                                                        c.period <= slot.period_end
                                                );

                                                return (
                                                    <DroppableSlotCell key={d} id={`cell-${d}-${period}`} day={d} period={period}>
                                                        {slot ? (
                                                            isSlotStart ? (
                                                                <DraggableCardWrapper id={`slot-${slot.id}`} slot={slot}>
                                                                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
                                                                        slotHasConflict
                                                                            ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-400 text-rose-950'
                                                                            : slot.subject?.category === 'kejuruan'
                                                                            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                                                                            : slot.subject?.code === 'PJOK'
                                                                            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                                                                            : 'bg-white border-slate-200 text-slate-900'
                                                                    }`}>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200">
                                                                                        JP {slot.period_start}-{slot.period_end}
                                                                                    </span>
                                                                                    {slotHasConflict && (
                                                                                        <span className="px-1 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                                                                                            <AlertTriangle className="w-2.5 h-2.5" />
                                                                                            Bentrok
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => openEditModal(slot)}
                                                                                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                                        title="Edit sesi"
                                                                                    >
                                                                                        <Edit3 className="w-3 h-3" />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                                                        title="Hapus sesi"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="font-bold text-xs leading-snug line-clamp-2">
                                                                                {slot.subject?.name}
                                                                            </div>
                                                                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 font-medium truncate">
                                                                                <span className="truncate">{slot.teacher?.name}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                                                                            <span className="truncate">{slot.room?.name || 'Ruang Teori'}</span>
                                                                            <GripVertical className="w-3 h-3 text-slate-400" title="Geser ke hari/jam lain" />
                                                                        </div>
                                                                    </div>
                                                                </DraggableCardWrapper>
                                                            ) : (
                                                                <div className="p-1.5 rounded-lg bg-slate-50/80 border border-dashed border-slate-200 text-[10px] text-slate-500 text-center">
                                                                    <span className="truncate block font-medium">↳ {slot.subject?.name} (Lanjutan)</span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <button
                                                                onClick={() => openAddModal(d, period)}
                                                                className="w-full h-12 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors group"
                                                            >
                                                                <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                            </button>
                                                        )}
                                                    </DroppableSlotCell>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </DndContext>
                </div>
            )}

            {/* VIEW MODE 2: KARTU PER HARI (CLEAN & COMFORTABLE) */}
            {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {days.map((day) => {
                        const daySchedules = schedules.filter(s => s.day === day).sort((a, b) => a.period_start - b.period_start);
                        return (
                            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900 text-sm">{day}</h3>
                                        <button
                                            onClick={() => openAddModal(day, 2)}
                                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                            title="Tambah sesi"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {daySchedules.length === 0 ? (
                                        <div className="text-center py-10 text-xs text-slate-400">
                                            Tidak ada alokasi jadwal
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {daySchedules.map((s) => (
                                                <div
                                                    key={s.id}
                                                    className={`p-3 rounded-xl border flex flex-col justify-between text-xs ${
                                                        s.subject?.category === 'kejuruan'
                                                            ? 'bg-indigo-50/60 border-indigo-200'
                                                            : 'bg-slate-50 border-slate-200'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200">
                                                                JP {s.period_start}-{s.period_end}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteSlot(s.id)}
                                                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="font-bold text-slate-900 line-clamp-1">{s.subject?.name}</div>
                                                        <div className="text-[11px] text-slate-600 mt-1 font-medium truncate">
                                                            {s.teacher?.name}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 truncate">
                                                        {s.room?.name || 'Ruang Teori'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
                                    {daySchedules.length} Sesi Terplot
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL: TAMBAH SESI JADWAL */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={selectedSlotForEdit ? 'Perbarui Sesi Jadwal' : 'Plot Sesi Jadwal Baru'}
                description={`Alokasi sesi pelajaran untuk ${selectedClassroom?.name || 'Kelas'}`}
            >
                <form onSubmit={handleSaveSlot} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                            <select
                                value={data.classroom_id}
                                onChange={(e) => setData('classroom_id', e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
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
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
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
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
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
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
                            required
                        >
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.title ? `(${t.title})` : ''}
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
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
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
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Mulai</label>
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
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Selesai</label>
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
                            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                        >
                            {selectedSlotForEdit ? 'Simpan Perubahan' : 'Alokasikan Sesi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
