import React, { useMemo } from 'react';
import { Sparkles, Utensils, HeartHandshake, Calendar, Clock, MapPin, ArrowRight, Users, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function CocurricularCard({
    cocurricular = {},
    clock = {},
    onOpenModal = () => {},
}) {
    // Current date from clock or system
    const currentDate = useMemo(() => {
        if (cocurricular.current_date) return cocurricular.current_date;
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [cocurricular.current_date]);

    // Tomorrow's date
    const tomorrowDate = useMemo(() => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [currentDate]);

    // All schedules
    const allSchedules = cocurricular.all || [];

    // Today's schedule
    const todaySchedule = useMemo(() => {
        if (cocurricular.today) return cocurricular.today;
        return allSchedules.find((s) => s.date === currentDate) || null;
    }, [cocurricular.today, allSchedules, currentDate]);

    // Tomorrow's schedule
    const tomorrowSchedule = useMemo(() => {
        if (cocurricular.tomorrow) return cocurricular.tomorrow;
        return allSchedules.find((s) => s.date === tomorrowDate) || null;
    }, [cocurricular.tomorrow, allSchedules, tomorrowDate]);

    // Next upcoming schedule if today has none
    const nextUpcomingSchedule = useMemo(() => {
        if (cocurricular.next_upcoming) return cocurricular.next_upcoming;
        return allSchedules.find((s) => s.date > currentDate) || allSchedules[0] || null;
    }, [cocurricular.next_upcoming, allSchedules, currentDate]);

    // Upcoming schedules for list (next 3-4 sessions)
    const upcomingList = useMemo(() => {
        const afterToday = allSchedules.filter((s) => s.date > currentDate);
        if (afterToday.length > 0) {
            return afterToday.slice(0, 3);
        }
        return (cocurricular.upcoming || []).slice(0, 3);
    }, [allSchedules, currentDate, cocurricular.upcoming]);

    // Activity theme helper
    const getActivityTheme = (activity = '') => {
        if (activity.includes('Makan')) {
            return {
                bg: 'bg-teal-50',
                text: 'text-teal-700',
                border: 'border-teal-200',
                badgeBg: 'bg-teal-600',
                icon: Utensils,
                accent: 'teal',
            };
        }
        if (activity.includes('Taqwa')) {
            return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                badgeBg: 'bg-emerald-600',
                icon: HeartHandshake,
                accent: 'emerald',
            };
        }
        return {
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-indigo-200',
            badgeBg: 'bg-indigo-600',
            icon: Sparkles,
            accent: 'indigo',
        };
    };

    // Format Indonesian Date
    const formatIndoDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch (e) {
            return dateStr;
        }
    };

    const formatRelativeLabel = (dateStr) => {
        if (dateStr === currentDate) return 'Hari Ini';
        if (dateStr === tomorrowDate) return 'Besok';
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr;
        }
    };

    // Active spotlight item: today's schedule if exists, else next upcoming
    const spotlightItem = todaySchedule || nextUpcomingSchedule;
    const isSpotlightToday = Boolean(todaySchedule);
    const spotlightTheme = getActivityTheme(spotlightItem?.activity_name);
    const SpotlightIcon = spotlightTheme.icon;

    return (
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                Jadwal Kokurikuler 2.0
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                                SMKN 1 Ciomas
                            </span>
                        </div>
                        <h2 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">
                            Pentas Kreasi • Makan Bersama • Jumat Taqwa
                        </h2>
                    </div>

                    {isSpotlightToday ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Hari Ini Aktif</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shrink-0">
                            <span>Sesi Mendatang</span>
                        </div>
                    )}
                </div>

                {/* Main Hero Spotlight (Petugas Hari Ini or Sesi Terdekat) */}
                {spotlightItem && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${spotlightTheme.bg} ${spotlightTheme.text} border ${spotlightTheme.border}`}>
                                    <SpotlightIcon className="w-3.5 h-3.5" />
                                    <span>{spotlightItem.activity_name}</span>
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {isSpotlightToday ? 'Petugas Hari Ini' : `Petugas ${formatRelativeLabel(spotlightItem.date)}`}
                                </span>
                            </div>

                            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{spotlightItem.time_start} - {spotlightItem.time_end}</span>
                            </span>
                        </div>

                        {/* Duty Class Name Showcase */}
                        <div className="flex items-baseline justify-between gap-3 mt-1">
                            <div>
                                <div className="text-xs text-slate-500 font-medium">Kelas Pelaksana:</div>
                                <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                                    <span>{spotlightItem.class_name}</span>
                                    {isSpotlightToday && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-600 text-white rounded-md shadow-2xs">
                                            Bertugas
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xs font-semibold text-slate-800">
                                    {formatIndoDate(spotlightItem.date)}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span className="truncate max-w-[180px]">{spotlightItem.location}</span>
                                </div>
                            </div>
                        </div>

                        {spotlightItem.description && (
                            <p className="text-[11px] text-slate-600 mt-2.5 pt-2.5 border-t border-slate-200/80 line-clamp-2 leading-relaxed">
                                {spotlightItem.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Upcoming List (Petugas Besok & Sesi Berikutnya) */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>Agenda & Petugas Berikutnya</span>
                        <span className="text-[11px] font-normal text-slate-400">Rotasi Mingguan</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {upcomingList.length === 0 ? (
                            <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                                Belum ada jadwal kokurikuler berikutnya.
                            </div>
                        ) : (
                            upcomingList.map((item, idx) => {
                                const theme = getActivityTheme(item.activity_name);
                                const Icon = theme.icon;
                                const isTomorrow = item.date === tomorrowDate;

                                return (
                                    <div
                                        key={item.id || idx}
                                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${theme.bg} ${theme.text} border ${theme.border}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-bold text-xs text-slate-900">
                                                        {item.class_name}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                                        isTomorrow 
                                                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {formatRelativeLabel(item.date)}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                                    {item.activity_name} • {item.day_name}, {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className="text-[11px] font-mono font-medium text-slate-700">
                                                {item.time_start}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {item.time_end}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with modal trigger button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                    42 Sesi Terjadwal • Sesuai Kalender Koku 2.0
                </span>
                <button
                    onClick={onOpenModal}
                    type="button"
                    className="w-full sm:w-auto font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center sm:justify-end gap-1.5 transition-colors py-1 cursor-pointer"
                >
                    <span>Buka Seluruh Jadwal Koku (11 Minggu)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
