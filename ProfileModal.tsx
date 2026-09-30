import React, { useState, useRef } from 'react';
import {
  User,
  X,
  Save,
  KeyRound,
  Shield,
  Award,
  Phone,
  MapPin,
  Facebook,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { DataService } from '../services/supabase';
import { T_DICT } from '../data/translations';

interface ProfileModalProps {
  currentUser: UserProfile | null;
  allMembers: UserProfile[];
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onSwitchUser: (user: UserProfile) => void;
  onUpdateSiteVisuals: (visuals: { logo?: string; cover?: string }) => void;
  lang?: Language;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  allMembers,
  onClose,
  onUpdateProfile,
  onSwitchUser,
  onUpdateSiteVisuals,
  lang = 'bn',
}) => {
  const t = T_DICT[lang];
  const [name, setName] = useState(currentUser?.name || '');
  const [roll, setRoll] = useState(currentUser?.roll || '');
  const [blood, setBlood] = useState(currentUser?.blood || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [addr, setAddr] = useState(currentUser?.addr || '');
  const [fb, setFb] = useState(currentUser?.fb || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [photo, setPhoto] = useState(currentUser?.photo || '');

  // Batch code & Admin state
  const [batchCodeInput, setBatchCodeInput] = useState('');
  const [currentSecretCode, setCurrentSecretCode] = useState(DataService.getBatchCode());

  const logoFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      roll: roll.trim(),
      blood: blood.trim(),
      phone: phone.trim(),
      addr: addr.trim(),
      fb: fb.trim(),
      bio: bio.trim(),
      photo: photo.trim() || undefined,
    };

    onUpdateProfile(updated);
    onClose();
  };

  const handleClaimCode = () => {
    if (!batchCodeInput.trim()) return;
    const success = DataService.claimCode(batchCodeInput, name, roll);
    if (success) {
      alert(lang === 'ar' ? 'تم تأكيد الرمز السري بنجاح وتمت ترقية حسابك!' : 'আলহামদুলিল্লাহ! ব্যাচ কোড সঠিক। আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে।');
      const u = DataService.getCurrentUser();
      if (u) onUpdateProfile(u);
    } else {
      alert(lang === 'ar' ? 'الرمز غير صحيح، يرجى مراجعة إدارة الدفعة' : 'ভুল ব্যাচ কোড! অনুগ্রহ করে ব্যাচের হোয়াটসঅ্যাপ গ্রুপ থেকে সঠিক কোডটি সংগ্রহ করুন।');
    }
  };

  const handleSaveBatchCode = () => {
    DataService.setBatchCode(currentSecretCode);
    alert('নতুন ব্যাচ কোড সংরক্ষিত হয়েছে!');
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateSiteVisuals({ logo: event.target.result as string });
        alert('নতুন লোগো ডিভাইস থেকে সফলভাবে আপলোড হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateSiteVisuals({ cover: event.target.result as string });
        alert('নতুন কভার ছবি ডিভাইস থেকে সফলভাবে আপলোড হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--gold)]" />
            <h3 className="text-base sm:text-lg font-bold text-[var(--gold-light)]">
              {t.settings}
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--gold-light)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--gold)]" />
              {t.switchProfile} (Admin vs Student View)
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">বিভিন্ন ভূমিকা পরীক্ষা করুন</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allMembers.slice(0, 5).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSwitchUser(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentUser?.id === m.id
                    ? 'bg-[var(--gold)] text-black font-bold ring-1 ring-white'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
                }`}
              >
                <span>{m.name}</span>
                <span className="text-[10px] opacity-75">
                  ({m.role === 'admin' ? t.admin : m.role === 'cr' ? t.cr : t.member})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Avatar & Photo Picker */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)]">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[var(--gold)] to-amber-700 text-black font-extrabold text-xl flex items-center justify-center shrink-0 overflow-hidden shadow-md">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{(name || '?')[0]}</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="font-semibold text-white">প্রোফাইল ছবি পরিবর্তন (ডিভাইস থেকে ফাইল নির্বাচন)</div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--gold-light)] hover:bg-[var(--gold)] hover:text-black font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>ছবি পছন্দ করুন</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="text-[var(--text-secondary)] hover:text-red-400"
                  >
                    ছবি সরান
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">ক্লাস রোল *</label>
              <input
                type="text"
                required
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1">রক্তের গ্রুপ</label>
              <select
                value={blood}
                onChange={(e) => setBlood(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
              >
                <option value="">নির্বাচন করুন</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">মোবাইল নম্বর</label>
              <input
                type="text"
                placeholder="018xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1">হল বা ক্যাম্পাসের ঠিকানা</label>
              <input
                type="text"
                placeholder="যেমন: সাদ্দাম হোসেন হল, ইবি"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1">ফেসবুক প্রোফাইল লিংক</label>
              <input
                type="text"
                placeholder="facebook.com/username"
                value={fb}
                onChange={(e) => setFb(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] mb-1">ছোট স্ট্যাটাস বা বায়ো</label>
            <input
              type="text"
              placeholder="যেমন: আল কুরআন ও ইসলামিক স্টাডিজ ৪০তম ব্যাচ শিক্ষার্থী..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold flex items-center gap-1.5 hover:brightness-110"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>

        {/* Batch Code Validation for Members */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2 text-xs">
          <div className="font-bold text-[var(--gold-light)] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[var(--gold)]" />
            <span>{t.batchSecretCode} ({t.claimCode})</span>
          </div>
          <p className="text-[var(--text-secondary)] text-[11px]">
            হোয়াটসঅ্যাপ বা ব্যাচ সিআরের কাছ থেকে পাওয়া গোপন কোডটি এখানে দিয়ে অনুমোদন সম্পূর্ণ করুন।
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="যেমন: ITQAN40IU"
              value={batchCodeInput}
              onChange={(e) => setBatchCodeInput(e.target.value)}
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] uppercase font-mono"
            />
            <button
              type="button"
              onClick={handleClaimCode}
              className="px-4 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black font-bold text-xs text-[var(--gold-light)] transition-colors"
            >
              {t.claimCode}
            </button>
          </div>
        </div>

        {/* Admin Controls Area */}
        {isAdmin && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-3.5 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{t.adminPrivileges} (Admin Hub)</span>
            </div>

            {/* Change batch secret code */}
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)]">বর্তমান ব্যাচ সিক্রেট কোড পরিবর্তন:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSecretCode}
                  onChange={(e) => setCurrentSecretCode(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-amber-200 font-mono flex-1 uppercase"
                />
                <button
                  type="button"
                  onClick={handleSaveBatchCode}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
                >
                  কোড সেভ
                </button>
              </div>
            </div>

            {/* Change Logo & Cover image from Device Files */}
            <div className="space-y-2 pt-2 border-t border-amber-800/30">
              <label className="text-white font-semibold block">
                ডিভাইস ফাইল থেকে অ্যাপ লোগো ও কভার ছবি আপডেট করুন:
              </label>

              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFile}
                className="hidden"
              />
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFile}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black text-[var(--gold-light)] font-bold flex items-center gap-1.5 border border-[var(--gold)]/40 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>নতুন লোগো ফাইল বাছুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => coverFileRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black text-[var(--gold-light)] font-bold flex items-center gap-1.5 border border-[var(--gold)]/40 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>নতুন কভার ছবি ফাইল বাছুন</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
