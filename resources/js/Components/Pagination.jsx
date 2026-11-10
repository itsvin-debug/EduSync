import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    from = 0,
    to = 0,
    onPageChange = () => {},
    links = null,
    className = '',
}) {
    if (totalItems === 0 || totalPages <= 1) {
        return null;
    }

    // Build visible page numbers window (e.g. 1 ... 4 5 6 ... 10)
    const getPageNumbers = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const pages = getPageNumbers();
    const effectiveFrom = from || ((currentPage - 1) * 15 + 1);
    const effectiveTo = to || Math.min(currentPage * 15, totalItems);

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 ${className}`}
            aria-label="Navigasi Halaman"
        >
            {/* Range Counter */}
            <div className="text-center sm:text-left text-slate-500 dark:text-slate-400 font-medium order-2 sm:order-1">
                Menampilkan{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {effectiveFrom}
                </strong>
                -
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {effectiveTo}
                </strong>{' '}
                dari{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {totalItems}
                </strong>{' '}
                data
            </div>

            {/* Pagination Controls */}
            <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
                {/* Previous Button */}
                <button
                    type="button"
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`inline-flex items-center justify-center gap-1 min-h-[38px] px-3 py-1.5 rounded-lg border font-medium transition-colors duration-150 ${
                        currentPage <= 1
                            ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:scale-95'
                    }`}
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Mobile Compact Page Indicator */}
                <div className="flex sm:hidden items-center px-2 font-semibold text-slate-700 dark:text-slate-300">
                    Hal {currentPage} / {totalPages}
                </div>

                {/* Desktop Numeric Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pages.map((p, idx) => {
                        if (p === '...') {
                            return (
                                <span
                                    key={`dots-${idx}`}
                                    className="px-2 py-1.5 text-slate-400 dark:text-slate-600 select-none"
                                >
                                    ...
                                </span>
                            );
                        }

                        const isActive = p === currentPage;
                        return (
                            <button
                                key={`page-${p}`}
                                type="button"
                                onClick={() => onPageChange(p)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`min-w-[36px] min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`inline-flex items-center justify-center gap-1 min-h-[38px] px-3 py-1.5 rounded-lg border font-medium transition-colors duration-150 ${
                        currentPage >= totalPages
                            ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:scale-95'
                    }`}
                    aria-label="Halaman berikutnya"
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </nav>
        </div>
    );
}

