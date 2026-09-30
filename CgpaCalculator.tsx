import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Award,
  RotateCcw,
} from 'lucide-react';

interface CourseEntry {
  id: string;
  name: string;
  credits: number;
  gradePoint: number;
  gradeLetter: string;
}

export const IU_GRADE_SCALE = [
  { letter: 'A+', point: 4.0, range: '৮০% ও তদূর্ধ্ব' },
  { letter: 'A', point: 3.75, range: '৭৫% থেকে ৭৯%' },
  { letter: 'A-', point: 3.5, range: '৭০% থেকে ৭৪%' },
  { letter: 'B+', point: 3.25, range: '৬৫% থেকে ৬৯%' },
  { letter: 'B', point: 3.0, range: '৬০% থেকে ৬৪%' },
  { letter: 'B-', point: 2.75, range: '৫৫% থেকে ৫৯%' },
  { letter: 'C+', point: 2.5, range: '৫০% থেকে ৫৪%' },
  { letter: 'C', point: 2.25, range: '৪৫% থেকে ৪৯%' },
  { letter: 'D', point: 2.0, range: '৪০% থেকে ৪৪%' },
  { letter: 'F', point: 0.0, range: '৪০% এর কম (ফেল)' },
];

export const CgpaCalculator: React.FC = () => {
  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: '1', name: 'AQIS 1101: উলূমুল কুরআন', credits: 4, gradePoint: 4.0, gradeLetter: 'A+' },
    { id: '2', name: 'AQIS 1102: তাফসীরুল কুরআন', credits: 4, gradePoint: 3.75, gradeLetter: 'A' },
    { id: '3', name: 'AQIS 1103: উলূমুল হাদিস', credits: 4, gradePoint: 3.75, gradeLetter: 'A' },
    { id: '4', name: 'AQIS 1104: আরবি ব্যাকরণ ও বালাগাত', credits: 3, gradePoint: 3.5, gradeLetter: 'A-' },
    { id: '5', name: 'AQIS 1105: ইসলামিক দর্শন ও দাওয়াহ', credits: 3, gradePoint: 4.0, gradeLetter: 'A+' },
  ]);

  const handleGradeChange = (id: string, letter: string) => {
    const scale = IU_GRADE_SCALE.find((g) => g.letter === letter) || IU_GRADE_SCALE[0];
    setCourses(
      courses.map((c) =>
        c.id === id ? { ...c, gradeLetter: scale.letter, gradePoint: scale.point } : c
      )
    );
  };

  const handleCreditChange = (id: string, credits: number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, credits } : c)));
  };

  const handleAddCourse = () => {
    const newEntry: CourseEntry = {
      id: Date.now().toString(),
      name: `নতুন কোর্স ${courses.length + 1}`,
      credits: 3,
      gradePoint: 3.75,
      gradeLetter: 'A',
    };
    setCourses([...courses, newEntry]);
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  // Calculations
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + c.credits * c.gradePoint, 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      {/* Top Banner & Result */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card-subtle)] to-[var(--bg-card)] border border-[var(--gold)]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--gold)]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--gold-light)]">
              ইসলামী বিশ্ববিদ্যালয় (ইবি) জিপিএ ও সিজিপিএ ক্যালকুলেটর
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            আল কুরআন ও ইসলামিক স্টাডিজ বিভাগের নির্ধারিত ৪.০০ গ্রেডিং স্কেল অনুসারে ফলাফল নির্ণয় করুন
          </p>
        </div>

        {/* Calculated GPA Badge */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[var(--accent)] border border-[var(--gold)]/60 text-center shrink-0 min-w-[160px] shadow-lg">
          <div className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">
            আপনার সেমিস্টার জিপিএ (GPA)
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-0.5 tracking-tight tabular-nums">
            {gpa}
          </div>
          <div className="text-[10px] text-amber-200/80 mt-1">
            মোট ক্রেডিট: {totalCredits} · অর্জিত পয়েন্ট: {totalPoints.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Course rows table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--gold-light)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--gold)]" />
                কোর্স ও গ্রেড তালিকা
              </h3>
              <button
                onClick={handleAddCourse}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-amber-500 text-black font-bold text-xs flex items-center gap-1 hover:brightness-110 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>কোর্স যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-2">
              {courses.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] flex flex-col sm:flex-row items-center gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
                    <span className="w-5 text-center font-bold text-[var(--gold)]">
                      {(idx + 1).toLocaleString('bn-BD')}
                    </span>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = [...courses];
                        updated[idx].name = e.target.value;
                        setCourses(updated);
                      }}
                      className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text-secondary)] text-[11px]">ক্রেডিট:</span>
                      <select
                        value={c.credits}
                        onChange={(e) => handleCreditChange(c.id, parseInt(e.target.value, 10))}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--gold-light)] font-bold"
                      >
                        {[1, 2, 3, 4, 6].map((cr) => (
                          <option key={cr} value={cr}>
                            {cr}.0
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text-secondary)] text-[11px]">গ্রেড:</span>
                      <select
                        value={c.gradeLetter}
                        onChange={(e) => handleGradeChange(c.id, e.target.value)}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--gold)] font-extrabold"
                      >
                        {IU_GRADE_SCALE.map((g) => (
                          <option key={g.letter} value={g.letter}>
                            {g.letter} ({g.point.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[var(--text-secondary)] hover:text-red-400 p-1"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: IU Official Grading Scale */}
        <div className="space-y-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[var(--gold-light)] flex items-center gap-2">
              <Award className="w-4 h-4 text-[var(--gold)]" />
              ইবি অফিসিয়াল গ্রেডিং পলিসি
            </h3>

            <div className="divide-y divide-[var(--border-color)]/60 text-xs">
              {IU_GRADE_SCALE.map((g) => (
                <div key={g.letter} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[var(--gold-light)] w-7">{g.letter}</span>
                    <span className="text-[var(--text-secondary)] text-[11px]">{g.range}</span>
                  </div>
                  <span className="font-bold text-white tabular-nums">{g.point.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
