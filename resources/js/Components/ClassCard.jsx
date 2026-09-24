import React from 'react';
import {
    Clock,
    User,
    MapPin,
    ArrowRight,
    Briefcase,
    Sparkles,
    CalendarDays,
} from 'lucide-react';
import { useScheduleEvaluator } from '@/hooks/useScheduleEvaluator';

export default function ClassCard({ classroom, onOpenDetail }) {
    // Each active class card evaluates its live schedule using the temporal engine
    const { evaluation, clock } = useScheduleEvaluator(classroom.schedules || []);

    const isPkl = classroom.is_pkl;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-sm">
            <div>
                {/* 1. CARD HEADER */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 tracking-tight">
                            {classroom.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {classroom.department?.code || 'SMK'}
                        </span>
                    </div>

                    {/* Real-Time Live Status Pill */}
                    {isPkl ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>PKL Industri</span>
                        </span>
                    ) : evaluation.state === 'CLASS_ACTIVE' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>Berlangsung</span>
                        </span>
                    ) : evaluation.state === 'BREAK_TIME' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            <span>Istirahat</span>
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Pending / Selesai
                        </span>
                    )}
                </div>

                {/* 2. CARD LIVE CONTENT */}
                {isPkl ? (
                    <div className="space-y-3 py-1">
                        <div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Aktivitas Kejuruan
                            </div>
                            <div className="font-bold text-slate-800 text-sm mt-0.5">
                                Praktik Kerja Lapangan (DUDI)
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">Wali: {classroom.homeroom_teacher?.name || 'Guru Pembimbing'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Mitra Industri / Bengkel DUDI</span>
                            </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                            Siswa sedang rotasi magang industri bersertifikat semester ini.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 py-1">
                        <div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                {evaluation.state === 'CLASS_ACTIVE' ? 'Sesi Sedang Berlangsung' : 'Status Pembelajaran'}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
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
                        <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate font-medium text-slate-800">
                                    {evaluation.activeSlot?.teacher?.name || (evaluation.state === 'BREAK_TIME' ? 'Waktu Relaksasi' : 'Wali: ' + (classroom.homeroom_teacher?.name || '-'))}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                    {evaluation.activeSlot?.room?.name || (evaluation.state === 'BREAK_TIME' ? 'Kantin / Area Terbuka' : 'Ruang Teori')}
                                </span>
                            </div>
                        </div>

                        {/* Live Countdown Timer & Progress Bar */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3 text-indigo-600" />
                                    <span>
                                        {evaluation.state === 'CLASS_ACTIVE'
                                            ? `Sisa waktu: ${evaluation.countdownFormatted}`
                                            : evaluation.state === 'BREAK_TIME'
                                                ? `Selesai dlm: ${evaluation.countdownFormatted}`
                                                : clock.timeShort + ' WIB'}
                                    </span>
                                </span>
                                {evaluation.state === 'CLASS_ACTIVE' && (
                                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                        {evaluation.progressPercent}%
                                    </span>
                                )}
                            </div>

                            {evaluation.state === 'CLASS_ACTIVE' && (
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full transition-all duration-1000"
                                        style={{ width: `${evaluation.progressPercent}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. CARD FOOTER: "Lihat Detail" ACTION (CRITICAL RULE 2.3) */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                    {isPkl ? 'PKL 6 Bulan' : `${(classroom.schedules || []).length} Sesi Terjadwal`}
                </span>

                <button
                    onClick={() => onOpenDetail(classroom)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group cursor-pointer"
                >
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
