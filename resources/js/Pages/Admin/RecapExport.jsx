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
    const [activeTab, setActiveTab] = useState(filters.type || 'siswa'); // 'siswa', 'guru', 'denda'

    // Pagination State (15 data per halaman di tampilan web)
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 15;

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

    // Client-side CSV export
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

    // Data set aktif
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

    const printDateFormatted = useMemo(() => {
        return new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }, []);

    return (
        <AdminLayout title="Rekap & Export Laporan">
            <Head title="Rekap & Export Laporan - EDUSYNC Admin" />

            {/* ========================================================= */}
            {/* 1. DOKUMEN CETAK RESMI (HANYA MUNCUL SAAT CETAK / PRINT)  */}
            {/* ========================================================= */}
            <div className="hidden print:block text-black bg-white font-serif">
                {/* Kop Surat Resmi SMKN 1 Ciomas */}
                <div className="pb-3 border-b-4 border-double border-black text-center relative">
                    <div className="flex items-center justify-between gap-4">
                        <div className="w-16 h-16 border border-black flex items-center justify-center text-[10px] font-bold uppercase text-center p-1 shrink-0">
                            LOGO JABAR
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-black m-0">
                                Pemerintah Daerah Provinsi Jawa Barat
                            </h4>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-black m-0">
                                Dinas Pendidikan • Cabang Dinas Pendidikan Wilayah I
                            </h4>
                            <h2 className="text-lg font-black uppercase tracking-tight text-black mt-1 mb-0.5">
                                SMK NEGERI 1 CIOMAS
                            </h2>
                            <p className="text-[10px] text-black leading-tight m-0">
                                Jl. Raya Laladon No. 01, Ciomas, Kabupaten Bogor, Jawa Barat 16610 | Telp: (0251) 7520933
                            </p>
                            <p className="text-[10px] text-black leading-tight m-0">
                                Website: smkn1ciomas.sch.id • Surat Elektronik: info@smkn1ciomas.sch.id
                            </p>
                        </div>
                        <div className="w-16 h-16 border border-black flex items-center justify-center text-[10px] font-bold uppercase text-center p-1 shrink-0">
                            SMKN 1 CIOMAS
                        </div>
                    </div>
                </div>

                {/* Judul Dokumen Cetak */}
                <div className="text-center my-4">
                    <h3 className="text-sm font-bold uppercase underline tracking-wide text-black m-0">
                        {activeTab === 'siswa'
                            ? 'Laporan Rekapitulasi Presensi Harian Siswa'
                            : activeTab === 'guru'
                            ? 'Laporan Rekapitulasi Kehadiran & Fingerprint Guru'
                            : 'Laporan Rekapitulasi Sanksi Denda Kebersihan Kelas'}
                    </h3>
                    <p className="text-xs text-black mt-1 font-sans">
                        Periode: <strong>{formatDisplayDate(startDate)}</strong> s/d <strong>{formatDisplayDate(endDate)}</strong> • Tahun Ajaran 2026/2027 Ganjil
                    </p>
                </div>

                {/* Tabel Cetak Lengkap (Seluruh Data Periode) */}
                <table className="w-full text-left text-xs border-collapse border border-black font-sans">
                    {activeTab === 'siswa' && (
                        <>
                            <thead>
                                <tr className="bg-slate-100 border-b border-black text-black uppercase font-bold text-[11px]">
                                    <th className="border border-black px-2 py-1.5 text-center w-10">No.</th>
                                    <th className="border border-black px-3 py-1.5">Tanggal</th>
                                    <th className="border border-black px-3 py-1.5">Nama Siswa</th>
                                    <th className="border border-black px-3 py-1.5">Kelas</th>
                                    <th className="border border-black px-3 py-1.5 text-center">Status</th>
                                    <th className="border border-black px-3 py-1.5 text-center">Waktu</th>
                                    <th className="border border-black px-3 py-1.5">Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentRecap.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="border border-black px-3 py-4 text-center">
                                            Tidak ada data presensi pada rentang tanggal tersebut.
                                        </td>
                                    </tr>
                                ) : (
                                    studentRecap.map((row, idx) => (
                                        <tr key={row.id} className="border-b border-black">
                                            <td className="border border-black px-2 py-1 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black px-3 py-1 font-mono whitespace-nowrap">{formatDisplayDate(row.date)}</td>
                                            <td className="border border-black px-3 py-1 font-semibold">{row.student?.name || '-'}</td>
                                            <td className="border border-black px-3 py-1">{row.classroom?.name || '-'}</td>
                                            <td className="border border-black px-3 py-1 text-center font-bold uppercase">{row.status}</td>
                                            <td className="border border-black px-3 py-1 text-center font-mono">{formatDisplayTime(row.submission_time) || '07:15'}</td>
                                            <td className="border border-black px-3 py-1 text-[11px]">{row.notes || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </>
                    )}

                    {activeTab === 'guru' && (
                        <>
                            <thead>
                                <tr className="bg-slate-100 border-b border-black text-black uppercase font-bold text-[11px]">
                                    <th className="border border-black px-2 py-1.5 text-center w-10">No.</th>
                                    <th className="border border-black px-3 py-1.5">Tanggal</th>
                                    <th className="border border-black px-3 py-1.5">Nama Guru</th>
                                    <th className="border border-black px-3 py-1.5">NIP</th>
                                    <th className="border border-black px-3 py-1.5 text-center">Status Kehadiran</th>
                                    <th className="border border-black px-3 py-1.5 text-center">Jam Masuk</th>
                                    <th className="border border-black px-3 py-1.5">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teacherRecap.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="border border-black px-3 py-4 text-center">
                                            Tidak ada data kehadiran guru pada rentang tanggal tersebut.
                                        </td>
                                    </tr>
                                ) : (
                                    teacherRecap.map((row, idx) => (
                                        <tr key={row.id} className="border-b border-black">
                                            <td className="border border-black px-2 py-1 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black px-3 py-1 font-mono whitespace-nowrap">{formatDisplayDate(row.date)}</td>
                                            <td className="border border-black px-3 py-1 font-semibold">{row.teacher?.name || '-'}</td>
                                            <td className="border border-black px-3 py-1 font-mono text-[11px]">{row.teacher?.nip || 'Non-PNS'}</td>
                                            <td className="border border-black px-3 py-1 text-center font-bold uppercase">{String(row.status || '').replace('_', ' ')}</td>
                                            <td className="border border-black px-3 py-1 text-center font-mono">{formatDisplayTime(row.check_in_time) || '06:45'}</td>
                                            <td className="border border-black px-3 py-1 text-[11px]">{row.notes || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </>
                    )}

                    {activeTab === 'denda' && (
                        <>
                            <thead>
                                <tr className="bg-slate-100 border-b border-black text-black uppercase font-bold text-[11px]">
                                    <th className="border border-black px-2 py-1.5 text-center w-10">No.</th>
                                    <th className="border border-black px-3 py-1.5">Tanggal Terbit</th>
                                    <th className="border border-black px-3 py-1.5">Kelas</th>
                                    <th className="border border-black px-3 py-1.5">Wali Kelas</th>
                                    <th className="border border-black px-3 py-1.5 text-right">Nominal (Rp)</th>
                                    <th className="border border-black px-3 py-1.5 text-center">Status</th>
                                    <th className="border border-black px-3 py-1.5">Alasan Pelanggaran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finesRecap.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="border border-black px-3 py-4 text-center">
                                            Tidak ada data denda pada rentang tanggal tersebut.
                                        </td>
                                    </tr>
                                ) : (
                                    finesRecap.map((row, idx) => (
                                        <tr key={row.id} className="border-b border-black">
                                            <td className="border border-black px-2 py-1 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black px-3 py-1 font-mono whitespace-nowrap">{formatDisplayDate(row.created_at)}</td>
                                            <td className="border border-black px-3 py-1 font-bold">{row.classroom?.name || '-'}</td>
                                            <td className="border border-black px-3 py-1">{row.homeroom_teacher?.name || '-'}</td>
                                            <td className="border border-black px-3 py-1 text-right font-mono font-bold">
                                                {(Number(row.amount) || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="border border-black px-3 py-1 text-center font-bold uppercase">{String(row.payment_status || '').replace('_', ' ')}</td>
                                            <td className="border border-black px-3 py-1 text-[11px]">{row.reason}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </>
                    )}
                </table>

                {/* Kolom Tanda Tangan Pengesahan (Print Only) */}
                <div className="mt-8 flex justify-end font-sans">
                    <div className="text-center w-64 text-xs">
                        <p className="m-0">Ciomas, {printDateFormatted}</p>
                        <p className="font-semibold mt-0.5 mb-14">Operator Kurikulum & Dapodik,</p>
                        <p className="font-bold underline uppercase m-0">Didin Sahrudin, M.Kom</p>
                        <p className="text-[11px] font-mono text-black m-0">NIP. 198205142008011009</p>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. TAMPILAN WEB INTERAKTIF (DISEMBUNYIKAN SAAT CETAK)     */}
            {/* ========================================================= */}
            <div className="space-y-6 print:hidden">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold text-sm shadow-2xs">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </span>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Rekapitulasi Data & Ekspor Dokumen
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Rekapitulasi presensi harian rombel siswa, absensi guru, dan catatan denda kebersihan siap cetak atau ekspor ke Spreadsheet.
                            </p>
                        </div>

                        {/* Export & Print Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleExportCSV}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh Spreadsheet (CSV)</span>
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Cetak PDF Resmi</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Rentang Tanggal */}
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
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan Rentang Tanggal</span>
                        </button>
                    </form>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
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

                {/* Tabel Web Tab 1: Rekap Presensi Siswa */}
                {activeTab === 'siswa' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3.5 py-3.5 text-center w-12">No.</th>
                                        <th className="px-4 sm:px-6 py-3.5">Tanggal</th>
                                        <th className="px-4 sm:px-6 py-3.5">Nama Siswa</th>
                                        <th className="px-4 sm:px-6 py-3.5">Kelas</th>
                                        <th className="px-4 sm:px-6 py-3.5">Status Presensi</th>
                                        <th className="px-4 sm:px-6 py-3.5">Waktu Lapor</th>
                                        <th className="px-4 sm:px-6 py-3.5">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                Tidak ada data presensi siswa pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                                <td className="px-3.5 py-3.5 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {(currentPage - 1) * perPage + idx + 1}
                                                </td>
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
                                                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' :
                                                        row.status === 'sakit' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' :
                                                        row.status === 'izin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300' :
                                                        'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
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
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            from={fromIndex}
                            to={toIndex}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}

                {/* Tabel Web Tab 2: Rekap Kehadiran Guru */}
                {activeTab === 'guru' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3.5 py-3.5 text-center w-12">No.</th>
                                        <th className="px-4 sm:px-6 py-3.5">Tanggal</th>
                                        <th className="px-4 sm:px-6 py-3.5">Nama Guru</th>
                                        <th className="px-4 sm:px-6 py-3.5">NIP</th>
                                        <th className="px-4 sm:px-6 py-3.5">Status Kehadiran</th>
                                        <th className="px-4 sm:px-6 py-3.5">Waktu Fingerprint</th>
                                        <th className="px-4 sm:px-6 py-3.5">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                Tidak ada data kehadiran guru pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                                <td className="px-3.5 py-3.5 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {(currentPage - 1) * perPage + idx + 1}
                                                </td>
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
                                                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' :
                                                        row.status === 'dinas_luar' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300' :
                                                        'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
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
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            from={fromIndex}
                            to={toIndex}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}

                {/* Tabel Web Tab 3: Rekap Denda Kas */}
                {activeTab === 'denda' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3.5 py-3.5 text-center w-12">No.</th>
                                        <th className="px-4 sm:px-6 py-3.5">Tanggal Terbit</th>
                                        <th className="px-4 sm:px-6 py-3.5">Kelas</th>
                                        <th className="px-4 sm:px-6 py-3.5">Wali Kelas</th>
                                        <th className="px-4 sm:px-6 py-3.5 text-right">Nominal Denda</th>
                                        <th className="px-4 sm:px-6 py-3.5">Status Pembayaran</th>
                                        <th className="px-4 sm:px-6 py-3.5">Alasan Pelanggaran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {totalItems === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                Tidak ada data denda pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                                <td className="px-3.5 py-3.5 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {(currentPage - 1) * perPage + idx + 1}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap font-medium">
                                                    {formatDisplayDate(row.created_at)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                                                    {row.classroom?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 text-slate-700 dark:text-slate-300 text-xs">
                                                    {row.homeroom_teacher?.name || '-'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                                                    Rp {(Number(row.amount) || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3.5">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                        row.payment_status === 'lunas' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' :
                                                        row.payment_status === 'menunggu_konfirmasi' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' :
                                                        'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
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
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            from={fromIndex}
                            to={toIndex}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
