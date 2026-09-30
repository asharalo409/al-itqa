import React, { useState } from 'react';
import {
  Heart,
  Phone,
  Search,
  MapPin,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  User,
} from 'lucide-react';
import { UserProfile } from '../types';

interface BloodBankProps {
  members: UserProfile[];
  currentUser: UserProfile | null;
  onOpenProfile: () => void;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BloodBank: React.FC<BloodBankProps> = ({
  members,
  currentUser,
  onOpenProfile,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const approved = members.filter((m) => m.status === 'approved' && m.blood);

  const filtered = approved.filter((m) => {
    const matchesGroup = selectedGroup === 'all' || m.blood.toUpperCase() === selectedGroup;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.addr && m.addr.toLowerCase().includes(search.toLowerCase())) ||
      m.roll.includes(search);
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Hero Alert */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950 via-[#260a12] to-red-950 border border-red-800/60 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-900/60 text-red-200 text-xs font-bold border border-red-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              জরুরি ব্লাড ব্যাংক
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              আল ইতকান ৪০ রক্তদাতা ডিরেক্টরি
            </h2>
            <p className="text-xs text-red-200/80 max-w-xl leading-relaxed">
              যেকোনো জরুরি প্রয়োজনে সহপাঠী বা কুষ্টিয়া সদর হাসপাতাল ও ক্যাম্পাসে জরুরি রক্তের জন্য সরাসরি যোগাযোগ করুন।
            </p>
          </div>

          <button
            onClick={onOpenProfile}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-red-950/50 active:scale-95 transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>আমিও রক্ত দিতে ইচ্ছুক</span>
          </button>
        </div>
      </div>

      {/* Blood Group Selectors */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-bold text-[var(--gold-light)] flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500" />
            <span>গ্রুপ অনুযায়ী রক্তদাতা খুঁজুন:</span>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="নাম বা ঠিকানা দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
        </div>

        {/* Group Badges Grid */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGroup === 'all'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
            }`}
          >
            সকল রক্তদাতা ({approved.length})
          </button>

          {BLOOD_GROUPS.map((bg) => {
            const count = approved.filter((m) => m.blood.toUpperCase() === bg).length;
            const isSelected = selectedGroup === bg;

            return (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-[var(--bg-main)] text-red-400 hover:text-red-200 border border-[var(--border-color)] hover:border-red-800'
                }`}
              >
                <span>{bg}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Donors List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.length > 0 ? (
          filtered.map((donor) => (
            <div
              key={donor.id}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-red-800/80 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center font-black text-red-300 text-sm shrink-0">
                      {donor.blood}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                        {donor.name}
                      </h4>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        রোল: {donor.roll}
                      </div>
                    </div>
                  </div>
                </div>

                {donor.addr && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">{donor.addr}</span>
                  </div>
                )}
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[var(--border-color)]/60">
                {donor.phone ? (
                  <a
                    href={`tel:${donor.phone}`}
                    className="w-full py-2 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                    <span>জরুরি কল: {donor.phone}</span>
                  </a>
                ) : (
                  <span className="text-center block text-xs text-[var(--text-secondary)] opacity-60">
                    মোবাইল নম্বর দেওয়া নেই
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <Heart className="w-8 h-8 text-red-500/40 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              এই গ্রুপের কোনো নিবন্ধিত রক্তদাতা পাওয়া যায়নি
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
