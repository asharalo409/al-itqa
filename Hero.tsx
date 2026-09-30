import React, { useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Users,
  Compass,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  School,
  Camera,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { T_DICT } from '../data/translations';
import { ClockWidget } from './ClockWidget';

interface HeroProps {
  currentUser: UserProfile | null;
  onSelectTab: (tab: string) => void;
  siteVisuals: { logo: string; cover: string };
  onUpdateSiteVisuals: (visuals: { logo?: string; cover?: string }) => void;
  lang: Language;
  clockSettings?: { type: 'analog' | 'digital' | 'both'; position: 'header' | 'hero' | 'topbar' };
  onToggleClockMode?: (mode: 'analog' | 'digital' | 'both') => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentUser,
  onSelectTab,
  siteVisuals,
  onUpdateSiteVisuals,
  lang,
  clockSettings,
  onToggleClockMode,
}) => {
  const t = T_DICT[lang];
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateSiteVisuals({ cover: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateSiteVisuals({ logo: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[var(--bg-main)] pb-4">
      {/* Hidden file inputs for direct device photo upload */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Visual Cover Banner with Overlay */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-[var(--bg-card)] group">
        <img
          src={siteVisuals.cover || 'cover.jpg'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/cover.svg';
          }}
          alt="Al-Itqan 40 Batch & Islamic University"
          className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-105"
        />

        {/* Gradient overlays for aesthetic depth and contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)]/70 via-transparent to-[var(--bg-main)]/70 pointer-events-none"></div>

        {/* Top Badges & Device Cover Upload Button */}
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-[var(--gold)]/30 text-[11px] text-[var(--gold-light)]">
            <span className="font-arabic text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct File Upload Trigger for Cover Photo */}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-[var(--gold)]/40 text-[11px] text-[var(--gold-light)] font-medium flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              title="নিজের ডিভাইস থেকে কভার ছবি দিন"
            >
              <Camera className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{t.changeCover}</span>
            </button>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-[var(--gold)]/30 text-[11px] text-[var(--gold-light)]">
              <School className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{lang === 'ar' ? 'الجامعة الإسلامية، كوشتيا' : lang === 'en' ? 'IU, Kushtia' : 'কুষ্টিয়া, বাংলাদেশ'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Identity & Calligraphic Centerpiece */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
          {/* Logo with golden glowing ring & Direct Upload Button */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-gradient-to-tr from-[var(--gold)] via-amber-200 to-[var(--gold)] shadow-2xl shadow-amber-950/40 relative">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#1c0710] flex items-center justify-center border border-black/40">
                <img
                  src={siteVisuals.logo || 'logo.jpg'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.svg';
                  }}
                  alt="Al-Itqan 40 Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Direct Upload Trigger on Logo */}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[var(--gold-light)] text-[10px] font-bold transition-opacity backdrop-blur-[2px]"
                title="নিজের ডিভাইস থেকে লোগো ছবি পরিবর্তন করুন"
              >
                <Camera className="w-5 h-5 text-[var(--gold)] mb-0.5" />
                <span>{t.changeLogo}</span>
              </button>
            </div>

            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-amber-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md">
              {t.batch}
            </div>
          </div>

          {/* Titles & Department Bio */}
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-[var(--gold)] font-bold">
                {t.university}
              </span>
              <span className="text-[var(--text-secondary)] opacity-40">·</span>
              <span className="text-xs text-[var(--gold-light)] font-arabic text-sm">
                الإتقان ٤٠
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--gold-light)] tracking-tight">
              {t.title}{' '}
              <span className="text-base sm:text-lg font-normal text-[var(--text-secondary)]">
                | {t.batch}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              {t.dept} · {t.motto}
            </p>
          </div>

          {/* Quick Action Badges & Live Clock Centerpiece */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 sm:pt-0">
            {/* Live Clock Widget (Analog & Digital) */}
            <div className="shrink-0">
              <ClockWidget
                mode={clockSettings?.type || 'both'}
                size="md"
                showDate={true}
                lang={lang}
                onToggleMode={onToggleClockMode}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('routine')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.routine}</span>
              </button>

              <button
                onClick={() => onSelectTab('islamic')}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold-light)] font-medium text-xs hover:bg-[var(--bg-card-subtle)] active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{t.islamic}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
