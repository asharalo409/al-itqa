import React, { useState } from 'react';
import {
  MessageCircleQuestion,
  Send,
  Search,
  ShieldCheck,
  EyeOff,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { Complaint, UserProfile } from '../types';

interface ComplaintBoxProps {
  complaints: Complaint[];
  currentUser: UserProfile | null;
  onSubmitComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'created_at'>) => Complaint;
  onUpdateComplaint: (id: string | number, status: 'pending' | 'review' | 'done', reply?: string) => void;
}

export const COMPLAINT_CATEGORIES: { id: Complaint['category']; label: string }[] = [
  { id: 'academic', label: 'একাডেমিক / ক্লাস সংক্রান্ত' },
  { id: 'room', label: 'অনুষদ রুম ও প্রজেক্টর সুবিধা' },
  { id: 'exam', label: 'পরীক্ষা ও সিলেবাস' },
  { id: 'other', label: 'অন্যান্য পরামর্শ বা অভিযোগ' },
];

export const STATUS_CONFIG: Record<
  Complaint['status'],
  { label: string; color: string; border: string }
> = {
  pending: { label: 'অপেক্ষায় রয়েছে', color: 'text-amber-400 bg-amber-950/60', border: 'border-amber-800/60' },
  review: { label: 'বিবেচনায় / পর্যালোচনাধীন', color: 'text-blue-400 bg-blue-950/60', border: 'border-blue-800/60' },
  done: { label: 'সমাধান সম্পন্ন', color: 'text-emerald-400 bg-emerald-950/60', border: 'border-emerald-800/60' },
};

export const ComplaintBox: React.FC<ComplaintBoxProps> = ({
  complaints,
  currentUser,
  onSubmitComplaint,
  onUpdateComplaint,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('academic');
  const [isAnon, setIsAnon] = useState<boolean>(true);
  const [trackingCodeQuery, setTrackingCodeQuery] = useState('');
  const [trackedResult, setTrackedResult] = useState<Complaint | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Admin reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const uniqueCode = 'ITQ-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const created = onSubmitComplaint({
      title: title.trim(),
      body: body.trim(),
      category,
      code: isAnon ? uniqueCode : null,
      user_id: isAnon ? null : currentUser?.id || null,
      name: isAnon ? null : currentUser?.name || 'শিক্ষার্থী',
    });

    if (isAnon) {
      setGeneratedCode(uniqueCode);
    }

    setTitle('');
    setBody('');
  };

  const handleTrack = () => {
    if (!trackingCodeQuery.trim()) return;
    const found = complaints.find(
      (c) => c.code && c.code.toUpperCase() === trackingCodeQuery.trim().toUpperCase()
    );
    setTrackedResult(found || null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-[var(--gold-light)] font-bold text-base sm:text-lg">
          <MessageCircleQuestion className="w-5 h-5 text-[var(--gold)]" />
          <h2>গোপন অভিযোগ ও গঠনমূলক মতামত বাক্স</h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          ব্যাচের সার্বিক উন্নয়ন, অনুষদের সুযোগ-সুবিধা বা যেকোনো সমস্যায় আপনার মতামত জানান।
          আপনি চাইলে নিজের নাম সম্পূর্ণ গোপন রাখতে পারেন। একটি বিশেষ ট্র্যাকিং কোড পাবেন যা দিয়ে যেকোনো সময় অ্যাডমিনের উত্তর দেখতে পারবেন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Form: Submit Complaint */}
        <div className="lg:col-span-2 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3.5"
          >
            <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--gold)]" />
              আপনার অভিযোগ বা পরামর্শ লিখুন
            </h3>

            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">ক্যাটাগরি বা বিষয় নির্বাচন করুন</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)]"
              >
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">শিরোনাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ২০৩ নম্বর কক্ষের ফ্যান/প্রজেক্টর সমস্যা..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)]"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">বিস্তারিত বিবরণ *</label>
              <textarea
                required
                rows={4}
                placeholder="সমস্যাটি কীভাবে সমাধান করা যায় বা কী অসুবিধা হচ্ছে বিস্তারিত লিখুন..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:border-[var(--gold)] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[var(--gold-light)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnon}
                  onChange={(e) => setIsAnon(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--gold)]"
                />
                <span className="flex items-center gap-1 font-semibold">
                  <EyeOff className="w-3.5 h-3.5 text-[var(--gold)]" />
                  নাম পরিচয় ১০০% গোপন রাখুন
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>জমা দিন</span>
              </button>
            </div>
          </form>

          {/* Generated Code Alert */}
          {generatedCode && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold text-sm flex items-center gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                আপনার অভিযোগ সফলভাবে জমা হয়েছে!
              </div>
              <p>আপনার পরিচয় সম্পূর্ণ গোপন রাখা হয়েছে। এই ট্র্যাকিং কোডটি সংরক্ষণ করুন:</p>
              <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/40 text-center font-mono font-bold text-base text-amber-300 tracking-wider">
                {generatedCode}
              </div>
              <p className="text-[11px] opacity-75">
                ডানপাশের 'ট্র্যাকিং কোড দিয়ে দেখুন' বক্সে এই কোডটি লিখে সার্চ করে অ্যাডমিনের উত্তর ও অবস্থা জানতে পারবেন।
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Tracking Code Tool & Admin List */}
        <div className="space-y-4">
          {/* Tracking Search Box */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[var(--gold-light)] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--gold)]" />
              ট্র্যাকিং কোড দিয়ে জবাব দেখুন
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="যেমন: ITQ-PRJ01"
                value={trackingCodeQuery}
                onChange={(e) => setTrackingCodeQuery(e.target.value)}
                className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono uppercase focus:border-[var(--gold)]"
              />
              <button
                onClick={handleTrack}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black border border-[var(--border-color)] text-xs text-[var(--gold-light)] font-bold transition-colors"
              >
                খুঁজুন
              </button>
            </div>

            {trackedResult && (
              <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{trackedResult.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      STATUS_CONFIG[trackedResult.status].color
                    }`}
                  >
                    {STATUS_CONFIG[trackedResult.status].label}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-[11px]">{trackedResult.body}</p>
                {trackedResult.reply ? (
                  <div className="p-2 rounded-lg bg-[var(--accent)]/50 border border-[var(--gold)]/30 text-[var(--gold-light)]">
                    <strong className="block text-white mb-0.5">↳ অ্যাডমিনের উত্তর:</strong>
                    {trackedResult.reply}
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-300">
                    ⏳ অ্যাডমিন এখনো বিষয়টি পর্যালোচনা করছেন। শীঘ্রই উত্তর আসবে ইনশাআল্লাহ।
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaints List (Admin or Public View) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-[var(--gold-light)]">
          {isAdmin ? 'সকল অভিযোগ ও পরামর্শ (অ্যাডমিন ভিউ)' : 'গৃহীত সাম্প্রতিক মতামত ও সমাধান'} ({complaints.length})
        </h3>

        <div className="space-y-3">
          {complaints.map((c) => {
            const stCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
            const replyDraft = replyTextMap[c.id.toString()] ?? (c.reply || '');

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{c.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border ${stCfg.color} ${stCfg.border}`}
                    >
                      {stCfg.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {c.name ? `প্রেরক: ${c.name}` : '🕶️ নাম গোপন রাখা হয়েছে'} ·{' '}
                    {new Date(c.created_at).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.body}</p>

                {c.reply && (
                  <div className="p-3 rounded-xl bg-[var(--accent)]/40 border border-[var(--gold)]/30 text-xs text-[var(--gold-light)] space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      অ্যাডমিন রেসপন্স / ব্যবস্থা:
                    </span>
                    <p className="leading-relaxed">{c.reply}</p>
                  </div>
                )}

                {/* Admin Status update & reply form */}
                {isAdmin && (
                  <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-secondary)]">অবস্থা পরিবর্তন:</span>
                      {(['pending', 'review', 'done'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => onUpdateComplaint(c.id, s, c.reply || undefined)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            c.status === s
                              ? 'bg-[var(--gold)] text-black font-bold'
                              : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                          }`}
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="উত্তর লিখুন..."
                        value={replyDraft}
                        onChange={(e) =>
                          setReplyTextMap({ ...replyTextMap, [c.id.toString()]: e.target.value })
                        }
                        className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)]"
                      />
                      <button
                        onClick={() => onUpdateComplaint(c.id, c.status, replyDraft)}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--gold)] text-black font-bold text-xs"
                      >
                        উত্তর সেভ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
