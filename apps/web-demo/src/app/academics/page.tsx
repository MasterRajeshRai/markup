import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  BookOpen, 
  Atom, 
  TrendingUp, 
  Compass, 
  Award, 
  CheckCircle, 
  GraduationCap, 
  Brain, 
  ArrowRight,
  Sparkles,
  Baby,
  Smile,
  Layers,
  FlaskConical,
  Trophy,
  Laptop,
  Heart,
  Palette,
  Music,
  Activity
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Academic Curriculum & Classes (Pre-School to Class X) | Prince Public School',
  description: 'Explore the CBSE curriculum at Prince Public School, Mehrauli (Pre-School to Class X). Session extends April to March in two terms with 100% Class X board results, French & Sanskrit, computer education, and moral values.',
};

export default function AcademicsPage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
            C.B.S.E. Curriculum • Pre-School to Class X
          </span>
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-800 border border-emerald-500/30">
            Session: April to March (Two Terms)
          </span>
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tiger_orange-500/20 text-tiger_orange-600 border border-tiger_orange-500/30">
            100% C.B.S.E. Class X Results
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans">
          Academic Classes &amp; Curriculum Framework
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          &ldquo;Education to us is more than books and exams. It is the way of life that helps in life.&rdquo; Our school session extends from April to March and is divided into two terms following the C.B.S.E. curriculum across four specialized sections.
        </p>
      </div>

      {/* Overview Pillars: Session, 100% Result & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#e2a02b] font-bold text-xs sm:text-sm uppercase font-mono">
            <Trophy className="w-4 h-4" />
            <span>Academic Distinction</span>
          </div>
          <h3 className="font-black text-lg text-[#09182d] font-sans">100% C.B.S.E. Class X Result</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Prince Public School is the only school in the Mehrauli area that achieved a 100% result in the C.B.S.E. Class X Board Examination, guided by seasoned faculty mentors.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#3d348b] font-bold text-xs sm:text-sm uppercase font-mono">
            <Laptop className="w-4 h-4" />
            <span>Digital Infrastructure</span>
          </div>
          <h3 className="font-black text-lg text-[#09182d] font-sans">Latest Computer &amp; Internet</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Strong emphasis on modern computer education equipped with high-speed internet facilities, smart digital classrooms, and interactive computational learning.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs sm:text-sm uppercase font-mono">
            <Heart className="w-4 h-4" />
            <span>Moral Education</span>
          </div>
          <h3 className="font-black text-lg text-[#09182d] font-sans">Rooted in Traditions &amp; Culture</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Firmly rooted in Indian heritage, value education instills integrity and emotional resilience in youth to protect them against conflicting modern influences.
          </p>
        </div>
      </div>

      {/* 4 ACADEMIC SECTIONS SPECIFIED BY USER */}
      <div className="space-y-12">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#e2a02b] font-mono">
            Structured Four-Tier Pedagogy
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#09182d] font-sans">
            Four Academic Sections (Pre-School to Class X)
          </h2>
          <p className="text-base text-slate-600">
            Carefully calibrated subject areas and co-curricular skills for each developmental milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECTION 1: Pre-School and Pre-Primary */}
          <div id="foundational" className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-[#e2a02b]/50 hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 w-fit rounded-2xl bg-amber-500/10 text-[#e2a02b] border border-amber-500/20">
                  <Baby className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  Ages 3+ &amp; 4+
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#e2a02b]">Section I</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#09182d] font-sans">Pre-School and Pre-Primary</h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Joyful early childhood development focusing on sensory discovery, basic conceptual skills, motor coordination, and emotional confidence.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 uppercase font-mono">Core Subjects &amp; Activities:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Identification of shapes &amp; colours</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Rhymes &amp; musical songs</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Drawing shapes &amp; colouring</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Basic numerals &amp; counting</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Alphabets &amp; vocabulary words</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Motor skills development via games</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600">
                ⭐ <strong>Age on 30th March:</strong> Pre-School (3+ years), Pre-Primary (4+ years).
              </div>
            </div>

            <Link
              href="/admissions"
              className="w-full text-center py-3 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Enquire for Pre-School &amp; Pre-Primary Admissions
            </Link>
          </div>

          {/* SECTION 2: Classes I to III */}
          <div id="grades-1-2" className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-[#3d348b]/50 hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 w-fit rounded-2xl bg-indigo-50 text-[#3d348b] border border-indigo-200">
                  <Smile className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Ages 5+ to 8
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#3d348b]">Section II</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#09182d] font-sans">Classes I to III (Primary Stage 1)</h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Transitioning to structured bilingual fluency, environmental curiosity, numerical problem-solving, and foundational creative arts.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 uppercase font-mono">Prescribed Curriculum &amp; Skills:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> English &amp; Hindi Languages</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Mathematics</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Environmental Studies (E.V.S.)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> General Knowledge (G.K.)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Value Education &amp; Ethics</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Art, Craft, Music &amp; Dance</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Physical Education &amp; Sports</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Supervised Class Guidance</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600">
                ⭐ <strong>Class I Admission:</strong> Child should be 5+ on 30th March of admission year.
              </div>
            </div>

            <Link
              href="/admissions"
              className="w-full text-center py-3 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Enquire for Classes I to III Admissions
            </Link>
          </div>

          {/* SECTION 3: Classes IV & V */}
          <div id="preparatory" className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-[#f18701]/50 hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 w-fit rounded-2xl bg-orange-50 text-[#f18701] border border-orange-200">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200">
                  Primary Stage 2
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#f18701]">Section III</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#09182d] font-sans">Classes IV &amp; V (Preparatory Stage)</h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Building deeper mathematical logic, scientific inquiry, environmental responsibility, and expressing creativity in public speaking and arts.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 uppercase font-mono">Prescribed Curriculum &amp; Skills:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> English &amp; Hindi</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Mathematics &amp; Problem Solving</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Environmental Studies (E.V.S.)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> General Knowledge</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Value Education &amp; Character Building</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Skills: Art &amp; Craft</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Skills: Music &amp; Dance</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Physical Education &amp; Athletics</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600">
                ⭐ <strong>Prep Routine:</strong> Closely supervised and guided by teachers catering to individual needs.
              </div>
            </div>

            <Link
              href="/admissions"
              className="w-full text-center py-3 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Enquire for Classes IV &amp; V Admissions
            </Link>
          </div>

          {/* SECTION 4: Classes VI to X */}
          <div id="middle-school" className="p-8 rounded-3xl border-2 border-[#e2a02b] bg-white shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 w-fit rounded-2xl bg-amber-50 text-[#e2a02b] border border-amber-300">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e2a02b] text-[#09182d]">
                  100% C.B.S.E. Class X Result
                </span>
              </div>

              <div id="secondary-school">
                <span className="text-xs font-mono font-bold uppercase text-[#e2a02b]">Section IV</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#09182d] font-sans">Classes VI to X (Middle &amp; Secondary)</h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive secondary education leading to the C.B.S.E. Class X Examination. Featuring language choices in French and Sanskrit, advanced computer labs, and disciplined board prep.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 uppercase font-mono">Prescribed Curriculum &amp; Skills:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> English &amp; Hindi</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Mathematics</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Social Studies (History, Civics, Geo, Econ)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Integrated Science (Physics, Chem, Bio)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> General Knowledge</li>
                  <li className="flex items-center gap-1.5 font-bold text-[#09182d]"><CheckCircle className="w-3.5 h-3.5 text-[#e2a02b] shrink-0" /> French and Sanskrit Languages</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Computer Education &amp; Internet Labs</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Value Education &amp; Personality Dev.</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Skills: Art, Craft, Music &amp; Dance</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Physical Education &amp; Athletics</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium">
                🏆 <strong>Unmatched Achievement:</strong> Only school in the Mehrauli area that got 100% result in C.B.S.E. Class X exam!
              </div>
            </div>

            <Link
              href="/admissions"
              className="w-full text-center py-3 rounded-xl bg-[#e2a02b] hover:bg-[#d99b26] text-[#09182d] font-bold text-sm shadow-md transition-colors"
            >
              Apply for Classes VI to X Admissions
            </Link>
          </div>

        </div>
      </div>

      {/* Co-Curricular & Special Features Section */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-12 space-y-6">
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
            Holistic Development
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09182d] font-sans">
            Co-Curricular Competitions &amp; Hobbies
          </h2>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
            Debate, Quizzes, Dramatic and Drawing competitions are organized on a regular basis at Prince Public School. Students also pursue their passions in Fancy Dress Competitions, Art, Music, Dance, Acting, and Modelling.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {[
            { label: 'Debate & Quizzes', icon: BookOpen },
            { label: 'Dramatics & Acting', icon: Sparkles },
            { label: 'Drawing & Art', icon: Palette },
            { label: 'Music & Vocal', icon: Music },
            { label: 'Dance & Rhythm', icon: Activity },
            { label: 'Fancy Dress & Modelling', icon: Award },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-2 shadow-2xs">
                <div className="w-9 h-9 mx-auto rounded-xl bg-amber_flame-500/15 text-[#e2a02b] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#09182d]">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
