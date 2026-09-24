import React from 'react';

export default function Logo({ size = 'default', showText = true, subtitle = 'Portal Akademik & Jadwal' }) {
    const isSmall = size === 'sm';
    const isLarge = size === 'lg';

    return (
        <div className="flex items-center gap-3">
            <div className={`shrink-0 flex items-center justify-center rounded-xl bg-slate-900 shadow-md ${
                isSmall ? 'w-8 h-8 p-1' : isLarge ? 'w-12 h-12 p-2' : 'w-10 h-10 p-1.5'
            }`}>
                <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
                    <rect width="120" height="120" rx="24" fill="#0F172A" />
                    <path d="M30 40H90V48H30V40Z" fill="#FFFFFF" />
                    <path d="M30 56H72V64H30V56Z" fill="#4F46E5" />
                    <path d="M30 72H84V80H30V72Z" fill="#94A3B8" />
                    <circle cx="86" cy="60" r="6" fill="#4F46E5" />
                </svg>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className={`font-bold tracking-tight text-slate-900 ${
                            isSmall ? 'text-sm' : isLarge ? 'text-2xl' : 'text-lg'
                        }`}>
                            EDUSYNC
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            SMK
                        </span>
                    </div>
                    {subtitle && (
                        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[200px]">
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
