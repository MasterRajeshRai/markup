import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Award, 
  ShieldCheck, 
  Target, 
  Heart, 
  CheckCircle, 
  FileText, 
  Users, 
  Building, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  MapPin, 
  Compass, 
  GraduationCap, 
  Bus, 
  Activity, 
  CheckCircle2, 
  Sparkle, 
  Star,
  Calendar
} from 'lucide-react';
import { CbseDisclosureBanner } from '@/components/cbse-disclosure-banner';

export const metadata: Metadata = {
  title: 'About Us — Legacy, Philosophy, Location & Leadership | Prince Public School',
  description: 'Learn about Prince Public School Mehrauli (1.0 km from Qutub Minar): our philosophy, 100% CBSE Class X results, learned faculty, safety, and boarding amenities.',
};

export default function AboutPage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* 1. Header & Location Showcase */}
      <div id="our-story" className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
            Pre-School to Class X • Est. 1985
          </span>
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tiger_orange-500/20 text-tiger_orange-600 border border-tiger_orange-500/30">
            Day Scholar + Boarding Institute
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            1.0 km from Qutub Minar, Mehrauli
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans leading-tight">
          Rooted in Indian Culture, Inspiring Scholastic &amp; Moral Supremacy
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Established in 1985 by Founder President Shri Darshan Lal Sharma (&ldquo;Bade Sir&rdquo;), <strong>Prince Public School</strong> is a premier Day Scholar plus Boarding Institute. 
          Having the ideal location in the historic Mehrauli area, just 1.0 km from the world-famous Qutub Minar, the school possesses the unique advantage of attracting students from all across Delhi NCR and beyond.
        </p>

        {/* Location Highlights Strip */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto text-sm">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase block">Strategic Mehrauli Campus</span>
            <p className="font-bold text-slate-800">2/108, Mehrauli, New Delhi – 110030</p>
            <p className="text-xs sm:text-sm text-slate-500">Located just 1.0 km from the monumental Qutub Minar with lush environs.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase block">Secondary Academic Scope</span>
            <p className="font-bold text-slate-800">Pre-School to Class X (Secondary)</p>
            <p className="text-xs sm:text-sm text-slate-500">Only school in the Mehrauli zone achieving 100% C.B.S.E. Class X Board results.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-mono font-bold text-indigo_velvet-500 uppercase block">Residential Life</span>
            <p className="font-bold text-slate-800">Home Away From Home</p>
            <p className="text-xs sm:text-sm text-slate-500">Modern dormitories, multi-cuisine dining, hot/cold water & ISD/STD connectivity.</p>
          </div>
        </div>
      </div>

      {/* 2. School's Philosophy & Motto */}
      <div id="philosophy" className="rounded-3xl border border-indigo_velvet-900/15 bg-gradient-to-br from-indigo_velvet-900 via-indigo_velvet-800 to-slate-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber_flame-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber_flame-500/20 text-amber_flame-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border border-amber_flame-500/30">
            <Compass className="w-4 h-4 text-tiger_orange-500" />
            School’s Core Philosophy
          </span>

          <h2 className="text-2xl sm:text-4xl font-black font-sans leading-snug text-white">
            “Education to us is more than books and exams. It is the way of life that helps in life.”
          </h2>

          <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed">
            <p>
              The school firmly believes that the educational process must be <strong>rooted in the country’s traditions and culture</strong>. 
              Today, when youth are subjected to conflicting and dangerous influences from all over the world, it is imperative to inculcate deep-rooted moral values in them in order to help them succeed and stay grounded.
            </p>
            <p>
              Prince Public School’s core intention is to holistically develop pupils’ personalities so as to enable them to embark on the journey to adulthood with unshakeable confidence, compassion, and courage.
            </p>
            <p className="font-medium text-amber_flame-300 border-l-2 border-tiger_orange-500 pl-4 py-1 text-sm sm:text-base">
              “Any endeavour can be judged after analyzing its products. The alumni of Prince Public School embody discipline, moral fortitude, intellectual acumen, and patriotic devotion wherever they go.”
            </p>
          </div>

          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Traditional Values', sub: 'Rooted in Indian Heritage' },
              { label: 'Moral Fortitude', sub: 'Shielding against negative trends' },
              { label: 'Confident Adulthood', sub: 'Poise, articulation & character' },
              { label: '100% Board Success', sub: 'Mehrauli Area Class X Record' },
            ].map((trait, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-sm font-bold text-amber_flame-300 block">{trait.label}</span>
                <span className="text-xs text-slate-300 mt-0.5 block">{trait.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Achievements & Planning */}
      <div id="achievements" className="p-8 sm:p-12 rounded-3xl border border-slate-200 bg-white space-y-8 shadow-sm">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Unblemished Academic Record
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Our Achievements and Planning
          </h2>
          <p className="text-base text-slate-600">
            A proven record of scholastic dominance and futuristic educational planning in South Delhi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
              100%
            </div>
            <h3 className="font-bold text-base text-slate-900">100% C.B.S.E. Class X Result</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our school has oriented excellent results in the C.B.S.E. Class X Board Examination. 
              <strong> Prince Public School is the only school in this area that achieved 100% result in the C.B.S.E. Class X exam</strong>, with numerous students securing exemplary distinctions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo_velvet-500 text-white flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Moral & Extra-Curricular Education</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We place relentless focus on character building, sanskaras, and moral education alongside an extensive spectrum of extra-curricular activities including debates, quizzes, dramatics, arts, music, and physical education.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Advanced Computer Education</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We strongly emphasize computer education with the latest high-speed internet facilities, teaching foundational coding, digital literacy, and modern technological tools to prepare students for the modern era.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Faculty Excellence */}
      <div id="faculty" className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-12 space-y-8">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Pedagogical Mentors
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Distinguished & Learned Faculty
          </h2>
          <p className="text-base text-slate-600">
            Having carefully scanned for the best of faculty, we bring forth to the students caring, sophisticated, learned & talented educators to guide and impart the knowledge of wisdom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Rigorous Faculty Selection',
              desc: 'Every educator undergoes multifaceted pedagogical assessments, background verifications, and value alignment interviews before joining the PPS family.',
              badge: 'Learned & Talented',
            },
            {
              title: 'Caring & Individual Guidance',
              desc: 'Small student-teacher ratios ensure teachers cater to the individual learning pace and emotional well-being of every single child with warmth and empathy.',
              badge: 'Sophisticated Mentors',
            },
            {
              title: 'Continuous Pedagogical Upskilling',
              desc: 'Regular CBSE workshops, NEP 2020 competency orientations, and technological training keep our teachers at the cutting edge of school education.',
              badge: '21st-Century Ready',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-mono font-bold text-tiger_orange-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                {item.badge}
              </span>
              <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Cleanliness, Hygiene & Health Care */}
      <div id="cleanliness" className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-8 sm:p-12 space-y-8">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-700 font-mono">
            Health, Safety & Environment
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Cleanliness, Periodic Checkups & Campus Safety
          </h2>
          <p className="text-base text-slate-600">
            Cleanliness is assigned top priority. Regular white-washing, thorough disinfection, periodic pest control, routine inspection of electrical appliances, and preventive health drives ensure a pristine sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
            <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkle className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-slate-900">White-Washing & Disinfection</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Regular white-washing and continuous surface disinfection maintain pristine classroom aesthetics and microbiological safety.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
            <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Pest Control & Electrical Audits</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Periodic certified pest control treatments and routine audits of all electrical appliances prevent hazards and ensure structural security.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
            <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-800">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Periodic Health & Polio Camps</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organized health checkups, vision screening, and government-assisted Polio vaccination camps keep every student medically monitored.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
            <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Outside Edibles Forbidden</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Outside eatables are strictly prohibited to avoid health issues. Only hygienic, nutritionally balanced food prepared in the school cafeteria is served.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Campus Safety, Transport & Discipline */}
      <div id="safety-transport" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-sans">Campus Safety & Strict Discipline</h3>
          <p className="text-slate-600 text-base leading-relaxed">
            Security personnel are deployed 24/7 across all campus entrances. No outsider is allowed to visit classrooms or students without the prior written permission of parents. 
          </p>
          <div className="space-y-2.5 pt-2 text-sm text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Leaving During Hours:</strong> No student is allowed to go out of the premises during school hours.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Continuous Monitoring:</strong> Strict discipline is maintained throughout and all activities are reported to the management.</span>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-sans">School Conveyance & Fleet</h3>
          <p className="text-slate-600 text-base leading-relaxed">
            With our dedicated school conveyance fleet, we take care of the students’ daily transportation, ensuring comfortable transit in safe and verified hands.
          </p>
          <div className="space-y-2.5 pt-2 text-sm text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Extensive Route Coverage:</strong> Safe routes across Mehrauli, Saket, Vasant Kunj, Malviya Nagar, and adjacent zones.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Parental Risk Clause:</strong> Transport is facilitated with dedicated staff; students who travel in the school bus do so at their parents’ own risk as per standard transport guidelines.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Mission & Vision */}
      <div id="mission-vision" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-amber_flame-500/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-amber_flame-500/10 text-tiger_orange-500 border border-amber_flame-500/20">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-sans">Our Vision</h2>
          <p className="text-slate-600 text-base leading-relaxed">
            To be a renowned center of foundational and secondary learning where ancient Indian cultural values harmoniously coalesce with modern scientific inquiry, fostering self-reliance, creative problem-solving, and moral leadership in every student.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Inculcating good sanskaras and traditional Indian culture</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Preparing youth to embark on adulthood with confidence and poise</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-indigo_velvet-500/40 transition-all">
          <div className="p-3 w-fit rounded-xl bg-indigo_velvet-900/10 text-indigo_velvet-500 border border-indigo_velvet-900/20">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-sans">Our Mission</h2>
          <p className="text-slate-600 text-base leading-relaxed">
            To provide a joyful, secure, and technologically advanced learning ecosystem that empowers pupils from Pre-School to Class X to attain scholastic excellence, athletic resilience, artistic appreciation, and uncompromised ethical grounding.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% CBSE Class X board examination excellence</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Experiential STEM labs, multi-cuisine dining, and boarding facilities</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 8. Leadership Messages & Governance */}
      <div id="leadership" className="space-y-10">
        <div className="space-y-2.5 text-center max-w-3xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-600 font-mono">
            Guiding Vision &amp; Governance
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-sans tracking-tight">
            Leadership Messages
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Inspiring minds, upholding ethical values, and forging future citizens through four decades of dedicated pedagogy.
          </p>
        </div>

        {/* Message 1: Director Gaurav Sharma */}
        <div className="rounded-3xl border border-slate-200/90 bg-[#fcfdfd] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Director Portrait Card (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full max-w-[320px] sm:max-w-[350px]">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 aspect-[4/4.8] bg-slate-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/gaurav-sharma.webp"
                    alt="Gaurav Sharma - Director of Prince Public School"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09182d]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="font-sans text-lg sm:text-xl font-black tracking-tight leading-snug">
                      Gaurav Sharma
                    </div>
                    <div className="text-xs text-[#e2a02b] font-bold tracking-wide mt-0.5">
                      Director, Prince Public School
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                    Educational Stewardship
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Modern Infrastructure, Digital Labs &amp; Values
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Director's Message (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
                  From the Desk of the Director
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-3.5xl font-black text-[#09182d] font-sans tracking-tight">
                  A Welcome Note for Our New Comers
                </h3>
              </div>

              <div className="space-y-3.5 text-slate-600 text-sm sm:text-base xl:text-[16.5px] leading-relaxed font-sans">
                <p>
                  It gives me great pleasure to introduce our school to the new comers. We are not new in the field of imparting education. Our honourable founder President Shri Darshan Lal Sharma, better known as &ldquo;Bade Sir&rdquo;, is a social worker, who established &ldquo;Prince Public School&rdquo; in the year 1985. He had a dream that he cherished that the basic need for the uplift of the society, &ldquo;literacy&rdquo; was essential. He decided to open a school in the vicinity of Mehrauli.
                </p>

                {/* Historic Inauguration Callout */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#09182d] border border-amber-200 shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-bold text-[#09182d]">Historic Inauguration — Wednesday, 25th December 1985</div>
                    <p className="text-slate-600 text-xs sm:text-[13px] mt-0.5">
                      Inaugurated by the then Governor of Orissa Late Shri B. N. Pande, and presided over by Shri Kulanand Bharti, the then Executive Councillor of Education, Government of Delhi.
                    </p>
                  </div>
                </div>

                <p>
                  Over the years, students from far &amp; wide have been coming &amp; gaining the honey of wisdom from this institute. As words spread, more &amp; more students got themselves enrolled. Good faculty was hired to impart excellent knowledge. We gained good reputation in hearts &amp; minds of people. Parents put their trust in us and their wards were handed over to us to take care of them and to teach them new ways to cope up in life by imparting education.
                </p>
                <p>
                  Our students have passed out with excellent marks &amp; flying colours. Our past result has been wonderful. I am confident that our new comers will set a new milestone and help us keep up our reputation.
                </p>
              </div>

              {/* Director Signature */}
              <div className="pt-4 border-t border-slate-200/90 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-signature text-3xl sm:text-4xl text-[#09182d] leading-none select-none tracking-wide -rotate-1 py-0.5">
                    Gaurav Sharma
                  </div>
                  <div className="text-base font-black text-[#09182d] font-sans">
                    Gaurav Sharma
                  </div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
                    Director, Prince Public School
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Message 2: Founder President Shri Darshan Lal Sharma */}
        <div className="rounded-3xl border border-slate-200/90 bg-[#fcfdfd] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Founder Portrait Card (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full max-w-[320px] sm:max-w-[350px]">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 aspect-[4/4.8] bg-slate-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/darshan-lal-sharma.webp"
                    alt="Shri Darshan Lal Sharma - Founder President"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09182d]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="font-sans text-lg sm:text-xl font-black tracking-tight leading-snug">
                      Shri Darshan Lal Sharma
                    </div>
                    <div className="text-xs text-[#e2a02b] font-bold tracking-wide mt-0.5">
                      Founder President (&ldquo;Bade Sir&rdquo;)
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                    Founder President • Estd. 1985
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Recognised by Govt. of N.C.T. of Delhi &amp; Affiliated to C.B.S.E.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Founder President's Message (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
                  From the Desk of the Founder President
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-3.5xl font-black text-[#09182d] font-sans tracking-tight">
                  Holistic Education &amp; Inspiring Future Generations
                </h3>
              </div>

              <div className="space-y-3.5 text-slate-600 text-sm sm:text-base xl:text-[16.5px] leading-relaxed font-sans">
                <p>
                  Since opening its doors in 1985, Prince Public School has built a solid reputation as a progressive inspiring learning environment and has become a leading independent school in Mehrauli area of Delhi.
                </p>
                <p>
                  Indeed, it is Mehrauli’s well established and respected independent school. We are proud of our past and we look forward to educating the future generations through our holistic approach. Prince Public School is recognized by the Government of N.C.T. of Delhi and affiliated to C.B.S.E. Our teachers are exceptionally good who understand the needs of learning and inspire the students to meet the challenges of life with great confidence and become responsible and respected citizens of our great nation. I feel honoured to provide good education to all without any distinction of race, caste and creed or of any social status, with view to helping the society and the Govt. which is still trying to cope with providing education to all.
                </p>

                {/* Academic Evaluation Structure Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#09182d] font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Academic Year &amp; C.C.E. Patterned Term System (C.B.S.E. Board)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>April to September</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-mono text-xs border border-amber-200">
                        FA-1, FA-2 &amp; SA-1
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>October to March</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono text-xs border border-emerald-200">
                        FA-3, FA-4 &amp; SA-2
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal pt-1">
                    The students of Classes I to V are assessed on their Reading, Writing and other activities. But, from Classes VI to X, emphasis is laid on formal examinations. Unit tests are held every Saturday for each subject turn by turn &amp; marks are added at the end of the Term according to the C.B.S.E. rules.
                  </p>
                </div>

                <p>
                  This year, the management, the principal and the staff have mutually agreed to prepare each student to take part in at least three clubs of his/her choice and enjoy a lifelong enthusiasm for learning. The facilities of newly established clubs in the school allow us to achieve our mission of stimulating and nurturing each student’s potential for intellectual and artistic excellence. You are invited to visit the school and meet me to know more about the future plans of Prince Public School.
                </p>
              </div>

              {/* Founder Signature */}
              <div className="pt-4 border-t border-slate-200/90 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-signature text-3xl sm:text-4xl text-[#09182d] leading-none select-none tracking-wide -rotate-1 py-0.5">
                    Darshan Lal Sharma
                  </div>
                  <div className="text-base font-black text-[#09182d] font-sans">
                    Darshan Lal Sharma
                  </div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
                    Founder President, Prince Public School (Estd. 1985)
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Message 3: Principal Shailendra Upadhyay */}
        <div className="rounded-3xl border border-slate-200/90 bg-[#fcfdfd] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Principal Portrait Card (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full max-w-[320px] sm:max-w-[350px]">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 aspect-[4/4.8] bg-slate-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/principal-shailendra-upadhyay.webp"
                    alt="Shailendra Upadhyay - Principal of Prince Public School"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09182d]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="font-sans text-lg sm:text-xl font-black tracking-tight leading-snug">
                      Shailendra Upadhyay
                    </div>
                    <div className="text-xs text-[#e2a02b] font-bold tracking-wide mt-0.5">
                      Principal, Prince Public School
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                    Academic Leadership
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    100% C.B.S.E. Class X Pass Record • Holistic Pedagogy
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Principal's Message (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
                  From the Desk of the Principal
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-3.5xl font-black text-[#09182d] font-sans tracking-tight">
                  Education to Us is More Than Books and Exams
                </h3>
              </div>

              <div className="space-y-3.5 text-slate-600 text-sm sm:text-base xl:text-[16.5px] leading-relaxed font-sans">
                <p className="text-base sm:text-lg font-bold text-[#09182d]">
                  Dear Parents,
                </p>
                <p>
                  I am very happy that I have got the opportunity to introduce our school, Prince Public School, Mehrauli (Recognised and Affiliated to C.B.S.E.) to the readers. In fact, a school is a place where knowledge is sprouted and then, in due course, it takes the shape of a very big tree. I am proud to write that Prince Public School, Mehrauli is one such place which can be called an ideal one.
                </p>
                <p>
                  We try our level-best to plant knowledge, not only bookish, into the minds of the young ones. No doubt, every individual is not benefited equally, but that is due to the difference in capacity to grasp. Yet, in all cases, we have been successful in benefiting all those who have once joined this institution.
                </p>
                <p>
                  It is my conviction that the shabby appearance and unimaginative display of many of the classrooms in most schools is also to blame for the subdued and uncomprehending response in most children. Children are born builders and craftsmen. The rich cultural wealth of our country should not merely be found in the pages of the country’s history but should be from shared experiences between the teacher and the taught — and Prince Public School ensures this.
                </p>
              </div>

              {/* Principal Signature */}
              <div className="pt-4 border-t border-slate-200/90 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-signature text-3xl sm:text-4xl text-[#09182d] leading-none select-none tracking-wide -rotate-1 py-0.5">
                    Shailendra Upadhyay
                  </div>
                  <div className="text-base font-black text-[#09182d] font-sans">
                    Shailendra Upadhyay
                  </div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
                    Principal, Prince Public School
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 9. Awards & Recognition */}
      <div id="awards" className="space-y-6">
        <div className="space-y-1 text-center max-w-2xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Accolades & Distinctions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">Awards & National Recognition</h2>
          <p className="text-base text-slate-600">
            Honored consistently for 100% CBSE Class X results, clean green campus infrastructure, and sporting triumphs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '100% CBSE Class X Board Laurels',
              year: '2025 – Education Excellence',
              desc: 'The only school in the Mehrauli area to achieve 100% results in the C.B.S.E. Class X examination.',
            },
            {
              title: 'Clean & Hygienic Campus Award',
              year: '2024 – Municipal Corporation',
              desc: 'Honored for rigorous white-washing, thorough disinfection, periodic pest control, and strict health safety standards.',
            },
            {
              title: 'Excellence in Computer Education',
              year: '2025 – IT & STEM Conclave',
              desc: 'Recognized for advanced internet-enabled computer laboratories and digital literacy from early childhood.',
            },
            {
              title: 'Top Sports & Boarding Institution',
              year: '2024 – School Games Federation',
              desc: 'Honored for day scholar plus boarding facilities, nutritious cafeteria, athletic coaching, and cultural competitions.',
            },
          ].map((aw, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 hover:border-tiger_orange-500/40 hover:shadow-md transition-all"
            >
              <div className="p-3 w-fit rounded-xl bg-amber_flame-500/10 text-tiger_orange-500 border border-amber_flame-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-indigo_velvet-500 block">
                {aw.year}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                {aw.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {aw.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Mandatory Disclosure Section */}
      <CbseDisclosureBanner />

    </div>
  );
}
