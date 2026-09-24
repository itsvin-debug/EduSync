import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import {
    Award,
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Calendar,
    Clock,
    MapPin,
    UserCheck,
    CheckCircle2,
    User,
    Tag,
} from 'lucide-react';

export default function Organizations({ organizations = [], teachers = [], students = [] }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all, organisasi, ekskul

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editOrg, setEditOrg] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        type: 'ekskul',
        leader_name: '',
        supervisor_teacher_id: '',
        schedule_day: 'Sabtu',
        schedule_time: '08:00 - 11:00',
        location: 'Ruang Aula / Lapangan',
        member_count: 25,
        description: '',
        status: 'active',
    });

    const filteredOrgs = organizations.filter((org) => {
        const matchesSearch =
            org.name.toLowerCase().includes(search.toLowerCase()) ||
            org.leader_name?.toLowerCase().includes(search.toLowerCase()) ||
            org.supervisor_teacher?.name?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (typeFilter === 'organisasi') return org.type === 'organisasi';
        if (typeFilter === 'ekskul') return org.type === 'ekskul';

        return true;
    });

    const handleOpenEdit = (org) => {
        setEditOrg(org);
        setFormData({
            name: org.name,
            type: org.type,
            leader_name: org.leader_name || '',
            supervisor_teacher_id: org.supervisor_teacher_id || '',
            schedule_day: org.schedule_day || 'Sabtu',
            schedule_time: org.schedule_time || '08:00 - 11:00',
            location: org.location || 'Lapangan Utama',
            member_count: org.member_count || 25,
            description: org.description || '',
            status: org.status || 'active',
        });
    };

    const handleSubmitAdd = (e) => {
        e.preventDefault();
        router.post('/admin/organizations', formData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setFormData({
                    name: '',
                    type: 'ekskul',
                    leader_name: '',
                    supervisor_teacher_id: '',
                    schedule_day: 'Sabtu',
                    schedule_time: '08:00 - 11:00',
                    location: 'Ruang Aula / Lapangan',
                    member_count: 25,
                    description: '',
                    status: 'active',
                });
            },
        });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        router.put(`/admin/organizations/${editOrg.id}`, formData, {
            onSuccess: () => setEditOrg(null),
        });
    };

    const handleDelete = (org) => {
        if (confirm(`Hapus data ${org.name}?`)) {
            router.delete(`/admin/organizations/${org.id}`);
        }
    };

    return (
        <AdminLayout title="Ekskul & Organisasi">
            <Head title="Ekskul & Organisasi — EDUSYNC Admin" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                    <Award className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Manajemen Ekstrakurikuler & Organisasi Siswa
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Kelola struktur kepengurusan OSIS, MPK, Pramuka, PMR, Rohis, dan unit kegiatan minat bakat siswa.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Organisasi / Ekskul
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Ekskul & Ormawa</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{organizations.length} Unit</div>
                        </div>
                        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                            <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Organisasi Formal</div>
                            <div className="text-2xl font-bold text-indigo-950 mt-1">
                                {organizations.filter(o => o.type === 'organisasi').length} Unit
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Ekskul Minat Bakat</div>
                            <div className="text-2xl font-bold text-emerald-950 mt-1">
                                {organizations.filter(o => o.type === 'ekskul').length} Klub
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Guru Pembina Ditugaskan</div>
                            <div className="text-2xl font-bold text-amber-950 mt-1">
                                {organizations.filter(o => o.supervisor_teacher_id).length} Pembina
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Grid */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-100">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama organisasi, ketua, pembina..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    typeFilter === 'all'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Semua ({organizations.length})
                            </button>
                            <button
                                onClick={() => setTypeFilter('organisasi')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    typeFilter === 'organisasi'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                            >
                                Organisasi
                            </button>
                            <button
                                onClick={() => setTypeFilter('ekskul')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    typeFilter === 'ekskul'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                                Ekstrakurikuler
                            </button>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    {filteredOrgs.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Award className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                            <p className="text-sm font-medium">Tidak ada data organisasi yang sesuai filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            {filteredOrgs.map((org) => (
                                <div
                                    key={org.id}
                                    className="rounded-xl border border-slate-200/80 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                                                    org.type === 'organisasi'
                                                        ? 'bg-indigo-100 text-indigo-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {org.type === 'organisasi' ? 'Organisasi Intra' : 'Ekstrakurikuler'}
                                                </span>
                                                <h3 className="font-bold text-lg text-slate-900 leading-snug">
                                                    {org.name}
                                                </h3>
                                            </div>
                                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                                org.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                                            }`} title={org.status === 'active' ? 'Aktif' : 'Non-Aktif'}></span>
                                        </div>

                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                            {org.description || 'Tidak ada deskripsi singkat kegiatan.'}
                                        </p>

                                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>Ketua: <strong>{org.leader_name}</strong></span>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-700">
                                                <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                <span>Pembina: <strong>{org.supervisor_teacher?.name || 'Belum Ditugaskan'}</strong></span>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{org.schedule_day}, {org.schedule_time}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{org.location}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>Kapasitas: <strong>{org.member_count} Anggota</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(org)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit Organisasi"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(org)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Hapus Organisasi"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Organisasi */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmitAdd} className="p-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Tambah Ekskul / Organisasi</h3>
                            <p className="text-xs text-slate-500">Daftarkan unit kegiatan siswa dan guru pembina.</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Organisasi / Ekskul *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: OSIS / PMR / Paskibra"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Kategori *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="ekskul">Ekstrakurikuler</option>
                                    <option value="organisasi">Organisasi Intra</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Ketua Siswa *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama siswa ketua"
                                    value={formData.leader_name}
                                    onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Guru Pembina
                                </label>
                                <select
                                    value={formData.supervisor_teacher_id}
                                    onChange={(e) => setFormData({ ...formData, supervisor_teacher_id: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="">-- Pilih Guru Pembina --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Hari Latihan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Sabtu"
                                    value={formData.schedule_day}
                                    onChange={(e) => setFormData({ ...formData, schedule_day: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Jam Latihan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="08:00 - 11:00"
                                    value={formData.schedule_time}
                                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Jumlah Anggota *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.member_count}
                                    onChange={(e) => setFormData({ ...formData, member_count: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Lokasi Kegiatan *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Lapangan Upacara / Lab Komputer"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Deskripsi Singkat
                            </label>
                            <textarea
                                rows="2"
                                placeholder="Tujuan dan deskripsi program kerja..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                            Simpan Data
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Organisasi */}
            <Modal show={!!editOrg} onClose={() => setEditOrg(null)} maxWidth="md">
                {editOrg && (
                    <form onSubmit={handleSubmitEdit} className="p-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Perbarui Organisasi / Ekskul</h3>
                                <p className="text-xs text-slate-500">{editOrg.name}</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Nama *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Kategori *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    >
                                        <option value="ekskul">Ekstrakurikuler</option>
                                        <option value="organisasi">Organisasi Intra</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Ketua Siswa *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.leader_name}
                                        onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Guru Pembina
                                    </label>
                                    <select
                                        value={formData.supervisor_teacher_id}
                                        onChange={(e) => setFormData({ ...formData, supervisor_teacher_id: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    >
                                        <option value="">-- Pilih Guru Pembina --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Hari *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.schedule_day}
                                        onChange={(e) => setFormData({ ...formData, schedule_day: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Jam *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.schedule_time}
                                        onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Non-Aktif</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Lokasi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Deskripsi
                                </label>
                                <textarea
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditOrg(null)}
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
        </AdminLayout>
    );
}
