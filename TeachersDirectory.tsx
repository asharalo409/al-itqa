import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Plus,
  Trash2,
  Search,
  Camera,
  UserCheck,
  Award,
} from 'lucide-react';
import { Teacher, UserProfile, Language } from '../types';
import { T_DICT } from '../data/translations';

interface TeachersDirectoryProps {
  teachers: Teacher[];
  currentUser: UserProfile | null;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onDeleteTeacher: (id: number) => void;
  lang?: Language;
}

export const TeachersDirectory: React.FC<TeachersDirectoryProps> = ({
  teachers,
  currentUser,
  onAddTeacher,
  onDeleteTeacher,
  lang = 'bn',
}) => {
  const t = T_DICT[lang];
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New teacher form state
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('অধ্যাপক (Professor)');
  const [department, setDepartment] = useState('আল কুরআন ও ইসলামিক স্টাডিজ');
  const [room, setRoom] = useState('কক্ষ নং ৩০২, থিওলজি অনুষদ ভবন');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [coursesInput, setCoursesInput] = useState('');
  const [photoData, setPhotoData] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser?.role === 'admin';

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoData(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const filtered = teachers.filter(
    (tc) =>
      tc.name.toLowerCase().includes(search.toLowerCase()) ||
      (tc.designation && tc.designation.toLowerCase().includes(search.toLowerCase())) ||
      (tc.courses && tc.courses.some((c) => c.toLowerCase().includes(search.toLowerCase())))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTeacher({
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      room: room.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photo: photoData || undefined,
      courses: coursesInput
        ? coursesInput.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
    });

    setName('');
    setPhone('');
    setEmail('');
    setCoursesInput('');
    setPhotoData('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Search */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--gold)]" />
            {lang === 'ar' ? 'هيئة التدريس والأساتذة الكرام' : lang === 'en' ? 'Faculty & Teachers Directory' : 'সম্মানিত উস্তাজ ও শিক্ষকবৃন্দ'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {lang === 'ar' ? 'قسم القرآن الكريم والدراسات الإسلامية، كلية أصول الدين' : 'আল কুরআন ও ইসলামিক স্টাডিজ বিভাগ, থিওলজি অ্যান্ড ইসলামিক স্টাডিজ অনুষদ'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث عن أستاذ أو مادة...' : 'উস্তাজের নাম বা কোর্স...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إضافة أستاذ' : 'উস্তাজের প্রোফাইল যোগ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((teacher) => (
          <div
            key={teacher.id}
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)]/60 transition-all shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-amber-950 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold-light)] font-bold text-xl overflow-hidden shrink-0 shadow-md">
                    {teacher.photo ? (
                      <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{teacher.name[0]}</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                      {teacher.name}
                    </h3>
                    <div className="text-xs text-[var(--gold)] font-medium mt-0.5">
                      {teacher.designation}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      {teacher.department || 'আল কুরআন ও ইসলামিক স্টাডিজ বিভাগ'}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => onDeleteTeacher(teacher.id)}
                    title="মুছুন"
                    className="text-[var(--text-secondary)] hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Room & Courses */}
              <div className="mt-3.5 pt-3 border-t border-[var(--border-color)]/60 space-y-2 text-xs text-[var(--text-secondary)]">
                {teacher.room && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                    <span className="text-[var(--text-primary)]">{teacher.room}</span>
                  </div>
                )}

                {teacher.courses && teacher.courses.length > 0 && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {teacher.courses.map((c, i) => (
                        <span
                          key={i}
                          className="bg-[var(--bg-main)] text-[var(--gold-light)] text-[11px] px-2 py-0.5 rounded border border-[var(--border-color)] font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact Bar */}
            <div className="mt-4 pt-3 border-t border-[var(--border-color)]/50 flex items-center gap-2 text-xs">
              {teacher.phone ? (
                <a
                  href={`tel:${teacher.phone}`}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] text-[var(--gold-light)] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{teacher.phone}</span>
                </a>
              ) : (
                <span className="text-[11px] text-[var(--text-secondary)] opacity-60">
                  মোবাইল নম্বর দেওয়া নেই
                </span>
              )}

              {teacher.email && (
                <a
                  href={`mailto:${teacher.email}`}
                  className="py-1.5 px-3 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white transition-colors"
                  title={teacher.email}
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal with Direct Photo Upload */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" />
                নতুন উস্তাজের প্রোফাইল যুক্ত করুন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Photo Upload from Device */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="w-16 h-16 rounded-xl bg-[var(--accent)] border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold-light)] text-xl font-bold overflow-hidden shrink-0">
                  {photoData ? (
                    <img src={photoData} alt="উস্তাজের ছবি" className="w-full h-full object-cover" />
                  ) : (
                    <span>📷</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-white">উস্তাজের ছবি (ডিভাইস থেকে ফাইল বাছুন)</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black text-[var(--gold-light)] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>ছবি নির্বাচন করুন</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">উস্তাজের পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রফেসর ড. মো. এয়াকুব আলী"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">পদবী</label>
                  <input
                    type="text"
                    placeholder="অধ্যাপক / সহযোগী অধ্যাপক"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">বিভাগ</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">অফিস বা চেম্বার রুম</label>
                <input
                  type="text"
                  placeholder="কক্ষ নং ৩০২, থিওলজি অনুষদ ভবন"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="teacher@iu.ac.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">
                  পাঠদানকৃত কোর্সসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  placeholder="AQIS 1101: উলূমুল কুরআন, AQIS 1102: তাফসীর"
                  value={coursesInput}
                  onChange={(e) => setCoursesInput(e.target.value)}
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
                  প্রোফাইল সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
