import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, RefreshCw, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Tindakan',
    message,
    confirmText = 'Lanjutkan',
    cancelText = 'Batal',
    type = 'primary', // 'primary', 'warning', 'danger'
    isLoading = false,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isLoading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    const typeConfig = {
        primary: {
            icon: RefreshCw,
            iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
            buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
        },
        danger: {
            icon: AlertCircle,
            iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
            buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        },
    };

    const currentConfig = typeConfig[type] || typeConfig.primary;
    const IconComponent = currentConfig.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-150"
                onClick={isLoading ? undefined : onClose}
                aria-hidden="true"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${currentConfig.iconBg}`}>
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 id="confirm-modal-title" className="text-base font-semibold text-slate-900 leading-snug">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Tutup modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors duration-150"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${currentConfig.buttonClass}`}
                        >
                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
