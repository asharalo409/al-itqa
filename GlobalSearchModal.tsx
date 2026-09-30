import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Calendar,
  Bell,
  Users,
  GraduationCap,
  FolderDown,
  Vote,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { Notice, RoutineItem, Teacher, UserProfile, FileItem, Poll } from '../types';

interface GlobalSearchModalProps {
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  notices: Notice[];
  routine: RoutineItem[];
  teachers: Teacher[];
  members: UserProfile[];
  files: FileItem[];
  polls: Poll[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onClose,
  onNavigateTab,
  notices,
  routine,
  teachers,
  members,
  files,
  polls,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  // Search across modules
  const matchingMembers = q
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.roll.includes(q) ||
          (m.designation && m.designation.toLowerCase().includes(q)) ||
          (m.blood && m.blood.toLowerCase().includes(q)) ||
          (m.phone && m.phone.includes(q)) ||
          (m.addr && m.addr.toLowerCase().includes(q))
      )
    : [];

  const matchingRoutine = q
    ? routine.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          (r.room && r.room.toLowerCase().includes(q))
      )
    : [];

  const matchingNotices = q
    ? notices.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.category && n.category.toLowerCase().includes(q))
      )
    : [];

  const matchingTeachers = q
    ? teachers.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.designation && t.designation.toLowerCase().includes(q)) ||
          (t.courses && t.courses.some((c) => c.toLowerCase().includes(q)))
      )
    : [];

  const matchingFiles = q
    ? files.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.course_code && f.course_code.toLowerCase().includes(q))
      )
    : [];

  const matchingPolls = q
    ? polls.filter((p) => p.question.toLowerCase().includes(q))
    : [];

  const totalResults =
    matchingMembers.length +
    matchingRoutine.length +
    matchingNotices.length +
    matchingTeachers.length +
    matchingFiles.length +
    matchingPolls.length;

  const handleSelect = (tabId: string) => {
    onNavigateTab(tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--gold)]/60 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-10 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--bg-card-subtle)]">
          <Search className="w-5 h-5 text-[var(--gold)] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="রুটিন, নোটিশ, সহপাঠী, উস্তাজ, ফাইল বা রক্তের গ্রুপ খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-sm sm:text-base focus:outline-none placeholder-[var(--text-secondary)]/60 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!query ? (
            <div className="text-center py-12 text-[var(--text-secondary)] space-y-2">
              <Search className="w-8 h-8 text-[var(--gold)]/40 mx-auto" />
              <p className="text-sm">যেকোনো শব্দ লিখে মুহূর্তেই খুঁজুন</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2 text-[11px]">
                {['AQIS 1101', 'তাফসীর', 'মিডটার্ম', 'O+', 'রুটিন', 'পোল'].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setQuery(sample)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--gold-light)] hover:border-[var(--gold)]"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              "{query}" সম্পর্কিত কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="space-y-4">
              {/* Routine Results */}
              {matchingRoutine.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>ক্লাস রুটিন ({matchingRoutine.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingRoutine.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelect('routine')}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-[var(--gold-light)]">
                            {r.subject} ({r.code})
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {r.room ? `রুম: ${r.room} · ` : ''}
                            {r.start_time ? `${r.start_time} - ${r.end_time}` : r.time}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Results */}
              {matchingMembers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Users className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>সহপাঠী ও সদস্য ({matchingMembers.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {matchingMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect('members')}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[var(--gold)] text-black font-bold flex items-center justify-center text-[10px]">
                            {m.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-[var(--gold-light)] flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {m.designation && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-normal">
                                  {m.designation}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)]">
                              রোল: {m.roll} · 🩸 {m.blood}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notices Results */}
              {matchingNotices.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Bell className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>নোটিশ ও বিজ্ঞপ্তি ({matchingNotices.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingNotices.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleSelect('notice')}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <span className="font-medium text-white group-hover:text-[var(--gold-light)]">
                          {n.title}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Results */}
              {matchingTeachers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>সম্মানিত উস্তাজ ({matchingTeachers.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingTeachers.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('teachers')}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-[var(--gold-light)]">{t.name}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{t.designation} · {t.room}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Results */}
              {matchingFiles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <FolderDown className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>একাডেমিক ফাইল ও হ্যান্ডনোট ({matchingFiles.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingFiles.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => handleSelect('files')}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <span className="font-medium text-white group-hover:text-[var(--gold-light)]">{f.name}</span>
                        <ArrowRight className="w-4 h-4 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Polls Results */}
              {matchingPolls.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[var(--gold-light)] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Vote className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>পোল ও ভোটিং ({matchingPolls.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingPolls.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('polls')}
                        className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <span className="font-medium text-white group-hover:text-[var(--gold-light)]">{p.question}</span>
                        <ArrowRight className="w-4 h-4 text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
