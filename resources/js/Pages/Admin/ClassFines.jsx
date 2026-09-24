import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Coins,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Plus,
    Building2,
    User,
    Banknote,
    FileCheck,
    AlertCircle,
    Check,
    X,
    Filter,
} from 'lucide-react';

export default function ClassFines({ classFines = [], classrooms = [], teachers = [] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, belum_dibayar, menunggu_konfirmasi, lunas
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [settleModalFine, setSettleModalFine] = useState(null);

    // Form Add Fine
    const [formData, setFormData] = useState({
        classroom_id: '',
        amount: 50000,
        reason: 'Pelanggaran kebersihan kelas & sampah tidak dibuang ke TPS.',
    });

    const filteredFines = classFines.filter((fine) => {
        const matchesSearch =
            fine.classroom?.name.toLowerCase().includes(search.toLowerCase()) ||
            fine.reason?.toLowerCase().includes(search.toLowerCase()) ||
            fine.homeroom_teacher?.name?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'belum_dibayar') return fine.payment_status === 'belum_dibayar';
        if (statusFilter === 'menunggu_konfirmasi') return fine.payment_status === 'menunggu_konfirmasi';
        if (statusFilter === 'lunas') return fine.payment_status === 'lunas';

        return true;
    });

    const handleCreateFine = (e) => {
        e.preventDefault();
        router.post('/admin/class-fines', formData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setFormData({
                    classroom_id: '',
                    amount: 50000,
                    reason: 'Pelanggaran kebersihan kelas & sampah tidak dibuang ke TPS.',
                });
            },
        });
    };

    const handleSettleApprove = (id) => {
        router.post(`/admin/class-fines/${id}/settle`, {}, {
            preserveScroll: true,
            onSuccess: () => setSettleModalFine(null),
        });
    };

    const handleSettleReject = (id) => {
        router.post(`/admin/class-fines/${id}/reject-settlement`, {}, {
            preserveScroll: true,
            onSuccess: () => setSettleModalFine(null),
        });
    };

    // Stats
    const totalFines = classFines.reduce((acc, f) => acc + f.amount, 0);
    const totalCollected = classFines
        .filter((f) => f.payment_status === 'lunas')
        .reduce((acc, f) => acc + f.amount, 0);
    const countPendingSettlement = classFines.filter((f) => f.payment_status === 'menunggu_konfirmasi').length;
    const countUnpaid = classFines.filter((f) => f.payment_status === 'belum_dibayar').length;

    return (
        <AdminLayout title="Denda Kebersihan Kelas">
            <Head title="Denda Kebersihan Kelas — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 font-semibold text-sm">
                                    <Coins className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Manajemen & Pelunasan Denda Sampah Kelas
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Rekapitulasi sanksi denda kebersihan, status setoran kas kelas, dan verifikasi pelunasan dari Wali Kelas.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
                            >
                                <Plus className="w-4 h-4" />
                                Terbitkan Denda Manual
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Total Denda Diterbitkan
                            </div>
                            <div className="text-xl font-bold text-slate-900 mt-1">
                                Rp {totalFines.toLocaleString('id-ID')}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                Dari {classFines.length} kasus sanksi kebersihan
                            </div>
                        </div>

                        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                Kas Masuk (Lunas)
                            </div>
                            <div className="text-xl font-bold text-emerald-950 mt-1">
                                Rp {totalCollected.toLocaleString('id-ID')}
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">
                                Terverifikasi bendahara sekolah
                            </div>
                        </div>

                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                                Konfirmasi Pembayaran
                            </div>
                            <div className="text-xl font-bold text-amber-950 mt-1">
                                {countPendingSettlement} <span className="text-xs font-medium text-amber-700">Menunggu</span>
                            </div>
                            <div className="text-[11px] text-amber-600 mt-0.5">
                                Setoran diserahkan wali kelas
                            </div>
                        </div>

                        <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100">
                            <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                                Belum Dibayar
                            </div>
                            <div className="text-xl font-bold text-rose-950 mt-1">
                                {countUnpaid} <span className="text-xs font-medium text-rose-700">Kelas</span>
                            </div>
                            <div className="text-[11px] text-rose-600 mt-0.5">
                                Tagihan kas kelas aktif
                            </div>
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
                                placeholder="Cari nama kelas, alasan, atau wali kelas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
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
                                Semua ({classFines.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('menunggu_konfirmasi')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'menunggu_konfirmasi'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                Konfirmasi Kasir ({countPendingSettlement})
                            </button>
                            <button
                                onClick={() => setStatusFilter('belum_dibayar')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'belum_dibayar'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                                Belum Lunas ({countUnpaid})
                            </button>
                            <button
                                onClick={() => setStatusFilter('lunas')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'lunas'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                                Lunas
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Kelas & Penanggung Jawab</th>
                                    <th className="px-6 py-3.5">Nominal Denda</th>
                                    <th className="px-6 py-3.5">Alasan Sanksi</th>
                                    <th className="px-6 py-3.5">Tanggal Terbit</th>
                                    <th className="px-6 py-3.5">Status Pembayaran</th>
                                    <th className="px-6 py-3.5 text-right">Aksi Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFines.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            <Coins className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                                            Tidak ada data denda kebersihan kelas yang sesuai kriteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFines.map((fine) => (
                                        <tr key={fine.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {fine.classroom?.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    Wali Kelas: {fine.homeroom_teacher?.name || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-slate-900 text-base">
                                                    Rp {fine.amount.toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-700 max-w-sm">
                                                    {fine.reason}
                                                </div>
                                                {fine.payment_notes && (
                                                    <div className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200/60">
                                                        Catatan: {fine.payment_notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-mono text-slate-700">
                                                    {new Date(fine.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {fine.payment_status === 'belum_dibayar' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                                                        Belum Dibayar
                                                    </span>
                                                )}
                                                {fine.payment_status === 'menunggu_konfirmasi' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                        Menunggu Konfirmasi
                                                    </span>
                                                )}
                                                {fine.payment_status === 'lunas' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        Lunas
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {fine.payment_status === 'menunggu_konfirmasi' && (
                                                    <button
                                                        onClick={() => setSettleModalFine(fine)}
                                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                                    >
                                                        Review Setoran
                                                    </button>
                                                )}
                                                {fine.payment_status === 'belum_dibayar' && (
                                                    <button
                                                        onClick={() => handleSettleApprove(fine.id)}
                                                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                                                    >
                                                        Tandai Lunas
                                                    </button>
                                                )}
                                                {fine.payment_status === 'lunas' && (
                                                    <span className="text-xs text-emerald-600 font-medium">
                                                        Terverifikasi
                                                    </span>
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

            {/* Modal Terbitkan Denda Manual */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateFine} className="p-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Coins className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Terbitkan Denda Kebersihan Kelas</h3>
                            <p className="text-xs text-slate-500">Penetapan denda pelanggaran tata tertib dan 5R kebersihan.</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Pilih Kelas Penerima Sanksi *
                            </label>
                            <select
                                required
                                value={formData.classroom_id}
                                onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            >
                                <option value="">-- Pilih Ruang Kelas --</option>
                                {classrooms.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.department?.name || 'Reguler'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nominal Sanksi Denda (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                min="5000"
                                step="5000"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Alasan & Uraian Pelanggaran *
                            </label>
                            <textarea
                                rows="3"
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                        >
                            Terbitkan Sanksi
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Settlement Approval / Workflow Konfirmasi Pembayaran */}
            <Modal show={!!settleModalFine} onClose={() => setSettleModalFine(null)} maxWidth="md">
                {settleModalFine && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Verifikasi Pengajuan Pelunasan Denda
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Kelas: <strong>{settleModalFine.classroom?.name}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3.5 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Nominal Tagihan:</span>
                                    <span className="font-bold font-mono text-slate-900 text-sm">
                                        Rp {settleModalFine.amount.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Wali Kelas:</span>
                                    <span className="font-medium text-slate-800">
                                        {settleModalFine.homeroom_teacher?.name || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Alasan Pelanggaran:</span>
                                    <span className="text-slate-700 text-right max-w-[200px]">
                                        {settleModalFine.reason}
                                    </span>
                                </div>
                            </div>

                            {settleModalFine.payment_notes && (
                                <div>
                                    <span className="font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                                        Catatan / Berita Pembayaran:
                                    </span>
                                    <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/60 text-amber-900">
                                        {settleModalFine.payment_notes}
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-slate-600 text-xs leading-relaxed">
                                Pastikan uang denda telah disetorkan secara fisik atau melalui transfer kas resmi sekolah sebelum menyetujui status <strong>Lunas</strong>.
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={() => setSettleModalFine(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleSettleReject(settleModalFine.id)}
                                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                                >
                                    Tolak Pengajuan
                                </button>
                                <button
                                    onClick={() => handleSettleApprove(settleModalFine.id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                >
                                    Setujui & Tandai Lunas
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
