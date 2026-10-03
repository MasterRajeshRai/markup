import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Quote,
  MapPin,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function AboutFeatureSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch">
        
        {/* Column 1: Left Text, Pillars & CTA (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Elegant Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/25 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>About Prince Public School</span>
            </div>

            {/* Section Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#09182d] tracking-tight leading-[1.18] font-sans">
              A Legacy of Excellence, <br className="hidden sm:inline" />
              <span className="text-[#09182d]">A Future of Possibilities</span>
            </h2>

            {/* Descriptive Narrative */}
            <div className="space-y-3.5 text-slate-600 text-base sm:text-[16.5px] leading-relaxed">
              <p>
                Ideally located at 2/108, Mehrauli, New Delhi—just 1.0 km from the world-famous Qutub Minar—Prince Public School possesses the benefit of welcoming students from all across Delhi. As a unique Day Scholar plus Boarding institute (Pre-School to Class X), it is a true home away from home.
              </p>
              <p>
                We firmly believe education must be rooted in India&apos;s rich traditions and culture. By inculcating strong moral values, disciplined safety, modern internet computer education, and teacher-supervised prep, we prepare every child to embark on the journey to adulthood with confidence.
              </p>
            </div>

            {/* Quick Hallmark Badges / Institutional Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Pre-School to Class X</div>
                  <div className="text-[11px] text-slate-500 font-medium">CBSE Curriculum</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Day &amp; Boarding</div>
                  <div className="text-[11px] text-slate-500 font-medium">Supervised Prep</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">1 km from Qutub Minar</div>
                  <div className="text-[11px] text-slate-500 font-medium">Mehrauli, New Delhi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#09182d] hover:bg-[#162a45] text-white font-bold text-sm tracking-wide shadow-md shadow-[#09182d]/15 transition-all hover:scale-105 active:scale-95"
            >
              <span>Know More About Us</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/facilities"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Campus</span>
            </Link>
          </div>
        </div>

        {/* Column 2: Center Campus Building Photo Card (lg:col-span-4) */}
        <div className="lg:col-span-4 relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 min-h-[460px] lg:min-h-full group bg-slate-950 flex flex-col justify-between p-5 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pps-building-facade.webp"
            alt="Prince Public School Mehrauli Campus Building"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          {/* Rich Multilayer Scrim for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09182d]/95 via-[#09182d]/25 to-black/30 pointer-events-none" />

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#09182d] text-xs font-bold font-sans shadow-md border border-white/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Campus Premises
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-300 border border-white/20 text-[11px] font-mono font-bold">
              Est. 1988
            </span>
          </div>

          {/* Bottom Frosted Glass Address Panel */}
          <div className="relative z-10 rounded-2xl bg-[#09182d]/85 backdrop-blur-md p-4 sm:p-5 border border-white/15 text-white shadow-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>2/108, Mehrauli, New Delhi</span>
            </div>
            <h4 className="text-base sm:text-lg font-black font-sans tracking-tight text-white">
              Prince Public School Campus
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium pt-0.5">
              <span>1.0 km from Qutub Minar</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Co-Educational
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Right Quote Box (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#09182d] via-[#10243e] to-[#09182d] text-white border border-[#1e395b] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          {/* Ambient Golden Glow Accent in Corner */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Large decorative quotation watermark */}
          <Quote className="w-24 h-24 text-white/5 absolute -top-4 -right-4 stroke-1 pointer-events-none" />

          <div className="space-y-5 relative z-10">
            {/* Golden Quote Icon Pill */}
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Quote className="w-6 h-6 fill-amber-400/20" />
            </div>

            {/* Core Institutional Philosophy Quote */}
            <p className="text-lg sm:text-xl font-sans font-bold text-slate-100 leading-snug tracking-tight">
              &ldquo;Education to us is more than books and exams. It is the way of life that helps in life.&rdquo;
            </p>
          </div>

          {/* Signature & Credential Bar */}
          <div className="pt-6 border-t border-white/10 relative z-10 space-y-3">
            <div>
              <div className="font-extrabold text-base text-white font-sans tracking-tight">
                Prince Public School
              </div>
              <div className="text-xs text-amber-300/90 font-mono font-bold mt-0.5">
                Mehrauli, New Delhi
              </div>
            </div>

            {/* Credential Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% CBSE Class X Result</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
