import React, { useState, useEffect } from 'react';
import {
  Bell,
  Palette,
  Clock,
  ShieldCheck,
  Award,
  User,
  Globe,
  X,
  Trash2,
  Home,
  Check,
  Settings,
  Search,
  MessageSquare,
  LogIn,
} from 'lucide-react';
import { UserProfile, AppNotification, Language } from '../types';
import { DataService } from '../services/supabase';
import { T_DICT } from '../data/translations';
import { ClockWidget } from './ClockWidget';

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenAuth?: () => void;
  onSelectTab: (tab: string) => void;
  urgentText?: string;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  clockSettings?: { type: 'analog' | 'digital' | 'both'; position: 'header' | 'hero' | 'topbar' };
  onToggleClockMode?: (mode: 'analog' | 'digital' | 'both') => void;
}

export const THEMES = [
  {
    name: 'মারুন ও স্বর্ণ (মূল)',
    nameEn: 'Royal Burgundy',
    nameAr: 'القرمزي والذهب',
    bg: '#14050d',
    card: '#220815',
    cardSubtle: '#2d0c1c',
    border: '#4a142c',
    borderLight: '#6a1f3f',
    gold: '#e9b44c',
    goldLight: '#f6d58a',
    accent: '#5a142e',
  },
  {
    name: 'জমজম সবুজ ও গোল্ড',
    nameEn: 'Zamzam Emerald',
    nameAr: 'الزمردي وزمزم',
    bg: '#05140b',
    card: '#0c2214',
    cardSubtle: '#14311e',
    border: '#1a492b',
    borderLight: '#26683e',
    gold: '#52d385',
    goldLight: '#a3f3c4',
    accent: '#17502c',
  },
  {
    name: 'নীলকান্তমণি (স্যাফায়ার)',
    nameEn: 'Midnight Sapphire',
    nameAr: 'الياقوت الأزرق',
    bg: '#060e1a',
    card: '#0c1b30',
    cardSubtle: '#132847',
    border: '#1b3b68',
    borderLight: '#2a5694',
    gold: '#57a4f2',
    goldLight: '#b7d9ff',
    accent: '#184478',
  },
  {
    name: 'অ্যামেথিস্ট পার্পল',
    nameEn: 'Royal Amethyst',
    nameAr: 'الأرجواني الملكي',
    bg: '#110719',
    card: '#1e0e2d',
    cardSubtle: '#2b153f',
    border: '#3c1d58',
    borderLight: '#592c81',
    gold: '#b981f7',
    goldLight: '#e4ccff',
    accent: '#471c6d',
  },
  {
    name: 'অবসিডিয়ান ও গোল্ড',
    nameEn: 'Obsidian Noir',
    nameAr: 'الأسود البركاني',
    bg: '#0b0b0b',
    card: '#161616',
    cardSubtle: '#222222',
    border: '#2e2e2e',
    borderLight: '#444444',
    gold: '#f0b83b',
    goldLight: '#fae19a',
    accent: '#333333',
  },
  {
    name: 'কাবার গিলাফ ও জাফরান',
    nameEn: 'Kiswa Saffron',
    nameAr: 'كسوة الكعبة والزعفران',
    bg: '#0c0a06',
    card: '#18140c',
    cardSubtle: '#262014',
    border: '#42361e',
    borderLight: '#614e2a',
    gold: '#e5ad35',
    goldLight: '#fbe294',
    accent: '#3b2f15',
  },
  {
    name: 'তুর্কি ফিরোজা ও সিলভার',
    nameEn: 'Ottoman Turquoise',
    nameAr: 'الفيروزي العثماني',
    bg: '#041315',
    card: '#092125',
    cardSubtle: '#103137',
    border: '#174850',
    borderLight: '#21636e',
    gold: '#38cbd4',
    goldLight: '#a1f3f7',
    accent: '#114047',
  },
  {
    name: 'মদিনা অলিভ গ্রিন',
    nameEn: 'Madinah Oasis',
    nameAr: 'زيتوني واحة المدينة',
    bg: '#0a1207',
    card: '#142210',
    cardSubtle: '#1c3017',
    border: '#2a4722',
    borderLight: '#3d6732',
    gold: '#8cd462',
    goldLight: '#d2f7bc',
    accent: '#213a1b',
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenProfile,
  onOpenSettings,
  onOpenSearch,
  onOpenAuth,
  onSelectTab,
  urgentText,
  lang,
  onSelectLang,
  clockSettings,
  onToggleClockMode,
}) => {
  const t = T_DICT[lang];
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [showNotif, setShowNotif] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeThemeIdx, setActiveThemeIdx] = useState<number>(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('alitqan_theme_idx');
    if (savedTheme !== null) {
      applyTheme(parseInt(savedTheme, 10));
    }

    const timer = setInterval(() => {
      const now = new Date();
      const locale = lang === 'ar' ? 'ar-SA' : lang === 'bn' ? 'bn-BD' : 'en-GB';
      setCurrentTime(
        now.toLocaleTimeString(locale, {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    }, 1000);

    setNotifications(DataService.getNotifications());
    return () => clearInterval(timer);
  }, [lang]);

  const applyTheme = (idx: number) => {
    const th = THEMES[idx] || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--bg-main', th.bg);
    root.style.setProperty('--bg-card', th.card);
    root.style.setProperty('--bg-card-subtle', th.cardSubtle);
    root.style.setProperty('--border-color', th.border);
    root.style.setProperty('--border-light', th.borderLight);
    root.style.setProperty('--gold', th.gold);
    root.style.setProperty('--gold-light', th.goldLight);
    root.style.setProperty('--accent', th.accent);
    setActiveThemeIdx(idx);
    localStorage.setItem('alitqan_theme_idx', idx.toString());
  };

  const handleClearNotif = () => {
    DataService.clearNotifications();
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-main)]/90 border-b border-[var(--border-color)] transition-colors duration-300">
      {/* Urgent Announcement Marquee */}
      {urgentText && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-800/60 text-red-100 py-1.5 px-4 text-xs font-medium flex items-center overflow-hidden">
          <span className="shrink-0 bg-red-800 text-amber-200 px-2 py-0.5 rounded text-[11px] font-bold mr-2 tracking-wide uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            {lang === 'ar' ? 'تنبيه عاجل' : lang === 'en' ? 'Urgent Notice' : 'জরুরি নোটিশ'}
          </span>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="animate-marquee hover:cursor-pointer" onClick={() => onSelectTab('notice')}>
              {urgentText}
            </div>
          </div>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Left: Home Button & Live Clock */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold-light)] font-bold text-xs transition-colors shrink-0"
            title={t.home}
          >
            <Home className="w-4 h-4 text-[var(--gold)]" />
            <span className="hidden sm:inline">{t.home}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--gold-light)] bg-[var(--bg-card)] border border-[var(--border-color)] px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span className="font-semibold tabular-nums">{currentTime || '...'}</span>
            <span className="text-[var(--text-secondary)] opacity-60">|</span>
            <span className="text-[var(--text-secondary)] truncate">{currentDate}</span>
          </div>

          <button
            onClick={() => {
              if (onToggleClockMode) {
                const next = (clockSettings?.type === 'digital' ? 'analog' : clockSettings?.type === 'analog' ? 'both' : 'digital');
                onToggleClockMode(next);
              }
            }}
            title="ঘড়ির ধরন পরিবর্তন করতে ট্যাপ করুন"
            className="flex items-center gap-1.5 sm:hidden text-xs text-[var(--gold)] active:scale-95 transition-transform"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold tabular-nums">{currentTime}</span>
          </button>
        </div>

        {/* Center Clock Widget (User requested: ঘড়ি মাঝখানে দেওয়া যাবে) */}
        {(clockSettings?.position === 'header' || !clockSettings?.position) && (
          <div className="hidden md:flex items-center justify-center shrink-0">
            <ClockWidget
              mode={clockSettings?.type || 'both'}
              size="sm"
              showDate={false}
              lang={lang}
              onToggleMode={onToggleClockMode}
            />
          </div>
        )}

        {/* Right Action Icons: Search, Language, Theme, Notifications, Settings, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Universal Search Button */}
          <button
            onClick={onOpenSearch}
            title="সার্চ করুন (Search)"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold)] transition-colors flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Search className="w-4 h-4 text-[var(--gold)]" />
            <span className="hidden md:inline font-medium">সার্চ</span>
          </button>

          {/* Quick Chat Shortcut Button */}
          <button
            onClick={() => onSelectTab('chat')}
            title="ব্যাচ চ্যাট (Chat)"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold)] transition-colors flex items-center gap-1.5 text-xs shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-[var(--gold)]" />
            <span className="hidden lg:inline font-medium">চ্যাট</span>
          </button>

          {/* Language Switcher: Bangla | English | Arabic */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold-light)] font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="ভাষা নির্বাচন / Language / اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{lang === 'ar' ? 'العربية' : lang === 'en' ? 'EN' : 'বাংলা'}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    onSelectLang('bn');
                    setShowLangMenu(false);
                  }}
                  className={`w-full p-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                    lang === 'bn' ? 'bg-[var(--accent)] text-[var(--gold-light)] font-bold' : 'hover:bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span>বাংলা</span>
                  {lang === 'bn' && <Check className="w-3.5 h-3.5 text-[var(--gold)]" />}
                </button>
                <button
                  onClick={() => {
                    onSelectLang('en');
                    setShowLangMenu(false);
                  }}
                  className={`w-full p-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                    lang === 'en' ? 'bg-[var(--accent)] text-[var(--gold-light)] font-bold' : 'hover:bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span>English</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-[var(--gold)]" />}
                </button>
                <button
                  onClick={() => {
                    onSelectLang('ar');
                    setShowLangMenu(false);
                  }}
                  className={`w-full p-2 text-right font-arabic text-xs rounded-lg flex items-center justify-between transition-colors ${
                    lang === 'ar' ? 'bg-[var(--accent)] text-[var(--gold-light)] font-bold' : 'hover:bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span>العربية</span>
                  {lang === 'ar' && <Check className="w-3.5 h-3.5 text-[var(--gold)]" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Palette Switcher: 8 Themes */}
          <div className="relative">
            <button
              onClick={() => setShowPalette(!showPalette)}
              title={t.themePicker}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold)] transition-colors flex items-center gap-1 text-xs"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline font-medium">
                {THEMES[activeThemeIdx].nameEn.split(' ')[0]}
              </span>
            </button>

            {showPalette && (
              <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-semibold text-[var(--gold-light)] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[var(--gold)]" />
                    {t.themePicker} (৮টি থিম)
                  </span>
                  <button onClick={() => setShowPalette(false)} className="text-[var(--text-secondary)] hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {THEMES.map((th, idx) => (
                    <button
                      key={th.nameEn}
                      onClick={() => {
                        applyTheme(idx);
                        setShowPalette(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-all ${
                        activeThemeIdx === idx
                          ? 'bg-[var(--accent)] text-[var(--gold-light)] font-bold ring-1 ring-[var(--gold)]'
                          : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: th.gold }}
                        ></span>
                        <span>{lang === 'ar' ? th.nameAr : lang === 'en' ? th.nameEn : th.name}</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.bg }}></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              title="নোটিফিকেশন"
              className="relative p-1.5 sm:p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold)] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-bold text-[var(--gold-light)] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[var(--gold)]" />
                    নোটিফিকেশন ({notifications.length})
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotif}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      সব মুছুন
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg bg-[var(--bg-main)]/60 border border-[var(--border-color)]/60 text-xs hover:border-[var(--gold)] transition-colors"
                      >
                        <p className="text-[var(--text-primary)] font-medium leading-relaxed">{n.text}</p>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-1 block opacity-75">
                          {new Date(n.created_at).toLocaleTimeString('bn-BD', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-6 text-[var(--text-secondary)]">কোনো নতুন নোটিফিকেশন নেই</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings & Customization Button */}
          <button
            onClick={onOpenSettings}
            title={t.settings}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold)] transition-colors flex items-center gap-1 text-xs"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline font-medium">সেটিংস</span>
          </button>

          {/* Login / Switch Account Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              title="লগইন / অ্যাকাউন্ট পরিবর্তন"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--accent)] border border-[var(--gold)]/40 hover:border-[var(--gold)] text-[var(--gold-light)] font-bold transition-all flex items-center gap-1 text-xs shrink-0 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span className="hidden xl:inline">লগইন</span>
            </button>
          )}

          {/* User Profile / Role Pill Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-left transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-700 text-[#14050d] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-[var(--gold-light)]">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(currentUser?.name || 'আল')[0]}</span>
              )}
            </div>

            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-bold text-[var(--gold-light)] group-hover:text-white transition-colors truncate max-w-[110px]">
                {currentUser?.name || 'শিক্ষার্থী'}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                {currentUser?.role === 'admin' ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> {t.admin}
                  </span>
                ) : currentUser?.role === 'cr' ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5" /> {t.cr}
                  </span>
                ) : (
                  <span>{t.member}</span>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
