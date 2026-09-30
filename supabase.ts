import { createClient } from '@supabase/supabase-js';
import {
  UserProfile,
  Notice,
  Teacher,
  RoutineItem,
  DailyTask,
  FileItem,
  Message,
  DirectMessage,
  Complaint,
  FundTransaction,
  AppNotification,
  MemoryItem,
  PaymentSettings,
  StudentPayment,
  AppSettings,
  Poll,
  PollOption,
  WelfareRequest,
  ChatGroup,
  GroupMessage,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_NOTICES,
  INITIAL_ROUTINE,
  INITIAL_TEACHERS,
  INITIAL_FILES,
  INITIAL_FUND,
  INITIAL_MEMORIES,
} from '../data/initialData';

// User's provided Supabase endpoint & credentials
const SUPABASE_URL = 'https://vfuuyeuglpziitjcwcou.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3q4eW3lP5gEEydTEZEZ1RQ_bix0JGwW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Storage keys
const STORAGE_PREFIX = 'alitqan40_';
const k = (name: string) => STORAGE_PREFIX + name;

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(k(key));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  return defaultValue;
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(k(key), JSON.stringify(val));
  } catch (e) {
    console.warn('Failed to write to localStorage:', e);
  }
}

// Initialize seed data if not present
export function initializeSeedData(): void {
  if (!localStorage.getItem(k('initialized'))) {
    setLocal('members', INITIAL_MEMBERS);
    setLocal('notices', INITIAL_NOTICES);
    setLocal('routine', INITIAL_ROUTINE);
    setLocal('teachers', INITIAL_TEACHERS);
    setLocal('files', INITIAL_FILES);
    setLocal('fund', INITIAL_FUND);
    setLocal('memories', INITIAL_MEMORIES);
    setLocal('batch_code', 'ITQAN40IU');
    setLocal('initialized', 'true');

    // Default current user (Tahseen Billah - Admin / Batch Representative)
    if (!localStorage.getItem(k('current_user'))) {
      setLocal('current_user', INITIAL_MEMBERS[0]);
    }
  }
}

export const DataService = {
  // Current logged in user
  getCurrentUser(): UserProfile | null {
    return getLocal<UserProfile | null>('current_user', INITIAL_MEMBERS[0]);
  },

  setCurrentUser(user: UserProfile | null): void {
    setLocal('current_user', user);
  },

  // Batch Code verification
  getBatchCode(): string {
    return getLocal<string>('batch_code', 'ITQAN40IU');
  },

  setBatchCode(code: string): void {
    setLocal('batch_code', code);
  },

  claimCode(code: string, name: string, roll: string): boolean {
    const valid = this.getBatchCode().trim().toUpperCase();
    if (code.trim().toUpperCase() === valid) {
      const user = this.getCurrentUser();
      if (user) {
        user.name = name || user.name;
        user.roll = roll || user.roll;
        user.status = 'approved';
        this.setCurrentUser(user);
        this.updateMember(user);
      }
      return true;
    }
    return false;
  },

  // Notices
  async getNotices(): Promise<Notice[]> {
    try {
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Notice[];
      }
    } catch {
      // fallback
    }
    return getLocal<Notice[]>('notices', INITIAL_NOTICES);
  },

  async addNotice(notice: Omit<Notice, 'id' | 'created_at'>): Promise<Notice> {
    const newNotice: Notice = {
      ...notice,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    try {
      await supabase.from('notices').insert(newNotice);
    } catch {}
    const list = getLocal<Notice[]>('notices', INITIAL_NOTICES);
    const updated = [newNotice, ...list];
    setLocal('notices', updated);
    this.addNotification('notice', `নতুন নোটিশ: ${notice.title}`);
    return newNotice;
  },

  async deleteNotice(id: string | number): Promise<void> {
    try {
      await supabase.from('notices').delete().eq('id', id);
    } catch {}
    const list = getLocal<Notice[]>('notices', INITIAL_NOTICES);
    setLocal('notices', list.filter((n) => n.id !== id));
  },

  // Routine
  async getRoutine(): Promise<RoutineItem[]> {
    try {
      const { data, error } = await supabase.from('routine').select('*');
      if (!error && data && data.length > 0) {
        return data as RoutineItem[];
      }
    } catch {}
    return getLocal<RoutineItem[]>('routine', INITIAL_ROUTINE);
  },

  async addRoutineItems(items: Omit<RoutineItem, 'id'>[]): Promise<void> {
    const current = getLocal<RoutineItem[]>('routine', INITIAL_ROUTINE);
    const newItems: RoutineItem[] = items.map((it, idx) => ({
      ...it,
      id: Date.now() + idx,
    }));
    try {
      await supabase.from('routine').insert(newItems);
    } catch {}
    setLocal('routine', [...current, ...newItems]);
    this.addNotification('routine', `রুটিনে ${items.length}টি নতুন ক্লাস যোগ করা হয়েছে`);
  },

  async updateRoutineTime(id: string | number, timeStr: string): Promise<void> {
    try {
      await supabase.from('routine').update({ time: timeStr }).eq('id', id);
    } catch {}
    const current = getLocal<RoutineItem[]>('routine', INITIAL_ROUTINE);
    setLocal(
      'routine',
      current.map((r) => (r.id === id ? { ...r, time: timeStr } : r))
    );
  },

  async deleteRoutineItem(id: string | number): Promise<void> {
    try {
      await supabase.from('routine').delete().eq('id', id);
    } catch {}
    const current = getLocal<RoutineItem[]>('routine', INITIAL_ROUTINE);
    setLocal('routine', current.filter((r) => r.id !== id));
  },

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data as Teacher[];
      }
    } catch {}
    return getLocal<Teacher[]>('teachers', INITIAL_TEACHERS);
  },

  async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<void> {
    const newT: Teacher = { ...teacher, id: Date.now() };
    try {
      await supabase.from('teachers').insert(newT);
    } catch {}
    const list = getLocal<Teacher[]>('teachers', INITIAL_TEACHERS);
    setLocal('teachers', [...list, newT]);
  },

  async deleteTeacher(id: number): Promise<void> {
    try {
      await supabase.from('teachers').delete().eq('id', id);
    } catch {}
    const list = getLocal<Teacher[]>('teachers', INITIAL_TEACHERS);
    setLocal('teachers', list.filter((t) => t.id !== id));
  },

  // Daily Tasks
  getDailyTasks(dateStr: string): DailyTask[] {
    const all = getLocal<DailyTask[]>('daily_tasks', []);
    return all.filter((d) => d.day === dateStr);
  },

  addDailyTask(task: Omit<DailyTask, 'id' | 'done'>): DailyTask {
    const newTask: DailyTask = {
      ...task,
      id: Date.now(),
      done: false,
    };
    const all = getLocal<DailyTask[]>('daily_tasks', []);
    setLocal('daily_tasks', [...all, newTask]);
    return newTask;
  },

  toggleDailyTask(id: string | number, done: boolean): void {
    const all = getLocal<DailyTask[]>('daily_tasks', []);
    setLocal(
      'daily_tasks',
      all.map((t) => (t.id === id ? { ...t, done } : t))
    );
  },

  deleteDailyTask(id: string | number): void {
    const all = getLocal<DailyTask[]>('daily_tasks', []);
    setLocal('daily_tasks', all.filter((t) => t.id !== id));
  },

  copyPrevDayTasks(currentDate: string, prevDate: string): boolean {
    const all = getLocal<DailyTask[]>('daily_tasks', []);
    const prev = all.filter((t) => t.day === prevDate);
    if (!prev.length) return false;
    const copies = prev.map((t, idx) => ({
      ...t,
      id: Date.now() + idx,
      day: currentDate,
      done: false,
    }));
    setLocal('daily_tasks', [...all, ...copies]);
    return true;
  },

  // Files
  async getFiles(): Promise<FileItem[]> {
    try {
      const { data, error } = await supabase.from('files').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as FileItem[];
      }
    } catch {}
    return getLocal<FileItem[]>('files', INITIAL_FILES);
  },

  async addFile(file: Omit<FileItem, 'id' | 'created_at'>): Promise<void> {
    const newF: FileItem = {
      ...file,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    try {
      await supabase.from('files').insert(newF);
    } catch {}
    const list = getLocal<FileItem[]>('files', INITIAL_FILES);
    setLocal('files', [newF, ...list]);
    this.addNotification('files', `নতুন একাডেমিক ফাইল: ${file.name}`);
  },

  async deleteFile(id: string | number): Promise<void> {
    try {
      await supabase.from('files').delete().eq('id', id);
    } catch {}
    const list = getLocal<FileItem[]>('files', INITIAL_FILES);
    setLocal('files', list.filter((f) => f.id !== id));
  },

  // Members
  getMembersSync(): UserProfile[] {
    return getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
  },

  async getMembers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('roll');
      if (!error && data && data.length > 0) {
        return data as UserProfile[];
      }
    } catch {}
    return getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
  },

  addMember(member: UserProfile): void {
    this.updateMember(member);
    this.addNotification('member', `${member.name} (${member.roll}) নতুন সদস্য হিসেবে যুক্ত হয়েছেন`);
  },

  updateMember(member: UserProfile): void {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    const exists = members.some((m) => m.id === member.id);
    const updated = exists ? members.map((m) => (m.id === member.id ? member : m)) : [...members, member];
    setLocal('members', updated);
  },

  updateMemberRole(id: string, role: 'admin' | 'cr' | 'member'): void {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    setLocal(
      'members',
      members.map((m) => (m.id === id ? { ...m, role } : m))
    );
  },

  updateMemberStatus(id: string, status: 'approved' | 'rejected'): void {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    setLocal(
      'members',
      members.map((m) => (m.id === id ? { ...m, status } : m))
    );
  },

  removeMember(id: string): void {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    setLocal('members', members.filter((m) => m.id !== id));
  },

  // Group Messages
  getMessages(): Message[] {
    return getLocal<Message[]>('messages', [
      {
        id: 1,
        name: 'তাহসীন বিল্লাহ',
        body: 'আসসালামু আলাইকুম সবাইকে। আগামী রবিবারের ক্লাস টেস্টের প্রস্তুতি কেমন সবার?',
        user_id: 'mem-1',
        created_at: new Date(Date.now() - 36e5 * 2).toISOString(),
      },
      {
        id: 2,
        name: 'মাহফুজ (সিআর)',
        body: 'ওয়ালাইকুমুস সালাম ভাই। ড. এয়াকুব আলী স্যার বলেছেন প্রথম ৩টি অধ্যায় থেকেই প্রশ্ন হবে।',
        user_id: 'mem-2',
        created_at: new Date(Date.now() - 36e5).toISOString(),
      },
      {
        id: 3,
        name: 'তাওহীদ',
        body: 'জাযাকাল্লাহ খাইরান ভাই। ফাইল সেকশনে হ্যান্ডনোট দেওয়া আছে, সবাই দেখে নিয়েন।',
        user_id: 'mem-3',
        created_at: new Date(Date.now() - 18e5).toISOString(),
      },
    ]);
  },

  sendMessage(name: string, body: string, user_id?: string): Message {
    const newMsg: Message = {
      id: Date.now(),
      name,
      body,
      user_id,
      created_at: new Date().toISOString(),
    };
    const current = this.getMessages();
    setLocal('messages', [...current, newMsg]);
    return newMsg;
  },

  deleteMessage(id: number | string): void {
    const current = this.getMessages();
    setLocal('messages', current.filter((m) => m.id !== id));
  },

  // Direct Messages
  getDirectMessages(userA: string, userB: string): DirectMessage[] {
    const all = getLocal<DirectMessage[]>('dms', []);
    return all.filter(
      (m) =>
        (m.sender === userA && m.receiver === userB) ||
        (m.sender === userB && m.receiver === userA)
    );
  },

  sendDirectMessage(sender: string, receiver: string, body: string): DirectMessage {
    const dm: DirectMessage = {
      id: Date.now(),
      sender,
      receiver,
      body,
      created_at: new Date().toISOString(),
    };
    const all = getLocal<DirectMessage[]>('dms', []);
    setLocal('dms', [...all, dm]);
    return dm;
  },

  // Complaints / Suggestions
  getComplaints(): Complaint[] {
    return getLocal<Complaint[]>('complaints', [
      {
        id: 1,
        title: 'থিওলজি অনুষদের ২০৩ নম্বর রুমের প্রজেক্টর সমস্যা',
        body: '২০৩ নম্বর রুমে স্লাইড দেখানোর সময় প্রজেক্টর বারবার বন্ধ হয়ে যায়। ক্লাস নিতে কষ্ট হচ্ছে।',
        category: 'room',
        code: 'ITQ-PRJ01',
        status: 'review',
        reply: 'ডিপার্টমেন্ট অফিসে বিষয়টি জানানো হয়েছে। টেকনিশিয়ান আগামী রবিবার মেরামত করবেন।',
        created_at: new Date(Date.now() - 864e5 * 3).toISOString(),
      },
      {
        id: 2,
        title: 'সেমিনার লাইব্রেরির তাফসীর রেফারেন্স বই সংখ্যা বৃদ্ধি',
        body: 'সেমিনার লাইব্রেরিতে তাফসীরে তাবারী ও কুরতুবীর আরো ২ সেট বই প্রয়োজন।',
        category: 'academic',
        code: 'ITQ-LIB02',
        status: 'done',
        reply: 'আলহামদুলিল্লাহ, বিভাগীয় তহবিল থেকে নতুন ৩ সেট তাফসীর বই কেনা হয়েছে।',
        created_at: new Date(Date.now() - 864e5 * 5).toISOString(),
      },
    ]);
  },

  submitComplaint(complaint: Omit<Complaint, 'id' | 'status' | 'created_at'>): Complaint {
    const newC: Complaint = {
      ...complaint,
      id: Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const all = this.getComplaints();
    setLocal('complaints', [newC, ...all]);
    return newC;
  },

  updateComplaint(id: number | string, status: 'pending' | 'review' | 'done', reply?: string): void {
    const all = this.getComplaints();
    setLocal(
      'complaints',
      all.map((c) => (c.id === id ? { ...c, status, reply: reply !== undefined ? reply : c.reply } : c))
    );
  },

  // Batch Fund
  getFund(): FundTransaction[] {
    return getLocal<FundTransaction[]>('fund', INITIAL_FUND);
  },

  addFundTransaction(tx: Omit<FundTransaction, 'id'>): void {
    const newTx: FundTransaction = { ...tx, id: 'tx-' + Date.now() };
    const all = this.getFund();
    setLocal('fund', [newTx, ...all]);
  },

  // Memories
  getMemories(): MemoryItem[] {
    return getLocal<MemoryItem[]>('memories', INITIAL_MEMORIES);
  },

  addMemory(memory: Omit<MemoryItem, 'id'>): void {
    const newM: MemoryItem = { ...memory, id: 'mem-' + Date.now() };
    const all = this.getMemories();
    setLocal('memories', [newM, ...all]);
  },

  // Notifications
  getNotifications(): AppNotification[] {
    return getLocal<AppNotification[]>('notifications', [
      { id: 1, kind: 'notice', text: 'আগামী রবিবার AQIS 1101 কোর্সের ১ম মিডটার্ম পরীক্ষা', created_at: new Date(Date.now() - 36e5 * 2).toISOString() },
      { id: 2, kind: 'routine', text: 'রবিবারের ক্লাস রুটিন আপডেট করা হয়েছে', created_at: new Date(Date.now() - 36e5 * 5).toISOString() },
      { id: 3, kind: 'file', text: 'উলূমুল হাদিসের বিগত ৩ বছরের প্রশ্ন আপলোড হয়েছে', created_at: new Date(Date.now() - 36e5 * 10).toISOString() },
    ]);
  },

  addNotification(kind: string, text: string): void {
    const notif: AppNotification = {
      id: Date.now(),
      kind,
      text,
      created_at: new Date().toISOString(),
    };
    const all = this.getNotifications();
    setLocal('notifications', [notif, ...all]);
  },

  clearNotifications(): void {
    setLocal('notifications', []);
  },

  // Site visuals (logo & cover custom uploads)
  getSiteVisuals(): { logo: string; cover: string } {
    return getLocal('site_visuals', {
      logo: 'logo.jpg',
      cover: 'cover.jpg',
    });
  },

  setSiteVisuals(visuals: { logo?: string; cover?: string }): void {
    const current = this.getSiteVisuals();
    setLocal('site_visuals', { ...current, ...visuals });
  },

  // Payment Settings (bKash, Nagad, Rocket, Bank numbers)
  getPaymentSettings(): PaymentSettings {
    return getLocal<PaymentSettings>('payment_settings', {
      bkashNumber: '01812345678',
      bkashType: 'personal',
      nagadNumber: '01712001122',
      nagadType: 'personal',
      rocketNumber: '019123344558',
      upayNumber: '01612998877',
      bankName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি (IBBL)',
      bankAccountName: 'আল ইতকান ৪০ ব্যাচ ফান্ড',
      bankAccountNumber: '২০৫০১২৩৪৫৬৭৮৯',
      bankBranch: 'ইবি ক্যাম্পাস শাখা, কুষ্টিয়া',
      monthlyFee: 200,
      instructions: 'বিকাশ বা নগদে সেন্ড মানি (Send Money) করে ট্রানজেকশন আইডি (TrxID) নিচে জমা দিন। রেফারেন্সে নিজের ক্লাস রোল উল্লেখ করুন।',
    });
  },

  updatePaymentSettings(settings: PaymentSettings): void {
    setLocal('payment_settings', settings);
  },

  // Student Payments Ledger
  getStudentPayments(): StudentPayment[] {
    return getLocal<StudentPayment[]>('student_payments', [
      {
        id: 'pay-1',
        studentId: 'mem-1',
        studentName: 'তাহসীন বিল্লাহ',
        studentRoll: '৪০১',
        amount: 600,
        method: 'bkash',
        trxId: 'BKH8927163',
        purpose: '৩ মাসের ব্যাচ চাঁদা (জুলাই-সেপ্টেম্বর)',
        status: 'verified',
        date: '২০২৬-০৯-২০',
        note: 'ভেরিফায়েড',
      },
      {
        id: 'pay-2',
        studentId: 'mem-2',
        studentName: 'মুহাম্মদ আবদুল্লাহ আল মাহফুজ',
        studentRoll: '৪০২',
        amount: 1000,
        method: 'nagad',
        trxId: 'NGD7731290',
        purpose: 'ট্যুর অ্যাডভান্স ও মাসিক চাঁদা',
        status: 'verified',
        date: '২০২৬-০৯-২২',
      },
      {
        id: 'pay-3',
        studentId: 'mem-3',
        studentName: 'আব্দুর রহমান তাওহীদ',
        studentRoll: '৪০৩',
        amount: 400,
        method: 'bkash',
        trxId: 'BKH9910283',
        purpose: 'মাসিক চাঁদা ও ফটোস্ট্যাট ব্যয়',
        status: 'pending',
        date: '২০২৬-০৯-২৮',
      },
    ]);
  },

  addStudentPayment(pay: Omit<StudentPayment, 'id' | 'status' | 'date'>): StudentPayment {
    const newPay: StudentPayment = {
      ...pay,
      id: 'pay-' + Date.now(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    const list = this.getStudentPayments();
    setLocal('student_payments', [newPay, ...list]);
    this.addNotification('fund', `নতুন পেমেন্ট সাবমিট: ${pay.studentName} (৳${pay.amount})`);
    return newPay;
  },

  updateStudentPaymentStatus(id: string, status: 'verified' | 'rejected'): void {
    const list = this.getStudentPayments();
    setLocal(
      'student_payments',
      list.map((p) => (p.id === id ? { ...p, status } : p))
    );
  },

  // App Title / Branding Customization
  getAppSettings(): AppSettings {
    return getLocal<AppSettings>('app_custom_settings', {
      appName: 'আল ইতকান ৪০',
      batchName: '৪০তম ব্যাচ',
      departmentName: 'আল কুরআন ও ইসলামিক স্টাডিজ বিভাগ',
      universityName: 'ইসলামী বিশ্ববিদ্যালয়, বাংলাদেশ',
      motto: 'জ্ঞানের গভীরতায় ও চরিত্রের দৃঢ়তায় এগিয়ে যাক আল-ইতকান কাফেলা',
      batchCode: 'ITQAN40IU',
    });
  },

  updateAppSettings(settings: Partial<AppSettings>): void {
    const current = this.getAppSettings();
    setLocal('app_custom_settings', { ...current, ...settings });
  },

  // ----------------- Polls & Voting System -----------------
  getPolls(): Poll[] {
    return getLocal<Poll[]>('batch_polls', [
      {
        id: 'poll-1',
        question: 'AQIS 1101 কোর্সের ১ম মিডটার্ম পরীক্ষা কোন দিন নেওয়া সুবিধাজনক?',
        description: 'সম্মানিত প্রফেসর ড. আসাদ উল্লাহ স্যারের সাথে আলোচনা সাপেক্ষে সবার ভোটের ভিত্তিতে দিন চূড়ান্ত হবে।',
        options: [
          { id: 'opt-1', text: 'রবিবার সকাল ১০:০০ টা (অনুষদ কক্ষ ২০৩)', votes: ['mem-1', 'mem-4'] },
          { id: 'opt-2', text: 'মঙ্গলবার দুপুর ১২:০০ টা (অনুষদ কক্ষ ২০৩)', votes: ['mem-2'] },
          { id: 'opt-3', text: 'বৃহস্পতিবার সকাল ৯:০০ টা', votes: ['mem-3', 'mem-5'] },
        ],
        createdBy: 'তাহসীন বিল্লাহ (অ্যাডমিন)',
        creatorId: 'mem-1',
        createdAt: new Date(Date.now() - 36e5 * 6).toISOString(),
        expiresAt: new Date(Date.now() + 864e5 * 2).toISOString(),
        isActive: true,
      },
      {
        id: 'poll-2',
        question: 'আসন্ন ব্যাচ ডে ও সংবর্ধনা অনুষ্ঠানের ভেন্যু নির্বাচন',
        description: 'সবার পছন্দের ভেন্যুটি সিলেক্ট করুন।',
        options: [
          { id: 'opt-201', text: 'বীরশ্রেষ্ঠ হামিদুর রহমান মিলনায়তন (অডিটোরিয়াম)', votes: ['mem-1', 'mem-2', 'mem-3'] },
          { id: 'opt-202', text: 'ইবি বোটানিক্যাল গার্ডেন লেক সংলগ্ন প্রাঙ্গণ', votes: ['mem-4'] },
          { id: 'opt-203', text: 'অনুষদ সেমিনার হল', votes: [] },
        ],
        createdBy: 'মাহফুজ (সিআর)',
        creatorId: 'mem-2',
        createdAt: new Date(Date.now() - 864e5).toISOString(),
        expiresAt: new Date(Date.now() + 864e5 * 5).toISOString(),
        isActive: true,
      },
    ]);
  },

  createPoll(poll: Omit<Poll, 'id' | 'createdAt' | 'isActive'>): Poll {
    const newPoll: Poll = {
      ...poll,
      id: 'poll-' + Date.now(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const current = this.getPolls();
    setLocal('batch_polls', [newPoll, ...current]);
    this.addNotification('poll', `নতুন পোল চালু হয়েছে: ${newPoll.question}`);
    return newPoll;
  },

  votePoll(pollId: string, optionId: string, userId: string): boolean {
    const current = this.getPolls();
    const updated = current.map((p) => {
      if (p.id !== pollId) return p;
      const newOptions = p.options.map((opt) => {
        // Remove user's previous vote from all options in this poll
        const filteredVotes = opt.votes.filter((uid) => uid !== userId);
        // Add user vote to the selected option
        if (opt.id === optionId) {
          filteredVotes.push(userId);
        }
        return { ...opt, votes: filteredVotes };
      });
      return { ...p, options: newOptions };
    });
    setLocal('batch_polls', updated);
    return true;
  },

  deletePoll(pollId: string): void {
    const current = this.getPolls();
    setLocal('batch_polls', current.filter((p) => p.id !== pollId));
  },

  togglePollStatus(pollId: string): void {
    const current = this.getPolls();
    setLocal(
      'batch_polls',
      current.map((p) => (p.id === pollId ? { ...p, isActive: !p.isActive } : p))
    );
  },

  // ----------------- Welfare & Mutual Aid -----------------
  getWelfareRequests(): WelfareRequest[] {
    return getLocal<WelfareRequest[]>('welfare_requests', [
      {
        id: 'welf-1',
        title: 'অসুস্থ সহপাঠীর জরুরি চিকিৎসার জন্য ওষুধ ফান্ড',
        category: 'medical',
        amountNeeded: 12000,
        amountRaised: 8500,
        description: 'আমাদের এক সহপাঠী ভাই হাসপাতালে ভর্তি। তার জরুরি চিকিৎসার জন্য ব্যাচের পক্ষ থেকে অনুদান সংগ্রহ করা হচ্ছে।',
        applicantName: 'তাহসীন বিল্লাহ (সিআর সমন্বয়)',
        applicantRoll: '৪০১',
        phone: '01812345678',
        isAnonymous: false,
        status: 'active',
        createdAt: new Date(Date.now() - 864e5 * 2).toISOString(),
      },
      {
        id: 'welf-2',
        title: 'দরিদ্র সহপাঠীর সেমিস্টার ফাইনাল ফি ও বই সহায়তা',
        category: 'tuition',
        amountNeeded: 6000,
        amountRaised: 6000,
        description: 'অনুষদ সেমিস্টার পরীক্ষার ফি জমাদানে সহায়তা সম্পূর্ণ হয়েছে। আলহামদুলিল্লাহ।',
        isAnonymous: true,
        status: 'completed',
        createdAt: new Date(Date.now() - 864e5 * 10).toISOString(),
      },
    ]);
  },

  createWelfareRequest(req: Omit<WelfareRequest, 'id' | 'status' | 'createdAt'>): WelfareRequest {
    const newReq: WelfareRequest = {
      ...req,
      id: 'welf-' + Date.now(),
      status: 'active',
      amountRaised: req.amountRaised || 0,
      createdAt: new Date().toISOString(),
    };
    const current = this.getWelfareRequests();
    setLocal('welfare_requests', [newReq, ...current]);
    this.addNotification('welfare', `জরুরি সহায়তা আবেদন: ${newReq.title}`);
    return newReq;
  },

  updateWelfareStatus(id: string, status: 'active' | 'completed' | 'closed'): void {
    const current = this.getWelfareRequests();
    setLocal(
      'welfare_requests',
      current.map((w) => (w.id === id ? { ...w, status } : w))
    );
  },

  contributeToWelfare(id: string, amount: number): void {
    const current = this.getWelfareRequests();
    setLocal(
      'welfare_requests',
      current.map((w) =>
        w.id === id ? { ...w, amountRaised: (w.amountRaised || 0) + amount } : w
      )
    );
  },

  // ----------------- Add & Manage Admins by Gmail -----------------
  addAdminByEmail(email: string, name?: string): { success: boolean; message: string; user?: UserProfile } {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, message: 'সঠিক জিমেইল / ইমেইল ঠিকানা দিন।' };
    }

    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    const existing = members.find((m) => m.email.toLowerCase() === normalizedEmail);

    if (existing) {
      existing.role = 'admin';
      existing.status = 'approved';
      if (name && name.trim()) existing.name = name.trim();
      setLocal('members', members);
      this.addNotification('admin', `${existing.name} (${existing.email})-কে অ্যাডমিন হিসেবে নিয়োগ দেওয়া হয়েছে।`);
      return { success: true, message: `${existing.name} (${existing.email}) এখন অ্যাডমিন!`, user: existing };
    } else {
      // Create new Admin profile directly with this email
      const newAdmin: UserProfile = {
        id: 'admin-' + Date.now(),
        email: normalizedEmail,
        name: name?.trim() || normalizedEmail.split('@')[0],
        roll: 'অ্যাডমিন',
        blood: 'O+',
        phone: '',
        role: 'admin',
        status: 'approved',
        bio: 'আল ইতকান ৪০ এর অন্যতম সম্মানিত প্রশাসক ও অ্যাডমিন।',
      };
      setLocal('members', [...members, newAdmin]);
      this.addNotification('admin', `নতুন অ্যাডমিন যুক্ত করা হয়েছে: ${newAdmin.email}`);
      return { success: true, message: `জিমেইল ${normalizedEmail} দিয়ে নতুন অ্যাডমিন যুক্ত হয়েছে!`, user: newAdmin };
    }
  },

  removeAdminRole(userId: string): void {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    setLocal(
      'members',
      members.map((m) => (m.id === userId ? { ...m, role: 'member' } : m))
    );
  },

  getAdminList(): UserProfile[] {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    return members.filter((m) => m.role === 'admin' && m.status === 'approved');
  },

  // ----------------- Custom Designation (পদবি) -----------------
  updateMemberDesignation(userId: string, designation: string): boolean {
    const members = getLocal<UserProfile[]>('members', INITIAL_MEMBERS);
    const updated = members.map((m) => (m.id === userId ? { ...m, designation } : m));
    setLocal('members', updated);

    // If updating current user
    const cur = this.getCurrentUser();
    if (cur && cur.id === userId) {
      this.setCurrentUser({ ...cur, designation });
    }
    return true;
  },

  // ----------------- Custom Chat Groups -----------------
  getChatGroups(): ChatGroup[] {
    return getLocal<ChatGroup[]>('chat_groups', [
      {
        id: 'group-1',
        name: '📖 আল কুরআন স্টাডি ও তাদাব্বুর গ্রুপ',
        description: 'হিফজ, তাজবীদ চর্চা ও তাফসীরুল কুরআন ক্লাসের যৌথ ডিসকাশন',
        createdBy: 'তাহসীন বিল্লাহ',
        creatorId: 'mem-1',
        createdAt: new Date(Date.now() - 864e5 * 10).toISOString(),
        memberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
      },
      {
        id: 'group-2',
        name: '🏛️ থিওলজি অ্যাসাইনমেন্ট ও নোটস টিম',
        description: 'সেমিস্টার প্রেজেন্টেশন ও হ্যান্ডনোট সমন্বয় গ্রুপ',
        createdBy: 'মুহাম্মদ আবদুল্লাহ আল মাহফুজ',
        creatorId: 'mem-2',
        createdAt: new Date(Date.now() - 864e5 * 7).toISOString(),
        memberIds: ['mem-1', 'mem-2', 'mem-5', 'mem-6'],
      },
      {
        id: 'group-3',
        name: '🚌 ব্যাচ ট্যুর ও পিকনিক কমিটি ২০২৬',
        description: '৪০তম ব্যাচের বার্ষিক ট্যুর ও ইফতার মাহফিল আয়োজন কমিটি',
        createdBy: 'হাফেজ মাহমুদ হাসান',
        creatorId: 'mem-4',
        createdAt: new Date(Date.now() - 864e5 * 3).toISOString(),
        memberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5'],
      },
    ]);
  },

  createChatGroup(group: Omit<ChatGroup, 'id' | 'createdAt'>): ChatGroup {
    const newGroup: ChatGroup = {
      ...group,
      id: 'grp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const groups = this.getChatGroups();
    setLocal('chat_groups', [newGroup, ...groups]);
    this.addNotification('chat', `নতুন চ্যাট গ্রুপ তৈরি হয়েছে: ${newGroup.name}`);
    return newGroup;
  },

  getGroupMessages(groupId: string): GroupMessage[] {
    const all = getLocal<Record<string, GroupMessage[]>>('group_messages', {
      'group-1': [
        {
          id: 'gm-1',
          groupId: 'group-1',
          senderId: 'mem-1',
          senderName: 'তাহসীন বিল্লাহ',
          senderRoll: '৪০১',
          senderDesignation: 'প্রধান সমন্বয়ক',
          text: 'আসসালামু আলাইকুম। আগামীকালের উলূমুল কুরআন ক্লাসের আয়াতগুলো সবাই তিলাওয়াত করে আসুন।',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'gm-2',
          groupId: 'group-1',
          senderId: 'mem-2',
          senderName: 'মুহাম্মদ আবদুল্লাহ আল মাহফুজ',
          senderRoll: '৪০২',
          senderDesignation: 'ক্লাস সিআর',
          text: 'ওয়ালাইকুম আসসালাম ভাই, ইনশাআল্লাহ সূরা বাকারার প্রথম রুকূ তাফসীরসহ নোট প্রস্তুত করেছি।',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      'group-2': [
        {
          id: 'gm-3',
          groupId: 'group-2',
          senderId: 'mem-2',
          senderName: 'মুহাম্মদ আবদুল্লাহ আল মাহফুজ',
          senderRoll: '৪০২',
          senderDesignation: 'ক্লাস সিআর',
          text: 'অ্যাসাইনমেন্টের পিডিএফ ফাইলটি একাডেমিক ফাইল সেকশনে আপলোড করা হয়েছে।',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
      ],
    });
    return all[groupId] || [];
  },

  sendGroupMessage(msg: Omit<GroupMessage, 'id' | 'createdAt'>): GroupMessage {
    const newMsg: GroupMessage = {
      ...msg,
      id: 'gmsg-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const all = getLocal<Record<string, GroupMessage[]>>('group_messages', {});
    const existing = all[msg.groupId] || [];
    all[msg.groupId] = [...existing, newMsg];
    setLocal('group_messages', all);
    return newMsg;
  },

  // ----------------- Layout & Feature Customizer -----------------
  getDashboardFeatures(): string[] {
    const raw = getLocal<string[]>('dashboard_features', [
      'routine',
      'notice',
      'islamic',
      'teachers',
      'planner',
      'files',
      'chat',
      'members',
      'blood',
      'complaint',
      'tools',
      'fund',
      'polls',
      'welfare',
      'gallery',
    ]);
    return Array.from(new Set(raw));
  },

  setDashboardFeatures(features: string[]): void {
    setLocal('dashboard_features', Array.from(new Set(features)));
  },

  getBottomNavItems(): string[] {
    return getLocal<string[]>('bottom_nav_items', ['home', 'routine', 'polls', 'chat', 'blood', 'welfare']);
  },

  setBottomNavItems(items: string[]): void {
    setLocal('bottom_nav_items', items);
  },

  getClockSettings(): { type: 'analog' | 'digital' | 'both'; position: 'header' | 'hero' | 'topbar' } {
    return getLocal('clock_settings', {
      type: 'both',
      position: 'hero',
    });
  },

  setClockSettings(settings: { type: 'analog' | 'digital' | 'both'; position: 'header' | 'hero' | 'topbar' }): void {
    setLocal('clock_settings', settings);
  },
};
