import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Building2,
    Search,
    MapPin,
    ArrowRightLeft,
    CheckCircle2,
    Users,
    Filter,
    Calendar,
    Sparkles,
    Shield,
    AlertCircle,
} from 'lucide-react';

export default function ClassroomsRelocation({
    classrooms = [],
    rooms = [],
    departments = [],
    filters = {},
}) {
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState(filters.department_id || '');
    const [selectedGrade, setSelectedGrade] = useState(filters.grade || '');

    // Relocation Modal
    const [relocateClassroom, setRelocateClassroom] = useState(null);
    const [targetRoomId, setTargetRoomId] = useState('');

    const filteredClassrooms = classrooms.filter((cls) => {
        const matchesSearch =
            cls.name.toLowerCase().includes(search.toLowerCase()) ||
            cls.code.toLowerCase().includes(search.toLowerCase()) ||
            (cls.room?.name && cls.room.name.toLowerCase().includes(search.toLowerCase())) ||
            (cls.homeroom_teacher?.name && cls.homeroom_teacher.name.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;
        if (selectedDept && String(cls.department_id) !== String(selectedDept)) return false;
        if (selectedGrade && String(cls.grade) !== String(selectedGrade)) return false;

        return true;
    });

    const handleOpenRelocate = (cls) => {
        setRelocateClassroom(cls);
        setTargetRoomId(cls.room_id || '');
    };

    const handleConfirmRelocation = (e) => {
        e.preventDefault();
        router.post(`/admin/classrooms/${relocateClassroom.id}/relocate-room`, {
            room_id: targetRoomId,
        }, {
            preserveScroll: true,
            onSuccess: () => setRelocateClassroom(null),
        });
    };

    return (
        <AdminLayout title="Relokasi Ruang Kelas">
            <Head title="Relokasi Ruang Kelas — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <Building2 className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Alokasi & Relokasi Dinamis Ruang Kelas Fisik
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Pindahkan lokasi ruangan belajar rombel secara fleksibel. Alokasi jadwal KBM, monitoring siswa, dan portal guru terupdate otomatis.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200/60">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Sinkronisasi Otomatis Antar Portal</span>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari rombel, ruang, atau wali kelas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Semua Jurusan</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.code} — {d.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Semua Tingkat</option>
                                <option value="10">Kelas X (Sepuluh)</option>
                                <option value="11">Kelas XI (Sebelas)</option>
                                <option value="12">Kelas XII (Duabelas)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Classrooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClassrooms.map((cls) => {
                        const room = cls.room;
                        return (
                            <div
                                key={cls.id}
                                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 bg-slate-100 text-slate-700 border border-slate-200">
                                                {cls.department?.code} • Kelas {cls.grade}
                                            </span>
                                            <h3 className="font-bold text-lg text-slate-900 leading-snug">
                                                {cls.name}
                                            </h3>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            cls.is_pkl ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {cls.is_pkl ? 'PKL' : 'Reguler'}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Wali Kelas: <strong>{cls.homeroom_teacher?.name || '—'}</strong></span>
                                    </div>

                                    {/* Current Room Badge */}
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                                                Lokasi Fisik Ruangan:
                                            </span>
                                            <span className="font-mono text-[11px] text-indigo-600 font-bold">
                                                {room?.code || 'NO-ROOM'}
                                            </span>
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <span className="truncate">{room?.name || 'Belum Ditetapkan'}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span>{room?.building || 'Gedung Sekolah'}</span>
                                            {room?.capacity && <span>• Kapasitas {room.capacity} Siswa</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                    <div className="text-[11px] text-slate-400">
                                        {cls.schedules?.length || 0} Sesi Jadwal
                                    </div>

                                    <button
                                        onClick={() => handleOpenRelocate(cls)}
                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                                    >
                                        <ArrowRightLeft className="w-3.5 h-3.5" />
                                        Pindah Ruangan
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Relokasi Ruang Kelas */}
            <Modal show={!!relocateClassroom} onClose={() => setRelocateClassroom(null)} maxWidth="md">
                {relocateClassroom && (
                    <form onSubmit={handleConfirmRelocation} className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Relokasi Ruang Kelas: {relocateClassroom.name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih ruangan fisik pengganti untuk kegiatan belajar mengajar rombel ini.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-500">Ruangan Saat Ini:</span>
                                    <span className="font-bold text-slate-900">
                                        {relocateClassroom.room?.name || 'Belum Ditetapkan'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Gedung / Lokasi:</span>
                                    <span className="text-slate-700">
                                        {relocateClassroom.room?.building || '—'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Pilih Ruangan Fisik Baru *
                                </label>
                                <select
                                    required
                                    value={targetRoomId}
                                    onChange={(e) => setTargetRoomId(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="">-- Pilih Ruangan & Gedung --</option>
                                    {rooms.map((rm) => (
                                        <option key={rm.id} value={rm.id}>
                                            {rm.name} ({rm.building}) — Kapasitas {rm.capacity} Siswa [{rm.type.toUpperCase()}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-start gap-2 text-xs text-indigo-950">
                                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong>Sinkronisasi Instan:</strong> Seluruh jadwal pelajaran kelas {relocateClassroom.name} akan secara otomatis berpindah ke ruangan yang dipilih pada halaman Portal Publik, Dasbor Siswa, dan Ruang Kerja Guru.
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setRelocateClassroom(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Konfirmasi & Pindahkan Sekarang
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
