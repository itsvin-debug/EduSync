import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Sparkles,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Image as ImageIcon,
    Video,
    User,
    Building2,
    Calendar,
    Eye,
    ShieldCheck,
    MessageSquare,
} from 'lucide-react';

export default function Picket({ picketReports = [] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
    const [selectedReport, setSelectedReport] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('Dokumentasi 5R kebersihan ruang kelas terverifikasi lengkap.');

    const filteredReports = picketReports.filter((report) => {
        const matchesSearch =
            report.classroom?.name.toLowerCase().includes(search.toLowerCase()) ||
            report.student?.name.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'pending') return report.status === 'pending';
        if (statusFilter === 'approved') return report.status === 'approved';
        if (statusFilter === 'rejected') return report.status === 'rejected';

        return true;
    });

    const handleVerify = (id, action) => {
        router.post(`/admin/picket/${id}/verify`, {
            action,
            notes: verificationNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedReport(null),
        });
    };

    const countPending = picketReports.filter((p) => p.status === 'pending').length;
    const countApproved = picketReports.filter((p) => p.status === 'approved').length;
    const countRejected = picketReports.filter((p) => p.status === 'rejected').length;

    return (
        <AdminLayout title="Pantau Piket Kelas">
            <Head title="Pantau Piket Kelas — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-semibold text-sm">
                                    <Sparkles className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Inspeksi & Monitoring Piket Kebersihan Kelas
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Galeri bukti foto dan video piket 5R harian yang diunggah oleh regu piket kelas beserta verifikasi admin.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Menunggu Inspeksi</span>
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="text-2xl font-bold text-amber-950 mt-1">
                                {countPending} <span className="text-xs font-medium text-amber-700">Laporan Piket</span>
                            </div>
                            <div className="text-[11px] text-amber-600 mt-0.5">Wajib diverifikasi sebelum batas waktu 16:00</div>
                        </div>

                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Lolos Verifikasi (Bersih)</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold text-emerald-950 mt-1">
                                {countApproved} <span className="text-xs font-medium text-emerald-700">Ruang Kelas</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">Memenuhi standar kebersihan & kerapihan sekolah</div>
                        </div>

                        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Ditolak / Belum Bersih</span>
                                <XCircle className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-2xl font-bold text-rose-950 mt-1">
                                {countRejected} <span className="text-xs font-medium text-rose-700">Laporan</span>
                            </div>
                            <div className="text-[11px] text-rose-600 mt-0.5">Diteruskan untuk piket ulang / evaluasi wali kelas</div>
                        </div>
                    </div>
                </div>

                {/* Filter and Content Grid */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-100">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama kelas atau petugas piket..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
                                Semua Bukti ({picketReports.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                Perlu Review ({countPending})
                            </button>
                            <button
                                onClick={() => setStatusFilter('approved')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'approved'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                                Terverifikasi ({countApproved})
                            </button>
                            <button
                                onClick={() => setStatusFilter('rejected')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    statusFilter === 'rejected'
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                            >
                                Ditolak ({countRejected})
                            </button>
                        </div>
                    </div>

                    {/* Gallery Cards Grid */}
                    {filteredReports.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Sparkles className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                            <p className="text-sm font-medium">Tidak ada laporan piket yang sesuai filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="rounded-xl border border-slate-200/80 bg-slate-50/40 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image/Video Preview */}
                                        <div className="relative aspect-video bg-slate-800 overflow-hidden group">
                                            {report.photo_url ? (
                                                <img
                                                    src={report.photo_url}
                                                    alt={`Piket ${report.classroom?.name}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon className="w-8 h-8 mb-1" />
                                                    <span className="text-xs">Dokumentasi Foto</span>
                                                </div>
                                            )}

                                            {/* Delivery Timestamp Pill */}
                                            <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur text-white text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                                <Clock className="w-3 h-3 text-emerald-400" />
                                                Dikirim {report.delivery_time || '15:00'}
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute bottom-2.5 left-2.5">
                                                {report.status === 'pending' && (
                                                    <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                                                        Menunggu Review
                                                    </span>
                                                )}
                                                {report.status === 'approved' && (
                                                    <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Terverifikasi Bersih
                                                    </span>
                                                )}
                                                {report.status === 'rejected' && (
                                                    <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Ditolak
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-base text-slate-900">
                                                    {report.classroom?.name}
                                                </h3>
                                                <span className="text-xs font-mono text-slate-400">
                                                    {report.date}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Petugas: <strong>{report.student?.name || 'Regu Piket Harian'}</strong></span>
                                            </div>

                                            {report.validation_notes && (
                                                <div className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/60 line-clamp-2">
                                                    "{report.validation_notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setVerificationNotes(report.validation_notes || 'Dokumentasi 5R kebersihan ruang kelas terverifikasi lengkap.');
                                            }}
                                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Inspeksi Penuh & Validasi
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail & Verifikasi Piket */}
            <Modal show={!!selectedReport} onClose={() => setSelectedReport(null)} maxWidth="lg">
                {selectedReport && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    Inspeksi Bukti Piket Kebersihan — {selectedReport.classroom?.name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Dikirim oleh {selectedReport.student?.name} pada {selectedReport.date} ({selectedReport.delivery_time || '15:00'})
                                </p>
                            </div>
                        </div>

                        {/* Image Preview Large */}
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
                            {selectedReport.photo_url ? (
                                <img
                                    src={selectedReport.photo_url}
                                    alt="Bukti Piket"
                                    className="max-h-80 w-auto object-contain"
                                />
                            ) : (
                                <div className="py-12 text-slate-400 text-sm">Tidak ada berkas gambar.</div>
                            )}
                        </div>

                        {selectedReport.video_url && (
                            <div className="mt-3">
                                <a
                                    href={selectedReport.video_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                    <Video className="w-4 h-4" />
                                    Tonton Video Bukti Kebersihan ({selectedReport.video_url})
                                </a>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Catatan Hasil Inspeksi / Feedback Admin:
                            </label>
                            <textarea
                                rows="3"
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                                placeholder="Masukkan catatan inspeksi atau alasan penolakan jika tidak memenuhi standar kebersihan..."
                            />
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleVerify(selectedReport.id, 'rejected')}
                                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                                >
                                    Tolak (Kurang Bersih)
                                </button>
                                <button
                                    onClick={() => handleVerify(selectedReport.id, 'approved')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                >
                                    Setujui (Lolos 5R)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
