'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Trophy, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  Bed, 
  ArrowRight,
  Phone
} from 'lucide-react';

interface SchoolHeaderProps {
  navItems?: { title: string; url: string }[];
  siteTitle?: string;
  logoUrl?: string;
}

export function SchoolHeader({
  siteTitle = 'Prince Public School',
  logoUrl = '/images/pps-crest.svg',
}: SchoolHeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    about: false,
    disclosure: false,
    academics: false,
    beyond: false,
    infra: false,
    admissions: false,
  });

  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const toggleMobileSection = (key: string) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const mandatoryDocuments = [
    { name: 'CBSE Circular', slug: 'cbse-circular' },
    { name: 'General School Details', slug: 'general-school-details' },
    { name: 'CBSE Affiliation Letter', slug: 'cbse-affiliation-letter' },
    { name: 'Upgradation Letter', slug: 'upgradation-letter' },
    { name: 'Results and Academics', slug: 'results-and-academics' },
    { name: 'School Infrastructure', slug: 'school-infrastructure' },
    { name: 'Staff Details', slug: 'staff-details' },
    { name: 'Society/ Trust Certificate', slug: 'society-trust-certificate' },
    { name: 'Recognition Certificate under RTE, 2009', slug: 'recognition-rte-2009' },
    { name: 'Fire Safety Certificate', slug: 'fire-safety-certificate' },
    { name: 'Building Safety Certificate', slug: 'building-safety-certificate' },
    { name: 'Extension of Affiliation', slug: 'extension-of-affiliation' },
    { name: 'NOC issued by the State Government', slug: 'state-gov-noc' },
    { name: 'Water, Health and Sanitation Certificates', slug: 'water-health-sanitation' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      
      {/* Unified Single Header Bar (No separate tier or block) */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile View: Logo on left, actions on right */}
        <div className="flex lg:hidden items-center justify-between h-16 sm:h-18 w-full max-w-full gap-2">
          <Link href="/" className="inline-flex items-center gap-2 group min-w-0 flex-1 overflow-hidden">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${siteTitle} Crest`}
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_6px_rgba(226,160,43,0.3)] shrink-0"
              />
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-black text-sm sm:text-base tracking-tight text-[#09182d] uppercase leading-none font-sans truncate">
                {siteTitle}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 tracking-wider uppercase font-mono mt-0.5 truncate">
                Mehrauli, New Delhi
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="tel:+911128084567"
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#09182d] hover:bg-slate-50 transition-colors"
              aria-label="Call Admissions Desk"
            >
              <Phone className="w-4 h-4 text-amber-600" />
            </a>
            <Link
              href="/admissions"
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-[#e2a02b] text-[#09182d] font-bold text-xs shadow-xs whitespace-nowrap"
            >
              Apply
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#09182d] hover:bg-slate-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#09182d]" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Desktop View: Centrally aligned composite with Logo aligned to the left of Navigation */}
        <div className="hidden lg:flex items-center justify-center h-20 xl:h-22 gap-2 xl:gap-3 2xl:gap-5 w-full">
          
          {/* Logo & School Identity (Aligned Left to the Navigation Items) */}
          <Link href="/" className="inline-flex items-center gap-2.5 xl:gap-3 group shrink-0 mr-1 xl:mr-3">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${siteTitle} Crest`}
                className="h-11 w-11 xl:h-12 xl:w-12 2xl:h-13 2xl:w-13 object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_8px_rgba(226,160,43,0.3)]"
              />
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-black text-base xl:text-lg 2xl:text-[1.25rem] tracking-tight text-[#09182d] group-hover:text-[#e2a02b] transition-colors uppercase leading-none font-sans whitespace-nowrap">
                {siteTitle}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-bold text-amber-700 tracking-wider uppercase font-mono whitespace-nowrap">
                  Mehrauli, New Delhi
                </span>
                <span className="text-slate-300 hidden 2xl:inline">•</span>
                <span className="text-[11px] text-slate-500 font-semibold tracking-wide hidden 2xl:inline whitespace-nowrap">
                  CBSE Class X
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="flex items-center gap-0.5 xl:gap-1 2xl:gap-2 shrink-0">
            
            {/* 1. About Us Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('about')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`whitespace-nowrap flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                  activeDropdown === 'about' || pathname.startsWith('/about') || pathname.startsWith('/mandatory-disclosure')
                    ? 'text-[#09182d] font-bold bg-slate-100/80'
                    : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
                }`}
                onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                aria-expanded={activeDropdown === 'about'}
              >
                <span>About Us</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180 text-[#e2a02b]' : ''}`} />
              </button>

              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 w-[min(740px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-4 before:content-['']">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xl grid grid-cols-12 gap-6">
                    
                    {/* Left Column: Core About Pages */}
                    <div className="col-span-5 space-y-1.5 border-r border-slate-100 pr-4">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#e2a02b] block mb-2 font-mono">
                        Our Institution
                      </span>
                      {[
                        { title: 'Our Story', desc: '30+ Years of holistic pedagogy', url: '/about#our-story' },
                        { title: 'Mission & Vision', desc: 'Values, discipline & character', url: '/about#mission-vision' },
                        { title: 'Leadership Message', desc: 'Words from Chairman & Principal', url: '/about#leadership' },
                        { title: 'Awards & Recognition', desc: 'Academic & sports laurels', url: '/about#awards' },
                      ].map((item, i) => (
                        <Link
                          key={i}
                          href={item.url}
                          className="p-2 rounded-xl hover:bg-slate-50 block transition-colors group"
                        >
                          <div className="text-sm font-bold text-slate-800 group-hover:text-[#09182d] whitespace-nowrap">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">{item.desc}</div>
                        </Link>
                      ))}

                      <div className="pt-2">
                        <Link
                          href="/mandatory-disclosure"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-[#09182d] border border-amber-200/80 font-bold text-xs sm:text-sm hover:bg-amber-100/60 transition-all whitespace-nowrap"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#e2a02b]" />
                            Mandatory Disclosure Hub
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: 14 Mandatory Disclosure Statutory Documents */}
                    <div className="col-span-7 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#09182d] block font-mono">
                          CBSE Mandatory Disclosure
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          14 Statutory Items
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 max-h-[270px] overflow-y-auto pr-1">
                        {mandatoryDocuments.map((doc, idx) => (
                          <Link
                            key={idx}
                            href={`/mandatory-disclosure#${doc.slug}`}
                            title={doc.name}
                            className="p-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-[#09182d] transition-colors flex items-center gap-1.5 group leading-snug whitespace-nowrap"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e2a02b] group-hover:scale-125 transition-transform shrink-0" />
                            <span className="truncate">{doc.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* 2. Academics Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('academics')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`whitespace-nowrap flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                  activeDropdown === 'academics' || pathname === '/academics'
                    ? 'text-[#09182d] font-bold bg-slate-100/80'
                    : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
                }`}
                onClick={() => setActiveDropdown(activeDropdown === 'academics' ? null : 'academics')}
                aria-expanded={activeDropdown === 'academics'}
              >
                <span>Academics</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'academics' ? 'rotate-180 text-[#e2a02b]' : ''}`} />
              </button>

              {activeDropdown === 'academics' && (
                <div className="absolute top-full left-0 w-[min(440px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-4 before:content-['']">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xl space-y-3.5">
                    
                    {/* Foundational Years */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <span className="text-xs sm:text-sm font-bold text-[#09182d] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#e2a02b]" />
                        Foundational Years
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { name: 'Pre-Primary', link: '/academics#pre-primary' },
                          { name: 'Grades I & II', link: '/academics#grades-1-2' },
                          { name: 'Preparatory Stage', link: '/academics#preparatory' },
                        ].map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            href={sub.link}
                            className="text-xs text-center py-2 px-1 rounded-lg bg-white hover:bg-[#e2a02b]/15 text-slate-800 hover:text-[#09182d] font-semibold border border-slate-200/80 transition-all whitespace-nowrap"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Middle School & Senior School */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        href="/academics#middle-school"
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#09182d]/30 hover:bg-slate-50 transition-all group"
                      >
                        <span className="text-sm font-bold text-[#09182d] group-hover:text-[#e2a02b] block whitespace-nowrap">
                          Middle School
                        </span>
                        <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                          Grades VI to VIII • Experiential STEM &amp; Languages
                        </span>
                      </Link>

                      <Link
                        href="/academics#secondary-school"
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#e2a02b]/40 hover:bg-slate-50 transition-all group"
                      >
                        <span className="text-sm font-bold text-[#09182d] group-hover:text-[#e2a02b] block whitespace-nowrap">
                          Secondary School
                        </span>
                        <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                          Classes IX &amp; X • 100% CBSE Board Results
                        </span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">CBSE Affiliated Secondary (Pre-School to Class X)</span>
                      <Link href="/academics" className="font-bold text-[#09182d] hover:text-[#e2a02b] flex items-center gap-1 whitespace-nowrap">
                        <span>Explore All</span>
                        <span>→</span>
                      </Link>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* 3. Beyond Academics Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('beyond')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`whitespace-nowrap flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                  activeDropdown === 'beyond' || pathname === '/beyond-academics'
                    ? 'text-[#09182d] font-bold bg-slate-100/80'
                    : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
                }`}
                onClick={() => setActiveDropdown(activeDropdown === 'beyond' ? null : 'beyond')}
                aria-expanded={activeDropdown === 'beyond'}
              >
                <span>Beyond Academics</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'beyond' ? 'rotate-180 text-[#e2a02b]' : ''}`} />
              </button>

              {activeDropdown === 'beyond' && (
                <div className="absolute top-full left-0 w-[min(420px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-4 before:content-['']">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#e2a02b] block px-2.5 py-1 font-mono">
                      Co-Curricular &amp; Stages
                    </span>
                    {[
                      { title: 'Beyond Academics – Pre-Primary', sub: 'Sensory games, story enactments & rhythm', url: '/beyond-academics#pre-primary' },
                      { title: 'Beyond Academics – Grades I & II', sub: 'Art, clay craft, junior gymnastics & song', url: '/beyond-academics#grades-1-2' },
                      { title: 'Beyond Academics – Preparatory Stage', sub: 'Quizzes, dramatics, yoga & sports clinics', url: '/beyond-academics#preparatory' },
                      { title: 'Beyond Academics – Middle & Senior School', sub: 'Debates, MUN, tournaments, acting & dance', url: '/beyond-academics#middle-senior' },
                    ].map((item, bIdx) => (
                      <Link
                        key={bIdx}
                        href={item.url}
                        className="p-2.5 rounded-xl hover:bg-slate-50 block transition-colors group"
                      >
                        <div className="text-sm font-bold text-slate-800 group-hover:text-[#09182d] whitespace-nowrap">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">{item.sub}</div>
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-slate-100 px-2.5">
                      <Link href="/beyond-academics" className="text-xs sm:text-sm font-bold text-[#09182d] hover:text-[#e2a02b] flex items-center justify-between whitespace-nowrap">
                        <span>All Co-Curricular &amp; Sports</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Infrastructure Dropdown (No Mega badge) */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('infra')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`whitespace-nowrap flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                  activeDropdown === 'infra' || pathname === '/facilities'
                    ? 'text-[#09182d] font-bold bg-slate-100/80'
                    : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
                }`}
                onClick={() => setActiveDropdown(activeDropdown === 'infra' ? null : 'infra')}
                aria-expanded={activeDropdown === 'infra'}
              >
                <span>Infrastructure</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'infra' ? 'rotate-180 text-[#e2a02b]' : ''}`} />
              </button>

              {activeDropdown === 'infra' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[min(920px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-4 before:content-['']">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl grid grid-cols-12 gap-6">
                    
                    {/* Column 1: Learning Spaces (7 items) */}
                    <div className="col-span-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#09182d] uppercase tracking-wider font-mono">
                        <BookOpen className="w-3.5 h-3.5 text-[#e2a02b]" />
                        Learning Spaces
                      </div>
                      <ul className="space-y-1">
                        {[
                          'Student Friendly Furniture',
                          'Class Library',
                          'Computer Lab',
                          'Chemistry Lab',
                          'Physics Lab',
                          'Biology Lab',
                          'Library',
                        ].map((sp, idx) => (
                          <li key={idx}>
                            <Link
                              href={`/facilities#${sp.toLowerCase().replace(/\s+/g, '-')}`}
                              className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#09182d] hover:bg-slate-50 flex items-center gap-2 group transition-colors whitespace-nowrap"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#e2a02b] transition-colors" />
                              <span>{sp}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 2: Sports Infrastructure (7 items) */}
                    <div className="col-span-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#09182d] uppercase tracking-wider font-mono">
                        <Trophy className="w-3.5 h-3.5 text-[#e2a02b]" />
                        Sports Infrastructure
                      </div>
                      <ul className="space-y-1">
                        {[
                          'Football',
                          'Basketball',
                          'Cricket',
                          'Swimming Pool',
                          'Shooting Range',
                          'Table Tennis',
                          'Skating',
                        ].map((sp, idx) => (
                          <li key={idx}>
                            <Link
                              href={`/facilities#${sp.toLowerCase().replace(/\s+/g, '-')}`}
                              className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#09182d] hover:bg-slate-50 flex items-center gap-2 group transition-colors whitespace-nowrap"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#e2a02b] transition-colors" />
                              <span>{sp}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 3: Campus Facilities & Safety + Highlight Card */}
                    <div className="col-span-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#09182d] uppercase tracking-wider font-mono">
                          <Building2 className="w-3.5 h-3.5 text-[#e2a02b]" />
                          Campus &amp; Safety
                        </div>
                        <ul className="space-y-1">
                          {[
                            'Auditorium',
                            'Safety & Transport',
                            'CCTV & Security',
                            'Medical Facilities',
                            'Transport System',
                          ].map((cf, idx) => (
                            <li key={idx}>
                              <Link
                                href={`/facilities#${cf.toLowerCase().replace(/[\s&]+/g, '-')}`}
                                className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#09182d] hover:bg-slate-50 flex items-center gap-2 group transition-colors whitespace-nowrap"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#e2a02b] transition-colors" />
                                <span>{cf}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Featured Highlight: Day Scholar & Boarding */}
                      <div className="p-3.5 rounded-xl bg-[#09182d] text-white space-y-2 shadow-md">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-[#e2a02b]" />
                          <span className="text-xs sm:text-sm font-bold text-[#e2a02b] whitespace-nowrap">Hostel &amp; Dining</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">
                          Modern dormitories with attached baths &amp; hygienic cafeteria.
                        </p>
                        <Link
                          href="/facilities"
                          className="inline-block text-xs font-bold text-[#e2a02b] hover:underline pt-1 whitespace-nowrap"
                        >
                          View Campus Tour →
                        </Link>
                      </div>

                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* 5. Admissions Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('admissions')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`whitespace-nowrap flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                  activeDropdown === 'admissions' || pathname === '/admissions'
                    ? 'text-[#09182d] font-bold bg-slate-100/80'
                    : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
                }`}
                onClick={() => setActiveDropdown(activeDropdown === 'admissions' ? null : 'admissions')}
                aria-expanded={activeDropdown === 'admissions'}
              >
                <span>Admissions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'admissions' ? 'rotate-180 text-[#e2a02b]' : ''}`} />
              </button>

              {activeDropdown === 'admissions' && (
                <div className="absolute top-full left-0 w-[min(280px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-4 before:content-['']">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#e2a02b] block px-2 py-0.5 font-mono">
                      Admissions 2026-27
                    </span>
                    {[
                      { title: 'Admission Process', url: '/admissions#process' },
                      { title: 'Eligibility Criteria', url: '/admissions#criteria' },
                      { title: 'Fee Structure', url: '/admissions#fees' },
                      { title: 'Online Registration', url: '/admissions#register' },
                    ].map((item, aIdx) => (
                      <Link
                        key={aIdx}
                        href={item.url}
                        className="p-2 rounded-xl hover:bg-slate-50 block text-sm font-bold text-slate-800 hover:text-[#09182d] transition-colors whitespace-nowrap"
                      >
                        {item.title}
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-slate-100">
                      <Link
                        href="/admissions"
                        className="w-full text-center py-2.5 px-3 rounded-xl bg-[#e2a02b] hover:bg-[#d99b26] text-[#09182d] font-bold text-xs sm:text-sm block transition-all whitespace-nowrap shadow-xs"
                      >
                        Apply Online Now →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Gallery & Media Direct Link */}
            <Link
              href="/gallery"
              className={`whitespace-nowrap px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                pathname === '/gallery'
                  ? 'text-[#09182d] font-bold bg-slate-100/80'
                  : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
              }`}
            >
              Gallery &amp; Media
            </Link>

            {/* 7. News & Events Direct Link */}
            <Link
              href="/notices"
              className={`whitespace-nowrap px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                pathname === '/notices'
                  ? 'text-[#09182d] font-bold bg-slate-100/80'
                  : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
              }`}
            >
              News &amp; Events
            </Link>

            {/* 8. Contact Direct Link */}
            <Link
              href="/contact"
              className={`whitespace-nowrap px-2.5 xl:px-3 2xl:px-3.5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] font-bold rounded-lg transition-colors ${
                pathname === '/contact'
                  ? 'text-[#09182d] font-bold bg-slate-100/80'
                  : 'text-slate-700 hover:text-[#09182d] hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>

          </nav>

          {/* Action CTA: Apply Now (Placed directly to the right of navigation items) */}
          <div className="shrink-0 ml-1 xl:ml-2">
            <Link
              href="/admissions"
              className="whitespace-nowrap inline-flex items-center gap-2 px-3.5 xl:px-4 2xl:px-5 py-2 xl:py-2.5 rounded-full bg-[#e2a02b] hover:bg-[#d99b26] text-[#09182d] font-bold text-xs xl:text-sm tracking-wide shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation with Accordions */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 sm:px-6 py-5 space-y-3 max-h-[85vh] overflow-y-auto overflow-x-hidden w-full max-w-full animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          
          {/* Quick Apply Button on top of mobile menu */}
          <div className="pb-2">
            <Link
              href="/admissions"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e2a02b] text-[#09182d] font-bold text-sm shadow-sm whitespace-nowrap"
            >
              <span>Apply Online 2026-27</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          {/* Mobile: About Us Accordion */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleMobileSection('about')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 text-xs font-bold text-slate-900"
            >
              <span>About Us</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded.about ? 'rotate-180 text-[#e2a02b]' : ''}`} />
            </button>
            {mobileExpanded.about && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-100 text-xs">
                <Link href="/about#our-story" className="block py-1 hover:text-[#09182d]">Our Story</Link>
                <Link href="/about#mission-vision" className="block py-1 hover:text-[#09182d]">Mission &amp; Vision</Link>
                <Link href="/about#leadership" className="block py-1 hover:text-[#09182d]">Leadership Message</Link>
                <Link href="/about#awards" className="block py-1 hover:text-[#09182d]">Awards &amp; Recognition</Link>
                
                {/* Nested Mandatory Disclosure */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleMobileSection('disclosure')}
                    className="w-full flex items-center justify-between py-1 text-xs font-bold text-[#09182d]"
                  >
                    <span className="flex items-center gap-1.5 text-[#e2a02b]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Mandatory Disclosure (14 Items)
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileExpanded.disclosure ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileExpanded.disclosure && (
                    <div className="pl-2 pt-1.5 space-y-1.5 text-xs sm:text-sm text-slate-600 border-l-2 border-amber-200 ml-1">
                      {mandatoryDocuments.map((doc, idx) => (
                        <Link 
                          key={idx} 
                          href={`/mandatory-disclosure#${doc.slug}`}
                          className="block py-1 pl-2 hover:text-[#09182d] font-medium"
                        >
                          • {doc.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Academics Accordion */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleMobileSection('academics')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 text-xs font-bold text-slate-900"
            >
              <span>Academics</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded.academics ? 'rotate-180 text-[#e2a02b]' : ''}`} />
            </button>
            {mobileExpanded.academics && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-100 text-xs">
                <div className="font-bold text-[#e2a02b]">Foundational Years</div>
                <div className="pl-2 space-y-1 text-slate-600">
                  <Link href="/academics#pre-primary" className="block hover:text-[#09182d]">• Pre-Primary</Link>
                  <Link href="/academics#grades-1-2" className="block hover:text-[#09182d]">• Grades I &amp; II</Link>
                  <Link href="/academics#preparatory" className="block hover:text-[#09182d]">• Preparatory Stage</Link>
                </div>
                <Link href="/academics#middle-school" className="block py-1 hover:text-[#09182d] font-bold text-slate-900">Middle School (Classes VI – VIII)</Link>
                <Link href="/academics#secondary-school" className="block py-1 hover:text-[#09182d] font-bold text-slate-900">Secondary School (Classes IX &amp; X)</Link>
              </div>
            )}
          </div>

          {/* Mobile: Beyond Academics Accordion */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleMobileSection('beyond')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 text-xs font-bold text-slate-900"
            >
              <span>Beyond Academics</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded.beyond ? 'rotate-180 text-[#e2a02b]' : ''}`} />
            </button>
            {mobileExpanded.beyond && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-100 text-xs">
                <Link href="/beyond-academics#pre-primary" className="block py-1 hover:text-[#09182d]">Beyond Academics – Pre-Primary</Link>
                <Link href="/beyond-academics#grades-1-2" className="block py-1 hover:text-[#09182d]">Beyond Academics – Grades I &amp; II</Link>
                <Link href="/beyond-academics#preparatory" className="block py-1 hover:text-[#09182d]">Beyond Academics – Preparatory Stage</Link>
                <Link href="/beyond-academics#middle-senior" className="block py-1 hover:text-[#09182d]">Beyond Academics – Middle &amp; Senior School</Link>
              </div>
            )}
          </div>

          {/* Mobile: Infrastructure Accordion */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleMobileSection('infra')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 text-xs font-bold text-slate-900"
            >
              <span>Infrastructure</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded.infra ? 'rotate-180 text-[#e2a02b]' : ''}`} />
            </button>
            {mobileExpanded.infra && (
              <div className="p-3 bg-white space-y-3 border-t border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-[#09182d] mb-1">Learning Spaces</h4>
                  <div className="pl-2 space-y-1 text-slate-600">
                    <Link href="/facilities#student-friendly-furniture" className="block">• Student Friendly Furniture</Link>
                    <Link href="/facilities#class-library" className="block">• Class Library</Link>
                    <Link href="/facilities#computer-lab" className="block">• Computer Lab</Link>
                    <Link href="/facilities#chemistry-lab" className="block">• Chemistry Lab</Link>
                    <Link href="/facilities#physics-lab" className="block">• Physics Lab</Link>
                    <Link href="/facilities#biology-lab" className="block">• Biology Lab</Link>
                    <Link href="/facilities#library" className="block">• Library</Link>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#09182d] mb-1">Sports Infrastructure</h4>
                  <div className="pl-2 space-y-1 text-slate-600">
                    <Link href="/facilities#football" className="block">• Football</Link>
                    <Link href="/facilities#basketball" className="block">• Basketball</Link>
                    <Link href="/facilities#cricket" className="block">• Cricket</Link>
                    <Link href="/facilities#swimming-pool" className="block">• Swimming Pool</Link>
                    <Link href="/facilities#shooting-range" className="block">• Shooting Range</Link>
                    <Link href="/facilities#table-tennis" className="block">• Table Tennis</Link>
                    <Link href="/facilities#skating" className="block">• Skating</Link>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#09182d] mb-1">Campus Facilities &amp; Safety</h4>
                  <div className="pl-2 space-y-1 text-slate-600">
                    <Link href="/facilities#auditorium" className="block">• Auditorium</Link>
                    <Link href="/facilities#safety-transport" className="block">• Safety &amp; Transport</Link>
                    <Link href="/facilities#cctv-security" className="block">• CCTV &amp; Security</Link>
                    <Link href="/facilities#medical-facilities" className="block">• Medical Facilities</Link>
                    <Link href="/facilities#transport-system" className="block">• Transport System</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Admissions Accordion */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleMobileSection('admissions')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 text-xs font-bold text-slate-900"
            >
              <span>Admissions</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded.admissions ? 'rotate-180 text-[#e2a02b]' : ''}`} />
            </button>
            {mobileExpanded.admissions && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-100 text-xs">
                <Link href="/admissions#process" className="block py-1 hover:text-[#09182d]">Admission Process</Link>
                <Link href="/admissions#criteria" className="block py-1 hover:text-[#09182d]">Eligibility &amp; Criteria</Link>
                <Link href="/admissions#fees" className="block py-1 hover:text-[#09182d]">Fee Structure</Link>
                <Link href="/admissions#register" className="block py-1 hover:text-[#09182d] font-bold text-[#e2a02b]">Apply Online Form</Link>
              </div>
            )}
          </div>

          {/* Direct Mobile Links */}
          <Link
            href="/gallery"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-50"
          >
            <span>Gallery &amp; Media</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/notices"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-50"
          >
            <span>News &amp; Events</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-50"
          >
            <span>Contact Us</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

        </div>
      )}
    </header>
  );
}
