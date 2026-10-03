'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Calendar, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Camera,
  Quote
} from 'lucide-react';

export function CampusHighlightsRow() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Priya Sharma',
      relation: 'Parent – Grade 5',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      badge: 'Day Scholar Parent',
      quote:
        'The boarding facility and dedicated teachers at Prince Public School have transformed our child into a confident, disciplined, and curious learner. The nutritious food and safe campus give us complete peace of mind.',
    },
    {
      name: 'Rajesh Verma',
      relation: 'Parent – Grade 9 (Hosteller)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      badge: 'Hostel Resident Parent',
      quote:
        'The supervised evening prep and individual teacher guidance make all the difference. Our son has excelled in both CBSE academics and athletics under their caring mentorship.',
    },
    {
      name: 'Ananya Deshmukh',
      relation: 'Alumna – Batch of 2024 (IIT Delhi)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: 'Distinguished Alumna',
      quote:
        'Prince Public School instilled in me the grit, intellectual curiosity, and moral integrity that helped me crack JEE Advanced. Truly a school that builds bright futures.',
    },
  ];

  const newsEvents = [
    {
      month: 'APR',
      day: '15',
      category: 'Sports & Athletics',
      title: 'Annual Sports Meet & Athletic Championship',
      desc: 'Inter-house track events, basketball finals, and trophy ceremony.',
    },
    {
      month: 'FEB',
      day: '05',
      category: 'STEM & Robotics',
      title: 'Science & Robotics Exhibition 2026',
      desc: 'Student AI prototypes, working models, and experiential science display.',
    },
    {
      month: 'JAN',
      day: '28',
      category: 'Literary & Cultural',
      title: 'Inter-School Debate & Sanskrit Recitation',
      desc: 'Oratorical competition exploring national heritage and modern ethics.',
    },
  ];

  const galleryImages = [
    {
      src: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
      label: 'Ek Ped Maa Ke Naam',
    },
    {
      src: '/images/pps-building-facade.webp',
      label: 'Campus Facade',
    },
    {
      src: '/images/hero/slide-2-stem.jpg',
      label: 'STEM & Robotics',
    },
    {
      src: '/images/hero/slide-3-sports.jpg',
      label: 'Sports Arena',
    },
  ];

  const currentTestimonial = testimonials[activeTestimonial];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e2a02b] font-mono inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e2a02b]" />
            Campus Life &amp; Community
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09182d] tracking-tight font-sans">
            Life, Events &amp; Voices at Prince Public School
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Capturing campus memories, upcoming academic competitions, and verified impressions from our school families.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Block 1: Our Gallery (Left - 4 cols, Deep Navy Premium Card) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#09182d] via-[#0e223d] to-[#09182d] rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-lg shadow-[#09182d]/10 border border-slate-800/80 space-y-6 relative overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e2a02b]" />
                <h3 className="text-xl sm:text-2xl font-black font-sans tracking-tight">
                  Our Gallery
                </h3>
              </div>
              <Link
                href="/gallery"
                className="text-xs sm:text-sm text-[#e2a02b] hover:text-[#f1b343] font-bold flex items-center gap-1 transition-colors group/link"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Capturing vibrant moments of joy, sportsmanship, and student discoveries on campus.
            </p>
          </div>

          {/* 4-Image Grid with authentic school assets */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            {galleryImages.map((img, i) => (
              <div 
                key={i} 
                className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 relative group/img border border-white/10 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover/img:opacity-100 transition-opacity" />
                <span className="absolute bottom-2 left-2.5 right-2.5 text-[11px] font-bold text-white tracking-wide truncate">
                  {img.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 pt-1">
            <Link
              href="/gallery"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-[#e2a02b] hover:text-[#09182d] text-white border border-white/20 text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <Camera className="w-4 h-4 text-[#e2a02b] group-hover:text-[#09182d] transition-colors" />
              <span>Explore Photo Gallery</span>
            </Link>
          </div>
        </div>

        {/* Block 2: Latest News & Events (Center - 4 cols, Refined White Card) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xl font-black text-[#09182d] font-sans tracking-tight">
                Latest News &amp; Events
              </h3>
            </div>
            <Link
              href="/notices"
              className="text-xs sm:text-sm text-[#09182d] hover:text-[#e2a02b] font-bold flex items-center gap-1 transition-colors group/link"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {newsEvents.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3.5 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                {/* Calendar Date Block */}
                <div className="w-13 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col items-center justify-center shrink-0 text-center py-1 group-hover:border-amber-400 group-hover:bg-amber-100/60 transition-all shadow-xs">
                  <span className="text-[11px] font-black uppercase text-amber-700 font-mono leading-none">
                    {item.month}
                  </span>
                  <span className="text-lg font-black text-[#09182d] font-sans leading-tight mt-0.5">
                    {item.day}
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#09182d] group-hover:text-[#e2a02b] transition-colors leading-snug line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/notices"
              className="text-xs sm:text-sm font-bold text-[#09182d] hover:text-[#e2a02b] flex items-center justify-between transition-colors group/bot"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                Check CBSE Circulars &amp; Calendar
              </span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform group-hover/bot:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Block 3: WHAT PARENTS SAY / Trusted by Families (Right - 4 cols, Warm Editorial Card) */}
        <div className="lg:col-span-4 bg-[#fcfdfd] rounded-3xl p-6 sm:p-7 border border-slate-200/90 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-5 relative overflow-hidden">
          {/* Subtle quote watermark */}
          <Quote className="w-20 h-20 text-[#e2a02b]/8 absolute -top-2 -right-2 stroke-1 pointer-events-none" />

          {/* Top Rating Header */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e2a02b] font-mono inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2a02b]" />
                What Parents Say
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                Verified Feedback
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#09182d] font-sans tracking-tight">
                Trusted by Families
              </h3>
              {/* 5 Stars Rating */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-[#e2a02b] fill-[#e2a02b]" />
                ))}
              </div>
            </div>
          </div>

          {/* Quote Body */}
          <div className="flex-1 flex flex-col justify-center relative z-10 py-1">
            <div className="mb-2">
              <Quote className="w-6 h-6 text-[#e2a02b] fill-[#e2a02b]/20" />
            </div>
            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed italic">
              &ldquo;{currentTestimonial.quote}&rdquo;
            </p>
          </div>

          {/* Author info & Carousel controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 relative z-10">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50 shadow-xs"
              />
              <div>
                <div className="text-sm font-black text-[#09182d] font-sans">
                  {currentTestimonial.name}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {currentTestimonial.relation}
                </div>
              </div>
            </div>

            {/* Carousel Navigation with Dots */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-1">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === activeTestimonial ? 'w-4 bg-[#e2a02b]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`View testimonial ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
                className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextTestimonial}
                aria-label="Next testimonial"
                className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
