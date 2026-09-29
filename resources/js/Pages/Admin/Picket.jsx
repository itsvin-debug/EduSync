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
    Trash2,
    MapPin,
    AlertCircle,
    Check,
} from 'lucide-react';

export default function Picket({ picketReports = [], trashReports = [] }) {
    const [activeSection, setActiveSection] = useState('piket'); // 'piket' or 'sampah'
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
    const [selectedReport, setSelectedReport] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('Dokumentasi 5R kebersihan ruang kelas terverifikasi lengkap.');
    const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

    // Filter Pickets
    const filteredReports = picketReports.filter((report) => {
        const matchesSearch =
            report.classroom?.name?.toLowerCase().includes(search.toLowerCase()) ||
            report.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
            report.submitted_by?.name?.toLowerCase().includes(search.toLowerCase()) ||
            report.area_location?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'pending') return report.status === 'pending';
        if (statusFilter === 'approved') return report.status === 'approved';
        if (statusFilter === 'rejected') return report.status === 'rejected';

        return true;
    });

    // Filter Trash Reports
    const filteredTrashReports = trashReports.filter((report) => {
        const matchesSearch =
            report.classroom?.name?.toLowerCase().includes(search.toLowerCase()) ||
            report.teacher?.name?.toLowerCase().includes(search.toLowerCase()) ||
            report.location_tag?.toLowerCase().includes(search.toLowerCase()) ||
            report.quantity_description?.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
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

    const handleConvertTrashToFine = (reportId) => {
        const amount = prompt('Masukkan nominal denda kebersihan (Rp):', '50000');
        if (amount) {
            router.post(`/admin/trash-reports/${reportId}/convert-fine`, { amount: Number(amount) }, {
                preserveScroll: true,
                onSuccess: () => alert('Laporan sampah berhasil dikonversi menjadi sanksi denda kebersihan kelas.'),
            });
        }
    };

    const handleDismissTrash = (reportId) => {
        if (confirm('Arsipkan atau abaikan laporan sampah ini?')) {
            router.post(`/admin/trash-reports/${reportId}/dismiss`, {}, { preserveScroll: true });
        }
    };

    const countPending = picketReports.filter((p) => p.status === 'pending').length;
    const countApproved = picketReports.filter((p) => p.status === 'approved').length;
    const countRejected = picketReports.filter((p) => p.status === 'rejected').length;

    return (
        <AdminLayout title="Pusat Verifikasi Kebersihan & Piket">
            <Head title="Pusat Verifikasi Kebersihan & Piket — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-semibold text-sm">
                                    <Sparkles className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Pusat Verifikasi Kebersihan & Piket Sekolah (Cleanliness Center)
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Inbox terpadu untuk memantau, memeriksa bukti multi-foto, partisipasi regu piket dari Ketua Kelas, dan laporan sampah dari Guru.
                            </p>
                        </div>

                        {/* Section Selector Tabs */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setActiveSection('piket')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    activeSection === 'piket' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Piket Kelas Siswa ({picketReports.length})
                            </button>
                            <button
                                onClick={() => setActiveSection('sampah')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    activeSection === 'sampah' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Laporan Sampah Guru ({trashReports.length})
                            </button>
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
                            <div className="text-[11px] text-amber-600 mt-0.5">Wajib diverifikasi sebelum batas waktu 16:00 WIB</div>
                        </div>

                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Lolos 5R (Bersih)</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold text-emerald-950 mt-1">
                                {countApproved} <span className="text-xs font-medium text-emerald-700">Ruang Terverifikasi</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">Memenuhi standar kebersihan & fasilitas sekolah</div>
                        </div>

                        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Laporan Sampah / Ditolak</span>
                                <Trash2 className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="text-2xl font-bold text-rose-950 mt-1">
                                {trashReports.length} <span className="text-xs font-medium text-rose-700">Laporan Sampah</span>
                            </div>
                            <div className="text-[11px] text-rose-600 mt-0.5">Diteruskan untuk konversi denda kebersihan kelas</div>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-100">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama kelas, lokasi, atau petugas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                            />
                        </div>

                        {activeSection === 'piket' && (
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Semua ({picketReports.length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('pending')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    }`}
                                >
                                    Perlu Review ({countPending})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('approved')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        statusFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                >
                                    Terverifikasi ({countApproved})
                                </button>
                                <button
                                    onClick={() => setStatusFilter('rejected')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        statusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                    Ditolak ({countRejected})
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SECTION 1: PIKET KELAS SISWA (KETUA KELAS) */}
                    {activeSection === 'piket' && (
                        filteredReports.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <Sparkles className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                                <p className="text-xs font-medium">Tidak ada laporan piket yang sesuai filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredReports.map((report) => {
                                    const photos = report.photos && report.photos.length > 0 ? report.photos : (report.photo_path ? [report.photo_path] : []);

                                    return (
                                        <div
                                            key={report.id}
                                            className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xs transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                {/* Image Preview with delivery pill */}
                                                <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                                                    {photos[0] ? (
                                                        <img
                                                            src={`/storage/${photos[0]}`}
                                                            alt={`Piket ${report.classroom?.name}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : report.photo_url ? (
                                                        <img
                                                            src={report.photo_url}
                                                            alt={`Piket ${report.classroom?.name}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                            <ImageIcon className="w-8 h-8 mb-1" />
                                                            <span className="text-xs">Dokumentasi Piket</span>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur text-white text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                                        <Clock className="w-3 h-3 text-emerald-400" />
                                                        {report.delivery_time || '15:00 WIB'}
                                                    </div>

                                                    <div className="absolute bottom-2.5 left-2.5">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                                            report.status === 'approved'
                                                                ? 'bg-emerald-600 text-white'
                                                                : report.status === 'rejected'
                                                                ? 'bg-rose-600 text-white'
                                                                : 'bg-amber-500 text-white'
                                                        }`}>
                                                            {report.status === 'approved' ? 'Terverifikasi Bersih' : report.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Multi-Photos Strip if multiple */}
                                                {photos.length > 1 && (
                                                    <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto">
                                                        {photos.map((p, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => setSelectedPhotoModal(`/storage/${p}`)}
                                                                className="w-12 h-8 rounded overflow-hidden border border-slate-200 shrink-0"
                                                            >
                                                                <img src={`/storage/${p}`} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
                                                        <span className="text-[10px] text-slate-400 font-mono pl-1">+{photos.length} Foto</span>
                                                    </div>
                                                )}

                                                {/* Card Content */}
                                                <div className="p-4 space-y-2.5 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-bold text-sm text-slate-900">{report.classroom?.name}</h3>
                                                        <span className="font-mono text-slate-400 text-[11px]">{report.date}</span>
                                                    </div>

                                                    {report.area_location && (
                                                        <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                                                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span className="truncate">{report.area_location}</span>
                                                        </div>
                                                    )}

                                                    <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                                                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>Ketua Kelas: <strong>{report.submitted_by?.name || report.student?.name || 'Siswa'}</strong></span>
                                                    </div>

                                                    {/* Duty Participation Tags */}
                                                    {report.duty_students && report.duty_students.length > 0 && (
                                                        <div className="space-y-1 pt-1">
                                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                                                Siswa Melaksanakan Piket ({report.duty_students.length}):
                                                            </span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {report.duty_students.slice(0, 4).map((name, idx) => (
                                                                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200">
                                                                        {name}
                                                                    </span>
                                                                ))}
                                                                {report.duty_students.length > 4 && (
                                                                    <span className="text-[10px] text-slate-400 font-semibold self-center">
                                                                        +{report.duty_students.length - 4} lainnya
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] line-clamp-2">
                                                        "{report.notes}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="p-4 pt-0">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setVerificationNotes(report.validation_notes || 'Dokumentasi 5R kebersihan ruang kelas terverifikasi lengkap.');
                                                    }}
                                                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Inspeksi Detail & ACC</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* SECTION 2: LAPORAN SAMPAH & KETERTIBAN DARI GURU */}
                    {activeSection === 'sampah' && (
                        filteredTrashReports.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <Trash2 className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                                <p className="text-xs font-medium">Tidak ada laporan sampah yang dilaporkan guru.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTrashReports.map((t) => (
                                    <div
                                        key={t.id}
                                        className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                                    >
                                        <div className="space-y-1.5 max-w-2xl">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-900 text-sm">{t.classroom?.name}</span>
                                                {t.location_tag && (
                                                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200 text-[10px]">
                                                        📍 {t.location_tag}
                                                    </span>
                                                )}
                                                <span className="text-slate-400 font-mono text-[11px]">
                                                    {t.date} • {t.period_time}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    t.status === 'fined'
                                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                        : t.status === 'dismissed'
                                                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {t.status === 'fined' ? 'Denda Diterbitkan' : t.status === 'dismissed' ? 'Diarsipkan' : 'Menunggu Tindakan'}
                                                </span>
                                            </div>

                                            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                "{t.quantity_description}"
                                            </p>

                                            <div className="text-slate-500 text-[11px] flex items-center gap-3">
                                                <span>Pelapor: <strong>{t.teacher?.name || 'Guru Piket'}</strong></span>
                                                {t.department && <span>• Jurusan: <strong>{t.department.name}</strong></span>}
                                            </div>

                                            {/* Photo Preview if available */}
                                            {t.photos && t.photos.length > 0 && (
                                                <div className="flex items-center gap-2 pt-1">
                                                    {t.photos.map((p, pIdx) => (
                                                        <button
                                                            key={pIdx}
                                                            type="button"
                                                            onClick={() => setSelectedPhotoModal(`/storage/${p}`)}
                                                            className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200"
                                                        >
                                                            <img src={`/storage/${p}`} alt="Bukti" className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {t.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConvertTrashToFine(t.id)}
                                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                                                    >
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        <span>Terbitkan Sanksi Denda</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDismissTrash(t.id)}
                                                        className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                                                    >
                                                        Abaikan / Selesai
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Modal Detail & Verifikasi Piket */}
            {selectedReport && (
                <Modal isOpen={Boolean(selectedReport)} onClose={() => setSelectedReport(null)} title="Inspeksi Laporan Kebersihan">
                    <div className="p-2 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                    Inspeksi Piket — {selectedReport.classroom?.name}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Disetor oleh {selectedReport.submitted_by?.name || selectedReport.student?.name} pada {selectedReport.date} ({selectedReport.delivery_time || '15:00 WIB'})
                                </p>
                            </div>
                            <span className="font-mono text-slate-400 text-[11px]">{selectedReport.area_location}</span>
                        </div>

                        {/* Image Preview */}
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center">
                            {selectedReport.photos && selectedReport.photos[0] ? (
                                <img
                                    src={`/storage/${selectedReport.photos[0]}`}
                                    alt="Bukti Piket"
                                    className="max-h-72 w-auto object-contain"
                                />
                            ) : selectedReport.photo_path ? (
                                <img
                                    src={`/storage/${selectedReport.photo_path}`}
                                    alt="Bukti Piket"
                                    className="max-h-72 w-auto object-contain"
                                />
                            ) : (
                                <div className="py-12 text-slate-400">Tidak ada berkas gambar.</div>
                            )}
                        </div>

                        {/* Duty Participation List */}
                        {selectedReport.duty_students && selectedReport.duty_students.length > 0 && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="font-semibold text-slate-700 block mb-1">
                                    Siswa Melaksanakan Tugas Piket:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {selectedReport.duty_students.map((name, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-white text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                                            ✓ {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Catatan Hasil Inspeksi / Feedback Admin:
                            </label>
                            <textarea
                                rows="3"
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                                placeholder="Masukkan catatan inspeksi atau alasan penolakan jika tidak memenuhi standar kebersihan..."
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Tutup
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleVerify(selectedReport.id, 'rejected')}
                                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                                >
                                    Tolak (Kurang Bersih)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleVerify(selectedReport.id, 'approved')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                                >
                                    Setujui (Lolos 5R)
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal Zoom Foto */}
            {selectedPhotoModal && (
                <Modal isOpen={Boolean(selectedPhotoModal)} onClose={() => setSelectedPhotoModal(null)} title="Pratinjau Foto Dokumentasi">
                    <div className="p-2 space-y-3">
                        <img
                            src={selectedPhotoModal}
                            alt="Bukti Foto"
                            className="max-h-[70vh] w-auto mx-auto rounded-xl border border-slate-200 shadow-sm"
                        />
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedPhotoModal(null)}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
