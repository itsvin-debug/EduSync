import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    MapPin,
    BookOpen,
    Sparkles,
    Briefcase,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
} from 'lucide-react';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { SCHOOL_PERIODS, parseTimeToMinutes } from '@/hooks/useScheduleEvaluator';

export default function ClassDetailModal({ isOpen, onClose, classroom }) {
    const clock = useRealtimeClock();
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    // Real-Time Day Auto-Selection (CRITICAL RULE 3)
    const initialDay = useMemo(() => {
        if (clock.isWeekend) {
            return 'Senin'; // If weekend, default to Monday
        }
        return days.includes(clock.dayName) ? clock.dayName : 'Senin';
    }, [clock.isWeekend, clock.dayName]);

    const [selectedDay, setSelectedDay] = useState(initialDay);

    // Keep auto-selected day in sync whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedDay(initialDay);
        }
    }, [isOpen, initialDay]);

    if (!isOpen || !classroom) return null;

    const isCurrentRealDay = selectedDay === clock.dayName && !clock.isWeekend;
    const isJumat = selectedDay === 'Jumat';
    const periodDefinitions = isJumat ? SCHOOL_PERIODS.jumat : SCHOOL_PERIODS.regular;

    const currentMinutes = clock.hours * 60 + clock.minutes;

    // Filter schedules for the selected day
    const daySchedules = (classroom.schedules || []).filter(s => s.day === selectedDay);

    // Find active period for real-time highlighting
    let currentActivePeriodNum = null;
    if (isCurrentRealDay && currentMinutes >= parseTimeToMinutes('06:30') && currentMinutes < parseTimeToMinutes('15:00')) {
        for (const item of periodDefinitions) {
            const startM = parseTimeToMinutes(item.start);
            const endM = parseTimeToMinutes(item.end);
            if (currentMinutes >= startM && currentMinutes < endM) {
                currentActivePeriodNum = item.period;
                break;
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. MODAL HEADER */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {classroom.department?.code || 'VOKASI'}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                Tingkat {classroom.grade}
                            </span>
                            {classroom.is_pkl ? (
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    <span>Program PKL Industri</span>
                                </span>
                            ) : (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Kelas Aktif KBM</span>
                                </span>
                            )}
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {classroom.name}
                        </h2>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Wali Kelas: <strong className="text-slate-800">{classroom.homeroom_teacher?.name || 'Belum Ditugaskan'}</strong></span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="font-mono">{clock.timeString}</span>
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. WEEKEND NOTIFICATION BANNER (CRITICAL RULE 3.1) */}
                {clock.isWeekend && (
                    <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-800 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                            <strong>Jadwal Minggu Depan:</strong> Hari ini adalah akhir pekan ({clock.dayName}). Sistem secara otomatis menampilkan preview jadwal pembelajaran hari Senin berikutnya.
                        </span>
                    </div>
                )}

                {/* 3. DAY NAVIGATION TABS (Senin - Jumat) */}
                <div className="px-6 pt-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
                        {days.map((day) => {
                            const isToday = day === clock.dayName && !clock.isWeekend;
                            const isSelected = selectedDay === day;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                                        isSelected
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                                    }`}
                                >
                                    <span>{day}</span>
                                    {isToday && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                            isSelected ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            Hari Ini
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. TIMELINE CONTENT (Jam ke-1 s/d Jam ke-10) */}
                <div className="p-6 overflow-y-auto flex-1 space-y-3">
                    {classroom.is_pkl ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                            <Briefcase className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-900 text-base">Praktik Kerja Lapangan (PKL)</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                                Peserta didik kelas {classroom.name} sedang melaksanakan program magang industri bersertifikat di perusahaan mitra DUDI untuk semester genap ini.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                <span>Status Presensi Industri Terpadu</span>
                            </div>
                        </div>
                    ) : daySchedules.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-600">Tidak ada jadwal pelajaran terjadwal pada hari {selectedDay}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Gunakan Schedule Builder di panel admin untuk menambahkan alokasi sesi.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {periodDefinitions.map((periodDef, idx) => {
                                // If it's a break
                                if (periodDef.isBreak) {
                                    const isBreakActive = isCurrentRealDay && currentActivePeriodNum === 0;
                                    return (
                                        <div
                                            key={`break-${idx}`}
                                            className={`p-3.5 rounded-xl border border-dashed flex items-center justify-between text-xs transition-colors ${
                                                isBreakActive
                                                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-200/50'
                                                    : 'bg-slate-50/80 border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                                    {periodDef.start} - {periodDef.end}
                                                </span>
                                                <span className="font-semibold">{periodDef.label}</span>
                                            </div>
                                            {isBreakActive && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] animate-pulse">
                                                    Sedang Berlangsung
                                                </span>
                                            )}
                                        </div>
                                    );
                                }

                                // Find matching schedule slot for this period number
                                const pNum = periodDef.period;
                                const matchedSchedule = daySchedules.find(s => pNum >= s.period_start && pNum <= s.period_end);
                                const isStartOfBlock = matchedSchedule && matchedSchedule.period_start === pNum;

                                // Active Lesson Highlighting (CRITICAL RULE 3.3)
                                const isPeriodActive = isCurrentRealDay && currentActivePeriodNum === pNum;

                                return (
                                    <div
                                        key={`period-${pNum}`}
                                        className={`p-4 rounded-xl border transition-all ${
                                            isPeriodActive
                                                ? 'bg-indigo-50/60 border-l-4 border-indigo-600 border-indigo-200 shadow-xs ring-1 ring-indigo-300/40'
                                                : matchedSchedule
                                                    ? 'bg-white border-slate-200 hover:border-slate-300'
                                                    : 'bg-slate-50/50 border-slate-200/60'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                                        isPeriodActive
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                                                    }`}>
                                                        Jam ke-{pNum}
                                                    </span>

                                                    <span className="font-mono text-xs text-slate-500 font-medium">
                                                        {periodDef.start} - {periodDef.end}
                                                    </span>

                                                    {matchedSchedule?.subject?.category === 'kejuruan' && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                                                            Kejuruan
                                                        </span>
                                                    )}

                                                    {isPeriodActive && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 animate-pulse">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            <span>Sedang Berlangsung</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {matchedSchedule ? (
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                                            {matchedSchedule.subject?.name}
                                                        </h4>
                                                        <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 flex-wrap">
                                                            <span className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="font-medium text-slate-800">{matchedSchedule.teacher?.name}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{matchedSchedule.room?.name || 'Ruang Teori'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 font-medium italic">
                                                        {pNum === 1 ? periodDef.label : 'Jam Kosong / Belajar Mandiri Terbimbing'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="shrink-0 text-right">
                                                {matchedSchedule && (
                                                    <span className="text-[11px] font-mono text-slate-400 block">
                                                        Alokasi {matchedSchedule.period_end - matchedSchedule.period_start + 1} JP
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 5. MODAL FOOTER */}
                <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Sinkronisasi Kurikulum & Dapodik Vokasi</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors shadow-xs"
                    >
                        Tutup Tampilan
                    </button>
                </div>
            </div>
        </div>
    );
}
