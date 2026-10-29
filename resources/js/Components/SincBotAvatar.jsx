import React from 'react';

/**
 * SINC-BOT Vector Robot Avatar
 * Pure SVG procedural design with realistic gradients, lighting, and reactive animations.
 * Eliminates all raster/PNG image artifacts and enables smooth state-based animations.
 *
 * @param {string} state - 'idle' | 'speaking' | 'confused' | 'waving'
 * @param {number} size - width/height in px (default: 96)
 * @param {boolean} showBody - whether to render full floating body or upper bust
 * @param {string} className - optional extra Tailwind classes
 */
export default function SincBotAvatar({
    state = 'idle',
    size = 96,
    showBody = true,
    className = '',
}) {
    const isSpeaking = state === 'speaking';
    const isConfused = state === 'confused';

    // Unique gradient IDs to prevent DOM collision if multiple avatars render
    const idPrefix = React.useId().replace(/:/g, '');

    return (
        <div
            className={`relative flex items-center justify-center select-none ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 160 170"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-full h-full overflow-visible transition-transform duration-300 ${
                    isConfused
                        ? 'animate-sinc-shake'
                        : isSpeaking
                        ? 'animate-sinc-speak-bob'
                        : 'animate-sinc-float'
                }`}
            >
                <defs>
                    {/* Metallic Outer Shell Gradients */}
                    <linearGradient id={`${idPrefix}-metalHead`} x1="30" y1="20" x2="130" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#c7d2fe" />
                        <stop offset="35%" stopColor="#818cf8" />
                        <stop offset="85%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#3730a3" />
                    </linearGradient>

                    <linearGradient id={`${idPrefix}-metalBody`} x1="45" y1="95" x2="115" y2="155" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#a5b4fc" />
                        <stop offset="40%" stopColor="#6366f1" />
                        <stop offset="90%" stopColor="#4338ca" />
                        <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>

                    {/* Dark Glass Visor Gradient */}
                    <linearGradient id={`${idPrefix}-visor`} x1="45" y1="35" x2="115" y2="85" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0b0f19" />
                        <stop offset="60%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#1e1b4b" />
                    </linearGradient>

                    {/* Visor Glare / Highlight Gradient */}
                    <linearGradient id={`${idPrefix}-visorGlare`} x1="50" y1="38" x2="110" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                        <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>

                    {/* Glowing Cyan Glow Filter */}
                    <filter id={`${idPrefix}-cyanGlow`} x1="-20%" y1="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Warning Amber Glow Filter */}
                    <filter id={`${idPrefix}-amberGlow`} x1="-20%" y1="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Thruster Bottom Halo */}
                    <radialGradient id={`${idPrefix}-thrusterGlow`} cx="80" cy="160" r="30" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* 1. THRUSTER / SHADOW GLOW (Bottom Float Effect) */}
                {showBody && (
                    <g className="animate-sinc-thruster">
                        <ellipse cx="80" cy="158" rx="26" ry="7" fill={`url(#${idPrefix}-thrusterGlow)`} />
                        <ellipse cx="80" cy="158" rx="14" ry="3.5" fill="#38bdf8" opacity="0.6" />
                    </g>
                )}

                {/* 2. BODY / TORSO & LOWER POD */}
                {showBody && (
                    <g id="sinc-robot-torso">
                        {/* Rounded Hover Pod */}
                        <path
                            d="M 52 100 Q 42 120, 56 142 Q 80 156, 104 142 Q 118 120, 108 100 Z"
                            fill={`url(#${idPrefix}-metalBody)`}
                        />

                        {/* Torso Middle Band */}
                        <path
                            d="M 50 102 C 50 96, 110 96, 110 102 C 110 115, 50 115, 50 102 Z"
                            fill="#312e81"
                            opacity="0.85"
                        />

                        {/* Chest Speaker Matrix / Core Orb */}
                        <circle cx="80" cy="126" r="14" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1.5" />
                        <circle cx="80" cy="126" r="10" fill="#0f172a" />
                        
                        {/* Speaker Grill Dots */}
                        <circle cx="76" cy="123" r="1.2" fill="#6366f1" />
                        <circle cx="80" cy="123" r="1.2" fill="#6366f1" />
                        <circle cx="84" cy="123" r="1.2" fill="#6366f1" />
                        <circle cx="74" cy="126" r="1.2" fill="#6366f1" />
                        <circle cx="78" cy="126" r="1.4" fill={isSpeaking ? '#38bdf8' : '#818cf8'} filter={isSpeaking ? `url(#${idPrefix}-cyanGlow)` : undefined} />
                        <circle cx="82" cy="126" r="1.4" fill={isSpeaking ? '#38bdf8' : '#818cf8'} filter={isSpeaking ? `url(#${idPrefix}-cyanGlow)` : undefined} />
                        <circle cx="86" cy="126" r="1.2" fill="#6366f1" />
                        <circle cx="76" cy="129" r="1.2" fill="#6366f1" />
                        <circle cx="80" cy="129" r="1.2" fill="#6366f1" />
                        <circle cx="84" cy="129" r="1.2" fill="#6366f1" />

                        {/* Left Resting Arm */}
                        <g id="sinc-left-arm">
                            <path
                                d="M 49 104 C 36 114, 34 130, 40 140 C 43 145, 47 143, 47 138 C 44 130, 44 118, 52 110 Z"
                                fill="#4f46e5"
                            />
                            <circle cx="41" cy="142" r="4.5" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
                        </g>

                        {/* Right Arm: Natural Dynamic Waving / Gesture */}
                        <g id="sinc-right-arm" className="animate-sinc-wave origin-[112px_104px]">
                            <path
                                d="M 111 104 C 124 100, 134 88, 138 74 C 141 68, 136 65, 132 68 C 126 77, 120 88, 108 97 Z"
                                fill="#4f46e5"
                            />
                            {/* Waving Hand & Fingers */}
                            <circle cx="136" cy="69" r="6" fill="#312e81" stroke="#818cf8" strokeWidth="1.2" />
                            {/* Cute fingers */}
                            <rect x="131" y="60" width="3" height="6" rx="1.5" fill="#818cf8" transform="rotate(-15 131 60)" />
                            <rect x="136" y="58" width="3" height="7" rx="1.5" fill="#a5b4fc" />
                            <rect x="141" y="60" width="3" height="6" rx="1.5" fill="#818cf8" transform="rotate(15 141 60)" />
                        </g>
                    </g>
                )}

                {/* 3. COLLAR / NECK CONNECTOR */}
                <path
                    d="M 64 92 C 64 88, 96 88, 96 92 C 96 98, 64 98, 64 92 Z"
                    fill="#1e1b4b"
                    stroke="#4338ca"
                    strokeWidth="1.2"
                />

                {/* 4. HEAD GROUP (Antennae, Ears, Skull, Visor, Face) */}
                <g id="sinc-robot-head">
                    {/* Left Antenna */}
                    <line x1="46" y1="36" x2="34" y2="16" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                    <circle
                        cx="34"
                        cy="16"
                        r="5"
                        fill={isConfused ? '#f59e0b' : '#38bdf8'}
                        filter={isConfused ? `url(#${idPrefix}-amberGlow)` : `url(#${idPrefix}-cyanGlow)`}
                    />

                    {/* Right Antenna */}
                    <line x1="114" y1="36" x2="126" y2="16" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                    <circle
                        cx="126"
                        cy="16"
                        r="5"
                        fill={isConfused ? '#f59e0b' : '#38bdf8'}
                        filter={isConfused ? `url(#${idPrefix}-amberGlow)` : `url(#${idPrefix}-cyanGlow)`}
                    />

                    {/* Left Ear Audio Sensor */}
                    <rect x="25" y="44" width="9" height="28" rx="4.5" fill="#312e81" stroke="#4f46e5" strokeWidth="1.5" />
                    <rect x="28" y="50" width="3" height="16" rx="1.5" fill="#818cf8" opacity="0.8" />

                    {/* Right Ear Audio Sensor */}
                    <rect x="126" y="44" width="9" height="28" rx="4.5" fill="#312e81" stroke="#4f46e5" strokeWidth="1.5" />
                    <rect x="129" y="50" width="3" height="16" rx="1.5" fill="#818cf8" opacity="0.8" />

                    {/* Main Robot Skull / Outer Helmet */}
                    <rect
                        x="31"
                        y="24"
                        width="98"
                        height="70"
                        rx="35"
                        fill={`url(#${idPrefix}-metalHead)`}
                        stroke="#6366f1"
                        strokeWidth="2"
                    />

                    {/* Head Top Metallic Highlight Curve */}
                    <path
                        d="M 52 28 Q 80 23, 108 28"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.55"
                    />

                    {/* Branding Text "SINC-BOT" on forehead */}
                    <text
                        x="80"
                        y="35"
                        textAnchor="middle"
                        fill="#c7d2fe"
                        fontSize="6.5"
                        fontWeight="800"
                        letterSpacing="1.2"
                        opacity="0.8"
                        fontFamily="system-ui, sans-serif"
                    >
                        SINC-BOT
                    </text>

                    {/* Visor Display Screen */}
                    <rect
                        x="42"
                        y="39"
                        width="76"
                        height="47"
                        rx="20"
                        fill={`url(#${idPrefix}-visor)`}
                        stroke="#1e1b4b"
                        strokeWidth="1.5"
                    />

                    {/* Visor Diagonal Glass Glare */}
                    <path
                        d="M 44 55 Q 65 42, 98 41 Q 112 41, 115 48 Q 90 48, 55 68 Z"
                        fill={`url(#${idPrefix}-visorGlare)`}
                    />

                    {/* 5. VISOR FACE EXPRESSIONS (Dinamis Berdasarkan State) */}
                    {/* STATE A: IDLE (Cute Cyan Glowing Eyes with Natural Blink) */}
                    {!isSpeaking && !isConfused && (
                        <g id="face-idle" className="animate-sinc-blink origin-[80px_60px]">
                            {/* Left Eye */}
                            <ellipse
                                cx="64"
                                cy="59"
                                rx="7.5"
                                ry="10"
                                fill="#22d3ee"
                                filter={`url(#${idPrefix}-cyanGlow)`}
                            />
                            <ellipse cx="66" cy="56" rx="2.5" ry="3.5" fill="#ffffff" opacity="0.9" />

                            {/* Right Eye */}
                            <ellipse
                                cx="96"
                                cy="59"
                                rx="7.5"
                                ry="10"
                                fill="#22d3ee"
                                filter={`url(#${idPrefix}-cyanGlow)`}
                            />
                            <ellipse cx="98" cy="56" rx="2.5" ry="3.5" fill="#ffffff" opacity="0.9" />

                            {/* Gentle Smiling Mouth */}
                            <path
                                d="M 75 74 Q 80 78, 85 74"
                                stroke="#22d3ee"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                fill="none"
                                filter={`url(#${idPrefix}-cyanGlow)`}
                            />
                        </g>
                    )}

                    {/* STATE B: SPEAKING (Joyful Arched Eyes + Dynamic Equalizer Soundwave Mouth) */}
                    {isSpeaking && (
                        <g id="face-speaking">
                            {/* Cheerful Curved Left Eye */}
                            <path
                                d="M 57 61 Q 64 50, 71 61"
                                stroke="#22d3ee"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                fill="none"
                                filter={`url(#${idPrefix}-cyanGlow)`}
                            />

                            {/* Cheerful Curved Right Eye */}
                            <path
                                d="M 89 61 Q 96 50, 103 61"
                                stroke="#22d3ee"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                fill="none"
                                filter={`url(#${idPrefix}-cyanGlow)`}
                            />

                            {/* Dynamic 5-Bar Soundwave Mouth */}
                            <g id="speaking-soundwave" className="translate-y-[2px]">
                                <rect x="68" y="72" width="2.8" height="6" rx="1.4" fill="#38bdf8" className="animate-sinc-eq-1 origin-bottom" filter={`url(#${idPrefix}-cyanGlow)`} />
                                <rect x="73" y="69" width="2.8" height="11" rx="1.4" fill="#22d3ee" className="animate-sinc-eq-2 origin-bottom" filter={`url(#${idPrefix}-cyanGlow)`} />
                                <rect x="78" y="67" width="3.2" height="15" rx="1.6" fill="#a5f3fc" className="animate-sinc-eq-3 origin-bottom" filter={`url(#${idPrefix}-cyanGlow)`} />
                                <rect x="84" y="69" width="2.8" height="11" rx="1.4" fill="#22d3ee" className="animate-sinc-eq-2 origin-bottom" filter={`url(#${idPrefix}-cyanGlow)`} />
                                <rect x="89" y="72" width="2.8" height="6" rx="1.4" fill="#38bdf8" className="animate-sinc-eq-1 origin-bottom" filter={`url(#${idPrefix}-cyanGlow)`} />
                            </g>
                        </g>
                    )}

                    {/* STATE C: CONFUSED / REJECT (Amber Puzzled Eyes + Wavy Mouth + Question Mark) */}
                    {isConfused && (
                        <g id="face-confused">
                            {/* Left Question Eye or Slanted Eye */}
                            <text
                                x="64"
                                y="65"
                                textAnchor="middle"
                                fill="#f59e0b"
                                fontSize="16"
                                fontWeight="bold"
                                filter={`url(#${idPrefix}-amberGlow)`}
                                fontFamily="system-ui, sans-serif"
                            >
                                ?
                            </text>

                            {/* Right Puzzled Flat/Tilted Eye */}
                            <line
                                x1="90"
                                y1="56"
                                x2="102"
                                y2="62"
                                stroke="#f59e0b"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                filter={`url(#${idPrefix}-amberGlow)`}
                            />

                            {/* Wavy Confused Mouth */}
                            <path
                                d="M 73 74 Q 77 71, 80 75 Q 83 79, 87 75"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                fill="none"
                                filter={`url(#${idPrefix}-amberGlow)`}
                            />
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
}

