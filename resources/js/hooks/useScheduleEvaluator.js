import { useMemo } from 'react';
import { useRealtimeClock } from './useRealtimeClock';
import { SCHOOL_PERIODS } from './useScheduleEngine';

export { SCHOOL_PERIODS };

/**
 * Pure evaluator helper to parse 'HH:mm' to total minutes since midnight
 */
export function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

/**
 * useScheduleEvaluator:
 * A high-precision evaluator for school periods, classes, and individual schedules.
 * Ticks synchronously with `useRealtimeClock` (1000ms interval) in WIB timezone.
 */
export function useScheduleEvaluator(schedules = [], options = {}) {
    const clock = useRealtimeClock();
    const effectiveDay = options.dayOverride || clock.dayName;
    const currentMinutes = clock.hours * 60 + clock.minutes;
    const currentSecondsIntoMinute = clock.seconds;

    const isJumat = effectiveDay === 'Jumat';
    const periodDefinitions = isJumat ? SCHOOL_PERIODS.jumat : SCHOOL_PERIODS.regular;

    const todaySchedules = useMemo(() => {
        return (schedules || []).filter(s => s.day === effectiveDay);
    }, [schedules, effectiveDay]);

    // Current temporal period evaluation
    const evaluation = useMemo(() => {
        // 1. Weekend
        if (clock.isWeekend && !options.dayOverride) {
            return {
                state: 'WEEKEND_HOLIDAY',
                label: 'Libur Akhir Pekan',
                badgeText: 'Libur Sekolah',
                badgeVariant: 'weekend',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: '00:00:00',
                countdownSeconds: 0,
                progressPercent: 0,
            };
        }

        const schoolOpenMinutes = parseTimeToMinutes('06:30');
        const schoolCloseMinutes = parseTimeToMinutes('15:00');

        // 2. Before 06:30 / 07:00 WIB
        if (currentMinutes < schoolOpenMinutes && !options.dayOverride) {
            const diffSeconds = (schoolOpenMinutes - currentMinutes) * 60 - currentSecondsIntoMinute;
            const h = Math.floor(diffSeconds / 3600);
            const m = Math.floor((diffSeconds % 3600) / 60);
            const s = diffSeconds % 60;
            const pad = (n) => String(n).padStart(2, '0');

            return {
                state: 'OUT_OF_SCHOOL_HOURS',
                label: 'Pending — Menunggu Waktu Sekolah',
                badgeText: 'Pending',
                badgeVariant: 'pending',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: `${pad(h)}:${pad(m)}:${pad(s)}`,
                countdownSeconds: Math.max(0, diffSeconds),
                progressPercent: 0,
            };
        }

        // 3. After 15:00 / 15:30 WIB
        if (currentMinutes >= schoolCloseMinutes && !options.dayOverride) {
            return {
                state: 'OUT_OF_SCHOOL_HOURS',
                label: 'Jam Sekolah Selesai',
                badgeText: 'Selesai',
                badgeVariant: 'completed',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: '00:00:00',
                countdownSeconds: 0,
                progressPercent: 100,
            };
        }

        // 4. Find active period interval
        let currentInterval = null;
        for (const item of periodDefinitions) {
            const startM = parseTimeToMinutes(item.start);
            const endM = parseTimeToMinutes(item.end);
            if (currentMinutes >= startM && currentMinutes < endM) {
                currentInterval = item;
                break;
            }
        }

        if (!currentInterval) {
            return {
                state: 'OUT_OF_SCHOOL_HOURS',
                label: 'Pergantian Jam Pelajaran',
                badgeText: 'Pergantian',
                badgeVariant: 'pending',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: '00:00:00',
                countdownSeconds: 0,
                progressPercent: 0,
            };
        }

        const startM = parseTimeToMinutes(currentInterval.start);
        const endM = parseTimeToMinutes(currentInterval.end);
        const totalDurationSec = (endM - startM) * 60;
        const elapsedSec = (currentMinutes - startM) * 60 + currentSecondsIntoMinute;
        const remainingSec = Math.max(0, totalDurationSec - elapsedSec);

        const mRemaining = Math.floor(remainingSec / 60);
        const sRemaining = remainingSec % 60;
        const pad = (n) => String(n).padStart(2, '0');
        const countdownFormatted = `${pad(mRemaining)}:${pad(sRemaining)}`;
        const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalDurationSec) * 100)));

        // Istirahat
        if (currentInterval.isBreak) {
            return {
                state: 'BREAK_TIME',
                label: currentInterval.label,
                badgeText: 'Istirahat',
                badgeVariant: 'break',
                activeSlot: null,
                activePeriod: currentInterval,
                isBreak: true,
                countdownFormatted,
                countdownSeconds: remainingSec,
                progressPercent,
            };
        }

        // Active Lesson Period
        const activeSlot = todaySchedules.find(s =>
            currentInterval.period >= s.period_start && currentInterval.period <= s.period_end
        ) || null;

        return {
            state: 'CLASS_ACTIVE',
            label: `Jam ke-${currentInterval.period} (${currentInterval.start} - ${currentInterval.end})`,
            badgeText: 'Berlangsung',
            badgeVariant: 'active',
            activeSlot,
            activePeriod: currentInterval,
            isBreak: false,
            countdownFormatted,
            countdownSeconds: remainingSec,
            progressPercent,
        };
    }, [currentMinutes, currentSecondsIntoMinute, clock.isWeekend, periodDefinitions, todaySchedules, options.dayOverride]);

    // Helper: evaluate period status for timeline rows ('selesai' | 'berlangsung' | 'mendatang')
    const getPeriodStatus = (periodNum) => {
        if (clock.isWeekend && !options.dayOverride) return 'mendatang';
        if (currentMinutes >= parseTimeToMinutes('15:00') && !options.dayOverride) return 'selesai';
        if (currentMinutes < parseTimeToMinutes('06:30') && !options.dayOverride) return 'mendatang';

        const def = periodDefinitions.find(p => p.period === periodNum);
        if (!def) return 'mendatang';

        const startM = parseTimeToMinutes(def.start);
        const endM = parseTimeToMinutes(def.end);

        if (currentMinutes >= endM) return 'selesai';
        if (currentMinutes >= startM && currentMinutes < endM) return 'berlangsung';
        return 'mendatang';
    };

    return {
        clock,
        effectiveDay,
        todaySchedules,
        evaluation,
        getPeriodStatus,
        periodDefinitions,
    };
}

export default useScheduleEvaluator;
