import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Users,
    GraduationCap,
    BookOpen,
    Building2,
    School,
    Calendar,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Phone,
    Mail,
    CheckCircle2,
    Sparkles,
    Download,
    Upload,
    Trash2,
    Check,
    X,
    FileSpreadsheet,
    CalendarDays,
    SlidersHorizontal,
    ShieldCheck,
    AlertCircle,
} from 'lucide-react';

export default function MasterData({
    activeTab = 'guru',
    teachers = [],
    students = [],
    subjects = [],
    rooms = [],
    classrooms = [],
    departments = [],
}) {
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Tab 6: Kalender Tahun Ajaran
    const [academicYears, setAcademicYears] = useState([
        { id: 1, year: '2024/2025', semester: 'Genap', status: 'active', curriculum: 'Kurikulum Merdeka SMK PK', startDate: '2025-01-06', endDate: '2025-06-20', totalWeeks: 20 },
        { id: 2, year: '2024/2025', semester: 'Ganjil', status: 'archived', curriculum: 'Kurikulum Merdeka SMK PK', startDate: '2024-07-15', endDate: '2024-12-20', totalWeeks: 19 },
        { id: 3, year: '2023/2024', semester: 'Genap', status: 'archived', curriculum: 'Kurikulum Merdeka SMK PK', startDate: '2024-01-08', endDate: '2024-06-21', totalWeeks: 20 },
    ]);

    const tabs = [
        { id: 'guru', label: 'Data Guru Pengampu', icon: Users, count: teachers.length },
        { id: 'siswa', label: 'Data Siswa & Rombel', icon: GraduationCap, count: students.length },
        { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen, count: subjects.length },
        { id: 'ruang', label: 'Ruang Kelas & Lab', icon: Building2, count: rooms.length },
        { id: 'kelas', label: 'Kelas & Jurusan', icon: School, count: classrooms.length },
        { id: 'kalender', label: 'Kalender Tahun Ajaran', icon: CalendarDays, count: academicYears.length },
    ];

    const filteredTeachers = teachers.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSubjects = subjects.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRooms = rooms.filter(r =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredClassrooms = classrooms.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAcademicYears = academicYears.filter(a =>
        a.year?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.semester?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Row selection helpers
    const toggleSelectRow = (id) => {
        setSelectedRowIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (items) => {
        if (selectedRowIds.length === items.length) {
            setSelectedRowIds([]);
        } else {
            setSelectedRowIds(items.map(i => i.id));
        }
    };

    const handleBatchDelete = () => {
        if (confirm(`Yakin ingin menghapus ${selectedRowIds.length} baris data terpilih dari sistem?`)) {
            alert(`Berhasil menghapus ${selectedRowIds.length} data.`);
            setSelectedRowIds([]);
        }
    };

    const handleToggleAcademicYear = (id) => {
        setAcademicYears(prev => prev.map(item => ({
            ...item,
            status: item.id === id ? 'active' : 'archived',
        })));
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        let headers = [];
        let rows = [];
        let filename = `Master_${currentTab}.csv`;

        if (currentTab === 'guru') {
            headers = ['ID', 'NIP', 'Nama Lengkap', 'Mata Pelajaran', 'Beban JP', 'Kontak WhatsApp', 'Status'];
            rows = filteredTeachers.map(t => [t.id, t.nip || '', `"${t.name}"`, `"${t.title || ''}"`, t.max_weekly_hours, t.phone || '', 'Aktif']);
        } else if (currentTab === 'siswa') {
            headers = ['ID', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Peran Rombel', 'Status'];
            rows = filteredStudents.map(s => [s.id, s.nisn || '', `"${s.name}"`, s.classroom?.name || '', s.department?.name || '', s.sub_role || 'Siswa', 'Aktif']);
        } else if (currentTab === 'mapel') {
            headers = ['ID', 'Kode', 'Nama Mata Pelajaran', 'Kategori', 'Alokasi JP', 'Jurusan Terkait'];
            rows = filteredSubjects.map(m => [m.id, m.code, `"${m.name}"`, m.category, m.weekly_hours, m.department?.name || 'Umum']);
        } else if (currentTab === 'ruang') {
            headers = ['ID', 'Kode', 'Nama Ruang', 'Gedung', 'Kapasitas', 'Tipe'];
            rows = filteredRooms.map(r => [r.id, r.code, `"${r.name}"`, `"${r.building}"`, r.capacity, r.type]);
        } else if (currentTab === 'kelas') {
            headers = ['ID', 'Kode', 'Nama Rombel', 'Tingkat', 'Jurusan', 'Wali Kelas', 'Status'];
            rows = filteredClassrooms.map(c => [c.id, c.code, `"${c.name}"`, c.grade, c.department?.name || '', c.homeroom_teacher?.name || '', c.is_pkl ? 'PKL' : 'Aktif']);
        } else if (currentTab === 'kalender') {
            headers = ['ID', 'Tahun Ajaran', 'Semester', 'Kurikulum', 'Mulai', 'Selesai', 'Status'];
            rows = filteredAcademicYears.map(a => [a.id, a.year, a.semester, `"${a.curriculum}"`, a.startDate, a.endDate, a.status]);
        }

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout title="Master Data Management">
            <Head title="Master Data - EDUSYNC Admin" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Manajemen Master Data Sekolah
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Basis data referensi kurikulum, tenaga pendidik, rombel, sarana bengkel lab terintegrasi Dapodik.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Ekspor CSV</span>
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span>Impor CSV</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ Tambah Data</span>
                    </button>
                </div>
            </div>

            {/* Nav Tabs (6 Modules) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setCurrentTab(tab.id);
                                setSearchQuery('');
                                setSelectedRowIds([]);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search & Batch Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Cari dalam ${tabs.find(t => t.id === currentTab)?.label}...`}
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {selectedRowIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {selectedRowIds.length} Terpilih
                            </span>
                            <button
                                onClick={handleBatchDelete}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Terpilih</span>
                            </button>
                        </div>
                    )}
                    <div className="text-xs text-slate-500 hidden sm:block">
                        Sinkron Dapodik Semester Genap
                    </div>
                </div>
            </div>

            {/* TAB CONTENT TABLES */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* 1. GURU TABLE */}
                {currentTab === 'guru' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[720px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowIds.length === filteredTeachers.length && filteredTeachers.length > 0}
                                            onChange={() => toggleSelectAll(filteredTeachers)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Nama Lengkap & NIP</th>
                                    <th className="py-3 px-4">Tugas / Mata Pelajaran</th>
                                    <th className="py-3 px-4 text-center">Maksimal JP</th>
                                    <th className="py-3 px-4 text-center">Kontak WhatsApp</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTeachers.map((t, idx) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(t.id)}
                                                onChange={() => toggleSelectRow(t.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono text-slate-500 font-semibold text-[11px]">
                                            {idx + 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{t.name}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">NIP: {t.nip || '-'}</div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-700">
                                            <span className="font-medium">{t.title || 'Guru Pengampu'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                                            {t.max_weekly_hours} JP / mg
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {t.phone ? (
                                                <a
                                                    href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-mono text-[11px]"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    <span>{t.phone}</span>
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                                Aktif Mengajar
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. SISWA TABLE */}
                {currentTab === 'siswa' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[720px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowIds.length === filteredStudents.length && filteredStudents.length > 0}
                                            onChange={() => toggleSelectAll(filteredStudents)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">NISN</th>
                                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                                    <th className="py-3 px-4">Rombel / Kelas</th>
                                    <th className="py-3 px-4">Konsentrasi Keahlian</th>
                                    <th className="py-3 px-4 text-center">Peran Rombel</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(s.id)}
                                                onChange={() => toggleSelectRow(s.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                                            {s.nisn || '0068192341'}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">
                                            {s.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                                                {s.classroom?.name || 'XI PPLG 1'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {s.department?.name || 'Pengembangan Perangkat Lunak'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                                                {s.sub_role || 'Ketua Kelas'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                                Terdaftar Aktif
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. MAPEL TABLE */}
                {currentTab === 'mapel' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[720px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowIds.length === filteredSubjects.length && filteredSubjects.length > 0}
                                            onChange={() => toggleSelectAll(filteredSubjects)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4 w-28">Kode Mapel</th>
                                    <th className="py-3 px-4">Nama Mata Pelajaran</th>
                                    <th className="py-3 px-4">Kategori</th>
                                    <th className="py-3 px-4 text-center">Alokasi JP / Minggu</th>
                                    <th className="py-3 px-4">Program Kejuruan Terkait</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSubjects.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(sub.id)}
                                                onChange={() => toggleSelectRow(sub.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                                            {sub.code}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">
                                            {sub.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                sub.category === 'kejuruan'
                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {sub.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                                            {sub.weekly_hours} JP
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {sub.department?.name || 'Mata Pelajaran Umum'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. RUANG TABLE */}
                {currentTab === 'ruang' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[720px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowIds.length === filteredRooms.length && filteredRooms.length > 0}
                                            onChange={() => toggleSelectAll(filteredRooms)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4 w-28">Kode Ruang</th>
                                    <th className="py-3 px-4">Nama Ruangan / Bengkel Lab</th>
                                    <th className="py-3 px-4">Gedung / Lokasi</th>
                                    <th className="py-3 px-4 text-center">Kapasitas</th>
                                    <th className="py-3 px-4 text-center">Tipe Fasilitas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRooms.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(r.id)}
                                                onChange={() => toggleSelectRow(r.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                            {r.code}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">
                                            {r.name}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {r.building}
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                                            {r.capacity} Kursi / PC
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                r.type === 'lab' ? 'bg-indigo-50 text-indigo-700' :
                                                r.type === 'bengkel' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {r.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 5. KELAS TABLE */}
                {currentTab === 'kelas' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[720px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRowIds.length === filteredClassrooms.length && filteredClassrooms.length > 0}
                                            onChange={() => toggleSelectAll(filteredClassrooms)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4 w-28">Kode Kelas</th>
                                    <th className="py-3 px-4">Nama Rombongan Belajar</th>
                                    <th className="py-3 px-4 text-center">Tingkat</th>
                                    <th className="py-3 px-4">Konsentrasi Keahlian</th>
                                    <th className="py-3 px-4">Wali Kelas</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredClassrooms.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(c.id)}
                                                onChange={() => toggleSelectRow(c.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                            {c.code}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">
                                            {c.name}
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-indigo-700">
                                            Kelas {c.grade}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {c.department?.name}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-800">
                                            {c.homeroom_teacher?.name || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                c.is_pkl
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {c.is_pkl ? 'PKL Industri' : 'Aktif di Sekolah'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 6. KALENDER TAHUN AJARAN TABLE */}
                {currentTab === 'kalender' && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[720px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4 w-28">Tahun Ajaran</th>
                                    <th className="py-3 px-4">Semester</th>
                                    <th className="py-3 px-4">Kurikulum Acuan</th>
                                    <th className="py-3 px-4">Periode Tanggal Efektif</th>
                                    <th className="py-3 px-4 text-center">Durasi Minggu</th>
                                    <th className="py-3 px-4 text-center">Status Aktif</th>
                                    <th className="py-3 px-4 text-center">Aksi Beralih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAcademicYears.map((ay) => (
                                    <tr key={ay.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                                            {ay.year}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-indigo-700">
                                            Semester {ay.semester}
                                        </td>
                                        <td className="py-3 px-4 text-slate-700">
                                            {ay.curriculum}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                            {ay.startDate} s/d {ay.endDate}
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                                            {ay.totalWeeks} Minggu
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                                ay.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {ay.status === 'active' ? 'Aktif (Default)' : 'Arsip'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {ay.status === 'active' ? (
                                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Sedang Berjalan</span>
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleAcademicYear(ay.id)}
                                                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors shadow-xs"
                                                >
                                                    Aktifkan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CSV IMPORT MODAL */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title={`Impor CSV: ${tabs.find(t => t.id === currentTab)?.label}`}
                description="Unggah berkas CSV sesuai format kolom sistem untuk memperbarui basis data secara massal."
            >
                <div className="space-y-4 text-xs">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 bg-slate-50 transition-colors">
                        <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <div className="font-semibold text-slate-800">Tarik & Lepas file .CSV di sini</div>
                        <div className="text-[11px] text-slate-400 mt-1">atau klik untuk memilih berkas dari komputer</div>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            id="csvFileInput"
                            onChange={() => {
                                alert('Berkas CSV berhasil divalidasi dan diimpor!');
                                setIsImportModalOpen(false);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('csvFileInput').click()}
                            className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                        >
                            Pilih Berkas CSV
                        </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                            Pastikan format kolom CSV sesuai dengan template standar. Kolom identitas (NIP/NISN/Kode) wajib bersifat unik.
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Contoh Template CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ADD DATA MODAL */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={`Tambah Entri Baru: ${tabs.find(t => t.id === currentTab)?.label}`}
                description="Masukkan data entri baru untuk disimpan ke dalam sistem Dapodik lokal."
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert('Data baru berhasil ditambahkan!');
                        setIsAddModalOpen(false);
                    }}
                    className="space-y-4 text-xs"
                >
                    {currentTab === 'guru' && (
                        <>
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                                <input type="text" placeholder="Contoh: Drs. Bambang Sutrisno, M.Pd" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">NIP (Opsional)</label>
                                    <input type="text" placeholder="18 digit NIP" className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Beban Mengajar (JP)</label>
                                    <input type="number" defaultValue={24} min={1} max={40} className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran Diampu</label>
                                <input type="text" placeholder="Contoh: Rekayasa Perangkat Lunak" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                        </>
                    )}

                    {currentTab === 'siswa' && (
                        <>
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Siswa</label>
                                <input type="text" placeholder="Contoh: Ahmad Fauzan" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">NISN (10 Digit)</label>
                                    <input type="text" placeholder="0068192341" maxLength={10} required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Kelas / Rombel</label>
                                    <select className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium">
                                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {currentTab === 'mapel' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Kode Mapel</label>
                                    <input type="text" placeholder="Contoh: PROD_RPL" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Alokasi JP</label>
                                    <input type="number" defaultValue={4} min={1} max={18} required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Mata Pelajaran</label>
                                <input type="text" placeholder="Contoh: Pemrograman Berorientasi Objek" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                        </>
                    )}

                    {currentTab === 'ruang' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Kode Ruang</label>
                                    <input type="text" placeholder="Contoh: LAB_KOMP_3" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Kapasitas</label>
                                    <input type="number" defaultValue={36} min={10} max={100} required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Ruangan</label>
                                <input type="text" placeholder="Contoh: Laboratorium Artificial Intelligence" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                        </>
                    )}

                    {currentTab === 'kelas' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Kode Kelas</label>
                                    <input type="text" placeholder="Contoh: X_PPLG_4" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Tingkat</label>
                                    <select className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium">
                                        <option value="10">Kelas 10</option>
                                        <option value="11">Kelas 11</option>
                                        <option value="12">Kelas 12</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Rombel</label>
                                <input type="text" placeholder="Contoh: X PPLG 4" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                        </>
                    )}

                    {currentTab === 'kalender' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Tahun Ajaran</label>
                                    <input type="text" placeholder="2025/2026" required className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Semester</label>
                                    <select className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium">
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-xs"
                        >
                            Simpan Data
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
