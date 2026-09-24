import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LogOut, ExternalLink, Calendar, CheckCircle2, User, Home, BookOpen } from 'lucide-react';
import Logo from '@/Components/Logo';
import Toast from '@/Components/Toast';

export default function StudentLayout({ children, title = 'Dashboard Siswa', student, classroom }) {
    const { auth } = usePage().props;
    const currentStudent = student || auth?.user || {
        name: 'Ahmad Fauzan Pratama',
        nisn: '0068192341',
        sub_role: 'Ketua Kelas',
    };
    const currentClass = classroom || auth?.user?.classroom || {
        name: 'XI PPLG 1',
        code: 'XI_PPLG_1',
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between">
            <Toast />

            {/* TOP HEADER */}
            <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/siswa/dashboard">
                            <Logo size="default" subtitle="Ruang Belajar Siswa" />
                        </Link>
                        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200">
                                {currentClass.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                                {currentStudent.sub_role || 'Siswa'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-medium text-slate-900">{currentStudent.name}</span>
                            <span className="text-slate-400 font-mono text-[11px]">NISN: {currentStudent.nisn || '0068192341'}</span>
                        </div>
                        <a
                            href="/quick-login/admin"
                            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                            <span>Demo Admin</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <button
                            onClick={handleLogout}
                            title="Keluar"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
                {children}
            </main>

            {/* FOOTER */}
            <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        <span className="font-semibold text-slate-700">EDUSYNC Vocational High School Portal</span> • TA 2024/2025 Genap
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                        <span>Status Dapodik: Terhubung</span>
                        <span>•</span>
                        <span>Server Online (v3.4.2)</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
