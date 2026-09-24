import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [toastData, setToastData] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToastData({ type: 'success', message: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setToastData({ type: 'error', message: flash.error });
            setVisible(true);
        } else if (flash?.warning) {
            setToastData({ type: 'warning', message: flash.warning });
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !toastData) return null;

    const isSuccess = toastData.type === 'success';
    const isError = toastData.type === 'error';
    const isWarning = toastData.type === 'warning';

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className={`p-4 rounded-xl shadow-xl border flex items-start gap-3.5 backdrop-blur-md ${
                isSuccess
                    ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                    : isError
                    ? 'bg-rose-50/95 border-rose-200 text-rose-950'
                    : 'bg-amber-50/95 border-amber-200 text-amber-950'
            }`}>
                <div className="shrink-0 mt-0.5">
                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isError && <XCircle className="w-5 h-5 text-rose-600" />}
                    {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                </div>
                <div className="flex-1 text-sm font-medium leading-relaxed">
                    {toastData.message}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
