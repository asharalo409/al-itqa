import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Compass,
  BookOpen,
  Volume2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Heart,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getIslamicUniversityPrayerTimes, formatTimeBn } from '../utils/prayerTimes';
import { DAILY_AYAH_LIST } from '../data/initialData';

export const PRAYER_NAMES: { key: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'; label: string; icon: string }[] = [
  { key: 'fajr', label: 'ফজর', icon: '🌅' },
  { key: 'sunrise', label: 'সূর্যোদয়', icon: '☀️' },
  { key: 'dhuhr', label: 'যোহর', icon: '☀️' },
  { key: 'asr', label: 'আসর', icon: '🌤️' },
  { key: 'maghrib', label: 'মাগরিব', icon: '🌇' },
  { key: 'isha', label: 'এশা', icon: '🌌' },
];

export const TASBIH_PRESETS = [
  { arabic: 'سُبْحَانَ اللَّهِ', bangla: 'সুবহানাল্লাহ', target: 33 },
  { arabic: 'الْحَمْدُ لِلَّهِ', bangla: 'আলহামদুলিল্লাহ', target: 33 },
  { arabic: 'اللَّهُ أَكْبَرُ', bangla: 'আল্লাহু আকবার', target: 34 },
  { arabic: 'أَسْتَغْفِرُ اللَّهَ', bangla: 'আস্তাগফিরুল্লাহ', target: 100 },
  { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', bangla: 'লা ইলাহা ইল্লাল্লাহ', target: 100 },
  { arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', bangla: 'দরূদ শরীফ', target: 100 },
];

export const SELECTED_DUAS = [
  {
    title: 'জ্ঞান বৃদ্ধির কুরআন নির্দেশিত দোয়া',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    pronunciation: 'রব্বি যিদনী ইলমা',
    meaning: 'হে আমার রব! আমার জ্ঞান বৃদ্ধি করে দিন। (সূরা ত্বা-হা: ১১৪)',
  },
  {
    title: 'কঠিন কাজ সহজ হওয়ার দোয়া',
    arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
    pronunciation: 'আল্লাহুম্মা লা সাহলা ইল্লা মা জাআলতাহু সাহলা, ওয়া আনতা তাজআলুল হাযনা ইযা শিইতা সাহলা।',
    meaning: 'হে আল্লাহ! আপনি যা সহজ করেছেন তা ছাড়া কোনো কিছুই সহজ নয়। আর আপনি চাইলে যেকোনো কঠিন বিষয়কে সহজ করে দেন। (সহীহ ইবনে হিব্বান)',
  },
  {
    title: 'পরীক্ষা ও বক্তৃতার পূর্বে মানসিক প্রশান্তির দোয়া',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    pronunciation: 'রব্বিশ রহলী সদরী, ওয়া ইয়াসসির লী আমরী, ওয়াহলুল উকদাতাম মিল্লিসানী, ইয়াফক্বাহু ক্বওলী।',
    meaning: 'হে আমার পালনকর্তা! আমার বক্ষ প্রশস্ত করে দিন, আমার কাজ সহজ করুন এবং আমার জিহ্বার জড়তা দূর করে দিন যাতে তারা আমার কথা বুঝতে পারে। (সূরা ত্বা-হা: ২৫-২৮)',
  },
];

export const IslamicHub: React.FC = () => {
  const [prayerData, setPrayerData] = useState(getIslamicUniversityPrayerTimes());
  const [ayahIdx, setAyahIdx] = useState<number>(0);
  const [tasbihIdx, setTasbihIdx] = useState<number>(0);
  const [tasbihCount, setTasbihCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('alitqan_tasbih_cnt') || '0', 10);
  });
  const [totalTasbih, setTotalTasbih] = useState<number>(() => {
    return parseInt(localStorage.getItem('alitqan_tasbih_total') || '0', 10);
  });
  const [quranJuzDone, setQuranJuzDone] = useState<number>(() => {
    return parseInt(localStorage.getItem('alitqan_quran_juz') || '1', 10);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(getIslamicUniversityPrayerTimes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleTasbihClick = () => {
    const nextCount = tasbihCount + 1;
    const nextTotal = totalTasbih + 1;
    setTasbihCount(nextCount);
    setTotalTasbih(nextTotal);
    localStorage.setItem('alitqan_tasbih_cnt', nextCount.toString());
    localStorage.setItem('alitqan_tasbih_total', nextTotal.toString());

    // Gentle tactile feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleResetTasbih = () => {
    setTasbihCount(0);
    localStorage.setItem('alitqan_tasbih_cnt', '0');
  };

  const currentAyah = DAILY_AYAH_LIST[ayahIdx] || DAILY_AYAH_LIST[0];
  const activeTasbih = TASBIH_PRESETS[tasbihIdx] || TASBIH_PRESETS[0];

  return (
    <div className="space-y-4">
      {/* Prayer Times Section for Islamic University Campus */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--gold)]/40 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--gold)]" />
              <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)]">
                ইসলামী বিশ্ববিদ্যালয় (কুষ্টিয়া) নামাজের সময়সূচি
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              হানাফী আসর ও ইসলামিক ইউনিভার্সিটি ক্যাম্পাস জোন (২৩.৭২° উত্তর, ৮৯.১৫° পূর্ব)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent)] border border-[var(--gold)]/30 text-xs">
            <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>পরবর্তী নামাজ: <strong className="text-white">{prayerData.nextPrayer.nameBn}</strong></span>
            <span className="text-[var(--gold-light)] font-bold">({prayerData.nextPrayer.remainingFormatted} বাকি)</span>
          </div>
        </div>

        {/* Prayer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRAYER_NAMES.map((p) => {
            const timeVal = prayerData[p.key];
            const isNext = prayerData.nextPrayer.nameBn === p.label;

            return (
              <div
                key={p.key}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isNext
                    ? 'bg-gradient-to-b from-[var(--accent)] to-[var(--bg-card)] border-[var(--gold)] shadow-md ring-1 ring-[var(--gold)]'
                    : 'bg-[var(--bg-main)]/60 border-[var(--border-color)] hover:border-[var(--border-light)]'
                }`}
              >
                <div className="text-lg mb-1">{p.icon}</div>
                <div className="text-xs font-semibold text-[var(--text-secondary)]">{p.label}</div>
                <div className="text-sm sm:text-base font-extrabold text-[var(--gold-light)] mt-0.5 tabular-nums">
                  {formatTimeBn(timeVal)}
                </div>
                {isNext && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded">
                    আসন্ন
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-[var(--border-color)]/50 flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>🌙 শেষ তাহাজ্জুদ ও সাহরির শেষ সময়: <strong className="text-[var(--gold-light)]">{formatTimeBn(prayerData.tahajjudEnd)}</strong></span>
          <span>ইফতার ও মাগরিব: <strong className="text-[var(--gold-light)]">{formatTimeBn(prayerData.maghrib)}</strong></span>
        </div>
      </div>

      {/* Daily Ayah & Tadabbur Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[#1f0714] to-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--gold)]" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--gold-light)]">
              আজকের আয়াত ও তাদাব্বুর (কুরআনিক দর্শন)
            </h3>
          </div>

          <button
            onClick={() => setAyahIdx((prev) => (prev + 1) % DAILY_AYAH_LIST.length)}
            className="text-xs text-[var(--gold-light)] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>পরের আয়াত</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center space-y-3 py-2">
          {/* Calligraphic Arabic */}
          <div className="font-arabic text-2xl sm:text-3xl text-amber-200 leading-loose py-1 selection:bg-amber-900/50">
            {currentAyah.arabic}
          </div>

          {/* Bengali Translation */}
          <div className="text-sm sm:text-base text-white font-medium max-w-2xl mx-auto leading-relaxed">
            "{currentAyah.bengali}"
          </div>

          {/* Reference */}
          <div className="text-xs text-[var(--gold)] font-semibold">
            — {currentAyah.surah}
          </div>

          {/* Tadabbur Insight */}
          <div className="mt-3 p-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--border-color)] text-xs text-[var(--text-secondary)] text-left leading-relaxed">
            <span className="font-bold text-[var(--gold-light)] mr-1">💡 তাদাব্বুর ও শিক্ষা:</span>
            {currentAyah.lesson}
          </div>
        </div>
      </div>

      {/* Digital Tasbih & Quran Reading Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Digital Tasbih */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                ডিজিটাল তাসবীহ কাউন্টার
              </h3>
              <button
                onClick={handleResetTasbih}
                title="রিসেট"
                className="text-xs text-[var(--text-secondary)] hover:text-red-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> রিসেট
              </button>
            </div>

            {/* Presets selector */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
              {TASBIH_PRESETS.map((p, idx) => (
                <button
                  key={p.bangla}
                  onClick={() => {
                    setTasbihIdx(idx);
                    setTasbihCount(0);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                    tasbihIdx === idx
                      ? 'bg-[var(--gold)] text-black font-bold'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
                  }`}
                >
                  {p.bangla}
                </button>
              ))}
            </div>

            <div className="text-center my-3">
              <div className="font-arabic text-xl sm:text-2xl text-amber-200">
                {activeTasbih.arabic}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                লক্ষ্যমাত্রা: {activeTasbih.target.toLocaleString('bn-BD')} বার
              </div>
            </div>
          </div>

          {/* Interactive Tap Button */}
          <div className="flex flex-col items-center justify-center my-2">
            <button
              onClick={handleTasbihClick}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[var(--accent)] via-amber-900 to-[var(--gold)] text-white font-extrabold text-3xl sm:text-4xl shadow-xl shadow-amber-950/50 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-[var(--gold)]/40 group select-none"
            >
              <span className="tabular-nums drop-shadow-md">
                {tasbihCount.toLocaleString('bn-BD')}
              </span>
              <span className="text-[10px] text-amber-200 font-normal tracking-wide uppercase opacity-80 group-hover:opacity-100">
                ক্লিক করুন
              </span>
            </button>

            <div className="text-xs text-[var(--text-secondary)] mt-3">
              আজকের সর্বমোট তাসবীহ: <strong className="text-[var(--gold-light)]">{totalTasbih.toLocaleString('bn-BD')}</strong>
            </div>
          </div>
        </div>

        {/* Daily Selected Duas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3">
          <div className="pb-2 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              শিক্ষার্থীদের নির্বাচিত মাসনূন দোয়া
            </h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {SELECTED_DUAS.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-1.5"
              >
                <div className="text-xs font-bold text-[var(--gold)]">{d.title}</div>
                <div className="font-arabic text-base text-amber-200 leading-relaxed text-right">
                  {d.arabic}
                </div>
                <div className="text-xs text-[var(--text-primary)] font-medium">
                  {d.pronunciation}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {d.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
