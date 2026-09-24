import { useState, useEffect } from 'react';

/**
 * High-precision Real-time Clock hook for EDUSYNC
 * Ticks every 1000ms and formats local time in WIB with Indonesian localized strings.
 */
export function useRealtimeClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const pad = (n) => String(n).padStart(2, '0');
    const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    const timeShort = `${pad(hours)}:${pad(minutes)}`;

    // Indonesian Day Names (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[now.getDay()];

    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isSchoolDay = !isWeekend;

    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(now);

    const academicYear = '2024/2025 Genap';

    return {
        now,
        hours,
        minutes,
        seconds,
        timeString,
        timeShort,
        dayName,
        dateFormatted,
        academicYear,
        isSchoolDay,
        isWeekend,
    };
}

export default useRealtimeClock;
