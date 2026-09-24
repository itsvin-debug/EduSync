import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    BookOpen,
    Users,
    Plus,
    Search,
    Edit2,
    UserCheck,
    Building2,
    Upload,
    Award,
    Code,
    Palette,
    Video,
    Wrench,
    Flame,
    CheckCircle2,
    Shield,
    Tag,
} from 'lucide-react';

export default function Departments({ departments = [], teachers = [] }) {
    const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || null);
    const [searchTeacher, setSearchTeacher] = useState('');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editDept, setEditDept] = useState(null);
    const [assignKaprogDept, setAssignKaprogDept] = useState(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    // Form
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        head_teacher_id: '',
        color: 'indigo',
        icon: 'code',
        description: '',
        icon_image: null,
    });

    const activeDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];

    const filteredFaculty = (activeDepartment?.teachers || []).filter((t) => {
        const matchesSearch =
            t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
            (t.nickname && t.nickname.toLowerCase().includes(searchTeacher.toLowerCase())) ||
            (t.title && t.title.toLowerCase().includes(searchTeacher.toLowerCase()));
        return matchesSearch;
    });

    const handleOpenEdit = (dept) => {
        setEditDept(dept);
        setFormData({
            code: dept.code,
            name: dept.name,
            head_teacher_id: dept.head_teacher_id || '',
            color: dept.color || 'indigo',
            icon: dept.icon || 'code',
            description: dept.description || '',
            icon_image: null,
        });
    };

    const handleSubmitAdd = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('code', formData.code);
        data.append('name', formData.name);
        if (formData.head_teacher_id) data.append('head_teacher_id', formData.head_teacher_id);
        data.append('color', formData.color);
        data.append('icon', formData.icon);
        if (formData.description) data.append('description', formData.description);
        if (formData.icon_image) data.append('icon_image', formData.icon_image);

        router.post('/admin/departments', data, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setFormData({
                    code: '',
                    name: '',
                    head_teacher_id: '',
                    color: 'indigo',
                    icon: 'code',
                    description: '',
                    icon_image: null,
                });
            },
        });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('code', formData.code);
        data.append('name', formData.name);
        if (formData.head_teacher_id) data.append('head_teacher_id', formData.head_teacher_id);
        data.append('color', formData.color);
        data.append('icon', formData.icon);
        if (formData.description) data.append('description', formData.description);
        if (formData.icon_image) data.append('icon_image', formData.icon_image);

        router.post(`/admin/departments/${editDept.id}`, data, {
            onSuccess: () => setEditDept(null),
        });
    };

    const handleAssignKaprog = (e) => {
        e.preventDefault();
        router.post(`/admin/departments/${assignKaprogDept.id}/assign-kaprog`, {
            teacher_id: selectedTeacherId,
        }, {
            onSuccess: () => setAssignKaprogDept(null),
        });
    };

    const getDeptIconComponent = (iconName) => {
        switch (iconName) {
            case 'code': return <Code className="w-5 h-5" />;
            case 'palette': return <Palette className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'tool': return <Wrench className="w-5 h-5" />;
            case 'flame': return <Flame className="w-5 h-5" />;
            default: return <BookOpen className="w-5 h-5" />;
        }
    };

    return (
        <AdminLayout title="Jurusan & Kaprog">
            <Head title="Jurusan & Kaprog — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <BookOpen className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Program Keahlian, Kaprog & Guru Jurusan
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Kelola data konsentrasi keahlian, penetapan Kepala Program (Kaprog), icon kejuruan, dan distribusi tenaga pendidik.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Jurusan Baru
                            </button>
                        </div>
                    </div>
                </div>

                {/* Major Tabs & Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Department List Selector */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
                            Daftar Program Keahlian ({departments.length})
                        </div>
                        {departments.map((dept) => {
                            const isSelected = selectedDeptId === dept.id;
                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelectedDeptId(dept.id)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                                        isSelected
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                            : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {dept.icon_image ? (
                                            <img src={dept.icon_image} alt={dept.code} className="w-5 h-5 object-contain" />
                                        ) : (
                                            getDeptIconComponent(dept.icon)
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm tracking-tight">{dept.code}</span>
                                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                                isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {dept.classrooms?.length || 0} Kelas
                                            </span>
                                        </div>
                                        <div className={`text-xs truncate mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {dept.name}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: Selected Department Detail & Faculty Table */}
                    <div className="lg:col-span-3 space-y-6">
                        {activeDepartment && (
                            <>
                                {/* Department Detail Card */}
                                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 p-2">
                                                {activeDepartment.icon_image ? (
                                                    <img src={activeDepartment.icon_image} alt={activeDepartment.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="text-slate-700">
                                                        {getDeptIconComponent(activeDepartment.icon)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                                        {activeDepartment.code}
                                                    </span>
                                                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                                                        {activeDepartment.name}
                                                    </h2>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {activeDepartment.description || 'Program keahlian kejuruan resmi berbasis kurikulum merdeka.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setAssignKaprogDept(activeDepartment);
                                                    setSelectedTeacherId(activeDepartment.head_teacher_id || '');
                                                }}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                            >
                                                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                                Tugaskan Kaprog
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(activeDepartment)}
                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200/60"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                Edit Jurusan
                                            </button>
                                        </div>
                                    </div>

                                    {/* Kaprog Banner & Stats */}
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                            <div className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">
                                                Kepala Program Keahlian (Kaprog)
                                            </div>
                                            <div className="font-bold text-sm text-slate-900 mt-1">
                                                {activeDepartment.head_teacher?.name || activeDepartment.head_teacher_name || 'Belum Ditugaskan'}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                NIP: {activeDepartment.head_teacher?.nip || '—'}
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                                                Guru Jurusan Terhubung
                                            </div>
                                            <div className="text-xl font-bold text-slate-900 mt-1">
                                                {activeDepartment.teachers?.length || 0} Pengajar
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                Tenaga pendidik produktif kejuruan
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                                                Jumlah Rombel / Kelas
                                            </div>
                                            <div className="text-xl font-bold text-slate-900 mt-1">
                                                {activeDepartment.classrooms?.length || 0} Rombel
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                Tingkat X, XI, XII (Termasuk PKL)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Faculty (Guru Jurusan) Table */}
                                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-indigo-600" />
                                            <h3 className="font-bold text-slate-900 text-sm">
                                                Daftar Tenaga Pendidik & Guru Kejuruan ({activeDepartment.code})
                                            </h3>
                                        </div>

                                        <div className="relative w-full sm:w-64">
                                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Cari nama atau panggilan..."
                                                value={searchTeacher}
                                                onChange={(e) => setSearchTeacher(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-3">Nama Lengkap & Panggilan</th>
                                                    <th className="px-6 py-3">Jabatan / Peran</th>
                                                    <th className="px-6 py-3">Mata Pelajaran Diampu</th>
                                                    <th className="px-6 py-3">Beban JP</th>
                                                    <th className="px-6 py-3 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs">
                                                {filteredFaculty.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                                            Belum ada tenaga pendidik yang dikaitkan secara spesifik ke jurusan ini.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredFaculty.map((t) => (
                                                        <tr key={t.id} className="hover:bg-slate-50/70">
                                                            <td className="px-6 py-3.5">
                                                                <div className="font-bold text-slate-900">
                                                                    {t.name}
                                                                </div>
                                                                <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                    <span className="font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded text-[11px]">
                                                                        {t.nickname || 'Pengajar'}
                                                                    </span>
                                                                    <span>• NIP: {t.nip || '—'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3.5">
                                                                <div className="font-semibold text-slate-800">
                                                                    {t.id === activeDepartment.head_teacher_id ? (
                                                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                                                            <Shield className="w-3.5 h-3.5" />
                                                                            Kaprog Jurusan
                                                                        </span>
                                                                    ) : (
                                                                        t.title || 'Guru Pengampu'
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3.5">
                                                                <div className="flex flex-wrap gap-1">
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
                                                                        <span className="text-slate-400 italic">Belum diplot</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3.5 font-mono">
                                                                {t.max_weekly_hours || 32} JP / Minggu
                                                            </td>
                                                            <td className="px-6 py-3.5 text-right">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                    Aktif
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah Jurusan */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmitAdd} className="p-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Tambah Program Keahlian Baru</h3>
                            <p className="text-xs text-slate-500">Daftarkan konsentrasi kejuruan dan upload logo keahlian.</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3.5">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Kode Singkat *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="PPLG"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Lengkap Jurusan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Pengembangan Perangkat Lunak dan Gim"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Kepala Program Keahlian (Kaprog)
                            </label>
                            <select
                                value={formData.head_teacher_id}
                                onChange={(e) => setFormData({ ...formData, head_teacher_id: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Pilih Guru Sebagai Kaprog --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.title || 'Guru Pengampu'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Upload Gambar Icon / Logo Jurusan
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, icon_image: e.target.files[0] })}
                                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Deskripsi Ringkas Program
                            </label>
                            <textarea
                                rows="2"
                                placeholder="Kompetensi keahlian dan sertifikasi industri..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                        >
                            Simpan Jurusan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Jurusan */}
            <Modal show={!!editDept} onClose={() => setEditDept(null)} maxWidth="md">
                {editDept && (
                    <form onSubmit={handleSubmitEdit} className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Perbarui Jurusan: {editDept.name}</h3>
                                <p className="text-xs text-slate-500">Ubah nama, kaprog, deskripsi, atau logo jurusan.</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3.5">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Kode *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Kepala Program (Kaprog)
                                </label>
                                <select
                                    value={formData.head_teacher_id}
                                    onChange={(e) => setFormData({ ...formData, head_teacher_id: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Pilih Guru Sebagai Kaprog --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Ganti Gambar Logo Jurusan
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, icon_image: e.target.files[0] })}
                                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Deskripsi Program Keahlian
                                </label>
                                <textarea
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditDept(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal Penugasan Kaprog Cepat */}
            <Modal show={!!assignKaprogDept} onClose={() => setAssignKaprogDept(null)} maxWidth="sm">
                {assignKaprogDept && (
                    <form onSubmit={handleAssignKaprog} className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tugaskan Kaprog</h3>
                                <p className="text-xs text-slate-500">Jurusan: {assignKaprogDept.name}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Pilih Guru Sebagai Kaprog *
                            </label>
                            <select
                                required
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            >
                                <option value="">-- Pilih Guru --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setAssignKaprogDept(null)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Tetapkan Kaprog
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
