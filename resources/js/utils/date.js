/**
 * Format date value into clean Indonesian human-readable format.
 * Examples:
 *   "2026-11-03T00:00:00.000000Z" -> "03 Nov 2026"
 *   "2026-11-03" -> "03 Nov 2026"
 */
export function formatDisplayDate(dateValue, options = {}) {
    if (!dateValue) return '-';

    const { withDay = false, separator = ' ' } = options;

    try {
        const raw = String(dateValue).trim();
        // Extract YYYY-MM-DD even if followed by T or space
        const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            const monthIdx = parseInt(match[2], 10) - 1;
            const day = match[3];

            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
            ];
            const monthName = months[monthIdx] || match[2];

            if (withDay) {
                const dateObj = new Date(year, monthIdx, parseInt(day, 10));
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const dayName = days[dateObj.getDay()] || '';
                return `${dayName}, ${day}${separator}${monthName}${separator}${year}`;
            }

            return `${day}${separator}${monthName}${separator}${year}`;
        }

        // Fallback to Date parser
        const dateObj = new Date(raw);
        if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        }
    } catch {
        // Safe fallback
    }

    return String(dateValue);
}

/**
 * Format time value into clean HH:mm format.
 */
export function formatDisplayTime(timeValue) {
    if (!timeValue) return '-';
    const raw = String(timeValue).trim();
    const match = raw.match(/(\d{1,2}):(\d{2})/);
    if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return raw;
}
