import React, { useState, useRef } from 'react';
import {
  Settings,
  X,
  Save,
  Camera,
  Image as ImageIcon,
  CreditCard,
  Building,
  KeyRound,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  UserPlus,
  Mail,
  Trash2,
  Users,
  Clock,
  LayoutGrid,
  CheckSquare,
  Tag,
  Edit2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Vote,
  Heart,
  HandHeart,
  MessageSquare,
  Bell,
  Calendar,
  Compass,
  Wallet,
  GraduationCap,
  FolderDown,
  Calculator,
  MessageCircleQuestion,
  Home,
} from 'lucide-react';
import { AppSettings, PaymentSettings, Language, UserProfile } from '../types';
import { DataService } from '../services/supabase';
import { T_DICT } from '../data/translations';
import { ClockWidget, ClockTheme, THEME_CONFIGS } from './ClockWidget';

interface CustomizerModalProps {
  onClose: () => void;
  onUpdateVisuals: (visuals: { logo?: string; cover?: string }) => void;
  lang: Language;
  onUpdateBottomNav?: (items: string[]) => void;
  onUpdateClock?: (clock: { type: 'analog' | 'digital' | 'both'; position: 'header' | 'hero' | 'topbar' }) => void;
  onUpdateDashboardFeatures?: (features: string[]) => void;
}

export const ALL_FEATURES_LIST = [
  { id: 'home', label: 'প্রধান ড্যাশবোর্ড', icon: Home },
  { id: 'routine', label: 'ক্লাস রুটিন', icon: Calendar },
  { id: 'polls', label: 'পোল ও ভোট', icon: Vote },
  { id: 'chat', label: 'ব্যাচ চ্যাট', icon: MessageSquare },
  { id: 'blood', label: 'রক্তদাতা সন্ধান', icon: Heart, color: 'text-red-400' },
  { id: 'welfare', label: 'সহযোগিতা ডেস্ক', icon: HandHeart },
  { id: 'members', label: 'সহপাঠী তালিকা', icon: Users },
  { id: 'notice', label: 'নোটিশ বোর্ড', icon: Bell },
  { id: 'islamic', label: 'ইসলামিক কর্নার', icon: Compass },
  { id: 'fund', label: 'তহবিল ও চাঁদা হিসাব', icon: Wallet },
  { id: 'planner', label: 'দৈনিক প্ল্যানার', icon: CheckSquare },
  { id: 'teachers', label: 'সম্মানিত উস্তাজ', icon: GraduationCap },
  { id: 'files', label: 'একাডেমিক ফাইল', icon: FolderDown },
  { id: 'tools', label: 'সিজিপিএ ক্যালকুলেটর', icon: Calculator },
  { id: 'complaint', label: 'অভিযোগ ও মতামত', icon: MessageCircleQuestion },
  { id: 'gallery', label: 'স্মৃতি ও গ্যালারি', icon: Camera },
];

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  onClose,
  onUpdateVisuals,
  lang,
  onUpdateBottomNav,
  onUpdateClock,
  onUpdateDashboardFeatures,
}) => {
  const t = T_DICT[lang];
  const [activeSubTab, setActiveSubTab] = useState<'payment' | 'admins' | 'branding' | 'layout' | 'security'>('layout');

  // App Settings
  const [appSettings, setAppSettings] = useState<AppSettings>(DataService.getAppSettings());
  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DataService.getPaymentSettings());

  // Admins List
  const [adminList, setAdminList] = useState<UserProfile[]>(DataService.getAdminList());
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  // Clock Settings
  const [clockSettings, setClockSettings] = useState<{
    type: 'analog' | 'digital' | 'both';
    position: 'header' | 'hero' | 'topbar';
  }>(DataService.getClockSettings());

  // Bottom Nav items
  const [bottomNavSlots, setBottomNavSlots] = useState<string[]>(DataService.getBottomNavItems());

  // Dashboard Features list (guaranteed unique)
  const [dashFeatures, setDashFeatures] = useState<string[]>(() =>
    Array.from(new Set(DataService.getDashboardFeatures()))
  );

  // Member designations
  const [allMembers, setAllMembers] = useState<UserProfile[]>(DataService.getMembersSync());
  const [memberSearch, setMemberSearch] = useState('');

  // Visual In-Modal Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const logoFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateVisuals({ logo: event.target.result as string });
        showToast('নতুন লোগো সফলভাবে সেট হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateVisuals({ cover: event.target.result as string });
        showToast('নতুন কভার ছবি সফলভাবে সেট হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      showToast('অনুগ্রহ করে সঠিক জিমেইল বা ইমেইল ঠিকানা দিন!');
      return;
    }

    const res = DataService.addAdminByEmail(newAdminEmail.trim(), newAdminName.trim());
    showToast(res.message);
    setNewAdminEmail('');
    setNewAdminName('');
    setAdminList(DataService.getAdminList());
  };

  const handleRemoveAdmin = (userId: string, adminName: string) => {
    DataService.removeAdminRole(userId);
    setAdminList(DataService.getAdminList());
    showToast(`${adminName}-এর অ্যাডমিন পদ বাতিল করা হয়েছে`);
  };

  // Instant slot change with auto-save
  const handleSlotChange = (index: number, newId: string) => {
    const updated = [...bottomNavSlots];
    updated[index] = newId;
    setBottomNavSlots(updated);
    DataService.setBottomNavItems(updated);
    if (onUpdateBottomNav) onUpdateBottomNav(updated);
    showToast(`স্লট #${index + 1} সফলভাবে পরিবর্তিত হয়েছে!`);
  };

  // Quick preset: replace 'blood' with 'members'
  const handleQuickSwapBloodToMember = () => {
    let replaced = false;
    const updated = bottomNavSlots.map((item) => {
      if (item === 'blood') {
        replaced = true;
        return 'members';
      }
      return item;
    });

    if (!replaced) {
      // If blood wasn't there, put members in slot #5
      updated[4] = 'members';
    }

    setBottomNavSlots(updated);
    DataService.setBottomNavItems(updated);
    if (onUpdateBottomNav) onUpdateBottomNav(updated);
    showToast('নিচের বারে রক্তের জায়গায় "সদস্য তালিকা" সেট হয়েছে!');
  };

  // Move bottom nav slots left / right
  const handleMoveBottomNavSlot = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= bottomNavSlots.length) return;
    const updated = [...bottomNavSlots];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBottomNavSlots(updated);
    DataService.setBottomNavItems(updated);
    if (onUpdateBottomNav) onUpdateBottomNav(updated);
    showToast('ন্যাভিগেশন স্লটের ক্রম পরিবর্তিত হয়েছে!');
  };

  const handleResetNav = () => {
    const defaults = ['home', 'routine', 'polls', 'chat', 'blood', 'welfare'];
    setBottomNavSlots(defaults);
    DataService.setBottomNavItems(defaults);
    if (onUpdateBottomNav) onUpdateBottomNav(defaults);
    showToast('নিচের বার ডিফল্ট হিসেবে রিসেট হয়েছে!');
  };

  // Dashboard Features Reordering
  const handleMoveDashboardFeature = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= dashFeatures.length) return;

    const updated = [...dashFeatures];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const clean = Array.from(new Set(updated));
    setDashFeatures(clean);
    DataService.setDashboardFeatures(clean);
    if (onUpdateDashboardFeatures) onUpdateDashboardFeatures(clean);
    showToast('ড্যাশবোর্ড ফিচারের ক্রম সাজানো হয়েছে!');
  };

  const handleToggleDashboardFeature = (featureId: string) => {
    let updated: string[];
    if (dashFeatures.includes(featureId)) {
      if (dashFeatures.length <= 3) {
        showToast('কমপক্ষে ৩টি ফিচার চালু রাখতে হবে!');
        return;
      }
      updated = dashFeatures.filter((id) => id !== featureId);
    } else {
      updated = [...dashFeatures, featureId];
    }
    const clean = Array.from(new Set(updated));
    setDashFeatures(clean);
    DataService.setDashboardFeatures(clean);
    if (onUpdateDashboardFeatures) onUpdateDashboardFeatures(clean);
    showToast('ফিচার তালিকা সফলভাবে আপডেট হয়েছে!');
  };

  const handleResetDashboardFeatures = () => {
    const defaults = Array.from(new Set([
      'routine',
      'notice',
      'islamic',
      'teachers',
      'planner',
      'files',
      'chat',
      'members',
      'blood',
      'complaint',
      'tools',
      'fund',
      'polls',
      'welfare',
      'gallery',
    ]));
    setDashFeatures(defaults);
    DataService.setDashboardFeatures(defaults);
    if (onUpdateDashboardFeatures) onUpdateDashboardFeatures(defaults);
    showToast('ড্যাশবোর্ড ফিচার ডিফল্ট ক্রমে ফিরে এসেছে!');
  };

  // Clock settings changes
  const handleClockChange = (key: 'type' | 'position', val: any) => {
    const updated = { ...clockSettings, [key]: val };
    setClockSettings(updated);
    DataService.setClockSettings(updated);
    if (onUpdateClock) onUpdateClock(updated);
    showToast('ঘড়ির সেটিংস তাৎক্ষণিকভাবে আপডেট হয়েছে!');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.updateAppSettings(appSettings);
    DataService.updatePaymentSettings(paymentSettings);
    showToast('সব তথ্য সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Floating In-Modal Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 border border-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--gold)]/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-6 text-xs max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[var(--gold)] to-amber-700 flex items-center justify-center text-black font-extrabold shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--gold-light)]">
                মাস্টার কন্ট্রোল ও সেটিংস প্যানেল
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                আল ইতকান ৪০ ব্যাচ পোর্টালের লেআউট, ঘড়ি, নিচের বার ও পূর্ণ নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--accent)] text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] overflow-x-auto no-scrollbar">
          {[
            { id: 'layout', label: 'লেআউট, ঘড়ি ও নিচের বার', icon: LayoutGrid },
            { id: 'admins', label: 'জিমেইল দিয়ে অ্যাডমিন', icon: ShieldCheck },
            { id: 'payment', label: 'টাকা ও চাঁদা পেমেন্ট', icon: CreditCard },
            { id: 'branding', label: 'লোগো ও কভার ছবি', icon: Camera },
            { id: 'security', label: 'ব্যাচ কোড ও টেক্সট', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ======================= TAB 1: LAYOUT, CLOCK & BOTTOM BAR ======================= */}
        {activeSubTab === 'layout' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            {/* 1. LUXURY CLOCK CUSTOMIZER & PREVIEW */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--gold)]" />
                  এনালগ ও ডিজিটাল ঘড়ির পূর্ণ কাস্টমাইজেশন
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--gold)]/40 text-[var(--gold-light)] font-mono">
                  লাইভ প্রিভিউ (ক্লিকযোগ্য)
                </span>
              </div>

              {/* Live Clock Preview Box */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--gold)]/40 flex items-center justify-center shadow-inner">
                <ClockWidget
                  mode={clockSettings.type}
                  size="md"
                  showDate={true}
                  lang={lang}
                  onToggleMode={(newMode) => handleClockChange('type', newMode)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
                    ঘড়ির ধরন (Clock Type)
                  </label>
                  <select
                    value={clockSettings.type}
                    onChange={(e) => handleClockChange('type', e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-bold focus:border-[var(--gold)]"
                  >
                    <option value="both">🕒 এনালগ ও ডিজিটাল উভয় ঘড়ি (Dual Luxury)</option>
                    <option value="analog">🕒 শুধু সুন্দর এনালগ ঘড়ি (Analog Dial)</option>
                    <option value="digital">⏰ শুধু ডিজিটাল ঘড়ি (Digital OLED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
                    ঘড়ির অবস্থান (Placement Position)
                  </label>
                  <select
                    value={clockSettings.position}
                    onChange={(e) => handleClockChange('position', e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-bold focus:border-[var(--gold)]"
                  >
                    <option value="hero">হিরো ব্যানার ও ড্যাশবোর্ডে (Hero Center)</option>
                    <option value="topbar">হোমপেইজের শীর্ষে প্রধান উইজেট (Top Showcase)</option>
                    <option value="header">হেডার টপ বারের কেন্দ্রে (Header Center)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. BOTTOM QUICK BAR / DOCK CUSTOMIZER (User request: রক্ত মুছে সদস্য দেওয়া ইত্যাদি বদলানো) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
                <div>
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[var(--gold)]" />
                    নিচের ন্যাভিগেশন বার ও ডক কাস্টমাইজেশন (Mobile & Desktop Dock)
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    আপনার ইচ্ছেমতো যেকোনো স্লট পরিবর্তন করুন — পরিবর্তনের সাথে সাথে নিচে লাইভ প্রিভিউ দেখতে পাবেন
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleQuickSwapBloodToMember}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-black font-extrabold text-[11px] shadow-sm hover:brightness-110 active:scale-95"
                  >
                    ⚡ রক্তের জায়গায় "সদস্য" দিন
                  </button>
                  <button
                    type="button"
                    onClick={handleResetNav}
                    className="px-2 py-1 rounded-xl bg-[var(--bg-card)] text-[var(--gold-light)] hover:text-white border border-[var(--border-color)] text-[11px]"
                  >
                    ডিফল্ট
                  </button>
                </div>
              </div>

              {/* LIVE DOCK PREVIEW BOX */}
              <div className="p-3 rounded-2xl bg-black/40 border border-[var(--gold)]/30 space-y-1.5">
                <div className="text-[10px] font-bold text-[var(--gold)] flex items-center justify-between">
                  <span>লাইভ ন্যাভিগেশন ডক প্রিভিউ (Live Preview):</span>
                  <span className="text-[9px] text-[var(--text-secondary)]">তাৎক্ষণিক কার্যকর হচ্ছে</span>
                </div>

                <div className="p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-around shadow-inner">
                  {bottomNavSlots.map((slotId, sIdx) => {
                    const item = ALL_FEATURES_LIST.find((f) => f.id === slotId) || ALL_FEATURES_LIST[0];
                    const Icon = item.icon;
                    return (
                      <div
                        key={sIdx}
                        className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-center"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-white truncate max-w-[50px]">
                          {item.label.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 Configurable Slots Grid with Instant Updates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {bottomNavSlots.map((currentId, idx) => {
                  const currentFeature = ALL_FEATURES_LIST.find((f) => f.id === currentId);
                  const Icon = currentFeature?.icon || Home;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5 hover:border-[var(--gold)]/60 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--gold-light)]">
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-[var(--gold)]" />
                          স্লট #{idx + 1}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBottomNavSlot(idx, 'left')}
                            className="p-1 rounded bg-[var(--bg-main)] hover:bg-[var(--accent)] disabled:opacity-20 text-[var(--gold-light)] border border-[var(--border-color)]"
                            title="বামে সরান"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === bottomNavSlots.length - 1}
                            onClick={() => handleMoveBottomNavSlot(idx, 'right')}
                            className="p-1 rounded bg-[var(--bg-main)] hover:bg-[var(--accent)] disabled:opacity-20 text-[var(--gold-light)] border border-[var(--border-color)]"
                            title="ডানে সরান"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <select
                        value={currentId}
                        onChange={(e) => handleSlotChange(idx, e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg p-2 text-white font-semibold text-xs focus:border-[var(--gold)]"
                      >
                        {ALL_FEATURES_LIST.map((feat) => (
                          <option key={feat.id} value={feat.id}>
                            {feat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preset Layouts */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-[var(--text-secondary)] font-semibold">কুইক প্যাকেজ:</span>
                <button
                  type="button"
                  onClick={() => {
                    const preset = ['home', 'routine', 'polls', 'chat', 'blood', 'welfare'];
                    setBottomNavSlots(preset);
                    DataService.setBottomNavItems(preset);
                    if (onUpdateBottomNav) onUpdateBottomNav(preset);
                    showToast('ডিফল্ট প্যাকেজ সেট হয়েছে!');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--accent)] text-[var(--gold-light)] border border-[var(--border-color)]"
                >
                  ডিফল্ট ৬টি
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const preset = ['home', 'routine', 'notice', 'files', 'teachers', 'planner'];
                    setBottomNavSlots(preset);
                    DataService.setBottomNavItems(preset);
                    if (onUpdateBottomNav) onUpdateBottomNav(preset);
                    showToast('একাডেমিক প্যাকেজ সেট হয়েছে!');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--accent)] text-[var(--gold-light)] border border-[var(--border-color)]"
                >
                  একাডেমিক বার
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const preset = ['home', 'chat', 'members', 'blood', 'welfare', 'fund'];
                    setBottomNavSlots(preset);
                    DataService.setBottomNavItems(preset);
                    if (onUpdateBottomNav) onUpdateBottomNav(preset);
                    showToast('কমিউনিটি ও সাহায্য বার সেট হয়েছে!');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--accent)] text-[var(--gold-light)] border border-[var(--border-color)]"
                >
                  কমিউনিটি ও ফান্ড
                </button>
              </div>
            </div>

            {/* 3. HOME DASHBOARD FEATURES ORGANIZER (ড্যাশবোর্ডের ফিচার সাজানো ও উপরে/নিচে সরানো) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
                <div>
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-[var(--gold)]" />
                    হোম ড্যাশবোর্ডের ফিচারসমূহ সাজান (Dashboard Feature Grid)
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    হোমপেইজের কার্ডগুলোর ক্রম উপরে/নিচে পরিবর্তন করুন অথবা যেকোনো ফিচার দেখান বা লুকান
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDashboardFeatures}
                  className="px-2.5 py-1 rounded-xl bg-[var(--bg-card)] text-[var(--gold-light)] hover:text-white border border-[var(--border-color)] text-[11px]"
                >
                  ডিফল্ট ক্রম
                </button>
              </div>

              {/* Features List with Move Up / Move Down & Toggle */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {dashFeatures.map((featId, idx) => {
                  const feat = ALL_FEATURES_LIST.find((f) => f.id === featId) || {
                    id: featId,
                    label: featId,
                    icon: LayoutGrid,
                  };
                  const Icon = feat.icon;
                  return (
                    <div
                      key={`${featId}-${idx}`}
                      className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-2 hover:border-[var(--gold)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[var(--bg-main)] text-[10px] font-mono font-bold flex items-center justify-center text-[var(--gold)] shrink-0 border border-[var(--border-color)]">
                          {idx + 1}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--gold)] shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white text-xs truncate">{feat.label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveDashboardFeature(idx, 'up')}
                          className="p-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--accent)] disabled:opacity-30 disabled:pointer-events-none text-[var(--gold-light)] border border-[var(--border-color)]"
                          title="উপরে তুলুন"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === dashFeatures.length - 1}
                          onClick={() => handleMoveDashboardFeature(idx, 'down')}
                          className="p-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--accent)] disabled:opacity-30 disabled:pointer-events-none text-[var(--gold-light)] border border-[var(--border-color)]"
                          title="নিচে নামান"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Remove / Hide */}
                        <button
                          type="button"
                          onClick={() => handleToggleDashboardFeature(featId)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-300 ml-1"
                          title="হোমপেইজ থেকে লুকান"
                        >
                          <EyeOff className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inactive / Hidden Features that can be added */}
              {(() => {
                const hiddenFeatures = ALL_FEATURES_LIST.filter(
                  (f) => !dashFeatures.includes(f.id)
                );
                if (hiddenFeatures.length === 0) return null;
                return (
                  <div className="pt-2.5 border-t border-[var(--border-color)] space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] block">
                      লুকানো ফিচারসমূহ (ক্লিক করে ড্যাশবোর্ডে যোগ করুন):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hiddenFeatures.map((hf) => {
                        const HIcon = hf.icon;
                        return (
                          <button
                            key={hf.id}
                            type="button"
                            onClick={() => handleToggleDashboardFeature(hf.id)}
                            className="px-2.5 py-1 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--accent)] border border-[var(--border-color)] hover:border-[var(--gold)] text-xs text-[var(--gold-light)] flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <HIcon className="w-3 h-3 text-[var(--gold)]" />
                            <span>{hf.label}</span>
                            <span className="text-[10px] text-emerald-400 font-bold ml-0.5">+ যোগ করুন</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 4. MANAGE MEMBER CUSTOM DESIGNATIONS */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[var(--gold)]" />
                  সহপাঠীদের পদবি / দায়িত্ব নির্ধারণ (Custom Title)
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">সার্চেও এই পদবি আসবে</span>
              </div>

              <input
                type="text"
                placeholder="পদবি পরিবর্তন করতে সহপাঠীর নাম খুঁজুন..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white"
              />

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {allMembers
                  .filter(
                    (m) =>
                      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      m.roll.includes(memberSearch) ||
                      (m.designation && m.designation.toLowerCase().includes(memberSearch.toLowerCase()))
                  )
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate text-xs">{m.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">রোল: {m.roll}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="text"
                          defaultValue={m.designation || ''}
                          placeholder="পদবি লিখুন..."
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            DataService.updateMemberDesignation(m.id, val);
                            setAllMembers(DataService.getMembersSync());
                            showToast(`${m.name}-এর পদবি "${val}" সংরক্ষিত হয়েছে!`);
                          }}
                          className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-white text-xs w-36 sm:w-44 focus:border-[var(--gold)]"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN BY GMAIL */}
        {activeSubTab === 'admins' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--gold-light)]">
                <ShieldCheck className="w-4 h-4 text-[var(--gold)]" />
                <span>নতুন অ্যাডমিন যুক্ত করুন (জিমেইল / ইমেইল ঠিকানা দিয়ে)</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                এখানে যে কারো জিমেইল দিলে সে স্বয়ংক্রিয়ভাবে আল ইতকান ৪০ এর অ্যাডমিন হিসেবে নিবন্ধিত হবে এবং ওয়েবসাইট পরিচালনার পূর্ণ নিয়ন্ত্রণ পাবে।
              </p>

              <form onSubmit={handleAddAdmin} className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">জিমেইল / ইমেইল অ্যাড্রেস *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="email"
                      required
                      placeholder="যেমন: newadmin@gmail.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-2 text-white focus:border-[var(--gold)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">অ্যাডমিনের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: মাওলানা হাফিজুর রহমান"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-extrabold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>অ্যাডমিন হিসেবে যুক্ত করুন</span>
                </button>
              </form>
            </div>

            {/* Current Admins List */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2.5">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--gold)]" />
                বর্তমান অ্যাডমিনদের তালিকা ({adminList.length} জন)
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {adminList.map((adm) => (
                  <div
                    key={adm.id}
                    className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center text-[10px]">
                        {adm.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{adm.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{adm.email}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(adm.id, adm.name)}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
                      title="অ্যাডমিন পদ বাতিল করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT NUMBERS (BKASH, NAGAD, ROCKET, BANK) */}
        {activeSubTab === 'payment' && (
          <form onSubmit={handleSaveAll} className="space-y-3.5 text-xs animate-in fade-in">
            <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--gold)]" />
                চাঁদা ও অনুদানের মোবাইল ব্যাংকিং নম্বর
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* bKash */}
                <div className="space-y-1">
                  <label className="block text-pink-400 font-bold">বিকাশ (bKash) নম্বর</label>
                  <input
                    type="text"
                    value={paymentSettings.bkashNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashNumber: e.target.value })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white font-mono"
                  />
                  <select
                    value={paymentSettings.bkashType}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashType: e.target.value as any })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1.5 text-white text-[11px]"
                  >
                    <option value="personal">পার্সোনাল (Personal)</option>
                    <option value="merchant">মার্চেন্ট (Merchant)</option>
                    <option value="agent">এজেন্ট (Agent)</option>
                  </select>
                </div>

                {/* Nagad */}
                <div className="space-y-1">
                  <label className="block text-orange-400 font-bold">নগদ (Nagad) নম্বর</label>
                  <input
                    type="text"
                    value={paymentSettings.nagadNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, nagadNumber: e.target.value })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white font-mono"
                  />
                  <select
                    value={paymentSettings.nagadType}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, nagadType: e.target.value as any })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1.5 text-white text-[11px]"
                  >
                    <option value="personal">পার্সোনাল (Personal)</option>
                    <option value="merchant">মার্চেন্ট (Merchant)</option>
                  </select>
                </div>

                {/* Rocket */}
                <div className="space-y-1">
                  <label className="block text-purple-400 font-bold">রকেট (Rocket) নম্বর</label>
                  <input
                    type="text"
                    value={paymentSettings.rocketNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, rocketNumber: e.target.value })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white font-mono"
                  />
                </div>

                {/* Monthly Fee */}
                <div className="space-y-1">
                  <label className="block text-emerald-400 font-bold">মাসিক চাঁদার নির্ধারিত হার (টাকা)</label>
                  <input
                    type="number"
                    value={paymentSettings.monthlyFee}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, monthlyFee: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Bank Account */}
              <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
                <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  ব্যাংক একাউন্ট তথ্য
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="ব্যাংকের নাম"
                    value={paymentSettings.bankName || ''}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="হিসাব নম্বর (Account No)"
                    value={paymentSettings.bankAccountNumber || ''}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>পেমেন্ট তথ্য সেভ করুন</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: VISUAL BRANDING (LOGO & COVER DIRECT UPLOAD) */}
        {activeSubTab === 'branding' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <input
              ref={coverFileRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />

            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-[var(--gold)]" />
                ডিভাইস থেকে সরাসরি লোগো ও কভার ছবি আপলোড
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                আপনার মোবাইল বা কম্পিউটার গ্যালারি থেকে যেকোনো ছবি নির্বাচন করলেই তা স্বয়ংক্রিয়ভাবে পুরো সাইটে দৃশ্যমান হবে।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Logo Uploader */}
                <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-black/40 border border-[var(--gold)] flex items-center justify-center overflow-hidden">
                    <ImageIcon className="w-8 h-8 text-[var(--gold)]" />
                  </div>
                  <div className="font-bold text-white text-xs">ব্যাচ লোগো (Logo)</div>
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black text-[var(--gold-light)] font-bold transition-all border border-[var(--gold)]/40 flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>নতুন লোগো ছবি দিন</span>
                  </button>
                </div>

                {/* Cover Uploader */}
                <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2">
                  <div className="h-16 w-full mx-auto rounded-2xl bg-black/40 border border-[var(--gold)] flex items-center justify-center overflow-hidden">
                    <ImageIcon className="w-8 h-8 text-[var(--gold)]" />
                  </div>
                  <div className="font-bold text-white text-xs">হিরো কভার ব্যানার (Cover)</div>
                  <button
                    type="button"
                    onClick={() => coverFileRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black text-[var(--gold-light)] font-bold transition-all border border-[var(--gold)]/40 flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>নতুন কভার ছবি দিন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: App Text and Security */}
        {activeSubTab === 'security' && (
          <form onSubmit={handleSaveAll} className="space-y-3.5 text-xs animate-in fade-in">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1">পোর্টালের শিরোনাম / ব্যাচ নাম</label>
              <input
                type="text"
                value={appSettings.appName}
                onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">বিভাগের নাম</label>
              <input
                type="text"
                value={appSettings.departmentName}
                onChange={(e) => setAppSettings({ ...appSettings, departmentName: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">বিশ্ববিদ্যালয়ের নাম</label>
              <input
                type="text"
                value={appSettings.universityName}
                onChange={(e) => setAppSettings({ ...appSettings, universityName: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">ব্যাচ সিক্রেট কোড (শিক্ষার্থী অনুমোদনের জন্য)</label>
              <input
                type="text"
                value={appSettings.batchCode}
                onChange={(e) => setAppSettings({ ...appSettings, batchCode: e.target.value.toUpperCase() })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-amber-300 font-mono text-sm uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>টেক্সট সেটিংস সেভ করুন</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
