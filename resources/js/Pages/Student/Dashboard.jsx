import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import Modal from '@/Components/Modal';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine } from '@/hooks/useScheduleEngine';
import {
    Clock,
    Building2,
    CalendarDays,
    CheckCircle2,
    Phone,
    Camera,
    Upload,
    Users,
    Sparkles,
    Calendar,
    Check,
    MessageCircle,
    ArrowRight,
    MapPin,
    AlertCircle,
    FileText,
    Terminal,
    ShieldCheck,
    Coffee,
    X,
    ExternalLink,
} from 'lucide-react';

export default function Dashboard({
    student,
    classroom,
    classSchedules = [],
    todayTimeline = [],
    activeLesson,
    todayName = 'Senin',
    teachers = [],
    picketHistory = [],
}) {
    const [activeTab, setActiveTab] = useState('today'); // 'today', 'weekly', 'piket', 'guru'
    const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('Senin');
    const [isPicketModalOpen, setIsPicketModalOpen] = useState(false);

    const {
        data: picketData,
        setData: setPicketData,
        post: postPicket,
        reset: resetPicket,
        processing: picketProcessing,
        errors: picketErrors,
    } = useForm({
        notes: '',
        photo: null,
    });

    const handlePicketSubmit = (e) => {
        e.preventDefault();
        postPicket('/siswa/picket', {
            onSuccess: () => {
                setIsPicketModalOpen(false);
                resetPicket();
            },
        });
    };

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    // Timetable standard school periods
    const periods = [
        { num: 1, time: '06.30 - 07.30', label: 'Upacara Bendera / Penguatan Karakter', isGeneral: true },
        { num: 2, time: '07.30 - 08.10' },
        { num: 3, time: '08.10 - 08.50' },
        { num: 4, time: '08.50 - 09.30' },
        { num: 0, time: '09.30 - 10.00', label: 'Istirahat Pertama', isBreak: true },
        { num: 5, time: '10.00 - 10.40' },
        { num: 6, time: '10.40 - 11.20' },
        { num: 7, time: '11.20 - 12.00' },
        { num: 0, time: '12.00 - 13.00', label: 'Istirahat Kedua / ISOMA', isBreak: true },
        { num: 8, time: '13.00 - 13.40' },
        { num: 9, time: '13.40 - 14.20' },
        { num: 10, time: '14.20 - 15.00' },
    ];

    // Real-time schedule engine
    const { clock, engineState, nextSlot, getPeriodStatus } = useScheduleEngine(classSchedules);

    const getTimelineSlot = (periodNum) => {
        return (classSchedules || []).filter(s => s.day === clock.dayName).find(s => periodNum >= s.period_start && periodNum <= s.period_end);
    };

    // Filter weekly schedules by selected day
    const weeklyDaySchedules = classSchedules.filter(s => s.day === selectedWeeklyDay);

    const latestPicket = picketHistory[0];

    return (
        <StudentLayout
            student={student}
            classroom={classroom}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            title="Dashboard Siswa"
        >
            <Head title={`Ruang Belajar ${classroom?.name || 'Siswa'} - EDUSYNC`} />

            {/* 1. HERO BANNER WITH SIGNATURE NAVY CARD & LIVE SCHEDULE ENGINE WIDGET */}
            <div className="bg-[#0B1727] text-white rounded-2xl p-6 sm:p-7 shadow-sm mb-6 border border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex flex-col space-y-2 max-w-2xl min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            SMK Negeri 1 Rekayasa Teknologi • Portal Siswa
                        </span>
                        <span className="font-mono font-bold text-amber-300 text-xs px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700">
                            {clock.timeString}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {clock.dateFormatted} • TA {clock.academicYear}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                        Selamat Pagi, {student?.name || 'Ahmad Fauzan Pratama'}!
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300">
                        NISN: <span className="font-mono font-semibold text-white">{student?.nisn || '0068192341'}</span> • Kelas{' '}
                        <span className="font-semibold text-white">{classroom?.name || 'XI PPLG 1'}</span> ({classroom?.department?.name || 'Pengembangan Perangkat Lunak & Gim'}) • Semester Genap 2024/2025
                    </p>
                </div>

                {/* Active Session Micro Widget with Real-time Clock & State Engine */}
                <div className="bg-[#132238] border border-slate-700/60 rounded-xl p-4 w-full xl:w-auto xl:min-w-[420px] flex flex-col space-y-3 shadow-inner">
                    <div className="flex items-center justify-between gap-2">
                        {engineState.state === 'CLASS_ACTIVE' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Pelajaran Berlangsung
                            </span>
                        ) : engineState.state === 'BREAK_TIME' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                Waktu Istirahat
                            </span>
                        ) : engineState.state === 'WEEKEND_HOLIDAY' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                Libur Akhir Pekan
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                Menunggu Jam Masuk
                            </span>
                        )}

                        <span className="font-mono text-xs text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/70">
                            {engineState.countdownSeconds > 0 ? `Sisa: ${engineState.countdownFormatted}` : clock.timeShort}
                        </span>
                    </div>

                    {/* Widget Content */}
                    <div>
                        {engineState.state === 'CLASS_ACTIVE' && engineState.activeSlot ? (
                            <>
                                <p className="font-bold text-base text-white leading-snug line-clamp-1">
                                    {engineState.activeSlot.subject?.name}
                                </p>
                                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>
                                        {engineState.activeSlot.room?.name || 'Ruang Teori'} • {engineState.activeSlot.teacher?.name}
                                    </span>
                                </p>
                                {/* Live Progress Bar */}
                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${engineState.progressPercent}%` }}
                                    />
                                </div>
                            </>
                        ) : engineState.state === 'BREAK_TIME' ? (
                            <>
                                <p className="font-bold text-base text-amber-300 leading-snug">
                                    {engineState.label}
                                </p>
                                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                                    <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>{engineState.sublabel} • Persiapkan materi untuk sesi berikutnya</span>
                                </p>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                                    <div
                                        className="bg-amber-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${engineState.progressPercent}%` }}
                                    />
                                </div>
                            </>
                        ) : engineState.state === 'WEEKEND_HOLIDAY' ? (
                            <>
                                <p className="font-bold text-base text-white leading-snug">
                                    Libur Sekolah & Akhir Pekan
                                </p>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    {engineState.sublabel}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="font-bold text-base text-white leading-snug">
                                    {engineState.label}
                                </p>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    {engineState.sublabel}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-1">
                        {engineState.activeSlot?.teacher?.phone ? (
                            <a
                                href={`https://wa.me/${engineState.activeSlot.teacher.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(engineState.activeSlot.teacher.name)}%2C%20saya%20siswa%20${encodeURIComponent(classroom?.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Guru</span>
                            </a>
                        ) : (
                            <button
                                onClick={() => setActiveTab('weekly')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>Lihat Jadwal Lengkap</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsPicketModalOpen(true)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-white text-xs font-medium border border-slate-600/70 transition-colors"
                        >
                            <Camera className="w-3.5 h-3.5 text-amber-300" />
                            <span>Lapor Piket Kelas</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. 4 QUICK METRICS GRID (Stitch Screen 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Metric 1: Kehadiran */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Kehadiran Semester Ini
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">98.5%</span>
                            <span className="text-xs font-semibold text-emerald-600">Memenuhi KKM</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.5%' }}></div>
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Target min. 90.0%</span>
                        <span className="font-medium text-slate-700">0 Alfa • 2 Izin</span>
                    </div>
                </div>

                {/* Metric 2: Sesi Belajar Hari Ini */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Sesi Hari Ini ({todayName})
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {todayTimeline.length} Sesi
                            </span>
                            <span className="text-xs text-slate-500">Jam ke 1 - 10</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                            {classroom?.name} • {classroom?.department?.name || 'Kejuruan'}
                        </p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>{todayTimeline.length > 0 ? 'Jadwal Aktif' : 'Hari Libur / Luang'}</span>
                        <button
                            onClick={() => setActiveTab('today')}
                            className="text-indigo-600 font-semibold hover:underline"
                        >
                            Buka Linimasa ›
                        </button>
                    </div>
                </div>

                {/* Metric 3: Praktikum & LSP */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Tugas & Praktikum Lab
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Terminal className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {classSchedules.filter(s => s.subject?.category === 'kejuruan').length} Mapel
                            </span>
                            <span className="text-xs font-semibold text-indigo-600">Portofolio LSP</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                            Praktikum Pemrograman & Kejuruan
                        </p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Standar Industri Vokasi</span>
                        <span className="text-emerald-600 font-medium">Terverifikasi</span>
                    </div>
                </div>

                {/* Metric 4: Status Piket Kebersihan */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Piket Kebersihan Lab
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Camera className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {latestPicket ? (
                                    latestPicket.status === 'approved' ? 'Terverifikasi' : 'Menunggu'
                                ) : (
                                    'Belum Lapor'
                                )}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                            {latestPicket ? latestPicket.notes : 'Unggah foto kebersihan kelas/lab hari ini'}
                        </p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>{picketHistory.length} Laporan Tercatat</span>
                        <button
                            onClick={() => {
                                setActiveTab('piket');
                                setIsPicketModalOpen(true);
                            }}
                            className="text-amber-600 font-semibold hover:underline"
                        >
                            + Lapor Foto ›
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. MAIN ORGANIZED TABS BAR (Rapi, Tidak Acak-Acakan, Nyaman Dipandang) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'today'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>Linimasa Hari Ini ({todayTimeline.length} Sesi)</span>
                </button>

                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'weekly'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    <span>Jadwal Mingguan Lengkap</span>
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
                    <span>Lapor & Riwayat Piket ({picketHistory.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('guru')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'guru'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Direktori Kontak Guru ({teachers.length})</span>
                </button>
            </div>

            {/* TAB 1: TODAY'S TIMELINE */}
            {activeTab === 'today' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Alur Pembelajaran Hari Ini</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Senin s/d Jumat • Jam Pelajaran ke-1 sampai ke-10 (06.30 - 15.00)
                            </p>
                        </div>
                        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {todayName} Aktif
                        </span>
                    </div>

                    <div className="space-y-3 max-w-4xl">
                        {periods.map((p, idx) => {
                            if (p.isBreak) {
                                return (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-semibold text-slate-600 flex items-center justify-center gap-2"
                                    >
                                        <Coffee className="w-4 h-4 text-amber-600" />
                                        <span>{p.label}</span>
                                        <span className="text-slate-400 font-mono text-[11px]">({p.time})</span>
                                    </div>
                                );
                            }

                            if (p.isGeneral) {
                                return (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4 text-xs"
                                    >
                                        <div className="w-20 text-center shrink-0 border-r border-slate-200 pr-3">
                                            <span className="font-bold text-slate-900 text-sm block">Jam 1</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{p.time.split(' - ')[0]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-800 text-sm">{p.label}</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                                                    Umum
                                                </span>
                                            </div>
                                            <span className="text-slate-500 text-xs mt-1 block">
                                                Wali Kelas / Kesiswaan • Lapangan Utama Sekolah
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            const slot = getTimelineSlot(p.num);
                            const periodStatus = getPeriodStatus(p.num);
                            const isCurrent = periodStatus === 'berlangsung';
                            const isCompleted = periodStatus === 'selesai';

                            return (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border transition-all flex items-start gap-4 text-xs ${
                                        isCurrent
                                            ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                            : isCompleted
                                            ? 'bg-slate-50/40 border-slate-200/60 opacity-80'
                                            : slot
                                            ? 'bg-white border-slate-200 hover:border-slate-300'
                                            : 'bg-slate-50/50 border-slate-200/60'
                                    }`}
                                >
                                    <div className="w-20 text-center shrink-0 border-r border-slate-200 pr-3">
                                        <span className="font-bold text-slate-900 text-sm block">Jam {p.num}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{p.time}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {slot ? (
                                            <div>
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {slot.subject?.name}
                                                        </span>
                                                        {isCurrent ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                                                <span>Berlangsung</span>
                                                            </span>
                                                        ) : isCompleted ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold text-[10px] border border-slate-200">
                                                                Selesai
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 font-medium text-[10px] border border-slate-200">
                                                                Mendatang
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        slot.subject?.category === 'kejuruan'
                                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                        {slot.subject?.category === 'kejuruan' ? 'Produktif Vokasi' : 'Muatan Nasional'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-slate-600 mt-2 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span className="font-medium text-slate-800">
                                                            {slot.room?.name || 'Ruang Teori'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span className="font-medium text-slate-800">
                                                            {slot.teacher?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 py-1">
                                                <span>Waktu Mandiri / Literasi Lab</span>
                                            </div>
                                        )}
                                    </div>

                                    {slot?.teacher?.phone && (
                                        <a
                                            href={`https://wa.me/${slot.teacher.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(slot.teacher.name)}%2C%20saya%20siswa%20${encodeURIComponent(classroom?.name)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold border border-emerald-200 transition-colors"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                            <span>Hubungi WA</span>
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: WEEKLY SCHEDULE MATRIX */}
            {activeTab === 'weekly' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Jadwal Pelajaran Mingguan Lengkap</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Kelas {classroom?.name} • Konsentrasi Keahlian {classroom?.department?.name}
                            </p>
                        </div>

                        {/* Day Selector Pills */}
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
                        <div className="text-center py-12 text-slate-400 text-xs">
                            Tidak ada jadwal pelajaran khusus untuk hari {selectedWeeklyDay}.
                        </div>
                    ) : (
                        <div className="space-y-3 max-w-4xl">
                            {weeklyDaySchedules
                                .sort((a, b) => a.period_start - b.period_start)
                                .map((sched) => (
                                    <div
                                        key={sched.id}
                                        className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 text-center shrink-0 border-r border-slate-200 pr-3">
                                                <span className="font-mono font-bold text-sm text-indigo-700 block">
                                                    JP {sched.period_start}-{sched.period_end}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {sched.period_end - sched.period_start + 1} Jam
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-900 text-sm">
                                                        {sched.subject?.name}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        sched.subject?.category === 'kejuruan'
                                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {sched.subject?.code}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        {sched.room?.name || 'Ruang Teori'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-slate-800 font-medium">
                                                            {sched.teacher?.name}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {sched.teacher?.phone && (
                                            <a
                                                href={`https://wa.me/${sched.teacher.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(sched.teacher.name)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold self-start sm:self-center transition-colors"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: PICKET REPORT & HISTORY */}
            {activeTab === 'piket' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submit Form Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Camera className="w-4 h-4 text-indigo-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Lapor Piket Harian</h3>
                        </div>

                        <form onSubmit={handlePicketSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Catatan / Keterangan Kondisi
                                </label>
                                <textarea
                                    value={picketData.notes}
                                    onChange={(e) => setPicketData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Lab Software 1 telah disapu, papan tulis bersih, AC dan PC telah dimatikan."
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                    required
                                />
                                {picketErrors.notes && (
                                    <span className="text-rose-500 text-[11px] mt-1 block">{picketErrors.notes}</span>
                                )}
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Unggah Foto Bukti Kebersihan
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPicketData('photo', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                                {picketErrors.photo && (
                                    <span className="text-rose-500 text-[11px] mt-1 block">{picketErrors.photo}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={picketProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50"
                            >
                                {picketProcessing ? 'Mengunggah Laporan...' : 'Kirim Laporan Piket'}
                            </button>
                        </form>
                    </div>

                    {/* Report History List */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Riwayat Laporan Piket Kelas</h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">Diverifikasi oleh Guru Piket / Wali Kelas</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                                Total: {picketHistory.length}
                            </span>
                        </div>

                        {picketHistory.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs">
                                Belum ada riwayat laporan piket yang dikirimkan.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {picketHistory.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900">
                                                    {report.date}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    report.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : report.status === 'rejected'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {report.status === 'approved' ? 'Terverifikasi Bersih' : report.status === 'rejected' ? 'Perlu Ditingkatkan' : 'Menunggu Verifikasi'}
                                                </span>
                                            </div>
                                            <p className="text-slate-600">{report.notes}</p>
                                            {report.verified_by && (
                                                <p className="text-[11px] text-slate-400">
                                                    Diverifikasi oleh: <strong>{report.verifier?.name || 'Guru Piket'}</strong>
                                                </p>
                                            )}
                                        </div>

                                        {report.photo_path && (
                                            <a
                                                href={`/storage/${report.photo_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 text-indigo-600 font-semibold text-[11px] hover:underline"
                                            >
                                                Lihat Bukti Foto
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: TEACHERS DIRECTORY WITH WHATSAPP */}
            {activeTab === 'guru' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Direktori Guru Pengampu & Wali Kelas</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Kontak resmi pengajar untuk konsultasi praktikum dan izin kehadiran
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {teachers.length} Guru Terdaftar
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teachers.map((t) => (
                            <div
                                key={t.id}
                                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                            Tenaga Pendidik
                                        </span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                            {t.title || 'Guru'}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                        {t.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                        {t.subjects?.map(s => s.name).join(', ') || 'Tenaga Pendidik Vokasi'}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="font-mono text-xs text-slate-500">
                                        {t.phone || '0812-3456-7890'}
                                    </span>
                                    <a
                                        href={`https://wa.me/${(t.phone || '081234567890').replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(t.name)}%2C%20saya%20siswa%20${encodeURIComponent(classroom?.name)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Chat WA</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PICKET MODAL */}
            {isPicketModalOpen && (
                <Modal isOpen={isPicketModalOpen} onClose={() => setIsPicketModalOpen(false)} title="Unggah Laporan Piket Kebersihan">
                    <form onSubmit={handlePicketSubmit} className="space-y-4 text-xs">
                        <p className="text-slate-500">
                            Laporkan kondisi kebersihan ruang kelas / laboratorium setelah kegiatan belajar mengajar selesai.
                        </p>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Catatan Kebersihan
                            </label>
                            <textarea
                                value={picketData.notes}
                                onChange={(e) => setPicketData('notes', e.target.value)}
                                rows={3}
                                placeholder="Contoh: Lab Software 1 bersih, sampah telah dibuang ke TPS, AC telah dimatikan."
                                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Foto Bukti (Kamera / File)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPicketData('photo', e.target.files[0])}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsPicketModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={picketProcessing}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
                            >
                                {picketProcessing ? 'Menyimpan...' : 'Kirim Laporan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </StudentLayout>
    );
}
