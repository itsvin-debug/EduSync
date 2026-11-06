import React from 'react';
import {
    Clock,
    User,
    MapPin,
    ArrowRight,
    Briefcase,
    CalendarDays,
} from 'lucide-react';
import { useScheduleEvaluator } from '@/hooks/useScheduleEvaluator';

export default function ClassCard({ classroom, onOpenDetail }) {
    // Evaluasi status jadwal kelas secara real-time berdasarkan waktu saat ini
    const { evaluation, clock } = useScheduleEvaluator(classroom.schedules || []);
    const isPkl = classroom.is_pkl;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div>
                {/* 1. Card Header */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-3 pb-2 sm:pb-3 mb-2.5 sm:mb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="font-bold text-xs sm:text-base text-slate-900 dark:text-slate-100 tracking-tight truncate">
                            {classroom.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                            {classroom.department?.code || 'SMK'}
                        </span>
                    </div>

                    {/* Status Pill */}
                    {isPkl ? (
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1 shrink-0">
                            <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 dark:text-amber-400" />
                            <span className="hidden sm:inline">PKL Industri</span>
                            <span className="sm:hidden">PKL</span>
                        </span>
                    ) : evaluation.state === 'CLASS_ACTIVE' ? (
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-xs"></span>
                            <span className="hidden sm:inline">Berlangsung</span>
                            <span className="sm:hidden">KBM</span>
                        </span>
                    ) : evaluation.state === 'BREAK_TIME' ? (
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500"></span>
                            <span>Istirahat</span>
                        </span>
                    ) : (
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                            Selesai
                        </span>
                    )}
                </div>

                {/* 2. Card Live Content */}
                {isPkl ? (
                    <div className="space-y-2 sm:space-y-3 py-0.5">
                        <div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Status Aktivitas
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-0.5 truncate">
                                Praktik Kerja Industri (DUDI)
                            </h4>
                        </div>

                        <div className="flex flex-col gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate">Wali: {classroom.homeroom_teacher?.name || 'Guru Pembimbing'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate">Mitra Industri DUDI</span>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                            Rotasi magang industri bersertifikat semester ini.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3 py-0.5">
                        <div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                {evaluation.state === 'CLASS_ACTIVE' ? 'Sesi Berlangsung' : 'Status KBM'}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-0.5 line-clamp-1" title={evaluation.activeSlot ? evaluation.activeSlot.subject?.name : ''}>
                                {evaluation.activeSlot
                                    ? evaluation.activeSlot.subject?.name
                                    : evaluation.state === 'BREAK_TIME'
                                        ? evaluation.label
                                        : evaluation.state === 'CLASS_ACTIVE'
                                            ? 'Jam Kosong / Mandiri'
                                            : 'Tidak Ada Sesi'}
                            </h4>
                        </div>

                        {/* Subject, Teacher, Room info */}
                        <div className="flex flex-col gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                                    {evaluation.activeSlot?.teacher?.name || (evaluation.state === 'BREAK_TIME' ? 'Waktu Relaksasi' : 'Wali: ' + (classroom.homeroom_teacher?.name || '-'))}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate">
                                    {evaluation.activeSlot?.room?.name || (evaluation.state === 'BREAK_TIME' ? 'Kantin / Terbuka' : 'Ruang Teori')}
                                </span>
                            </div>
                        </div>

                        {/* Countdown Timer & Progress Bar */}
                        <div className="pt-1 sm:pt-2">
                            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono truncate">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span className="truncate">
                                        {evaluation.state === 'CLASS_ACTIVE'
                                            ? `Sisa: ${evaluation.countdownFormatted}`
                                            : evaluation.state === 'BREAK_TIME'
                                                ? `Selesai: ${evaluation.countdownFormatted}`
                                                : clock.timeShort}
                                    </span>
                                </span>
                                {evaluation.state === 'CLASS_ACTIVE' && (
                                    <span className="font-mono text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-semibold shrink-0 ml-1">
                                        {evaluation.progressPercent}%
                                    </span>
                                )}
                            </div>

                            {evaluation.state === 'CLASS_ACTIVE' && (
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 sm:h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${evaluation.progressPercent}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Card Footer */}
            <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                    {isPkl ? 'PKL 6 Bulan' : `${(classroom.schedules || []).length} Sesi Terjadwal`}
                </span>

                <button
                    onClick={() => onOpenDetail(classroom)}
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-95 group/btn cursor-pointer"
                >
                    <span>Detail</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                </button>
            </div>
        </div>
    );
}
