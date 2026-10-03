import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Users, Trophy, Sparkles, Heart, Compass, CheckCircle } from 'lucide-react';
import { StudentLifeSection } from '@/components/student-life-section';

export const metadata: Metadata = {
  title: 'Student Life, Houses & Co-Curriculars | Prince Public School',
  description: 'Experience student life at Prince Public School: House System, student leadership council, sports academies, and co-curricular societies.',
};

export default function StudentLifePage() {
  const leadershipCouncil = [
    { role: 'Head Boy', name: 'Kabir Vashisht', class: 'Class X-A' },
    { role: 'Head Girl', name: 'Diya Kapoor', class: 'Class X-B' },
    { role: 'Sports Captain (Boys)', name: 'Ranveer Chauhan', class: 'Class X-A' },
    { role: 'Sports Captain (Girls)', name: 'Tanvi Malik', class: 'Class X-B' },
    { role: 'Cultural Secretary', name: 'Ananya Deshmukh', class: 'Class IX-A' },
    { role: 'STEM & Tech Secretary', name: 'Rishi Sengupta', class: 'Class IX-B' },
  ];

  const sportsAcademies = [
    { title: 'Football Academy', coach: 'Licensed AFC "B" Coaches', facility: 'FIFA Standard Grass Pitch' },
    { title: 'Athletics & Track Club', coach: 'National Level Sprinter Mentors', facility: '400m Synthetic 8-Lane Track' },
    { title: 'Basketball Center', coach: 'State Level Qualified Coaches', facility: '2 International Synthetic Courts' },
    { title: 'Cricket Academy', coach: 'BCCI Level 1 Coaches', facility: '4 Turf & 2 Concrete Practice Nets' },
    { title: 'Roller Skating Academy', coach: 'Federation Certified Mentors', facility: 'Standard Synthetic Banked Rink' },
    { title: 'Martial Arts & Taekwondo', coach: 'Black Belt 4th Dan Instructors', facility: 'Indoor Padded Dojo Hall' },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
          Vibrant Campus Experience
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
          Nurturing Talent Beyond the Textbooks
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          At Prince Public School, sportsmanship, artistic expression, debate, acting, modelling, and leadership are woven deeply into every pupil’s daily life.
        </p>
      </div>

      {/* Main Student Life Section (Houses & Clubs) */}
      <StudentLifeSection />

      {/* Student Prefectorial Council */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-sm">
        <div className="space-y-1 text-center max-w-xl mx-auto">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">
            Student Leadership
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Prefectorial Board (2026-27)</h2>
          <p className="text-sm text-slate-600">
            Elected student representatives leading peer initiatives, discipline, and inter-house events.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {leadershipCouncil.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto text-sm font-bold">
                ★
              </div>
              <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
              <p className="text-xs font-semibold text-amber-700">{p.role}</p>
              <p className="text-xs text-slate-600 font-mono">{p.class}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sports Academies */}
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-700">
            Sports Excellence
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Specialized Sports & Athletic Academies</h2>
          <p className="text-sm text-slate-600">
            Professional morning and evening coaching sessions conducted by certified athletic coaches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportsAcademies.map((sp, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <h3 className="font-bold text-base sm:text-lg text-slate-900">{sp.title}</h3>
              <div className="space-y-1.5 text-sm text-slate-600">
                <p><strong>Mentorship:</strong> {sp.coach}</p>
                <p><strong>Infrastructure:</strong> {sp.facility}</p>
              </div>
              <span className="inline-block text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Active Year-Round
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Boarding Student Life & Weekend Excursions */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50/70 via-white to-blue-50/60 p-8 sm:p-12 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">
              Residential Experience
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Life in the Boarding House: A Home Away From Home</h3>
          </div>
          <Link
            href="/facilities#hostel"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800"
          >
            <span>Explore Hostel Facilities</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h4 className="font-bold text-base text-slate-900">Supervised Evening Prep</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Prep is closely supervised and guided by teachers that cater to the individual needs of each child with care, creating disciplined study routines and clarifying daily doubts.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h4 className="font-bold text-base text-slate-900">Nutritional Science Dining</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cafeteria serving Chinese, Indian & Continental cuisine catered according to principles of nutrition as per standard boarding schools, aimed at producing the right mental stamina for study and avoiding hyperactivity.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <h4 className="font-bold text-base text-slate-900">Weekend Picnics & Movies</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              On holidays, special programmes like picnics and going to movies are organised to make the stay pleasant and refreshing, preparing students with high spirits for each new week.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
