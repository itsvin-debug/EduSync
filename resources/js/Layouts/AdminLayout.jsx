import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import {
    LayoutDashboard,
    Tv,
    UserCheck,
    Users,
    GraduationCap,
    Briefcase,
    CalendarDays,
    Database,
    Sparkles,
    Trash2,
    Coins,
    Award,
    FileSpreadsheet,
    History,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    CheckCircle2,
    Shield,
    Clock,
    Search,
    BookOpen,
    Building2,
} from 'lucide-react';
import Toast from '@/Components/Toast';

export default function AdminLayout({ children, title = 'Control Center' }) {
    const { url } = usePage();
    const { auth, app } = usePage().props;
    const appName = app?.name || 'EDUSYNC';
    const schoolName = app?.school_name || 'SMKN 1 Ciomas';
    const adminAvatar = app?.admin_avatar;

    const sidebarScrollRef = useRef(null);

    // Maintain sidebar scroll position across Inertia page transitions
    useLayoutEffect(() => {
        const savedScroll = sessionStorage.getItem('edusync_admin_sidebar_scroll');
        if (savedScroll !== null && sidebarScrollRef.current) {
            sidebarScrollRef.current.scrollTop = Number(savedScroll);
        }
    }, [url]);

    const handleSidebarScroll = (e) => {
        sessionStorage.setItem('edusync_admin_sidebar_scroll', String(e.currentTarget.scrollTop));
    };

    // Real-time notification counters for sidebar
    const [counters, setCounters] = useState({
        students: 0,
        teachers: 0,
        inval: 0,
        teacher_presence: 0,
        duty_leaves: 0,
        picket: 0,
        trash_reports: 0,
        class_fines: 0,
    });

    useEffect(() => {
        let isMounted = true;
        const fetchCounters = async () => {
            try {
                const res = await axios.get('/admin/sidebar-counters');
                if (isMounted && res.data) {
                    setCounters(res.data);
                }
            } catch {
                // Ignore transient network errors
            }
        };

        fetchCounters();
        const interval = setInterval(fetchCounters, 5000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Persistent sidebar collapse state in localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('edusync_admin_sidebar_collapsed');
            return saved === 'true';
        }
        return false;
    });

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('edusync_admin_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Enterprise Admin Navigation Structure (6 Categories)
    const navCategories = [
        {
            category: 'Dashboard',
            items: [
                {
                    name: 'Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutDashboard,
                    active: url === '/admin/dashboard',
                },
                {
                    name: 'Monitoring KBM Sekolah',
                    href: '/admin/kbm-monitor',
                    icon: Tv,
                    active: url.startsWith('/admin/kbm-monitor'),
                },
            ],
        },
        {
            category: 'Data Akun',
            items: [
                {
                    name: 'Data Siswa',
                    href: '/admin/students',
                    icon: GraduationCap,
                    active: url.startsWith('/admin/students'),
                    badge: counters.students > 0 ? counters.students : null,
                },
                {
                    name: 'Data Guru & NIP',
                    href: '/admin/teachers',
                    icon: Users,
                    active: url.startsWith('/admin/teachers'),
                    badge: counters.teachers > 0 ? counters.teachers : null,
                },
            ],
        },
        {
            category: 'Akademik & Jadwal',
            items: [
                {
                    name: 'Jurusan & Kaprog',
                    href: '/admin/departments',
                    icon: BookOpen,
                    active: url.startsWith('/admin/departments'),
                },
                {
                    name: 'Relokasi Ruang Kelas',
                    href: '/admin/classrooms-relocation',
                    icon: Building2,
                    active: url.startsWith('/admin/classrooms-relocation'),
                },
                {
                    name: 'Matriks Jadwal Pelajaran',
                    href: '/admin/schedules',
                    icon: CalendarDays,
                    active: url.startsWith('/admin/schedules'),
                },
                {
                    name: 'Inval & Substitusi',
                    href: '/admin/inval',
                    icon: Clock,
                    active: url.startsWith('/admin/inval'),
                    badge: counters.inval > 0 ? counters.inval : null,
                },
                {
                    name: 'Master Data Dapodik',
                    href: '/admin/master-data',
                    icon: Database,
                    active: url.startsWith('/admin/master-data'),
                },
            ],
        },
        {
            category: 'Kehadiran & Piket',
            items: [
                {
                    name: 'Pantau Guru & Tugas',
                    href: '/admin/teacher-presence',
                    icon: UserCheck,
                    active: url.startsWith('/admin/teacher-presence'),
                    badge: counters.teacher_presence > 0 ? counters.teacher_presence : null,
                },
                {
                    name: 'Izin Keluar Dinas',
                    href: '/admin/duty-leaves',
                    icon: Briefcase,
                    active: url.startsWith('/admin/duty-leaves'),
                    badge: counters.duty_leaves > 0 ? counters.duty_leaves : null,
                },
                {
                    name: 'Pantau Piket Kelas',
                    href: '/admin/picket',
                    icon: Sparkles,
                    active: url.startsWith('/admin/picket'),
                    badge: counters.picket > 0 ? counters.picket : null,
                },
                {
                    name: 'Laporan Sampah Guru',
                    href: '/admin/trash-reports',
                    icon: Trash2,
                    active: url.startsWith('/admin/trash-reports'),
                    badge: counters.trash_reports > 0 ? counters.trash_reports : null,
                },
                {
                    name: 'Denda Kebersihan Kelas',
                    href: '/admin/class-fines',
                    icon: Coins,
                    active: url.startsWith('/admin/class-fines'),
                    badge: counters.class_fines > 0 ? counters.class_fines : null,
                },
            ],
        },
        {
            category: 'Organisasi & Ekskul',
            items: [
                {
                    name: 'Ekskul & Organisasi',
                    href: '/admin/organizations',
                    icon: Award,
                    active: url.startsWith('/admin/organizations'),
                },
            ],
        },
        {
            category: 'Pengaturan Akun & Audit',
            items: [
                {
                    name: 'Pengaturan Akun & 2FA',
                    href: '/admin/settings',
                    icon: Shield,
                    active: url.startsWith('/admin/settings'),
                },
                {
                    name: 'Histori Aktivitas Admin',
                    href: '/admin/audit-logs',
                    icon: History,
                    active: url.startsWith('/admin/audit-logs'),
                },
                {
                    name: 'Rekap & Export Laporan',
                    href: '/admin/recap-export',
                    icon: FileSpreadsheet,
                    active: url.startsWith('/admin/recap-export'),
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex">
            <Toast />

            {/* COLLAPSIBLE SIDEBAR */}
            <aside
                className={`fixed left-0 top-0 bottom-0 bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none transition-all duration-200 ease-in-out ${
                    isCollapsed ? 'w-[76px]' : 'w-[264px]'
                }`}
            >
                {/* Central Floating Sidebar Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-1/2 -translate-y-1/2 -right-3.5 z-50 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-2 border-[#0F172A] shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                    aria-label="Toggle Sidebar"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>

                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Header */}
                    <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
                        <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 shrink-0 overflow-hidden">
                                {adminAvatar ? (
                                    <img src={adminAvatar} alt="Admin Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-base">{appName.charAt(0)}</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-white text-base tracking-tight truncate leading-none">{appName}</span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            ADMIN
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{schoolName}</span>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Nav Categories & Items with Scroll Position Retention */}
                    <div
                        ref={sidebarScrollRef}
                        onScroll={handleSidebarScroll}
                        className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar"
                    >
                        {navCategories.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-1">
                                {!isCollapsed && (
                                    <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                        {group.category}
                                    </div>
                                )}
                                <nav className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                preserveScroll={true}
                                                title={isCollapsed ? `${item.name}${item.badge ? ` (${item.badge} butuh verifikasi)` : ''}` : undefined}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ease-bouncy group ${
                                                    item.active
                                                        ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                                }`}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <Icon
                                                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-bouncy ${
                                                            item.active ? 'text-white' : 'text-slate-400 group-hover:scale-105 active:scale-95'
                                                        }`}
                                                    />
                                                    {isCollapsed && item.badge && (
                                                        <span className="absolute -top-2 -right-2.5 min-w-[17px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#0F172A] shadow-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                {!isCollapsed && (
                                                    <span className="truncate flex-1">{item.name}</span>
                                                )}
                                                {!isCollapsed && item.badge && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Bottom User Card & "Keluar Akun" Logout Button */}
                    <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0">
                        {!isCollapsed && (
                            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Online</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-400">Kurikulum</span>
                                </div>
                                <div className="text-xs font-semibold text-white truncate">
                                    {auth?.user?.name || 'Operator Kurikulum'}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                    {auth?.user?.email || 'admin@edusync.sch.id'}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className={`flex items-center w-full px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 ease-bouncy text-xs font-medium cursor-pointer ${
                                isCollapsed ? 'justify-center' : 'justify-between'
                            }`}
                            title="Keluar Akun"
                        >
                            <span className="flex items-center gap-2">
                                <LogOut className="w-4 h-4 shrink-0" />
                                {!isCollapsed && <span>Keluar Akun</span>}
                            </span>
                            {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
                    isCollapsed ? 'pl-[76px]' : 'pl-[264px]'
                }`}
            >
                {/* Header */}
                <header className="sticky top-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.97] will-change-transform transition-colors duration-200 ease-bouncy cursor-pointer"
                            title="Buka / Tutup Sidebar"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-bold text-indigo-600">{appName}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="hidden sm:inline">Kurikulum & Manajemen</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                            <span className="font-semibold text-slate-900">{title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold tracking-tight border border-slate-200">
                            TA 2024/2025 Genap
                        </span>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-bouncy shadow-2xs"
                        >
                            <span>Portal Publik</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                    </div>
                </header>

                <main className="p-6 sm:p-8 flex-1">
                    <div key={usePage().url.split('?')[0]} className="animate-fade-in-up will-change-transform">{children}</div>
                </main>
            </div>
        </div>
    );
}
