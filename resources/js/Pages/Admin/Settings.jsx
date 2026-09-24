import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield,
    User,
    Lock,
    KeyRound,
    Phone,
    Mail,
    CheckCircle2,
    AlertCircle,
    Smartphone,
    Camera,
    Check,
} from 'lucide-react';

export default function Settings({ adminUser = {} }) {
    const { errors } = usePage().props;

    // Profile Form State
    const [profileData, setProfileData] = useState({
        name: adminUser.name || '',
        email: adminUser.email || '',
        phone: adminUser.phone || '',
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(adminUser.avatar || null);

    // Password Form State (3 input fields strictly)
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', profileData.name);
        data.append('email', profileData.email);
        if (profileData.phone) data.append('phone', profileData.phone);
        if (profileData.avatar) data.append('avatar', profileData.avatar);

        router.post('/admin/settings/profile', data);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData({ ...profileData, avatar: file });
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/settings/password', passwordData, {
            onSuccess: () => {
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
        });
    };

    const handleToggle2FA = () => {
        router.post('/admin/settings/2fa', {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Pengaturan Akun & Keamanan">
            <Head title="Pengaturan Akun & Keamanan — EDUSYNC Admin" />

            <div className="space-y-6 max-w-4xl">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                Pengaturan Profil & Keamanan Akun Administrator
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Kelola identitas akun, ganti kata sandi dengan verifikasi ketat, dan aktifkan autentikasi 2-faktor (2FA).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 1: Profil Pengguna */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-600" />
                        Informasi Profil Akun
                    </h2>

                    <form onSubmit={handleProfileSubmit} className="mt-5 space-y-5">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-lg">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        adminUser.name?.substring(0, 2).toUpperCase() || 'AD'
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-sm transition-colors">
                                    <Camera className="w-3.5 h-3.5" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900 text-sm">{adminUser.name}</div>
                                <div className="text-xs text-slate-500">Administrator Utama • Role: {adminUser.role}</div>
                                <div className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG maks. 2MB</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Alamat Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nomor WhatsApp
                            </label>
                            <input
                                type="text"
                                placeholder="081234567890"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full md:w-1/2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Simpan Profil
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Ganti Password (Strict 3 Fields) */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600" />
                        Ganti Kata Sandi Akun
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Password Saat Ini (Verifikasi Lama) *
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Masukkan kata sandi lama Anda"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className="w-full md:w-2/3 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                            />
                            {errors.current_password && (
                                <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.current_password}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Password Baru *
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimal 8 karakter"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                                {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Konfirmasi Password Baru *
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Ulangi password baru"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                Perbarui Kata Sandi
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 3: Autentikasi 2-Faktor (2FA) */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Autentikasi Dua Faktor (2FA)
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                                    Tambahkan lapisan perlindungan ekstra pada akun Anda. Saat login, sistem akan meminta verifikasi keamanan tambahan untuk mencegah akses tanpa izin.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <button
                                onClick={handleToggle2FA}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                                    adminUser.two_factor_enabled
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                            >
                                {adminUser.two_factor_enabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA Sekarang'}
                            </button>
                        </div>
                    </div>

                    {adminUser.two_factor_enabled && (
                        <div className="mt-5 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                    <div className="font-bold">2FA Aktif & Terlindungi</div>
                                    <div className="text-[11px] text-emerald-800">Kode Pemulihan Cadangan: <strong className="font-mono">{adminUser.two_factor_code || '2FA-889123'}</strong></div>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                                Terverifikasi
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
