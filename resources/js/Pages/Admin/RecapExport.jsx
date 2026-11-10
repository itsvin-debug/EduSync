import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { formatDisplayDate, formatDisplayTime } from '@/utils/date';
import {
    FileSpreadsheet,
    Printer,
    Download,
    Filter,
    Users,
    UserCheck,
    Coins,
} from 'lucide-react';

export default function RecapExport({
    studentRecap = [],
    teacherRecap = [],
    finesRecap = [],
    filters = {},
}) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [activeTab, setActiveTab] = useState(filters.type || 'siswa'); // siswa, guru, denda

    // Pagination State (15 items per page on web view)
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 15;

    // Reset pagination when tab or dates change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleFilterDate = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        router.get(
            '/admin/recap-export',
            {
                start_date: startDate,
                end_date: endDate,
                type: activeTab,
            },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    // Client-side CSV export across entire date range
    const handleExportCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        const fileName = `Rekap_${activeTab.toUpperCase()}_${startDate}_sd_${endDate}.csv`;

        if (activeTab === 'siswa') {
            csvContent += 'No,Tanggal,Nama Siswa,Kelas,Status,Waktu Presensi,Keterangan\n';
            studentRecap.forEach((row, idx) => {
                const formattedDate = formatDisplayDate(row.date);
                csvContent += `"${idx + 1}","${formattedDate}","${row.student?.name || ''}","${row.classroom?.name || ''}","${(row.status || '').toUpperCase()}","${row.submission_time || ''}","${row.notes || ''}"\n`;
            });
        } else if (activeTab === 'guru') {
            csvContent += 'No,Tanggal,Nama Guru,NIP,Status,Jam Masuk,Keterangan\n';
            teacherRecap.forEach((row, idx) => {
                const formattedDate = formatDisplayDate(row.date);
                csvContent += `"${idx + 1}","${formattedDate}","${row.teacher?.name || ''}","${row.teacher?.nip || ''}","${(row.status || '').toUpperCase()}","${row.check_in_time || ''}","${row.notes || ''}"\n`;
            });
        } else {
            csvContent += 'No,Tanggal,Kelas,Wali Kelas,Nominal (Rp),Status Pembayaran,Alasan\n';
            finesRecap.forEach((row, idx) => {
                const formattedDate = formatDisplayDate(row.created_at);
                csvContent += `"${idx + 1}","${formattedDate}","${row.classroom?.name || ''}","${row.homeroom_teacher?.name || ''}","${row.amount}","${(row.payment_status || '').toUpperCase()}","${row.reason || ''}"\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Slice current dataset for on-screen pagination
    const currentDataset = useMemo(() => {
        if (activeTab === 'siswa') return studentRecap;
        if (activeTab === 'guru') return teacherRecap;
        return finesRecap;
    }, [activeTab, studentRecap, teacherRecap, finesRecap]);

    const totalItems = currentDataset.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const fromIndex = totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const toIndex = Math.min(currentPage * perPage, totalItems);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return currentDataset.slice(start, start + perPage);
    }, [currentDataset, currentPage, perPage]);

    return (
        <AdminLayout title="Rekap & Export Laporan">
            <Head title="Rekap & Export Laporan - EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs print:hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </span>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Engine Rekapitulasi Data & Ekspor Dokumen
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Unduh rekapitulasi presensi harian siswa, absensi guru, serta catatan denda kebersihan ke format Excel (CSV) dan PDF Siap Cetak.
                            </p>
                        </div>

                        {/* Export & Print Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleExportCSV}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors duration-150 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh Spreadsheet (CSV)</span>
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors duration-150 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Cetak PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Form */}
                    <form
                        onSubmit={handleFilterDate}
                        className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                                Dari:
                            </span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                                Sampai:
                            </span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan Rentang Tanggal</span>
                        </button>
                    </form>
                </div>

                {/* Print Title Header (Only visible on print) */}
                <div className="hidden print:block mb-6 text-center border-b-2 border-slate-900 pb-4">
                    <h2 className="text-xl font-bold text-black uppercase tracking-tight">SMK NEGERI 1 CIOMAS</h2>
                    <h3 className="text-sm font-bold text-slate-800 uppercase mt-1">
                        Laporan Rekapitulasi {activeTab === 'siswa' ? 'Presensi Siswa' : activeTab === 'guru' ? 'Kehadiran Guru' : 'Sanksi Denda Kas'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                        Periode: {formatDisplayDate(startDate)} s/d {formatDisplayDate(endDate)}
                    </p>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar print:hidden">
                    <button
                        type="button"
                        onClick={() => handleTabChange('siswa')}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'siswa'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Rekap Presensi Siswa ({studentRecap.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('guru')}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'guru'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Rekap Kehadiran Guru ({teacherRecap.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('denda')}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                            activeTab === 'denda'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        <span>Rekap Sanksi Denda Kas ({finesRecap.length})</span>
                    </button>
                </div>

                {/* Tab 1: Rekap Presensi Siswa */}
                {activeTab === 'siswa' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden print:border print:border-slate-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm print:text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 text-[11px] font-bold text-slate-600 dark:text-slate-300 print:text-slate-900 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3.5">Tanggal</th>
                                        <th className="px-4 sm:px-6 py-3.5">Nama Siswa</th>
                                        <th className="px-4 sm:px-6 py-3.5">Kelas</th>
                                        <th className="px-4 sm:px-6 py-3.5">Status Presensi</th>
                                        <th className="px-4 sm:px-6 py-3.5">Waktu Lapor</th>
                                        <th className="px-4 sm:px-6 py-3.5">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                                    {totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                Tidak ada data presensi siswa pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        // On print preview, show full dataset; on web view, show paginatedData
                                        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches ? studentRecap : paginatedData).map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap font-medium">
                                                    {formatDisplayDate(row.date)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                                                    {row.student?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 text-slate-700 dark:text-slate-300">
                                                    {row.classroom?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.status === 'sakit' ? 'bg-amber-100 text-amber-800' :
                                                        row.status === 'izin' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDisplayTime(row.submission_time) || '07:15'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                                    {row.notes || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="print:hidden">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                from={fromIndex}
                                to={toIndex}
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        </div>
                    </div>
                )}

                {/* Tab 2: Rekap Kehadiran Guru */}
                {activeTab === 'guru' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden print:border print:border-slate-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm print:text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 text-[11px] font-bold text-slate-600 dark:text-slate-300 print:text-slate-900 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3.5">Tanggal</th>
                                        <th className="px-4 sm:px-6 py-3.5">Nama Guru</th>
                                        <th className="px-4 sm:px-6 py-3.5">NIP</th>
                                        <th className="px-4 sm:px-6 py-3.5">Status Kehadiran</th>
                                        <th className="px-4 sm:px-6 py-3.5">Waktu Fingerprint</th>
                                        <th className="px-4 sm:px-6 py-3.5">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                                    {totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                Tidak ada data kehadiran guru pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches ? teacherRecap : paginatedData).map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap font-medium">
                                                    {formatDisplayDate(row.date)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                                                    {row.teacher?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {row.teacher?.nip || 'Non-PNS'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.status === 'dinas_luar' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {String(row.status || '').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDisplayTime(row.check_in_time) || '06:45'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                                    {row.notes || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="print:hidden">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                from={fromIndex}
                                to={toIndex}
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        </div>
                    </div>
                )}

                {/* Tab 3: Rekap Denda Kas */}
                {activeTab === 'denda' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden print:border print:border-slate-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm print:text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 text-[11px] font-bold text-slate-600 dark:text-slate-300 print:text-slate-900 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3.5">Tanggal Terbit</th>
                                        <th className="px-4 sm:px-6 py-3.5">Kelas</th>
                                        <th className="px-4 sm:px-6 py-3.5">Wali Kelas</th>
                                        <th className="px-4 sm:px-6 py-3.5">Nominal Denda</th>
                                        <th className="px-4 sm:px-6 py-3.5">Status Pembayaran</th>
                                        <th className="px-4 sm:px-6 py-3.5">Alasan Pelanggaran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                                    {totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                Tidak ada data denda pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches ? finesRecap : paginatedData).map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap font-medium">
                                                    {formatDisplayDate(row.created_at)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                                                    {row.classroom?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 text-slate-700 dark:text-slate-300 text-xs">
                                                    {row.homeroom_teacher?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                                                    Rp {(Number(row.amount) || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                        row.payment_status === 'lunas' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.payment_status === 'menunggu_konfirmasi' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {String(row.payment_status || '').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                                                    {row.reason}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="print:hidden">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                from={fromIndex}
                                to={toIndex}
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
