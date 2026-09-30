import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Image as ImageIcon,
  Calendar,
  Tag,
  X,
  Sparkles,
} from 'lucide-react';
import { MemoryItem, UserProfile } from '../types';

interface BatchGalleryProps {
  memories: MemoryItem[];
  currentUser: UserProfile | null;
  onAddMemory: (memory: Omit<MemoryItem, 'id'>) => void;
}

export const BatchGallery: React.FC<BatchGalleryProps> = ({
  memories,
  currentUser,
  onAddMemory,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<MemoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState('ব্যাচ স্মৃতি');
  const [date, setDate] = useState('২০২৬');

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  const tags = ['all', ...Array.from(new Set(memories.map((m) => m.tag)))];

  const filtered = memories.filter(
    (m) => selectedTag === 'all' || m.tag === selectedTag
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    onAddMemory({
      title: title.trim(),
      caption: caption.trim(),
      imageUrl: imageUrl.trim(),
      tag: tag.trim(),
      date: date.trim(),
    });

    setTitle('');
    setCaption('');
    setImageUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--gold)]" />
            আল ইতকান ৪০ স্মৃতি ও ফটো গ্যালারি
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            অনুষদ প্রাঙ্গণ, ক্যাম্পাস সিঁড়ি, শিক্ষাসফর ও উৎসবের চিরস্মরণীয় মুহূর্ত
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAdminOrCr && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 shadow-md ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ছবি যোগ</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
              selectedTag === t
                ? 'bg-[var(--gold)] text-black font-bold shadow-sm'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
            }`}
          >
            {t === 'all' ? 'সকল স্মৃতি' : t}
          </button>
        ))}
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setActivePhoto(item)}
            className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--gold)]/80 transition-all shadow-md cursor-pointer flex flex-col"
          >
            <div className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-black/40">
              <img
                src={item.imageUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/cover.svg';
                }}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-95"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-[var(--gold-light)] font-bold border border-white/10">
                {item.tag}
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--border-color)]/60 text-[11px] text-[var(--gold)] flex items-center justify-between">
                <span>📅 {item.date}</span>
                <span className="text-[var(--text-secondary)] group-hover:text-white transition-colors">
                  বড় করে দেখুন ↗
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:text-amber-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.imageUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/cover.svg';
                }}
                alt={activePhoto.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--gold)]">
                <span className="font-bold">{activePhoto.tag}</span>
                <span>{activePhoto.date}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{activePhoto.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[var(--gold)]" />
                স্মৃতি গ্যালারিতে ছবি যোগ
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">স্মৃতির শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অনুষদ প্রাঙ্গণে আড্ডা"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">ছবির লিংক / ইমেজ ইউআরএল (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ট্যাগ / অ্যালবাম</label>
                  <input
                    type="text"
                    placeholder="ট্যুর / ক্যাম্পাস / ইফতার"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">তারিখ / উপলক্ষ</label>
                  <input
                    type="text"
                    placeholder="যেমন: ২০২৬"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">ছোট বিবরণ / ক্যাপশন</label>
                <textarea
                  rows={2}
                  placeholder="মুহূর্তটির স্মৃতি বা অনুভূতির কথা..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                />
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
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
