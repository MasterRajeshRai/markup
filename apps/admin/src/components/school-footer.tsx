import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ArrowRight,
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function SchoolFooter() {
  return (
    <footer className="bg-[#09182d] text-slate-300 text-sm border-t border-[#162a45]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-10 items-start">
          
          {/* Column 1: School Identity, Crest & Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pps-crest.svg"
                alt="Prince Public School Crest"
                className="h-12 w-12 object-contain filter drop-shadow-[0_2px_8px_rgba(226,160,43,0.3)] group-hover:scale-105 transition-transform"
              />
              <div>
                <h3 className="font-black text-xl text-white tracking-tight uppercase font-sans">
                  Prince Public School
                </h3>
                <p className="text-xs text-[#e2a02b] font-semibold tracking-wider font-mono">
                  CBSE Affiliated &bull; Day &amp; Boarding School
                </p>
              </div>
            </Link>

            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              A premier co-educational institution (Pre-School to Class X) situated just 1.0 km from Qutub Minar in Mehrauli, New Delhi. Dedicated to disciplined character building, cultural roots, modern computer education, and 100% CBSE Class X board success.
            </p>

            {/* Quick Credentials Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#162a45] text-amber-300 border border-[#23416a]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Affiliation No. 2130842
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#162a45] text-emerald-300 border border-[#23416a]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                100% Board Pass Rate
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#162a45] text-slate-300 border border-[#23416a]">
                Est. 1988
              </span>
            </div>

            {/* Direct Contact Details */}
            <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#e2a02b] shrink-0 mt-0.5" />
                <span>2/108, Mehrauli, New Delhi - 110030 (1.0 km from Qutub Minar)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#e2a02b] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-amber-300 transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#e2a02b] shrink-0" />
                <a href="mailto:info@princepublicschool.edu.in" className="hover:text-amber-300 transition-colors">
                  info@princepublicschool.edu.in
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                <span>Visiting Hours: Monday – Saturday, 8:00 AM – 2:30 PM</span>
              </div>
            </div>
          </div>

          {/* Column 2: Academics & Campus Life (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#e2a02b] font-mono">
              Academics &amp; Life
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { title: 'Curriculum & Wings', url: '/academics' },
                { title: 'Beyond Academics', url: '/beyond-academics' },
                { title: 'Campus Facilities', url: '/facilities' },
                { title: 'Photo Gallery', url: '/gallery' },
                { title: 'Notices & Circulars', url: '/notices' },
                { title: 'Boarding & Day Care', url: '/facilities' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="hover:text-[#e2a02b] transition-colors py-0.5 flex items-center gap-2 text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Institutional & Admissions (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#e2a02b] font-mono">
              The Institution
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { title: 'About Our Legacy', url: '/about' },
                { title: 'Principal’s Message', url: '/about#principal' },
                { title: 'Admissions 2026–27', url: '/admissions' },
                { title: 'Mandatory Disclosure', url: '/mandatory-disclosure' },
                { title: 'Contact & Directions', url: '/contact' },
                { title: 'Privacy Policy', url: '/privacy' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    className="hover:text-[#e2a02b] transition-colors py-0.5 flex items-center gap-2 text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Admissions Action Card & Socials (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Admissions Mini Callout Card */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#12253f] to-[#0d1d32] border border-[#23416a] shadow-md space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e2a02b]/15 text-amber-300 border border-[#e2a02b]/30 font-mono">
                  <GraduationCap className="w-3 h-3 text-amber-400" />
                  Admissions 2026–27
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Pre-School – Class X
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="text-white font-bold text-sm">
                  Enroll Your Child for Tomorrow
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join a community committed to values, safety, and academic rigor in Mehrauli.
                </p>
              </div>

              <Link
                href="/admissions"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#e2a02b] hover:bg-[#d99b26] text-[#09182d] font-bold text-xs tracking-wide shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>

            {/* Social Channels */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                Connect With Us
              </h4>
              <div className="flex items-center gap-2">
                {[
                  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={idx}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="p-2.5 rounded-xl bg-[#162a45] hover:bg-[#e2a02b] hover:text-[#09182d] text-slate-300 transition-colors shadow-xs"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="mt-12 pt-6 border-t border-[#162a45] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; 2026 Prince Public School, Mehrauli, New Delhi. All rights reserved. &bull; CBSE Affiliation No. 2130842
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/mandatory-disclosure"
              className="hover:text-[#e2a02b] transition-colors flex items-center gap-1.5 text-amber-400 font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-[#e2a02b]" />
              <span>Mandatory Public Disclosure</span>
            </Link>
            <Link href="/privacy" className="hover:text-amber-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
