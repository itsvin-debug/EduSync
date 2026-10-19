import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AvatarCropperModal from '@/Components/AvatarCropperModal';
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
    Building2,
    Globe,
    Save,
    Check,
} from 'lucide-react';

export default function Settings({ adminUser = {}, appName = 'EDUSYNC', schoolName = 'SMKN 1 Ciomas' }) {
    const { errors, flash } = usePage().props;

    // Web & School Branding State
    const [generalData, setGeneralData] = useState({
        app_name: appName || 'EDUSYNC',
        school_name: schoolName || 'SMKN 1 Ciomas',
    });
    const [savingGeneral, setSavingGeneral] = useState(false);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        name: adminUser.name || '',
        email: adminUser.email || '',
        phone: adminUser.phone || '',
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(adminUser.avatar || null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [savingPassword, setSavingPassword] = useState(false);

    // 2FA Form State
    const [twoFactorCustomCode, setTwoFactorCustomCode] = useState(adminUser.two_factor_code || '');
    const [saving2FA, setSaving2FA] = useState(false);

    const handleGeneralSubmit = (e) => {
        e.preventDefault();
        setSavingGeneral(true);
        router.post('/admin/settings/general', generalData, {
            preserveScroll: true,
            onFinish: () => setSavingGeneral(false),
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setTempAvatarUrl(URL.createObjectURL(file));
            setCropModalOpen(true);
            e.target.value = '';
        }
    };

    const handleCropComplete = (croppedFile, previewUrl) => {
        setProfileData((prev) => ({ ...prev, avatar: croppedFile }));
        setAvatarPreview(previewUrl);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setSavingProfile(true);
        const data = new FormData();
        data.append('name', profileData.name);
        data.append('email', profileData.email);
        if (profileData.phone) data.append('phone', profileData.phone);
        if (profileData.avatar) data.append('avatar', profileData.avatar);

        router.post('/admin/settings/profile', data, {
            preserveScroll: true,
            onFinish: () => setSavingProfile(false),
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setSavingPassword(true);
        router.post('/admin/settings/password', passwordData, {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
            onFinish: () => setSavingPassword(false),
        });
    };

    const handleToggle2FA = (enableState) => {
        setSaving2FA(true);
        router.post('/admin/settings/2fa', {
            enable: enableState,
            two_factor_code: twoFactorCustomCode,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving2FA(false),
        });
    };

    return (
        <AdminLayout title="Pengaturan Akun & 2FA">
            <Head title="Pengaturan Akun & 2FA — EDUSYNC Admin" />

            <div className="space-y-6 max-w-4xl pb-12">
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                Pengaturan Akun, Identitas Web & Keamanan 2FA
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Atur identitas nama aplikasi, nama sekolah, informasi akun administrator, kata sandi, dan proteksi verifikasi dua langkah.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 1: Identitas Web & Nama Sekolah */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Identitas Aplikasi & Nama Sekolah
                            </h2>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Ditampilkan di Landing Page, Navbar & Sidebar
                        </span>
                    </div>

                    <form onSubmit={handleGeneralSubmit} className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Aplikasi / Web *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={generalData.app_name}
                                        onChange={(e) => setGeneralData({ ...generalData, app_name: e.target.value })}
                                        placeholder="Contoh: EDUSYNC"
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                                    />
                                </div>
                                {errors.app_name && <p className="text-xs text-rose-600 mt-1">{errors.app_name}</p>}
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Mengganti teks judul merek aplikasi di seluruh sistem.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lembaga / Sekolah *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={generalData.school_name}
                                        onChange={(e) => setGeneralData({ ...generalData, school_name: e.target.value })}
                                        placeholder="Contoh: SMKN 1 Ciomas"
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                                    />
                                </div>
                                {errors.school_name && <p className="text-xs text-rose-600 mt-1">{errors.school_name}</p>}
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Mengganti teks identitas sekolah pada landing page dan laporan resmi.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingGeneral}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all duration-200 ease-bouncy cursor-pointer"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{savingGeneral ? 'Menyimpan...' : 'Simpan Identitas Web'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Profil Pengguna & Avatar (Terkoneksi ke Kotak E Landing Page) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Informasi Profil Administrator
                            </h2>
                        </div>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            Foto Admin langsung tampil di Kotak Logo Landing Page
                        </span>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="mt-5 space-y-5">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-5">
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-indigo-600 border-2 border-indigo-200 overflow-hidden flex items-center justify-center text-white font-bold text-xl shadow-xs">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        adminUser.name?.substring(0, 2).toUpperCase() || 'E'
                                    )}
                                </div>
                                <label className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-md transition-colors duration-200 ease-bouncy">
                                    <Camera className="w-3.5 h-3.5" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="space-y-1">
                                <div className="font-bold text-slate-900 text-sm">{adminUser.name || 'Administrator'}</div>
                                <div className="text-xs text-slate-500">
                                    Username Login / Email: <span className="font-mono text-slate-800">{adminUser.email}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    Klik ikon kamera untuk memilih & memotong foto profil. Foto ini otomatis tampil pada kotak logo landing page.
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lengkap Administrator *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                                />
                                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Username Login (Email) *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                                />
                                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nomor WhatsApp / Kontak
                            </label>
                            <input
                                type="text"
                                placeholder="081234567890"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full md:w-1/2 px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                            />
                            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all duration-200 ease-bouncy cursor-pointer"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{savingProfile ? 'Menyimpan...' : 'Perbarui Profil Admin'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 3: Ganti Password (Wajib Password Lama, Password Baru, Konfirmasi) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                    <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            Ganti Kata Sandi Administrator
                        </h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Password Saat Ini (Password Lama) *
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Masukkan password lama Anda"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className="w-full md:w-2/3 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                            />
                            {errors.current_password && (
                                <p className="text-xs text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.current_password}</span>
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
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                                />
                                {errors.password && <p className="text-xs text-rose-600 mt-1.5">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Konfirmasi Password Baru *
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Ulangi password baru persis"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 transition-all duration-200 ease-bouncy"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all duration-200 ease-bouncy cursor-pointer"
                            >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>{savingPassword ? 'Memproses...' : 'Perbarui Kata Sandi'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 4: Autentikasi 2-Faktor (2FA) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                    Verifikasi 2 Langkah dalam Login (2FA)
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                                    Ketika 2FA aktif, saat login admin sistem akan meminta kode verifikasi tambahan setelah username dan kata sandi benar.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <button
                                onClick={() => handleToggle2FA(!adminUser.two_factor_enabled)}
                                disabled={saving2FA}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ease-bouncy shadow-xs cursor-pointer ${
                                    adminUser.two_factor_enabled
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                            >
                                {saving2FA
                                    ? 'Memproses...'
                                    : adminUser.two_factor_enabled
                                    ? 'Nonaktifkan 2FA'
                                    : 'Aktifkan 2FA Sekarang'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Kode Verifikasi 2FA Khusus (Dibuat oleh Admin)
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                <input
                                    type="text"
                                    value={twoFactorCustomCode}
                                    onChange={(e) => setTwoFactorCustomCode(e.target.value)}
                                    placeholder="Contoh: 889123 atau PIN-RAHASIA"
                                    className="flex-1 px-3.5 py-2 text-xs font-mono font-bold tracking-wider bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleToggle2FA(true)}
                                    disabled={saving2FA}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all duration-200 ease-bouncy cursor-pointer shrink-0"
                                >
                                    Simpan Kode 2FA
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1.5">
                                Kode ini yang akan Anda masukkan setiap kali masuk ke akun Admin pada layar login.
                            </p>
                        </div>

                        {adminUser.two_factor_enabled ? (
                            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <div className="font-bold text-emerald-900 text-xs">
                                            Status: 2FA Sedang Aktif & Melindungi Login
                                        </div>
                                        <div className="text-[11px] text-emerald-800 mt-0.5">
                                            Kode Verifikasi Saat Ini: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 font-bold">{adminUser.two_factor_code || 'Belum diset'}</strong>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg text-center shrink-0">
                                    Terlindungi
                                </span>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>2FA saat ini dinonaktifkan. Aktifkan untuk mewajibkan kode verifikasi 2 langkah saat login.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AvatarCropperModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={tempAvatarUrl}
                onCropCompleteCallback={handleCropComplete}
            />
        </AdminLayout>
    );
}
