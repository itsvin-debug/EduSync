import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import Modal from '@/Components/Modal';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine } from '@/hooks/useScheduleEngine';
import {
    CalendarDays,
    Clock,
    Building2,
    CheckCircle2,
    XCircle,
    ArrowLeftRight,
    Search,
    BookOpen,
    Users,
    AlertCircle,
    Sparkles,
    Eye,
    Calendar,
    Check,
    MapPin,
    Coffee,
} from 'lucide-react';

export default function Dashboard({
    teacher,
    personalSchedules = [],
    todaySchedules = [],
    activeSchedule,
    todayName = 'Senin',
    classrooms = [],
    selectedClassroomId,
    masterClassSchedule = [],
    invalRequests = [],
    picketReports = [],
    allTeachers = [],
}) {
    const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'personal', 'piket', 'master', 'inval'
    const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('Senin');
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

    const { data: swapData, setData: setSwapData, post: postSwap, reset: resetSwap, processing: swapProcessing, errors: swapErrors } = useForm({
        schedule_id: personalSchedules[0]?.id || '',
        substitute_teacher_id: allTeachers[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        notes: '',
    });

    const handleLookupClassChange = (classId) => {
        router.get('/guru/dashboard', { lookup_class_id: classId }, { preserveState: true });
    };

    const handleSwapSubmit = (e) => {
        e.preventDefault();
        postSwap('/guru/swap-request', {
            onSuccess: () => {
                setIsSwapModalOpen(false);
                resetSwap();
            },
        });
    };

    const handleVerifyPicket = (id, status) => {
        router.post(`/guru/picket/${id}/verify`, { status });
    };

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const pendingPicketCount = picketReports.filter(p => p.status === 'pending').length;
    const weeklyDaySchedules = personalSchedules.filter(s => s.day === selectedWeeklyDay);

    const totalTeachingHours = personalSchedules.reduce((acc, s) => acc + (s.period_end - s.period_start + 1), 0);
    const uniqueClassCount = new Set(personalSchedules.map(s => s.classroom_id)).size;

    // Real-time schedule engine for teacher
    const { clock, engineState, nextSlot, getPeriodStatus } = useScheduleEngine(personalSchedules);

    return (
        <TeacherLayout teacher={teacher} title="Ruang Kerja & Jadwal Mengajar">
            <Head title={`Ruang Kerja Guru - ${teacher.name} - EDUSYNC`} />

            {/* TOP ACTIVE CLASS HERO BANNER WITH REAL-TIME CLOCK */}
            <div className="bg-[#0B1727] text-white rounded-2xl p-6 sm:p-7 shadow-sm mb-6 border border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                {clock.dayName}
                            </span>
                            <span className="font-mono font-bold text-amber-300 text-xs px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700">
                                {clock.timeString}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                {clock.dateFormatted} • TA {clock.academicYear}
                            </span>
                            <span className="text-xs text-indigo-300 font-medium">NIP: {teacher.nip || '-'}</span>
                        </div>

                        {engineState.state === 'CLASS_ACTIVE' && engineState.activeSlot ? (
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                                    {engineState.activeSlot.classroom?.name} — {engineState.activeSlot.subject?.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        <span className="font-medium text-white">{engineState.activeSlot.room?.name || 'Ruang Teori'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        <span>Jam ke-{engineState.activeSlot.period_start} s/d {engineState.activeSlot.period_end}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-mono text-emerald-300">
                                        <span>Sisa Mengajar: {engineState.countdownFormatted}</span>
                                    </div>
                                </div>
                                <div className="w-full max-w-md bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                    <div
                                        className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${engineState.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        ) : engineState.state === 'BREAK_TIME' ? (
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-amber-300">
                                    {engineState.label}
                                </h1>
                                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                                    <Coffee className="w-4 h-4 text-amber-400" />
                                    <span>Waktu Istirahat Guru & Siswa • Sisa waktu: {engineState.countdownFormatted}</span>
                                </p>
                            </div>
                        ) : engineState.state === 'WEEKEND_HOLIDAY' ? (
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">
                                    Libur Akhir Pekan
                                </h1>
                                <p className="text-xs text-slate-400 mt-1">
                                    Kegiatan belajar mengajar dimulai kembali hari Senin pukul 06:30.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">
                                    Tidak Ada Jam Mengajar Berlangsung Saat Ini
                                </h1>
                                <p className="text-xs text-slate-400 mt-1">
                                    {nextSlot ? `Sesi mengajar berikutnya: ${nextSlot.classroom?.name} (${nextSlot.subject?.name}) jam ke-${nextSlot.period_start}` : 'Waktu luang dapat digunakan untuk persiapan modul ajar atau pemeriksaan evaluasi siswa.'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => setIsSwapModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                            <ArrowLeftRight className="w-4 h-4 text-indigo-200" />
                            <span>Ajukan Tukar Jam (Inval)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 OPERATIONAL METRICS GRID (Stitch Screen 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Beban Jam Mengajar
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">{totalTeachingHours || personalSchedules.length * 3} JP</span>
                            <span className="text-xs font-semibold text-emerald-600">100% Linear</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Alokasi Mingguan Terjadwal</p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Standar Guru: 24-32 JP</span>
                        <span className="text-emerald-600 font-medium">Terpenuhi</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Kelas Diampu
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">{uniqueClassCount || 4} Rombel</span>
                            <span className="text-xs font-semibold text-indigo-600">Kejuruan</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Tingkat X, XI, & XII</p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Konsentrasi Keahlian</span>
                        <button onClick={() => setActiveTab('master')} className="text-indigo-600 font-semibold hover:underline">
                            Cek Rombel ›
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Verifikasi Piket Siswa
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">{pendingPicketCount} Laporan</span>
                            <span className={`text-xs font-semibold ${pendingPicketCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {pendingPicketCount > 0 ? 'Menunggu Verifikasi' : 'Semua Bersih'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Kebersihan Lab & Bengkel</p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Foto Siswa Terkini</span>
                        <button onClick={() => setActiveTab('piket')} className="text-amber-600 font-semibold hover:underline">
                            Periksa Foto ›
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Disposisi Inval
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <ArrowLeftRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">{invalRequests.length} Pengajuan</span>
                            <span className="text-xs font-semibold text-slate-600">Semester Ini</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Penggantian Jam Mengajar</p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Disetujui Kurikulum</span>
                        <button onClick={() => setIsSwapModalOpen(true)} className="text-indigo-600 font-semibold hover:underline">
                            + Ajukan Inval ›
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('workspace')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'workspace'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>Ruang Kerja Hari Ini ({todaySchedules.length} Sesi)</span>
                </button>

                <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'personal'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    <span>Jadwal Mingguan Pribadi ({personalSchedules.length} Total)</span>
                </button>

                <button
                    onClick={() => setActiveTab('piket')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'piket'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi Piket Siswa</span>
                    {pendingPicketCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                            {pendingPicketCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('master')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'master'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Cek Jadwal Kelas Lain</span>
                </button>

                <button
                    onClick={() => setActiveTab('inval')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'inval'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Pengajuan Inval ({invalRequests.length})</span>
                </button>
            </div>

            {/* TAB 1: WORKSPACE HARI INI */}
            {activeTab === 'workspace' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Sesi Mengajar Hari Ini ({todayName})</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Daftar kelas yang dijadwalkan untuk Anda ampu hari ini</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                                {todaySchedules.length} Sesi
                            </span>
                        </div>

                        {todaySchedules.length === 0 ? (
                            <div className="text-center py-12 text-xs text-slate-400">
                                Tidak ada jam mengajar yang dijadwalkan untuk hari ini.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todaySchedules.map((s) => (
                                    <div
                                        key={s.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex items-start justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm">{s.classroom?.name}</span>
                                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    Jam ke-{s.period_start} s/d {s.period_end}
                                                </span>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-800">{s.subject?.name}</div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{s.room?.name || 'Ruang Teori'}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsSwapModalOpen(true)}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 transition-colors"
                                        >
                                            Tukar Jam
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Duty Quick Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base mb-2">Tugas Akademik & Piket</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Pantau laporan kebersihan kelas bimbingan Anda dan delegasikan jam pelajaran jika ada agenda kedinasan.
                            </p>

                            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Laporan Piket Menunggu:</span>
                                    <span className="font-bold text-slate-900">{pendingPicketCount} Laporan</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Total Jam Mengajar Mingguan:</span>
                                    <span className="font-bold text-indigo-700">{personalSchedules.length * 3} JP</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setActiveTab('piket')}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                            >
                                Periksa Laporan Piket Siswa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: JADWAL MINGGUAN PRIBADI */}
            {activeTab === 'personal' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Jadwal Mengajar Mingguan Lengkap</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Alokasi seluruh jam mengajar Anda dari Senin sampai Jumat</p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {days.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedWeeklyDay(d)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedWeeklyDay === d
                                            ? 'bg-white text-indigo-700 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {weeklyDaySchedules.length === 0 ? (
                        <div className="p-12 text-center text-xs text-slate-400">
                            Tidak ada jadwal mengajar pada hari {selectedWeeklyDay}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weeklyDaySchedules.map((s) => (
                                <div
                                    key={s.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white shadow-xs transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                Jam ke-{s.period_start} s/d {s.period_end}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                {s.subject?.category}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-900">{s.classroom?.name}</h4>
                                        <p className="text-xs text-slate-700 font-semibold mt-1">{s.subject?.name}</p>
                                    </div>

                                    <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-xs text-slate-500 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{s.room?.name || 'Ruang Teori'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: VERIFIKASI PIKET SISWA */}
            {activeTab === 'piket' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Verifikasi Laporan Kebersihan Siswa</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Periksa catatan dan foto kondisi kelas sebelum menyetujui (ACC)</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            {pendingPicketCount} Menunggu Verifikasi
                        </span>
                    </div>

                    {picketReports.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-400">
                            Belum ada laporan piket yang disetor siswa.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {picketReports.map((p) => (
                                <div
                                    key={p.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 text-sm">{p.classroom?.name}</span>
                                            <span className="text-slate-400 text-xs">•</span>
                                            <span className="text-xs text-slate-600">Disetor oleh: <strong>{p.student?.name}</strong></span>
                                            <span className="text-slate-400 text-xs font-mono text-[11px]">({p.date})</span>
                                        </div>
                                        <p className="text-xs text-slate-700 italic">"{p.notes}"</p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                            p.status === 'approved'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : p.status === 'rejected'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {p.status === 'approved' ? 'Terverifikasi (ACC)' : p.status === 'rejected' ? 'Ditolak' : 'Menunggu ACC'}
                                        </span>

                                        {p.status === 'pending' && (
                                            <div className="flex items-center gap-1.5 pl-2">
                                                <button
                                                    onClick={() => handleVerifyPicket(p.id, 'approved')}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                                                >
                                                    Setujui (ACC)
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyPicket(p.id, 'rejected')}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: CEK JADWAL KELAS LAIN */}
            {activeTab === 'master' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Pengecekan Jadwal Kelas Lain (Koordinasi)</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Lihat jadwal kelas untuk pertukaran jam mengajar</p>
                        </div>

                        <select
                            value={selectedClassroomId}
                            onChange={(e) => handleLookupClassChange(e.target.value)}
                            className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="py-2.5 px-3">Hari</th>
                                    <th className="py-2.5 px-3">Jam Ke</th>
                                    <th className="py-2.5 px-3">Mata Pelajaran</th>
                                    <th className="py-2.5 px-3">Pengajar</th>
                                    <th className="py-2.5 px-3">Ruangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {masterClassSchedule.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="py-2.5 px-3 font-semibold text-slate-800">{item.day}</td>
                                        <td className="py-2.5 px-3 font-mono">JP {item.period_start}-{item.period_end}</td>
                                        <td className="py-2.5 px-3 font-bold text-indigo-950">{item.subject?.name}</td>
                                        <td className="py-2.5 px-3 text-slate-800 font-medium">{item.teacher?.name}</td>
                                        <td className="py-2.5 px-3 text-slate-500">{item.room?.name || 'Ruang Teori'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: PENGAJUAN INVAL */}
            {activeTab === 'inval' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Riwayat & Status Pengajuan Inval</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Daftar permohonan delegasi jam mengajar ke Kurikulum</p>
                        </div>
                        <button
                            onClick={() => setIsSwapModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ajukan Baru</span>
                        </button>
                    </div>

                    {invalRequests.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-400">
                            Belum ada pengajuan substitusi jam mengajar.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invalRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                                >
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">
                                            {req.schedule?.classroom?.name} — {req.schedule?.subject?.name}
                                        </div>
                                        <div className="text-slate-600 text-xs mt-1">
                                            Pengganti: <strong>{req.substitute?.name}</strong> • Tanggal: {req.date}
                                        </div>
                                        <p className="text-slate-500 text-[11px] mt-0.5 italic">"{req.reason}"</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider self-start md:self-center border ${
                                        req.status === 'approved'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : req.status === 'rejected'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu ACC'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: AJUKAN TUKAR JAM */}
            <Modal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                title="Pengajuan Tukar Jam Mengajar (Inval)"
                description="Kirimkan permohonan delegasi jam mengajar ke Bagian Kurikulum"
            >
                <form onSubmit={handleSwapSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Pilih Sesi Jadwal Anda
                        </label>
                        <select
                            value={swapData.schedule_id}
                            onChange={(e) => setSwapData('schedule_id', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
                            required
                        >
                            {personalSchedules.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.day} (JP {s.period_start}-{s.period_end}) — {s.classroom?.name} ({s.subject?.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Guru Pengganti yang Disepakati
                        </label>
                        <select
                            value={swapData.substitute_teacher_id}
                            onChange={(e) => setSwapData('substitute_teacher_id', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50"
                            required
                        >
                            {allTeachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.title ? `(${t.title})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Efektif</label>
                        <input
                            type="date"
                            value={swapData.date}
                            onChange={(e) => setSwapData('date', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Alasan Berhalangan Hadir
                        </label>
                        <textarea
                            value={swapData.reason}
                            onChange={(e) => setSwapData('reason', e.target.value)}
                            placeholder="Contoh: Mengikuti Rapat Koordinasi Vokasi Provinsi di Dinas Pendidikan"
                            className="w-full h-20 p-3 rounded-xl border border-slate-200 text-xs"
                            required
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsSwapModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={swapProcessing}
                            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                        >
                            Kirim Permohonan Inval
                        </button>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
