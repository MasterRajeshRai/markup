import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Monitor, 
  Cpu, 
  FlaskConical, 
  Library, 
  Trophy, 
  Music, 
  Bus, 
  HeartPulse, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Bed,
  Utensils,
  ShieldCheck,
  BookOpen,
  Camera,
  Flame,
  Target
} from 'lucide-react';
import { BoardingHostelSection } from '@/components/boarding-hostel-section';
import { FacilitiesGrid } from '@/components/facilities-grid';

export const metadata: Metadata = {
  title: 'Infrastructure & Campus Facilities | Prince Public School',
  description: 'Explore the modern learning spaces, science & computer labs, sports arenas, 15-acre green campus, boarding dormitories, and multi-cuisine cafeteria at Prince Public School.',
};

export default function FacilitiesPage() {
  const learningSpaces = [
    {
      id: 'student-friendly-furniture',
      title: 'Student Friendly Furniture',
      desc: 'Ergonomically designed, orthopedic-approved modular desks and chairs crafted for correct posture, collaborative cluster work, and dynamic active classroom layouts.',
      points: ['Adjustable heights & lumbar support', 'Rounded child-safe edges & non-toxic materials', 'Modular configurations for group work', 'Integrated bag & water bottle holsters'],
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'class-library',
      title: 'Class Library',
      desc: 'Every classroom features a dedicated age-appropriate reading corner curated with illustrated storybooks, encyclopedias, and science journals to nurture spontaneous reading habits.',
      points: ['Rotating book collections every month', 'Leveled readers for all proficiency stages', 'Comfy reading rugs & beanbags', 'Teacher-assisted book discussions'],
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'computer-lab',
      title: 'Computer Lab & AI Coding Station',
      desc: 'High-speed gigabit fiber connected IT labs equipped with modern workstations, Python, Scratch, and web development IDEs, ensuring every child becomes digitally fluent.',
      points: ['1:1 Student to computer terminal ratio', 'Licensed educational software & AI tools', 'Cyber-safe firewall and teacher monitoring', 'Dual OS workstations (Linux & Windows)'],
      image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'chemistry-lab',
      title: 'Chemistry Lab',
      desc: 'Fully ventilated, fire-retardant chemistry workstation with advanced fume extractors, digital titration equipment, analytical balances, and safety eyewash stations.',
      points: ['NABL standard chemical reagent storage', 'Individual gas burners & pipette stations', 'Comprehensive PPE: Coats, goggles & gloves', 'Strict teacher-technician supervision'],
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'physics-lab',
      title: 'Physics Lab',
      desc: 'Precision optics dark-room benches, mechanics pulleys, sonometers, electrical circuit consoles, and electromagnetic kits for experiential CBSE practical mastery.',
      points: ['Laser optics & spectrometry gear', 'Digital multimeters & oscilloscopes', 'Low-voltage variable power consoles', 'Demonstration benches with smart projection'],
      image: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'biology-lab',
      title: 'Biology Lab',
      desc: 'Binocular oil-immersion compound microscopes, human anatomical 3D models, botanical preservation specimens, and projection digital micro-cameras.',
      points: ['Dissecting & binocular microscopes', 'Permanent histological glass slides', 'Aquaponics & botanical terrace setups', 'High-definition micro-cam projection'],
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'library',
      title: 'Central Knowledge Library',
      desc: 'Air-conditioned digital resource sanctuary housing 25,000+ volumes, international periodicals, reference encyclopedias, quiet reading nooks, and DELNET digital access.',
      points: ['25,000+ Physical books & journals', 'DELNET & National Digital Library kiosks', 'Dedicated researcher silent zone', 'Automated RFID checkout & cataloging'],
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const sportsInfra = [
    {
      id: 'football',
      title: 'Football Ground',
      desc: 'FIFA-standard natural Bermuda grass pitch with floodlights, automated sprinkler irrigation, and certified coach-led tactical drills.',
      coach: 'Licensed AIFF Coaches',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'basketball',
      title: 'Basketball Courts',
      desc: 'Two international-standard acrylic synthetic courts with hydraulic breakaway hoops and high-intensity LED night lighting.',
      coach: 'State Championship Mentors',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cricket',
      title: 'Cricket Academy & Practice Nets',
      desc: 'Full-size cricket oval with four turf pitches and two automated bowling machine practice enclosures.',
      coach: 'BCCI Level 1 Faculty',
      image: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'swimming-pool',
      title: 'Semi-Olympic Swimming Pool',
      desc: '25-meter temperature-controlled 6-lane swimming pool with certified lifeguards, ozone purification, and separate toddler splash pool.',
      coach: 'Swimming Federation Certified',
      image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'shooting-range',
      title: 'Shooting Range (10m Air Rifle & Pistol)',
      desc: 'Indoor computerized 10-meter shooting arena equipped with electronic target scoring systems, spotting scopes, and Olympic safety compliance.',
      coach: 'National Medallist Instructors',
      image: 'https://images.unsplash.com/photo-1584281722572-88849551c6c5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'table-tennis',
      title: 'Table Tennis Indoor Arena',
      desc: 'Six Stag international tournament tables housed in air-conditioned wooden-floored stadium with robot multi-ball practice servers.',
      coach: 'National Ranked Coaches',
      image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'skating',
      title: 'Roller Skating Rink',
      desc: 'High-speed synthetic banked speed skating rink with protective perimeter railings for speed, artistic, and quad skating.',
      coach: 'Skating Federation Faculty',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const campusSafety = [
    {
      id: 'auditorium',
      title: 'Centrally Air-Conditioned Auditorium',
      desc: '1,200-capacity acoustic amphitheatre equipped with professional stage rigging, Dolby surround sound, green rooms, and motorised projection screens.',
      icon: Sparkles,
    },
    {
      id: 'safety-transport',
      title: 'Safety & Transport Fleet',
      desc: 'GPS-tracked, speed-governed air-conditioned school bus fleet covering all sectors of Delhi NCR with verified lady attendants and emergency SOS.',
      icon: Bus,
    },
    {
      id: 'cctv-security',
      title: '24/7 CCTV & Security Surveillance',
      desc: 'Over 300 high-definition cameras monitoring all hallways, playgrounds, hostel gates, and perimeters linked to a round-the-clock command post.',
      icon: Camera,
    },
    {
      id: 'medical-facilities',
      title: 'Medical Inspection (MI) Clinic',
      desc: 'Full-time resident MBBS doctor, trained nursing staff, 4 observation beds, emergency oxygen, and tie-up with premier multi-speciality hospitals.',
      icon: HeartPulse,
    },
    {
      id: 'transport-system',
      title: 'RFID Integrated Transport System',
      desc: 'Live parent bus tracking application with automated boarding/deboarding SMS alerts, geofencing, and panic alarm buttons.',
      icon: Bus,
    },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
            15-Acre Eco-Friendly Green Campus
          </span>
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tiger_orange-500/20 text-tiger_orange-600 border border-tiger_orange-500/30">
            Day Scholar + Boarding Institute
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans">
          World-Class Infrastructure Built for Future Leaders
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          From ergonomic smart classrooms and advanced STEM science laboratories to Olympic sports courts, separate hostel dormitories with attached baths, and a multi-cuisine cafeteria.
        </p>
      </div>

      {/* 1. LEARNING SPACES (Mega Menu Group 1) */}
      <div id="learning-spaces" className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Infrastructure Category 01
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Learning Spaces & Specialized Laboratories
          </h2>
          <p className="text-base text-slate-600 max-w-2xl">
            State-of-the-art facilities crafted to provide hands-on tactile learning, scientific experimentation, and joyful exploration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningSpaces.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo_velvet-500/40 hover:shadow-lg transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden aspect-video relative bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 left-2 text-xs font-mono font-semibold bg-slate-900/80 text-white px-2.5 py-0.5 rounded backdrop-blur-xs">
                    {item.title}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 group-hover:text-indigo_velvet-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs sm:text-sm text-slate-700">
                {item.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SPORTS INFRASTRUCTURE (Mega Menu Group 2) */}
      <div id="sports-infrastructure" className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Infrastructure Category 02
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Sports & Athletic Infrastructure
          </h2>
          <p className="text-base text-slate-600 max-w-2xl">
            “A healthy mind dwells in a healthy body.” Olympic-grade tracks, courts, and training facilities for competitive excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sportsInfra.map((sp) => (
            <div
              key={sp.id}
              id={sp.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-tiger_orange-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sp.image}
                  alt={sp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 text-xs font-mono font-semibold bg-tiger_orange-500 text-white px-2.5 py-0.5 rounded shadow-xs">
                  {sp.coach}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base font-sans text-slate-900 group-hover:text-indigo_velvet-500 transition-colors">
                    {sp.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {sp.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CAMPUS FACILITIES & SAFETY (Mega Menu Group 3) */}
      <div id="campus-safety" className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
            Infrastructure Category 03
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
            Campus Facilities, Safety & Transportation
          </h2>
          <p className="text-base text-slate-600 max-w-2xl">
            Rigorous security protocols, medical clinics, and a high-tech auditorium ensuring student comfort and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campusSafety.map((cf) => {
            const Icon = cf.icon;
            return (
              <div
                key={cf.id}
                id={cf.id}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo_velvet-500/40 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="p-3 w-fit rounded-xl bg-indigo_velvet-900/10 text-indigo_velvet-500 group-hover:bg-indigo_velvet-500 group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg font-sans text-slate-900 group-hover:text-tiger_orange-500 transition-colors">
                  {cf.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {cf.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DAY SCHOLAR + BOARDING & MULTI-CUISINE CAFETERIA */}
      <div id="hostel" className="pt-6">
        <BoardingHostelSection />
      </div>

      {/* 5. INTERACTIVE ALL-FACILITIES FILTER GRID */}
      <FacilitiesGrid />

      {/* Virtual Tour Banner */}
      <div className="p-8 sm:p-12 rounded-3xl border border-amber_flame-500/30 bg-gradient-to-r from-amber_flame-500/15 via-white to-tiger_orange-500/15 text-center space-y-4 shadow-sm">
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-tiger_orange-500 font-mono">
          Schedule A Visit
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">
          Experience Our 15-Acre Campus In Person
        </h2>
        <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Walk through our laboratories, athletic stadiums, dormitories, and cafeteria. Guided campus tours are available Monday through Saturday.
        </p>
        <div className="pt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tiger_orange-500 to-cayenne_red-500 text-white font-bold text-sm tracking-wide shadow-md shadow-tiger_orange-500/20 hover:scale-105 transition-all"
          >
            <span>Book Your Guided Campus Visit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
