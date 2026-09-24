import { useMemo } from 'react';
import { useRealtimeClock } from './useRealtimeClock';

/**
 * Standard VOCATIONAL TIMETABLE INTERVALS (SMK PK)
 */
export const SCHOOL_PERIODS = {
    regular: [
        { period: 1, start: '06:30', end: '07:30', label: 'Upacara / Pembinaan Wali Kelas' },
        { period: 2, start: '07:30', end: '08:10', label: 'Jam ke-2' },
        { period: 3, start: '08:10', end: '08:50', label: 'Jam ke-3' },
        { period: 4, start: '08:50', end: '09:30', label: 'Jam ke-4' },
        { period: 0, start: '09:30', end: '10:00', label: 'Istirahat Pertama', isBreak: true },
        { period: 5, start: '10:00', end: '10:40', label: 'Jam ke-5' },
        { period: 6, start: '10:40', end: '11:20', label: 'Jam ke-6' },
        { period: 7, start: '11:20', end: '12:00', label: 'Jam ke-7' },
        { period: 0, start: '12:00', end: '13:00', label: 'Istirahat Kedua / ISOMA', isBreak: true },
        { period: 8, start: '13:00', end: '13:40', label: 'Jam ke-8' },
        { period: 9, start: '13:40', end: '14:20', label: 'Jam ke-9' },
        { period: 10, start: '14:20', end: '15:00', label: 'Jam ke-10' },
    ],
    jumat: [
        { period: 1, start: '06:30', end: '07:30', label: 'Penguatan Karakter / Jumat Bersih & Taqwa' },
        { period: 2, start: '07:30', end: '08:10', label: 'Jam ke-2' },
        { period: 3, start: '08:10', end: '08:50', label: 'Jam ke-3' },
        { period: 4, start: '08:50', end: '09:30', label: 'Jam ke-4' },
        { period: 0, start: '09:30', end: '09:45', label: 'Istirahat Pertama', isBreak: true },
        { period: 5, start: '09:45', end: '10:25', label: 'Jam ke-5' },
        { period: 6, start: '10:25', end: '11:05', label: 'Jam ke-6' },
        { period: 7, start: '11:05', end: '11:45', label: 'Jam ke-7' },
        { period: 0, start: '11:45', end: '13:00', label: 'Istirahat Kedua / Sholat Jumat', isBreak: true },
        { period: 8, start: '13:00', end: '15:00', label: 'Ekstrakurikuler / Hari Belajar Guru' },
    ],
};

function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * useScheduleEngine: Evaluates real-time schedule state every second.
 */
export function useScheduleEngine(schedules = [], options = {}) {
    const clock = useRealtimeClock();
    const effectiveDay = options.dayOverride || clock.dayName;

    // Use current time in minutes
    const currentMinutes = clock.hours * 60 + clock.minutes;
    const currentSecondsIntoMinute = clock.seconds;

    const isJumat = effectiveDay === 'Jumat';
    const periodDefinitions = isJumat ? SCHOOL_PERIODS.jumat : SCHOOL_PERIODS.regular;

    const todaySchedules = useMemo(() => {
        return (schedules || []).filter(s => s.day === effectiveDay);
    }, [schedules, effectiveDay]);

    // Evaluation Engine
    const engineState = useMemo(() => {
        // 1. Weekend Check
        if (clock.isWeekend && !options.dayOverride) {
            return {
                state: 'WEEKEND_HOLIDAY',
                label: 'Libur Akhir Pekan',
                sublabel: 'Kegiatan Pembelajaran Dimulai Kembali Senin Pagi Pukul 06:30 WIB',
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

        // 2. Before School
        if (currentMinutes < schoolOpenMinutes && !options.dayOverride) {
            const diffSeconds = (schoolOpenMinutes - currentMinutes) * 60 - currentSecondsIntoMinute;
            const h = Math.floor(diffSeconds / 3600);
            const m = Math.floor((diffSeconds % 3600) / 60);
            const s = diffSeconds % 60;
            const pad = (n) => String(n).padStart(2, '0');

            return {
                state: 'OUT_OF_SCHOOL_HOURS',
                label: 'Pending — Menunggu Waktu Sekolah',
                sublabel: 'Menunggu Sesi Pembelajaran Dimulai Pukul 06:30 WIB',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: `${pad(h)}:${pad(m)}:${pad(s)}`,
                countdownSeconds: Math.max(0, diffSeconds),
                progressPercent: 0,
            };
        }

        // 3. After School Dismissal
        if (currentMinutes >= schoolCloseMinutes && !options.dayOverride) {
            return {
                state: 'OUT_OF_SCHOOL_HOURS',
                label: 'Jam Sekolah Selesai',
                sublabel: 'Kegiatan Belajar Mengajar Hari Ini Telah Selesai',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: '00:00:00',
                countdownSeconds: 0,
                progressPercent: 100,
            };
        }

        // 4. Find active interval in period definitions
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
            // Default fallback if right at boundary
            return {
                state: 'OUT_OF_SCHOOL_HOURS',
                label: 'Pergantian Jam Pelajaran',
                sublabel: 'Menyiapkan modul pembelajaran sesi berikutnya',
                activeSlot: null,
                activePeriod: null,
                isBreak: false,
                countdownFormatted: '00:00:00',
                countdownSeconds: 0,
                progressPercent: 0,
            };
        }

        // Calculate countdown and progress
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

        // Handle Break Time
        if (currentInterval.isBreak) {
            return {
                state: 'BREAK_TIME',
                label: currentInterval.label,
                sublabel: 'Waktu Istirahat & Relaksasi Siswa',
                activeSlot: null,
                activePeriod: currentInterval,
                isBreak: true,
                countdownFormatted,
                countdownSeconds: remainingSec,
                progressPercent,
            };
        }

        // Handle Active Class Period
        // Find schedule covering this period number
        const activeSlot = todaySchedules.find(s =>
            currentInterval.period >= s.period_start && currentInterval.period <= s.period_end
        ) || null;

        return {
            state: 'CLASS_ACTIVE',
            label: `Jam ke-${currentInterval.period} (${currentInterval.start} - ${currentInterval.end})`,
            sublabel: activeSlot ? `${activeSlot.subject?.name} — ${activeSlot.teacher?.name}` : 'Jam Kosong / Belajar Mandiri Terbimbing',
            activeSlot,
            activePeriod: currentInterval,
            isBreak: false,
            countdownFormatted,
            countdownSeconds: remainingSec,
            progressPercent,
        };
    }, [currentMinutes, currentSecondsIntoMinute, clock.isWeekend, periodDefinitions, todaySchedules, options.dayOverride]);

    // Next upcoming slot helper
    const nextSlot = useMemo(() => {
        if (!engineState.activePeriod) return todaySchedules[0] || null;
        const curPeriod = engineState.activePeriod.period || 0;
        return todaySchedules.find(s => s.period_start > curPeriod) || null;
    }, [engineState.activePeriod, todaySchedules]);

    // Period status evaluator helper for timeline rows
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
        engineState,
        nextSlot,
        getPeriodStatus,
        periodDefinitions,
    };
}

export default useScheduleEngine;
