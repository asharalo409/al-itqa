import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  FileText,
  FlaskConical,
  Trophy,
  BookOpen,
  Filter,
  Search,
} from 'lucide-react';
import { Notice, NoticeCategory, Teacher, RoutineItem, UserProfile } from '../types';

interface NoticeBoardProps {
  notices: Notice[];
  teachers: Teacher[];
  routine: RoutineItem[];
  currentUser: UserProfile | null;
  onAddNotice: (notice: Omit<Notice, 'id' | 'created_at'>) => void;
  onDeleteNotice: (id: string | number) => void;
}

export const CATEGORY_CONFIG: Record<
  NoticeCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string }
> = {
  urgent: { label: 'জরুরি নোটিশ', icon: AlertCircle, color: 'text-red-400 bg-red-950/60', border: 'border-red-800/60' },
  exam: { label: 'পরীক্ষা', icon: FlaskConical, color: 'text-amber-400 bg-amber-950/60', border: 'border-amber-800/60' },
  assignment: { label: 'অ্যাসাইনমেন্ট', icon: FileText, color: 'text-blue-400 bg-blue-950/60', border: 'border-blue-800/60' },
  homework: { label: 'বাড়ির কাজ', icon: BookOpen, color: 'text-emerald-400 bg-emerald-950/60', border: 'border-emerald-800/60' },
  tutorial: { label: 'টিউটোরিয়াল', icon: BookOpen, color: 'text-purple-400 bg-purple-950/60', border: 'border-purple-800/60' },
  sports: { label: 'খেলাধুলা ও ইভেন্ট', icon: Trophy, color: 'text-green-400 bg-green-950/60', border: 'border-green-800/60' },
  general: { label: 'সাধারণ', icon: Bell, color: 'text-slate-300 bg-slate-800/50', border: 'border-slate-700/60' },
};

function formatCountdown(dueDateStr?: string | null): { text: string; isPassed: boolean } | null {
  if (!dueDateStr) return null;
  const target = new Date(dueDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { text: 'সময় শেষ হয়েছে', isPassed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const toBn = (n: number) => n.toLocaleString('bn-BD');
  let formatted = '';
  if (days > 0) {
    formatted = `${toBn(days)} দিন ${toBn(hours)} ঘণ্টা বাকি`;
  } else if (hours > 0) {
    formatted = `${toBn(hours)} ঘণ্টা ${toBn(minutes)} মিনিট বাকি`;
  } else {
    formatted = `${toBn(minutes)} মিনিট বাকি`;
  }

  return { text: formatted, isPassed: false };
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  notices,
  teachers,
  routine,
  currentUser,
  onAddNotice,
  onDeleteNotice,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New notice form state
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<NoticeCategory>('general');
  const [newDue, setNewDue] = useState('');
  const [newTeacherId, setNewTeacherId] = useState<string>('');

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCat === 'all' || (n.category || 'general') === selectedCat;
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.category && n.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddNotice({
      title: newTitle.trim(),
      category: newCat,
      due: newDue ? new Date(newDue).toISOString() : null,
      teacher_id: newTeacherId ? parseInt(newTeacherId, 10) : null,
    });

    setNewTitle('');
    setNewCat('general');
    setNewDue('');
    setNewTeacherId('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header controls & Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--gold-light)] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--gold)]" />
              নোটিশ ও একাডেমিক ডেডলাইন
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              পরীক্ষা, অ্যাসাইনমেন্ট, বাড়ির কাজ ও ব্যাচের গুরুত্বপূর্ণ আপডেট
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="নোটিশ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>

            {isAdminOrCr && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন নোটিশ</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 mt-2 border-t border-[var(--border-color)]/50">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
              selectedCat === 'all'
                ? 'bg-[var(--gold)] text-black font-bold'
                : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
            }`}
          >
            সকল ({notices.length})
          </button>

          {(Object.keys(CATEGORY_CONFIG) as NoticeCategory[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const count = notices.filter((n) => (n.category || 'general') === cat).length;
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-[var(--gold)] text-black font-bold shadow-sm'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
                }`}
              >
                <span>{cfg.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-3">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const cat = notice.category || 'general';
            const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.general;
            const Icon = cfg.icon;
            const countdown = formatCountdown(notice.due);
            const teacher = teachers.find((t) => t.id === notice.teacher_id);

            return (
              <div
                key={notice.id}
                className={`p-4 rounded-2xl bg-[var(--bg-card)] border ${cfg.border} hover:border-[var(--gold)]/60 transition-all shadow-sm group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Category Icon Badge */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.color} ${cfg.border}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Quiet Unboxed Metadata: Anti-Slop Discipline */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1">
                        <span className="font-semibold text-[var(--gold-light)]">{cfg.label}</span>
                        {teacher && (
                          <>
                            <span aria-hidden="true" className="opacity-40">·</span>
                            <span className="text-[var(--text-primary)]">👨‍🏫 {teacher.name}</span>
                          </>
                        )}
                        <span aria-hidden="true" className="opacity-40">·</span>
                        <span>
                          {new Date(notice.created_at).toLocaleDateString('bn-BD', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                        {notice.title}
                      </h3>

                      {/* Due Date & Live Countdown */}
                      {notice.due && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]/50 text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
                            <span>
                              জমার তারিখ:{' '}
                              {new Date(notice.due).toLocaleString('bn-BD', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {countdown && (
                            <div
                              className={`flex items-center gap-1 font-semibold ${
                                countdown.isPassed ? 'text-red-400' : 'text-amber-400'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>⏳ {countdown.text}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Delete Action */}
                  {isAdminOrCr && (
                    <button
                      onClick={() => onDeleteNotice(notice.id)}
                      title="মুছুন"
                      className="text-[var(--text-secondary)] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <Bell className="w-8 h-8 text-[var(--gold)]/40 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">এই ক্যাটাগরিতে কোনো নোটিশ নেই</p>
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" />
                নতুন নোটিশ প্রকাশ করুন
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--text-secondary)] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">নোটিশের বিবরণ / শিরোনাম *</label>
                <textarea
                  required
                  rows={3}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: আগামী রবিবার AQIS 1101 কোর্সের ১ম মিডটার্ম পরীক্ষা অনুষ্ঠিত হবে..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ক্যাটাগরি</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as NoticeCategory)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as NoticeCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_CONFIG[c].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">সংশ্লিষ্ট শিক্ষক (ঐচ্ছিক)</label>
                  <select
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                  >
                    <option value="">কোনো শিক্ষক নির্ধারিত নেই</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">
                  জমার শেষ তারিখ ও সময় (ডেডলাইন - ঐচ্ছিক)
                </label>
                <input
                  type="datetime-local"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold hover:brightness-110"
                >
                  প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
