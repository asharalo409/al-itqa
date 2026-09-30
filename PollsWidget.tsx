import React, { useState } from 'react';
import {
  Vote,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Lock,
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Poll, UserProfile, Language } from '../types';
import { DataService } from '../services/supabase';
import { T_DICT } from '../data/translations';

interface PollsWidgetProps {
  polls: Poll[];
  currentUser: UserProfile | null;
  onRefreshPolls: () => void;
  lang?: Language;
  compactMode?: boolean;
}

export const PollsWidget: React.FC<PollsWidgetProps> = ({
  polls,
  currentUser,
  onRefreshPolls,
  lang = 'bn',
  compactMode = false,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [expiresAt, setExpiresAt] = useState('');

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  const handleVote = (pollId: string, optionId: string) => {
    if (!currentUser) return;
    DataService.votePoll(pollId, optionId, currentUser.id);
    onRefreshPolls();
  };

  const handleAddOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOptionField = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) {
      alert('পোলের প্রশ্ন এবং কমপক্ষে ২টি অপশন প্রদান করুন!');
      return;
    }

    DataService.createPoll({
      question: question.trim(),
      description: description.trim() || undefined,
      options: validOptions.map((text, idx) => ({
        id: 'opt-' + Date.now() + '-' + idx,
        text,
        votes: [],
      })),
      createdBy: currentUser?.name || 'শিক্ষার্থী',
      creatorId: currentUser?.id,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });

    setQuestion('');
    setDescription('');
    setOptions(['', '']);
    setExpiresAt('');
    setShowCreateModal(false);
    onRefreshPolls();
  };

  const handleDelete = (id: string) => {
    if (confirm('পোলটি মুছে ফেলতে চান?')) {
      DataService.deletePoll(id);
      onRefreshPolls();
    }
  };

  const handleToggleClose = (id: string) => {
    DataService.togglePollStatus(id);
    onRefreshPolls();
  };

  const activePolls = polls.filter((p) => p.isActive);

  // If compactMode (for HomeDashboard top widget)
  if (compactMode) {
    if (!activePolls.length) return null;
    const latestPoll = activePolls[0];
    const totalVotes = latestPoll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/80 via-[#260e19] to-amber-950/80 border border-[var(--gold)]/60 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <Vote className="w-4 h-4 text-[var(--gold)]" />
              চলমান ব্যাচ পোল ও ভোটিং
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[var(--gold-light)] font-medium">
            <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>
              {latestPoll.expiresAt
                ? `শেষ সময়: ${new Date(latestPoll.expiresAt).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}`
                : 'সকলের মতামত কাম্য'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
            {latestPoll.question}
          </h3>
          {latestPoll.description && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {latestPoll.description}
            </p>
          )}
        </div>

        {/* Voting Options */}
        <div className="space-y-2 pt-1">
          {latestPoll.options.map((opt) => {
            const hasVotedThis = currentUser && opt.votes.includes(currentUser.id);
            const optVotes = opt.votes.length;
            const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleVote(latestPoll.id, opt.id)}
                className={`w-full p-2.5 sm:p-3 rounded-2xl text-left relative overflow-hidden transition-all group ${
                  hasVotedThis
                    ? 'border-2 border-[var(--gold)] bg-[var(--accent)] shadow-md'
                    : 'border border-[var(--border-color)] bg-[var(--bg-main)]/70 hover:border-[var(--gold)]/60'
                }`}
              >
                {/* Visual percentage progress bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--gold)]/20 transition-all duration-500 rounded-2xl pointer-events-none"
                  style={{ width: `${pct}%` }}
                ></div>

                <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        hasVotedThis
                          ? 'border-[var(--gold)] bg-[var(--gold)] text-black font-black'
                          : 'border-[var(--text-secondary)]'
                      }`}
                    >
                      {hasVotedThis && '✓'}
                    </span>
                    <span className={`font-semibold ${hasVotedThis ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {opt.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="text-[var(--gold-light)] font-bold">{pct}%</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">({optVotes})</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <span>
            সর্বমোট ভোট প্রদান: <strong className="text-white">{totalVotes}</strong> জন
          </span>
          <span className="italic">আপনার পছন্দের অপশনে ক্লিক করে ভোট দিন</span>
        </div>
      </div>
    );
  }

  // Full Page view for Polls
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)] flex items-center gap-2">
            <Vote className="w-5 h-5 text-[var(--gold)]" />
            ব্যাচ পোল ও উন্মুক্ত ভোটিং সিস্টেম
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            পরীক্ষার তারিখ, পিকনিকের ভেন্যু বা যেকোনো যৌথ সিদ্ধান্তে সবার ভোট গ্রহণ
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md hover:brightness-110 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পোল তৈরি করুন</span>
        </button>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {polls.length > 0 ? (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
            const userVotedOpt = poll.options.find(
              (o) => currentUser && o.votes.includes(currentUser.id)
            );

            return (
              <div
                key={poll.id}
                className={`p-4 sm:p-5 rounded-3xl bg-[var(--bg-card)] border transition-all shadow-sm space-y-3.5 ${
                  poll.isActive
                    ? 'border-[var(--gold)]/50'
                    : 'border-[var(--border-color)] opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        poll.isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {poll.isActive ? 'চলমান পোল' : 'বন্ধকৃত পোল'}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      তৈরি করেছেন: {poll.createdBy}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {poll.expiresAt && (
                      <span className="text-[var(--gold-light)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(poll.expiresAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}

                    {isAdminOrCr && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleToggleClose(poll.id)}
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white"
                        >
                          {poll.isActive ? 'পোল বন্ধ করুন' : 'পুনরায় খুলুন'}
                        </button>
                        <button
                          onClick={() => handleDelete(poll.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{poll.question}</h3>
                  {poll.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {poll.description}
                    </p>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const hasVotedThis = userVotedOpt?.id === opt.id;
                    const optVotes = opt.votes.length;
                    const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!poll.isActive}
                        onClick={() => handleVote(poll.id, opt.id)}
                        className={`w-full p-3 rounded-2xl text-left relative overflow-hidden transition-all group ${
                          hasVotedThis
                            ? 'border-2 border-[var(--gold)] bg-[var(--accent)] shadow-md'
                            : 'border border-[var(--border-color)] bg-[var(--bg-main)]/60 hover:border-[var(--gold)]/60'
                        }`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-[var(--gold)]/20 transition-all duration-500 rounded-2xl pointer-events-none"
                          style={{ width: `${pct}%` }}
                        ></div>

                        <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                hasVotedThis
                                  ? 'border-[var(--gold)] bg-[var(--gold)] text-black font-black'
                                  : 'border-[var(--text-secondary)]'
                              }`}
                            >
                              {hasVotedThis && '✓'}
                            </span>
                            <span className="font-semibold text-white">{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-2 font-mono shrink-0">
                            <span className="text-[var(--gold-light)] font-bold">{pct}%</span>
                            <span className="text-[10px] text-[var(--text-secondary)]">({optVotes})</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between pt-1">
                  <span>মোট প্রদত্ত ভোট: {totalVotes} জন</span>
                  {userVotedOpt && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      আপনি ভোট দিয়েছেন: {userVotedOpt.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-xs text-[var(--text-secondary)]">
            <Vote className="w-10 h-10 text-[var(--gold)]/30 mx-auto mb-2" />
            <p>বর্তমানে কোনো সক্রিয় পোল নেই। উপরে থেকে নতুন পোল তৈরি করতে পারেন।</p>
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" />
                নতুন ব্যাচ পোল তৈরি করুন
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--text-secondary)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3.5">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">
                  পোলের মূল বিষয় / প্রশ্ন *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মিডটার্ম পরীক্ষার দিনক্ষণ নির্বাচন"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">
                  বিস্তারিত বিবরণ / কারণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  placeholder="পোলটি কেন দেওয়া হয়েছে বা বিশেষ কোনো নির্দেশনা..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold text-white">
                  অপশনসমূহ (কমপক্ষে ২টি) *
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-[var(--gold)] font-bold">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`অপশন ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-white"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOptionField}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold-light)] font-medium text-xs w-full text-center"
                    >
                      + আরেকটি অপশন যোগ করুন
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">
                  ভোটগ্রহণের শেষ সময় ও তারিখ (ডেডলাইন - ঐচ্ছিক)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold"
                >
                  পোল চালু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
