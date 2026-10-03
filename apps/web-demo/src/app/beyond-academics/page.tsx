import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  Palette, 
  Music, 
  Drama, 
  HeartHandshake, 
  Compass, 
  CheckCircle, 
  Target, 
  Users, 
  Award,
  Footprints,
  Flame,
  Quote,
  Activity,
  Medal,
  ShieldCheck
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Beyond Academics — Sports, Arts & Co-Curriculars | Prince Public School',
  description: 'Stage-wise co-curricular activities, physical education, hobbies, dramatics, debates, acting, and sports academies at Prince Public School.',
};

export default function BeyondAcademicsPage() {
  const stages = [
    {
      id: 'pre-primary',
      stage: 'Pre-Primary Stage',
      title: 'Beyond Academics – Pre-Primary',
      age: 'Ages 3 – 5 (Nursery & KG)',
      tagline: 'Sensory Exploration, Rhythm & Joyous Play',
      description: 'At the foundational dawn, co-curricular learning is experiential and sensorial. Children build fine and gross motor agility through rhythmic movement, sand play, puppetry, nature trails, and foundational musical appreciation.',
      activities: [
        'Sensory Play & Clay Sculpting',
        'Story Dramatization & Finger Puppetry',
        'Rhythmic Rhymes & Musical Kindergarten',
        'Junior Splash Pool & Sandpit Discovery',
        'Fancy Dress & Thematic Show-and-Tell',
        'Balancing Beams & Soft Play Gymnastics',
      ],
      image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'grades-1-2',
      stage: 'Foundational Stage (Grades I & II)',
      title: 'Beyond Academics – Grades I & II',
      age: 'Ages 6 – 8 (Classes I & II)',
      tagline: 'Creative Discovery, Elementary Sports & Public Speaking',
      description: 'Transitioning into early schooling, pupils are introduced to structured co-curriculars. They learn coordination through junior athletics, creative painting, basic Indian vocal music, beginner yoga, and stage confidence.',
      activities: [
        'Elementary Athletics & Relay Sprints',
        'Color Wheel, Folk Art & Craft Making',
        'Vocal Music & Indian Percussion (Tabla/Conga)',
        'Beginner Hatha Yoga & Breathing Asanas',
        'Dramatic Skits & Recitation Contests',
        'Junior Chess & Cognitive Strategy Games',
      ],
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'preparatory',
      stage: 'Preparatory Stage',
      title: 'Beyond Academics – Preparatory Stage',
      age: 'Ages 8 – 11 (Grades III to V)',
      tagline: 'Inquiry, Inter-House Challenges & Sports Foundations',
      description: 'Pupils deepen discipline and camaraderie through compulsory physical education, inter-house quizzes, debates, classical dance forms, skating, swimming, and environmental clubs.',
      activities: [
        'Football, Basketball & Cricket Basics',
        'Skating & Swimming Stroke Foundations',
        'Inter-House Debates & GK Quizzes',
        'Indian Classical (Kathak/Bharatnatyam) & Western Dance',
        'Dramatic Competitions & Script Acting',
        'Eco-Warrior Gardening & Vedic Heritage Circle',
      ],
      image: '/images/preparatory-stage-students.jpg',
    },
    {
      id: 'middle-senior',
      stage: 'Middle & Secondary School',
      title: 'Beyond Academics – Middle & Secondary School',
      age: 'Ages 11 – 16 (Classes VI to X)',
      tagline: 'Competitive Athletics, Theatre, Model UN & Leadership',
      description: 'High-intensity athletic training, tournament representation, shooting range mastery, model UN parliaments, acting and modelling showcases, and artistic portfolios that prepare young adults for secondary board excellence and life beyond school.',
      activities: [
        'Inter-School Tournaments (Athletics, Cricket, Football)',
        '10m Air Rifle & Pistol Shooting Range',
        'Acting, Theatre Production & Modelling Club',
        'Model United Nations (MUN) & National Debating',
        'Fine Arts, Oil Painting & Digital Visual Media',
        'Robotics Olympiad, Coding & Science Exhibitions',
      ],
      image: '/images/middle-secondary-students.jpg',
    },
  ];

  const hobbies = [
    { title: 'Fancy Dress Competition', desc: 'Fosters imagination, historical roleplay, and confident public presence on grand stage.', icon: Drama },
    { title: 'Art & Painting', desc: 'Watercolors, oil pastels, charcoal sketching, Madhubani folk art, and canvas portfolios.', icon: Palette },
    { title: 'Music (Vocal & Instrumental)', desc: 'Indian classical ragas, Western choir, harmonium, synthesizer, guitar, and rhythm drums.', icon: Music },
    { title: 'Dance (Classical & Contemporary)', desc: 'Kathak, Bharatnatyam, folk dances of India, contemporary lyrical jazz, and stage choreography.', icon: Sparkles },
    { title: 'Acting & Dramatics', desc: 'Street plays (Nukkad Natak), Shakespearean drama, Hindi theatre, scriptwriting, and voice modulation.', icon: Drama },
    { title: 'Modelling & Ramp Walk', desc: 'Posture perfection, poise, etiquette, public presentation, and cultural fashion showcases.', icon: Award },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-tiger_orange-500/10 via-white to-amber_flame-500/15 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tiger_orange-500/20 text-indigo_velvet-500 border border-tiger_orange-500/30">
            Holistic Life at PPS
          </span>
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber_flame-500/20 text-tiger_orange-600 border border-amber_flame-500/30">
            A Healthy Mind Dwells in a Healthy Body
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans">
          Beyond Academics: Sports, Arts & Co-Curricular Excellence
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          At Prince Public School, education transcends the classroom. We foster sportsmanship, artistic brilliance, theatrical confidence, and disciplined leadership through progressive, age-tailored co-curricular programs.
        </p>
      </div>

      {/* Physical Education & Athletics Master Section */}
      <div className="rounded-3xl border border-amber_flame-500/25 bg-gradient-to-br from-[#09182d] via-[#0d223f] to-[#081527] text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber_flame-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-tiger_orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Philosophy, Motto, and Core Principles (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber_flame-500/20 text-amber_flame-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border border-amber_flame-500/35 shadow-xs">
                <Flame className="w-4 h-4 text-tiger_orange-500 animate-pulse" />
                Physical Education & Athletics
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Compulsory for All Students
              </span>
            </div>

            {/* Core Motto */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-amber_flame-400/80 font-bold">
                Foundational Sports Creed
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-white leading-tight">
                “A healthy mind dwells in a healthy body.”
              </h2>
            </div>

            {/* Core Description */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
              Sports are a vital aspect in Prince Public School and are <span className="text-amber_flame-400 font-bold underline decoration-amber-400/50 decoration-2 underline-offset-4">compulsory for all students</span>. The students participate actively in intra-school and inter-school tournaments and competitions in athletics, cricket, football, basketball, skating, shooting, and swimming.
            </p>

            {/* Feature Sportsmanship Quote Box */}
            <div className="relative bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-3 shadow-lg group hover:border-amber-400/40 transition-colors">
              <Quote className="w-8 h-8 text-amber_flame-400 opacity-70 group-hover:scale-110 transition-transform" />
              <p className="text-sm sm:text-base text-slate-100 font-medium italic leading-relaxed">
                “Sportsmanship and leadership are taught in Prince Public School. These are the qualities that are easily visible in the field of sports to participants and spectators alike. These qualities help the winner from not losing his sense of achievement and the loser from losing his spirit in the field of life.”
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  Life Lessons Through Sport
                </span>
                <span>Prince Public School Ethos</span>
              </div>
            </div>

            {/* 3 Pillars Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-amber_flame-400 text-xs font-bold font-mono">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Daily Agility</span>
                </div>
                <p className="text-xs text-slate-300">Mandatory physical drills & morning conditioning.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-amber_flame-400 text-xs font-bold font-mono">
                  <Medal className="w-3.5 h-3.5" />
                  <span>Tournaments</span>
                </div>
                <p className="text-xs text-slate-300">Intra & inter-school zonal championship meets.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-amber_flame-400 text-xs font-bold font-mono">
                  <Award className="w-3.5 h-3.5" />
                  <span>Fair Play</span>
                </div>
                <p className="text-xs text-slate-300">Resilience, poise, and ethical leadership in life.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Athletics Showcase & Sports Disciplines Grid (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Image Card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/slide-3-sports.jpg"
                alt="Prince Public School Sports Field & Athletics"
                className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                  15+ Acres Arena
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-xs text-white space-y-1">
                <span className="text-[11px] font-bold text-amber_flame-400 uppercase tracking-wider font-mono">
                  Competitive Sports Infrastructure
                </span>
                <p className="font-bold text-sm text-white drop-shadow-sm">
                  Athletics Ground, Multi-Sport Courts & 10m Shooting Range
                </p>
              </div>
            </div>

            {/* Sports Disciplines Chips Grid (All 8 sports mentioned in text) */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Official Competitive Disciplines:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Athletics', icon: '🏃', tag: 'Track & Field' },
                  { name: 'Cricket', icon: '🏏', tag: 'Turf Nets' },
                  { name: 'Football', icon: '⚽', tag: 'Full Pitch' },
                  { name: 'Basketball', icon: '🏀', tag: 'Hard Court' },
                  { name: 'Skating', icon: '🛼', tag: 'Speed Rink' },
                  { name: 'Shooting', icon: '🎯', tag: '10m Air Rifle' },
                  { name: 'Swimming', icon: '🏊', tag: 'Junior Pool' },
                  { name: 'Hatha Yoga', icon: '🧘', tag: 'Mindfulness' },
                ].map((sport, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all text-center space-y-0.5 group cursor-default"
                  >
                    <span className="text-lg block group-hover:scale-125 transition-transform duration-300">
                      {sport.icon}
                    </span>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {sport.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {sport.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-around text-center">
              <div>
                <span className="text-lg sm:text-xl font-black text-amber_flame-400 block">100%</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wide font-mono">Participation</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div>
                <span className="text-lg sm:text-xl font-black text-emerald-400 block">8+</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wide font-mono">Sports Wings</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div>
                <span className="text-lg sm:text-xl font-black text-white block">Annual</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wide font-mono">Sports Meet</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Stage-wise Beyond Academics */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            NEP 2020 Aligned Stages
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Stage-Wise Co-Curricular Architecture
          </h2>
          <p className="text-base text-slate-600">
            Every developmental milestone is enriched with specialized artistic and athletic faculties.
          </p>
        </div>

        <div className="space-y-10">
          {stages.map((stg, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={stg.id}
                id={stg.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                <div className={`lg:col-span-7 space-y-4 ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo_velvet-900/10 text-indigo_velvet-500 font-mono text-xs font-bold">
                      {stg.stage}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber_flame-500/20 text-tiger_orange-600 font-mono text-xs font-bold">
                      {stg.age}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">
                    {stg.title}
                  </h3>
                  <p className="text-sm font-bold text-tiger_orange-500 uppercase tracking-wide">
                    {stg.tagline}
                  </p>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {stg.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 font-mono">
                      Key Activities & Clubs:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                      {stg.activities.map((act, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-5 ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group aspect-4/3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stg.image}
                      alt={stg.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-5">
                      <span className="text-white font-bold text-sm tracking-wide">
                        Prince Public School Co-Curricular Wings
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Special Hobbies & Pursuits Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Creative Expression
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Student Hobby Clubs & Competitions
          </h2>
          <p className="text-base text-slate-600">
            Debate, Quizzes, Dramatic, and Drawing competitions are organized on a regular basis. Students have the opportunity to pursue specialized artistic hobbies:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hobbies.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-tiger_orange-500/40 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="p-3 w-fit rounded-xl bg-amber_flame-500/10 text-tiger_orange-500 border border-amber_flame-500/20 group-hover:bg-tiger_orange-500 group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black font-sans text-slate-900 group-hover:text-indigo_velvet-500 transition-colors">
                  {h.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">
          Ready to Discover Your Child’s Hidden Potential?
        </h3>
        <p className="text-base text-slate-600 max-w-xl mx-auto">
          Admissions are now open for Pre-School to Class IX (Secondary). Give your child the gift of holistic education, sportsmanship, and cultural confidence.
        </p>
        <div className="pt-2">
          <Link
            href="/admissions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tiger_orange-500 to-cayenne_red-500 text-white font-bold text-sm shadow-md shadow-tiger_orange-500/20 hover:scale-105 transition-all"
          >
            <span>Apply for Admission 2026-27</span>
            <span>→</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
