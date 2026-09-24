import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { UserCheck, CheckCircle2, XCircle, Clock, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

export default function InvalManagement({ invalRequests = [], teachers = [] }) {
    const handleApprove = (id) => {
        if (confirm('Setujui pengajuan substitusi guru mengajar ini?')) {
            router.post(`/admin/inval/${id}/approve`);
        }
    };

    const handleReject = (id) => {
        const reason = prompt('Masukkan alasan penolakan substitusi:');
        if (reason) {
            router.post(`/admin/inval/${id}/reject`, { notes: reason });
        }
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
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{req.requester?.name}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">Kode: {req.requester?.code}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-indigo-700">{req.substitute?.name || 'Belum Ditentukan'}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">Kode: {req.substitute?.code || '-'}</div>
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
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-xs"
                                                    >
                                                        ACC
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-[11px] transition-colors"
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
        </AdminLayout>
    );
}
