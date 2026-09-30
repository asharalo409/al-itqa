import React, { useState, useEffect, useRef, useId } from 'react';
import { Clock, Sparkles, Settings2, Palette, Check } from 'lucide-react';
import { Language } from '../types';

export type ClockTheme = 'gold' | 'emerald' | 'kiswa' | 'sapphire';

interface ClockWidgetProps {
  mode?: 'analog' | 'digital' | 'both';
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
  lang?: Language;
  theme?: ClockTheme;
  onToggleMode?: (newMode: 'analog' | 'digital' | 'both') => void;
  onSelectTheme?: (theme: ClockTheme) => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const THEME_CONFIGS: Record<
  ClockTheme,
  {
    nameBn: string;
    bezelOuter: string;
    bezelInner: string;
    dialBg: string;
    dialGradCenter: string;
    dialGradEdge: string;
    goldTone: string;
    goldLight: string;
    secHand: string;
    patternOpacity: number;
  }
> = {
  gold: {
    nameBn: 'খাঁটি স্বর্ণ ও মারুন (Royal Burgundy)',
    bezelOuter: '#d4af37',
    bezelInner: '#f3e5ab',
    dialBg: '#180611',
    dialGradCenter: '#3d1029',
    dialGradEdge: '#0e020a',
    goldTone: '#e5ad35',
    goldLight: '#fbe294',
    secHand: '#ef4444',
    patternOpacity: 0.18,
  },
  emerald: {
    nameBn: 'মদিনা সবুজ ও সোনা (Madinah Oasis)',
    bezelOuter: '#22c55e',
    bezelInner: '#86efac',
    dialBg: '#051b11',
    dialGradCenter: '#0b3823',
    dialGradEdge: '#020b07',
    goldTone: '#4ade80',
    goldLight: '#bbf7d0',
    secHand: '#f59e0b',
    patternOpacity: 0.22,
  },
  kiswa: {
    nameBn: 'কাবার গিলাফ কালো ও জাফরান (Holy Kiswa)',
    bezelOuter: '#eab308',
    bezelInner: '#fef08a',
    dialBg: '#0a0a0a',
    dialGradCenter: '#1f1f1f',
    dialGradEdge: '#050505',
    goldTone: '#fbbf24',
    goldLight: '#fef3c7',
    secHand: '#e11d48',
    patternOpacity: 0.25,
  },
  sapphire: {
    nameBn: 'রয়েল ফিরোজা ও সিলভার (Ottoman Blue)',
    bezelOuter: '#38bdf8',
    bezelInner: '#bae6fd',
    dialBg: '#081726',
    dialGradCenter: '#0f2e4d',
    dialGradEdge: '#030a12',
    goldTone: '#38bdf8',
    goldLight: '#e0f2fe',
    secHand: '#f43f5e',
    patternOpacity: 0.2,
  },
};

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  mode = 'both',
  size = 'md',
  showDate = true,
  lang = 'bn',
  theme = 'gold',
  onToggleMode,
  onSelectTheme,
  onOpenSettings,
  className = '',
}) => {
  const rawId = useId();
  const instanceId = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const handGoldGradId = `handGoldGrad-${instanceId}`;

  const [time, setTime] = useState(new Date());
  const [activeTheme, setActiveTheme] = useState<ClockTheme>(() => {
    return (localStorage.getItem('alitqan_clock_theme') as ClockTheme) || theme;
  });
  const bezelGradId = `bezelGrad-${activeTheme}-${instanceId}`;
  const dialGradId = `dialGrad-${activeTheme}-${instanceId}`;
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowConfigMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleThemeChange = (newTheme: ClockTheme) => {
    setActiveTheme(newTheme);
    localStorage.setItem('alitqan_clock_theme', newTheme);
    if (onSelectTheme) onSelectTheme(newTheme);
  };

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const millis = time.getMilliseconds();

  // Angle calculations for smooth / ticking hands
  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  // Number conversions for languages
  const toBnDigits = (n: number | string) => {
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n)
      .split('')
      .map((d) => bn[parseInt(d, 10)] ?? d)
      .join('');
  };

  const toArDigits = (n: number | string) => {
    const ar = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n)
      .split('')
      .map((d) => ar[parseInt(d, 10)] ?? d)
      .join('');
  };

  const formatDigits = (n: number | string) => {
    if (lang === 'ar') return toArDigits(n);
    if (lang === 'bn') return toBnDigits(n);
    return String(n);
  };

  // Formatted digital time
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  const ampm =
    hours >= 12
      ? lang === 'ar'
        ? 'م'
        : lang === 'bn'
        ? 'অপরাহ্ন'
        : 'PM'
      : lang === 'ar'
      ? 'ص'
      : lang === 'bn'
      ? 'পূর্বাহ্ন'
      : 'AM';

  const formattedHours = formatDigits(pad(displayHours));
  const formattedMinutes = formatDigits(pad(minutes));
  const formattedSeconds = formatDigits(pad(seconds));

  // Date strings
  const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const MONTHS_BN = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];

  const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const MONTHS_AR = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  const dayOfWeek =
    lang === 'ar'
      ? DAYS_AR[time.getDay()]
      : lang === 'bn'
      ? DAYS_BN[time.getDay()]
      : time.toLocaleDateString('en-US', { weekday: 'long' });

  const dateStr =
    lang === 'ar'
      ? `${formatDigits(time.getDate())} ${MONTHS_AR[time.getMonth()]} ${formatDigits(time.getFullYear())}`
      : lang === 'bn'
      ? `${formatDigits(time.getDate())} ${MONTHS_BN[time.getMonth()]}, ${formatDigits(time.getFullYear())}`
      : time.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // Hijri Date
  const getHijriString = (): string => {
    try {
      if (lang === 'ar') {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(time);
      }
      if (lang === 'bn') {
        const hijriEn = new Intl.DateTimeFormat('bn-BD-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(time);
        return hijriEn;
      }
      return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(time);
    } catch {
      return lang === 'ar' ? '١٤٤٨ هـ' : '১৪৪৮ হিজরি';
    }
  };

  const hijriStr = getHijriString();
  const cfg = THEME_CONFIGS[activeTheme] || THEME_CONFIGS.gold;

  // Dial Sizing
  // Header size is sm: 38px (fits h-14 header perfectly!)
  // md size is 74px
  // lg size is 114px (grand centerpiece)
  const dialPx = size === 'sm' ? 38 : size === 'lg' ? 114 : 74;

  return (
    <div
      ref={menuRef}
      className={`relative inline-flex items-center gap-2.5 sm:gap-3.5 ${
        size === 'sm' ? 'p-1 sm:p-1.5' : size === 'lg' ? 'p-4 sm:p-5' : 'p-2.5 sm:p-3.5'
      } rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card-subtle)] to-[var(--bg-card)] border border-[var(--gold)]/40 shadow-xl select-none transition-all group ${className}`}
    >
      {/* Quick Config / Theme / Mode Trigger Button */}
      <div className="absolute -top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={() => setShowConfigMenu(!showConfigMenu)}
          title="ঘড়ির ডিজাইন, থিম ও মোড পরিবর্তন করুন"
          className="px-2 py-0.5 rounded-full bg-[var(--bg-main)] border border-[var(--gold)]/60 text-[9px] font-bold text-[var(--gold-light)] hover:bg-[var(--accent)] hover:border-[var(--gold)] transition-all shadow-md flex items-center gap-1 backdrop-blur-sm"
        >
          <Sparkles className="w-2.5 h-2.5 text-[var(--gold)] animate-spin-slow" />
          <span>
            {mode === 'analog'
              ? 'এনালগ'
              : mode === 'digital'
              ? 'ডিজিটাল'
              : 'উভয় ঘড়ি'}
          </span>
          <Settings2 className="w-2.5 h-2.5 text-[var(--gold-light)] ml-0.5" />
        </button>
      </div>

      {/* Floating Theme & Mode Dropdown Popover */}
      {showConfigMenu && (
        <div className="absolute top-7 right-0 w-64 bg-[var(--bg-card)] border border-[var(--gold)]/60 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-xs space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
            <span className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
              ঘড়ির কাস্টমাইজেশন
            </span>
            {onOpenSettings && (
              <button
                onClick={() => {
                  setShowConfigMenu(false);
                  onOpenSettings();
                }}
                className="text-[10px] text-[var(--gold)] hover:underline"
              >
                পূর্ণ সেটিংস
              </button>
            )}
          </div>

          {/* Mode Switcher */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
              প্রদর্শনের ধরন (Clock Mode):
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'both', label: 'উভয়' },
                { id: 'analog', label: 'এনালগ' },
                { id: 'digital', label: 'ডিজিটাল' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (onToggleMode) onToggleMode(m.id as any);
                    setShowConfigMenu(false);
                  }}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    mode === m.id
                      ? 'bg-[var(--gold)] text-black border-[var(--gold)] shadow-sm'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Luxury Themes */}
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-[var(--gold)]" />
              ডায়াল ও থিম (Dial Palette):
            </label>
            <div className="space-y-1">
              {(Object.keys(THEME_CONFIGS) as ClockTheme[]).map((thmKey) => {
                const item = THEME_CONFIGS[thmKey];
                const isActive = activeTheme === thmKey;
                return (
                  <button
                    key={thmKey}
                    onClick={() => handleThemeChange(thmKey)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-xl border text-[10px] transition-all ${
                      isActive
                        ? 'bg-[var(--accent)] border-[var(--gold)] text-white font-bold'
                        : 'bg-[var(--bg-main)]/60 border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:border-[var(--gold)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner shrink-0"
                        style={{ backgroundColor: item.bezelOuter }}
                      />
                      <span className="truncate">{item.nameBn}</span>
                    </div>
                    {isActive && <Check className="w-3 h-3 text-[var(--gold)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 1. ANALOG CLOCK DIAL ==================== */}
      {(mode === 'analog' || mode === 'both') && (
        <div
          className="relative flex items-center justify-center shrink-0 cursor-pointer"
          style={{ width: dialPx, height: dialPx }}
          onClick={() => {
            if (onToggleMode) {
              const next: 'analog' | 'digital' | 'both' = mode === 'both' ? 'analog' : 'both';
              onToggleMode(next);
            }
          }}
          title="ক্লিক করে মোড বদলান"
        >
          {/* Outer Bezel Shadow Ring */}
          <div
            className="absolute inset-0 rounded-full shadow-2xl pointer-events-none"
            style={{
              boxShadow: `0 4px 14px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)`,
            }}
          />

          <svg
            width={dialPx}
            height={dialPx}
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md select-none overflow-visible"
          >
            <defs>
              {/* Outer Golden Knurled Bezel Gradient */}
              <linearGradient id={bezelGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.bezelInner} />
                <stop offset="30%" stopColor={cfg.bezelOuter} />
                <stop offset="70%" stopColor="#785012" />
                <stop offset="100%" stopColor={cfg.bezelInner} />
              </linearGradient>

              {/* Dial Radial Sunburst Gradient */}
              <radialGradient id={dialGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={cfg.dialGradCenter} />
                <stop offset="65%" stopColor={cfg.dialBg} />
                <stop offset="100%" stopColor={cfg.dialGradEdge} />
              </radialGradient>

              {/* Hand Specular Shading */}
              <linearGradient id={handGoldGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="50%" stopColor={cfg.goldTone} />
                <stop offset="100%" stopColor="#9a6e18" />
              </linearGradient>
            </defs>

            {/* 1. Outer Metallic Bezel */}
            <circle
              cx="50"
              cy="50"
              r="49"
              fill={`url(#${bezelGradId})`}
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="0.8"
            />

            {/* 2. Stepped Bezel Rim */}
            <circle
              cx="50"
              cy="50"
              r="46.5"
              fill={cfg.dialGradEdge}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
            />

            {/* 3. Main Dial Plate */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill={`url(#${dialGradId})`}
            />

            {/* 4. Subtle Islamic 8-Point Geometric Star Tessellation */}
            {size !== 'sm' && (
              <g opacity={cfg.patternOpacity} stroke={cfg.goldTone} strokeWidth="0.5" fill="none">
                <rect x="26" y="26" width="48" height="48" rx="2" />
                <rect x="26" y="26" width="48" height="48" rx="2" transform="rotate(45 50 50)" />
                <circle cx="50" cy="50" r="14" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
              </g>
            )}

            {/* 5. 60 Minute / Second Precision Track */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const isCardinal = i % 15 === 0;
              if (size === 'sm' && !isMajor) return null; // keep clean on small size
              return (
                <line
                  key={i}
                  x1="50"
                  y1={isCardinal ? '7.5' : isMajor ? '8.5' : '10'}
                  x2="50"
                  y2={isCardinal ? '13' : isMajor ? '12' : '11'}
                  stroke={isMajor ? cfg.goldLight : 'rgba(255,255,255,0.35)'}
                  strokeWidth={isCardinal ? '1.8' : isMajor ? '1.2' : '0.5'}
                  strokeLinecap="round"
                  transform={`rotate(${i * 6} 50 50)`}
                />
              );
            })}

            {/* 6. Cardinal Numerals (12, 3, 6, 9) */}
            <text
              x="50"
              y="20.5"
              fill={cfg.goldLight}
              fontSize={size === 'sm' ? '8' : size === 'lg' ? '9.5' : '8.5'}
              fontWeight="900"
              textAnchor="middle"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
            >
              {lang === 'ar' ? '١٢' : lang === 'bn' ? '১২' : '12'}
            </text>

            <text
              x="81.5"
              y="53"
              fill={cfg.goldLight}
              fontSize={size === 'sm' ? '8' : size === 'lg' ? '9.5' : '8.5'}
              fontWeight="900"
              textAnchor="middle"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
            >
              {lang === 'ar' ? '٣' : lang === 'bn' ? '৩' : '3'}
            </text>

            <text
              x="50"
              y="85"
              fill={cfg.goldLight}
              fontSize={size === 'sm' ? '8' : size === 'lg' ? '9.5' : '8.5'}
              fontWeight="900"
              textAnchor="middle"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
            >
              {lang === 'ar' ? '٦' : lang === 'bn' ? '৬' : '6'}
            </text>

            <text
              x="18.5"
              y="53"
              fill={cfg.goldLight}
              fontSize={size === 'sm' ? '8' : size === 'lg' ? '9.5' : '8.5'}
              fontWeight="900"
              textAnchor="middle"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
            >
              {lang === 'ar' ? '٩' : lang === 'bn' ? '৯' : '9'}
            </text>

            {/* Batch Inscription */}
            {size === 'lg' && (
              <text
                x="50"
                y="34"
                fill={cfg.goldTone}
                fontSize="5"
                fontWeight="bold"
                textAnchor="middle"
                opacity="0.85"
                className="font-arabic"
              >
                الإتقان ٤٠
              </text>
            )}

            {/* 7. Hour Hand (Faceted Gold Sword Hand) */}
            <g transform={`rotate(${hourDeg} 50 50)`}>
              {/* Drop shadow */}
              <line
                x1="51"
                y1="54"
                x2="51"
                y2="25"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <line
                x1="50"
                y1="53"
                x2="50"
                y2="25"
                stroke={`url(#${handGoldGradId})`}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {/* Luminous Inner Core */}
              <line
                x1="50"
                y1="46"
                x2="50"
                y2="27"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* 8. Minute Hand (Slender Tapered Sword Hand) */}
            <g transform={`rotate(${minuteDeg} 50 50)`}>
              {/* Drop shadow */}
              <line
                x1="51"
                y1="56"
                x2="51"
                y2="15"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <line
                x1="50"
                y1="55"
                x2="50"
                y2="15"
                stroke={`url(#${handGoldGradId})`}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Luminous Core */}
              <line
                x1="50"
                y1="48"
                x2="50"
                y2="17"
                stroke="#ffffff"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>

            {/* 9. Second Hand (Crimson Needle with Crescent Star Counterweight) */}
            <g transform={`rotate(${secondDeg} 50 50)`}>
              {/* Balance tail shadow */}
              <line
                x1="50"
                y1="64"
                x2="50"
                y2="10"
                stroke={cfg.secHand}
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              {/* Crescent Counterweight Circle */}
              <circle cx="50" cy="59" r="2.8" fill={cfg.goldTone} stroke={cfg.secHand} strokeWidth="0.7" />
              {/* Front pointer dot */}
              <circle cx="50" cy="18" r="1.3" fill={cfg.secHand} />
            </g>

            {/* 10. Center Jewel & Cap */}
            <circle cx="50" cy="50" r="3.6" fill={cfg.goldTone} stroke="#000" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="2.2" fill={cfg.secHand} />
            <circle cx="49.2" cy="49.2" r="0.8" fill="#ffffff" opacity="0.8" />

            {/* 11. Curved Sapphire Glass Reflection Arc */}
            <path
              d="M 18,34 Q 50,14 82,34 Q 50,23 18,34 Z"
              fill="rgba(255, 255, 255, 0.15)"
              className="pointer-events-none"
            />
          </svg>
        </div>
      )}

      {/* ==================== 2. DIGITAL CLOCK & CALENDAR ==================== */}
      {(mode === 'digital' || mode === 'both') && (
        <div className="flex flex-col justify-center min-w-0 pr-1">
          {/* Live Digits with Glowing Gold */}
          <div className="flex items-baseline gap-1 font-mono tracking-tight text-white leading-none">
            <span
              className={`font-black text-white ${
                size === 'sm'
                  ? 'text-base sm:text-lg'
                  : size === 'lg'
                  ? 'text-3xl sm:text-4xl'
                  : 'text-xl sm:text-2xl'
              }`}
              style={{
                textShadow: `0 0 16px ${cfg.goldTone}60`,
                color: cfg.goldLight,
              }}
            >
              {formattedHours}
            </span>

            <span className="text-base font-bold text-[var(--gold)] animate-pulse">:</span>

            <span
              className={`font-black text-white ${
                size === 'sm'
                  ? 'text-base sm:text-lg'
                  : size === 'lg'
                  ? 'text-3xl sm:text-4xl'
                  : 'text-xl sm:text-2xl'
              }`}
              style={{
                textShadow: `0 0 16px ${cfg.goldTone}60`,
                color: cfg.goldLight,
              }}
            >
              {formattedMinutes}
            </span>

            <span className="text-xs font-bold text-[var(--gold)] animate-pulse">:</span>

            <span
              className={`font-bold ${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
              }`}
              style={{ color: cfg.secHand }}
            >
              {formattedSeconds}
            </span>

            <span className="ml-1 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--gold-light)] uppercase tracking-wider">
              {ampm}
            </span>
          </div>

          {/* Gregorian & Hijri Dates */}
          {showDate && (
            <div className="mt-1 space-y-0.5 text-[10px] sm:text-[11px] leading-tight text-[var(--text-secondary)]">
              <div className="flex items-center gap-1 font-medium truncate">
                <span className="text-[var(--gold-light)] font-bold">{dayOfWeek}</span>
                <span>•</span>
                <span className="truncate">{dateStr}</span>
              </div>

              {/* Islamic Hijri Calendar (Special for Quran & Islamic Studies students) */}
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold truncate">
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60 font-bold shrink-0">
                  হিজরি
                </span>
                <span className="truncate opacity-95">{hijriStr}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
