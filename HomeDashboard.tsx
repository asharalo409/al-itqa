import React from 'react';
import {
  Bell,
  Calendar,
  CheckSquare,
  Compass,
  GraduationCap,
  FolderDown,
  MessageSquare,
  Users,
  Heart,
  MessageCircleQuestion,
  Calculator,
  Wallet,
  Camera,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Award,
  Vote,
  HandHeart,
  Search,
  Settings,
} from 'lucide-react';
import { Notice, RoutineItem, Teacher, UserProfile, Language, Poll } from '../types';
import { T_DICT } from '../data/translations';
import { getAppDayIndex, DAYS_BN, formatHhmmToBn, parseTimeToMinutes } from './RoutineRadar';
import { getIslamicUniversityPrayerTimes, formatTimeBn } from '../utils/prayerTimes';
import { DAILY_AYAH_LIST } from '../data/initialData';
import { PollsWidget } from './PollsWidget';
import { ClockWidget } from './ClockWidget';

interface HomeDashboardProps {
  notices: Notice[];
  routine: RoutineItem[];
  teachers: Teacher[];
  members: UserProfile[];
  currentUser: UserProfile | null;
  onNavigate: (tabId: string) => void;
  lang: Language;
  polls?: Poll[];
  onRefreshPolls?: () => void;
  onOpenSearch?: () => void;
  clockSettings?: { type: 'analog' | 'digital' | 'both'; position: 'header' | 'hero' | 'topbar' };
  onToggleClockMode?: (mode: 'analog' | 'digital' | 'both') => void;
  dashboardFeatures?: string[];
  onOpenCustomizer?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  notices,
  routine,
  teachers,
  members,
  currentUser,
  onNavigate,
  lang,
  polls = [],
  onRefreshPolls = () => {},
  onOpenSearch = () => {},
  clockSettings,
  onToggleClockMode,
  dashboardFeatures,
  onOpenCustomizer,
}) => {
  const t = T_DICT[lang];
  const currentAppDay = getAppDayIndex();
  const prayerData = getIslamicUniversityPrayerTimes();
  const todayClasses = routine.filter((r) => r.day === currentAppDay);
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

  // Find running class
  let runningClass: RoutineItem | null = null;
  for (const item of todayClasses) {
    const sMin = parseTimeToMinutes(item.start_time);
    const eMin = parseTimeToMinutes(item.end_time);
    if (sMin !== null && eMin !== null && nowMins >= sMin && nowMins < eMin) {
      runningClass = item;
      break;
    }
  }

  const isAdmin = currentUser?.role === 'admin';
  const isCr = currentUser?.role === 'cr';

  const FEATURE_PORTALS = [
    {
      id: 'routine',
      title: t.routine,
      desc: lang === 'ar' ? 'مواعيد المحاضرات اليومية والأسبوعية ورادار الحصص المباشر' : 'সাপ্তাহিক ক্লাসের সময়সূচি, রুম ও শিক্ষক তালিকা',
      icon: Calendar,
      color: 'from-amber-600/30 to-amber-950/60 border-amber-600/40 text-amber-300',
      badge: `${todayClasses.length}টি ক্লাস আজ`,
    },
    {
      id: 'notice',
      title: t.notice,
      desc: lang === 'ar' ? 'الإعلانات الأكاديمية والواجبات والاختبارات والتنبيهات' : 'মিডটার্ম, অ্যাসাইনমেন্ট ডেডলাইন ও জরুরি বিজ্ঞপ্তি',
      icon: Bell,
      color: 'from-red-600/30 to-red-950/60 border-red-600/40 text-red-300',
      badge: `${notices.length}টি নোটিশ`,
    },
    {
      id: 'islamic',
      title: t.islamic,
      desc: lang === 'ar' ? 'مواقيت الصلاة بالحرم الجامعي، الآية اليومية، والمسبحة الإلكترونية' : 'ইবি ক্যাম্পাসের নামাজের সময়সূচি, তাসবীহ ও কুরআনিক তাদাব্বুর',
      icon: Compass,
      color: 'from-emerald-600/30 to-emerald-950/60 border-emerald-600/40 text-emerald-300',
      badge: 'কুষ্টিয়া ক্যাম্পাস',
    },
    {
      id: 'teachers',
      title: t.teachers,
      desc: lang === 'ar' ? 'دليل أساتذة قسم القرآن الكريم وأرقام التواصل وأوقات الساعات المكتبية' : 'সম্মানিত উস্তাজগণের প্রোফাইল, কোর্স ও যোগাযোগের তথ্য',
      icon: GraduationCap,
      color: 'from-purple-600/30 to-purple-950/60 border-purple-600/40 text-purple-300',
      badge: `${teachers.length}জন শিক্ষক`,
    },
    {
      id: 'planner',
      title: t.planner,
      desc: lang === 'ar' ? 'تنظيم ساعات المذاكرة والواجبات والأهداف اليومية' : 'দৈনিক পড়াশোনা ও কাজের রুটিন, লক্ষ্যমাত্রা ও ট্র্যাকার',
      icon: CheckSquare,
      color: 'from-blue-600/30 to-blue-950/60 border-blue-600/40 text-blue-300',
      badge: 'স্মার্ট প্ল্যানার',
    },
    {
      id: 'files',
      title: t.files,
      desc: lang === 'ar' ? 'الملخصات، السلايدات، أسئلة السنوات السابقة، والمراجع العلمية' : 'লেকচার হ্যান্ডনোট, স্লাইড, বিগত বছরের প্রশ্ন ও ড্রাইভ লিংক',
      icon: FolderDown,
      color: 'from-teal-600/30 to-teal-950/60 border-teal-600/40 text-teal-300',
      badge: 'ই-লাইব্রেরি',
    },
    {
      id: 'chat',
      title: t.chat,
      desc: lang === 'ar' ? 'محادثة جماعية لأبناء الدفعة ومحادثات ثنائية خاصة' : 'ব্যাচ আড্ডা, গ্রুপ ডিসকাশন ও সহপাঠীদের সাথে ১-টু-১ চ্যাট',
      icon: MessageSquare,
      color: 'from-pink-600/30 to-pink-950/60 border-pink-600/40 text-pink-300',
      badge: 'লাইভ চ্যাট',
    },
    {
      id: 'members',
      title: t.members,
      desc: lang === 'ar' ? 'قائمة كاملة بطلاب وطالبات الدفعة الأربعين مع بيانات التواصل' : '৪০তম ব্যাচের সকল সহপাঠীর যোগাযোগ, রোল ও হল ডিরেক্টরি',
      icon: Users,
      color: 'from-indigo-600/30 to-indigo-950/60 border-indigo-600/40 text-indigo-300',
      badge: `${members.length}জন সদস্য`,
    },
    {
      id: 'blood',
      title: t.blood,
      desc: lang === 'ar' ? 'البحث السريع عن المتبرعين بالدم في الحالات الطارئة بمستشفى كوشتيا' : 'জরুরি রক্তদাতা সন্ধান ও তাৎক্ষণিক ফোন কলের সুবিধা',
      icon: Heart,
      color: 'from-rose-600/30 to-rose-950/60 border-rose-600/40 text-rose-300',
      badge: 'জরুরি ২৪/৭',
    },
    {
      id: 'complaint',
      title: t.complaint,
      desc: lang === 'ar' ? 'إرسال الشكاوى والمقترحات بسرية تامة ومتابعتها برمز التتبع' : 'নাম গোপন রেখে অভিযোগ ও পরামর্শ সাবমিট এবং ট্র্যাকিং',
      icon: MessageCircleQuestion,
      color: 'from-orange-600/30 to-orange-950/60 border-orange-600/40 text-orange-300',
      badge: 'গোপনীয় ও নিরাপদ',
    },
    {
      id: 'tools',
      title: t.tools,
      desc: lang === 'ar' ? 'حساب المعدل الفصلي والتراكمي لدرجات الجامعة الإسلامية' : 'ইবি ৪.০০ গ্রেডিং স্কেল অনুযায়ী সেমিস্টার ফলাফল হিসাব',
      icon: Calculator,
      color: 'from-violet-600/30 to-violet-950/60 border-violet-600/40 text-violet-300',
      badge: 'ইবি স্কেল',
    },
    {
      id: 'fund',
      title: t.fund,
      desc: lang === 'ar' ? 'الشفافية الكاملة لإيرادات ومصروفات صندوق الدفعة' : 'মাসিক চাঁদা, অনুষ্ঠান ও সেমিনারের স্বচ্ছ আর্থিক হিসাব খাতা',
      icon: Wallet,
      color: 'from-yellow-600/30 to-yellow-950/60 border-yellow-600/40 text-yellow-300',
      badge: 'স্বচ্ছ লেজার',
    },
    {
      id: 'polls',
      title: t.polls,
      desc: lang === 'ar' ? 'استطلاعات الرأي الجماعية والتصويت الفوري وإبداء الرأي' : 'যেকোনো বিষয়ে দ্রুত ভোট ও মতামত প্রদান, লাইভ ফলাফল ট্র্যাকিং',
      icon: Vote,
      color: 'from-amber-600/30 to-amber-950/60 border-amber-600/40 text-amber-300',
      badge: 'লাইভ ভোটিং',
    },
    {
      id: 'welfare',
      title: t.welfare,
      desc: lang === 'ar' ? 'مساعدة الإخوة والزملاء في المصاريف والعلاج والكتب' : 'জরুরি চিকিৎসা, সেমিস্টার ফি ও শিক্ষা উপকরণ সহায়তা ও অনুদান',
      icon: HandHeart,
      color: 'from-emerald-600/30 to-emerald-950/60 border-emerald-600/40 text-emerald-300',
      badge: 'সহমর্মিতা ফান্ড',
    },
    {
      id: 'gallery',
      title: t.gallery,
      desc: lang === 'ar' ? 'صور الحرم الجامعي، الرحلات الاستكشافية، ولقطات الدفعة التاريخية' : 'অনুষদের সিঁড়িতে তোলা ব্যাচ ফটো, ট্যুর ও ইফতারের স্মৃতি',
      icon: Camera,
      color: 'from-cyan-600/30 to-cyan-950/60 border-cyan-600/40 text-cyan-300',
      badge: 'ফটো অ্যালবাম',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Clock Centerpiece (User requested: ঘড়ি মাঝখানে বাজে কোন জায়গায় দেওয়া যাবে) */}
      {clockSettings?.position === 'topbar' && (
        <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card-subtle)] to-[var(--bg-card)] border border-[var(--gold)]/50 shadow-xl text-center space-y-3">
          <div className="flex items-center justify-between w-full border-b border-[var(--border-color)]/60 pb-2">
            <span className="text-xs font-extrabold text-[var(--gold)] flex items-center gap-1.5 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-[var(--gold)]" />
              লাইভ ক্যাম্পাস ঘড়ি ও সময়
            </span>
            <span className="font-arabic text-xs text-[var(--gold-light)] opacity-90">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>

          <div className="py-1">
            <ClockWidget
              mode={clockSettings?.type || 'both'}
              size="lg"
              showDate={true}
              lang={lang}
              onToggleMode={onToggleClockMode}
            />
          </div>
        </div>
      )}

      {/* Universal Search Bar */}
      <div
        onClick={onOpenSearch}
        className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)]/80 shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)] group-hover:text-white">
          <div className="w-8 h-8 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)] shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <span>যেকোনো বিষয়, শিক্ষক, সহপাঠী, রক্তদাতা, বা হ্যান্ডনোট অনুসন্ধান করুন...</span>
        </div>
        <kbd className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[10px] text-[var(--gold-light)] font-mono">
          Ctrl + K
        </kbd>
      </div>

      {/* Role-based Greeting Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card-subtle)] to-[var(--bg-card)] border border-[var(--gold)]/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--gold)] to-amber-700 text-black font-black text-lg flex items-center justify-center shrink-0 shadow-md">
            {currentUser?.photo ? (
              <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>{(currentUser?.name || 'আ')[0]}</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {lang === 'ar' ? `أهلاً بك، ${currentUser?.name || 'طالب'}` : `আসসালামু আলাইকুম, ${currentUser?.name || 'সহপাঠী'}`}
              </h2>
              {isAdmin ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  {t.admin}
                </span>
              ) : isCr ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  {t.cr}
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-[var(--gold-light)] border border-[var(--border-color)]">
                  {t.member} (রোল: {currentUser?.roll})
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isAdmin
                ? 'আপনার অ্যাডমিন প্যানেল থেকে ব্যাচের নোটিশ, রুটিন, উস্তাজ ও সদস্যদের পূর্ণ নিয়ন্ত্রণ করতে পারবেন।'
                : 'আপনার প্রয়োজনীয় যেকোনো পেজে প্রবেশ করতে নিচের কার্ডগুলোতে ক্লিক করুন।'}
            </p>
          </div>
        </div>

        {/* Next Prayer Teaser */}
        <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] text-xs text-center shrink-0">
          <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-[var(--gold)]" />
            <span>{t.nextPrayer}</span>
          </div>
          <div className="font-bold text-[var(--gold-light)] mt-0.5">
            {prayerData.nextPrayer.nameBn}: {formatTimeBn(prayerData.nextPrayer.time)}
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
            ({prayerData.nextPrayer.remainingFormatted})
          </div>
        </div>
      </div>

      {/* Quick Access Action Pills (Instant 1-tap navigation) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigate('chat')}
          className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/60 to-[var(--bg-card)] border border-pink-700/50 hover:border-pink-500 text-left transition-all flex items-center gap-2.5 shadow-sm active:scale-95 group"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-900/60 border border-pink-600/40 flex items-center justify-center text-pink-300 shrink-0 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">ব্যাচ লাইভ চ্যাট</div>
            <div className="text-[10px] text-pink-300">সবার সাথে কথা বলুন</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('polls')}
          className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-[var(--bg-card)] border border-amber-700/50 hover:border-amber-500 text-left transition-all flex items-center gap-2.5 shadow-sm active:scale-95 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-900/60 border border-amber-600/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">ব্যাচ পোল ও ভোট</div>
            <div className="text-[10px] text-amber-300">মতামত দিন বা দেখুন</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('blood')}
          className="p-3 rounded-2xl bg-gradient-to-r from-red-950/60 to-[var(--bg-card)] border border-red-700/50 hover:border-red-500 text-left transition-all flex items-center gap-2.5 shadow-sm active:scale-95 group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-900/60 border border-red-600/40 flex items-center justify-center text-red-300 shrink-0 group-hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">জরুরি রক্তদাতা</div>
            <div className="text-[10px] text-red-300">তাৎক্ষণিক ফোন কল</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('welfare')}
          className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[var(--bg-card)] border border-emerald-700/50 hover:border-emerald-500 text-left transition-all flex items-center gap-2.5 shadow-sm active:scale-95 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-110 transition-transform">
            <HandHeart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">সহযোগিতা ও সাহায্য</div>
            <div className="text-[10px] text-emerald-300">পারস্পরিক ওয়েলফেয়ার</div>
          </div>
        </button>
      </div>

      {/* TOP PINNED ACTIVE POLL (User requested: "পোল দিলে উপরে শো করবে সেখান থেকে ডকলে ভোট দিতে পারবে") */}
      {polls.some((p) => p.isActive) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-[var(--gold)] uppercase tracking-wide flex items-center gap-1.5">
              <Vote className="w-4 h-4 text-[var(--gold)] animate-bounce" />
              শীর্ষে চলমান উন্মুক্ত পোল (এখানেই সরাসরি ভোট দিন)
            </span>
            <button
              onClick={() => onNavigate('polls')}
              className="text-xs text-[var(--gold-light)] hover:underline font-bold"
            >
              সকল পোল ও অপশন দেখুন →
            </button>
          </div>
          <PollsWidget
            polls={polls}
            currentUser={currentUser}
            onRefreshPolls={onRefreshPolls}
            lang={lang}
            compactMode={true}
          />
        </div>
      )}

      {/* Live Class Teaser */}
      {runningClass ? (
        <div
          onClick={() => onNavigate('routine')}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[var(--bg-card)] to-emerald-950/70 border border-emerald-600/50 shadow-md cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <div className="text-xs font-bold text-emerald-300">
                {lang === 'ar' ? 'محاضرة جارية الآن في الحرم الجامعي' : '⏱️ ক্যাম্পাসে এখন ক্লাস চলছে:'}
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {runningClass.subject} ({runningClass.code}) · {runningClass.room || 'অনুষদ ভবন'}
              </div>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shrink-0">
            <span>রুটিন দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* Main Grid: Dedicated Feature Portals (Customizable Order & Visibility) */}
      <div>
        {(() => {
          const rawIds = dashboardFeatures && dashboardFeatures.length > 0
            ? dashboardFeatures
            : FEATURE_PORTALS.map((p) => p.id);
          const activeIds = Array.from(new Set(rawIds));
          const sortedPortals = activeIds
            .map((id) => FEATURE_PORTALS.find((p) => p.id === id))
            .filter(Boolean) as typeof FEATURE_PORTALS;

          return (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 px-1">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--gold-light)] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                    <span>পোর্টাল ফিচার ও আলাদা পৃষ্ঠা ডিরেক্টরি</span>
                  </h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    যেকোনো ফিচারের আলাদা পৃষ্ঠায় যেতে কার্ডে ক্লিক করুন
                  </span>
                </div>

                {onOpenCustomizer && (
                  <button
                    onClick={onOpenCustomizer}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--accent)] border border-[var(--gold)]/40 hover:border-[var(--gold)] text-[var(--gold-light)] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                    title="ফিচার সাজান, ক্রম পরিবর্তন করুন বা লুকান"
                  >
                    <Settings className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>ফিচার সাজান</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sortedPortals.map((portal, pIdx) => {
                  const Icon = portal.icon;
                  return (
                    <div
                      key={`${portal.id}-${pIdx}`}
                      onClick={() => onNavigate(portal.id)}
                      className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${portal.color} bg-[var(--bg-card)] border hover:border-[var(--gold)] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between group`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)]/90 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5 text-[var(--gold)]" />
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-white">
                            {portal.badge}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                          {portal.title}
                        </h4>

                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                          {portal.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[var(--gold-light)] font-semibold">
                        <span>{lang === 'ar' ? 'افتح الصفحة' : 'পৃষ্ঠা খুলুন'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};
