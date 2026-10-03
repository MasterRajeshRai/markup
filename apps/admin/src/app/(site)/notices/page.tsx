import React from 'react';
import type { Metadata } from 'next';
import { Bell, Calendar, Download, Search, AlertCircle, FileText } from 'lucide-react';
import { NoticesSection } from '@/components/notices-section';
import { SchoolTimingsCard } from '@/components/school-timings-card';

export const metadata: Metadata = {
  title: 'Notice Board, Timings & Official Circulars | Prince Public School',
  description: 'Access official school timings, holiday calendar, circulars, exam schedules, and admission notifications from Prince Public School.',
};

export default function NoticesPage() {
  const academicDates = [
    { event: 'Commencement of Term II Pre-Board Exams (Class X)', date: 'Nov 18, 2026', type: 'Examination' },
    { event: 'Inter-School Annual Sports Meet "SPARDHA"', date: 'Dec 05, 2026', type: 'Sports' },
    { event: 'Winter Break Begins for Pre-School to Class VIII', date: 'Dec 28, 2026', type: 'Holidays' },
    { event: 'CBSE Board Practical & Internal Assessments (Class X)', date: 'Jan 15, 2027', type: 'Academic' },
    { event: 'Annual Science & Tech Exhibition "INNOVENTUM"', date: 'Jan 24, 2027', type: 'Exhibition' },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
          Official Communications & Calendar Hub
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
          Notices, Timings & Academic Calendar
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Real-time updates, administrative announcements, official school timings, holiday schedules, and circulars for parents, students, and staff.
        </p>
      </div>

      {/* Official School Timings & Holiday Rules Card */}
      <div id="timings">
        <SchoolTimingsCard />
      </div>

      {/* Main Notices Section */}
      <NoticesSection />

      {/* Academic Calendar Key Dates */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-700">
            Upcoming Milestones
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Academic Calendar Highlights (2026-27)</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {academicDates.map((item, idx) => (
            <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {item.type}
                </span>
                <h4 className="text-base font-bold text-slate-900">{item.event}</h4>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-amber-700 shrink-0">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
