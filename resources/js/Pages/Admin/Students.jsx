import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    GraduationCap,
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
    User,
    Lock,
    School,
} from 'lucide-react';

export default function Students({ students = [], classrooms = [], departments = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClassroom, setSelectedClassroom] = useState(filters.classroom_id || '');
    const [revealedPasswords, setRevealedPasswords] = useState({});

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [resetPassStudent, setResetPassStudent] = useState(null);
    const [newPassword, setNewPassword] = useState('password123');

    // Forms
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nisn: '',
        phone: '',
        classroom_id: '',
        sub_role: 'Siswa',
        password: 'password123',
    });

    const togglePasswordReveal = (studentId) => {
        setRevealedPasswords((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/students', { search, classroom_id: selectedClassroom }, { preserveState: true });
    };

    const handleOpenEdit = (student) => {
        setEditStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            nisn: student.nisn || '',
            phone: student.phone || '',
            classroom_id: student.classroom_id || '',
            sub_role: student.sub_role || 'Siswa',
            status: student.status || 'active',
        });
    };

    const handleSubmitAdd = (e) => {
        e.preventDefault();
        router.post('/admin/students', formData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    nisn: '',
                    phone: '',
                    classroom_id: '',
                    sub_role: 'Siswa',
                    password: 'password123',
                });
            },
        });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        router.put(`/admin/students/${editStudent.id}`, formData, {
            onSuccess: () => setEditStudent(null),
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        router.post(`/admin/students/${resetPassStudent.id}/reset-password`, { password: newPassword }, {
            onSuccess: () => setResetPassStudent(null),
        });
    };

    const handleApprove = (id, name) => {
        if (confirm(`Setujui pendaftaran akun siswa "${name}"? Akun akan langsung aktif.`)) {
            router.post(`/admin/users/${id}/approve`);
        }
    };

    const handleReject = (id, name) => {
        if (confirm(`Tolak pendaftaran akun siswa "${name}"?`)) {
            router.post(`/admin/users/${id}/reject`);
        }
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun siswa ${name}?`)) {
            router.delete(`/admin/students/${id}`);
        }
    };

    return (
        <AdminLayout title="Manajemen Akun Siswa">
            <Head title="Kelola Akun Siswa - EDUSYNC" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-600" />
                        <span>Manajemen Akun & Data Sensitif Siswa</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola akun pengguna peserta didik, kredensial login, data kontak WhatsApp, serta reset password instan.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setFormData({
                            name: '',
                            email: '',
                            nisn: '',
                            phone: '',
                            classroom_id: classrooms[0]?.id || '',
                            sub_role: 'Siswa',
                            password: 'password123',
                        });
                        setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Akun Siswa</span>
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs mb-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa, email, atau NISN..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value)}
                        className="w-full sm:w-56 h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
                    >
                        <option value="">Semua Rombel</option>
                        {classrooms.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name} ({cls.department?.code})
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Terapkan Filter
                    </button>
                </form>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="py-3 px-4">Nama Siswa & NISN</th>
                                <th className="py-3 px-4">Rombel & Jurusan</th>
                                <th className="py-3 px-4">Kontak (Email / WA)</th>
                                <th className="py-3 px-4">Peran Kelas</th>
                                <th className="py-3 px-4">Akses Sandi (Sensitif)</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Aksi Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        Tidak ada akun siswa yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900">{s.name}</div>
                                            <div className="text-[11px] font-mono text-slate-400">
                                                NISN: {s.nisn || '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-800">{s.classroom?.name || 'Tanpa Kelas'}</div>
                                            <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                                {s.classroom?.department?.name || 'Kejuruan'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-slate-700 flex items-center gap-1 font-mono text-[11px]">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                <span>{s.email}</span>
                                            </div>
                                            {s.phone && (
                                                <div className="text-slate-500 flex items-center gap-1 font-mono text-[11px] mt-0.5">
                                                    <Phone className="w-3 h-3 text-emerald-500" />
                                                    <span>{s.phone}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                                s.sub_role === 'Ketua Kelas'
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                    : s.sub_role === 'Sekretaris'
                                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}>
                                                {s.sub_role || 'Siswa'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                                                    {revealedPasswords[s.id] ? 'password123' : '••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => togglePasswordReveal(s.id)}
                                                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                                    title={revealedPasswords[s.id] ? 'Sembunyikan' : 'Buka Kredensial'}
                                                >
                                                    {revealedPasswords[s.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {s.status === 'pending_verification' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                    <span>Menunggu Verifikasi</span>
                                                </span>
                                            ) : s.status === 'rejected' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                                                    <span>Ditolak</span>
                                                </span>
                                            ) : s.status === 'inactive' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                                                    <span>Non-Aktif</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span>Aktif</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {s.status === 'pending_verification' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(s.id, s.name)}
                                                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                                                            title="Verifikasi & Aktifkan Akun"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Setujui</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(s.id, s.name)}
                                                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                                            title="Tolak Pendaftaran"
                                                        >
                                                            <span>Tolak</span>
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setResetPassStudent(s);
                                                        setNewPassword('password123');
                                                    }}
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs"
                                                    title="Reset Kata Sandi"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(s)}
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-colors shadow-2xs"
                                                    title="Edit Data Siswa"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id, s.name)}
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-colors shadow-2xs"
                                                    title="Hapus Akun Siswa"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD STUDENT MODAL */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Akun Siswa Baru"
                description="Daftarkan akun siswa baru ke dalam sistem portal Dapodik lokal."
            >
                <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Muhammad Farhan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">NISN (10 Digit)</label>
                            <input
                                type="text"
                                placeholder="0078129381"
                                value={formData.nisn}
                                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Email Sekolah / Siswa</label>
                            <input
                                type="email"
                                required
                                placeholder="farhan@edusync.sch.id"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
                            <select
                                required
                                value={formData.classroom_id}
                                onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            >
                                <option value="">Pilih Rombel</option>
                                {classrooms.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.department?.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Peran Kelas</label>
                            <select
                                value={formData.sub_role}
                                onChange={(e) => setFormData({ ...formData, sub_role: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            >
                                <option value="Siswa">Siswa Reguler</option>
                                <option value="Ketua Kelas">Ketua Kelas</option>
                                <option value="Wakil Ketua">Wakil Ketua</option>
                                <option value="Sekretaris">Sekretaris Kelas</option>
                                <option value="Bendahara">Bendahara Kelas</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                            <input
                                type="text"
                                placeholder="0812-3456-7890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Default</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold shadow-xs"
                        >
                            Simpan Akun
                        </button>
                    </div>
                </form>
            </Modal>

            {/* EDIT STUDENT MODAL */}
            <Modal
                isOpen={!!editStudent}
                onClose={() => setEditStudent(null)}
                title={`Edit Akun Siswa: ${editStudent?.name}`}
                description="Perbarui informasi profil atau kelas untuk peserta didik ini."
            >
                <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                            <input
                                type="text"
                                value={formData.nisn}
                                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
                            <select
                                required
                                value={formData.classroom_id}
                                onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            >
                                {classrooms.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.department?.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Peran Kelas</label>
                            <select
                                value={formData.sub_role}
                                onChange={(e) => setFormData({ ...formData, sub_role: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            >
                                <option value="Siswa">Siswa</option>
                                <option value="Ketua Kelas">Ketua Kelas</option>
                                <option value="Wakil Ketua">Wakil Ketua</option>
                                <option value="Sekretaris">Sekretaris</option>
                                <option value="Bendahara">Bendahara</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Status Akun</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setEditStudent(null)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold shadow-xs"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* RESET PASSWORD MODAL */}
            <Modal
                isOpen={!!resetPassStudent}
                onClose={() => setResetPassStudent(null)}
                title={`Reset Kata Sandi: ${resetPassStudent?.name}`}
                description="Tetapkan kata sandi baru untuk akun siswa ini secara langsung."
            >
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                        <input
                            type="text"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
                            placeholder="Contoh: siswa12345"
                        />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                        Siswa akan langsung dapat login menggunakan kata sandi baru ini. Pastikan untuk memberitahukan kredensial ini kepada yang bersangkutan.
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setResetPassStudent(null)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                        >
                            Konfirmasi Reset Sandi
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
