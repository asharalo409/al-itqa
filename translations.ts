import { Language } from '../types';

export interface Translations {
  title: string;
  dept: string;
  university: string;
  batch: string;
  motto: string;
  home: string;
  notice: string;
  routine: string;
  planner: string;
  islamic: string;
  teachers: string;
  files: string;
  chat: string;
  members: string;
  blood: string;
  complaint: string;
  tools: string;
  fund: string;
  gallery: string;
  polls: string;
  welfare: string;
  settings: string;
  admin: string;
  cr: string;
  member: string;
  backToHome: string;
  all: string;
  add: string;
  save: string;
  cancel: string;
  delete: string;
  search: string;
  call: string;
  upload: string;
  changeLogo: string;
  changeCover: string;
  todayClasses: string;
  runningNow: string;
  startsIn: string;
  ended: string;
  nextPrayer: string;
  tasbih: string;
  quranAyah: string;
  studyGoals: string;
  emergencyBlood: string;
  anonymousBox: string;
  cgpaCalc: string;
  batchFundLedger: string;
  memoriesArchive: string;
  adminPrivileges: string;
  memberView: string;
  switchProfile: string;
  themePicker: string;
  batchSecretCode: string;
  claimCode: string;
}

export const T_DICT: Record<Language, Translations> = {
  bn: {
    title: 'আল ইতকান ৪০',
    dept: 'আল কুরআন ও ইসলামিক স্টাডিজ বিভাগ',
    university: 'ইসলামী বিশ্ববিদ্যালয়, বাংলাদেশ',
    batch: '৪০তম ব্যাচ',
    motto: 'জ্ঞানের গভীরতায় ও চরিত্রের দৃঢ়তায় এগিয়ে যাক আল-ইতকান কাফেলা',
    home: 'প্রধান ড্যাশবোর্ড',
    notice: 'নোটিশ বোর্ড',
    routine: 'ক্লাস রুটিন',
    planner: 'দৈনিক প্ল্যানার',
    islamic: 'ইসলামিক কর্নার',
    teachers: 'সম্মানিত উস্তাজ',
    files: 'একাডেমিক ফাইল',
    chat: 'ব্যাচ চ্যাট',
    members: 'সহপাঠী তালিকা',
    blood: 'রক্তদাতা সন্ধান',
    complaint: 'অভিযোগ ও মতামত',
    tools: 'সিজিপিএ ক্যালকুলেটর',
    fund: 'ব্যাচ ফান্ড হিসাব',
    gallery: 'স্মৃতি ও গ্যালারি',
    polls: 'পোল ও উন্মুক্ত ভোট',
    welfare: 'সহযোগিতা ও ওয়েলফেয়ার',
    settings: 'প্রোফাইল ও সেটিংস',
    admin: 'অ্যাডমিন',
    cr: 'ক্লাস সিআর',
    member: 'সম্মানিত সদস্য',
    backToHome: 'ড্যাশবোর্ডে ফিরুন',
    all: 'সকল',
    add: 'যোগ করুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    search: 'অনুসন্ধান করুন...',
    call: 'কল করুন',
    upload: 'ফাইল আপলোড',
    changeLogo: 'লোগো ছবি পরিবর্তন',
    changeCover: 'কভার ছবি পরিবর্তন',
    todayClasses: 'আজকের ক্লাস রাডার',
    runningNow: 'এখন চলছে',
    startsIn: 'শুরু হতে বাকি',
    ended: 'আজকের সব ক্লাস শেষ',
    nextPrayer: 'আসন্ন ওয়াক্ত',
    tasbih: 'ডিজিটাল তাসবীহ',
    quranAyah: 'আজকের আয়াত ও তাদাব্বুর',
    studyGoals: 'পড়ার লক্ষ্যমাত্রা',
    emergencyBlood: 'জরুরি রক্তদাতা উইং',
    anonymousBox: 'গোপন অভিযোগ ও মতামত বাক্স',
    cgpaCalc: 'ইবি সিজিপিএ ক্যালকুলেটর',
    batchFundLedger: 'ব্যাচ অডিট লেজার',
    memoriesArchive: 'স্মৃতি ও অ্যালবাম',
    adminPrivileges: 'অ্যাডমিন ক্ষমতা সক্রিয়',
    memberView: 'শিক্ষার্থী ভিউ',
    switchProfile: 'প্রোফাইল সুইচ',
    themePicker: 'থিম নির্বাচন',
    batchSecretCode: 'ব্যাচ গোপন কোড',
    claimCode: 'কোড জমা দিন',
  },
  en: {
    title: 'Al-Itqan 40',
    dept: 'Dept. of Al-Quran & Islamic Studies',
    university: 'Islamic University, Bangladesh',
    batch: '40th Batch',
    motto: 'Advancing with depth of knowledge and firmness of character',
    home: 'Main Dashboard',
    notice: 'Notices & Deadlines',
    routine: 'Class Routine',
    planner: 'Daily Planner',
    islamic: 'Islamic Corner',
    teachers: 'Honorable Faculty',
    files: 'Academic Files',
    chat: 'Batch Chat',
    members: 'Student Directory',
    blood: 'Blood Donors',
    complaint: 'Suggestion Box',
    tools: 'CGPA Calculator',
    fund: 'Batch Fund Ledger',
    gallery: 'Memories & Gallery',
    polls: 'Batch Polls & Voting',
    welfare: 'Welfare & Aid Desk',
    settings: 'Profile & Settings',
    admin: 'Admin',
    cr: 'Class Rep',
    member: 'Member',
    backToHome: 'Back to Dashboard',
    all: 'All',
    add: 'Add New',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    search: 'Search...',
    call: 'Call Now',
    upload: 'Upload File',
    changeLogo: 'Change Logo',
    changeCover: 'Change Cover Photo',
    todayClasses: "Today's Class Radar",
    runningNow: 'In Progress',
    startsIn: 'Starts in',
    ended: 'Classes Finished Today',
    nextPrayer: 'Upcoming Prayer',
    tasbih: 'Digital Tasbih',
    quranAyah: 'Verse of the Day',
    studyGoals: 'Study Goals',
    emergencyBlood: 'Emergency Blood Donors',
    anonymousBox: 'Anonymous Suggestion Box',
    cgpaCalc: 'IU CGPA Calculator',
    batchFundLedger: 'Batch Financial Ledger',
    memoriesArchive: 'Memories Archive',
    adminPrivileges: 'Admin Mode Active',
    memberView: 'Student View',
    switchProfile: 'Switch Account',
    themePicker: 'Color Theme',
    batchSecretCode: 'Batch Secret Code',
    claimCode: 'Submit Code',
  },
  ar: {
    title: 'الإتقان ٤٠',
    dept: 'قسم القرآن الكريم والدراسات الإسلامية',
    university: 'الجامعة الإسلامية، بنغلاديش',
    batch: 'الدفعة الأربعون',
    motto: '«وَقُل رَّبِّ زِدْنِي عِلْمًا» — في رحاب القرآن علماً وعملاً وأخلاقاً',
    home: 'لوحة التحكم الرئيسية',
    notice: 'لوحة الإعلانات',
    routine: 'جدول المحاضرات',
    planner: 'المخطط اليومي',
    islamic: 'الركن الإسلامي',
    teachers: 'الأساتذة الكرام',
    files: 'الملفات الأكاديمية',
    chat: 'محادثة الدفعة',
    members: 'دليل الطلاب',
    blood: 'المتبرعون بالدم',
    complaint: 'صندوق الآراء والملاحظات',
    tools: 'حاسبة المعدل التراكمي',
    fund: 'صندوق مالية الدفعة',
    gallery: 'معرض الذكريات',
    polls: 'استطلاعات الرأي والتصويت',
    welfare: 'مكتب المساعدات والتكافل',
    settings: 'الملف الشخصي والإعدادات',
    admin: 'المشرف',
    cr: 'ممثل الدفعة',
    member: 'عضو',
    backToHome: 'العودة إلى الرئيسية',
    all: 'الكل',
    add: 'إضافة جديد',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    delete: 'حذف',
    search: 'بحث...',
    call: 'اتصال هاتفي',
    upload: 'رفع ملف',
    changeLogo: 'تغيير الشعار',
    changeCover: 'تغيير صورة الغلاف',
    todayClasses: 'محاضرات اليوم المباشرة',
    runningNow: 'جارية الآن',
    startsIn: 'تبدأ بعد',
    ended: 'انتهت محاضرات اليوم',
    nextPrayer: 'الصلاة القادمة',
    tasbih: 'المسبحة الإلكترونية',
    quranAyah: 'آية اليوم وتدبرها',
    studyGoals: 'أهداف المذاكرة',
    emergencyBlood: 'بنك الدم الطارئ',
    anonymousBox: 'صندوق الشكاوى والملاحظات',
    cgpaCalc: 'حاسبة المعدل التراكمي (IU)',
    batchFundLedger: 'سجل مالية الدفعة',
    memoriesArchive: 'أرشيف الذكريات واللقطات',
    adminPrivileges: 'صلاحيات المشرف مفعلة',
    memberView: 'واجهة الطالب',
    switchProfile: 'تبديل الحساب',
    themePicker: 'نسق الألوان',
    batchSecretCode: 'رمز الدفعة السري',
    claimCode: 'إدخال الرمز',
  },
};
