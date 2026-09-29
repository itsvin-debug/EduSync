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
    Plus,
    ShieldCheck,
    ClipboardList,
    Briefcase,
    Trash2,
    ExternalLink,
    FileText,
    Send,
    UserCheck,
    UserX,
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
    todayAttendance = null,
    myLearningTasks = [],
    myDutyLeaves = [],
    myTrashReports = [],
    subjects = [],
    departments = [],
    classLeaders = [],
    studentLeaveRequests = [],
    attendanceMetrics = { hadir: 0, sakit: 0, izin: 0, dispensasi: 0, alpha: 0, total: 0 },
    selectedClassAttendances = [],
    selectedClassStudents = [],
}) {
    // Tabs: workspace, personal, presensi_kelas, perizinan_siswa, tugas, presensi, izin_dinas, picket, lapor_sampah, master, inval
    const [activeTab, setActiveTab] = useState('workspace');
    const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('Senin');
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [selectedProofModal, setSelectedProofModal] = useState(null);

    // Inval swap form
    const { data: swapData, setData: setSwapData, post: postSwap, reset: resetSwap, processing: swapProcessing, errors: swapErrors } = useForm({
        schedule_id: personalSchedules[0]?.id || '',
        substitute_teacher_id: allTeachers[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        notes: '',
    });

    // Attendance check-in form for teacher
    const {
        data: attendanceData,
        setData: setAttendanceData,
        post: postAttendance,
        processing: attendanceProcessing,
    } = useForm({
        status: todayAttendance?.status || 'hadir',
        notes: todayAttendance?.notes || '',
    });

    const handleAttendanceSubmit = (e) => {
        e.preventDefault();
        postAttendance('/guru/attendance/check-in');
    };

    // Learning Task Delegation form with Dynamic Class Leader Dropdown
    const {
        data: taskData,
        setData: setTaskData,
        post: postTask,
        reset: resetTask,
        processing: taskProcessing,
    } = useForm({
        classroom_id: classrooms[0]?.id || '',
        class_leader_id: classLeaders[0]?.id || '',
        subject_id: subjects[0]?.id || '',
        period_start: 1,
        period_end: 3,
        title: '',
        instructions: '',
        file_url: '',
    });

    const filteredClassLeaders = classLeaders.filter(
        (cl) => !taskData.classroom_id || String(cl.classroom_id) === String(taskData.classroom_id)
    );

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        postTask('/guru/learning-tasks', {
            onSuccess: () => {
                resetTask();
                alert('Tugas mandiri berhasil didelegasikan langsung ke portal Ketua Kelas & tercatat di Admin.');
            },
        });
    };

    // Duty Leave form
    const {
        data: dutyData,
        setData: setDutyData,
        post: postDuty,
        reset: resetDuty,
        processing: dutyProcessing,
    } = useForm({
        date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '14:00',
        destination: '',
        purpose: '',
        letter_number: '',
    });

    const handleDutySubmit = (e) => {
        e.preventDefault();
        postDuty('/guru/duty-leaves', {
            onSuccess: () => resetDuty(),
        });
    };

    // Enhanced Trash Report form with multi-photos, department, and location tag
    const {
        data: trashData,
        setData: setTrashData,
        post: postTrash,
        reset: resetTrash,
        processing: trashProcessing,
    } = useForm({
        classroom_id: classrooms[0]?.id || '',
        department_id: departments[0]?.id || '',
        location_tag: '',
        quantity_description: '',
        period_time: 'Jam ke-4',
        photos: [],
    });

    const handleTrashSubmit = (e) => {
        e.preventDefault();
        postTrash('/guru/trash-reports', {
            onSuccess: () => {
                resetTrash();
                alert('Laporan kebersihan & sampah berhasil dikirimkan ke Admin dan diteruskan ke sistem denda.');
            },
        });
    };

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

    // Student Leave Approval Actions (Auto-syncs student attendance!)
    const handleApproveLeave = (leaveId) => {
        if (confirm('Setujui permohonan izin ini? Status kehadiran siswa pada kelas akan otomatis terisi (Auto-Sync).')) {
            router.post(`/guru/student-leaves/${leaveId}/approve`, {}, {
                preserveScroll: true,
                onSuccess: () => alert('Permohonan izin disetujui & presensi siswa otomatis diperbarui!'),
            });
        }
    };

    const handleRejectLeave = (leaveId) => {
        const note = prompt('Masukkan alasan penolakan izin (opsional):', 'Bukti surat dokter tidak jelas atau tidak memenuhi kriteria.');
        if (note !== null) {
            router.post(`/guru/student-leaves/${leaveId}/reject`, { notes: note }, {
                preserveScroll: true,
            });
        }
    };

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const pendingPicketCount = picketReports.filter((p) => p.status === 'pending').length;
    const pendingStudentLeaves = studentLeaveRequests.filter((l) => l.status === 'pending');
    const weeklyDaySchedules = personalSchedules.filter((s) => s.day === selectedWeeklyDay);

    // Real-time schedule engine for teacher
    const { clock, engineState } = useScheduleEngine(personalSchedules);

    return (
        <TeacherLayout teacher={teacher} title="Ruang Kerja & Jadwal Mengajar" activeTab={activeTab} onTabChange={setActiveTab}>
            <Head title={`Ruang Kerja Guru - ${teacher?.name || 'Guru'} - EDUSYNC`} />

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
                                {clock.dateFormatted} • TA {clock.academicYear} ({clock.semester})
                            </span>
                            <span className="text-xs text-indigo-300 font-medium">NIP: {teacher?.nip || '-'}</span>
                        </div>

                        {engineState.state === 'CLASS_ACTIVE' && engineState.activeSlot ? (
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                                    {engineState.activeSlot.classroom?.name} — {engineState.activeSlot.subject?.name}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>
                                        {engineState.activeSlot.room?.name || 'Ruang Teori'} • Jam ke-
                                        {engineState.activeSlot.period_start} s/d {engineState.activeSlot.period_end}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                                    {engineState.label}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                    {engineState.sublabel}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('presensi_kelas')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span>Pantau Presensi Siswa</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tugas')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                        >
                            <ClipboardList className="w-4 h-4 text-amber-300" />
                            <span>Delegasi Tugas Ketua Kelas</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. REAL-TIME AGGREGATE CLASS ATTENDANCE METRICS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span>Metrik Agregat Kehadiran Siswa Kelas Bimbingan Hari Ini</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Data terupdate otomatis saat Ketua Kelas menyetorkan presensi harian
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {attendanceMetrics.total} Total Siswa Terdata
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-700">Hadir</span>
                        <div className="text-2xl font-bold font-mono text-emerald-800 mt-0.5">{attendanceMetrics.hadir}</div>
                        <span className="text-[10px] text-emerald-600">
                            {attendanceMetrics.total ? Math.round((attendanceMetrics.hadir / attendanceMetrics.total) * 100) : 0}%
                        </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-amber-700">Sakit</span>
                        <div className="text-2xl font-bold font-mono text-amber-800 mt-0.5">{attendanceMetrics.sakit}</div>
                        <span className="text-[10px] text-amber-600">Surat Dokter</span>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-sky-700">Izin</span>
                        <div className="text-2xl font-bold font-mono text-sky-800 mt-0.5">{attendanceMetrics.izin}</div>
                        <span className="text-[10px] text-sky-600">Disetujui Guru</span>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-indigo-700">Dispensasi</span>
                        <div className="text-2xl font-bold font-mono text-indigo-800 mt-0.5">{attendanceMetrics.dispensasi}</div>
                        <span className="text-[10px] text-indigo-600">Lomba / Dinas</span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-rose-700">Alpa</span>
                        <div className="text-2xl font-bold font-mono text-rose-800 mt-0.5">{attendanceMetrics.alpha}</div>
                        <span className="text-[10px] text-rose-600">Tanpa Keterangan</span>
                    </div>
                </div>
            </div>

            {/* TAB: PRESENSI SISWA REAL-TIME (LIVE CLASS ATTENDANCE MONITORING) */}
            {activeTab === 'presensi_kelas' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Monitoring Presensi Siswa per Rombel</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pantau daftar presensi live siswa sebelum dan sesudah diserahkan oleh Ketua Kelas
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Pilih Kelas:</span>
                            <select
                                value={selectedClassroomId}
                                onChange={(e) => handleLookupClassChange(e.target.value)}
                                className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                            >
                                {classrooms.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.department?.name || 'Kejuruan'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedClassStudents.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Tidak ada siswa terdaftar pada rombel ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-3 w-12 text-center">No</th>
                                        <th className="py-3 px-4">Nama Siswa & NISN</th>
                                        <th className="py-3 px-4 text-center">Status Hari Ini</th>
                                        <th className="py-3 px-4">Waktu Input & Petugas</th>
                                        <th className="py-3 px-4">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedClassStudents.map((st, idx) => {
                                        const att = selectedClassAttendances.find((a) => a.user_id === st.id);
                                        const status = att?.status || 'Belum Dicatat';

                                        return (
                                            <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900">{st.name}</div>
                                                    <div className="text-[11px] font-mono text-slate-400">NISN: {st.nisn || '-'}</div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                                        status === 'hadir'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : status === 'sakit'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : status === 'izin'
                                                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                            : status === 'dispensasi'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : status === 'alpha'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {att ? (
                                                        <>
                                                            <div className="font-mono text-slate-800">{att.submitted_time || 'Sebelum 13:00'}</div>
                                                            <div className="text-[11px] text-slate-400">Ketua Kelas / Guru</div>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Menunggu input Ketua Kelas</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {att?.notes || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: VERIFIKASI IZIN & SURAT SAKIT SISWA */}
            {activeTab === 'perizinan_siswa' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Verifikasi Surat Izin / Sakit Siswa</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Setujui (ACC) atau tolak surat izin siswa. Persetujuan otomatis menyinkronkan status presensi kelas tanpa input manual.
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                            {pendingStudentLeaves.length} Menunggu Persetujuan
                        </span>
                    </div>

                    {studentLeaveRequests.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Belum ada permohonan surat izin / sakit siswa yang diajukan.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {studentLeaveRequests.map((leave) => (
                                <div
                                    key={leave.id}
                                    className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                                >
                                    <div className="space-y-1.5 max-w-xl">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-900 text-sm">{leave.student?.name}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                {leave.classroom?.name || leave.student?.classroom?.name}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                leave.type === 'sakit'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : leave.type === 'izin'
                                                    ? 'bg-sky-100 text-sky-800'
                                                    : 'bg-indigo-100 text-indigo-800'
                                            }`}>
                                                {leave.type}
                                            </span>
                                            <span className="text-slate-400 font-mono text-[11px]">
                                                {leave.start_date} s/d {leave.end_date}
                                            </span>
                                        </div>

                                        <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            "{leave.notes}"
                                        </p>

                                        {leave.proof_image_path && (
                                            <div>
                                                <button
                                                    onClick={() => setSelectedProofModal(`/storage/${leave.proof_image_path}`)}
                                                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold hover:underline"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat Bukti Foto Surat Dokter</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {leave.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApproveLeave(leave.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Setujui (Auto-Sync)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleRejectLeave(leave.id)}
                                                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                                                >
                                                    Tolak
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                                leave.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {leave.status === 'approved' ? 'Telah Disetujui (ACC)' : 'Ditolak'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: DELEGASI TUGAS KBM & KETUA KELAS */}
            {activeTab === 'tugas' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <ClipboardList className="w-5 h-5 text-indigo-600" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Delegasikan Tugas ke Ketua Kelas</h3>
                                <p className="text-[11px] text-slate-500">Kirim tugas mandiri saat dinas luar / inval</p>
                            </div>
                        </div>

                        <form onSubmit={handleTaskSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Rombongan Belajar (Kelas)</label>
                                <select
                                    value={taskData.classroom_id}
                                    onChange={(e) => {
                                        const cId = e.target.value;
                                        setTaskData('classroom_id', cId);
                                        const matchingLeader = classLeaders.find((cl) => String(cl.classroom_id) === String(cId));
                                        if (matchingLeader) {
                                            setTaskData('class_leader_id', matchingLeader.id);
                                        }
                                    }}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50"
                                    required
                                >
                                    {classrooms.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dynamic Class Leader Dropdown */}
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Penerima Tugas: Ketua Kelas Terdaftar
                                </label>
                                <select
                                    value={taskData.class_leader_id}
                                    onChange={(e) => setTaskData('class_leader_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                                    required
                                >
                                    {filteredClassLeaders.length > 0 ? (
                                        filteredClassLeaders.map((cl) => (
                                            <option key={cl.id} value={cl.id}>
                                                ⭐ {cl.name} ({cl.classroom?.name || 'Ketua Kelas'})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Belum ada Ketua Kelas terdaftar di kelas ini</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran</label>
                                <select
                                    value={taskData.subject_id}
                                    onChange={(e) => setTaskData('subject_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50"
                                    required
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Jam Ke (Awal)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={taskData.period_start}
                                        onChange={(e) => setTaskData('period_start', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Jam Ke (Akhir)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={taskData.period_end}
                                        onChange={(e) => setTaskData('period_end', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Judul Tugas / Modul</label>
                                <input
                                    type="text"
                                    value={taskData.title}
                                    onChange={(e) => setTaskData('title', e.target.value)}
                                    placeholder="Contoh: Praktikum CRUD Database & Refactor API"
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Instruksi Lengkap Pengerjaan</label>
                                <textarea
                                    value={taskData.instructions}
                                    onChange={(e) => setTaskData('instructions', e.target.value)}
                                    rows={4}
                                    placeholder="Tuliskan petunjuk pengerjaan tugas, target capaian praktikum, dan format pengumpulan..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Tautan Lampiran / Google Drive (Opsional)</label>
                                <input
                                    type="url"
                                    value={taskData.file_url}
                                    onChange={(e) => setTaskData('file_url', e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={taskProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{taskProcessing ? 'Mendelegasikan...' : 'Kirim Tugas ke Ketua Kelas'}</span>
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Tugas yang Anda Delegasikan</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Diteruskan langsung ke portal Ketua Kelas & tercatat di Admin</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {myLearningTasks.length} Tugas Didelegasikan
                            </span>
                        </div>

                        {myLearningTasks.length === 0 ? (
                            <div className="text-center py-12 text-xs text-slate-400">
                                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                                <p className="font-medium text-slate-600">Belum ada tugas yang didelegasikan</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myLearningTasks.map((t) => (
                                    <div
                                        key={t.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all flex flex-col justify-between gap-2"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {t.classroom?.name} • {t.subject?.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    t.status === 'completed'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : t.status === 'in_progress'
                                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {t.status === 'completed' ? 'Selesai' : t.status === 'in_progress' ? 'Dikerjakan' : 'Baru'}
                                                </span>
                                                <span className="text-slate-400 font-mono text-[11px]">
                                                    Jam {t.period_start}-{t.period_end}
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            {t.instructions}
                                        </p>
                                        {t.class_leader && (
                                            <div className="text-[11px] text-slate-500">
                                                Penerima: <strong>{t.class_leader.name}</strong> (Ketua Kelas)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: LAPOR SAMPAH & KEBERSIHAN KELAS */}
            {activeTab === 'lapor_sampah' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Trash2 className="w-5 h-5 text-rose-600" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Lapor Kebersihan & Sampah Kelas</h3>
                                <p className="text-[11px] text-slate-500">Kirim laporan langsung ke Admin & Satgas</p>
                            </div>
                        </div>

                        <form onSubmit={handleTrashSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Ruang Kelas / Laboratorium</label>
                                <select
                                    value={trashData.classroom_id}
                                    onChange={(e) => setTrashData('classroom_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50"
                                    required
                                >
                                    {classrooms.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Jurusan / Departemen Terkait</label>
                                <select
                                    value={trashData.department_id}
                                    onChange={(e) => setTrashData('department_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    <option value="">Semua Jurusan</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Tag Lokasi Spesifik</label>
                                <input
                                    type="text"
                                    value={trashData.location_tag}
                                    onChange={(e) => setTrashData('location_tag', e.target.value)}
                                    placeholder="Contoh: Depan Lab RPL 2 / Dekat Tangga Lantai 2"
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Sesi Waktu / Jam Pelajaran</label>
                                <input
                                    type="text"
                                    value={trashData.period_time}
                                    onChange={(e) => setTrashData('period_time', e.target.value)}
                                    placeholder="Contoh: Jam ke-4 setelah istirahat"
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Kondisi & Sampah</label>
                                <textarea
                                    value={trashData.quantity_description}
                                    onChange={(e) => setTrashData('quantity_description', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Banyak sampah plastik sisa makanan di bawah meja baris belakang, papan tulis belum dihapus..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Unggah Multi-Foto Bukti Sampah
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setTrashData('photos', Array.from(e.target.files))}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={trashProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{trashProcessing ? 'Mengirimkan...' : 'Kirim Laporan Sampah'}</span>
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Laporan Kebersihan yang Anda Kirim</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Diteruskan ke Wali Kelas dan Admin untuk penerbitan denda kebersihan</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                {myTrashReports.length} Laporan
                            </span>
                        </div>

                        {myTrashReports.length === 0 ? (
                            <div className="text-center py-12 text-xs text-slate-400">
                                <Trash2 className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                                <p className="font-medium text-slate-600">Belum ada laporan sampah yang dicatat</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myTrashReports.map((r) => (
                                    <div
                                        key={r.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-2 text-xs"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{r.classroom?.name}</span>
                                                {r.location_tag && (
                                                    <span className="text-slate-500 font-medium">({r.location_tag})</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-mono text-slate-500">
                                                {r.date} • {r.period_time}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            {r.quantity_description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: RUANG KERJA HARI INI */}
            {activeTab === 'workspace' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs lg:col-span-2">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Jadwal Mengajar Hari Ini ({todayName})</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Sesi KBM yang harus Anda hadiri di kelas/laboratorium</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {todaySchedules.length} Sesi Terjadwal
                            </span>
                        </div>

                        {todaySchedules.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Tidak ada jadwal mengajar pada hari {todayName}.
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

                    {/* Quick Access Card */}
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
                                    <span className="text-slate-600">Izin Siswa Menunggu:</span>
                                    <span className="font-bold text-amber-700">{pendingStudentLeaves.length} Permohonan</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                            <button
                                onClick={() => setActiveTab('perizinan_siswa')}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
                            >
                                Periksa Izin Siswa ({pendingStudentLeaves.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('piket')}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                            >
                                Periksa Laporan Piket Siswa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: JADWAL MINGGUAN PRIBADI */}
            {activeTab === 'personal' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
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
                                        <h4 className="font-bold text-sm text-slate-900">{s.classroom?.name}</h4>
                                        <p className="text-xs text-slate-700 font-semibold mt-1">{s.subject?.name}</p>
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

            {/* TAB: PRESENSI MANDIRI GURU */}
            {activeTab === 'presensi' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Formulir Presensi Harian Guru</h3>
                                <p className="text-[11px] text-slate-500">Pencatatan check-in mandiri kehadiran</p>
                            </div>
                        </div>

                        <form onSubmit={handleAttendanceSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-2">Status Kehadiran Hari Ini</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-600 text-white' },
                                        { val: 'izin_dinas', label: 'Izin Dinas', activeClass: 'bg-indigo-600 text-white' },
                                        { val: 'sakit', label: 'Sakit', activeClass: 'bg-amber-600 text-white' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setAttendanceData('status', opt.val)}
                                            className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                                                attendanceData.status === opt.val
                                                    ? `${opt.activeClass} border-transparent shadow-xs`
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Catatan / Keterangan Tambahan</label>
                                <textarea
                                    value={attendanceData.notes}
                                    onChange={(e) => setAttendanceData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Mengajar tepat waktu sesi pagi, hadir di sekolah pukul 06.40 WIB."
                                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={attendanceProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                            >
                                {attendanceProcessing ? 'Menyimpan...' : (todayAttendance ? 'Perbarui Presensi Hari Ini' : 'Simpan Presensi Hari Ini')}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Status Kehadiran Hari Ini ({todayName})</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Sinkronisasi otomatis ke dashboard admin kurikulum</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                    todayAttendance?.status === 'hadir'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : todayAttendance?.status === 'izin_dinas'
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : todayAttendance?.status === 'sakit'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    {todayAttendance ? (todayAttendance.status === 'hadir' ? 'Tercatat Hadir' : todayAttendance.status === 'izin_dinas' ? 'Izin Keluar Dinas' : 'Sakit') : 'Belum Check-In'}
                                </span>
                            </div>

                            {todayAttendance ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Waktu Check-In:</span>
                                            <span className="font-mono font-bold text-slate-900">{todayAttendance.check_in_time || '07:00'} WIB</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Status Verifikasi:</span>
                                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" /> Terverifikasi Sistem
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/60">
                                            <span className="text-slate-500 block mb-0.5">Catatan Pengajar:</span>
                                            <p className="font-medium text-slate-800 italic">"{todayAttendance.notes || '-'}"</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-xs text-slate-400">
                                    <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                                    <p className="font-medium text-slate-600">Belum ada catatan presensi untuk hari ini</p>
                                    <p className="text-[11px] mt-1">Silakan lakukan konfirmasi kehadiran pada formulir di sebelah kiri.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: IZIN KELUAR DINAS */}
            {activeTab === 'izin_dinas' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Formulir Izin Keluar Dinas</h3>
                                <p className="text-[11px] text-slate-500">Permohonan tugas luar sekolah / dinas</p>
                            </div>
                        </div>

                        <form onSubmit={handleDutySubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Tanggal Dinas</label>
                                <input
                                    type="date"
                                    value={dutyData.date}
                                    onChange={(e) => setDutyData('date', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Jam Mulai</label>
                                    <input
                                        type="time"
                                        value={dutyData.start_time}
                                        onChange={(e) => setDutyData('start_time', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Jam Selesai</label>
                                    <input
                                        type="time"
                                        value={dutyData.end_time}
                                        onChange={(e) => setDutyData('end_time', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Tujuan / Lokasi Dinas</label>
                                <input
                                    type="text"
                                    value={dutyData.destination}
                                    onChange={(e) => setDutyData('destination', e.target.value)}
                                    placeholder="Contoh: Balai Besar Pengembangan Penjaminan Mutu (BBPPMPV)"
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nomor Surat Tugas (Bila Ada)</label>
                                <input
                                    type="text"
                                    value={dutyData.letter_number}
                                    onChange={(e) => setDutyData('letter_number', e.target.value)}
                                    placeholder="Contoh: 800/124/SMKN-CADISDIK/2026"
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Uraian / Keperluan Tugas</label>
                                <textarea
                                    value={dutyData.purpose}
                                    onChange={(e) => setDutyData('purpose', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Menghadiri Lokakarya Kurikulum Berbasis Industri dan Uji Kompetensi Keahlian..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={dutyProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                            >
                                {dutyProcessing ? 'Mengirimkan...' : 'Kirim Permohonan Izin Dinas'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Riwayat Permohonan Izin Dinas</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Diverifikasi oleh Manajemen Kurikulum</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                Total: {myDutyLeaves.length} Pengajuan
                            </span>
                        </div>

                        {myDutyLeaves.length === 0 ? (
                            <div className="text-center py-12 text-xs text-slate-400">
                                <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                                <p className="font-medium text-slate-600">Belum ada riwayat izin keluar dinas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myDutyLeaves.map((d) => (
                                    <div
                                        key={d.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{d.destination}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    d.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : d.status === 'rejected'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {d.status === 'approved' ? 'Disetujui' : d.status === 'rejected' ? 'Ditolak' : 'Menunggu ACC'}
                                                </span>
                                            </div>
                                            <p className="text-slate-600">{d.purpose}</p>
                                            <p className="text-slate-400 text-[11px]">
                                                Tanggal: {d.date} • Pukul: {d.start_time} - {d.end_time} WIB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: VERIFIKASI PIKET SISWA */}
            {activeTab === 'piket' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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
                                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 text-sm">{p.classroom?.name}</span>
                                            <span className="text-slate-400 text-xs">•</span>
                                            <span className="text-slate-600">Disetor: <strong>{p.student?.name}</strong></span>
                                            <span className="text-slate-400 font-mono text-[11px]">({p.date})</span>
                                        </div>
                                        <p className="text-slate-700 italic">"{p.notes}"</p>
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

            {/* TAB: CEK JADWAL KELAS LAIN */}
            {activeTab === 'master' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Pengecekan Jadwal Rombel Lain (Koordinasi)</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Lihat jadwal kelas untuk pertukaran jam mengajar</p>
                        </div>

                        <select
                            value={selectedClassroomId}
                            onChange={(e) => handleLookupClassChange(e.target.value)}
                            className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
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

            {/* MODAL: PRATINJAU BUKTI */}
            {selectedProofModal && (
                <Modal isOpen={Boolean(selectedProofModal)} onClose={() => setSelectedProofModal(null)} title="Pratinjau Bukti Dokumen">
                    <div className="p-2 space-y-3">
                        <img
                            src={selectedProofModal}
                            alt="Bukti Dokumen"
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

            {/* MODAL: AJUKAN TUKAR JAM */}
            <Modal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                title="Pengajuan Tukar Jam Mengajar (Inval)"
                description="Kirimkan permohonan delegasi jam mengajar ke Bagian Kurikulum"
            >
                <form onSubmit={handleSwapSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
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
                        <label className="block font-semibold text-slate-700 mb-1">
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
                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Efektif</label>
                        <input
                            type="date"
                            value={swapData.date}
                            onChange={(e) => setSwapData('date', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Alasan Berhalangan Hadir
                        </label>
                        <textarea
                            value={swapData.reason}
                            onChange={(e) => setSwapData('reason', e.target.value)}
                            placeholder="Contoh: Mengikuti Rapat Koordinasi Vokasi di Dinas Pendidikan"
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
