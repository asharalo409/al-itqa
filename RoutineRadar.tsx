import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { RoutineItem, Teacher, UserProfile } from '../types';

interface RoutineRadarProps {
  routine: RoutineItem[];
  teachers: Teacher[];
  currentUser: UserProfile | null;
  onAddRoutineItems: (items: Omit<RoutineItem, 'id'>[]) => void;
  onDeleteRoutineItem: (id: string | number) => void;
  onUpdateRoutineTime: (id: string | number, timeStr: string) => void;
}

export const DAYS_BN = [
  'শনিবার',
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
];

export const DAYS_SHORT = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

// JS Date getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
// Our Day index: 0 is Sat, 1 is Sun, 2 is Mon, 3 is Tue, 4 is Wed, 5 is Thu, 6 is Fri
export function getAppDayIndex(): number {
  const jsDay = new Date().getDay();
  // Saturday in JS is 6 -> 0
  // Sunday in JS is 0 -> 1
  // Monday in JS is 1 -> 2
  return (jsDay + 1) % 7;
}

export function parseTimeToMinutes(tStr?: string): number | null {
  if (!tStr) return null;
  const parts = tStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function formatHhmmToBn(hhmm?: string): string {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'দুপুর/বিকাল' : 'সকাল';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const toBn = (n: number) => n.toLocaleString('bn-BD');
  return `${period} ${toBn(displayH)}:${m < 10 ? '0' + m : m}`;
}

export const RoutineRadar: React.FC<RoutineRadarProps> = ({
  routine,
  teachers,
  currentUser,
  onAddRoutineItems,
  onDeleteRoutineItem,
  onUpdateRoutineTime,
}) => {
  const currentAppDay = getAppDayIndex();
  const [selectedDay, setSelectedDay] = useState<number>(currentAppDay);
  const [currentMinutes, setCurrentMinutes] = useState<number>(
    new Date().getHours() * 60 + new Date().getMinutes()
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Bulk add modal state
  const [modalDay, setModalDay] = useState<number>(selectedDay);
  const [defaultRoom, setDefaultRoom] = useState<string>('২০৩ (থিওলজি অনুষদ)');
  const [modalRows, setModalRows] = useState([
    { code: 'AQIS 1101', subject: 'উলূমুল কুরআন', teacherId: '1', startTime: '09:00', endTime: '10:15' },
    { code: 'AQIS 1102', subject: 'তাফসীরুল কুরআন', teacherId: '2', startTime: '10:30', endTime: '11:45' },
    { code: 'AQIS 1104', subject: 'আরবি ভাষা ও বালাগাত', teacherId: '4', startTime: '12:00', endTime: '13:15' },
  ]);

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const todayClasses = routine
    .filter((r) => r.day === currentAppDay)
    .sort((a, b) => (a.serial || 0) - (b.serial || 0));

  // Determine current running class & next class
  let runningClass: RoutineItem | null = null;
  let nextClass: RoutineItem | null = null;
  let runningRemainingMins = 0;
  let nextStartMins = 0;

  for (const item of todayClasses) {
    const sMin = parseTimeToMinutes(item.start_time);
    const eMin = parseTimeToMinutes(item.end_time);

    if (sMin !== null && eMin !== null) {
      if (currentMinutes >= sMin && currentMinutes < eMin) {
        runningClass = item;
        runningRemainingMins = eMin - currentMinutes;
        break;
      }
      if (currentMinutes < sMin && !nextClass) {
        nextClass = item;
        nextStartMins = sMin - currentMinutes;
      }
    }
  }

  const selectedDayClasses = routine
    .filter((r) => r.day === selectedDay)
    .sort((a, b) => (a.serial || 0) - (b.serial || 0));

  const handleSaveBulkRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = modalRows.filter((r) => r.code.trim() || r.subject.trim());
    if (!validRows.length) return;

    const items: Omit<RoutineItem, 'id'>[] = validRows.map((r, i) => ({
      day: modalDay,
      serial: i + 1,
      code: r.code.trim(),
      subject: r.subject.trim(),
      teacher_id: r.teacherId ? parseInt(r.teacherId, 10) : null,
      start_time: r.startTime || undefined,
      end_time: r.endTime || undefined,
      room: defaultRoom.trim(),
    }));

    onAddRoutineItems(items);
    setShowAddModal(false);
  };

  const handleEditTimePrompt = (id: string | number, current?: string) => {
    const newVal = prompt('নতুন সময় লিখুন (যেমন: ০৯:০০–১০:১৫ বা সকাল ১১টা):', current || '');
    if (newVal !== null) {
      onUpdateRoutineTime(id, newVal.trim());
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Class Radar Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card-subtle)] to-[var(--bg-card)] border border-[var(--gold)]/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-[var(--gold-light)] uppercase tracking-wider">
                আজকের লাইভ ক্লাস রাডার ({DAYS_BN[currentAppDay]})
              </span>
            </div>

            {runningClass ? (
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <span className="text-emerald-400">⏱️ এখন চলছে:</span>
                  <span>{runningClass.subject}</span>
                  <span className="text-xs font-semibold text-[var(--gold)] bg-[var(--accent)] px-2 py-0.5 rounded">
                    {runningClass.code}
                  </span>
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mt-1.5">
                  {runningClass.teacher_id && (
                    <span>
                      👨‍🏫 {teachers.find((t) => t.id === runningClass?.teacher_id)?.name}
                    </span>
                  )}
                  {runningClass.room && <span>🏠 {runningClass.room}</span>}
                  <span className="text-amber-300 font-bold">
                    ⏳ শেষ হতে বাকি: {runningRemainingMins.toLocaleString('bn-BD')} মিনিট
                  </span>
                </div>
              </div>
            ) : nextClass ? (
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--gold-light)]">
                  পরবর্তী ক্লাস: {nextClass.subject} ({nextClass.code})
                </h3>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
                  <span>⏰ শুরু: {formatHhmmToBn(nextClass.start_time)}</span>
                  <span>·</span>
                  <span className="text-amber-300 font-semibold">
                    শুরু হতে বাকি: {Math.floor(nextStartMins / 60) > 0 ? `${Math.floor(nextStartMins / 60)} ঘণ্টা ` : ''}
                    {(nextStartMins % 60).toLocaleString('bn-BD')} মিনিট
                  </span>
                </div>
              </div>
            ) : todayClasses.length > 0 ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>আলহামদুলিল্লাহ! আজকের সব ক্লাস সফলভাবে শেষ হয়েছে।</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                আজ কোনো নির্ধারিত ক্লাস নেই (সাপ্তাহিক ছুটি/রিভিশন ডে)।
              </p>
            )}
          </div>

          {/* Quick Schedule stats */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-2 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-xs text-center">
              <div className="text-[var(--text-secondary)] text-[10px]">আজকের মোট ক্লাস</div>
              <div className="text-sm font-bold text-[var(--gold-light)]">
                {todayClasses.length.toLocaleString('bn-BD')} টি
              </div>
            </div>

            {isAdminOrCr && (
              <button
                onClick={() => {
                  setModalDay(selectedDay);
                  setShowAddModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>রুটিন যোগ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekday Selector */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-2.5 shadow-sm">
        <div className="grid grid-cols-7 gap-1">
          {DAYS_BN.map((dayName, idx) => {
            const isSelected = selectedDay === idx;
            const isToday = currentAppDay === idx;
            const count = routine.filter((r) => r.day === idx).length;

            return (
              <button
                key={dayName}
                onClick={() => setSelectedDay(idx)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-[var(--gold)] text-black font-bold shadow-md'
                    : 'bg-[var(--bg-main)]/70 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <div className="text-[11px] sm:text-xs">
                  {DAYS_SHORT[idx]}
                  {isToday && (
                    <span className="hidden sm:inline text-[10px] ml-1 bg-red-600 text-white px-1 rounded">আজ</span>
                  )}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {count > 0 ? `${count.toLocaleString('bn-BD')}টি` : '—'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day's Class Schedule List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--gold)]" />
            <span>{DAYS_BN[selectedDay]}র ক্লাসের সময়সূচি</span>
            <span className="text-xs text-[var(--text-secondary)] font-normal">
              ({selectedDayClasses.length.toLocaleString('bn-BD')} টি ক্লাস)
            </span>
          </h3>
        </div>

        {selectedDayClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDayClasses.map((item, idx) => {
              const teacher = teachers.find((t) => t.id === item.teacher_id);
              const isToday = selectedDay === currentAppDay;
              const sMin = parseTimeToMinutes(item.start_time);
              const eMin = parseTimeToMinutes(item.end_time);
              const isRunning =
                isToday &&
                sMin !== null &&
                eMin !== null &&
                currentMinutes >= sMin &&
                currentMinutes < eMin;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl bg-[var(--bg-card)] border transition-all ${
                    isRunning
                      ? 'border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                      : 'border-[var(--border-color)] hover:border-[var(--gold)]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[var(--accent)] text-[var(--gold-light)] font-bold text-xs flex items-center justify-center shrink-0">
                        {(item.serial || idx + 1).toLocaleString('bn-BD')}
                      </span>
                      <span className="text-xs font-bold text-[var(--gold)] tracking-wide">
                        {item.code}
                      </span>
                      {isRunning && (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          চলছে
                        </span>
                      )}
                    </div>

                    {isAdminOrCr && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditTimePrompt(item.id, item.time || `${item.start_time || ''}-${item.end_time || ''}`)}
                          title="সময় এডিট করুন"
                          className="text-[var(--text-secondary)] hover:text-[var(--gold)] p-1 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRoutineItem(item.id)}
                          title="মুছুন"
                          className="text-[var(--text-secondary)] hover:text-red-400 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white mt-1.5">
                    {item.subject}
                  </h4>

                  <div className="space-y-1 mt-2.5 pt-2 border-t border-[var(--border-color)]/60 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                      <span className="text-[var(--text-primary)] font-medium">
                        {teacher ? teacher.name : item.teacher_name || 'উস্তাজ নির্ধারিত নেই'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                        <span>
                          {item.start_time
                            ? `${formatHhmmToBn(item.start_time)} – ${formatHhmmToBn(item.end_time)}`
                            : item.time || 'সময় নির্ধারিত নয়'}
                        </span>
                      </div>

                      {item.room && (
                        <div className="flex items-center gap-1 text-[var(--gold-light)]">
                          <MapPin className="w-3 h-3 text-[var(--gold)]" />
                          <span>{item.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <Calendar className="w-8 h-8 text-[var(--gold)]/40 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              {DAYS_BN[selectedDay]}র জন্য কোনো ক্লাস নির্ধারিত নেই
            </p>
          </div>
        )}
      </div>

      {/* Bulk Add Routine Modal for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" />
                একদিনের সব ক্লাস একসাথে যুক্ত করুন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBulkRoutine} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">দিন নির্বাচন করুন *</label>
                  <select
                    value={modalDay}
                    onChange={(e) => setModalDay(parseInt(e.target.value, 10))}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                  >
                    {DAYS_BN.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ডিফল্ট ক্লাসরুম</label>
                  <input
                    type="text"
                    value={defaultRoom}
                    onChange={(e) => setDefaultRoom(e.target.value)}
                    placeholder="যেমন: ২০৩ (থিওলজি অনুষদ)"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                <div className="font-semibold text-[var(--gold-light)]">ক্লাস তালিকা:</div>
                {modalRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>{(idx + 1).toLocaleString('bn-BD')}ম ক্লাস</span>
                      {modalRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setModalRows(modalRows.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="কোর্স কোড (যেমন: AQIS 1101)"
                        value={row.code}
                        onChange={(e) => {
                          const updated = [...modalRows];
                          updated[idx].code = e.target.value;
                          setModalRows(updated);
                        }}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]"
                      />

                      <input
                        type="text"
                        placeholder="বিষয় (যেমন: উলূমুল কুরআন)"
                        value={row.subject}
                        onChange={(e) => {
                          const updated = [...modalRows];
                          updated[idx].subject = e.target.value;
                          setModalRows(updated);
                        }}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]"
                      />

                      <select
                        value={row.teacherId}
                        onChange={(e) => {
                          const updated = [...modalRows];
                          updated[idx].teacherId = e.target.value;
                          setModalRows(updated);
                        }}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]"
                      >
                        <option value="">উস্তাজ বাছুন</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => {
                            const updated = [...modalRows];
                            updated[idx].startTime = e.target.value;
                            setModalRows(updated);
                          }}
                          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1.5 text-[var(--text-primary)] w-full"
                        />
                        <span className="text-[var(--text-secondary)]">-</span>
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => {
                            const updated = [...modalRows];
                            updated[idx].endTime = e.target.value;
                            setModalRows(updated);
                          }}
                          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1.5 text-[var(--text-primary)] w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setModalRows([
                      ...modalRows,
                      { code: '', subject: '', teacherId: '', startTime: '09:00', endTime: '10:15' },
                    ])
                  }
                  className="px-3 py-1.5 rounded-lg border border-dashed border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--gold-light)] font-medium text-xs w-full text-center"
                >
                  + আরেকটি ক্লাস যোগ করুন
                </button>
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
