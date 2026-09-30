import React from 'react';
import {
  Home,
  Bell,
  Calendar,
  CheckSquare,
  BookOpen,
  GraduationCap,
  FolderDown,
  MessageSquare,
  Users,
  Heart,
  MessageCircleQuestion,
  Calculator,
  Wallet,
  Camera,
  Moon,
  Vote,
  HandHeart,
} from 'lucide-react';
import { Language } from '../types';
import { T_DICT } from '../data/translations';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  noticeCount?: number;
  lang: Language;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  noticeCount,
  lang,
}) => {
  const t = T_DICT[lang];

  const NAV_ITEMS = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'polls', label: t.polls, icon: Vote },
    { id: 'notice', label: t.notice, icon: Bell, badge: noticeCount },
    { id: 'routine', label: t.routine, icon: Calendar },
    { id: 'planner', label: t.planner, icon: CheckSquare },
    { id: 'islamic', label: t.islamic, icon: Moon },
    { id: 'teachers', label: t.teachers, icon: GraduationCap },
    { id: 'files', label: t.files, icon: FolderDown },
    { id: 'chat', label: t.chat, icon: MessageSquare },
    { id: 'members', label: t.members, icon: Users },
    { id: 'blood', label: t.blood, icon: Heart },
    { id: 'welfare', label: t.welfare, icon: HandHeart },
    { id: 'complaint', label: t.complaint, icon: MessageCircleQuestion },
    { id: 'tools', label: t.tools, icon: Calculator },
    { id: 'fund', label: t.fund, icon: Wallet },
    { id: 'gallery', label: t.gallery, icon: Camera },
  ];

  return (
    <nav className="w-full bg-[var(--bg-main)] border-b border-[var(--border-color)] sticky top-14 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center overflow-x-auto no-scrollbar py-1 gap-1">
          {NAV_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all relative ${
                  isActive
                    ? 'text-[var(--gold-light)] bg-[var(--bg-card)] border border-[var(--gold)]/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[var(--gold)] scale-110' : 'opacity-70'
                  }`}
                />
                <span>{tab.label}</span>

                {tab.id === 'notice' && tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white leading-none">
                    {tab.badge}
                  </span>
                ) : null}

                {/* Subtle active golden underline indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--gold)] rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
