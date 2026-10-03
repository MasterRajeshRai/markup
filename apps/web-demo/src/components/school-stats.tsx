import React from 'react';
import { 
  GraduationCap, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

export function SchoolStats() {
  const pillars = [
    {
      title: 'Experienced Faculty',
      description: 'Dedicated and passionate educators',
      icon: GraduationCap,
    },
    {
      title: 'Modern Infrastructure',
      description: 'Safe, smart and future-ready campus',
      icon: Building2,
    },
    {
      title: 'Holistic Development',
      description: 'Academics, sports, arts and values',
      icon: Sparkles,
    },
    {
      title: 'Safe & Supportive',
      description: 'A caring environment for every child',
      icon: ShieldCheck,
    },
    {
      title: 'Global Exposure',
      description: 'Building confident citizens of the world',
      icon: Globe,
    },
  ];

  return (
    <section className="relative z-20 -mt-10 sm:-mt-12 lg:-mt-14 mb-8 sm:mb-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center space-y-2 ${
                  idx !== 0 ? 'pt-4 sm:pt-0 lg:pl-6' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-[#09182d] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#09182d] tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-normal max-w-[220px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
