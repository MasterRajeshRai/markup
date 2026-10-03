import React from 'react';
import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, Bus, HelpCircle, Home, Navigation } from 'lucide-react';
import { AdmissionInquiry } from '@/components/admission-inquiry';
import { SchoolTimingsCard } from '@/components/school-timings-card';

export const metadata: Metadata = {
  title: 'Contact Us & Campus Location | Prince Public School Mehrauli',
  description: 'Reach Prince Public School at 2/108, Mehrauli, New Delhi - 110030 (1.0 km from Qutub Minar). Admissions desk, boarding wardens, school timings, and bus route queries.',
};

export default function ContactPage() {
  const departments = [
    {
      title: 'Admissions & Inquiries',
      phone: '+91 11 2808 4567 / +91 98110 54321',
      email: 'admissions@princepublicschool.edu.in',
      timing: 'Mon – Fri: 8:00 AM – 2:00 PM | Sat: 8:00 AM – 12:00 PM',
      icon: Phone,
    },
    {
      title: 'Boarding & Hostel Wardens',
      phone: '+91 11 2808 4570 / +91 98110 54331',
      email: 'hostel@princepublicschool.edu.in',
      timing: '24/7 Warden Desk (Parent Calling: 5:00 PM – 7:30 PM)',
      icon: Home,
    },
    {
      title: 'Principal’s Secretariat',
      phone: '+91 11 2808 4568',
      email: 'principal@princepublicschool.edu.in',
      timing: 'By prior appointment on school working days',
      icon: Mail,
    },
    {
      title: 'Transport & Conveyance Cell',
      phone: '+91 98110 54329 / +91 98110 54330',
      email: 'transport@princepublicschool.edu.in',
      timing: 'Mon – Fri: 7:30 AM to 3:00 PM',
      icon: Bus,
    },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
            Get in Touch • Administrative & Admissions Helpdesk
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            1.0 km from Qutub Minar, Mehrauli
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans">
          Contact Prince Public School
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Having the ideal location in the historic Mehrauli area of South Delhi, just 1.0 km from the world-famous Qutub Minar, we welcome parents, prospective students, and visitors.
        </p>
      </div>

      {/* Department Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept, idx) => {
          const Icon = dept.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 hover:border-slate-300 hover:shadow-md transition-all shadow-sm"
            >
              <div className="p-2.5 w-fit rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{dept.title}</h3>
              <div className="space-y-1.5 text-sm text-slate-700">
                <p><strong>Phone:</strong> {dept.phone}</p>
                <p><strong>Email:</strong> {dept.email}</p>
                <p className="text-slate-600 text-xs"><strong>Hours:</strong> {dept.timing}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location & Map Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
        
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-700 font-mono">
            Campus Location & Landmark
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">How to Reach Us</h2>
          
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Prince Public School Campus:</strong>
                <p className="text-slate-800 font-semibold mt-0.5">
                  2/108, Mehrauli, New Delhi – 110030, India
                </p>
                <p className="text-emerald-700 font-medium text-xs">
                  Located just 1.0 km from the world-famous Qutub Minar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Official School Working Timings:</strong>
                <p className="mt-0.5">8:00 AM to 02:00 PM (Monday to Friday)</p>
                <p>8:00 AM to 12:00 PM (Saturday)</p>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  Subject to changes as per directions from the Education Directorate.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Navigation className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Visiting Hours for Parents:</strong>
                <p className="mt-0.5">Monday to Friday: 8:30 AM – 1:30 PM</p>
                <p>Saturday: 8:30 AM – 11:30 AM (Closed on 2nd Saturdays & Gazetted Holidays)</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-600 space-y-1">
            <p><strong>Nearest Metro Station:</strong> Qutab Minar Metro Station (Yellow Line) — approx. 1.2 km away.</p>
            <p><strong>Security Note:</strong> Visitors must produce ID and register at the security desk. Classroom visits require prior written parent/guardian permission.</p>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-gradient-to-br from-amber-50/70 via-slate-50 to-indigo-50/50 relative shadow-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
          <MapPin className="w-10 h-10 text-tiger_orange-500 animate-bounce" />
          <h4 className="font-black text-lg text-slate-900 font-sans">Prince Public School Campus</h4>
          <p className="text-sm text-slate-600 max-w-sm">
            2/108, Mehrauli, New Delhi – 110030<br />
            (Just 1.0 km from World-Famous Qutub Minar)
          </p>
          <a
            href="https://www.google.com/maps/search/Prince+Public+School+Mehrauli+New+Delhi+110030"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-indigo_velvet-500 hover:bg-indigo_velvet-600 text-white text-sm font-bold transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <span>Open in Google Maps</span>
            <span>↗</span>
          </a>
        </div>

      </div>

      {/* Official School Working Timings & Directorate Advisory */}
      <SchoolTimingsCard />

      {/* Online Admission Registration Form */}
      <AdmissionInquiry />

    </div>
  );
}
