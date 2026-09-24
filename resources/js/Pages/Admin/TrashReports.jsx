import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Trash2,
    Coins,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    User,
    Building2,
    Calendar,
    ArrowRight,
    AlertOctagon,
    Banknote,
    Archive,
} from 'lucide-react';

export default function TrashReports({ trashReports = [], classrooms = [], teachers = [] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, fined, dismissed
    const [fineModalReport, setFineModalReport] = useState(null);
    const [fineAmount, setFineAmount] = useState(50000);

    const filteredReports = trashReports.filter((report) => {
        const matchesSearch =
            report.classroom?.name.toLowerCase().includes(search.toLowerCase()) ||
            report.teacher?.name.toLowerCase().includes(search.toLowerCase()) ||
            report.quantity_description?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'pending') return report.status === 'pending';
        if (statusFilter === 'fined') return report.status === 'fined';
        if (statusFilter === 'dismissed') return report.status === 'dismissed';

        return true;
    });

    const handleConvertToFine = (e) => {
        e.preventDefault();
        router.post(`/admin/trash-reports/${fineModalReport.id}/convert-fine`, {
            amount: fineAmount,
        }, {
            preserveScroll: true,
            onSuccess: () => setFineModalReport(null),
        });
    };

    const handleDismiss = (id) => {
        if (confirm('Arsipkan / abaikan laporan sampah ini tanpa denda?')) {
            router.post(`/admin/trash-reports/${id}/dismiss`, {}, { preserveScroll: true });
        }
    };

    const countPending = trashReports.filter((r) => r.status === 'pending').length;
    const countFined = trashReports.filter((r) => r.status === 'fined').length;
    const countDismissed = trashReports.filter((r) => r.status === 'dismissed').length;

    return (
        <AdminLayout title="Laporan Sampah Pengajar">
            <Head title="Laporan Sampah Pengajar — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 font-semibold text-sm">
                                    <Trash2 className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Laporan Sampah & Ketertiban Kelas dari Guru
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Aduan dari tenaga pendidik terkait sampah yang ditinggalkan di dalam kelas beserta konversi sanksi denda.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Menunggu Tindak Lanjut</span>
                                <AlertOctagon className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-2xl font-bold text-amber-950 mt-1">
                                {countPending} <span className="text-xs font-medium text-amber-700">Laporan</span>
                            </div>
                            <div className="text-[11px] text-amber-600 mt-0.5">Dapat dikonversi menjadi denda kebersihan</div>
                        </div>

                        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Diterbitkan Sanksi Denda</span>
                                <Coins className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-2xl font-bold text-rose-950 mt-1">
                                {countFined} <span className="text-xs font-medium text-rose-700">Kasus</span>
                            </div>
                            <div className="text-[11px] text-rose-600 mt-0.5">Diteruskan ke modul kas denda kelas</div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Diarsipkan / Diabaikan</span>
                                <Archive className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">
                                {countDismissed} <span className="text-xs font-medium text-slate-500">Laporan</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Telah diselesaikan secara persuasif</div>
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
                                placeholder="Cari kelas, nama guru, atau volume sampah..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
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
                                Semua Laporan ({trashReports.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                Menunggu Tindakan ({countPending})
                            </button>
                            <button
                                onClick={() => setStatusFilter('fined')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'fined'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                                Telah Didenda ({countFined})
                            </button>
                            <button
                                onClick={() => setStatusFilter('dismissed')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'dismissed'
                                        ? 'bg-slate-700 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Diarsipkan ({countDismissed})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Kelas Pelanggar</th>
                                    <th className="px-6 py-3.5">Guru Pelapor</th>
                                    <th className="px-6 py-3.5">Deskripsi / Volume Sampah</th>
                                    <th className="px-6 py-3.5">Waktu Laporan</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Aksi Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            <Trash2 className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                                            Tidak ada laporan sampah yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {report.classroom?.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Wali Kelas: {report.classroom?.homeroom_teacher?.name || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 leading-snug">
                                                    {report.teacher?.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {report.teacher?.title || 'Guru Pengampu'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 max-w-md">
                                                    {report.quantity_description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-mono text-slate-700 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                    {new Date(report.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {report.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                        Belum Diproses
                                                    </span>
                                                )}
                                                {report.status === 'fined' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <Coins className="w-3.5 h-3.5 text-rose-500" />
                                                        Diterbitkan Denda
                                                    </span>
                                                )}
                                                {report.status === 'dismissed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                        <Archive className="w-3.5 h-3.5 text-slate-400" />
                                                        Diarsipkan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {report.status === 'pending' ? (
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                setFineModalReport(report);
                                                                setFineAmount(50000);
                                                            }}
                                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
                                                        >
                                                            <Coins className="w-3.5 h-3.5" />
                                                            Jadikan Denda Kelas
                                                        </button>
                                                        <button
                                                            onClick={() => handleDismiss(report.id)}
                                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                                                        >
                                                            Abaikan
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Selesai</span>
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

            {/* Modal Terbitkan Denda dari Sampah */}
            <Modal show={!!fineModalReport} onClose={() => setFineModalReport(null)} maxWidth="md">
                {fineModalReport && (
                    <form onSubmit={handleConvertToFine} className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    Tetapkan Denda Kebersihan Kelas
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Konversi aduan sampah untuk kelas: <strong>{fineModalReport.classroom?.name}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                                <span className="font-semibold text-slate-500 block mb-0.5">Keterangan Pelanggaran:</span>
                                {fineModalReport.quantity_description}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nominal Denda (Rupiah) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        required
                                        min="5000"
                                        step="5000"
                                        value={fineAmount}
                                        onChange={(e) => setFineAmount(parseInt(e.target.value) || 0)}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Standar denda sekolah: Rp 20.000 s/d Rp 100.000 tergantung volume sampah.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setFineModalReport(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Terbitkan Denda Sekarang
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
