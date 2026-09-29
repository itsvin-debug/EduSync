import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
    Lock,
    Unlock,
    Send,
    CheckSquare,
    Eye,
} from 'lucide-react';

export default function Dashboard({
    student,
    isClassLeader = false,
    classroom,
    classSchedules = [],
    todayTimeline = [],
    activeLesson,
    todayName = 'Senin',
    teachers = [],
    allTeachers = [],
    classStudents = [],
    todayAttendances = [],
    attendanceStats = { total: 0, hadir: 0, sakit: 0, izin: 0, dispensasi: 0, alpha: 0 },
    isAttendanceLocked = false,
    myAttendances = [],
    myAttendanceStats = { hadir: 0, sakit: 0, izin: 0, dispensasi: 0, alpha: 0 },
    myLeaveRequests = [],
    picketHistory = [],
    classFines = [],
    learningTasks = [],
    organizations = [],
}) {
    const clock = useRealtimeClock();
    const isLocked = Boolean(isAttendanceLocked || (clock.hours >= 13 && clock.hours < 24));

    // Tabs: today, weekly, absensi (Ketua Kelas), absensi-pribadi (Siswa Biasa), izin, tugas, piket, denda, ekskul, guru
    const [activeTab, setActiveTab] = useState(isClassLeader ? 'today' : 'today');
    const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('Senin');
    const [selectedFine, setSelectedFine] = useState(null);
    const [selectedProofModal, setSelectedProofModal] = useState(null);

    // 1. Attendance Matrix State for Class Leader
    const [attendanceMatrix, setAttendanceMatrix] = useState({});

    useEffect(() => {
        const initial = {};
        classStudents.forEach((st) => {
            const existing = todayAttendances.find((a) => a.user_id === st.id);
            initial[st.id] = {
                user_id: st.id,
                status: existing?.status || 'hadir',
                notes: existing?.notes || '',
                is_auto_synced: existing?.notes?.toLowerCase().includes('disetujui') || existing?.notes?.toLowerCase().includes('auto-sync'),
            };
        });
        setAttendanceMatrix(initial);
    }, [classStudents, todayAttendances]);

    const handleAttendanceChange = (userId, field, value) => {
        if (isLocked) return;
        setAttendanceMatrix((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };

    const handleBatchAttendanceSubmit = (e) => {
        e.preventDefault();
        if (isLocked) {
            alert('Presensi harian telah terkunci otomatis pada pukul 13:00 WIB.');
            return;
        }

        router.post(
            '/siswa/attendance/batch',
            {
                date: clock.dateFormatted || new Date().toISOString().split('T')[0],
                attendances: Object.values(attendanceMatrix),
            },
            {
                preserveScroll: true,
            }
        );
    };

    // 2. Student Leave Request Form
    const {
        data: leaveData,
        setData: setLeaveData,
        post: postLeave,
        reset: resetLeave,
        processing: leaveProcessing,
        errors: leaveErrors,
    } = useForm({
        type: 'sakit',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        homeroom_teacher_id: classroom?.homeroom_teacher_id || (allTeachers[0]?.id ?? ''),
        notes: '',
        proof_image: null,
    });

    const handleLeaveSubmit = (e) => {
        e.preventDefault();
        postLeave('/siswa/leave-requests', {
            onSuccess: () => {
                resetLeave();
                alert('Pengajuan izin / sakit berhasil dikirimkan ke Wali Kelas.');
            },
        });
    };

    // 3. End-of-Day Duty & Cleanliness Verification Form for Class Leader
    const {
        data: dutyData,
        setData: setDutyData,
        post: postDuty,
        reset: resetDuty,
        processing: dutyProcessing,
        errors: dutyErrors,
    } = useForm({
        notes: '',
        area_location: `Ruang Kelas ${classroom?.name || ''} & Selasar Depan`,
        duty_students: [],
        photos: [],
    });

    const handleDutyStudentToggle = (studentName) => {
        setDutyData((prev) => {
            const exists = prev.duty_students.includes(studentName);
            return {
                ...prev,
                duty_students: exists
                    ? prev.duty_students.filter((n) => n !== studentName)
                    : [...prev.duty_students, studentName],
            };
        });
    };

    const handleDutySubmit = (e) => {
        e.preventDefault();
        postDuty('/siswa/duty-report', {
            onSuccess: () => {
                resetDuty();
                alert('Laporan piket & kebersihan kelas harian berhasil disetor ke Wali Kelas, Kaprog, dan Admin.');
            },
        });
    };

    // 4. Fine Payment Form
    const {
        data: fineData,
        setData: setFineData,
        post: postFine,
        reset: resetFine,
        processing: fineProcessing,
    } = useForm({
        payment_notes: '',
    });

    const handleFineSubmit = (e) => {
        e.preventDefault();
        if (!selectedFine) return;
        postFine(`/siswa/fines/${selectedFine.id}/pay`, {
            onSuccess: () => {
                setSelectedFine(null);
                resetFine();
            },
        });
    };

    // 5. Update Task Status (Class Leader Action)
    const handleTaskStatusChange = (taskId, newStatus) => {
        router.patch(`/siswa/tasks/${taskId}/status`, { status: newStatus }, { preserveScroll: true });
    };

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
    const { engineState, nextSlot, getPeriodStatus } = useScheduleEngine(classSchedules);

    const getTimelineSlot = (periodNum) => {
        return (classSchedules || [])
            .filter((s) => s.day === clock.dayName)
            .find((s) => periodNum >= s.period_start && periodNum <= s.period_end);
    };

    const weeklyDaySchedules = classSchedules.filter((s) => s.day === selectedWeeklyDay);
    const latestPicket = picketHistory[0];

    return (
        <StudentLayout
            student={student}
            classroom={classroom}
            isClassLeader={isClassLeader}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            title={isClassLeader ? 'Portal Ketua Kelas' : 'Ruang Belajar Siswa'}
        >
            <Head title={`Ruang Belajar ${classroom?.name || 'Siswa'} - EDUSYNC`} />

            {/* 1. HERO BANNER WITH SIGNATURE NAVY CARD & LIVE SCHEDULE ENGINE WIDGET */}
            <div className="bg-[#0B1727] text-white rounded-2xl p-6 sm:p-7 shadow-sm mb-6 border border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex flex-col space-y-2 max-w-2xl min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            SMK Negeri 1 Rekayasa Teknologi • {isClassLeader ? 'Portal Ketua Kelas' : 'Portal Siswa'}
                        </span>
                        <span className="font-mono font-bold text-amber-300 text-xs px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700">
                            {clock.timeString}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {clock.dateFormatted} • TA {clock.academicYear} ({clock.semester})
                        </span>
                        {isClassLeader && (
                            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                                ⭐ Hak Akses: Ketua Kelas (Piket & Presensi)
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                        Selamat Datang, {student?.name || 'Siswa Rekayasa'}!
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300">
                        NISN: <span className="font-mono font-semibold text-white">{student?.nisn || '0068192341'}</span> • Kelas{' '}
                        <span className="font-semibold text-white">{classroom?.name || 'XI PPLG 1'}</span> (
                        {classroom?.department?.name || 'Pengembangan Perangkat Lunak & Gim'}) • Wali Kelas:{' '}
                        <span className="font-medium text-indigo-300">{classroom?.homeroom_teacher?.name || 'Guru Pembimbing'}</span>
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

                        {isClassLeader && (
                            <button
                                onClick={() => setActiveTab('piket')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-white text-xs font-medium border border-slate-600/70 transition-colors"
                            >
                                <Camera className="w-3.5 h-3.5 text-amber-300" />
                                <span>Verifikasi Piket Kelas</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. STATS & METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {isClassLeader ? (
                    <>
                        {/* Class Leader Metric 1: Kehadiran Kelas Hari Ini */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Presensi Kelas ({classroom?.name})
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="my-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold font-mono text-slate-900">
                                        {attendanceStats.hadir} / {attendanceStats.total}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600">Siswa Hadir</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all"
                                        style={{ width: `${attendanceStats.total ? (attendanceStats.hadir / attendanceStats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                                <span>{attendanceStats.sakit} Sakit • {attendanceStats.izin} Izin</span>
                                <span className="font-semibold text-rose-600">{attendanceStats.alpha} Alpa</span>
                            </div>
                        </div>

                        {/* Class Leader Metric 2: Status Kunci Presensi */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Batas Kunci Presensi
                                </span>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </div>
                            </div>
                            <div className="my-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold font-mono text-slate-900">13:00 WIB</span>
                                    <span className={`text-xs font-semibold ${isLocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {isLocked ? 'Terkunci Otomatis' : 'Input Dibuka'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 truncate">
                                    {isLocked ? 'Kunci sistem aktif setelah jam 13:00.' : 'Segera tuntaskan pengisian presensi.'}
                                </p>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                                <span>Hak: Input & Simpan</span>
                                <button onClick={() => setActiveTab('absensi')} className="text-indigo-600 font-semibold hover:underline">
                                    Buka Matriks ›
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Regular Student Metric 1: Kehadiran Pribadi */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Kehadiran Saya (30 Hari)
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="my-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold font-mono text-slate-900">{myAttendanceStats.hadir} Hari</span>
                                    <span className="text-xs font-semibold text-emerald-600">Hadir Tepat Waktu</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full"
                                        style={{ width: `${(myAttendanceStats.hadir / Math.max(1, (myAttendanceStats.hadir + myAttendanceStats.sakit + myAttendanceStats.izin + myAttendanceStats.alpha))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                                <span>{myAttendanceStats.sakit} Sakit • {myAttendanceStats.izin} Izin</span>
                                <span className="font-semibold text-rose-600">{myAttendanceStats.alpha} Alpa</span>
                            </div>
                        </div>

                        {/* Regular Student Metric 2: Surat Izin Aktif */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Pengajuan Izin / Sakit
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                    <Calendar className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="my-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold font-mono text-slate-900">
                                        {myLeaveRequests.length} Pengajuan
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 truncate">
                                    {myLeaveRequests[0] ? `Terakhir: ${myLeaveRequests[0].type.toUpperCase()} (${myLeaveRequests[0].status})` : 'Belum ada pengajuan izin'}
                                </p>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                                <span>Ditinjau Wali Kelas</span>
                                <button onClick={() => setActiveTab('izin')} className="text-sky-600 font-semibold hover:underline">
                                    + Ajukan Izin ›
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Shared Metric 3: Sesi Belajar Hari Ini */}
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
                            <span className="text-xs text-slate-500">Jam 1 - 10</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                            {classroom?.name} • {classroom?.department?.name || 'Kejuruan'}
                        </p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>{todayTimeline.length > 0 ? 'Jadwal Aktif' : 'Hari Libur'}</span>
                        <button onClick={() => setActiveTab('today')} className="text-indigo-600 font-semibold hover:underline">
                            Linimasa ›
                        </button>
                    </div>
                </div>

                {/* Shared Metric 4: Tugas Jamkos / Guru Pengganti */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Tugas Mandiri / Jamkos
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {learningTasks.length} Tugas
                            </span>
                            <span className="text-xs font-semibold text-indigo-600">Aktif</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                            {learningTasks[0] ? learningTasks[0].title : 'Tidak ada jam kosong hari ini'}
                        </p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Delegasi Pengajar</span>
                        <button onClick={() => setActiveTab('tugas')} className="text-indigo-600 font-semibold hover:underline">
                            Lihat Modul ›
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. MAIN NAVIGATION TABS BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'today' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>Linimasa Hari Ini ({todayTimeline.length} Sesi)</span>
                </button>

                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'weekly' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    <span>Jadwal Mingguan Lengkap</span>
                </button>

                {isClassLeader && (
                    <button
                        onClick={() => setActiveTab('absensi')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            activeTab === 'absensi' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Presensi Harian Kelas (Ketua Kelas)</span>
                        {isLocked && <Lock className="w-3 h-3 text-amber-300" />}
                    </button>
                )}

                <button
                    onClick={() => setActiveTab('izin')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'izin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Calendar className="w-4 h-4" />
                    <span>Pengajuan Izin / Sakit ({myLeaveRequests.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('tugas')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'tugas' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>{isClassLeader ? 'Penerima Tugas Guru Pengganti' : 'Tugas KBM / Jamkos'} ({learningTasks.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('piket')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'piket' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <CheckSquare className="w-4 h-4" />
                    <span>{isClassLeader ? 'Verifikasi Piket Pulang Sekolah' : 'Piket & Kebersihan'} ({picketHistory.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('denda')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'denda' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>Denda Kebersihan ({classFines.filter((f) => f.payment_status !== 'lunas').length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('ekskul')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'ekskul' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Organisasi & Ekskul ({organizations.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('guru')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeTab === 'guru' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                    <Phone className="w-4 h-4" />
                    <span>Kontak Guru & Wali Kelas ({teachers.length})</span>
                </button>
            </div>

            {/* TAB: PRESENSI HARIAN KELAS (KETUA KELAS SPECIAL PRIVILEGE) */}
            {activeTab === 'absensi' && isClassLeader && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                    <ShieldCheck className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Matriks Presensi Harian Siswa — {classroom?.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Pencatatan resmi kehadiran kelas oleh Ketua Kelas • Sinkron otomatis ke Guru Pengampu & Admin Kurikulum
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lock / Auto-lock Status Pill */}
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                                isLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                                {isLocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                                <span>{isLocked ? 'Terkunci Otomatis (13:00 WIB)' : 'Input Dibuka (s/d 13:00 WIB)'}</span>
                            </div>

                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                {clock.dateFormatted}
                            </span>
                        </div>
                    </div>

                    {/* Metadata & Auto-Lock Warning Notice */}
                    {isLocked ? (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Presensi Hari Ini Telah Terkunci (Pukul 13:00 WIB)</h4>
                                <p className="mt-1 text-rose-700 leading-relaxed">
                                    Sesuai aturan operasional sekolah, Ketua Kelas tidak dapat lagi mengubah data kehadiran setelah pukul 13:00 WIB.
                                    Jika terdapat kekeliruan (salah input hadir/sakit/alpa), hubungi <strong>Admin Kurikulum</strong> untuk melakukan <em>Override</em> kehadiran.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Fitur Sinkronisasi Otomatis Izin & Sakit</h4>
                                <p className="mt-1 text-indigo-800 leading-relaxed">
                                    Siswa yang surat izin / sakitnya telah disetujui oleh Wali Kelas otomatis tercatat dengan lencana khusus <strong>Auto-Sync</strong> dan status terkunci, sehingga Anda tidak perlu menginput ulang secara manual.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick Attendance Summary Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Siswa</span>
                            <div className="text-xl font-bold font-mono text-slate-900">{classStudents.length}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-emerald-700">Hadir</span>
                            <div className="text-xl font-bold font-mono text-emerald-800">
                                {Object.values(attendanceMatrix).filter((a) => a.status === 'hadir').length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-amber-700">Sakit</span>
                            <div className="text-xl font-bold font-mono text-amber-800">
                                {Object.values(attendanceMatrix).filter((a) => a.status === 'sakit').length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-sky-700">Izin</span>
                            <div className="text-xl font-bold font-mono text-sky-800">
                                {Object.values(attendanceMatrix).filter((a) => a.status === 'izin').length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-indigo-700">Dispensasi</span>
                            <div className="text-xl font-bold font-mono text-indigo-800">
                                {Object.values(attendanceMatrix).filter((a) => a.status === 'dispensasi').length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-rose-700">Alpa</span>
                            <div className="text-xl font-bold font-mono text-rose-800">
                                {Object.values(attendanceMatrix).filter((a) => a.status === 'alpha').length}
                            </div>
                        </div>
                    </div>

                    {/* Attendance Matrix Table */}
                    <form onSubmit={handleBatchAttendanceSubmit}>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-3 w-12 text-center">No</th>
                                        <th className="py-3 px-4">Nama Siswa & NISN</th>
                                        <th className="py-3 px-4 text-center">Status Kehadiran</th>
                                        <th className="py-3 px-4">Catatan Keterangan</th>
                                        <th className="py-3 px-4 text-center">Validasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classStudents.map((st, idx) => {
                                        const record = attendanceMatrix[st.id] || { status: 'hadir', notes: '', is_auto_synced: false };
                                        const isAutoSynced = record.is_auto_synced;

                                        return (
                                            <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-3 text-center font-mono text-slate-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900">{st.name}</div>
                                                    <div className="text-[11px] font-mono text-slate-400">
                                                        NISN: {st.nisn || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {[
                                                            { val: 'hadir', label: 'Hadir', color: 'peer-checked:bg-emerald-600 peer-checked:text-white' },
                                                            { val: 'sakit', label: 'Sakit', color: 'peer-checked:bg-amber-600 peer-checked:text-white' },
                                                            { val: 'izin', label: 'Izin', color: 'peer-checked:bg-sky-600 peer-checked:text-white' },
                                                            { val: 'dispensasi', label: 'Disp.', color: 'peer-checked:bg-indigo-600 peer-checked:text-white' },
                                                            { val: 'alpha', label: 'Alpa', color: 'peer-checked:bg-rose-600 peer-checked:text-white' },
                                                        ].map((opt) => (
                                                            <label
                                                                key={opt.val}
                                                                className={`cursor-pointer text-[11px] font-semibold select-none ${isLocked || isAutoSynced ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`status_${st.id}`}
                                                                    value={opt.val}
                                                                    checked={record.status === opt.val}
                                                                    disabled={isLocked || isAutoSynced}
                                                                    onChange={() => handleAttendanceChange(st.id, 'status', opt.val)}
                                                                    className="peer sr-only"
                                                                />
                                                                <span className={`px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 ${opt.color} transition-all inline-block`}>
                                                                    {opt.label}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="text"
                                                        value={record.notes}
                                                        disabled={isLocked || isAutoSynced}
                                                        onChange={(e) => handleAttendanceChange(st.id, 'notes', e.target.value)}
                                                        placeholder={isAutoSynced ? 'Izin disetujui Guru' : 'Keterangan tambahan (opsional)...'}
                                                        className="w-full text-xs p-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {isAutoSynced ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                                            Auto-Sync Guru
                                                        </span>
                                                    ) : isLocked ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                            <Lock className="w-3 h-3" />
                                                            Terkunci
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <Check className="w-3 h-3" />
                                                            Siap Simpan
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Submission Metadata & Action */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="text-xs text-slate-500 space-y-0.5">
                                <div>
                                    Pencatat: <strong>{student?.name}</strong> (Ketua Kelas {classroom?.name})
                                </div>
                                <div className="font-mono text-[11px] text-slate-400">
                                    Log: {clock.dayName}, {clock.dateFormatted} • {clock.timeString}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLocked}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                <span>Simpan & Sinkronkan Presensi Kelas</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: PRESENSI PRIBADI (REGULAR STUDENT) */}
            {activeTab === 'absensi-pribadi' && !isClassLeader && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Riwayat Presensi Kehadiran Pribadi</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Catatan kehadiran harian Anda yang dicatat oleh Ketua Kelas dan diverifikasi oleh Tim Kurikulum
                            </p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                            NISN: {student?.nisn || '-'}
                        </span>
                    </div>

                    {/* Attendance History Table */}
                    {myAttendances.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                            <p className="font-medium text-slate-600">Belum ada riwayat presensi tercatat</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-4">Tanggal Presensi</th>
                                        <th className="py-3 px-4 text-center">Status Kehadiran</th>
                                        <th className="py-3 px-4">Waktu Input</th>
                                        <th className="py-3 px-4">Keterangan</th>
                                        <th className="py-3 px-4 text-center">Verifikasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myAttendances.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-slate-800">
                                                {item.date}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                                    item.status === 'hadir'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : item.status === 'sakit'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : item.status === 'izin'
                                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                        : item.status === 'dispensasi'
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600">
                                                {item.submitted_time || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {item.notes || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {item.overridden_by_admin ? (
                                                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200">
                                                        Override Admin
                                                    </span>
                                                ) : item.is_locked ? (
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                                                        Tervalidasi
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">
                                                        Tercatat
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: PENGAJUAN IZIN / SAKIT (FOR BOTH CLASS LEADER & REGULAR STUDENTS) */}
            {activeTab === 'izin' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Form Permohonan Izin / Sakit */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Calendar className="w-5 h-5 text-sky-600" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Formulir Surat Izin / Sakit</h3>
                                <p className="text-[11px] text-slate-500">Unggah bukti dokter & ditinjau Wali Kelas</p>
                            </div>
                        </div>

                        <form onSubmit={handleLeaveSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Jenis Perizinan</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'sakit', label: 'Sakit' },
                                        { val: 'izin', label: 'Izin' },
                                        { val: 'dispensasi', label: 'Dispensasi' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setLeaveData('type', opt.val)}
                                            className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                                                leaveData.type === opt.val
                                                    ? 'bg-sky-600 text-white border-transparent shadow-xs'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={leaveData.start_date}
                                        onChange={(e) => setLeaveData('start_date', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        value={leaveData.end_date}
                                        onChange={(e) => setLeaveData('end_date', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Wali Kelas / Guru Penguji</label>
                                <select
                                    value={leaveData.homeroom_teacher_id}
                                    onChange={(e) => setLeaveData('homeroom_teacher_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50"
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
                                <label className="font-semibold text-slate-700 block mb-1">Alasan / Keterangan Sakit/Izin</label>
                                <textarea
                                    value={leaveData.notes}
                                    onChange={(e) => setLeaveData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Mengalami demam dan flu, disarankan istirahat oleh dokter klinik..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Unggah Bukti Foto / Surat Keterangan Dokter
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLeaveData('proof_image', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={leaveProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{leaveProcessing ? 'Mengirim...' : 'Kirim Permohonan Izin'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Right: Riwayat Permohonan Izin / Sakit */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Riwayat Surat Izin / Sakit Saya</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Status verifikasi oleh Wali Kelas & integrasi otomatis ke presensi</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                {myLeaveRequests.length} Pengajuan
                            </span>
                        </div>

                        {myLeaveRequests.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs">
                                <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                                <p className="font-medium text-slate-600">Belum ada surat perizinan yang diajukan</p>
                                <p className="text-[11px] mt-1">Gunakan formulir di sebelah kiri jika Anda berhalangan hadir ke sekolah.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myLeaveRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    req.type === 'sakit'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : req.type === 'izin'
                                                        ? 'bg-sky-100 text-sky-800'
                                                        : 'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                    {req.type}
                                                </span>
                                                <span className="text-slate-500 font-mono text-[11px]">
                                                    {req.start_date} s/d {req.end_date}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    req.status === 'approved'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : req.status === 'rejected'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {req.status === 'approved'
                                                        ? 'Disetujui Guru (Auto-Sync Presensi)'
                                                        : req.status === 'rejected'
                                                        ? 'Ditolak'
                                                        : 'Menunggu Review Wali Kelas'}
                                                </span>
                                            </div>

                                            <p className="text-slate-700">{req.notes}</p>
                                            <div className="text-slate-400 text-[11px]">
                                                Wali Kelas: <strong>{req.homeroom_teacher?.name || 'Wali Kelas'}</strong>
                                                {req.rejection_note && (
                                                    <span className="text-rose-600 block mt-1">Catatan Penolakan: {req.rejection_note}</span>
                                                )}
                                            </div>
                                        </div>

                                        {req.proof_image_path && (
                                            <button
                                                onClick={() => setSelectedProofModal(`/storage/${req.proof_image_path}`)}
                                                className="shrink-0 text-sky-600 hover:text-sky-700 font-semibold text-xs flex items-center gap-1 hover:underline"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Lihat Bukti Surat</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: TUGAS GURU PENGGANTI / JAMKOS */}
            {activeTab === 'tugas' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">
                                {isClassLeader ? 'Pusat Penerimaan Tugas Pengganti (Ketua Kelas)' : 'Tugas KBM Mandiri & Jam Kosong'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Modul dan bahan ajar yang didelegasikan oleh bapak/ibu guru saat dinas luar atau berhalangan hadir
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {learningTasks.length} Tugas Didelegasikan
                        </span>
                    </div>

                    {learningTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">
                            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                            <p className="font-medium text-slate-600">Tidak ada tugas guru pengganti aktif saat ini</p>
                            <p className="text-[11px] mt-1">Semua mata pelajaran berlangsung normal dengan guru pengampu.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {learningTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {task.subject?.name || 'Mata Pelajaran'}
                                            </span>
                                            <span className="text-[11px] font-mono font-semibold text-slate-500">
                                                Jam ke-{task.period_start} s/d {task.period_end}
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-slate-900 text-base mb-1">
                                            {task.title}
                                        </h4>
                                        <p className="text-xs text-indigo-600 font-medium mb-3">
                                            Guru Pengampu: {task.teacher?.name}
                                        </p>

                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                            {task.instructions}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        {/* Status badge & toggle for Class Leader */}
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                task.status === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : task.status === 'in_progress'
                                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {task.status === 'completed' ? 'Selesai' : task.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Belum Dikerjakan'}
                                            </span>

                                            {isClassLeader && (
                                                <select
                                                    value={task.status || 'pending'}
                                                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                                    className="text-[11px] h-7 px-2 rounded-lg border border-slate-200 bg-slate-50"
                                                >
                                                    <option value="pending">Status: Baru</option>
                                                    <option value="in_progress">Status: Dikerjakan</option>
                                                    <option value="completed">Status: Selesai</option>
                                                </select>
                                            )}
                                        </div>

                                        {task.file_url && (
                                            <a
                                                href={task.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>Unduh / Buka Bahan</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: PIKET & KEBERSIHAN KELAS */}
            {activeTab === 'piket' && (
                <div className="space-y-6">
                    {/* Class Leader Verification Submission Form */}
                    {isClassLeader && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                <Camera className="w-5 h-5 text-amber-600" />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Verifikasi Piket & Kebersihan Akhir KBM (Sebelum Pulang)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Unggah foto bukti ruang kelas / koridor, checklist siswa yang piket, dan kirimkan ke Wali Kelas, Kaprog, & Admin
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleDutySubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">
                                            Lokasi Ruangan / Area Piket
                                        </label>
                                        <input
                                            type="text"
                                            value={dutyData.area_location}
                                            onChange={(e) => setDutyData('area_location', e.target.value)}
                                            placeholder="Contoh: Ruang Kelas XI PPLG 1 & Selasar Depan Lab Komputer"
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">
                                            Unggah Multi-Foto Bukti Kebersihan (Bisa Pilih Banyak Foto)
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setDutyData('photos', Array.from(e.target.files))}
                                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 cursor-pointer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">
                                        Checklist Petugas Siswa yang Melaksanakan Piket Hari Ini
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                                        {classStudents.map((st) => {
                                            const isChecked = dutyData.duty_students.includes(st.name);
                                            return (
                                                <label
                                                    key={st.id}
                                                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                                        isChecked
                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleDutyStudentToggle(st.name)}
                                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="truncate">{st.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Centang siswa yang hadir melaksanakan piket. Siswa yang tidak dicentang otomatis tercatat mangkir piket.
                                    </p>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">
                                        Catatan Kebersihan & Fasilitas Kelas
                                    </label>
                                    <textarea
                                        value={dutyData.notes}
                                        onChange={(e) => setDutyData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Contoh: Papan tulis telah bersih, sampah dibuang ke TPS, jendela & pintu telah dikunci, AC & proyektor telah dimatikan."
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
                                        required
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={dutyProcessing}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                                    >
                                        <Send className="w-3.5 h-3.5 text-amber-300" />
                                        <span>{dutyProcessing ? 'Mengirim Verifikasi...' : 'Setor Laporan Piket Pulang'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Riwayat Laporan Piket */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Riwayat Laporan Piket & Kebersihan</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Diverifikasi oleh Wali Kelas & Tim Sarpras</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                {picketHistory.length} Laporan Tercatat
                            </span>
                        </div>

                        {picketHistory.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs">
                                Belum ada riwayat laporan piket yang disetor.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {picketHistory.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 text-xs"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm">{report.date}</span>
                                                <span className="font-mono text-slate-400">({report.delivery_time || '15:00 WIB'})</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    report.status === 'approved'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : report.status === 'rejected'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {report.status === 'approved' ? 'Terverifikasi Bersih' : report.status === 'rejected' ? 'Perlu Ditingkatkan' : 'Menunggu Review'}
                                                </span>
                                            </div>

                                            {report.area_location && (
                                                <span className="text-slate-500 font-medium flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {report.area_location}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                            {report.notes}
                                        </p>

                                        {/* Duty Students Checklist Tags */}
                                        {report.duty_students && report.duty_students.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-slate-400 text-[11px] font-semibold">Petugas Piket:</span>
                                                {report.duty_students.map((name, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Multi-Photos Preview Grid */}
                                        {report.photos && report.photos.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                                {report.photos.map((photo, pIdx) => (
                                                    <button
                                                        key={pIdx}
                                                        type="button"
                                                        onClick={() => setSelectedProofModal(`/storage/${photo}`)}
                                                        className="aspect-video rounded-lg overflow-hidden border border-slate-200 group relative block"
                                                    >
                                                        <img
                                                            src={`/storage/${photo}`}
                                                            alt={`Bukti Piket ${pIdx + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                                                            Lihat Foto
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : report.photo_path ? (
                                            <div className="pt-1">
                                                <button
                                                    onClick={() => setSelectedProofModal(`/storage/${report.photo_path}`)}
                                                    className="text-indigo-600 font-semibold text-[11px] hover:underline flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Bukti Foto</span>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: JADWAL MINGGUAN LENGKAP */}
            {activeTab === 'weekly' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Jadwal Pelajaran Mingguan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Alokasi seluruh jam KBM kelas {classroom?.name} dari Senin sampai Jumat</p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((d) => (
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
                            Tidak ada jadwal pelajaran pada hari {selectedWeeklyDay}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weeklyDaySchedules.map((s) => (
                                <div
                                    key={s.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
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
                                        <h4 className="font-bold text-sm text-slate-900">{s.subject?.name}</h4>
                                        <p className="text-xs text-slate-600 mt-1">{s.teacher?.name}</p>
                                    </div>

                                    <div className="mt-4 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
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

            {/* TAB: TODAY'S TIMELINE */}
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

                                                <div className="text-slate-600 text-xs mt-1 flex items-center gap-3">
                                                    <span>Pengajar: <strong>{slot.teacher?.name}</strong></span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{slot.room?.name || 'Ruang Teori'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-1 text-slate-400 italic">
                                                Tidak ada jadwal teralokasi pada sesi ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB: DENDA KEBERSIHAN KELAS */}
            {activeTab === 'denda' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Status & Catatan Denda Kebersihan Ruang Kelas</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Catatan sanksi kebersihan dari guru piket / satgas ketertiban</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            Total: {classFines.length} Catatan
                        </span>
                    </div>

                    {classFines.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">
                            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2 stroke-1" />
                            <p className="font-semibold text-slate-700 text-sm">Ruang Kelas Bersih & Tertib!</p>
                            <p className="text-[11px] mt-1 text-slate-500">Kelas Anda tidak memiliki riwayat sanksi denda kebersihan saat ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {classFines.map((fine) => {
                                const isLunas = fine.payment_status === 'lunas';
                                const isPending = fine.payment_status === 'menunggu_konfirmasi';

                                return (
                                    <div
                                        key={fine.id}
                                        className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    isLunas
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : isPending
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {isLunas ? 'Lunas / Terverifikasi' : isPending ? 'Menunggu Konfirmasi' : 'Belum Dibayar'}
                                                </span>
                                                <span className="text-slate-400 font-mono text-[11px]">ID: #{fine.id}</span>
                                            </div>

                                            <h4 className="font-bold text-slate-900 text-sm">{fine.reason}</h4>
                                            {fine.payment_notes && (
                                                <p className="italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                                                    Catatan Pelunasan: {fine.payment_notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col md:items-end gap-2 shrink-0">
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nominal Sanksi</span>
                                                <span className="text-base font-bold font-mono text-slate-900">
                                                    Rp {Number(fine.amount).toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            {!isLunas && !isPending && (
                                                <button
                                                    onClick={() => setSelectedFine(fine)}
                                                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                                                >
                                                    Konfirmasi Pembayaran
                                                </button>
                                            )}
                                            {isPending && (
                                                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                                    Sedang ditinjau Pembina
                                                </span>
                                            )}
                                            {isLunas && (
                                                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Telah Lunas
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: ORGANISASI & EKSTRAKURIKULER */}
            {activeTab === 'ekskul' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Organisasi Kesiswaan & Ekstrakurikuler</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Pengembangan bakat, kepemimpinan (OSIS/MPK), dan kejuruan vokasi</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {organizations.length} Klub Aktif
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {organizations.map((org) => (
                            <div
                                key={org.id}
                                className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {org.type === 'osis_mpk' ? 'OSIS / MPK' : org.type === 'vokasi' ? 'Komunitas Vokasi' : 'Ekstrakurikuler'}
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            {org.member_count || 0} Anggota
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-slate-900 text-base mb-1">{org.name}</h4>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                                        {org.description || 'Pengembangan kompetensi dan soft skill siswa kejuruan.'}
                                    </p>

                                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{org.schedule_day || 'Jumat'}, {org.schedule_time || '15.30 - 17.00 WIB'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{org.location || 'Lapangan Utama / Lab'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 text-[11px]">Pembina:</span>
                                    <span className="font-semibold text-slate-800 text-[11px]">
                                        {org.supervisor_teacher?.name || 'Guru Pembina'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: DIREKTORI GURU */}
            {activeTab === 'guru' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Direktori Guru Pengampu & Wali Kelas</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Kontak resmi pengajar untuk konsultasi praktikum dan izin kehadiran</p>
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

                                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{t.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                        {t.subjects?.map((s) => s.name).join(', ') || 'Tenaga Pendidik Vokasi'}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="font-mono text-xs text-slate-500">{t.phone || '0812-3456-7890'}</span>
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

            {/* MODAL: BUKTI FOTO ZOOM */}
            {selectedProofModal && (
                <Modal isOpen={Boolean(selectedProofModal)} onClose={() => setSelectedProofModal(null)} title="Pratinjau Bukti Dokumen / Foto">
                    <div className="p-2 space-y-3">
                        <img
                            src={selectedProofModal}
                            alt="Bukti Foto"
                            className="max-h-[70vh] w-auto mx-auto rounded-xl border border-slate-200 shadow-sm"
                        />
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedProofModal(null)}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* FINE PAYMENT SETTLEMENT MODAL */}
            {selectedFine && (
                <Modal isOpen={Boolean(selectedFine)} onClose={() => setSelectedFine(null)} title="Konfirmasi Pelunasan Denda Kebersihan">
                    <form onSubmit={handleFineSubmit} className="space-y-4 text-xs">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                            <div className="font-bold text-sm">
                                Pelanggaran: {selectedFine.reason}
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1">
                                <span>Total Nominal Denda:</span>
                                <span className="font-bold font-mono text-sm text-slate-900">
                                    Rp {Number(selectedFine.amount).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                                Catatan / Bukti Penyerahan Dana Denda
                            </label>
                            <textarea
                                value={fineData.payment_notes}
                                onChange={(e) => setFineData('payment_notes', e.target.value)}
                                rows={3}
                                placeholder="Contoh: Telah disetorkan tunai sebesar Rp 25.000 ke Guru Piket / Kas Sie Kebersihan melalui bendahara kelas."
                                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedFine(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={fineProcessing}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs disabled:opacity-50"
                            >
                                {fineProcessing ? 'Mengirimkan...' : 'Kirim Konfirmasi Pelunasan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </StudentLayout>
    );
}
