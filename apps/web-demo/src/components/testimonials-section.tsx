import React from 'react';
import { Quote, Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'Enrolling our daughter in Prince Public School was the best decision we made. The individual teacher attention, the modern STEM robotics lab, and the values-centered guidance have helped her blossom into a confident, curious scholar.',
      author: 'Sunita & Vikram Mehra',
      role: 'Parents of Rhea Mehra (Class VIII)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      quote:
        'The foundation I received at PPS in analytical thinking, debate, and scientific rigor prepared me thoroughly for IIT Delhi and later my master’s at Stanford. The mentors here don’t just teach; they believe in you.',
      author: 'Dr. Kabir Tandon',
      role: 'Alumnus (Batch of 2017) • AI Researcher',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      quote:
        'From our 400m athletic track to the robotics lab and inter-house debates, Prince Public School gives us every platform to shine. Being Head Girl has taught me true leadership, empathy, and resilience.',
      author: 'Diya Kapoor',
      role: 'Head Girl (Class X • CBSE Scholar)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
          Voices of Our Community
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight font-sans">
          What Parents, Alumni & Scholars Say
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          The heartfelt experiences and journeys of those who have walked the halls of Prince Public School.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-8 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-6 hover:border-slate-300 hover:shadow-lg transition-all shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>

              <blockquote className="text-slate-700 text-base leading-relaxed">
                “{t.quote}”
              </blockquote>
            </div>

            <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt={t.author}
                className="w-12 h-12 rounded-full object-cover border border-amber-500/40 shadow-xs"
              />
              <div>
                <h4 className="font-bold text-base text-slate-900">{t.author}</h4>
                <p className="text-xs sm:text-sm text-amber-700 font-medium">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
