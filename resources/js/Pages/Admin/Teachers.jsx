import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Users,
    Search,
    Plus,
    KeyRound,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    Phone,
    Mail,
    Award,
    Clock,
    Lock,
    BookOpen,
    Filter,
    Building2,
    Check,
} from 'lucide-react';

export default function Teachers({ teachers = [], subjects = [], departments = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDept, setSelectedDept] = useState(filters.department_id || '');
    const [revealedPasswords, setRevealedPasswords] = useState({});

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [resetPassTeacher, setResetPassTeacher] = useState(null);
    const [newPassword, setNewPassword] = useState('password123');

    // Forms
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        nip: '',
        email: '',
        phone: '',
        title: 'Guru Pengampu',
        department_id: '',
        max_weekly_hours: 32,
        password: 'password123',
        subject_ids: [],
    });

    const togglePasswordReveal = (teacherId) => {
        setRevealedPasswords((prev) => ({
            ...prev,
            [teacherId]: !prev[teacherId],
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/teachers', { search, department_id: selectedDept }, { preserveState: true });
    };

    const handleOpenEdit = (t) => {
        setEditTeacher(t);
        const currentSubjectIds = t.subjects ? t.subjects.map((s) => s.id) : [];
        setFormData({
            name: t.name,
            nickname: t.nickname || '',
            nip: t.nip || '',
            email: t.email || '',
            phone: t.phone || '',
            title: t.title || 'Guru Pengampu',
            department_id: t.department_id || '',
            max_weekly_hours: t.max_weekly_hours || 32,
            status: t.status || 'active',
            subject_ids: currentSubjectIds,
        });
    };

    const toggleSubject = (subId) => {
        setFormData((prev) => {
            const exists = prev.subject_ids.includes(subId);
            const newSubjects = exists
                ? prev.subject_ids.filter((id) => id !== subId)
                : [...prev.subject_ids, subId];
            return { ...prev, subject_ids: newSubjects };
        });
    };

    const handleSubmitAdd = (e) => {
        e.preventDefault();
        router.post('/admin/teachers', formData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setFormData({
                    name: '',
                    nickname: '',
                    nip: '',
                    email: '',
                    phone: '',
                    title: 'Guru Pengampu',
                    department_id: '',
                    max_weekly_hours: 32,
                    password: 'password123',
                    subject_ids: [],
                });
            },
        });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        router.put(`/admin/teachers/${editTeacher.id}`, formData, {
            onSuccess: () => setEditTeacher(null),
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        router.post(`/admin/teachers/${resetPassTeacher.id}/reset-password`, { password: newPassword }, {
            onSuccess: () => setResetPassTeacher(null),
        });
    };

    const handleDelete = (t) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun pengajar ${t.name}?`)) {
            router.delete(`/admin/teachers/${t.id}`);
        }
    };

    return (
        <AdminLayout title="Data Guru & NIP">
            <Head title="Data Guru & NIP — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <Users className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Kelola Akun Tenaga Pendidik & Guru
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Database komprehensif pendidik unik: nama panggilan, NIP, rumpun jurusan, multi-mapel yang diampu, dan kredensial akses.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Akun Guru
                            </button>
                        </div>
                    </div>

                    {/* Search & Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, panggilan, NIP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>

                            <select
                                value={selectedDept}
                                onChange={(e) => {
                                    setSelectedDept(e.target.value);
                                    router.get('/admin/teachers', { search, department_id: e.target.value }, { preserveState: true });
                                }}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Semua Rumpun Jurusan</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.code} — {d.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                            >
                                Cari
                            </button>
                        </form>

                        <div className="flex items-center gap-6 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span>Akun Unik: <strong className="text-slate-900 font-semibold">{teachers.length} Guru</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                <span>Standar JP Mingguan: <strong className="text-slate-900 font-semibold">32-36 Jam</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Teachers Table Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Profil & Nama Panggilan</th>
                                    <th className="px-6 py-3.5">NIP & Rumpun Jurusan</th>
                                    <th className="px-6 py-3.5">Mata Pelajaran Diampu</th>
                                    <th className="px-6 py-3.5">Kontak & Email</th>
                                    <th className="px-6 py-3.5">Kata Sandi</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                                            Tidak ada data pengajar yang sesuai dengan filter pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.map((t) => {
                                        const isPassRevealed = revealedPasswords[t.id];
                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {t.name
                                                                .split(' ')
                                                                .slice(0, 2)
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 leading-snug">
                                                                {t.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded text-[11px]">
                                                                    {t.nickname || 'Pengajar'}
                                                                </span>
                                                                <span>• {t.title || 'Guru Pengampu'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-xs text-slate-800 font-medium">
                                                        {t.nip || '— (Non-PNS)'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        {t.department ? (
                                                            <span className="font-semibold text-slate-700">
                                                                {t.department.code} ({t.department.name})
                                                            </span>
                                                        ) : (
                                                            'Guru Umum / Normatif'
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {t.subjects && t.subjects.length > 0 ? (
                                                            t.subjects.map((sub) => (
                                                                <span
                                                                    key={sub.id}
                                                                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200"
                                                                >
                                                                    {sub.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">Belum diplot</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 space-y-1">
                                                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[160px]">{t.email || t.user?.email || '—'}</span>
                                                    </div>
                                                    {t.phone && (
                                                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span>{t.phone}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200/60 min-w-[90px] text-center">
                                                            {isPassRevealed ? 'password123' : '••••••••'}
                                                        </div>
                                                        <button
                                                            onClick={() => togglePasswordReveal(t.id)}
                                                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                                            title={isPassRevealed ? 'Sembunyikan' : 'Lihat Sandi Awal'}
                                                        >
                                                            {isPassRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        t.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {t.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-1.5">
                                                    <button
                                                        onClick={() => setResetPassTeacher(t)}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(t)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit Data"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Hapus Akun"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Guru */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmitAdd} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                <Users className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Akun Pengajar Baru</h3>
                                <p className="text-xs text-slate-500">Buat kredensial akun guru unik untuk login ke Ruang Kerja Guru.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lengkap & Gelar *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Dra. Hj. Sri Wahyuni, M.Pd"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Panggilan
                                </label>
                                <input
                                    type="text"
                                    placeholder="Bu Sri"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    NIP (Nomor Induk Pegawai)
                                </label>
                                <input
                                    type="text"
                                    placeholder="197508122000031001"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Rumpun Jurusan
                                </label>
                                <select
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="">-- Guru Umum / Normatif --</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.code} — {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Alamat Email Pengajar *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="nama.guru@smkn1.sch.id"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nomor WhatsApp
                                </label>
                                <input
                                    type="text"
                                    placeholder="081234567890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Multi-Select Assigned Subjects */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Mata Pelajaran Diampu (Dapat Memilih Lebih dari 1 Mapel)
                            </label>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {subjects.map((sub) => {
                                    const isChecked = formData.subject_ids.includes(sub.id);
                                    return (
                                        <label
                                            key={sub.id}
                                            onClick={() => toggleSubject(sub.id)}
                                            className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                                                isChecked ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                                isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                                            }`}>
                                                {isChecked && <Check className="w-3 h-3" />}
                                            </div>
                                            <span className="truncate">{sub.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Maksimal JP Per Minggu
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="48"
                                    value={formData.max_weekly_hours}
                                    onChange={(e) => setFormData({ ...formData, max_weekly_hours: parseInt(e.target.value) || 32 })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Kata Sandi Default
                                </label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                        >
                            Simpan Akun Guru
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Guru */}
            <Modal show={!!editTeacher} onClose={() => setEditTeacher(null)} maxWidth="lg">
                {editTeacher && (
                    <form onSubmit={handleSubmitEdit} className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Perbarui Profil Pengajar</h3>
                                <p className="text-xs text-slate-500">Edit informasi biodata, panggilan, jurusan, dan multi-mapel.</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nama Lengkap & Gelar *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nama Panggilan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        NIP
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nip}
                                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Rumpun Jurusan
                                    </label>
                                    <select
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    >
                                        <option value="">-- Guru Umum / Normatif --</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.code} — {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nomor WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Multi-Select Assigned Subjects */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Mata Pelajaran Diampu
                                </label>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {subjects.map((sub) => {
                                        const isChecked = formData.subject_ids.includes(sub.id);
                                        return (
                                            <label
                                                key={sub.id}
                                                onClick={() => toggleSubject(sub.id)}
                                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                                                    isChecked ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                                    isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                                                }`}>
                                                    {isChecked && <Check className="w-3 h-3" />}
                                                </div>
                                                <span className="truncate">{sub.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Maksimal JP Per Minggu
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="48"
                                        value={formData.max_weekly_hours}
                                        onChange={(e) => setFormData({ ...formData, max_weekly_hours: parseInt(e.target.value) || 32 })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Status Akun
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Non-Aktif</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditTeacher(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal Reset Password */}
            <Modal show={!!resetPassTeacher} onClose={() => setResetPassTeacher(null)} maxWidth="sm">
                {resetPassTeacher && (
                    <form onSubmit={handleResetPassword} className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Reset Sandi Guru</h3>
                                <p className="text-xs text-slate-500">{resetPassTeacher.name}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Kata Sandi Baru
                            </label>
                            <input
                                type="text"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                            />
                            <p className="text-xs text-slate-400 mt-1.5">
                                Berikan kata sandi baru ini kepada guru yang bersangkutan.
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setResetPassTeacher(null)}
                                className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Konfirmasi Reset
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
