'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Calendar, Download, FileText, ArrowRight, AlertCircle } from 'lucide-react';

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  category: 'Admissions' | 'Examinations' | 'Circulars' | 'Events';
  isUrgent?: boolean;
  fileSize?: string;
  summary: string;
}

export function NoticesSection() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const notices: NoticeItem[] = [
    {
      id: 'n-1',
      title: 'Registration Open for Pre-School to Class IX Admissions (Session 2026-27)',
      date: 'Oct 02, 2026',
      category: 'Admissions',
      isUrgent: true,
      fileSize: '340 KB',
      summary: 'Guidelines, eligibility parameters (3+ for Pre-School), TC requirements, and online registration schedules for academic year 2026-27.',
    },
    {
      id: 'n-2',
      title: 'CBSE Pre-Board Examination Date Sheet for Class X Released',
      date: 'Sep 28, 2026',
      category: 'Examinations',
      isUrgent: true,
      fileSize: '412 KB',
      summary: 'Detailed subject-wise schedule and reporting guidelines for the upcoming Term II pre-board assessments.',
    },
    {
      id: 'n-3',
      title: 'Circular: Winter Uniform Transition & Revised Morning School Timings',
      date: 'Sep 22, 2026',
      category: 'Circulars',
      isUrgent: false,
      fileSize: '185 KB',
      summary: 'Mandatory switch to winter uniform starting November 1st with revised bus pickup schedules.',
    },
    {
      id: 'n-4',
      title: 'Annual Inter-School Cultural Conclave "UDAAN 2026" Event Schedule',
      date: 'Sep 15, 2026',
      category: 'Events',
      isUrgent: false,
      fileSize: '620 KB',
      summary: 'List of 28 participating schools, competitive rounds in classical dance, debating, and robotics.',
    },
    {
      id: 'n-5',
      title: 'Parent-Teacher Collaborative Meeting (PTM) Schedule for Classes VI - IX',
      date: 'Sep 10, 2026',
      category: 'Circulars',
      isUrgent: false,
      fileSize: '210 KB',
      summary: 'Slot timings for one-on-one academic performance discussions and report card collection.',
    },
  ];

  const filtered = activeTab === 'all'
    ? notices
    : notices.filter((n) => n.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto bg-slate-50/70 border-y border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Heading and Filter Tabs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono flex items-center gap-1.5">
              <Bell className="w-4 h-4" />
              Notice Board & Circulars
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight font-sans">
              Stay Informed with Official School Updates
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Official circulars, examination date sheets, holiday notices, and important academic notifications directly from the administrative secretariat.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Notices' },
              { id: 'admissions', label: 'Admissions' },
              { id: 'examinations', label: 'Examinations' },
              { id: 'circulars', label: 'Circulars' },
              { id: 'events', label: 'Events' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo_velvet-500 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 text-xs sm:text-sm font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>SMS & WhatsApp Alert System</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Registered parents automatically receive urgent school notifications and bus dispatch alerts on their verified phone numbers.
            </p>
          </div>

          <Link
            href="/notices"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span>Browse Complete Notice Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right Column: Notices List */}
        <div className="lg:col-span-8 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    {item.date}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {item.category}
                  </span>
                  {item.isUrgent && (
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 animate-pulse">
                      Urgent
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => alert(`Downloading circular: ${item.title}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors"
                  title="Download Official Circular"
                >
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>PDF ({item.fileSize})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
