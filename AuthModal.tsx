import React, { useState } from 'react';
import {
  KeyRound,
  User,
  Mail,
  Phone,
  Heart,
  MapPin,
  ShieldCheck,
  X,
  LogIn,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { DataService } from '../services/supabase';
import { BLOOD_GROUPS } from './BloodBank';

interface AuthModalProps {
  currentUser: UserProfile | null;
  members: UserProfile[];
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  members,
  onClose,
  onLoginSuccess,
  lang = 'bn',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Roll or Email
  const [loginBatchCode, setLoginBatchCode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBlood, setRegBlood] = useState('O+');
  const [regAddr, setRegAddr] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regBatchCode, setRegBatchCode] = useState('');
  const [regError, setRegError] = useState('');

  const currentBatchCode = DataService.getBatchCode();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginIdentifier.trim().toLowerCase();
    if (!trimmedId) {
      setLoginError('রোল নম্বর বা ইমেইল ঠিকানা দিন');
      return;
    }

    if (loginBatchCode.trim() !== currentBatchCode) {
      setLoginError(`সঠিক ব্যাচ সিক্রেট কোড প্রদান করুন (কোড: ${currentBatchCode})`);
      return;
    }

    // Find student
    const found = members.find(
      (m) =>
        m.roll.toLowerCase() === trimmedId ||
        m.email.toLowerCase() === trimmedId ||
        m.name.toLowerCase().includes(trimmedId)
    );

    if (found) {
      DataService.setCurrentUser(found);
      onLoginSuccess(found);
      onClose();
    } else {
      setLoginError('এই রোল বা ইমেইল দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি। অনুগ্রহ করে নতুন একাউন্ট নিবন্ধন করুন।');
    }
  };

  const handleQuickSelectUser = (user: UserProfile) => {
    DataService.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regRoll.trim() || !regEmail.trim()) {
      setRegError('নাম, রোল ও ইমেইল আবশ্যক');
      return;
    }

    if (regBatchCode.trim() !== currentBatchCode) {
      setRegError(`ব্যাচ সিক্রেট কোড সঠিক নয়! (কোড: ${currentBatchCode})`);
      return;
    }

    // Check duplicate
    const exists = members.find(
      (m) =>
        m.roll === regRoll.trim() ||
        m.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (exists) {
      setRegError('এই রোল বা ইমেইল দিয়ে ইতিমধ্যে একাউন্ট রয়েছে। সরাসরি লগইন করুন।');
      return;
    }

    const newUser: UserProfile = {
      id: 'mem-' + Date.now(),
      name: regName.trim(),
      roll: regRoll.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      blood: regBlood,
      addr: regAddr.trim() || 'ইসলামী বিশ্ববিদ্যালয় ক্যাম্পাস, কুষ্টিয়া',
      role: 'member',
      status: 'approved',
      designation: regDesignation.trim() || 'শিক্ষার্থী',
      bio: 'আল কুরআন ও ইসলামিক স্টাডিজ বিভাগ, ৪০তম ব্যাচ (আল ইতকান)।',
    };

    DataService.addMember(newUser);
    DataService.setCurrentUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--gold)]/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-6 text-xs max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--gold)] to-amber-700 text-black font-black flex items-center justify-center text-sm shadow-md">
              <LogIn className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--gold-light)]">
                আল ইতকান ৪০ শিক্ষার্থী লগইন
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া • ৪০তম ব্যাচ পোর্টাল
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'login'
                ? 'bg-[var(--accent)] text-[var(--gold-light)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>শিক্ষার্থী লগইন</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'register'
                ? 'bg-[var(--accent)] text-[var(--gold-light)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>নতুন নিবন্ধন</span>
          </button>
        </div>

        {/* Current Active Account indicator */}
        {currentUser && (
          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--gold)] text-black font-black flex items-center justify-center text-xs">
                {currentUser.name[0]}
              </div>
              <div>
                <div className="font-bold text-white leading-tight">
                  {currentUser.name}
                  {currentUser.designation && (
                    <span className="ml-1.5 text-[10px] text-amber-300 font-normal">
                      ({currentUser.designation})
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  রোল: {currentUser.roll} • {currentUser.email}
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
              লগইন রয়েছে
            </span>
          </div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            {loginError && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
                রোল নম্বর বা জিমেইল / ইমেইল *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৪০১ বা taseenbillah409@gmail.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-2 text-white focus:border-[var(--gold)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
                ব্যাচ সিক্রেট কোড (Secret Code) *
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  required
                  placeholder={`ব্যাচ কোড দিন (${currentBatchCode})`}
                  value={loginBatchCode}
                  onChange={(e) => setLoginBatchCode(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-2 text-white font-mono uppercase focus:border-[var(--gold)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন সম্পন্ন করুন</span>
            </button>

            {/* Quick Demo Switcher list */}
            <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
              <span className="text-[11px] text-[var(--text-secondary)] block">
                বা তালিকা থেকে সরাসরি শিক্ষার্থী নির্বাচন করুন:
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                {members.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickSelectUser(m)}
                    className="p-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-left hover:border-[var(--gold)] flex items-center gap-1.5 transition-colors truncate"
                  >
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--gold)] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {m.name[0]}
                    </span>
                    <div className="truncate min-w-0">
                      <div className="font-bold text-white truncate text-[11px]">{m.name}</div>
                      <div className="text-[9px] text-[var(--text-secondary)]">রোল: {m.roll}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* REGISTER TAB */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            {regError && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">ক্লাস রোল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৪১০"
                  value={regRoll}
                  onChange={(e) => setRegRoll(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">জিমেইল / ইমেইল *</label>
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">রক্তের গ্রুপ</label>
                <select
                  value={regBlood}
                  onChange={(e) => setRegBlood(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">পদবি / দায়িত্ব (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: সাধারণ শিক্ষার্থী, ক্যাশিয়ার..."
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">হল / বর্তমান ঠিকানা</label>
              <input
                type="text"
                placeholder="যেমন: জিয়াউর রহমান হল / সাদ্দাম হল"
                value={regAddr}
                onChange={(e) => setRegAddr(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-semibold text-amber-300">
                ব্যাচ সিক্রেট কোড * (কোড: {currentBatchCode})
              </label>
              <input
                type="text"
                required
                placeholder={currentBatchCode}
                value={regBatchCode}
                onChange={(e) => setRegBatchCode(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--gold)]/60 rounded-xl p-2 text-white font-mono uppercase"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>নিবন্ধন ও সরাসরি প্রবেশ</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
