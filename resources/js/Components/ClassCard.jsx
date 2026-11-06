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
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div>
                {/* 1. Card Header */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight truncate">
                            {classroom.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                            {classroom.department?.code || 'SMK'}
                        </span>
                    </div>

                    {/* Status Pill */}
                    {isPkl ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1.5 shrink-0">
                            <Briefcase className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>PKL Industri</span>
                        </span>
                    ) : evaluation.state === 'CLASS_ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
                            <span>Berlangsung</span>
                        </span>
                    ) : evaluation.state === 'BREAK_TIME' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Istirahat</span>
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                            Selesai
                        </span>
                    )}
                </div>

                {/* 2. Card Live Content */}
                {isPkl ? (
                    <div className="space-y-3 py-1">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Status Aktivitas
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                                Praktik Kerja Lapangan (DUDI)
                            </h4>
                        </div>

                        <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate">Wali: {classroom.homeroom_teacher?.name || 'Guru Pembimbing'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate">Mitra Industri / Bengkel DUDI</span>
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Siswa sedang rotasi magang industri bersertifikat semester ini.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 py-1">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                {evaluation.state === 'CLASS_ACTIVE' ? 'Sesi Sedang Berlangsung' : 'Status Pembelajaran'}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 line-clamp-1" title={evaluation.activeSlot ? evaluation.activeSlot.subject?.name : ''}>
                                {evaluation.activeSlot
                                    ? evaluation.activeSlot.subject?.name
                                    : evaluation.state === 'BREAK_TIME'
                                        ? evaluation.label
                                        : evaluation.state === 'CLASS_ACTIVE'
                                            ? 'Jam Kosong / Belajar Mandiri'
                                            : 'Tidak Ada Sesi KBM Aktif'}
                            </h4>
                        </div>

                        {/* Subject, Teacher, Room info */}
                        <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                                    {evaluation.activeSlot?.teacher?.name || (evaluation.state === 'BREAK_TIME' ? 'Waktu Relaksasi' : 'Wali: ' + (classroom.homeroom_teacher?.name || '-'))}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate">
                                    {evaluation.activeSlot?.room?.name || (evaluation.state === 'BREAK_TIME' ? 'Kantin / Area Terbuka' : 'Ruang Teori')}
                                </span>
                            </div>
                        </div>

                        {/* Countdown Timer & Progress Bar */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    <span>
                                        {evaluation.state === 'CLASS_ACTIVE'
                                            ? `Sisa waktu: ${evaluation.countdownFormatted}`
                                            : evaluation.state === 'BREAK_TIME'
                                                ? `Selesai dlm: ${evaluation.countdownFormatted}`
                                                : clock.timeShort}
                                    </span>
                                </span>
                                {evaluation.state === 'CLASS_ACTIVE' && (
                                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                                        {evaluation.progressPercent}%
                                    </span>
                                )}
                            </div>

                            {evaluation.state === 'CLASS_ACTIVE' && (
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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
            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {isPkl ? 'PKL 6 Bulan' : `${(classroom.schedules || []).length} Sesi Terjadwal`}
                </span>

                <button
                    onClick={() => onOpenDetail(classroom)}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold transition-all duration-200 active:scale-95 group/btn cursor-pointer"
                >
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                </button>
            </div>
        </div>
    );
}
