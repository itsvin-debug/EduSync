import React, { useState, useMemo } from 'react';
import { X, Search, Calendar, Sparkles, Utensils, HeartHandshake, CheckCircle2, MapPin, Clock } from 'lucide-react';

export default function CocurricularModal({ isOpen, onClose, allSchedules = [], currentDate = '' }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, pentas, makan, taqwa

    // Group schedules by week_range
    const weeks = useMemo(() => {
        const map = new Map();
        allSchedules.forEach((item) => {
            const key = item.week_range;
            if (!map.has(key)) {
                map.set(key, {
                    week_range: key,
                    selasa: null,
                    rabu: null,
                    kamis: null,
                    jumat: null,
                    isCurrentWeek: false,
                });
            }
            const weekObj = map.get(key);

            // Normalize day string
            const day = (item.day_name || '').toLowerCase();
            if (day.includes('selasa')) weekObj.selasa = item;
            else if (day.includes('rabu')) weekObj.rabu = item;
            else if (day.includes('kamis')) weekObj.kamis = item;
            else if (day.includes('jumat')) weekObj.jumat = item;

            if (item.date === currentDate) {
                weekObj.isCurrentWeek = true;
            }
        });
        return Array.from(map.values());
    }, [allSchedules, currentDate]);

    // Filtered weeks based on search query
    const filteredWeeks = useMemo(() => {
        if (!searchQuery.trim()) return weeks;
        const q = searchQuery.toLowerCase().trim();

        return weeks.filter((w) => {
            const matchesWeek = w.week_range.toLowerCase().includes(q);
            const matchesSelasa = w.selasa && (w.selasa.class_name.toLowerCase().includes(q) || w.selasa.activity_name.toLowerCase().includes(q));
            const matchesRabu = w.rabu && (w.rabu.class_name.toLowerCase().includes(q) || w.rabu.activity_name.toLowerCase().includes(q));
            const matchesKamis = w.kamis && (w.kamis.class_name.toLowerCase().includes(q) || w.kamis.activity_name.toLowerCase().includes(q));
            const matchesJumat = w.jumat && (w.jumat.class_name.toLowerCase().includes(q) || w.jumat.activity_name.toLowerCase().includes(q));
            return matchesWeek || matchesSelasa || matchesRabu || matchesKamis || matchesJumat;
        });
    }, [weeks, searchQuery]);

    if (!isOpen) return null;

    const getActivityBadge = (activity) => {
        if (!activity) return null;
        if (activity.includes('Makan')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    <Utensils className="w-2.5 h-2.5" />
                    Makan Bersama
                </span>
            );
        }
        if (activity.includes('Taqwa')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <HeartHandshake className="w-2.5 h-2.5" />
                    Jumat Taqwa
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-2.5 h-2.5" />
                Pentas Kreasi
            </span>
        );
    };

    const renderCell = (item) => {
        if (!item) {
            return (
                <div className="p-3 text-center text-xs text-slate-300 italic">
                    -
                </div>
            );
        }

        const isToday = item.date === currentDate;

        return (
            <div className={`p-3 rounded-xl border transition-all duration-200 ease-bouncy ${
                isToday 
                    ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-400/50' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
            }`}>
                <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900">
                        {item.class_name}
                    </span>
                    {isToday && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white animate-pulse">
                            Hari Ini
                        </span>
                    )}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mb-1 font-mono">
                    {item.day_name}, {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
                <div>
                    {getActivityBadge(item.activity_name)}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                Kalender Resmi 2026
                            </span>
                            <span className="text-xs text-slate-500">
                                42 Sesi Terjadwal • Semester Ganjil
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">
                            Jadwal Kokurikuler 2.0 SMKN 1 Ciomas
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Matriks rotasi petugas harian Pentas Kreasi, Makan Bersama, dan Jumat Taqwa.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors duration-200 ease-bouncy"
                        title="Tutup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari kelas (contoh: X PPLG 2, OSIS, XI BCF)..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 ease-bouncy placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="hidden sm:inline">Keterangan:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Pentas Kreasi (Selasa & Kamis)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                Makan Bersama (Rabu)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Jumat Taqwa (Jumat)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                                    <th className="py-3 px-4 w-40">Bulan / Periode</th>
                                    <th className="py-3 px-4">
                                        <div className="text-indigo-700 font-bold">Pentas Kreasi</div>
                                        <div className="text-[10px] text-slate-500 font-normal">Selasa (06:45 - 07:45)</div>
                                    </th>
                                    <th className="py-3 px-4">
                                        <div className="text-teal-700 font-bold">Makan Bersama</div>
                                        <div className="text-[10px] text-slate-500 font-normal">Rabu (06:45 - 07:45)</div>
                                    </th>
                                    <th className="py-3 px-4">
                                        <div className="text-indigo-700 font-bold">Pentas Kreasi</div>
                                        <div className="text-[10px] text-slate-500 font-normal">Kamis (06:45 - 07:45)</div>
                                    </th>
                                    <th className="py-3 px-4">
                                        <div className="text-emerald-700 font-bold">Jumat Taqwa</div>
                                        <div className="text-[10px] text-slate-500 font-normal">Jumat (06:45 - 07:45)</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredWeeks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            Tidak ditemukan jadwal untuk pencarian "{searchQuery}".
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWeeks.map((week, idx) => (
                                        <tr
                                            key={week.week_range || idx}
                                            className={`transition-colors duration-200 ease-bouncy ${
                                                week.isCurrentWeek 
                                                    ? 'bg-indigo-50/30 font-medium' 
                                                    : 'hover:bg-slate-50/60'
                                            }`}
                                        >
                                            <td className="py-3.5 px-4 align-top">
                                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                    <span>{week.week_range}</span>
                                                </div>
                                                {week.isCurrentWeek && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                        Minggu Ini
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 align-top min-w-[170px]">
                                                {renderCell(week.selasa)}
                                            </td>
                                            <td className="py-2.5 px-3 align-top min-w-[170px]">
                                                {renderCell(week.rabu)}
                                            </td>
                                            <td className="py-2.5 px-3 align-top min-w-[170px]">
                                                {renderCell(week.kamis)}
                                            </td>
                                            <td className="py-2.5 px-3 align-top min-w-[170px]">
                                                {renderCell(week.jumat)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lokasi: Lapangan Utama & Selasar Kelas SMKN 1 Ciomas</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors duration-200 ease-bouncy shadow-xs"
                    >
                        Tutup Jadwal
                    </button>
                </div>
            </div>
        </div>
    );
}
