import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Facebook,
  MessageSquare,
  Shield,
  Award,
  Trash2,
  Check,
  X,
  KeyRound,
  MapPin,
  Filter,
  Edit2,
  Tag,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { DataService } from '../services/supabase';

interface MemberDirectoryProps {
  members: UserProfile[];
  currentUser: UserProfile | null;
  onUpdateRole: (id: string, role: UserRole) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onRemoveMember: (id: string) => void;
  onOpenDm: (user: UserProfile) => void;
  onUpdateDesignation?: (id: string, designation: string) => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  currentUser,
  onUpdateRole,
  onUpdateStatus,
  onRemoveMember,
  onOpenDm,
  onUpdateDesignation,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'cr' | 'member'>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'admin';

  const approvedMembers = members.filter((m) => m.status === 'approved');
  const pendingMembers = members.filter((m) => m.status === 'pending');

  const filtered = approvedMembers.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.roll.includes(q) ||
      (m.designation && m.designation.toLowerCase().includes(q)) ||
      (m.blood && m.blood.toLowerCase().includes(q)) ||
      (m.addr && m.addr.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesBlood = bloodFilter === 'all' || m.blood === bloodFilter;

    return matchesSearch && matchesRole && matchesBlood;
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Search */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--gold)]" />
              ব্যাচ সহপাঠী ডিরেক্টরি (আল ইতকান ৪০)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              মোট অনুমোদিত সদস্য: {approvedMembers.length.toLocaleString('bn-BD')} জন
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="নাম, রোল, রক্তের গ্রুপ বা হল..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-[var(--border-color)]/50 text-xs">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span className="text-[var(--text-secondary)]">পদবী:</span>
          </div>

          {(['all', 'admin', 'cr', 'member'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-[var(--gold)] text-black font-bold'
                  : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              {r === 'all' ? 'সব' : r === 'admin' ? 'অ্যাডমিন' : r === 'cr' ? 'সিআর' : 'সাধারণ সদস্য'}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)]">রক্তের গ্রুপ:</span>
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--gold-light)] focus:border-[var(--gold)] focus:outline-none"
            >
              <option value="all">সকল গ্রুপ</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Admin: Pending Approvals Box */}
      {isAdmin && pendingMembers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              অনুমোদনের অপেক্ষায় থাকা শিক্ষার্থী ({pendingMembers.length})
            </h3>
            <span className="text-[11px] text-amber-200/70">ব্যাচ কোড সাবমিট করেছেন</span>
          </div>

          <div className="space-y-2">
            {pendingMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{m.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    রোল: {m.roll} · ইমেইল: {m.email} · ফোন: {m.phone || 'দেয়নি'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateStatus(m.id, 'approved')}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 text-[11px]"
                    title="অনুমোদন করুন"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>অনুমোদন</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(m.id, 'rejected')}
                    className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[11px]"
                    title="বাতিল করুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)]/60 transition-all shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--gold)] to-amber-700 text-black font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{m.name[0]}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-[var(--gold-light)] transition-colors truncate">
                      {m.name}
                    </h4>

                    {m.role === 'admin' ? (
                      <span title="অ্যাডমিন" className="text-amber-400 shrink-0">
                        <Shield className="w-3.5 h-3.5" />
                      </span>
                    ) : m.role === 'cr' ? (
                      <span title="ক্লাস সিআর" className="text-emerald-400 shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mt-0.5">
                    <span>রোল: <strong className="text-[var(--gold-light)]">{m.roll}</strong></span>
                    {m.blood && (
                      <>
                        <span>·</span>
                        <span className="text-red-400 font-bold bg-red-950/60 px-1.5 py-0.2 rounded border border-red-900/40">
                          🩸 {m.blood}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Designation / পদবি Badge */}
              <div className="mt-2.5 flex items-center justify-between gap-1 p-1.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)]/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Tag className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                  {m.designation ? (
                    <span className="font-bold text-[11px] text-[var(--gold-light)] truncate">
                      {m.designation}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-secondary)] italic">
                      পদবি নির্ধারণ করা নেই
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      const cur = m.designation || '';
                      const newVal = prompt(`${m.name}-এর নতুন পদবি / দায়িত্ব লিখুন:`, cur);
                      if (newVal !== null) {
                        if (onUpdateDesignation) {
                          onUpdateDesignation(m.id, newVal.trim());
                        } else {
                          DataService.updateMemberDesignation(m.id, newVal.trim());
                        }
                      }
                    }}
                    title="পদবি লিখুন বা পরিবর্তন করুন"
                    className="p-1 rounded-lg hover:bg-[var(--accent)] text-[var(--gold)] hover:text-white transition-colors shrink-0"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {m.addr && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                  <span className="truncate">{m.addr}</span>
                </div>
              )}

              {m.bio && (
                <p className="mt-2 text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 italic opacity-80">
                  "{m.bio}"
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border-color)]/60 flex items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                {m.phone && (
                  <a
                    href={`tel:${m.phone}`}
                    className="p-1.5 rounded-lg bg-[var(--bg-main)] text-emerald-400 hover:bg-emerald-950/60 border border-[var(--border-color)] transition-colors"
                    title="ফোন কল করুন"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {m.fb && (
                  <a
                    href={m.fb.startsWith('http') ? m.fb : `https://${m.fb}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[var(--bg-main)] text-blue-400 hover:bg-blue-950/60 border border-[var(--border-color)] transition-colors"
                    title="ফেসবুক প্রোফাইল"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                )}

                {m.id !== currentUser?.id && (
                  <button
                    onClick={() => onOpenDm(m)}
                    className="p-1.5 rounded-lg bg-[var(--bg-main)] text-[var(--gold-light)] hover:bg-[var(--accent)] border border-[var(--border-color)] transition-colors"
                    title="ব্যক্তিগত মেসেজ পাঠান"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && m.id !== currentUser?.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select
                    value={m.role}
                    onChange={(e) => onUpdateRole(m.id, e.target.value as UserRole)}
                    className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[10px] rounded px-1 py-0.5 text-[var(--gold-light)]"
                  >
                    <option value="member">মেম্বার</option>
                    <option value="cr">সিআর</option>
                    <option value="admin">অ্যাডমিন</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`${m.name}-কে রিমুভ করতে চান?`)) {
                        onRemoveMember(m.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 p-1 rounded"
                    title="রিমুভ"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
