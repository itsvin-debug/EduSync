import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Briefcase,
    CheckCircle2,
    XCircle,
    Clock,
    FileCheck,
    Search,
    Calendar,
    MapPin,
    AlertCircle,
    FileText,
    ArrowRight,
    User,
    Check,
} from 'lucide-react';

export default function DutyLeaves({ dutyLeaves = [], teachers = [] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
    const [selectedLeave, setSelectedLeave] = useState(null);

    const filteredLeaves = dutyLeaves.filter((leave) => {
        const matchesSearch =
            leave.teacher?.name.toLowerCase().includes(search.toLowerCase()) ||
            leave.destination.toLowerCase().includes(search.toLowerCase()) ||
            leave.purpose.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'pending') return leave.status === 'pending';
        if (statusFilter === 'approved') return leave.status === 'approved';
        if (statusFilter === 'di_luar_dinas') return leave.status === 'approved' && leave.duty_status === 'di_luar_dinas';
        if (statusFilter === 'selesai') return leave.status === 'approved' && leave.duty_status === 'selesai';
        if (statusFilter === 'rejected') return leave.status === 'rejected';

        return true;
    });

    const handleApprove = (id) => {
        if (confirm('Setujui permohonan dinas luar ini? Status akan otomatis menjadi "Di Luar Dinas".')) {
            router.post(`/admin/duty-leaves/${id}/approve`, {}, { preserveScroll: true });
        }
    };

    const handleReject = (id) => {
        if (confirm('Tolak permohonan dinas luar ini?')) {
            router.post(`/admin/duty-leaves/${id}/reject`, {}, { preserveScroll: true });
        }
    };

    const handleToggleDutyStatus = (id) => {
        router.post(`/admin/duty-leaves/${id}/toggle-status`, {}, { preserveScroll: true });
    };

    // Stats
    const countPending = dutyLeaves.filter((l) => l.status === 'pending').length;
    const countActiveDuty = dutyLeaves.filter((l) => l.status === 'approved' && l.duty_status === 'di_luar_dinas').length;
    const countFinished = dutyLeaves.filter((l) => l.status === 'approved' && l.duty_status === 'selesai').length;

    return (
        <AdminLayout title="Izin Keluar Dinas">
            <Head title="Izin Keluar Dinas — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <Briefcase className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Manajemen Izin Keluar Dinas Guru
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Workflow persetujuan surat tugas dinas luar & pelacakan status bertingkat (Di Luar Dinas → Selesai).
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Menunggu Persetujuan</span>
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-2xl font-bold text-amber-950 mt-1">
                                {countPending} <span className="text-xs font-medium text-amber-700">Permohonan</span>
                            </div>
                            <div className="text-[11px] text-amber-600 mt-0.5">Perlu diverifikasi oleh bagian Kurikulum</div>
                        </div>

                        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Sedang Di Luar Dinas</span>
                                <Briefcase className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="text-2xl font-bold text-indigo-950 mt-1">
                                {countActiveDuty} <span className="text-xs font-medium text-indigo-700">Pengajar Aktif</span>
                            </div>
                            <div className="text-[11px] text-indigo-600 mt-0.5">KBM wajib diisi materi/tugas mandiri</div>
                        </div>

                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Tugas Selesai / Terverifikasi</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold text-emerald-950 mt-1">
                                {countFinished} <span className="text-xs font-medium text-emerald-700">Surat Tugas</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">Laporan kegiatan dinas telah tervalidasi</div>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari guru, tujuan, atau keperluan dinas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
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
                                Semua ({dutyLeaves.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                Menunggu ({countPending})
                            </button>
                            <button
                                onClick={() => setStatusFilter('di_luar_dinas')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'di_luar_dinas'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                Di Luar Dinas ({countActiveDuty})
                            </button>
                            <button
                                onClick={() => setStatusFilter('selesai')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'selesai'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                                Selesai ({countFinished})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Nama Pengajar</th>
                                    <th className="px-6 py-3.5">Instansi Tujuan & Keperluan</th>
                                    <th className="px-6 py-3.5">Rentang Waktu</th>
                                    <th className="px-6 py-3.5">Status Pengajuan</th>
                                    <th className="px-6 py-3.5">Status Kedinasan (2-Step)</th>
                                    <th className="px-6 py-3.5 text-right">Aksi Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeaves.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            <Briefcase className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                                            Tidak ada riwayat permohonan dinas luar yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 leading-snug">
                                                    {leave.teacher?.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {leave.teacher?.title || 'Guru Pengampu'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                    <span>{leave.destination}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                    {leave.purpose}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {leave.start_date} {leave.end_date !== leave.start_date && `s/d ${leave.end_date}`}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                                    {leave.start_time} - {leave.end_time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {leave.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                        Menunggu Review
                                                    </span>
                                                )}
                                                {leave.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        Disetujui
                                                    </span>
                                                )}
                                                {leave.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                        Ditolak
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {leave.status === 'approved' ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                                    leave.duty_status === 'selesai'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-indigo-100 text-indigo-800 animate-pulse'
                                                                }`}
                                                            >
                                                                {leave.duty_status === 'selesai' ? (
                                                                    <>
                                                                        <Check className="w-3 h-3" />
                                                                        Status 2: Selesai
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Briefcase className="w-3 h-3" />
                                                                        Status 1: Di Luar Dinas
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>

                                                        <button
                                                            onClick={() => handleToggleDutyStatus(leave.id)}
                                                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline block"
                                                        >
                                                            {leave.duty_status === 'di_luar_dinas'
                                                                ? 'Verifikasi Laporan & Tandai Selesai →'
                                                                : 'Kembalikan ke Status Di Luar Dinas'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {leave.status === 'pending' ? (
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleApprove(leave.id)}
                                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(leave.id)}
                                                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedLeave(leave)}
                                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        Detail Laporan
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

            {/* Modal Detail Surat Tugas & Laporan Kegiatan */}
            <Modal show={!!selectedLeave} onClose={() => setSelectedLeave(null)} maxWidth="md">
                {selectedLeave && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    Dokumen Surat Tugas Dinas Luar
                                </h3>
                                <p className="text-xs text-slate-500">{selectedLeave.teacher?.name}</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold">Tujuan:</span>
                                    <div className="font-bold text-slate-900 mt-0.5">{selectedLeave.destination}</div>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold">Tanggal:</span>
                                    <div className="font-medium text-slate-800 mt-0.5">
                                        {selectedLeave.start_date} ({selectedLeave.start_time} - {selectedLeave.end_time})
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                                    Keperluan / Agenda Tugas:
                                </span>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                                    {selectedLeave.purpose}
                                </div>
                            </div>

                            <div>
                                <span className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                                    Laporan Hasil Kegiatan Dinas:
                                </span>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed italic">
                                    {selectedLeave.completion_report || 'Laporan kegiatan belum diunggah oleh pengajar.'}
                                </div>
                            </div>

                            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between">
                                <span className="text-indigo-900 font-semibold">Status 2-Step Saat Ini:</span>
                                <span className={`font-bold px-2 py-0.5 rounded ${
                                    selectedLeave.duty_status === 'selesai'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-indigo-200 text-indigo-900'
                                }`}>
                                    {selectedLeave.duty_status === 'selesai' ? 'SELESAI' : 'DI LUAR DINAS'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setSelectedLeave(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    handleToggleDutyStatus(selectedLeave.id);
                                    setSelectedLeave(null);
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                {selectedLeave.duty_status === 'di_luar_dinas' ? 'Tandai Selesai' : 'Ubah ke Di Luar Dinas'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
