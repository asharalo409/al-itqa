import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  BarChart2,
  Target,
} from 'lucide-react';
import { DailyCategory, DailyTask } from '../types';
import { DataService } from '../services/supabase';

export const CATEGORIES_CONFIG: Record<
  DailyCategory,
  { label: string; icon: string; color: string }
> = {
  study: { label: 'পড়াশোনা ও মুতালাআ', icon: '📖', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  prayer: { label: 'নামাজ ও তিলাওয়াত', icon: '🕌', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
  class: { label: 'অনুষদ ক্লাস', icon: '📚', color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
  work: { label: 'অ্যাসাইনমেন্ট / কাজ', icon: '✍️', color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
  meal: { label: 'খাবার গ্রহণ', icon: '🍽', color: 'text-orange-400 bg-orange-950/40 border-orange-800/40' },
  sport: { label: 'খেলাধুলা ও শরীরচর্চা', icon: '⚽', color: 'text-green-400 bg-green-950/40 border-green-800/40' },
  bath: { label: 'গোসল ও প্রস্তুতি', icon: '🚿', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
  sleep: { label: 'ঘুম ও বিশ্রাম', icon: '😴', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
  other: { label: 'অন্যান্য দায়িত্ব', icon: '🔹', color: 'text-slate-400 bg-slate-800/40 border-slate-700/40' },
};

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shiftDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toYmd(d);
}

function calculateDurationMinutes(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map((x) => parseInt(x, 10));
  const [h2, m2] = end.split(':').map((x) => parseInt(x, 10));
  let mins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (mins < 0) mins += 1440;
  return mins;
}

function formatMinutesBn(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const toBn = (n: number) => n.toLocaleString('bn-BD');
  if (h > 0 && m > 0) return `${toBn(h)} ঘণ্টা ${toBn(m)} মিনিট`;
  if (h > 0) return `${toBn(h)} ঘণ্টা`;
  return `${toBn(m)} মিনিট`;
}

export const DailyPlanner: React.FC = () => {
  const [currentDateStr, setCurrentDateStr] = useState<string>(toYmd(new Date()));
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [showBulkAdd, setShowBulkAdd] = useState<boolean>(false);

  // Single Add form
  const [taskCategory, setTaskCategory] = useState<DailyCategory>('study');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskStart, setTaskStart] = useState<string>('09:00');
  const [taskEnd, setTaskEnd] = useState<string>('10:30');

  const todayStr = toYmd(new Date());
  const isToday = currentDateStr === todayStr;

  useEffect(() => {
    loadTasks();
  }, [currentDateStr]);

  const loadTasks = () => {
    let t = DataService.getDailyTasks(currentDateStr);
    // If today has no tasks, seed a couple of good student habits
    if (!t.length && isToday) {
      const seeded: DailyTask[] = [
        { id: 1001, day: currentDateStr, cat: 'prayer', title: 'ফজর নামাজ ও সকালের মাসনূন আজকার', start_time: '05:00', end_time: '06:00', done: true },
        { id: 1002, day: currentDateStr, cat: 'study', title: 'তাফসীরুল কুরআন ও উলূমুল হাদিস রিভিশন', start_time: '06:30', end_time: '08:00', done: true },
        { id: 1003, day: currentDateStr, cat: 'class', title: 'অনুষদ লেকচার ও প্রেজেন্টেশন', start_time: '09:00', end_time: '13:00', done: false },
        { id: 1004, day: currentDateStr, cat: 'study', title: 'আরবি নাহু-সরফ ও বালাগাত নোট তৈরি', start_time: '19:30', end_time: '21:30', done: false },
        { id: 1005, day: currentDateStr, cat: 'prayer', title: 'তাহাজ্জুদ ও কুরআন তিলাওয়াত', start_time: '04:15', end_time: '05:00', done: false },
      ];
      seeded.forEach((s) => DataService.addDailyTask(s));
      t = seeded;
    }
    setTasks(t);
  };

  const handleToggle = (id: string | number, done: boolean) => {
    DataService.toggleDailyTask(id, done);
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done } : t)));
  };

  const handleDelete = (id: string | number) => {
    DataService.deleteDailyTask(id);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = DataService.addDailyTask({
      day: currentDateStr,
      cat: taskCategory,
      title: taskTitle.trim(),
      start_time: taskStart,
      end_time: taskEnd,
    });

    setTasks([...tasks, newTask]);
    setTaskTitle('');
  };

  const handleCopyPrev = () => {
    const prevDate = shiftDays(currentDateStr, -1);
    const success = DataService.copyPrevDayTasks(currentDateStr, prevDate);
    if (success) {
      loadTasks();
    } else {
      alert('পূর্ববর্তী দিনে কোনো রুটিন টাস্ক পাওয়া যায়নি!');
    }
  };

  // Stats calculation
  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const totalStudyMins = tasks
    .filter((t) => t.cat === 'study')
    .reduce((acc, t) => acc + calculateDurationMinutes(t.start_time, t.end_time), 0);

  const doneStudyMins = tasks
    .filter((t) => t.cat === 'study' && t.done)
    .reduce((acc, t) => acc + calculateDurationMinutes(t.start_time, t.end_time), 0);

  return (
    <div className="space-y-4">
      {/* Date Navigation & Controls */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDateStr(shiftDays(currentDateStr, -1))}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--gold)] hover:bg-[var(--bg-card-subtle)]"
              title="পূর্ববর্তী দিন"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center sm:text-left px-2">
              <div className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
                <span>
                  {new Date(currentDateStr + 'T00:00:00').toLocaleDateString('bn-BD', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                {isToday && (
                  <span className="text-[10px] bg-[var(--accent)] text-[var(--gold-light)] px-2 py-0.5 rounded-full font-bold">
                    আজ
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setCurrentDateStr(shiftDays(currentDateStr, 1))}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--gold)] hover:bg-[var(--bg-card-subtle)]"
              title="পরবর্তী দিন"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={() => setCurrentDateStr(todayStr)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-white"
              >
                আজকে ফিরুন
              </button>
            )}

            <button
              onClick={handleCopyPrev}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--gold)] text-xs text-[var(--gold-light)] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>আগের দিন কপি</span>
            </button>
          </div>
        </div>

        {/* Progress & Study Meter */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="flex justify-between items-center text-[var(--text-secondary)] mb-1">
              <span>দৈনিক লক্ষ্যমাত্রা সম্পন্ন</span>
              <span className="font-bold text-[var(--gold-light)]">
                {completedCount.toLocaleString('bn-BD')} / {tasks.length.toLocaleString('bn-BD')} ({progressPct.toLocaleString('bn-BD')}%)
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
              <div
                className="h-full bg-gradient-to-r from-[var(--gold)] to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {totalStudyMins > 0 && (
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--gold-light)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>
                  পড়া সম্পন্ন: <strong className="text-white">{formatMinutesBn(doneStudyMins)}</strong> / {formatMinutesBn(totalStudyMins)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddTask}
        className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3"
      >
        <div className="text-xs font-bold text-[var(--gold-light)] flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span>নতুন কাজ বা লক্ষ্য যোগ করুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <select
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value as DailyCategory)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
            >
              {(Object.keys(CATEGORIES_CONFIG) as DailyCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORIES_CONFIG[c].icon} {CATEGORIES_CONFIG[c].label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="কাজের বিবরণ (যেমন: তাফসীরে ইবনে কাসীর ৫ পৃষ্ঠা পড়া)"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={taskStart}
              onChange={(e) => setTaskStart(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-[var(--text-primary)]"
            />
            <span className="text-[var(--text-secondary)]">-</span>
            <input
              type="time"
              value={taskEnd}
              onChange={(e) => setTaskEnd(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2 text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold shrink-0 hover:brightness-110 active:scale-95"
            >
              যোগ
            </button>
          </div>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const cfg = CATEGORIES_CONFIG[task.cat] || CATEGORIES_CONFIG.other;
            const duration = calculateDurationMinutes(task.start_time, task.end_time);

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl bg-[var(--bg-card)] border transition-all flex items-center justify-between gap-3 ${
                  task.done
                    ? 'opacity-65 border-[var(--border-color)]/40 bg-[var(--bg-main)]/50'
                    : 'border-[var(--border-color)] hover:border-[var(--gold)]/60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={(e) => handleToggle(task.id, e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--gold)] focus:ring-[var(--gold)] shrink-0 cursor-pointer"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sm">{cfg.icon}</span>
                      <span
                        className={`font-semibold ${
                          task.done ? 'line-through text-[var(--text-secondary)]' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] mt-0.5">
                      <span>{cfg.label}</span>
                      {task.start_time && (
                        <>
                          <span>·</span>
                          <span className="tabular-nums">
                            {task.start_time} {task.end_time ? `– ${task.end_time}` : ''}
                          </span>
                        </>
                      )}
                      {duration > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--gold-light)] font-medium">
                            {formatMinutesBn(duration)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  title="মুছুন"
                  className="text-[var(--text-secondary)] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <CheckSquare className="w-8 h-8 text-[var(--gold)]/40 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              এই দিনের জন্য কোনো রুটিন কাজ নেই। উপর থেকে নতুন কাজ যোগ করুন অথবা আগের দিন থেকে কপি করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
