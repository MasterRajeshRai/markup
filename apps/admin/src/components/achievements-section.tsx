import React from 'react';
import { Trophy, Star, Award, TrendingUp, CheckCircle, Medal } from 'lucide-react';

export function AchievementsSection() {
  const laureates = [
    {
      student: 'Aarav Malhotra',
      stream: 'Mathematics & Science (100/100)',
      score: '99.2%',
      rank: 'Mehrauli Area Topper (CBSE Class X)',
      destination: 'Distinction in All Subjects',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    },
    {
      student: 'Ananya Singhal',
      stream: 'French, English & Social Science',
      score: '98.8%',
      rank: 'Rank 1 — Languages & Humanities',
      destination: 'Perfect Score in French & Social Science',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      student: 'Devendra Rathore',
      stream: 'Integrated Science & Computer Tech',
      score: '98.6%',
      rank: 'CBSE Class X Merit Certificate',
      destination: 'National Science Olympiad Gold Medalist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      student: 'Meera Iyer',
      stream: 'Sanskrit, Maths & Social Studies',
      score: '98.4%',
      rank: 'CBSE Class X Merit Certificate',
      destination: 'Inter-School Debate & Quiz Champion',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto bg-white">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
        <span className="text-xs font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono flex items-center justify-center gap-1.5">
          <Trophy className="w-4 h-4 text-tiger_orange-500" />
          Our Achievements &amp; Planning
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight font-sans">
          100% C.B.S.E. Class X Examination Results
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Prince Public School has oriented excellent results in C.B.S.E. Class X Examination. We are proud to be the only school in this area that achieved 100% result in C.B.S.E. Class X exam. We also provide moral education alongside all extra-curricular activities, with special emphasis on modern computer education and the latest internet facilities.
        </p>
      </div>

      {/* Board Results Overview Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'C.B.S.E. Class X Result', val: '100%', sub: 'Only school in Mehrauli area' },
          { label: 'Moral & Value Education', val: '100%', sub: 'Rooted in Indian traditions' },
          { label: 'Computer & Internet Labs', val: 'Modern', sub: 'Latest high-speed facilities' },
          { label: 'Extra-Curricular Mastery', val: 'Top Honors', sub: 'Sports, debate, arts & dance' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-1 shadow-xs"
          >
            <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
              {item.val}
            </div>
            <div className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {item.label}
            </div>
            <div className="text-xs text-slate-500">
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Top Scorers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {laureates.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4 hover:border-amber-400 hover:shadow-md transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.avatar}
                alt={item.student}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/60 shadow-xs"
              />
              <div>
                <h4 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                  {item.student}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{item.stream}</p>
                <div className="inline-block mt-1 text-xs font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {item.score} Aggregate
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Medal className="w-3.5 h-3.5 shrink-0" />
                <span>{item.rank}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700">
                <strong>Admitted:</strong> {item.destination}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
