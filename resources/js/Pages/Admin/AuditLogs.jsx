import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    History,
    Shield,
    Search,
    Clock,
    User,
    Laptop,
    Tag,
    Filter,
    CheckCircle2,
    Calendar,
} from 'lucide-react';

export default function AuditLogs({ auditLogs = [] }) {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    const filteredLogs = auditLogs.filter((log) => {
        const matchesSearch =
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.description.toLowerCase().includes(search.toLowerCase()) ||
            log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            (log.ip_address && log.ip_address.includes(search));

        if (!matchesSearch) return false;

        if (actionFilter !== 'all') {
            return log.action.toLowerCase().includes(actionFilter.toLowerCase());
        }

        return true;
    });

    const getActionBadge = (action) => {
        if (action.includes('CREATED') || action.includes('APPROVED') || action.includes('SETTLED')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (action.includes('DELETED') || action.includes('REJECTED')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        if (action.includes('RESET') || action.includes('FINE') || action.includes('TOGGLE')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    };

    return (
        <AdminLayout title="Histori Aktivitas Admin">
            <Head title="Histori Aktivitas Admin — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <History className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Audit Trail & Rekam Jejak Aktivitas Administrator
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Log sistem keamanan terenkripsi yang merekam seluruh perubahan data master, perizinan, dan penetapan sanksi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Integritas Log: Aktif (Read-Only)</span>
                        </div>
                    </div>

                    {/* Quick Filter & Search */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari aksi, deskripsi, admin, atau IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setActionFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    actionFilter === 'all'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Semua Log ({auditLogs.length})
                            </button>
                            <button
                                onClick={() => setActionFilter('STUDENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    actionFilter === 'STUDENT'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                Siswa
                            </button>
                            <button
                                onClick={() => setActionFilter('TEACHER')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    actionFilter === 'TEACHER'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                Guru
                            </button>
                            <button
                                onClick={() => setActionFilter('DUTY')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    actionFilter === 'DUTY'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                Dinas Luar
                            </button>
                            <button
                                onClick={() => setActionFilter('FINE')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    actionFilter === 'FINE'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                            >
                                Denda Kas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Waktu Kejadian</th>
                                    <th className="px-6 py-3.5">Administrator</th>
                                    <th className="px-6 py-3.5">Kode Aksi</th>
                                    <th className="px-6 py-3.5">Uraian / Deskripsi Aktivitas</th>
                                    <th className="px-6 py-3.5">Alamat IP & Session</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            <History className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                                            Tidak ada riwayat aktivitas log yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span>{log.user?.name || 'Administrator'}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {log.user?.email || 'admin@edusync.sch.id'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-800 font-medium max-w-xl">
                                                    {log.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-mono text-slate-600 flex items-center gap-1">
                                                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                                                    {log.ip_address || '127.0.0.1'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
