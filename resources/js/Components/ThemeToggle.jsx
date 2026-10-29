import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabel = false }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Read active theme from DOM class or localStorage
        const isCurrentDark = document.documentElement.classList.contains('dark');
        setTheme(isCurrentDark ? 'dark' : 'light');

        const handleThemeChange = () => {
            const isDarkNow = document.documentElement.classList.contains('dark');
            setTheme(isDarkNow ? 'dark' : 'light');
        };

        window.addEventListener('edusync-theme-change', handleThemeChange);
        return () => window.removeEventListener('edusync-theme-change', handleThemeChange);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            localStorage.setItem('edusync_theme', nextTheme);
        } catch (e) {}

        setTheme(nextTheme);
        window.dispatchEvent(new CustomEvent('edusync-theme-change', { detail: { theme: nextTheme } }));
    };

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className={`relative inline-flex items-center justify-center gap-2 h-9 px-2.5 rounded-xl border transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 ${
                isDark
                    ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 hover:border-slate-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-xs'
            } ${className}`}
        >
            <span className="relative flex items-center justify-center w-4 h-4">
                {isDark ? (
                    <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
                ) : (
                    <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0 text-slate-700" />
                )}
            </span>
            {showLabel && (
                <span className="text-xs font-semibold select-none">
                    {isDark ? 'Mode Terang' : 'Mode Gelap'}
                </span>
            )}
        </button>
    );
}
