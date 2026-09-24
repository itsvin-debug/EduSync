import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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

    const tabs = [
        { id: 'guru', label: 'Data Guru Pengampu', icon: Users, count: teachers.length },
        { id: 'siswa', label: 'Data Siswa & Rombel', icon: GraduationCap, count: students.length },
        { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen, count: subjects.length },
        { id: 'ruang', label: 'Ruangan & Lab', icon: Building2, count: rooms.length },
        { id: 'kelas', label: 'Kelas & Jurusan', icon: School, count: classrooms.length },
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
                        Basis data referensi kurikulum, tenaga pendidik, rombel, sarana bengkel lab terintegrasi.
                    </p>
                </div>
            </div>

            {/* Nav Tabs */}
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

            {/* Search Bar */}
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
                <div className="text-xs text-slate-500">
                    Menampilkan data aktif Dapodik TA 2024/2025
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
                                    <th className="py-3 px-4 w-16 text-center">Kode</th>
                                    <th className="py-3 px-4">Nama Lengkap & NIP</th>
                                    <th className="py-3 px-4">Tugas / Mata Pelajaran</th>
                                    <th className="py-3 px-4 text-center">Maksimal JP</th>
                                    <th className="py-3 px-4 text-center">Kontak WhatsApp</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTeachers.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {t.code}
                                            </span>
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
            </div>
        </AdminLayout>
    );
}
