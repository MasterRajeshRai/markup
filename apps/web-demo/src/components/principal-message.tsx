import React from 'react';
import Link from 'next/link';
import { ArrowRight, Quote, CheckCircle2 } from 'lucide-react';

export function PrincipalMessage() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-sm relative overflow-hidden">
        {/* Subtle decorative quote accent in the background */}
        <Quote className="w-24 h-24 text-[#09182d]/5 absolute -top-3 -right-3 stroke-1 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center relative z-10">
          
          {/* Left Column: Principal Portrait & Compact Identity Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[320px] sm:max-w-[350px] lg:max-w-[360px]">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 aspect-[4/4.8] bg-slate-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/principal-shailendra-upadhyay.webp"
                  alt="Shailendra Upadhyay - Principal of Prince Public School"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09182d]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="font-sans text-lg sm:text-xl font-black tracking-tight leading-snug">
                    Shailendra Upadhyay
                  </div>
                  <div className="text-xs text-[#e2a02b] font-bold tracking-wide mt-0.5">
                    Principal, Prince Public School
                  </div>
                </div>
              </div>

              {/* Compact Credential Bar below photo */}
              <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono">
                    Mehrauli, New Delhi
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Recognised &amp; Affiliated to C.B.S.E.
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  CBSE Class X
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Message from the Desk (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Header / Eyebrow */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2a02b]" />
                Principal&apos;s Desk
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-3.5xl xl:text-4xl font-black text-[#09182d] tracking-tight leading-tight font-sans">
                From the Desk of the <span className="text-[#e2a02b]">Principal</span>
              </h2>
            </div>

            {/* Salutation */}
            <p className="text-base sm:text-lg font-bold text-[#09182d] font-sans">
              Dear Parents,
            </p>

            {/* Letter Content with compact, balanced spacing */}
            <div className="space-y-3 text-slate-600 text-sm sm:text-base xl:text-[16.5px] leading-relaxed font-sans">
              <p>
                I am very happy that I have got the opportunity to introduce our school, Prince Public School, Mehrauli (Recognised and Affiliated to C.B.S.E.) to the readers. In fact, a school is a place where knowledge is sprouted and then, in due course, it takes the shape of a very big tree. I am proud to write that Prince Public School, Mehrauli is one such place which can be called an ideal one.
              </p>
              <p>
                We try our level-best to plant knowledge, not only bookish, into the minds of the young ones. No doubt, every individual is not benefited equally, but that is due to the difference in capacity to grasp. Yet, in all cases, we have been successful in benefiting all those who have once joined this institution.
              </p>
              <p>
                It is my conviction that the shabby appearance and unimaginative display of many of the classrooms in most schools is also to blame for the subdued and uncomprehending response in most children. Children are born builders and craftsmen. The rich cultural wealth of our country should not merely be found in the pages of the country&apos;s history but should be from shared experiences between the teacher and the taught — and Prince Public School ensures this.
              </p>
            </div>

            {/* Sign-off & Signature with refined, reduced signature font size */}
            <div className="pt-4 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                {/* Tasteful reduced calligraphic signature */}
                <div className="font-signature text-3xl sm:text-4xl xl:text-[2.65rem] text-[#09182d] leading-none select-none tracking-wide -rotate-1 py-0.5">
                  Shailendra Upadhyay
                </div>
                <div className="text-sm sm:text-base font-black text-[#09182d] font-sans tracking-tight">
                  Shailendra Upadhyay
                </div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
                  Principal, Prince Public School
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-[#09182d] text-[#09182d] hover:text-white font-bold text-xs sm:text-sm tracking-wide transition-all group shrink-0 shadow-xs"
              >
                <span>Read School Philosophy</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
