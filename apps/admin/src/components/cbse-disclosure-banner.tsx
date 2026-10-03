'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle, 
  ExternalLink, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export function CbseDisclosureBanner() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const documents = [
    { id: 1, title: 'CBSE Circular', code: 'CBSE/HQ/2026', size: '345 KB', category: 'governance' },
    { id: 2, title: 'General School Details', code: 'PPS-GEN-01', size: '210 KB', category: 'governance' },
    { id: 3, title: 'CBSE Affiliation Letter', code: 'CBSE/AFF/2130842', size: '512 KB', category: 'affiliation' },
    { id: 4, title: 'Upgradation Letter', code: 'CBSE/UPG/1999', size: '420 KB', category: 'affiliation' },
    { id: 5, title: 'Results and Academics', code: 'RES-CLASS-X', size: '680 KB', category: 'academics' },
    { id: 6, title: 'School Infrastructure', code: 'INFRA-15ACR', size: '890 KB', category: 'academics' },
    { id: 7, title: 'Staff Details', code: 'STAFF-2026', size: '450 KB', category: 'academics' },
    { id: 8, title: 'Society/ Trust Certificate', code: 'PPS-SOC-1995', size: '315 KB', category: 'governance' },
    { id: 9, title: 'Recognition Certificate under RTE, 2009', code: 'DOE-RTE-2009', size: '290 KB', category: 'affiliation' },
    { id: 10, title: 'Fire Safety Certificate', code: 'DFS-NOC-2026', size: '375 KB', category: 'safety' },
    { id: 11, title: 'Building Safety Certificate', code: 'PWD-STR-2025', size: '410 KB', category: 'safety' },
    { id: 12, title: 'Extension of Affiliation', code: 'CBSE/EXT/2030', size: '460 KB', category: 'affiliation' },
    { id: 13, title: 'NOC issued by the State Government', code: 'DEL-NOC-1995', size: '280 KB', category: 'governance' },
    { id: 14, title: 'Water, Health and Sanitation Certificates', code: 'MCD-SAN-2026', size: '330 KB', category: 'safety' },
  ];

  const categories = [
    { id: 'all', label: 'All Records', count: 14 },
    { id: 'affiliation', label: 'Affiliation & Approvals', count: 4 },
    { id: 'safety', label: 'Safety & Hygiene', count: 3 },
    { id: 'academics', label: 'Academics & Infra', count: 3 },
    { id: 'governance', label: 'Governance & Society', count: 4 },
  ];

  const filteredDocuments = selectedCategory === 'all'
    ? documents
    : documents.filter((doc) => doc.category === selectedCategory);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 310;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="cbse-disclosure" className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden space-y-4">
        
        {/* Top Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#09182d] via-[#e2a02b] to-[#09182d]" />

        {/* Compact Header Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#e2a02b] border border-amber-200/80 text-[11px] font-bold uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e2a02b]" />
                CBSE Regulatory Compliance (Appendix IX)
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                14 Statutory Records
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#09182d] tracking-tight font-sans">
              Mandatory Public Disclosure — 14 Statutory Records
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              In strict accordance with Central Board of Secondary Education (CBSE) mandates, all 14 essential institutional affiliations, safety certifications, and compliance documents are publicly accessible.
            </p>
          </div>

          {/* Right Credentials & Action Link */}
          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-semibold">Affiliation No.</span>
              <span className="text-sm font-mono font-extrabold text-[#e2a02b]">2130842</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-semibold">School Code</span>
              <span className="text-sm font-mono font-extrabold text-[#09182d]">20491</span>
            </div>
            <Link
              href="/mandatory-disclosure"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors group"
            >
              <span>Open Dedicated Mandatory Disclosure Hub</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Categories Bar & Slider Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (scrollRef.current) scrollRef.current.scrollLeft = 0;
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#09182d] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/90 text-slate-600'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Slider Arrows */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">
              Showing {filteredDocuments.length} of 14
            </span>
            <button
              onClick={() => handleScroll('left')}
              aria-label="Scroll previous documents"
              className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Scroll next documents"
              className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Single-Row Horizontal Document Track (Reduced Height) */}
        <div 
          ref={scrollRef}
          className="flex items-stretch gap-3 overflow-x-auto scrollbar-none scroll-smooth pb-1 pt-1 -mx-1 px-1"
        >
          {filteredDocuments.map((doc) => (
            <Link
              key={doc.id}
              href="/mandatory-disclosure"
              className="w-[270px] sm:w-[290px] shrink-0 p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-[#e2a02b]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 group shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="font-bold text-[#09182d] group-hover:text-[#e2a02b] transition-colors">
                    #{doc.id} {doc.code}
                  </span>
                  <span className="text-slate-400 font-medium">{doc.size}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#09182d] transition-colors line-clamp-1 leading-snug">
                  {doc.title}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </span>
                <span className="text-slate-500 group-hover:text-[#e2a02b] font-semibold flex items-center gap-1 transition-colors">
                  View PDF <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
