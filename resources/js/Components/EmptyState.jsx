import React from 'react';
import { CalendarX, SearchX, Inbox, Sparkles } from 'lucide-react';

export default function EmptyState({
    icon: Icon = CalendarX,
    title = 'Belum Ada Data Terjadwal',
    description = 'Tidak ada jadwal atau data yang tersedia untuk filter yang Anda pilih saat ini.',
    actionLabel,
    onAction,
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h4>
            <p className="text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    );
}
