export type UserRole = 'admin' | 'cr' | 'member';
export type UserStatus = 'new' | 'pending' | 'approved' | 'rejected';
export type Language = 'bn' | 'en' | 'ar';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roll: string;
  blood: string;
  phone: string;
  fb?: string;
  addr?: string;
  photo?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  designation?: string; // Custom designated role/title (যেমন: 'ক্লাস সিআর', 'ক্যাশিয়ার', 'আইটি সমন্বয়ক', 'ক্রীড়া সম্পাদক')
}

export type NoticeCategory = 'general' | 'urgent' | 'assignment' | 'tutorial' | 'homework' | 'exam' | 'sports';

export interface Notice {
  id: string | number;
  title: string;
  category: NoticeCategory;
  due?: string | null;
  teacher_id?: number | null;
  routine_id?: number | null;
  teacher?: string;
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  designation?: string;
  department?: string;
  phone?: string;
  email?: string;
  photo?: string;
  room?: string;
  courses?: string[];
}

export interface RoutineItem {
  id: number | string;
  day: number; // 0: Sat, 1: Sun, 2: Mon, 3: Tue, 4: Wed, 5: Thu, 6: Fri
  serial: number;
  code: string;
  subject: string;
  teacher_id?: number | null;
  teacher_name?: string | null;
  time?: string;
  start_time?: string; // HH:mm
  end_time?: string;   // HH:mm
  room?: string;
}

export type DailyCategory = 'study' | 'prayer' | 'meal' | 'bath' | 'sport' | 'class' | 'work' | 'sleep' | 'other';

export interface DailyTask {
  id: number | string;
  day: string; // YYYY-MM-DD
  cat: DailyCategory;
  title: string;
  start_time?: string;
  end_time?: string;
  done: boolean;
}

export interface StudyGoal {
  id: number | string;
  title: string;
  due?: string | null;
  done: boolean;
  category?: string;
}

export interface FileItem {
  id: number | string;
  name: string;
  url: string;
  path?: string;
  category?: 'book' | 'slide' | 'note' | 'question' | 'video' | 'link';
  course_code?: string;
  created_at: string;
}

export interface Message {
  id: number | string;
  name: string;
  body: string;
  user_id?: string;
  created_at: string;
}

export interface DirectMessage {
  id: number | string;
  sender: string;
  receiver: string;
  body: string;
  created_at: string;
}

export interface Complaint {
  id: number | string;
  title: string;
  body: string;
  category: 'academic' | 'room' | 'exam' | 'other';
  code?: string | null;
  user_id?: string | null;
  name?: string | null;
  status: 'pending' | 'review' | 'done';
  reply?: string | null;
  created_at: string;
}

export interface FundTransaction {
  id: string;
  title: string;
  type: 'in' | 'out';
  amount: number;
  date: string;
  category: string;
  note?: string;
}

export interface PaymentSettings {
  bkashNumber: string;
  bkashType: 'personal' | 'merchant' | 'agent';
  nagadNumber: string;
  nagadType: 'personal' | 'merchant';
  rocketNumber: string;
  upayNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  monthlyFee: number;
  instructions?: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
  trxId: string;
  purpose: string;
  status: 'pending' | 'verified' | 'rejected';
  date: string;
  note?: string;
}

export interface AppSettings {
  appName: string;
  batchName: string;
  departmentName: string;
  universityName: string;
  motto: string;
  logoUrl?: string;
  coverUrl?: string;
  batchCode: string;
  clockType?: 'analog' | 'digital' | 'both';
  clockPosition?: 'header' | 'hero' | 'topbar';
  bottomNavItems?: string[]; // array of tab IDs for mobile bottom navigation (e.g. ['home', 'routine', 'members', 'polls', 'chat'])
  hiddenFeatures?: string[];
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdBy: string;
  creatorId?: string;
  createdAt: string;
  memberIds: string[]; // member IDs included in group
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRoll?: string;
  senderDesignation?: string;
  text: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  caption: string;
  tag: string;
}

export interface AppNotification {
  id: number | string;
  kind: string;
  text: string;
  created_at: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs who voted for this option
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  createdBy: string;
  creatorId?: string;
  createdAt: string;
  expiresAt?: string | null;
  isActive: boolean;
}

export interface WelfareRequest {
  id: string;
  title: string;
  category: 'medical' | 'tuition' | 'emergency' | 'books' | 'other';
  amountNeeded?: number;
  amountRaised?: number;
  description: string;
  applicantName?: string;
  applicantRoll?: string;
  phone?: string;
  isAnonymous: boolean;
  status: 'active' | 'completed' | 'closed';
  createdAt: string;
}
