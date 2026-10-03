import React from 'react';
import type { Metadata } from 'next';
import { SchoolGallery } from '@/components/school-gallery';

export const metadata: Metadata = {
  title: 'School Photo Gallery | Prince Public School',
  description: 'Explore photographs of campus life, tree plantation drives, and student celebrations at Prince Public School.',
};

export default function GalleryPage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-10">
      {/* Clean Light Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white p-8 sm:p-12 text-center space-y-3 shadow-xs">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-mono">
          Campus Life & Visual Archives
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-sans">
          Life & Celebrations at Prince Public School
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Cherished memories, special campus initiatives, and student milestones captured across our campus.
        </p>
      </div>

      {/* Main Gallery Component */}
      <SchoolGallery />
    </div>
  );
}
