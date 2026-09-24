import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Users,
    Building2,
    ShieldCheck,
    ArrowRight,
    Search,
    BookOpen,
    Clock,
    Sparkles,
    CheckCircle2,
    Laptop,
    Wrench,
    Video,
    Palette,
    Flame,
    ExternalLink,
} from 'lucide-react';
import Logo from '@/Components/Logo';

export default function Index({ departments = [], classrooms = [], teachers = [], stats }) {
    const [searchClass, setSearchClass] = useState('XI_PPLG_1');

    const getDeptIcon = (code) => {
        switch (code) {
            case 'PPLG': return Laptop;
            case 'ANM': return Palette;
            case 'BCF': return Video;
            case 'TO': return Wrench;
            case 'TPFL': return Flame;
            default: return BookOpen;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans selection:bg-indigo-500 selection:text-white">
            <Head title="EDUSYNC — Portal Akademik & Penjadwalan SMK Negeri" />

            {/* HEADER */}
            <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Logo size="default" subtitle="SMK Negeri Vokasi" />

                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            <span>Masuk ke Portal</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sistem Penjadwalan Bebas Bentrok (Conflict-Free) & Dapodik 2024/2025</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Platform Manajemen Jadwal & Akademik Terpadu SMK Negeri
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed max-w-2xl">
                        Sistem cerdas untuk mengelola alokasi jam mengajar, pembagian lab/bengkel praktik kejuruan, dan verifikasi piket harian siswa dengan akurasi 100%.
                    </p>

                    {/* Role Entry Cards */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <a
                            href="/quick-login/admin"
                            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-400 transition-all text-left flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base">Portal Admin & Kurikulum</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Schedule Matrix Builder, deteksi tabrakan instruktur, master data guru & siswa.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                                <span>Buka Control Center</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </a>

                        <a
                            href="/quick-login/guru"
                            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all text-left flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                                    <CalendarDays className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base">Portal Guru Pengampu</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Jadwal mengajar mingguan, kartu aktif "Sedang Mengajar", dan verifikasi piket kelas.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                                <span>Buka Ruang Kerja</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </a>

                        <a
                            href="/quick-login/siswa"
                            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-left flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base">Portal Siswa (Mobile)</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Timeline pelajaran hari ini, kalender kelas, lapor bukti piket, dan direktori guru WhatsApp.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:gap-2 transition-all">
                                <span>Buka Dashboard Siswa</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </a>
                    </div>
                </div>

                {/* STATS 4-COLUMN BAR */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-center md:border-r border-slate-100 last:border-0">
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total_teachers}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">Guru Pengampu Terjadwal</div>
                    </div>
                    <div className="text-center md:border-r border-slate-100 last:border-0">
                        <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.total_classrooms}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">Rombongan Belajar (Rombel)</div>
                    </div>
                    <div className="text-center md:border-r border-slate-100 last:border-0">
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600">100%</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">Validasi Bebas Bentrok</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total_schedules}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">Sesi Alokasi Pelajaran</div>
                    </div>
                </div>
            </section>

            {/* VOCATIONAL DEPARTMENTS SECTION */}
            <section className="py-12 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                Program Kejuruan
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                                5 Konsentrasi Keahlian Vokasi
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 max-w-md">
                            Setiap konsentrasi keahlian didukung oleh laboratorium modern dan bengkel praktik dengan sinkronisasi jam blok kejuruan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {departments.map((dept) => {
                            const Icon = getDeptIcon(dept.code);
                            return (
                                <div
                                    key={dept.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm">{dept.code}</div>
                                        <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                                            {dept.name}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>{dept.classrooms_count} Rombel</span>
                                        <span className="font-semibold text-indigo-600">Aktif</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-xs">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">EDUSYNC</span>
                        <span>• Sistem Informasi Akademik & Penjadwalan SMK Negeri</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                        <span>Dapodik Vokasi</span>
                        <span>•</span>
                        <span>Kurikulum Merdeka 2024/2025</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
