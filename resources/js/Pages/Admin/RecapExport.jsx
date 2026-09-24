import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileSpreadsheet,
    Printer,
    Download,
    Calendar,
    Filter,
    Users,
    UserCheck,
    Coins,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    FileText,
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

    const handleFilterDate = (e) => {
        e.preventDefault();
        router.get('/admin/recap-export', {
            start_date: startDate,
            end_date: endDate,
            type: activeTab,
        }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    // Client-side CSV export
    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        let fileName = `Rekap_${activeTab.toUpperCase()}_${startDate}_sd_${endDate}.csv`;

        if (activeTab === 'siswa') {
            csvContent += "No,Tanggal,Nama Siswa,Kelas,Status,Waktu Presensi,Keterangan\n";
            studentRecap.forEach((row, idx) => {
                csvContent += `"${idx + 1}","${row.date}","${row.student?.name || ''}","${row.classroom?.name || ''}","${row.status.toUpperCase()}","${row.submission_time || ''}","${row.notes || ''}"\n`;
            });
        } else if (activeTab === 'guru') {
            csvContent += "No,Tanggal,Nama Guru,NIP,Status,Jam Masuk,Keterangan\n";
            teacherRecap.forEach((row, idx) => {
                csvContent += `"${idx + 1}","${row.date}","${row.teacher?.name || ''}","${row.teacher?.nip || ''}","${row.status.toUpperCase()}","${row.check_in_time || ''}","${row.notes || ''}"\n`;
            });
        } else {
            csvContent += "No,Tanggal,Kelas,Wali Kelas,Nominal (Rp),Status Pembayaran,Alasan\n";
            finesRecap.forEach((row, idx) => {
                csvContent += `"${idx + 1}","${new Date(row.created_at).toLocaleDateString('id-ID')}","${row.classroom?.name || ''}","${row.homeroom_teacher?.name || ''}","${row.amount}","${row.payment_status.toUpperCase()}","${row.reason || ''}"\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout title="Rekap & Export Laporan">
            <Head title="Rekap & Export Laporan — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm print:hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Engine Rekapitulasi Data & Ekspor Dokumen
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Unduh rekapitulasi presensi harian siswa, absensi guru, serta catatan denda kebersihan ke format Excel (CSV) dan PDF Siap Cetak.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportCSV}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
                            >
                                <Download className="w-4 h-4" />
                                Unduh Spreadsheet (CSV)
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak PDF
                            </button>
                        </div>
                    </div>

                    {/* Filter Form */}
                    <form onSubmit={handleFilterDate} className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600 uppercase">Dari:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600 uppercase">Sampai:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter Rentang Tanggal
                        </button>
                    </form>
                </div>

                {/* Print Title Header (Only visible on print) */}
                <div className="hidden print:block mb-6 text-center border-b pb-4">
                    <h2 className="text-xl font-bold text-black uppercase">SMK NEGERI 1 REKAYASA TEKNOLOGI</h2>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase">Laporan Rekapitulasi {activeTab.toUpperCase()}</h3>
                    <p className="text-xs text-slate-500">Periode: {startDate} s/d {endDate}</p>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200 print:hidden">
                    <button
                        onClick={() => setActiveTab('siswa')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'siswa'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Rekap Presensi Siswa ({studentRecap.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('guru')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'guru'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        Rekap Kehadiran Guru ({teacherRecap.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('denda')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'denda'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        Rekap Sanksi Denda Kas ({finesRecap.length})
                    </button>
                </div>

                {/* Tab 1: Rekap Presensi Siswa */}
                {activeTab === 'siswa' && (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Tanggal</th>
                                        <th className="px-6 py-3.5">Nama Siswa</th>
                                        <th className="px-6 py-3.5">Kelas</th>
                                        <th className="px-6 py-3.5">Status Presensi</th>
                                        <th className="px-6 py-3.5">Waktu Lapor</th>
                                        <th className="px-6 py-3.5">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {studentRecap.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                Tidak ada data presensi siswa pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        studentRecap.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-700">
                                                    {row.date}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {row.student?.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700">
                                                    {row.classroom?.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                                                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.status === 'sakit' ? 'bg-amber-100 text-amber-800' :
                                                        row.status === 'izin' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    {row.submission_time || '07:15'}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {row.notes || '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2: Rekap Kehadiran Guru */}
                {activeTab === 'guru' && (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Tanggal</th>
                                        <th className="px-6 py-3.5">Nama Guru</th>
                                        <th className="px-6 py-3.5">NIP</th>
                                        <th className="px-6 py-3.5">Status Kehadiran</th>
                                        <th className="px-6 py-3.5">Waktu Fingerprint</th>
                                        <th className="px-6 py-3.5">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {teacherRecap.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                Tidak ada data kehadiran guru pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        teacherRecap.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-700">
                                                    {row.date}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {row.teacher?.name}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    {row.teacher?.nip || 'Non-PNS'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                                                        row.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.status === 'dinas_luar' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {row.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    {row.check_in_time || '06:45'}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {row.notes || '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Rekap Denda Kas */}
                {activeTab === 'denda' && (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Tanggal Terbit</th>
                                        <th className="px-6 py-3.5">Kelas</th>
                                        <th className="px-6 py-3.5">Wali Kelas</th>
                                        <th className="px-6 py-3.5">Nominal Denda</th>
                                        <th className="px-6 py-3.5">Status Pembayaran</th>
                                        <th className="px-6 py-3.5">Alasan Pelanggaran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {finesRecap.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                Tidak ada data denda pada rentang tanggal yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        finesRecap.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/70">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-700">
                                                    {new Date(row.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {row.classroom?.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 text-xs">
                                                    {row.homeroom_teacher?.name || '—'}
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                                    Rp {row.amount.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                                                        row.payment_status === 'lunas' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.payment_status === 'menunggu_konfirmasi' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {row.payment_status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500 max-w-sm">
                                                    {row.reason}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
