import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FacilitiesGrid() {
  const facilities = [
    {
      title: 'Smart Classrooms',
      description:
        'Digitally enabled classrooms with interactive flat panels, multimedia content, and ergonomic student furniture.',
      imageUrl:
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
      url: '/facilities#learning-spaces',
    },
    {
      title: 'Science & Computer Labs',
      description:
        'State-of-the-art Physics, Chemistry, Biology, and modern AI/Computer workstations for practical hands-on discovery.',
      imageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
      url: '/facilities#learning-spaces',
    },
    {
      title: 'Library & Reading Bay',
      description:
        'Over 10,000 volumes, international periodicals, and digital research archives in a calm, modern environment.',
      imageUrl:
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
      url: '/facilities#library',
    },
    {
      title: 'Sports & Recreation',
      description:
        'Age-appropriate playgrounds, football turf, basketball court, swimming pool, shooting range & table tennis.',
      imageUrl:
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
      url: '/facilities#sports-infrastructure',
    },
    {
      title: 'Boarding & Dormitories',
      description:
        'Modern 2, 3 & 4-seater dorms with attached baths, 24h hot water, multi-cuisine dining & round-the-clock security.',
      imageUrl:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      url: '/facilities#hostel-boarding',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* Header with Title on Left and Button on Right */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
            World-Class Facilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#09182d] tracking-tight font-sans">
            More Than Just Classrooms
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            State-of-the-art infrastructure designed to foster intellectual, athletic, and creative growth across academics, sports, and boarding life.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/facilities"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#09182d] hover:bg-[#162a45] text-white font-bold text-sm tracking-wide shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>View All Facilities</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* 5 Facility Cards in Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {facilities.map((facility, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            <div className="aspect-[16/11] overflow-hidden relative bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={facility.imageUrl}
                alt={facility.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <h3 className="text-base font-bold text-[#09182d] group-hover:text-[#e2a02b] transition-colors leading-snug">
                {facility.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {facility.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
