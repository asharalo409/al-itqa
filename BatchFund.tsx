import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Receipt,
  Copy,
  Check,
  Send,
  Calculator,
  Building,
  ShieldCheck,
  Smartphone,
  Coins,
  Divide,
  Equal,
  RotateCcw,
} from 'lucide-react';
import { FundTransaction, PaymentSettings, StudentPayment, UserProfile, Language } from '../types';
import { DataService } from '../services/supabase';

interface BatchFundProps {
  transactions: FundTransaction[];
  currentUser: UserProfile | null;
  onAddTransaction: (tx: Omit<FundTransaction, 'id'>) => void;
  onOpenCustomizer?: () => void;
  lang?: Language;
}

export const BatchFund: React.FC<BatchFundProps> = ({
  transactions,
  currentUser,
  onAddTransaction,
  onOpenCustomizer,
  lang = 'bn',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Payment settings state
  const paymentSettings = DataService.getPaymentSettings();
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(
    DataService.getStudentPayments()
  );

  // Student Payment submission form
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash'>('bkash');
  const [payTrxId, setPayTrxId] = useState<string>('');
  const [payPurpose, setPayPurpose] = useState<string>('মাসিক চাঁদা');
  const [payNote, setPayNote] = useState<string>('');

  // Individual Student Calculator State
  const [calcMonthlyRate, setCalcMonthlyRate] = useState<number>(paymentSettings.monthlyFee || 200);
  const [calcMonthsCount, setCalcMonthsCount] = useState<number>(3);
  const [calcTourShare, setCalcTourShare] = useState<number>(500);
  const [calcOtherFee, setCalcOtherFee] = useState<number>(100);
  const [calcAmountPaid, setCalcAmountPaid] = useState<number>(600);

  // Mini General Calculator pad state
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // Ledger Voucher form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('মাসিক চাঁদা');
  const [note, setNote] = useState('');

  const isAdminOrCr = currentUser?.role === 'admin' || currentUser?.role === 'cr';

  // Calculations
  const totalIn = transactions.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  // Personal student financial totals
  const personalTotalPayable = calcMonthlyRate * calcMonthsCount + calcTourShare + calcOtherFee;
  const personalDue = personalTotalPayable - calcAmountPaid;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleStudentPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0 || !payTrxId.trim()) return;

    const newPayment = DataService.addStudentPayment({
      studentId: currentUser?.id || 'guest',
      studentName: currentUser?.name || 'শিক্ষার্থী',
      studentRoll: currentUser?.roll || '৪০১',
      amount: amt,
      method: payMethod,
      trxId: payTrxId.trim(),
      purpose: payPurpose.trim(),
      note: payNote.trim() || undefined,
    });

    setStudentPayments(DataService.getStudentPayments());
    setPayAmount('');
    setPayTrxId('');
    setPayNote('');
    setShowPayModal(false);
    alert('আপনার পেমেন্ট রিসিট জমা হয়েছে! সিআর/অ্যাডমিন ভেরিফাই করলে তহবিলে যুক্ত হবে।');
  };

  const handleVerifyPayment = (payment: StudentPayment) => {
    DataService.updateStudentPaymentStatus(payment.id, 'verified');
    onAddTransaction({
      title: `${payment.studentName} (রোল ${payment.studentRoll}) এর জমা`,
      type: 'in',
      amount: payment.amount,
      date: new Date().toISOString().split('T')[0],
      category: payment.purpose,
      note: `TrxID: ${payment.trxId} (${payment.method})`,
    });
    setStudentPayments(DataService.getStudentPayments());
  };

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmt) || parsedAmt <= 0) return;

    onAddTransaction({
      title: title.trim(),
      type,
      amount: parsedAmt,
      date: new Date().toISOString().split('T')[0],
      category,
      note: note.trim() || undefined,
    });

    setTitle('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  // Mini calculator pad handlers
  const handleCalcNum = (digit: string) => {
    if (calcDisplay === '0' || calcDisplay === 'Error') {
      setCalcDisplay(digit);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleCalcOp = (op: string) => {
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcDisplay('0');
  };

  const handleCalcEqual = () => {
    if (calcPrev === null || !calcOp) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    if (calcOp === '+') result = calcPrev + current;
    else if (calcOp === '-') result = calcPrev - current;
    else if (calcOp === '×') result = calcPrev * current;
    else if (calcOp === '÷') result = current !== 0 ? calcPrev / current : 0;

    setCalcDisplay(result.toString());
    setCalcPrev(null);
    setCalcOp(null);
  };

  const toBn = (n: number) => n.toLocaleString('bn-BD');

  return (
    <div className="space-y-5">
      {/* 1. Official Payment Accounts Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[#240c18] to-[var(--bg-card)] border border-[var(--gold)]/50 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/70 text-[var(--gold-light)] text-xs font-bold border border-[var(--gold)]/30 mb-1">
              <Coins className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>ব্যাচ তহবিল ও পেমেন্ট গেটওয়ে</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              চাঁদা ও ট্যুর ফি প্রদানের অফিসিয়াল নম্বরসমূহ
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPayModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>টাকা পাঠিয়েছি (রিসিট জমা)</span>
            </button>

            {isAdminOrCr && onOpenCustomizer && (
              <button
                onClick={onOpenCustomizer}
                className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--gold)] text-xs text-[var(--gold-light)] font-medium"
                title="নম্বরগুলো পরিবর্তন বা এডিট করুন"
              >
                নম্বর পরিবর্তন
              </button>
            )}
          </div>
        </div>

        {/* Payment Numbers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* bKash */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-pink-900/40 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-pink-400 flex items-center gap-1.5 text-sm">
                <span>📱 বিকাশ (bKash)</span>
              </span>
              <span className="text-[10px] text-pink-300/80 bg-pink-950 px-2 py-0.5 rounded-full border border-pink-800/40">
                {paymentSettings.bkashType === 'personal' ? 'পার্সোনাল' : 'মার্চেন্ট'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-base font-black text-white tracking-wider">
                {paymentSettings.bkashNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(paymentSettings.bkashNumber, 'bkash')}
                className="px-2.5 py-1 rounded-lg bg-pink-950/80 hover:bg-pink-900 border border-pink-700/50 text-pink-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'bkash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'bkash' ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          {/* Nagad */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-orange-900/40 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-orange-400 flex items-center gap-1.5 text-sm">
                <span>📱 নগদ (Nagad)</span>
              </span>
              <span className="text-[10px] text-orange-300/80 bg-orange-950 px-2 py-0.5 rounded-full border border-orange-800/40">
                {paymentSettings.nagadType === 'personal' ? 'পার্সোনাল' : 'মার্চেন্ট'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-base font-black text-white tracking-wider">
                {paymentSettings.nagadNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(paymentSettings.nagadNumber, 'nagad')}
                className="px-2.5 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900 border border-orange-700/50 text-orange-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'nagad' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'nagad' ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          {/* Rocket / Bank */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-purple-400 flex items-center gap-1.5 text-sm">
                <span>📱 রকেট (Rocket)</span>
              </span>
              <span className="text-[10px] text-purple-300/80 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800/40">
                পার্সোনাল
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-base font-black text-white tracking-wider">
                {paymentSettings.rocketNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(paymentSettings.rocketNumber, 'rocket')}
                className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'rocket' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'rocket' ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>
        </div>

        {paymentSettings.instructions && (
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
            📌 {paymentSettings.instructions}
          </p>
        )}
      </div>

      {/* 2. Personal Student Financial Calculator & Dues Tracker */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--gold)]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--gold-light)]">
                প্রত্যেকের নিজস্ব হিসাব ও ক্যালকুলেটর
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                আপনার কত টাকা বকেয়া আছে বা জমা হয়েছে মুহূর্তেই হিসাব করুন
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded-full">
            ব্যক্তিগত হিসাব
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          {/* Calculator Inputs */}
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  মাসিক চাঁদার হার (৳)
                </label>
                <input
                  type="number"
                  value={calcMonthlyRate}
                  onChange={(e) => setCalcMonthlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  মাসের সংখ্যা (যেমন: ৩ মাস)
                </label>
                <input
                  type="number"
                  value={calcMonthsCount}
                  onChange={(e) => setCalcMonthsCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  ট্যুর বা পিকনিক চাঁদা (৳)
                </label>
                <input
                  type="number"
                  value={calcTourShare}
                  onChange={(e) => setCalcTourShare(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  ফটোকপি বা হ্যান্ডনোট ফি (৳)
                </label>
                <input
                  type="number"
                  value={calcOtherFee}
                  onChange={(e) => setCalcOtherFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[var(--text-secondary)] block mb-1 font-semibold text-emerald-400">
                আমি ইতিমধ্যে পরিশোধ করেছি (৳)
              </label>
              <input
                type="number"
                value={calcAmountPaid}
                onChange={(e) => setCalcAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full bg-[var(--bg-main)] border border-emerald-700/60 rounded-xl p-2.5 text-emerald-300 font-mono text-sm font-bold"
              />
            </div>
          </div>

          {/* Calculator Result Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-card)] border border-[var(--gold)]/40 flex flex-col justify-between shadow-md space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--gold-light)] pb-2 border-b border-[var(--border-color)]">
                হিসাবের ফলাফল
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-secondary)]">মোট প্রদেয় ফি:</span>
                <span className="font-bold text-white tabular-nums">৳ {toBn(personalTotalPayable)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400">পরিশোধিত:</span>
                <span className="font-bold text-emerald-300 tabular-nums">৳ {toBn(calcAmountPaid)}</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-center ${personalDue > 0 ? 'bg-red-950/40 border-red-800 text-red-300' : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'}`}>
              <div className="text-[10px] uppercase font-bold tracking-wider">
                {personalDue > 0 ? 'আপনার বর্তমান বকেয়া' : 'আলহামদুলিল্লাহ পরিশোধিত'}
              </div>
              <div className="text-2xl font-black mt-0.5 tabular-nums">
                ৳ {toBn(Math.abs(personalDue))}
              </div>
              {personalDue <= 0 && (
                <div className="text-[10px] mt-0.5 text-emerald-400">সকল চাঁদা পরিশোধিত আছে</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick General Math Tool for Tour/Lunch Expense Split */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--gold-light)]">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>সহজ ক্যালকুলেটর (ট্যুর বা খাওয়াদাওয়ার খরচ ভাগ করার জন্য)</span>
            </span>
            <span className="text-base font-mono font-bold text-white bg-[var(--bg-card)] px-3 py-1 rounded-lg border border-[var(--border-color)]">
              {calcDisplay}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-xs font-bold">
            {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => {
                  if (btn === '=') handleCalcEqual();
                  else if (['+', '-', '×', '÷'].includes(btn)) handleCalcOp(btn);
                  else handleCalcNum(btn);
                }}
                className={`py-2 rounded-xl text-center transition-all ${
                  btn === '='
                    ? 'bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-extrabold col-span-2'
                    : ['+', '-', '×', '÷'].includes(btn)
                    ? 'bg-[var(--accent)] text-[var(--gold-light)] hover:bg-[var(--gold)] hover:text-black'
                    : 'bg-[var(--bg-card)] text-white hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)]'
                }`}
              >
                {btn}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCalcDisplay('0');
                setCalcPrev(null);
                setCalcOp(null);
              }}
              className="py-2 rounded-xl bg-red-950 text-red-300 border border-red-800/50 hover:bg-red-900 col-span-2 font-bold"
            >
              C (মুছুন)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Overall Batch Fund Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>বর্তমান নগদ স্থিতি (ব্যালেন্স)</span>
            <Coins className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--gold-light)] mt-1.5 tabular-nums">
            ৳ {toBn(balance)}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
            মোট সংগৃহীত ও খরচের স্থিতি
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span>সর্বমোট আয় (জমা)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1.5 tabular-nums">
            ৳ {toBn(totalIn)}
          </div>
          <div className="text-[11px] text-emerald-200/70 mt-1">
            মাসিক চাঁদা ও অনুদান তহবিল
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/40 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-300">
            <span>সর্বমোট ব্যয় (খরচ)</span>
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-300 mt-1.5 tabular-nums">
            ৳ {toBn(totalOut)}
          </div>
          <div className="text-[11px] text-red-200/70 mt-1">
            একাডেমিক ফটোকপি, সেমিনার ও আয়োজন
          </div>
        </div>
      </div>

      {/* 4. Student Payment Verification Table (for Admin/CR) */}
      <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[var(--gold)]" />
            <span>শিক্ষার্থীদের জমাকৃত পেমেন্ট রিসিট তালিকা ({studentPayments.length})</span>
          </h3>
          <span className="text-[11px] text-[var(--text-secondary)]">বিকাশ/নগদ ভেরিফিকেশন</span>
        </div>

        <div className="divide-y divide-[var(--border-color)]/60 text-xs">
          {studentPayments.map((p) => (
            <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{p.studentName}</span>
                  <span className="text-[var(--gold-light)] font-medium">রোল: {p.studentRoll}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      p.status === 'verified'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {p.status === 'verified' ? 'ভেরিফায়েড ✔' : 'যাচাইাধীন ⏳'}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  উদ্দেশ্য: <strong className="text-white">{p.purpose}</strong> · মেথড: {p.method.toUpperCase()} · TrxID:{' '}
                  <span className="font-mono text-amber-200">{p.trxId}</span> · {p.date}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base font-black text-emerald-400 tabular-nums">
                  ৳ {toBn(p.amount)}
                </span>
                {isAdminOrCr && p.status === 'pending' && (
                  <button
                    onClick={() => handleVerifyPayment(p)}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    ভেরিফাই করুন
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. General Ledger Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {(['all', 'in', 'out'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setFilterType(tp)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  filterType === tp
                    ? 'bg-[var(--gold)] text-black shadow-sm'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
                }`}
              >
                {tp === 'all' ? 'সকল লেনদেন' : tp === 'in' ? 'আয় (জমা)' : 'ব্যয় (খরচ)'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="হিসাব খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--gold)]"
              />
            </div>

            {isAdminOrCr && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1 shrink-0 hover:brightness-110 active:scale-95 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ভাউচার এন্ট্রি</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-[var(--border-color)]/60 text-xs">
          {transactions
            .filter((t) => filterType === 'all' || t.type === filterType)
            .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.includes(search))
            .map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-[var(--bg-card-subtle)] transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'in'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {tx.type === 'in' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm leading-snug">{tx.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)] mt-0.5">
                      <span className="text-[var(--gold-light)] font-medium">{tx.category}</span>
                      <span>·</span>
                      <span>{tx.date}</span>
                      {tx.note && (
                        <>
                          <span>·</span>
                          <span className="italic opacity-80 truncate">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-base font-black tabular-nums shrink-0 ${
                    tx.type === 'in' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tx.type === 'in' ? '+' : '-'}৳ {toBn(tx.amount)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Student Payment Submission Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Send className="w-4 h-4 text-[var(--gold)]" />
                টাকা পাঠিয়েছি (পেমেন্ট রিসিট জমা দিন)
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleStudentPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">পেমেন্ট মেথড নির্বাচন করুন *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bkash', 'nagad', 'rocket'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 rounded-xl font-bold uppercase transition-all ${
                        payMethod === m
                          ? 'bg-[var(--gold)] text-black shadow-md'
                          : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">পরিশোধিত টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="যেমন: ২০০ বা ৫০০"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono text-sm focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">ট্রানজেকশন আইডি (TrxID) *</label>
                <input
                  type="text"
                  required
                  placeholder="বিকাশ/নগদের SMS-এর TrxID (যেমন: BKH991208)"
                  value={payTrxId}
                  onChange={(e) => setPayTrxId(e.target.value.toUpperCase())}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-amber-300 font-mono text-sm uppercase focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">টাকা দেওয়ার উদ্দেশ্য</label>
                <select
                  value={payPurpose}
                  onChange={(e) => setPayPurpose(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                >
                  <option value="মাসিক চাঁদা">মাসিক চাঁদা</option>
                  <option value="ট্যুর ফি">ট্যুর ও শিক্ষাসফর ফি</option>
                  <option value="পিকনিক ও পার্টি">ব্যাচ পিকনিক / ক্লাস পার্টি</option>
                  <option value="ফটোকপি ও হ্যান্ডনোট">ফটোকপি ও হ্যান্ডনোট ফি</option>
                  <option value="দান ও ফান্ড">সহযোগিতা ও দান ফান্ড</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">রেফারেন্স / নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: নিজের নাম, রোল বা মাসের নাম"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold"
                >
                  জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--gold)]/50 rounded-2xl p-5 shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--gold)]" />
                নতুন আয় / ব্যয়ের হিসাব যুক্ত করুন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVoucher} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('in')}
                  className={`flex-1 py-2 rounded-xl font-bold ${
                    type === 'in' ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}
                >
                  আয় (জমা)
                </button>
                <button
                  type="button"
                  onClick={() => setType('out')}
                  className={`flex-1 py-2 rounded-xl font-bold ${
                    type === 'out' ? 'bg-red-600 text-white' : 'bg-[var(--bg-main)] text-[var(--text-secondary)]'
                  }`}
                >
                  ব্যয় (খরচ)
                </button>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1">বিবরণ *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অনুষদ সেমিনার ফটোকপি খরচ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="৫০০"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
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
