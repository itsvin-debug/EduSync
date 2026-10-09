import AvatarCropperModal from "@/Components/AvatarCropperModal";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import Modal from '@/Components/Modal';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useScheduleEngine } from '@/hooks/useScheduleEngine';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
    User,
    KeyRound,
    Settings,
    Mail,
    Download,
    UserPlus,
    FileSpreadsheet,
    PieChart,
    BarChart3,
    Image as ImageIcon,
    Video,
    Trash2,
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
    const { errors } = usePage().props;

    // Tabs: today, weekly, absensi (Ketua Kelas), izin, tugas, piket, denda, ekskul, guru, settings
    const [activeTab, setActiveTab] = useState('today');
    const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('Senin');
    const [selectedFine, setSelectedFine] = useState(null);
    const [selectedProofModal, setSelectedProofModal] = useState(null);

    // Student Account Settings State
    const [profileData, setProfileData] = useState({
        name: student?.name || '',
        email: student?.email || '',
        phone: student?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(student?.avatar || null);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setTempAvatarUrl(URL.createObjectURL(file));
            setCropModalOpen(true);
            e.target.value = null; // reset input
        }
    };

    const handleCropComplete = (croppedFile, previewUrl) => {
        setAvatarFile(croppedFile);
        setAvatarPreview(previewUrl);
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setProfileSaving(true);
        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('email', profileData.email);
        formData.append('phone', profileData.phone || '');
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        router.post('/siswa/settings/profile', formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setProfileSaving(false);
                alert('Profil akun siswa dan foto avatar berhasil diperbarui!');
            },
            onError: () => setProfileSaving(false),
        });
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        setPasswordSaving(true);
        router.post('/siswa/settings/password', passwordData, {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordSaving(false);
                alert('Kata sandi akun siswa berhasil diperbarui!');
                setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            },
            onError: () => setPasswordSaving(false),
        });
    };

    // Fast-Input Add Student Modal State for Class Leader
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [newStudentData, setNewStudentData] = useState({
        attendance_number: classStudents.length + 1,
        name: '',
        nisn: '',
    });
    const [savingStudent, setSavingStudent] = useState(false);

    const handleStoreStudent = (e) => {
        e.preventDefault();
        setSavingStudent(true);
        router.post('/siswa/students', newStudentData, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingStudent(false);
                setShowAddStudentModal(false);
                setNewStudentData({
                    attendance_number: classStudents.length + 2,
                    name: '',
                    nisn: '',
                });
                alert('Siswa baru berhasil didaftarkan ke kelas!');
            },
            onError: () => setSavingStudent(false),
        });
    };

    // Send Attendance Report to Homeroom & Department Teacher
    const [sendingReport, setSendingReport] = useState(false);
    const handleSendAttendanceReport = () => {
        if (!confirm('Kirimkan rekapitulasi presensi harian kelas resmi ke Wali Kelas dan Guru Kejuruan?')) return;
        setSendingReport(true);
        router.post('/siswa/attendance/send-report', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSendingReport(false);
                alert('Laporan presensi harian berhasil dikirimkan ke Wali Kelas & Guru Kejuruan via notifikasi!');
            },
            onError: () => setSendingReport(false),
        });
    };

    // Class Duty Active Day Selection (Senin - Jumat)
    const [activeDutyDay, setActiveDutyDay] = useState(
        ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(clock.dayName) ? clock.dayName : 'Senin'
    );
    const [dutyMediaPreviews, setDutyMediaPreviews] = useState([]);

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
    const leaveFileInputRef = useRef(null);
    const [leavePhotoPreview, setLeavePhotoPreview] = useState(null);

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

    const handleLeaveFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLeaveData('proof_image', file);
            setLeavePhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLeaveFile = () => {
        setLeaveData('proof_image', null);
        if (leavePhotoPreview) {
            URL.revokeObjectURL(leavePhotoPreview);
        }
        setLeavePhotoPreview(null);
        if (leaveFileInputRef.current) {
            leaveFileInputRef.current.value = '';
        }
    };

    const handleLeaveSubmit = (e) => {
        e.preventDefault();
        postLeave('/siswa/leave-requests', {
            preserveScroll: true,
            onSuccess: () => {
                resetLeave();
                setLeavePhotoPreview(null);
                if (leaveFileInputRef.current) leaveFileInputRef.current.value = '';
                alert('Pengajuan izin / sakit berhasil dikirimkan ke Wali Kelas.');
            },
        });
    };

    // 3. End-of-Day Duty & Cleanliness Verification Form for Class Leader
    const dutyFileInputRef = useRef(null);
    const [showAllDutyStudents, setShowAllDutyStudents] = useState(false);

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

    const handleDutyMediaChange = (files) => {
        const fileList = Array.from(files);
        if (!fileList.length) return;
        const newFiles = [...(dutyData.photos || []), ...fileList];
        setDutyData('photos', newFiles);

        const newPreviews = fileList.map((file) => ({
            name: file.name,
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: URL.createObjectURL(file),
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        }));
        setDutyMediaPreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleRemoveDutyMedia = (index) => {
        const updatedFiles = [...(dutyData.photos || [])];
        updatedFiles.splice(index, 1);
        setDutyData('photos', updatedFiles);

        const updatedPreviews = [...dutyMediaPreviews];
        if (updatedPreviews[index]?.url) {
            URL.revokeObjectURL(updatedPreviews[index].url);
        }
        updatedPreviews.splice(index, 1);
        setDutyMediaPreviews(updatedPreviews);
    };

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

    const handleSelectAllDutyDayStudents = (studentsList) => {
        const names = studentsList.map((s) => s.name);
        setDutyData((prev) => {
            const merged = Array.from(new Set([...prev.duty_students, ...names]));
            return { ...prev, duty_students: merged };
        });
    };

    const handleClearAllDutyStudents = () => {
        setDutyData((prev) => ({ ...prev, duty_students: [] }));
    };

    const handleDutySubmit = (e) => {
        e.preventDefault();
        postDuty('/siswa/duty-report', {
            preserveScroll: true,
            onSuccess: () => {
                resetDuty();
                setDutyMediaPreviews([]);
                if (dutyFileInputRef.current) dutyFileInputRef.current.value = '';
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

    // Personal Attendance Calculations & Chart.js Configs (INDIVIDUAL TRACKING)
    const totalPersonalRecords =
        (myAttendanceStats.hadir || 0) +
        (myAttendanceStats.sakit || 0) +
        (myAttendanceStats.izin || 0) +
        (myAttendanceStats.dispensasi || 0) +
        (myAttendanceStats.alpha || 0);

    const personalAttendanceRate = totalPersonalRecords > 0
        ? Math.round(((myAttendanceStats.hadir || 0) / totalPersonalRecords) * 100)
        : 100;

    const personalDoughnutData = useMemo(() => ({
        labels: ['Hadir', 'Sakit', 'Izin', 'Dispensasi', 'Alpa'],
        datasets: [
            {
                data: [
                    myAttendanceStats.hadir || 0,
                    myAttendanceStats.sakit || 0,
                    myAttendanceStats.izin || 0,
                    myAttendanceStats.dispensasi || 0,
                    myAttendanceStats.alpha || 0,
                ],
                backgroundColor: [
                    '#10B981', // emerald-500
                    '#F59E0B', // amber-500
                    '#0EA5E9', // sky-500
                    '#6366F1', // indigo-500
                    '#EF4444', // rose-500
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6,
            },
        ],
    }), [myAttendanceStats]);

    const personalDoughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: { size: 11, weight: '600' },
                    padding: 12,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.raw} Hari (${totalPersonalRecords > 0 ? Math.round((context.raw / totalPersonalRecords) * 100) : 0}%)`,
                },
            },
        },
        cutout: '70%',
    };

    const personalBarData = useMemo(() => ({
        labels: ['Hadir', 'Sakit', 'Izin', 'Disp.', 'Alpa'],
        datasets: [
            {
                label: 'Jumlah Hari',
                data: [
                    myAttendanceStats.hadir || 0,
                    myAttendanceStats.sakit || 0,
                    myAttendanceStats.izin || 0,
                    myAttendanceStats.dispensasi || 0,
                    myAttendanceStats.alpha || 0,
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(239, 68, 68, 0.85)',
                ],
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    }), [myAttendanceStats]);

    const personalBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.raw} Hari Tercatat`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    font: { size: 10 },
                },
                grid: { color: 'rgba(226, 232, 240, 0.6)' },
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11, weight: '600' } },
            },
        },
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

            {/* 1. HERO BANNER & METRICS (ONLY VISIBLE ON DASHBOARD & JADWAL HARI INI) */}
            {activeTab === 'today' && (
                <>
                    <div className="bg-[#0B1727] text-white rounded-2xl p-6 sm:p-7 shadow-sm mb-6 border border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex flex-col space-y-2 max-w-2xl min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            SMKN 1 Ciomas • {isClassLeader ? 'Portal Ketua Kelas' : 'Portal Siswa'}
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
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Guru</span>
                            </a>
                        ) : (
                            <button
                                onClick={() => setActiveTab('weekly')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>Lihat Jadwal Lengkap</span>
                            </button>
                        )}

                        {isClassLeader && (
                            <button
                                onClick={() => setActiveTab('piket')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-white text-xs font-medium border border-slate-600/70 transition-colors duration-200 ease-bouncy"
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
                {/* Individual Metric 1: Kehadiran Pribadi Siswa */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Kehadiran Saya (30 Hari)
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="my-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {myAttendanceStats.hadir || 0} Hari
                            </span>
                            <span className="text-xs font-semibold text-emerald-600">
                                {personalAttendanceRate}% Kehadiran
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-200 ease-bouncy"
                                style={{ width: `${personalAttendanceRate}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>{myAttendanceStats.sakit || 0} Sakit • {myAttendanceStats.izin || 0} Izin</span>
                        <span className="font-semibold text-rose-600">{myAttendanceStats.alpha || 0} Alpa</span>
                    </div>
                </div>

                {/* Individual Metric 2: Surat Izin / Sakit Saya */}
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
                            <span className="text-xs font-medium text-slate-500">Personal</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate">
                            {myLeaveRequests[0] ? `Terakhir: ${myLeaveRequests[0].type.toUpperCase()} (${myLeaveRequests[0].status})` : 'Belum ada surat izin/sakit'}
                        </p>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Ditinjau Wali Kelas</span>
                        <button onClick={() => setActiveTab('izin')} className="text-sky-600 font-semibold hover:underline">
                            + Ajukan Izin ›
                        </button>
                    </div>
                </div>

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
                            {learningTasks[0] ? learningTasks[0].title : 'Tidak ada tugas jam kosong'}
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

            {/* 3. INDIVIDUAL ATTENDANCE ANALYTICS SECTION (INTERACTIVE DONUT & BAR CHARTS) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <PieChart className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">
                                Statistik & Analisis Presensi Kehadiran Pribadi ({student?.name})
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Visualisasi interaktif catatan kehadiran personal Anda (Hadir, Sakit, Izin, Dispensasi, Alpa)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Tingkat Kehadiran: {personalAttendanceRate}%
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
                            Total Rekap: {totalPersonalRecords} Hari
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
                    {/* Donut Chart with Center Rate */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider text-center flex items-center gap-1.5">
                            <PieChart className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Proporsi Kehadiran Pribadi</span>
                        </div>
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                            <Doughnut data={personalDoughnutData} options={personalDoughnutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
                                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                                    {personalAttendanceRate}%
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    Kehadiran
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart Breakdown */}
                    <div className="lg:col-span-7">
                        <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Komparasi Jumlah Hari Presensi Personal</span>
                        </div>
                        <div className="h-52 sm:h-56 w-full">
                            <Bar data={personalBarData} options={personalBarOptions} />
                        </div>
                    </div>
                </div>

                {/* Quick Metric Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 mt-2 border-t border-slate-100">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block">Hadir</span>
                        <span className="text-lg font-bold font-mono text-emerald-800">{myAttendanceStats.hadir || 0} Hari</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-amber-700 block">Sakit</span>
                        <span className="text-lg font-bold font-mono text-amber-800">{myAttendanceStats.sakit || 0} Hari</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-sky-700 block">Izin</span>
                        <span className="text-lg font-bold font-mono text-sky-800">{myAttendanceStats.izin || 0} Hari</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-indigo-700 block">Dispensasi</span>
                        <span className="text-lg font-bold font-mono text-indigo-800">{myAttendanceStats.dispensasi || 0} Hari</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-center col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-rose-700 block">Alpa</span>
                        <span className="text-lg font-bold font-mono text-rose-800">{myAttendanceStats.alpha || 0} Hari</span>
                    </div>
                </div>
            </div>
                </>
            )}

            {/* TAB: PRESENSI HARIAN KELAS (KETUA KELAS SPECIAL PRIVILEGE) */}
            {activeTab === 'absensi' && isClassLeader && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    {/* Header with Title and Action Buttons */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base leading-tight">
                                    Lembar Presensi Harian Siswa — {classroom?.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pencatatan resmi kehadiran kelas oleh Ketua Kelas • Sinkron real-time ke Guru Pengampu & Admin
                                </p>
                            </div>
                        </div>

                        {/* Top Action Buttons: Fast-Input Modal, Send Report, and PDF Export */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setShowAddStudentModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 shadow-2xs transition-colors duration-200 ease-bouncy"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>+ Tambah Siswa Baru</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSendAttendanceReport}
                                disabled={sendingReport}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{sendingReport ? 'Mengirim...' : 'Kirim Laporan ke Guru'}</span>
                            </button>

                            <a
                                href="/siswa/attendance/export-pdf"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh PDF Resmi</span>
                            </a>

                            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold ${
                                isLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                                {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                                <span>{isLocked ? 'Terkunci (13:00)' : 'Dibuka s/d 13:00'}</span>
                            </div>
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

                    {/* Class-wide Real-Time Attendance Statistics */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Statistik Kehadiran Rombel Kelas ({classroom?.name})
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                                {attendanceStats.total > 0 ? Math.round((Object.values(attendanceMatrix).filter((a) => a.status === 'hadir').length / attendanceStats.total) * 100) : 0}% Kehadiran Rombel
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Siswa</span>
                                <div className="text-xl font-bold font-mono text-slate-900">{classStudents.length}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Hadir (Present)</span>
                                <div className="text-xl font-bold font-mono text-emerald-800">
                                    {Object.values(attendanceMatrix).filter((a) => a.status === 'hadir').length}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                                <span className="text-[10px] uppercase font-bold text-amber-700 block">Sakit (Sick)</span>
                                <div className="text-xl font-bold font-mono text-amber-800">
                                    {Object.values(attendanceMatrix).filter((a) => a.status === 'sakit').length}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
                                <span className="text-[10px] uppercase font-bold text-sky-700 block">Izin (Permit)</span>
                                <div className="text-xl font-bold font-mono text-sky-800">
                                    {Object.values(attendanceMatrix).filter((a) => a.status === 'izin').length}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Dispensasi</span>
                                <div className="text-xl font-bold font-mono text-indigo-800">
                                    {Object.values(attendanceMatrix).filter((a) => a.status === 'dispensasi').length}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                                <span className="text-[10px] uppercase font-bold text-rose-700 block">Alpa (Absent)</span>
                                <div className="text-xl font-bold font-mono text-rose-800">
                                    {Object.values(attendanceMatrix).filter((a) => a.status === 'alpha').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Class Attendance Form Table strictly with requested columns: [ No | Full Name | NISN | Present | Sick | Permission/Dispensation | Absent ] */}
                    <form onSubmit={handleBatchAttendanceSubmit}>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-3 w-12 text-center">No</th>
                                        <th className="py-3 px-4 min-w-[200px]">Full Name</th>
                                        <th className="py-3 px-3 w-28 text-center font-mono">NISN</th>
                                        <th className="py-3 px-2 w-20 text-center text-emerald-700 bg-emerald-50/50">Present</th>
                                        <th className="py-3 px-2 w-20 text-center text-amber-700 bg-amber-50/50">Sick</th>
                                        <th className="py-3 px-2 w-32 text-center text-sky-700 bg-sky-50/50">Permission / Disp.</th>
                                        <th className="py-3 px-2 w-20 text-center text-rose-700 bg-rose-50/50">Absent</th>
                                        <th className="py-3 px-3 min-w-[150px]">Catatan / Remarks</th>
                                        <th className="py-3 px-3 w-28 text-center">Validasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classStudents.map((st, idx) => {
                                        const record = attendanceMatrix[st.id] || { status: 'hadir', notes: '', is_auto_synced: false };
                                        const isAutoSynced = record.is_auto_synced;

                                        return (
                                            <tr key={st.id} className="hover:bg-slate-50/70 transition-colors duration-200 ease-bouncy">
                                                {/* 1. No / Absen Number */}
                                                <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                                                    {st.attendance_number || (idx + 1)}
                                                </td>

                                                {/* 2. Full Name */}
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 leading-tight">{st.name}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        No. Absen: #{st.attendance_number || (idx + 1)}
                                                    </div>
                                                </td>

                                                {/* 3. NISN */}
                                                <td className="py-3 px-3 text-center font-mono text-slate-600">
                                                    {st.nisn || '-'}
                                                </td>

                                                {/* 4. Present (Hadir) */}
                                                <td className="py-3 px-2 text-center bg-emerald-50/20">
                                                    <label className={`inline-flex items-center justify-center cursor-pointer p-1 rounded-lg ${isLocked || isAutoSynced ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`status_${st.id}`}
                                                            value="hadir"
                                                            checked={record.status === 'hadir'}
                                                            disabled={isLocked || isAutoSynced}
                                                            onChange={() => handleAttendanceChange(st.id, 'status', 'hadir')}
                                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                        />
                                                    </label>
                                                </td>

                                                {/* 5. Sick (Sakit) */}
                                                <td className="py-3 px-2 text-center bg-amber-50/20">
                                                    <label className={`inline-flex items-center justify-center cursor-pointer p-1 rounded-lg ${isLocked || isAutoSynced ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`status_${st.id}`}
                                                            value="sakit"
                                                            checked={record.status === 'sakit'}
                                                            disabled={isLocked || isAutoSynced}
                                                            onChange={() => handleAttendanceChange(st.id, 'status', 'sakit')}
                                                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                        />
                                                    </label>
                                                </td>

                                                {/* 6. Permission / Dispensation (Izin / Dispensasi) */}
                                                <td className="py-3 px-2 text-center bg-sky-50/20">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <label title="Izin Biasa" className={`inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${isLocked || isAutoSynced ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                            <input
                                                                type="radio"
                                                                name={`status_${st.id}`}
                                                                value="izin"
                                                                checked={record.status === 'izin'}
                                                                disabled={isLocked || isAutoSynced}
                                                                onChange={() => handleAttendanceChange(st.id, 'status', 'izin')}
                                                                className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                                            />
                                                            <span className="text-sky-700">Izin</span>
                                                        </label>
                                                        <span className="text-slate-300">/</span>
                                                        <label title="Dispensasi Resmi" className={`inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${isLocked || isAutoSynced ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                            <input
                                                                type="radio"
                                                                name={`status_${st.id}`}
                                                                value="dispensasi"
                                                                checked={record.status === 'dispensasi'}
                                                                disabled={isLocked || isAutoSynced}
                                                                onChange={() => handleAttendanceChange(st.id, 'status', 'dispensasi')}
                                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                            <span className="text-indigo-700">Disp.</span>
                                                        </label>
                                                    </div>
                                                </td>

                                                {/* 7. Absent (Alpa) */}
                                                <td className="py-3 px-2 text-center bg-rose-50/20">
                                                    <label className={`inline-flex items-center justify-center cursor-pointer p-1 rounded-lg ${isLocked || isAutoSynced ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`status_${st.id}`}
                                                            value="alpha"
                                                            checked={record.status === 'alpha'}
                                                            disabled={isLocked || isAutoSynced}
                                                            onChange={() => handleAttendanceChange(st.id, 'status', 'alpha')}
                                                            className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                                        />
                                                    </label>
                                                </td>

                                                {/* 8. Catatan Keterangan */}
                                                <td className="py-3 px-3">
                                                    <input
                                                        type="text"
                                                        value={record.notes}
                                                        disabled={isLocked || isAutoSynced}
                                                        onChange={(e) => handleAttendanceChange(st.id, 'notes', e.target.value)}
                                                        placeholder={isAutoSynced ? 'Izin disetujui Guru' : 'Keterangan opsional...'}
                                                        className="w-full text-xs p-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
                                                    />
                                                </td>

                                                {/* 9. Validasi Status */}
                                                <td className="py-3 px-3 text-center">
                                                    {isAutoSynced ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                                            Auto-Sync
                                                        </span>
                                                    ) : isLocked ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                                                            <Lock className="w-3 h-3" />
                                                            Terkunci
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
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
                                    Pencatat Resmi: <strong>{student?.name}</strong> (Ketua Kelas {classroom?.name})
                                </div>
                                <div className="font-mono text-[11px] text-slate-400">
                                    Waktu Input: {clock.dayName}, {clock.dateFormatted} • {clock.timeString}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLocked}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors duration-200 ease-bouncy shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors duration-200 ease-bouncy">
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

                        <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
                            {/* 1. Custom Dropzone / Upload Box at the VERY TOP (MARKI App Specs) */}
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                                    <span>Unggah Bukti Foto / Surat Dokter</span>
                                    <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Aplikasi MARKI</span>
                                </label>

                                {!leavePhotoPreview ? (
                                    <div
                                        onClick={() => leaveFileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer?.files?.[0];
                                            if (file) {
                                                setLeaveData('proof_image', file);
                                                setLeavePhotoPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-4 bg-sky-50/40 hover:bg-sky-50/70 transition-all duration-200 ease-bouncy cursor-pointer flex flex-col items-center justify-center text-center group"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-sky-100 group-hover:bg-sky-200 text-sky-600 flex items-center justify-center mb-2 transition-colors duration-200 ease-bouncy">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <p className="font-bold text-slate-800 text-xs">
                                            Klik atau Tarik Foto Bukti ke Sini
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            JPG, PNG, atau WEBP (Maksimal 5MB)
                                        </p>

                                        {/* Embedded MARKI Guideline */}
                                        <div className="mt-3 w-full p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-[11px] text-amber-900 leading-snug flex items-start gap-2 text-left">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-amber-950 font-bold">SYARAT MARKI:</strong> Foto surat atau kondisi sakit <strong>WAJIB diambil melalui aplikasi MARKI</strong> dengan watermark tanggal, jam real-time, dan koordinat lokasi.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl border border-sky-200 bg-sky-50/50 p-3 flex items-center gap-3">
                                        <img
                                            src={leavePhotoPreview}
                                            alt="Bukti MARKI"
                                            className="w-14 h-14 rounded-xl object-cover border border-sky-300 shrink-0 shadow-2xs"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs truncate">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span className="truncate">{leaveData.proof_image?.name || 'Foto Bukti MARKI'}</span>
                                            </div>
                                            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                                ✓ Terverifikasi format MARKI
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {leaveData.proof_image?.size ? (leaveData.proof_image.size / 1024).toFixed(1) + ' KB' : ''}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveLeaveFile}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200 ease-bouncy"
                                            title="Hapus atau Ganti Foto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={leaveFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLeaveFileChange}
                                    className="hidden"
                                />
                            </div>

                            {/* 2. Jenis Perizinan (Symmetrical segmented pills) */}
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1.5">Jenis Perizinan</label>
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
                                            className={`py-2 rounded-xl border text-center font-semibold transition-all duration-200 ease-bouncy ${
                                                leaveData.type === opt.val
                                                    ? 'bg-sky-600 text-white border-transparent shadow-xs'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.97] will-change-transform'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Tanggal Mulai & Tanggal Selesai (2 Symmetrical Columns) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={leaveData.start_date}
                                        onChange={(e) => setLeaveData('start_date', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        value={leaveData.end_date}
                                        onChange={(e) => setLeaveData('end_date', e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 4. Wali Kelas / Guru Penguji */}
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Wali Kelas / Guru Penilai</label>
                                <select
                                    value={leaveData.homeroom_teacher_id}
                                    onChange={(e) => setLeaveData('homeroom_teacher_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-1 focus:ring-sky-500"
                                    required
                                >
                                    {allTeachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} {t.title ? `(${t.title})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 5. Alasan / Keterangan Sakit/Izin */}
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Alasan & Keterangan Dokter</label>
                                <textarea
                                    value={leaveData.notes}
                                    onChange={(e) => setLeaveData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Mengalami demam dan radang, disarankan istirahat oleh dokter klinik..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={leaveProcessing}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors duration-200 ease-bouncy disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
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
                                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all duration-200 ease-bouncy flex flex-col justify-between"
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
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy shrink-0"
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">
                                            Verifikasi Piket & Kebersihan Akhir KBM
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Checklist siswa piket per hari aktif, unggah dokumentasi foto/video MARKI, dan kirim ke Wali Kelas & Admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span>Auto-Reset 00:00 WIB</span>
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleDutySubmit} className="mt-5 space-y-5 text-xs">
                                {/* 1. Active Day Selector Tabs (Senin s/d Jumat) */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                            Pilih Hari Piket Aktif
                                        </label>
                                        <span className="text-slate-400 text-[11px]">
                                            Hari ini: <strong className="text-slate-700 font-semibold">{clock.dayName}</strong>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((day) => {
                                            const isToday = clock.dayName === day;
                                            const isSelected = activeDutyDay === day;
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => setActiveDutyDay(day)}
                                                    className={`py-2 px-3 rounded-xl border font-semibold text-xs transition-all duration-200 ease-bouncy flex items-center justify-center gap-1.5 ${
                                                        isSelected
                                                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.97] will-change-transform'
                                                    }`}
                                                >
                                                    <span>{day}</span>
                                                    {isToday && (
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. Duty Checklist corresponding to active day */}
                                <div>
                                    {(() => {
                                        const dutyDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
                                        const dayIdx = Math.max(0, dutyDays.indexOf(activeDutyDay));
                                        const scheduledRoster = classStudents.filter((_, idx) => idx % 5 === dayIdx);
                                        const displayedRoster = showAllDutyStudents ? classStudents : scheduledRoster;

                                        return (
                                            <div>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                    <div>
                                                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                                            Petugas Piket Hari {activeDutyDay} ({displayedRoster.length} Siswa)
                                                        </span>
                                                        <p className="text-[11px] text-slate-400">
                                                            Centang nama siswa yang hadir dan melaksanakan tugas kebersihan hari ini.
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectAllDutyDayStudents(displayedRoster)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors duration-200 ease-bouncy"
                                                        >
                                                            Pilih Semua ({activeDutyDay})
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleClearAllDutyStudents}
                                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[11px] transition-colors duration-200 ease-bouncy"
                                                        >
                                                            Bersihkan
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAllDutyStudents(!showAllDutyStudents)}
                                                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200 transition-colors duration-200 ease-bouncy"
                                                        >
                                                            {showAllDutyStudents ? 'Roster Hari Saja' : 'Semua Siswa'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 max-h-56 overflow-y-auto">
                                                    {displayedRoster.map((st, idx) => {
                                                        const isChecked = dutyData.duty_students.includes(st.name);
                                                        return (
                                                            <label
                                                                key={st.id}
                                                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all duration-200 ease-bouncy ${
                                                                    isChecked
                                                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-2xs'
                                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleDutyStudentToggle(st.name)}
                                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                                />
                                                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    #{st.attendance_number || (idx + 1)}
                                                                </span>
                                                                <span className="truncate flex-1">{st.name}</span>
                                                                {isChecked && (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                )}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* 3. Custom Dropzone / Upload Box for Photos & Videos (MARKI App Specs) */}
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                                        <span>Unggah Dokumentasi Kebersihan (Foto & Video)</span>
                                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Aplikasi MARKI</span>
                                    </label>

                                    <div
                                        onClick={() => dutyFileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer?.files?.length) {
                                                handleDutyMediaChange(e.dataTransfer.files);
                                            }
                                        }}
                                        className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-5 bg-amber-50/40 hover:bg-amber-50/70 transition-all duration-200 ease-bouncy cursor-pointer flex flex-col items-center justify-center text-center group"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors duration-200 ease-bouncy">
                                                <Camera className="w-5 h-5" />
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-colors duration-200 ease-bouncy">
                                                <Video className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <p className="font-bold text-slate-800 text-xs">
                                            Klik atau Tarik File Foto / Video ke Sini
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Mendukung Foto (JPG, PNG, WEBP) & Video Dokumentasi (MP4, MOV maks 20MB)
                                        </p>

                                        {/* Embedded MARKI Guideline */}
                                        <div className="mt-3 w-full p-2.5 rounded-xl bg-white border border-amber-200/90 text-[11px] text-amber-900 leading-snug flex items-start gap-2 text-left">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-amber-950 font-bold">STANDAR DOKUMENTASI MARKI:</strong> Seluruh foto atau video kebersihan akhir KBM <strong>WAJIB diambil via aplikasi MARKI</strong> dengan watermark jam, tanggal, dan koordinat GPS ruang kelas.
                                            </div>
                                        </div>
                                    </div>

                                    <input
                                        ref={dutyFileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={(e) => handleDutyMediaChange(e.target.files)}
                                        className="hidden"
                                    />

                                    {/* Uploaded Media Gallery Previews */}
                                    {dutyMediaPreviews.length > 0 && (
                                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {dutyMediaPreviews.map((media, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative rounded-xl border border-slate-200 bg-white overflow-hidden p-2 group shadow-2xs"
                                                >
                                                    {media.type === 'video' ? (
                                                        <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white">
                                                            <Video className="w-6 h-6 text-amber-400 mb-1" />
                                                            <span className="text-[9px] uppercase font-bold tracking-wider text-amber-300">Video MARKI</span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={media.url}
                                                            alt={media.name}
                                                            className="aspect-video w-full object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                                                        <span className="truncate max-w-[100px] text-slate-700 font-medium">
                                                            {media.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDutyMedia(idx)}
                                                            className="text-rose-500 hover:text-rose-700 p-0.5"
                                                            title="Hapus media"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 4. Area & Cleanliness Notes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">
                                            Lokasi Ruangan / Area Piket
                                        </label>
                                        <input
                                            type="text"
                                            value={dutyData.area_location}
                                            onChange={(e) => setDutyData('area_location', e.target.value)}
                                            placeholder="Contoh: Ruang Kelas XI PPLG 1 & Selasar Depan"
                                            className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-slate-700 block mb-1">
                                            Status Pembersihan Fasilitas
                                        </label>
                                        <div className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2 text-xs">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Papan tulis, TPS, jendela, proyektor, dan AC dimatikan</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">
                                        Catatan Kebersihan & Keterangan Fasilitas Kelas
                                    </label>
                                    <textarea
                                        value={dutyData.notes}
                                        onChange={(e) => setDutyData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Contoh: Papan tulis telah bersih, sampah dibuang ke TPS belakang, jendela & pintu telah dikunci rapat, AC & proyektor telah dimatikan."
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
                                        required
                                    />
                                </div>

                                {/* 5. Scheduled Cron Notice & Submit */}
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>Status checklist harian otomatis di-reset oleh sistem setiap pukul <strong>00:00 WIB (Tengah Malam)</strong>.</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={dutyProcessing}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors duration-200 ease-bouncy shadow-xs flex items-center gap-1.5 disabled:opacity-50"
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
                                                            className="w-full h-full object-cover group-hover:scale-105 active:scale-95 transition-transform duration-200 ease-bouncy"
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
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ease-bouncy ${
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
                                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all duration-200 ease-bouncy flex flex-col justify-between"
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
                                    className={`p-4 rounded-xl border transition-all duration-200 ease-bouncy flex items-start gap-4 text-xs ${
                                        isCurrent
                                            ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                            : isCompleted
                                            ? 'bg-slate-50/40 border-slate-200/60 opacity-80'
                                            : slot
                                            ? 'bg-white border-slate-200 hover:border-indigo-300 hover:-translate-y-1 active:scale-[0.97] hover:shadow-lg'
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
                                                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors duration-200 ease-bouncy shadow-xs"
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
                                className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all duration-200 ease-bouncy bg-white flex flex-col justify-between"
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
                                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-xs transition-all duration-200 ease-bouncy bg-white flex flex-col justify-between"
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
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy"
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

            {/* MODAL: BUKTI FOTO & VIDEO ZOOM */}
            {selectedProofModal && (
                <Modal isOpen={Boolean(selectedProofModal)} onClose={() => setSelectedProofModal(null)} title="Pratinjau Bukti Dokumentasi (Foto / Video)">
                    <div className="p-2 space-y-3">
                        {typeof selectedProofModal === 'string' && (selectedProofModal.match(/\.(mp4|mov|webm|avi)(\?.*)?$/i) || selectedProofModal.includes('video')) ? (
                            <video
                                src={selectedProofModal}
                                controls
                                autoPlay
                                className="max-h-[70vh] w-full rounded-xl border border-slate-200 bg-black shadow-sm"
                            />
                        ) : (
                            <img
                                src={selectedProofModal}
                                alt="Bukti Foto"
                                className="max-h-[70vh] w-auto mx-auto rounded-xl border border-slate-200 shadow-sm"
                            />
                        )}
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
            {/* TAB: PENGATURAN PROFIL & SANDI AKUN SISWA */}
            {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                    Pengaturan Profil & Keamanan Akun Siswa
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Perbarui informasi kontak pribadi dan kelola kata sandi akun portal Anda secara berkala.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Informasi Profil Siswa */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                Data Profil Siswa
                            </h3>
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {isClassLeader ? 'Ketua Kelas Aktif' : 'Siswa Reguler'}
                            </span>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="mt-5 space-y-4 text-xs">
                            {/* Avatar Upload Card */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative shrink-0">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                                            {student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'SW'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left min-w-0">
                                    <h4 className="font-semibold text-slate-800 text-xs">Foto Profil / Avatar Pengguna</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Dukung format JPG, PNG, atau WEBP maks 5MB. Foto profil akan muncul di header & sidebar navigasi.
                                    </p>
                                    <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors duration-200 ease-bouncy">
                                            <Camera className="w-3.5 h-3.5" />
                                            <span>Pilih Foto Baru</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {avatarFile && (
                                            <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-[150px]">
                                                ✓ {avatarFile.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                        Nama Lengkap Siswa *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs"
                                    />
                                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                        Alamat Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs"
                                    />
                                    {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                        Nomor Telepon / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="081234567890"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs"
                                    />
                                    {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                        Nomor Induk Siswa Nasional (NISN)
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={student?.nisn || '-'}
                                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs cursor-not-allowed"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-0.5 block">NISN sinkron otomatis dengan Dapodik pusat</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rombongan Belajar (Kelas)</span>
                                    <span className="font-semibold text-slate-800 text-xs">{classroom?.name || 'XI PPLG 1'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kompetensi Keahlian (Jurusan)</span>
                                    <span className="font-semibold text-slate-800 text-xs">{classroom?.department?.name || 'Rekayasa Perangkat Lunak'}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 ease-bouncy disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{profileSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section 2: Ganti Password */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-600" />
                                Ganti Kata Sandi Akun Siswa
                            </h3>
                            <span className="text-[11px] text-slate-400">Minimal 8 karakter</span>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                    Kata Sandi Saat Ini *
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Masukkan kata sandi lama Anda"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    className="w-full md:w-2/3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs"
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
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                        Kata Sandi Baru *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Minimal 8 karakter"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs"
                                    />
                                    {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                                        Konfirmasi Kata Sandi Baru *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Ketik ulang kata sandi baru"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 ease-bouncy disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <KeyRound className="w-4 h-4" />
                                    <span>{passwordSaving ? 'Memproses...' : 'Perbarui Kata Sandi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: FAST-INPUT ADD STUDENT FOR CLASS LEADER */}
            {showAddStudentModal && (
                <Modal
                    isOpen={showAddStudentModal}
                    onClose={() => setShowAddStudentModal(false)}
                    title={`Tambah Siswa Baru ke Kelas ${classroom?.name || ''}`}
                    description="Pendaftaran cepat siswa rombel oleh Ketua Kelas dengan Nomor Absen, Nama Lengkap, dan NISN."
                    maxWidth="max-w-md"
                >
                    <form onSubmit={handleStoreStudent} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                                Nomor Urut Absen *
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={newStudentData.attendance_number}
                                onChange={(e) => setNewStudentData({ ...newStudentData, attendance_number: parseInt(e.target.value) || 1 })}
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                                placeholder="Contoh: 1"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                                Nama Lengkap Siswa *
                            </label>
                            <input
                                type="text"
                                required
                                value={newStudentData.name}
                                onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                                placeholder="Contoh: Muhammad Bintang Pratama"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                                Nomor Induk Siswa Nasional (NISN 10 Digit) *
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={10}
                                value={newStudentData.nisn}
                                onChange={(e) => setNewStudentData({ ...newStudentData, nisn: e.target.value })}
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                                placeholder="Contoh: 0081234567"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                NISN akan digunakan sebagai kata sandi login awal siswa.
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-[11px] leading-relaxed">
                            Akun siswa otomatis terdaftar aktif dengan email format <strong>nama.nisn@edusync.sch.id</strong> pada rombel <strong>{classroom?.name}</strong>.
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowAddStudentModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={savingStudent}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>{savingStudent ? 'Mendaftarkan...' : 'Daftarkan Siswa'}</span>
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        
            <AvatarCropperModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={tempAvatarUrl}
                onCropCompleteCallback={handleCropComplete}
            />
        </StudentLayout>
    );
}
