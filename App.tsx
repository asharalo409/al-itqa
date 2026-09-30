import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Notice,
  RoutineItem,
  Teacher,
  FileItem,
  Complaint,
  FundTransaction,
  MemoryItem,
  UserRole,
  Language,
  Poll,
  WelfareRequest,
} from './types';
import {
  DataService,
  initializeSeedData,
} from './services/supabase';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { NoticeBoard } from './components/NoticeBoard';
import { RoutineRadar } from './components/RoutineRadar';
import { DailyPlanner } from './components/DailyPlanner';
import { IslamicHub } from './components/IslamicHub';
import { TeachersDirectory } from './components/TeachersDirectory';
import { AcademicFiles } from './components/AcademicFiles';
import { BatchChat } from './components/BatchChat';
import { MemberDirectory } from './components/MemberDirectory';
import { BloodBank } from './components/BloodBank';
import { ComplaintBox } from './components/ComplaintBox';
import { CgpaCalculator } from './components/CgpaCalculator';
import { BatchFund } from './components/BatchFund';
import { BatchGallery } from './components/BatchGallery';
import { PollsWidget } from './components/PollsWidget';
import { WelfareAid } from './components/WelfareAid';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ProfileModal } from './components/ProfileModal';
import { CustomizerModal } from './components/CustomizerModal';
import { AuthModal } from './components/AuthModal';
import { T_DICT } from './data/translations';

import {
  ArrowLeft,
  Calendar,
  Bell,
  Compass,
  MessageSquare,
  Users,
  Home,
  ShieldCheck,
  Award,
  Wallet,
  CheckSquare,
  GraduationCap,
  FolderDown,
  Heart,
  MessageCircleQuestion,
  Calculator,
  Camera,
  Vote,
  HandHeart,
  Search,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('alitqan_lang') as Language) || 'bn';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('alitqan_active_tab') || 'home';
  });

  const [notices, setNotices] = useState<Notice[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [fund, setFund] = useState<FundTransaction[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [welfareRequests, setWelfareRequests] = useState<WelfareRequest[]>([]);
  const [siteVisuals, setSiteVisuals] = useState({ logo: 'logo.jpg', cover: 'cover.jpg' });

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCustomizerModal, setShowCustomizerModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [bottomNavItems, setBottomNavItems] = useState<string[]>(() => DataService.getBottomNavItems());
  const [dashboardFeatures, setDashboardFeatures] = useState<string[]>(() => DataService.getDashboardFeatures());
  const [clockSettings, setClockSettings] = useState<{
    type: 'analog' | 'digital' | 'both';
    position: 'header' | 'hero' | 'topbar';
  }>(() => DataService.getClockSettings());

  const t = T_DICT[lang];

  useEffect(() => {
    initializeSeedData();
    setCurrentUser(DataService.getCurrentUser());
    setSiteVisuals(DataService.getSiteVisuals());
    setBottomNavItems(DataService.getBottomNavItems());
    setDashboardFeatures(DataService.getDashboardFeatures());
    setClockSettings(DataService.getClockSettings());
    loadAsyncData();

    // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadAsyncData = async () => {
    const [ns, rs, ts, fs, ms] = await Promise.all([
      DataService.getNotices(),
      DataService.getRoutine(),
      DataService.getTeachers(),
      DataService.getFiles(),
      DataService.getMembers(),
    ]);

    setNotices(ns);
    setRoutine(rs);
    setTeachers(ts);
    setFiles(fs);
    setMembers(ms);
    setComplaints(DataService.getComplaints());
    setFund(DataService.getFund());
    setMemories(DataService.getMemories());
    setPolls(DataService.getPolls());
    setWelfareRequests(DataService.getWelfareRequests());
  };

  const handleRefreshPolls = () => {
    setPolls(DataService.getPolls());
  };

  const handleRefreshWelfare = () => {
    setWelfareRequests(DataService.getWelfareRequests());
  };

  const handleToggleClockMode = (newMode: 'analog' | 'digital' | 'both') => {
    const updated = { ...clockSettings, type: newMode };
    setClockSettings(updated);
    DataService.setClockSettings(updated);
  };

  const getNavItemMeta = (tabId: string): { label: string; icon: React.FC<any>; color?: string } => {
    switch (tabId) {
      case 'home':
        return { label: 'হোম', icon: Home };
      case 'routine':
        return { label: 'রুটিন', icon: Calendar };
      case 'polls':
        return { label: 'ভোট', icon: Vote };
      case 'chat':
        return { label: 'চ্যাট', icon: MessageSquare };
      case 'blood':
        return { label: 'রক্ত', icon: Heart, color: 'text-red-400' };
      case 'welfare':
        return { label: 'সহায়তা', icon: HandHeart };
      case 'members':
        return { label: 'সদস্য', icon: Users };
      case 'notice':
        return { label: 'নোটিশ', icon: Bell };
      case 'islamic':
        return { label: 'ইসলামিক', icon: Compass };
      case 'fund':
        return { label: 'তহবিল', icon: Wallet };
      case 'planner':
        return { label: 'প্ল্যানার', icon: CheckSquare };
      case 'teachers':
        return { label: 'উস্তাজ', icon: GraduationCap };
      case 'files':
        return { label: 'ফাইল', icon: FolderDown };
      case 'tools':
        return { label: 'ক্যালকুলেটর', icon: Calculator };
      case 'complaint':
        return { label: 'মতামত', icon: MessageCircleQuestion };
      case 'gallery':
        return { label: 'স্মৃতি', icon: Camera };
      default:
        return { label: 'হোম', icon: Home };
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('alitqan_active_tab', tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('alitqan_lang', newLang);
    document.documentElement.lang = newLang;
    if (newLang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  // Urgent notice ticker text
  const urgentNotices = notices.filter(
    (n) => n.category === 'urgent' || n.category === 'exam'
  );
  const urgentText =
    urgentNotices.length > 0
      ? urgentNotices.map((n) => n.title).join('   ◆   ')
      : undefined;

  // Handlers
  const handleAddNotice = async (n: Omit<Notice, 'id' | 'created_at'>) => {
    await DataService.addNotice(n);
    const updated = await DataService.getNotices();
    setNotices(updated);
  };

  const handleDeleteNotice = async (id: string | number) => {
    await DataService.deleteNotice(id);
    setNotices(notices.filter((n) => n.id !== id));
  };

  const handleAddRoutineItems = async (items: Omit<RoutineItem, 'id'>[]) => {
    await DataService.addRoutineItems(items);
    const updated = await DataService.getRoutine();
    setRoutine(updated);
  };

  const handleDeleteRoutineItem = async (id: string | number) => {
    await DataService.deleteRoutineItem(id);
    setRoutine(routine.filter((r) => r.id !== id));
  };

  const handleUpdateRoutineTime = async (id: string | number, timeStr: string) => {
    await DataService.updateRoutineTime(id, timeStr);
    const updated = await DataService.getRoutine();
    setRoutine(updated);
  };

  const handleAddTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    await DataService.addTeacher(teacher);
    const updated = await DataService.getTeachers();
    setTeachers(updated);
  };

  const handleDeleteTeacher = async (id: number) => {
    await DataService.deleteTeacher(id);
    setTeachers(teachers.filter((t) => t.id !== id));
  };

  const handleAddFile = async (f: Omit<FileItem, 'id' | 'created_at'>) => {
    await DataService.addFile(f);
    const updated = await DataService.getFiles();
    setFiles(updated);
  };

  const handleDeleteFile = async (id: string | number) => {
    await DataService.deleteFile(id);
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleUpdateRole = (id: string, role: UserRole) => {
    DataService.updateMemberRole(id, role);
    setMembers(members.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    DataService.updateMemberStatus(id, status);
    setMembers(members.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleRemoveMember = (id: string) => {
    DataService.removeMember(id);
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleUpdateDesignation = (id: string, designation: string) => {
    DataService.updateMemberDesignation(id, designation);
    setMembers(members.map((m) => (m.id === id ? { ...m, designation } : m)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser({ ...currentUser, designation });
    }
  };

  const handleSubmitComplaint = (c: Omit<Complaint, 'id' | 'status' | 'created_at'>) => {
    const created = DataService.submitComplaint(c);
    setComplaints([created, ...complaints]);
    return created;
  };

  const handleUpdateComplaint = (
    id: string | number,
    status: 'pending' | 'review' | 'done',
    reply?: string
  ) => {
    DataService.updateComplaint(id, status, reply);
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, status, reply: reply !== undefined ? reply : c.reply } : c
      )
    );
  };

  const handleAddFundTransaction = (tx: Omit<FundTransaction, 'id'>) => {
    DataService.addFundTransaction(tx);
    setFund(DataService.getFund());
  };

  const handleAddMemory = (m: Omit<MemoryItem, 'id'>) => {
    DataService.addMemory(m);
    setMemories(DataService.getMemories());
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    DataService.setCurrentUser(updated);
    DataService.updateMember(updated);
    setCurrentUser(updated);
    setMembers(members.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleSwitchUser = (user: UserProfile) => {
    DataService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleUpdateSiteVisuals = (visuals: { logo?: string; cover?: string }) => {
    DataService.setSiteVisuals(visuals);
    setSiteVisuals(DataService.getSiteVisuals());
  };

  const isDedicatedPage = activeTab !== 'home';

  // Get current dedicated page metadata
  const getPageInfo = (tab: string) => {
    switch (tab) {
      case 'notice':
        return { title: t.notice, icon: Bell };
      case 'routine':
        return { title: t.routine, icon: Calendar };
      case 'planner':
        return { title: t.planner, icon: CheckSquare };
      case 'islamic':
        return { title: t.islamic, icon: Compass };
      case 'teachers':
        return { title: t.teachers, icon: GraduationCap };
      case 'files':
        return { title: t.files, icon: FolderDown };
      case 'chat':
        return { title: t.chat, icon: MessageSquare };
      case 'members':
        return { title: t.members, icon: Users };
      case 'blood':
        return { title: t.blood, icon: Heart };
      case 'complaint':
        return { title: t.complaint, icon: MessageCircleQuestion };
      case 'tools':
        return { title: t.tools, icon: Calculator };
      case 'fund':
        return { title: `${t.fund} ও ক্যালকুলেটর`, icon: Wallet };
      case 'gallery':
        return { title: t.gallery, icon: Camera };
      case 'polls':
        return { title: t.polls, icon: Vote };
      case 'welfare':
        return { title: t.welfare, icon: HandHeart };
      default:
        return { title: t.home, icon: Home };
    }
  };

  const pageInfo = getPageInfo(activeTab);
  const PageIcon = pageInfo.icon;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--gold)]/30 selection:text-[var(--gold-light)] font-sans antialiased ${
        lang === 'ar' ? 'font-arabic' : ''
      }`}
    >
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowCustomizerModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onSelectTab={handleSelectTab}
        urgentText={urgentText}
        lang={lang}
        onSelectLang={handleSelectLang}
        clockSettings={clockSettings}
        onToggleClockMode={handleToggleClockMode}
      />

      {/* Hero Showcase ONLY appears on Home Dashboard (Resolves user circled issue!) */}
      {activeTab === 'home' && (
        <Hero
          currentUser={currentUser}
          onSelectTab={handleSelectTab}
          siteVisuals={siteVisuals}
          onUpdateSiteVisuals={handleUpdateSiteVisuals}
          lang={lang}
          clockSettings={clockSettings}
          onToggleClockMode={handleToggleClockMode}
        />
      )}

      {/* Main Tab Navigation Bar on Desktop (hidden on mobile to prevent duplicate navigation lines!) */}
      <div className="hidden sm:block">
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          noticeCount={notices.length}
          lang={lang}
        />
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 pb-24 sm:pb-12">
        {/* If inside a dedicated page, show dedicated sleek breadcrumb & title without any clutter */}
        {isDedicatedPage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSelectTab('home')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--accent)] border border-[var(--border-color)] text-[var(--gold-light)] text-xs font-bold transition-all shadow-sm group active:scale-95 shrink-0"
              >
                <ArrowLeft
                  className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${
                    lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : ''
                  }`}
                />
                <span>{t.backToHome}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)] border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shrink-0">
                  <PageIcon className="w-4 h-4" />
                </div>
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  {pageInfo.title}
                </h1>
              </div>
            </div>

            {/* Role indicator */}
            <div className="text-xs text-[var(--text-secondary)] hidden sm:flex items-center gap-1.5">
              <span>{t.memberView}:</span>
              <strong className="text-[var(--gold-light)]">
                {currentUser?.role === 'admin' ? t.admin : currentUser?.role === 'cr' ? t.cr : t.member}
              </strong>
            </div>
          </div>
        )}

        {/* Dedicated Pages Routing */}
        {activeTab === 'home' && (
          <HomeDashboard
            notices={notices}
            routine={routine}
            teachers={teachers}
            members={members}
            currentUser={currentUser}
            onNavigate={handleSelectTab}
            lang={lang}
            polls={polls}
            onRefreshPolls={handleRefreshPolls}
            onOpenSearch={() => setShowSearchModal(true)}
            clockSettings={clockSettings}
            onToggleClockMode={handleToggleClockMode}
            dashboardFeatures={dashboardFeatures}
            onOpenCustomizer={() => setShowCustomizerModal(true)}
          />
        )}

        {activeTab === 'polls' && (
          <PollsWidget
            polls={polls}
            currentUser={currentUser}
            onRefreshPolls={handleRefreshPolls}
            lang={lang}
          />
        )}

        {activeTab === 'welfare' && (
          <WelfareAid
            requests={welfareRequests}
            currentUser={currentUser}
            onRefreshRequests={handleRefreshWelfare}
            onOpenPaymentModal={() => setShowCustomizerModal(true)}
            lang={lang}
          />
        )}

        {activeTab === 'notice' && (
          <NoticeBoard
            notices={notices}
            teachers={teachers}
            routine={routine}
            currentUser={currentUser}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        )}

        {activeTab === 'routine' && (
          <RoutineRadar
            routine={routine}
            teachers={teachers}
            currentUser={currentUser}
            onAddRoutineItems={handleAddRoutineItems}
            onDeleteRoutineItem={handleDeleteRoutineItem}
            onUpdateRoutineTime={handleUpdateRoutineTime}
          />
        )}

        {activeTab === 'planner' && <DailyPlanner />}

        {activeTab === 'islamic' && <IslamicHub />}

        {activeTab === 'teachers' && (
          <TeachersDirectory
            teachers={teachers}
            currentUser={currentUser}
            onAddTeacher={handleAddTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            lang={lang}
          />
        )}

        {activeTab === 'files' && (
          <AcademicFiles
            files={files}
            currentUser={currentUser}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {activeTab === 'chat' && (
          <BatchChat currentUser={currentUser} members={members} />
        )}

        {activeTab === 'members' && (
          <MemberDirectory
            members={members}
            currentUser={currentUser}
            onUpdateRole={handleUpdateRole}
            onUpdateStatus={handleUpdateStatus}
            onRemoveMember={handleRemoveMember}
            onOpenDm={() => handleSelectTab('chat')}
            onUpdateDesignation={handleUpdateDesignation}
          />
        )}

        {activeTab === 'blood' && (
          <BloodBank
            members={members}
            currentUser={currentUser}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        )}

        {activeTab === 'complaint' && (
          <ComplaintBox
            complaints={complaints}
            currentUser={currentUser}
            onSubmitComplaint={handleSubmitComplaint}
            onUpdateComplaint={handleUpdateComplaint}
          />
        )}

        {activeTab === 'tools' && <CgpaCalculator />}

        {activeTab === 'fund' && (
          <BatchFund
            transactions={fund}
            currentUser={currentUser}
            onAddTransaction={handleAddFundTransaction}
            onOpenCustomizer={() => setShowCustomizerModal(true)}
            lang={lang}
          />
        )}

        {activeTab === 'gallery' && (
          <BatchGallery
            memories={memories}
            currentUser={currentUser}
            onAddMemory={handleAddMemory}
          />
        )}
      </main>

      {/* Floating Bottom Quick Dock (Visible on Mobile & Desktop - Fully customized from Settings!) */}
      <div className="fixed bottom-0 sm:bottom-3 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-40 sm:max-w-xl w-full sm:w-auto bg-[var(--bg-card)]/95 backdrop-blur-md border-t sm:border border-[var(--gold)]/40 px-1.5 sm:px-4 py-1.5 flex items-center justify-around sm:justify-center sm:gap-2 shadow-2xl sm:rounded-2xl transition-all">
        {bottomNavItems.map((tabId, index) => {
          const itemMeta = getNavItemMeta(tabId);
          const Icon = itemMeta.icon;
          const isActive = activeTab === tabId;
          return (
            <button
              key={`${tabId}-${index}`}
              onClick={() => handleSelectTab(tabId)}
              title={itemMeta.label}
              className={`flex flex-col items-center gap-0.5 p-1 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                isActive
                  ? 'text-[var(--gold)] bg-[var(--accent)] sm:shadow-sm scale-105'
                  : itemMeta.color || 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-[var(--gold)]' : ''}`} />
              <span className="truncate max-w-[48px] sm:max-w-[70px]">{itemMeta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          currentUser={currentUser}
          allMembers={members}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={handleUpdateProfile}
          onSwitchUser={handleSwitchUser}
          onUpdateSiteVisuals={handleUpdateSiteVisuals}
          lang={lang}
        />
      )}

      {/* Comprehensive Customizer Modal */}
      {showCustomizerModal && (
        <CustomizerModal
          onClose={() => setShowCustomizerModal(false)}
          onUpdateVisuals={handleUpdateSiteVisuals}
          lang={lang}
          onUpdateBottomNav={(items) => setBottomNavItems(items)}
          onUpdateClock={(clk) => setClockSettings(clk)}
          onUpdateDashboardFeatures={(feats) => setDashboardFeatures(feats)}
        />
      )}

      {/* Auth / Login Modal for New & Returning Users */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          members={members}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
          lang={lang}
        />
      )}

      {/* Universal Search Modal */}
      {showSearchModal && (
        <GlobalSearchModal
          onClose={() => setShowSearchModal(false)}
          onNavigateTab={(tabId) => {
            handleSelectTab(tabId);
            setShowSearchModal(false);
          }}
          notices={notices}
          routine={routine}
          teachers={teachers}
          members={members}
          files={files}
          polls={polls}
        />
      )}

      {/* Majestic Footer */}
      <footer className="w-full bg-[var(--bg-card)] border-t border-[var(--border-color)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] font-bold text-sm shrink-0">
              ৪০
            </div>
            <div>
              <div className="font-bold text-[var(--gold-light)] text-sm">
                {t.title} · {t.dept}
              </div>
              <div className="text-[11px] opacity-80">
                {t.university}
              </div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-0.5">
            <div className="font-arabic text-sm text-[var(--gold-light)]">
              «وَقُل رَّبِّ زِدْنِي عِلْمًا»
            </div>
            <div className="text-[11px] opacity-75">
              {t.motto}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
