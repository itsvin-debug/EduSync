import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { formatDisplayDate, formatDisplayTime } from '@/utils/date';
import {
    History,
    Shield,
    Search,
    Clock,
    User,
    Laptop,
    X,
} from 'lucide-react';

export default function AuditLogs({ auditLogs = {}, filters = {} }) {
    // Normalisasi struktur data (baik paginator Laravel maupun array langsung)
    const isPaginator = auditLogs && Array.isArray(auditLogs.data);
    const rawList = isPaginator ? auditLogs.data : (Array.isArray(auditLogs) ? auditLogs : []);

    const currentPage = isPaginator ? (auditLogs.current_page || 1) : 1;
    const totalPages = isPaginator ? (auditLogs.last_page || 1) : 1;
    const totalItems = isPaginator ? (auditLogs.total || rawList.length) : rawList.length;
    const fromItem = isPaginator ? (auditLogs.from || 0) : (rawList.length > 0 ? 1 : 0);
    const toItem = isPaginator ? (auditLogs.to || 0) : rawList.length;

    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.category || 'all');
    const searchDebounceRef = useRef(null);

    const applyFilter = (newSearch, newCategory, page = 1) => {
        router.get(
            '/admin/audit-logs',
            {
                search: newSearch,
                category: newCategory,
                page,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        searchDebounceRef.current = setTimeout(() => {
            applyFilter(val, actionFilter, 1);
        }, 400);
    };

    const handleCategoryClick = (category) => {
        setActionFilter(category);
        applyFilter(search, category, 1);
    };

    const handlePageChange = (page) => {
        applyFilter(search, actionFilter, page);
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilter('', actionFilter, 1);
    };

    const getActionBadge = (action = '') => {
        const act = String(action).toUpperCase();
        if (act.includes('CREATED') || act.includes('APPROVED') || act.includes('SETTLED')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (act.includes('DELETED') || act.includes('REJECTED')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        if (act.includes('RESET') || act.includes('FINE') || act.includes('TOGGLE')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    };

    return (
        <AdminLayout title="Histori Aktivitas Admin">
            <Head title="Histori Aktivitas Admin - EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                    <History className="w-4 h-4" />
                                </span>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Audit Trail & Rekam Jejak Aktivitas Administrator
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Log sistem keamanan terenkripsi yang merekam seluruh perubahan data master, perizinan, dan penetapan sanksi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 self-start md:self-auto">
                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Integritas Log: Aktif (Read-Only)</span>
                        </div>
                    </div>

                    {/* Quick Filter & Search Toolbar */}
                    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari aksi, deskripsi, admin, atau IP..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    aria-label="Bersihkan pencarian"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Categories Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                                    actionFilter === 'all'
                                        ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                Semua Log ({totalItems})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('STUDENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                                    actionFilter === 'STUDENT'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                                }`}
                            >
                                Siswa
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('TEACHER')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                                    actionFilter === 'TEACHER'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                                }`}
                            >
                                Guru
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('DUTY')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                                    actionFilter === 'DUTY'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                                }`}
                            >
                                Dinas Luar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('FINE')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                                    actionFilter === 'FINE'
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                                }`}
                            >
                                Denda Kas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Container with Pagination */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3.5">Waktu Kejadian</th>
                                    <th className="px-4 sm:px-6 py-3.5">Administrator</th>
                                    <th className="px-4 sm:px-6 py-3.5">Kode Aksi</th>
                                    <th className="px-4 sm:px-6 py-3.5">Uraian / Deskripsi Aktivitas</th>
                                    <th className="px-4 sm:px-6 py-3.5">Alamat IP & Session</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rawList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                            <History className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700 stroke-1" />
                                            Tidak ada riwayat aktivitas log yang cocok dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    rawList.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150"
                                        >
                                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                                                <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDisplayTime(log.created_at)}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {formatDisplayDate(log.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                    <span className="truncate max-w-[180px] sm:max-w-none">
                                                        {log.user?.name || 'Administrator'}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-none">
                                                    {log.user?.email || 'admin@edusync.sch.id'}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                                                <span className={`inline-block font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded border ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <div className="text-xs text-slate-800 dark:text-slate-200 font-medium max-w-xl leading-relaxed">
                                                    {log.description}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                                                <div className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                    <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{log.ip_address || '127.0.0.1'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Integrated Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        from={fromItem}
                        to={toItem}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
