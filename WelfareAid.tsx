import React, { useState } from 'react';
import {
  HandHeart,
  Plus,
  Heart,
  Phone,
  CheckCircle2,
  AlertCircle,
  Coins,
  Send,
  EyeOff,
  User,
} from 'lucide-react';
import { WelfareRequest, UserProfile, Language } from '../types';
import { DataService } from '../services/supabase';
import { T_DICT } from '../data/translations';

interface WelfareAidProps {
  requests: WelfareRequest[];
  currentUser: UserProfile | null;
  onRefreshRequests: () => void;
  onOpenPaymentModal?: () => void;
  lang?: Language;
}

export const CATEGORY_LABELS: Record<WelfareRequest['category'], string> = {
  medical: 'জরুরি চিকিৎসা সহায়তা 🏥',
  tuition: 'সেমিস্টার ফি ও পড়াশোনা 🎓',
  emergency: 'জরুরি বিপদকালীন সাহায্য 🚨',
  books: 'বই ও হ্যান্ডনোট সহায়তা 📚',
  other: 'অন্যান্য সার্বিক সহায়তা 🤝',
};

export const WelfareAid: React.FC<WelfareAidProps> = ({
  requests,
  currentUser,
  onRefreshRequests,
  onOpenPaymentModal,
  lang = 'bn',
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WelfareRequest['category']>('medical');
  const [amountNeeded, setAmountNeeded] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    DataService.createWelfareRequest({
      title: title.trim(),
      category,
      amountNeeded: amountNeeded ? parseFloat(amountNeeded) : undefined,
      description: description.trim(),
      phone: phone.trim() || undefined,
      isAnonymous,
      applicantName: isAnonymous ? undefined : currentUser?.name,
      applicantRoll: isAnonymous ? undefined : currentUser?.roll,
    });

    setTitle('');
    setAmountNeeded('');
    setDescription('');
    setShowApplyModal(false);
    onRefreshRequests();
    alert('সহায়তার আবেদনটি জমা হয়েছে। অ্যাডমিন ও সিআর বিষয়টি যাচাই করবেন।');
  };

  const handleUpdateRaised = (id: string) => {
    const amtStr = prompt('যুক্ত করার টাকার পরিমাণ (৳):');
    if (!amtStr) return;
    const amt = parseFloat(amtStr);
    if (!isNaN(amt) && amt > 0) {
      DataService.contributeToWelfare(id, amt);
      onRefreshRequests();
    }
  };

  const handleStatusChange = (id: string, status: 'active' | 'completed' | 'closed') => {
    DataService.updateWelfareStatus(id, status);
    onRefreshRequests();
  };

  const toBn = (n: number) => n.toLocaleString('bn-BD');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#19261a] to-emerald-950 border border-emerald-700/50 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-bold border border-emerald-700/50 mb-1">
              <HandHeart className="w-3.5 h-3.5 text-emerald-400" />
              <span>পারস্পরিক সহায়তা ও কল্যাণ তহবিল</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              আল ইতকান ৪০ কল্যাণ ও ভ্রাতৃত্ব উইং
            </h2>
            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-xl">
              বিপদে সহপাঠীর পাশে দাঁড়ানো আমাদের নৈতিক দায়িত্ব। যেকোনো জরুরি প্রয়োজনে নাম গোপন রেখে আবেদন করুন অথবা সরাসরি সহযোগিতা করুন।
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>সহায়তার আবেদন করুন</span>
          </button>
        </div>
      </div>

      {/* Welfare Requests Grid */}
      <div className="space-y-3.5">
        {requests.length > 0 ? (
          requests.map((req) => {
            const needed = req.amountNeeded || 0;
            const raised = req.amountRaised || 0;
            const pct = needed > 0 ? Math.min(100, Math.round((raised / needed) * 100)) : 100;

            return (
              <div
                key={req.id}
                className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-600/60 transition-all shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                      {CATEGORY_LABELS[req.category] || req.category}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {req.isAnonymous ? '🕶️ পরিচয় গোপন' : `আবেদনকারী: ${req.applicantName} (রোল ${req.applicantRoll})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : req.status === 'active'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {req.status === 'completed' ? 'সম্পন্ন হয়েছে ✔' : req.status === 'active' ? 'চলমান আবেদন ⏳' : 'বন্ধ'}
                    </span>

                    {isAdminOrCr && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleUpdateRaised(req.id)}
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-main)] text-[var(--gold-light)] hover:text-white border border-[var(--border-color)]"
                          title="সংগৃহীত টাকা বাড়ান"
                        >
                          + টাকা যোগ
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, req.status === 'active' ? 'completed' : 'active')}
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white"
                        >
                          অবস্থা বদলান
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{req.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {needed > 0 && (
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between items-center text-[var(--text-secondary)]">
                      <span>তহবিল অগ্রগতি ({pct}% সংগৃহীত)</span>
                      <span className="font-bold text-emerald-400">
                        ৳ {toBn(raised)} / ৳ {toBn(needed)}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]/50 text-xs">
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    📅 {new Date(req.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>

                  {req.phone && !req.isAnonymous && (
                    <a
                      href={`tel:${req.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>যোগাযোগ: {req.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-xs text-[var(--text-secondary)]">
            <HandHeart className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
            <p>বর্তমানে কোনো বিশেষ সহায়তার আবেদন সক্রিয় নেই।</p>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <HandHeart className="w-4 h-4 text-emerald-400" />
                সহায়তা বা ফান্ডের আবেদন ফরম
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">সহায়তার শিরোনাম / উদ্দেশ্য *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জরুরি রক্ত বা চিকিৎসার ওষুধ সহায়তা"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                  >
                    {Object.keys(CATEGORY_LABELS).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat as WelfareRequest['category']]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">আনুমানিক প্রয়োজনীয় টাকা (৳)</label>
                  <input
                    type="number"
                    placeholder="যেমন: ৫০০০"
                    value={amountNeeded}
                    onChange={(e) => setAmountNeeded(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">বিস্তারিত বিবরণ ও পরিস্থিতি *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="পরিস্থিতি ব্যাখ্যা করুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">জরুরি মোবাইল নম্বর (সিআরের যোগাযোগের জন্য)</label>
                <input
                  type="text"
                  placeholder="018xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--gold)]"
                  />
                  <span className="font-bold text-[var(--gold-light)] flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-[var(--gold)]" />
                    নাম-পরিচয় সবার কাছে সম্পূর্ণ গোপন রাখুন
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold"
                >
                  আবেদন জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
