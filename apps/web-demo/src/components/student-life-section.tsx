'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  Palette, 
  Music, 
  Mic, 
  CheckCircle2, 
  Quote, 
  ArrowRight,
  Flame,
  Star
} from 'lucide-react';

export function StudentLifeSection() {
  const houses = [
    {
      name: 'Ashoka House',
      motto: 'Courage & Integrity',
      color: 'bg-blue-600',
      badge: 'Blue House',
      borderColor: 'border-blue-200',
      bgColor: 'from-blue-50 to-blue-100/60',
      mottoColor: 'text-blue-800',
      emblem: '🦁',
      points: '1,420 Pts',
    },
    {
      name: 'Tagore House',
      motto: 'Wisdom & Creativity',
      color: 'bg-rose-600',
      badge: 'Red House',
      borderColor: 'border-rose-200',
      bgColor: 'from-rose-50 to-rose-100/60',
      mottoColor: 'text-rose-800',
      emblem: '🦅',
      points: '1,385 Pts',
    },
    {
      name: 'Shivaji House',
      motto: 'Valor & Leadership',
      color: 'bg-amber-600',
      badge: 'Yellow House',
      borderColor: 'border-amber-200',
      bgColor: 'from-amber-50 to-amber-100/60',
      mottoColor: 'text-amber-800',
      emblem: '🐅',
      points: '1,410 Pts',
    },
    {
      name: 'Raman House',
      motto: 'Inquiry & Innovation',
      color: 'bg-emerald-600',
      badge: 'Green House',
      borderColor: 'border-emerald-200',
      bgColor: 'from-emerald-50 to-emerald-100/60',
      mottoColor: 'text-emerald-800',
      emblem: '🔬',
      points: '1,450 Pts',
    },
  ];

  const sportsDisciplines = [
    { title: 'Athletics & Track', desc: 'Sprints, relay, hurdles & 400m synthetic track events' },
    { title: 'Cricket Academy', desc: 'Turf & concrete practice nets, inter-school tournaments' },
    { title: 'Football League', desc: 'Grass pitch, dribbling clinics, tactical coaching' },
    { title: 'Basketball Courts', desc: 'Floodlit synthetic courts, fast-break training' },
  ];

  const hobbiesList = [
    { name: 'Fancy Dress Competition', icon: '🎭', desc: 'Annual theatrical character showcases celebrating cultural lore and history.' },
    { name: 'Fine Art & Drawing', icon: '🎨', desc: 'Canvas oil painting, sketching, watercolours & inter-school art exhibitions.' },
    { name: 'Music (Vocal & Instruments)', icon: '🎵', desc: 'Classical Hindustani vocal, keyboard, guitar, percussion & choir orchestra.' },
    { name: 'Classical & Modern Dance', icon: '💃', desc: 'Kathak, Bharatnatyam, contemporary, and folk group performances.' },
    { name: 'Acting & Dramatics', icon: '🎬', desc: 'Street plays, Shakespearean theatre, stage monologues, and scriptwriting.' },
    { name: 'Modelling & Personality Grooming', icon: '🌟', desc: 'Stage presence, poise, ramp walk confidence, public etiquette, and self-expression.' },
  ];

  const competitionsList = [
    { title: 'Debate Competitions', desc: 'Parliamentary and extempore debates nurturing articulative conviction.' },
    { title: 'Inter-House Quizzes', desc: 'Science, general knowledge, current affairs & heritage trivia showdowns.' },
    { title: 'Dramatic Contests', desc: 'Bilingual one-act plays promoting emotional depth and stage craft.' },
    { title: 'Drawing & Painting', desc: 'Creative canvas competitions judged by visiting art masters.' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Physical Education Flagship Feature */}
      <div className="rounded-3xl border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
              <Trophy className="w-4 h-4 text-tiger_orange-500" />
              Physical Education & Athletics
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight font-sans">
              “A healthy mind dwells in a healthy body.”
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Sports are a very important aspect of education at Prince Public School and are <strong>compulsory for all students</strong>. 
              Our pupils regularly participate in prestigious school and inter-school tournaments in athletics, cricket, football, basketball, and more.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 max-w-sm space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              The Spirit of Sportsmanship
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">
              “Sportsmanship and leadership taught in PPS help the winner from not losing his sense of achievement and the loser from losing his spirit in the field of life.”
            </p>
          </div>
        </div>

        {/* Sports Disciplines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sportsDisciplines.map((sp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs hover:border-slate-300 transition-colors">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sp.title}</span>
              </h4>
              <p className="text-sm text-slate-600">{sp.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Co-Curricular Competitions & Creative Hobbies */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">
            Artistic & Expressive Talents
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight font-sans">
            Co-Curricular Competitions & Creative Hobbies
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Debate, Quizzes, Dramatic, and Drawing competitions are organized on a regular basis at Prince Public School. 
            Students also discover and hone their creative passions through our signature hobby programs.
          </p>
        </div>

        {/* 4 Regular Competitions Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {competitionsList.map((comp, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs hover:shadow-md hover:border-amber_flame-500/50 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-amber_flame-500/15 text-indigo_velvet-500 border border-amber_flame-500/30 flex items-center justify-center font-bold text-sm">
                0{idx + 1}
              </div>
              <h4 className="font-bold text-base text-slate-900">{comp.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{comp.desc}</p>
            </div>
          ))}
        </div>

        {/* Signature Hobbies Grid */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">Student Hobbies & Performing Arts</h3>
              <p className="text-sm text-slate-600">Pursued during weekly activity blocks and weekend boarding clubs</p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-indigo_velvet-500 bg-indigo_velvet-900/10 border border-indigo_velvet-900/20 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              Fancy Dress • Dance • Acting • Modelling
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hobbiesList.map((hobby, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{hobby.icon}</span>
                  <h4 className="font-bold text-base text-slate-900">{hobby.name}</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{hobby.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* House System Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo_velvet-500">
            Four Pillars of Brotherhood
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight font-sans">
            The PPS Four House System
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Fostering healthy rivalry, discipline, sportsmanship, and leadership across all grades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {houses.map((h, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 border ${h.borderColor} bg-gradient-to-br ${h.bgColor} space-y-4 hover:scale-[1.02] transition-all shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{h.emblem}</span>
                <span className="text-xs sm:text-sm font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-slate-800 border border-slate-200 shadow-xs">
                  {h.points}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {h.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">{h.name}</h3>
                <p className={`text-sm font-semibold ${h.mottoColor}`}>{h.motto}</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Active participation in inter-house athletics, debates, dramatics, quizzes, and fancy dress challenges.
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
