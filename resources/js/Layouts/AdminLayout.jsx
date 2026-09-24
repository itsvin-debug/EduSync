import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    CalendarDays,
    Database,
    Clock,
    UserCheck,
    ScrollText,
    LogOut,
    ExternalLink,
    ChevronRight,
    HelpCircle,
    User,
    Sparkles,
} from 'lucide-react';
import Logo from '@/Components/Logo';
import Toast from '@/Components/Toast';

export default function AdminLayout({ children, title = 'Control Center' }) {
    const { url } = usePage();
    const { auth, app } = usePage().props;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: url === '/admin/dashboard' },
        { name: 'Schedule Builder', href: '/admin/schedules', icon: CalendarDays, current: url.startsWith('/admin/schedules') },
        { name: 'Master Data', href: '/admin/master-data', icon: Database, current: url.startsWith('/admin/master-data') },
        { name: 'Inval & Substitusi', href: '/admin/inval', icon: UserCheck, current: url.startsWith('/admin/inval') },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex">
            <Toast />

            {/* PERSISTENT DARK SIDEBAR (Width 260px, bg-[#0F172A]) */}
            <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0F172A] text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 select-none">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Header */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
                        <Link href="/admin/dashboard" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                                <span className="material-symbols-outlined text-[20px]">school</span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-base tracking-tight leading-none">EDUSYNC</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        ADMIN
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium mt-0.5">Control Center Vokasi</span>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                        <div>
                            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Menu Kurikulum
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                item.current
                                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${item.current ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div>
                            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Role Switcher (Demo)
                            </div>
                            <div className="space-y-1 text-xs">
                                <a
                                    href="/quick-login/guru"
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>Portal Guru Pengampu</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                                <a
                                    href="/quick-login/wali"
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>Portal Wali Kelas</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                                <a
                                    href="/quick-login/siswa"
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>Portal Siswa (Mobile-First)</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom User Card & Logout */}
                    <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0">
                        <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Online</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400">v3.4.2</span>
                            </div>
                            <div className="text-xs font-semibold text-white truncate">
                                {auth?.user?.name || 'Operator Kurikulum'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                                {auth?.user?.email || 'admin@edusync.sch.id'}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium"
                        >
                            <span className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                <span>Keluar Sistem</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="pl-[260px] flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-indigo-600">EDUSYNC</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span>Kurikulum & Dapodik</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-900">{title}</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tracking-tight border border-slate-200">
                            TA 2024/2025 Genap
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <span>Lihat Portal Publik</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </header>

                <main className="p-6 sm:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
