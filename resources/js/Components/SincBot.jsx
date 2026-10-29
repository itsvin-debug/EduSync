import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Paperclip, MessageSquare, AlertCircle, RefreshCw, Bot } from 'lucide-react';
import SincBotAvatar from '@/Components/SincBotAvatar';

const INITIAL_GREETING = {
    id: 'init-1',
    sender: 'bot',
    text: 'SINC-BOT: Selamat pagi! Saya siap membantu menjawab pertanyaan Anda seputar portal SMKN 1 Ciomas.',
    isOutOfTopic: false,
};

const QUICK_CHIPS = [
    { label: 'Di mana letak lab animasi?', query: 'Di mana letak lab animasi?' },
    { label: 'Jadwal Kokurikuler 2.0', query: 'Bagaimana jadwal Kokurikuler 2.0 di SMKN 1 Ciomas?' },
    { label: '5 Konsentrasi Keahlian', query: 'Apa saja 5 konsentrasi keahlian di SMKN 1 Ciomas?' },
    { label: 'Jam Belajar KBM', query: 'Berapa jam belajar KBM dan jadwal istirahat?' },
];

export default function SincBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_GREETING]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [robotState, setRobotState] = useState('idle'); // 'idle' | 'speaking' | 'confused'
    const [showQuickChips, setShowQuickChips] = useState(true);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom on new message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, messages, isLoading]);

    // Handle Closing & Automatic Clear (DOM & Backend session reset)
    const handleClose = async () => {
        setIsOpen(false);
        setMessages([INITIAL_GREETING]);
        setInputValue('');
        setIsLoading(false);
        setRobotState('idle');
        setShowQuickChips(true);

        try {
            await fetch('/api/sinc-bot/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ session_id: 'default' }),
            });
        } catch (err) {
            // Non-blocking cleanup
        }
    };

    // Send Message Handler
    const handleSend = async (messageText) => {
        const text = (messageText || inputValue).trim();
        if (!text || isLoading) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: text,
            isOutOfTopic: false,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);
        setRobotState('speaking');
        setShowQuickChips(false);

        try {
            const response = await fetch('/api/sinc-bot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            const isOutOfTopic = Boolean(data.is_out_of_topic);

            // Trigger robot animation state
            if (isOutOfTopic) {
                setRobotState('confused');
                setTimeout(() => setRobotState('idle'), 2500);
            } else {
                setRobotState('speaking');
                setTimeout(() => setRobotState('idle'), 1800);
            }

            const botReplyText = data.reply?.startsWith('SINC-BOT:')
                ? data.reply
                : `SINC-BOT: ${data.reply || 'Ada yang bisa saya bantu kembali seputar SMKN 1 Ciomas?'}`;

            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: botReplyText,
                    isOutOfTopic: isOutOfTopic,
                },
            ]);
        } catch (err) {
            setRobotState('idle');
            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: 'SINC-BOT: Maaf, terjadi kendala saat menghubungi server. Silakan coba tanyakan kembali.',
                    isOutOfTopic: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside aria-label="Asisten AI SINC-BOT">
            {/* 1. FLOATING ROBOT MASCOT BUTTON (When Closed) */}
            {!isOpen && (
                <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center group">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="relative p-1.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 rounded-full transition-transform hover:scale-105 active:scale-95"
                        title="Tanya SINC-BOT (Asisten AI EduSync)"
                        aria-label="Buka Asisten AI SINC-BOT"
                    >
                        {/* Glow halo backdrop */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Animated vector mascot */}
                        <div className="relative">
                            <SincBotAvatar
                                state="waving"
                                size={80}
                                showBody={true}
                                className="drop-shadow-2xl"
                            />
                        </div>

                        {/* Interactive floating label badge */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>Tanya SINC-BOT</span>
                        </div>
                    </button>
                </div>
            )}

            {/* 2. POP-UP CHAT WIDGET MODAL */}
            {isOpen && (
                <div
                    className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:top-auto z-50 flex items-center justify-center sm:block p-4 sm:p-0"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sinc-bot-title"
                >
                    {/* Backdrop on mobile screen for accessible modal dismissal */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs sm:hidden"
                        onClick={handleClose}
                    />

                    {/* Chat Box Container */}
                    <div className="relative w-full max-w-[370px] sm:w-[375px] h-[580px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        {/* HEADER: Identitas & Close Button */}
                        <header className="relative bg-[#0f172a] text-white pt-3.5 pb-2 px-4 border-b border-indigo-950/40 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-indigo-500/30">
                                        E
                                    </div>
                                    <div>
                                        <h2 id="sinc-bot-title" className="text-xs font-bold tracking-wide uppercase text-slate-100 flex items-center gap-1.5">
                                            <span>EDUSYNC ASISTEN (SINC-BOT)</span>
                                        </h2>
                                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span>AI Resmi SMKN 1 Ciomas</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                    aria-label="Tutup jendela chat"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </header>

                        {/* BANNER ROBOT MENGAMBANG LENGKUNG (Sesuai Mockup Gambar) */}
                        <div className="relative bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#2e2a72] pt-1 pb-4 px-4 overflow-hidden shrink-0 rounded-b-[2.5rem] shadow-md">
                            {/* School Doodle Pattern Background */}
                            <svg
                                className="absolute inset-0 w-full h-full opacity-15 pointer-events-none text-indigo-300"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 400 150"
                            >
                                <path stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" d="M30 40h20v20H30zM70 20l15 25H55zM120 30c10-15 25-5 25 15s-20 20-25 10zM260 30h25v15h-25zM320 20c15 0 25 20 15 35M40 100l20-10 10 20-20 10zM150 110h30v15h-30zM310 90l15 15-15 15-15-15zM220 100c10-10 20 0 25 10" />
                                <circle cx="180" cy="35" r="8" stroke="currentColor" strokeWidth="1.2" />
                                <circle cx="360" cy="60" r="10" stroke="currentColor" strokeWidth="1.2" />
                                <path stroke="currentColor" strokeWidth="1.2" d="M210 50l10-15 10 15zM100 80h15v15h-15z" />
                            </svg>

                            {/* Center Procedural Vector Robot Mascot with Animated Visor & Gestures */}
                            <div className="relative flex flex-col items-center justify-center pt-1">
                                <SincBotAvatar
                                    state={robotState}
                                    size={108}
                                    showBody={true}
                                    className="drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* CHAT MESSAGES BODY */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${
                                        msg.sender === 'user' ? 'items-end' : 'items-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[88%] p-3.5 rounded-2xl shadow-xs transition-all ${
                                            msg.sender === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-xs'
                                                : msg.isOutOfTopic
                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-slate-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-tl-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                                        }`}
                                    >
                                        <p className="whitespace-pre-line text-[13px]">{msg.text}</p>
                                    </div>
                                    {msg.isOutOfTopic && (
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Pertanyaan di luar konteks SMKN 1 Ciomas ditolak
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl rounded-tl-xs max-w-[120px]">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                                </div>
                            )}

                            {/* Quick Suggestion Chips */}
                            {showQuickChips && messages.length <= 2 && (
                                <div className="pt-2">
                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2">
                                        Rekomendasi Pertanyaan:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_CHIPS.map((chip, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSend(chip.query)}
                                                className="text-[11px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 rounded-full px-2.5 py-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors text-left"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT FOOTER: Input Box with Attachment & Send Button */}
                        <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 transition-all shadow-xs"
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowQuickChips((prev) => !prev)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Pilihan Topik Cepat"
                                    aria-label="Pilihan topik cepat"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ketik pertanyaan Anda..."
                                    className="flex-1 bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0 p-1"
                                    disabled={isLoading}
                                />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-transform active:scale-90 shadow-sm shrink-0"
                                    title="Kirim pesan"
                                    aria-label="Kirim pesan ke SINC-BOT"
                                >
                                    <Send className="w-3.5 h-3.5 -translate-x-0.5 translate-y-0.5" />
                                </button>
                            </form>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-2 pt-1.5">
                                <span>SMKN 1 Ciomas • EduSync AI</span>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    <span>Bersihkan Riwayat</span>
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </aside>
    );
}
