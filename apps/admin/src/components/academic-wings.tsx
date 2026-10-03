import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AcademicWings() {
  const academicStages = [
    {
      title: 'Pre-Primary & Primary (Pre-School – V)',
      badge: 'Foundational & Primary',
      badgeColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
      description:
        'Shapes, colours, rhymes, motor skills, English, Hindi, Maths, EVS, GK, Value Education, Art, Craft, Music, Dance and Physical Education.',
      imageUrl:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
      url: '/academics#foundational',
    },
    {
      title: 'Middle School (Classes VI – VIII)',
      badge: 'Middle Stage',
      badgeColor: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
      description:
        'English, Hindi, Maths, Social Studies, Integrated Science, General Knowledge, French & Sanskrit, Value Education, Computer Education & Sports.',
      imageUrl:
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      url: '/academics#middle-school',
    },
    {
      title: 'Secondary School (Classes IX & X)',
      badge: '100% CBSE Class X Result',
      badgeColor: 'bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]',
      description:
        'Intensive preparation for C.B.S.E. Class X Board Examination. Only school in the area with 100% pass result, computer labs & moral guidance.',
      imageUrl:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      url: '/academics#secondary-school',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Heading, intro & button (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e2a02b] font-mono">
              Our Academics
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#09182d] tracking-tight leading-snug font-sans">
              Learning for Life
            </h2>
          </div>

          <p className="text-slate-600 text-base sm:text-[17px] leading-relaxed">
            Rooted in Indian culture and values, our C.B.S.E. curriculum spans Pre-School to Class X (April to March in two terms). As the only school in the Mehrauli area achieving a 100% C.B.S.E. Class X result, we ensure education is more than books and exams—it is a way of life.
          </p>

          <div>
            <Link
              href="/academics"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#09182d] hover:bg-[#162a45] text-white font-bold text-sm tracking-wide shadow-md shadow-slate-900/10 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Academics</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Right Column: 3 Stage Cards (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {academicStages.map((stage, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stage.imageUrl}
                  alt={stage.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${stage.badgeColor}`}
                  >
                    {stage.badge}
                  </span>
                  <h3 className="text-lg font-bold text-[#09182d] group-hover:text-[#e2a02b] transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {stage.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={stage.url}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#09182d] group-hover:text-[#e2a02b] transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
