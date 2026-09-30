import React, { useState } from 'react';
import {
  FolderDown,
  FileText,
  BookOpen,
  Presentation,
  FileQuestion,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { FileItem, UserProfile } from '../types';

interface AcademicFilesProps {
  files: FileItem[];
  currentUser: UserProfile | null;
  onAddFile: (file: Omit<FileItem, 'id' | 'created_at'>) => void;
  onDeleteFile: (id: string | number) => void;
}

export const FILE_CATEGORIES: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'সকল ফাইল', icon: FolderDown },
  { id: 'note', label: 'হ্যান্ডনোট ও নোটস', icon: FileText },
  { id: 'book', label: 'রেফারেন্স কিতাব ও বই', icon: BookOpen },
  { id: 'slide', label: 'লেকচার স্লাইড', icon: Presentation },
  { id: 'question', label: 'বিগত বছরের প্রশ্ন', icon: FileQuestion },
  { id: 'video', label: 'ভিডিও ও ওয়েব লিংক', icon: Video },
];

export const AcademicFiles: React.FC<AcademicFilesProps> = ({
  files,
  currentUser,
  onAddFile,
  onDeleteFile,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<'note' | 'book' | 'slide' | 'question' | 'video' | 'link'>('note');
  const [courseCode, setCourseCode] = useState('AQIS 1101');

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  const filtered = files.filter((f) => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.course_code && f.course_code.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    onAddFile({
      name: name.trim(),
      url: url.trim(),
      category,
      course_code: courseCode.trim(),
    });

    setName('');
    setUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Search */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)] flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-[var(--gold)]" />
              একাডেমিক ই-লাইব্রেরি ও ফাইলসম্ভার
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              হ্যান্ডনোট, স্লাইড, বিগত সেমিস্টারের প্রশ্ন এবং গুরুত্বপূর্ণ রেফারেন্স কিতাব
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="ফাইলের নাম বা কোর্স..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
              />
            </div>

            {isAdminOrCr && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ফাইল যোগ</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 mt-2 border-t border-[var(--border-color)]/50">
          {FILE_CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-[var(--gold)] text-black font-bold shadow-sm'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((f) => (
            <div
              key={f.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)]/60 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shrink-0">
                  {f.category === 'book' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : f.category === 'slide' ? (
                    <Presentation className="w-5 h-5" />
                  ) : f.category === 'question' ? (
                    <FileQuestion className="w-5 h-5" />
                  ) : f.category === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-[var(--gold-light)] transition-colors leading-snug">
                    {f.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
                    {f.course_code && (
                      <span className="text-[var(--gold)] font-semibold bg-[var(--bg-main)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                        {f.course_code}
                      </span>
                    )}
                    <span>·</span>
                    <span>
                      {new Date(f.created_at).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] text-xs text-[var(--gold-light)] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>খুলুন</span>
                </a>

                {isAdminOrCr && (
                  <button
                    onClick={() => onDeleteFile(f.id)}
                    title="মুছুন"
                    className="text-[var(--text-secondary)] hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <FolderDown className="w-8 h-8 text-[var(--gold)]/40 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">কোনো ফাইল খুঁজে পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Add File Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" />
                নতুন একাডেমিক ফাইল বা লিংক যুক্ত করুন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">ফাইলের নাম বা শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: উলূমুল কুরআন পূর্ণাঙ্গ লেকচার হ্যান্ডনোট"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">লিংক বা ড্রাইভ ইউআরএল (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  >
                    <option value="note">হ্যান্ডনোট</option>
                    <option value="book">রেফারেন্স বই</option>
                    <option value="slide">লেকচার স্লাইড</option>
                    <option value="question">বিগত বছরের প্রশ্ন</option>
                    <option value="video">ভিডিও লিংক</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">কোর্স কোড</label>
                  <input
                    type="text"
                    placeholder="যেমন: AQIS 1101"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
