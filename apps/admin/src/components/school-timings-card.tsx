import React from 'react';
import { Clock, Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export function SchoolTimingsCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">Official School Timings & Working Hours</h3>
          </div>
          <p className="text-sm text-slate-500">
            Applicable for all Day Scholars and Day Boarders • Session 2026-27
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Active Schedule
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monday to Friday */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
              Weekdays Schedule
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
              Full Day
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            8:00 AM – 2:00 PM
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Monday through Friday • Includes Morning Assembly, Core Subject Classes, Co-Curricular Periods & Lunch Recess.
          </p>
        </div>

        {/* Saturday */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-800">
              Saturday Schedule
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
              Half Day
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            8:00 AM – 12:00 PM
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Working Saturdays • Dedicated to Clubs, Competitions, House Activities, Remedial Clinics & Sports Tournaments.
          </p>
        </div>

      </div>

      {/* Directorate Caveat & Holiday Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block font-bold mb-0.5">Government / Directorate Compliance:</strong>
            Timings are subject to changes as per official circulars and directions issued by the Directorate of Education.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
          <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block font-bold mb-0.5">Scheduled Holiday Closures:</strong>
            The school observes holidays on the <strong>Second Saturday</strong>, the <strong>last working day</strong> of each month, and all gazetted holidays listed in the student diary.
          </div>
        </div>

      </div>
    </div>
  );
}
