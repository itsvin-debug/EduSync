import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    School,
    Activity,
    Clock,
    Sparkles,
    CheckCircle2,
    CalendarDays,
} from 'lucide-react';
import ClassCard from './ClassCard';
import ClassDetailModal from './ClassDetailModal';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';

export default function ClassMonitoringGrid({ classrooms = [], title = "Matrix Monitoring Kelas" }) {
    const clock = useRealtimeClock();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [selectedDept, setSelectedDept] = useState('all');
    const [activeModalClass, setActiveModalClass] = useState(null);

    // Filter logic
    const filteredClassrooms = useMemo(() => {
        return classrooms.filter((c) => {
            const matchesQuery =
                !searchQuery ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.department?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.department?.code?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesGrade =
                selectedGrade === 'all' ||
                (selectedGrade === 'pkl' ? c.is_pkl : c.grade === parseInt(selectedGrade) && !c.is_pkl);

            const matchesDept =
                selectedDept === 'all' ||
                c.department?.code === selectedDept;

            return matchesQuery && matchesGrade && matchesDept;
        });
    }, [classrooms, searchQuery, selectedGrade, selectedDept]);

    const departmentsList = useMemo(() => {
        const map = new Map();
        classrooms.forEach(c => {
            if (c.department && !map.has(c.department.code)) {
                map.set(c.department.code, c.department);
            }
        });
        return Array.from(map.values());
    }, [classrooms]);

    return (
        <section className="space-y-6">
            {/* 1. Section Header & Metric Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Monitoring Jadwal Kelas
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
                            {clock.timeString}
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Monitoring serentak status KBM aktif, pengajar, dan alokasi ruang untuk seluruh {classrooms.length} rombel sekolah.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Total Rombel: <strong className="text-slate-900 dark:text-white font-mono">{classrooms.length}</strong></span>
                    </div>
                </div>
            </div>

            {/* 2. Filter & Search Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama kelas atau jurusan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 bg-slate-50/70 dark:bg-slate-800/60 transition-all duration-200"
                        />
                    </div>

                    {/* Grade Level Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setSelectedGrade('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                selectedGrade === 'all'
                                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            Semua Tingkat ({classrooms.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedGrade('10')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                selectedGrade === '10'
                                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            Kelas X
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedGrade('11')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                selectedGrade === '11'
                                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            Kelas XI
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedGrade('pkl')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                selectedGrade === 'pkl'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/60'
                            }`}
                        >
                            Kelas XII (PKL)
                        </button>
                    </div>
                </div>

                {/* Major / Department Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 no-scrollbar text-xs">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold mr-1 shrink-0">Jurusan:</span>
                    <button
                        type="button"
                        onClick={() => setSelectedDept('all')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            selectedDept === 'all'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Semua
                    </button>
                    {departmentsList.map((d) => (
                        <button
                            key={d.code}
                            type="button"
                            onClick={() => setSelectedDept(d.code)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                selectedDept === d.code
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {d.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Class Cards Responsive Grid */}
            {filteredClassrooms.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Tidak ada rombel yang sesuai dengan filter pencarian.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci atau atur ulang opsi filter tingkat/jurusan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClassrooms.map((c) => (
                        <ClassCard
                            key={c.id}
                            classroom={c}
                            onOpenDetail={(cls) => setActiveModalClass(cls)}
                        />
                    ))}
                </div>
            )}

            {/* 4. CLASS DETAIL MODAL WITH DAY AUTO-SELECTION */}
            <ClassDetailModal
                isOpen={!!activeModalClass}
                onClose={() => setActiveModalClass(null)}
                classroom={activeModalClass}
            />
        </section>
    );
}
