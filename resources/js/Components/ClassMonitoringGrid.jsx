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
            {/* 1. SECTION HEADER & METRIC STRIP */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Live Temporal Monitor Matrix
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                            {clock.timeString}
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Monitoring serentak status KBM aktif, pengajar, dan alokasi ruang untuk seluruh {classrooms.length} rombel sekolah.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Total Rombel: <strong className="text-slate-900 font-mono">{classrooms.length}</strong></span>
                    </div>
                </div>
            </div>

            {/* 2. FILTER & SEARCH TOOLBAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama kelas atau jurusan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
                        />
                    </div>

                    {/* Grade Level Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                        <button
                            onClick={() => setSelectedGrade('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                selectedGrade === 'all'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                        >
                            Semua Tingkat ({classrooms.length})
                        </button>
                        <button
                            onClick={() => setSelectedGrade('10')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                selectedGrade === '10'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                        >
                            Kelas X
                        </button>
                        <button
                            onClick={() => setSelectedGrade('11')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                selectedGrade === '11'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                        >
                            Kelas XI
                        </button>
                        <button
                            onClick={() => setSelectedGrade('pkl')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                selectedGrade === 'pkl'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                        >
                            Kelas XII (PKL)
                        </button>
                    </div>
                </div>

                {/* Major / Department Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar text-xs">
                    <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">Jurusan:</span>
                    <button
                        onClick={() => setSelectedDept('all')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                            selectedDept === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua
                    </button>
                    {departmentsList.map((d) => (
                        <button
                            key={d.code}
                            onClick={() => setSelectedDept(d.code)}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                selectedDept === d.code
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {d.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. ALL-CLASSES RESPONSIVE GRID (gap-6) */}
            {filteredClassrooms.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    <p className="font-semibold text-slate-600">Tidak ada rombel yang sesuai dengan filter pencarian.</p>
                    <p className="text-[11px] mt-1">Coba sesuaikan kata kunci atau atur ulang opsi filter tingkat/jurusan.</p>
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
