import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Smile,
  Trash2,
  Users,
  User,
  Phone,
  Search,
  Sparkles,
  ArrowLeft,
  Plus,
  Check,
  FolderPlus,
  Info,
  X,
  MessageCircle,
} from 'lucide-react';
import { Message, DirectMessage, UserProfile, ChatGroup, GroupMessage } from '../types';
import { DataService } from '../services/supabase';

interface BatchChatProps {
  currentUser: UserProfile | null;
  members: UserProfile[];
}

export const EMOJIS = ['🤲', '🕌', '📖', '✨', '❤️', '👍', '👏', '😊', '😂', '🔥', '📚', '💯', '💐', '🎉'];

export const BatchChat: React.FC<BatchChatProps> = ({ currentUser, members }) => {
  const [chatMode, setChatMode] = useState<'main' | 'groups' | 'dm'>('main');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [showEmoji, setShowEmoji] = useState<boolean>(false);

  // Custom Groups state
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // DM state
  const [selectedDmUser, setSelectedDmUser] = useState<UserProfile | null>(null);
  const [dmList, setDmList] = useState<DirectMessage[]>([]);
  const [dmSearch, setDmSearch] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGroupMessages();
    loadCustomGroups();
  }, []);

  useEffect(() => {
    if (selectedDmUser && currentUser) {
      loadDmMessages(selectedDmUser.id);
    }
  }, [selectedDmUser]);

  useEffect(() => {
    if (selectedGroup) {
      loadCustomGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, dmList, groupMessages]);

  const loadGroupMessages = () => {
    setMessages(DataService.getMessages());
  };

  const loadCustomGroups = () => {
    const grps = DataService.getChatGroups();
    setChatGroups(grps);
    if (grps.length > 0 && !selectedGroup) {
      setSelectedGroup(grps[0]);
    }
  };

  const loadCustomGroupMessages = (groupId: string) => {
    setGroupMessages(DataService.getGroupMessages(groupId));
  };

  const loadDmMessages = (targetId: string) => {
    if (!currentUser) return;
    setDmList(DataService.getDirectMessages(currentUser.id, targetId));
  };

  const handleSendMain = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = currentUser?.name || 'শিক্ষার্থী';
    const newMsg = DataService.sendMessage(senderName, inputText.trim(), currentUser?.id);
    setMessages([...messages, newMsg]);
    setInputText('');
    setShowEmoji(false);
  };

  const handleSendCustomGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedGroup || !currentUser) return;

    const newMsg = DataService.sendGroupMessage({
      groupId: selectedGroup.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRoll: currentUser.roll,
      senderDesignation: currentUser.designation,
      text: inputText.trim(),
    });
    setGroupMessages([...groupMessages, newMsg]);
    setInputText('');
    setShowEmoji(false);
  };

  const handleSendDm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedDmUser || !currentUser) return;

    const dm = DataService.sendDirectMessage(currentUser.id, selectedDmUser.id, inputText.trim());
    setDmList([...dmList, dm]);
    setInputText('');
    setShowEmoji(false);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;

    const myId = currentUser.id;
    const finalMembers = Array.from(new Set([myId, ...selectedMemberIds]));

    const grp = DataService.createChatGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined,
      createdBy: currentUser.name,
      creatorId: currentUser.id,
      memberIds: finalMembers,
    });

    setChatGroups([grp, ...chatGroups]);
    setSelectedGroup(grp);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedMemberIds([]);
    setShowCreateGroupModal(false);
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleDeleteMessage = (id: number | string) => {
    if (confirm('মেসেজটি মুছে ফেলতে চান?')) {
      DataService.deleteMessage(id);
      setMessages(messages.filter((m) => m.id !== id));
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-3">
      {/* 3-Mode Switcher */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setChatMode('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              chatMode === 'main'
                ? 'bg-[var(--gold)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ব্যাচ মূল চ্যাট</span>
          </button>

          <button
            onClick={() => setChatMode('groups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              chatMode === 'groups'
                ? 'bg-[var(--gold)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>কাস্টম গ্রুপসমূহ ({chatGroups.length})</span>
          </button>

          <button
            onClick={() => setChatMode('dm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              chatMode === 'dm'
                ? 'bg-[var(--gold)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ব্যক্তিগত চ্যাট (DM)</span>
          </button>
        </div>

        <div className="text-xs text-[var(--gold-light)] hidden md:block">
          {chatMode === 'main'
            ? '👥 আল ইতকান ৪০ সার্বিক ব্যাচ ফোরাম'
            : chatMode === 'groups'
            ? '🏷️ বিষয়ভিত্তিক স্টাডি ও উপ-কমিটি গ্রুপ'
            : '🔒 সহপাঠীদের সাথে ১-টু-১ চ্যাট'}
        </div>
      </div>

      {/* 1. MAIN BATCH CHAT */}
      {chatMode === 'main' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col h-[520px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-[var(--gold-light)]">আল ইতকান ৪০ মূল আড্ডা</span>
              <span className="text-[var(--text-secondary)]">({members.length} জন সদস্য)</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">মর্যাদাপূর্ণ ও ইতিবাচক আলোচনা কাম্য</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isMe = currentUser && m.user_id === currentUser.id;
              const canDelete = isMe || isAdmin;

              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                  <div className="flex items-center gap-1.5 mb-0.5 text-[11px] text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--gold-light)]">{m.name}</span>
                    <span>·</span>
                    <span>
                      {new Date(m.created_at).toLocaleTimeString('bn-BD', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        title="মেসেজ মুছুন"
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-md px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[var(--accent)] text-white rounded-tr-none border border-[var(--border-light)]'
                        : 'bg-[var(--bg-main)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Emoji row */}
          {showEmoji && (
            <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-main)]/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => addEmoji(e)}
                  className="text-lg hover:scale-125 transition-transform shrink-0"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSendMain}
            className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-main)] transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="ব্যাচ আড্ডায় আপনার বার্তা লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>পাঠান</span>
            </button>
          </form>
        </div>
      )}

      {/* 2. CUSTOM CHAT GROUPS VIEW (User requested: "চ্যাটের ভিতর গ্রুপ করতে পারব") */}
      {chatMode === 'groups' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl grid grid-cols-1 md:grid-cols-3 h-[540px] shadow-sm overflow-hidden">
          {/* Left Column: Groups List */}
          <div className="border-r border-[var(--border-color)] flex flex-col h-full bg-[var(--bg-card-subtle)]/50">
            <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--gold-light)] flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-[var(--gold)]" />
                গ্রুপসমূহ
              </span>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="px-2.5 py-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--gold)] hover:text-black border border-[var(--gold)]/40 text-[var(--gold-light)] font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>নতুন গ্রুপ</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {chatGroups.map((grp) => {
                const isSelected = selectedGroup?.id === grp.id;
                return (
                  <button
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-[var(--accent)] border-[var(--gold)]/60 text-white shadow-sm'
                        : 'bg-[var(--bg-main)]/60 border-[var(--border-color)] hover:border-[var(--gold)]/40 text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate max-w-[170px]">
                        {grp.name}
                      </span>
                      <span className="text-[10px] text-[var(--gold-light)] font-mono">
                        {grp.memberIds.length} জন
                      </span>
                    </div>
                    {grp.description && (
                      <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">
                        {grp.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Group Messages Stream */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedGroup ? (
              <>
                {/* Active Group Header */}
                <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[var(--gold)]" />
                      {selectedGroup.name}
                    </h3>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      প্রতিষ্ঠাতা: {selectedGroup.createdBy} • সদস্য: {selectedGroup.memberIds.length} জন
                    </div>
                  </div>
                </div>

                {/* Group Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {groupMessages.length > 0 ? (
                    groupMessages.map((gm) => {
                      const isMe = currentUser && gm.senderId === currentUser.id;
                      return (
                        <div key={gm.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-0.5 text-[11px] text-[var(--text-secondary)]">
                            <span className="font-bold text-[var(--gold-light)]">{gm.senderName}</span>
                            {gm.senderDesignation && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                                {gm.senderDesignation}
                              </span>
                            )}
                            <span>·</span>
                            <span>
                              {new Date(gm.createdAt).toLocaleTimeString('bn-BD', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-md px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-[var(--accent)] text-white rounded-tr-none border border-[var(--border-light)]'
                                : 'bg-[var(--bg-main)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'
                            }`}
                          >
                            {gm.text}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-xs text-[var(--text-secondary)]">
                      এই গ্রুপে এখনো কোনো মেসেজ নেই। আলোচনা শুরু করতে প্রথম মেসেজ লিখুন।
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Group Message Input */}
                <form
                  onSubmit={handleSendCustomGroup}
                  className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`${selectedGroup.name} গ্রুপে লিখুন...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠান</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-20 text-xs text-[var(--text-secondary)]">
                বামপাশ থেকে একটি গ্রুপ সিলেক্ট করুন
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DIRECT MESSAGING (DM) */}
      {chatMode === 'dm' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl grid grid-cols-1 md:grid-cols-3 h-[520px] shadow-sm overflow-hidden">
          {/* Member Search sidebar */}
          <div className="border-r border-[var(--border-color)] flex flex-col h-full bg-[var(--bg-card-subtle)]/50">
            <div className="p-3 border-b border-[var(--border-color)]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="সহপাঠী খুঁজুন..."
                  value={dmSearch}
                  onChange={(e) => setDmSearch(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {members
                .filter(
                  (m) =>
                    m.id !== currentUser?.id &&
                    (m.name.toLowerCase().includes(dmSearch.toLowerCase()) ||
                      m.roll.includes(dmSearch) ||
                      (m.designation && m.designation.toLowerCase().includes(dmSearch.toLowerCase())))
                )
                .map((m) => {
                  const isSelected = selectedDmUser?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedDmUser(m)}
                      className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent)] border border-[var(--gold)]/40 text-white'
                          : 'hover:bg-[var(--bg-main)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-700 text-black font-bold text-xs flex items-center justify-center shrink-0">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{m.name[0]}</span>
                        )}
                      </div>

                      <div className="truncate min-w-0">
                        <div className="font-bold text-xs text-white truncate">{m.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] truncate">
                          রোল: {m.roll} {m.designation && `• ${m.designation}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* DM Chat Area */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedDmUser ? (
              <>
                <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-white">{selectedDmUser.name}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      (রোল: {selectedDmUser.roll})
                    </span>
                    {selectedDmUser.designation && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                        {selectedDmUser.designation}
                      </span>
                    )}
                  </div>

                  {selectedDmUser.phone && (
                    <a
                      href={`tel:${selectedDmUser.phone}`}
                      className="px-2 py-1 rounded-lg bg-[var(--bg-main)] text-[var(--gold)] border border-[var(--border-color)] flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>কল</span>
                    </a>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {dmList.length > 0 ? (
                    dmList.map((m) => {
                      const isMe = currentUser && m.sender === currentUser.id;
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-[var(--text-secondary)] mb-0.5">
                            {new Date(m.created_at).toLocaleTimeString('bn-BD', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                          <div
                            className={`max-w-[85%] sm:max-w-md px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-[var(--accent)] text-white rounded-tr-none border border-[var(--border-light)]'
                                : 'bg-[var(--bg-main)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'
                            }`}
                          >
                            {m.body}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-xs text-[var(--text-secondary)]">
                      এখনো কোনো বার্তা পাঠানো হয়নি। প্রথম মেসেজটি লিখে কথোপকথন শুরু করুন!
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={handleSendDm}
                  className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`${selectedDmUser.name}-কে মেসেজ লিখুন...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠান</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center p-6 text-[var(--text-secondary)] text-xs">
                <User className="w-10 h-10 mx-auto text-[var(--gold)]/30 mb-2" />
                <p>বামপাশের তালিকা থেকে যেকোনো সহপাঠীকে নির্বাচন করে চ্যাট শুরু করুন।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOM GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--gold)]/60 rounded-3xl p-5 shadow-2xl space-y-4 my-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--gold-light)] flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[var(--gold)]" />
                নতুন চ্যাট গ্রুপ তৈরি করুন
              </h3>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold text-white">
                  গ্রুপের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হাদিস স্টাডি সার্কেল / ট্যুর কমিটি"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">
                  বিবরণ বা উদ্দেশ্য (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  placeholder="গ্রুপের কাজের পরিধি বা বিষয়..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold text-white">
                  সদস্য নির্বাচন করুন ({selectedMemberIds.length} জন নির্বাচিত)
                </label>
                <div className="max-h-40 overflow-y-auto p-1 space-y-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
                  {members.map((m) => {
                    const isSelected = selectedMemberIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMemberSelection(m.id)}
                        className={`w-full p-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center text-[9px] font-bold">
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="font-bold text-white text-xs">{m.name}</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">({m.roll})</span>
                        </div>
                        {m.designation && (
                          <span className="text-[9px] text-amber-300 truncate max-w-[90px]">
                            {m.designation}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold disabled:opacity-50"
                >
                  গ্রুপ তৈরি সম্পন্ন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
