import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';
import { UserCheck, CheckCircle2, XCircle, Clock, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

export default function InvalManagement({ invalRequests = [], teachers = [] }) {
    const [approveTargetId, setApproveTargetId] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);

    const handleApprove = (id) => {
        setApproveTargetId(id);
    };

    const handleConfirmApprove = () => {
        if (!approveTargetId) return;
        router.post(`/admin/inval/${approveTargetId}/approve`, {}, {
            preserveScroll: true,
            onFinish: () => setApproveTargetId(null),
        });
    };

    const handleReject = (id) => {
        setRejectModal({ id, reason: '' });
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!rejectModal) return;
        router.post(`/admin/inval/${rejectModal.id}/reject`, { notes: rejectModal.reason }, {
            preserveScroll: true,
            onFinish: () => setRejectModal(null),
        });
    };

    return (
        <AdminLayout title="Substitusi Guru (Inval)">
            <Head title="Manajemen Inval - EDUSYNC Admin" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Substitusi & Guru Pengganti (Inval)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Persetujuan izin guru berhalangan hadir dan penugasan guru piket/pengganti pada jam pelajaran vokasi.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Daftar Permohonan Substitusi
                    </span>
                    <span className="text-xs text-slate-400">Total: {invalRequests.length} Permohonan</span>
                </div>

                {invalRequests.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400">
                        Tidak ada pengajuan penggantian jam guru saat ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[760px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4">Guru Pemohon</th>
                                    <th className="py-3 px-4">Guru Pengganti</th>
                                    <th className="py-3 px-4">Jadwal & Kelas</th>
                                    <th className="py-3 px-4">Tanggal & Alasan</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi Kurikulum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invalRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors duration-200 ease-bouncy">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{req.requester?.name}</div>
                                            <div className="text-[11px] text-slate-500">{req.requester?.title || 'Guru Pengampu'}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-indigo-700">{req.substitute?.name || 'Belum Ditentukan'}</div>
                                            <div className="text-[11px] text-slate-500">{req.substitute?.title || (req.substitute ? 'Guru Pengganti' : '-')}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-900">{req.schedule?.classroom?.name}</div>
                                            <div className="text-[11px] text-slate-500">{req.schedule?.subject?.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {req.schedule?.day} (Jam ke-{req.schedule?.period_start}-{req.schedule?.period_end})
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs">
                                            <div className="font-mono text-[11px] text-slate-700 font-semibold">{req.date}</div>
                                            <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{req.reason}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                                req.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : req.status === 'rejected'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu ACC'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors duration-200 ease-bouncy shadow-xs"
                                                    >
                                                        ACC
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-[11px] transition-colors duration-200 ease-bouncy"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-[11px]">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi ACC Inval */}
            <ConfirmModal
                isOpen={!!approveTargetId}
                onClose={() => setApproveTargetId(null)}
                onConfirm={handleConfirmApprove}
                title="Setujui Substitusi Pengajar (Inval)"
                message="Setujui permohonan substitusi guru mengajar ini? Jadwal KBM dan notifikasi akan diselaraskan ke guru pengganti."
                confirmText="Setujui Inval"
                cancelText="Batal"
                type="primary"
            />

            {/* Modal Tolak Inval dengan Alasan */}
            {rejectModal && (
                <Modal isOpen={Boolean(rejectModal)} onClose={() => setRejectModal(null)} title="Tolak Pengajuan Inval Guru">
                    <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Alasan Penolakan</label>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                placeholder="Contoh: Jadwal guru pengganti bentrok / tidak ada guru piket standby."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 h-24 resize-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setRejectModal(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                            >
                                Tolak Pengajuan
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AdminLayout>
    );
}
