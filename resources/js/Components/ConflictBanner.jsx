import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ConflictBanner({ conflicts = [], onAutoFix }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasConflicts = conflicts && conflicts.length > 0;

    const handleAutoGenerate = () => {
        if (confirm('Jalankan Algoritma Pemulihan Jadwal Otomatis untuk menyusun ulang jadwal bebas bentrok sesuai dokumen kurikulum?')) {
            router.post(route('admin.schedules.autogenerate'));
        }
    };

    if (!hasConflicts) {
        return (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 px-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-emerald-950">Integritas Jadwal Terverifikasi</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                0 Bentrok Terdeteksi
                            </span>
                        </div>
                        <p className="text-xs text-emerald-800/80 mt-0.5">
                            Semua pengajar, ruangan laboratorium, dan rombel telah tervalidasi 100% bebas tabrakan (Conflict-Free).
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Status Dapodik: Sinkron
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 px-5 mb-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-amber-950">
                                {conflicts.length} Tabrakan Jadwal Ditemukan!
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                Butuh Revisi
                            </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-0.5">
                            Terdapat instruktur atau ruang lab yang dialokasikan di dua tempat secara bersamaan.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAutoGenerate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Auto-Resolve AI</span>
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                    >
                        <span>{isExpanded ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-3 border-t border-amber-200/80 space-y-2">
                    {conflicts.map((c, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white/80 border border-amber-200 flex items-start justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-rose-600">#{idx + 1}</span>
                                <span className="text-slate-800 font-medium">{c.message}</span>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[11px] font-semibold">
                                {c.day} • {c.period}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
