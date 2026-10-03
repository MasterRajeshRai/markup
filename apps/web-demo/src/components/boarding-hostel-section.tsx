'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Bed, 
  ShieldCheck, 
  Utensils, 
  BookOpen, 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  Film, 
  HeartHandshake, 
  Wifi, 
  PhoneCall, 
  Droplets,
  ArrowRight
} from 'lucide-react';

export function BoardingHostelSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'girls' | 'nutrition' | 'prep' | 'recreation'>('overview');

  const hostelFeatures = [
    {
      title: '2, 3 & 4 Seater Air-Cooled Rooms',
      desc: 'Spacious, well-ventilated rooms with attached modern bathrooms, individual ergonomic study desks, wardrobes, and 24-hour hot & cold running water.',
      icon: Bed,
      badge: 'Attached Bathrooms',
    },
    {
      title: 'Separate Self-Contained Girls’ Wing',
      desc: 'A safe, secure private sanctuary with dedicated study hall, TV lounge, recreation room, medical inspection room, and private dining hall managed by resident matrons.',
      icon: ShieldCheck,
      badge: 'Independent Wing',
    },
    {
      title: 'Supervised Evening Prep & Mentorship',
      desc: 'Quiet, focused evening study hours closely guided by resident subject teachers who provide one-on-one attention and personalized academic doubt resolution.',
      icon: BookOpen,
      badge: 'Teacher Guided',
    },
    {
      title: 'Nutritional Science & Multi-Cuisine Dining',
      desc: 'Balanced menus offering Indian, Chinese & Continental cuisine prepared by culinary chefs. Formulated for sustained cognitive concentration and emotional calm.',
      icon: Utensils,
      badge: 'Multi-Cuisine',
    },
    {
      title: 'Weekend Rejuvenation, Movies & Picnics',
      desc: 'Wholesome weekends with outdoor picnics, cinema screenings, sports tournaments, and hobby clubs designed to prepare students refreshed for each new week.',
      icon: Film,
      badge: 'Excursions & Fun',
    },
    {
      title: '24/7 Security, Wi-Fi & Modern Connectivity',
      desc: 'Gated campus with CCTV monitoring, biometric access, ISD/STD communication desks for parental calls, and high-speed filtered educational Wi-Fi.',
      icon: Wifi,
      badge: 'Safe & Connected',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-12">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
              <Home className="w-3.5 h-3.5 text-tiger_orange-500" />
              Day Scholar + Boarding Institute
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tiger_orange-500/10 text-tiger_orange-600 border border-tiger_orange-500/20">
              A Home Away From Home
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight leading-tight font-sans">
            World-Class Residential Living & Hostel Amenities
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Prince Public School stands apart as a premier <strong>Day Scholar plus Boarding Institute</strong> of its kind. 
            We blend academic rigor with the warmth, care, and security of a close-knit home, fostering independence and lifelong camaraderie.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/admissions#fees"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-tiger_orange-500 to-cayenne_red-500 hover:from-amber_flame-500 hover:to-tiger_orange-500 text-white font-bold text-sm tracking-wide shadow-md shadow-tiger_orange-500/20 transition-all"
          >
            <span>Hostel Fee Structure</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm tracking-wide transition-all"
          >
            <span>Book Hostel Tour</span>
          </Link>
        </div>
      </div>

      {/* Flagship Interactive Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 p-6 sm:p-10 shadow-sm">
        
        {/* Left Side: Editorial Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Dormitory Living' },
              { id: 'girls', label: 'Girls’ Sanctuary' },
              { id: 'nutrition', label: 'Nutritional Food' },
              { id: 'prep', label: 'Supervised Prep' },
              { id: 'recreation', label: 'Weekend Life' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Content Cards */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                Modern 2, 3 & 4 Seater Rooms with Attached Toilets
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Boarders live in brightly lit, climate-controlled rooms thoughtfully tailored for growing children. 
                Each boarder receives their personal wardrobe, orthopedic spring mattress, study station with book storage, and attached hygienic washroom with 24-hour hot and cold water.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-700">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>24-Hour Hot & Cold Water</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ISD / STD Parental Call Desk</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <Wifi className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>High-Speed Educational Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <Tv className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Common TV & Drawing Lounges</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'girls' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Exclusive & 100% Independent Wing
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                Dedicated Girls’ Dormitory with Comprehensive In-House Facilities
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                The girls’ dormitory is a self-contained wing ensuring supreme privacy and security. 
                Complete with its own private study hall, recreation room, TV lounge, medical inspection room, and dining hall, 
                our young ladies enjoy a warm, supportive atmosphere under full-time female resident matrons.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated in-house study hall for undisturbed evening prep</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Private dining hall with dedicated hygienic kitchen staff</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Medical Inspection (MI) room with 24/7 resident nurse</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Round-the-clock female wardens and strict security gates</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Principles of Boarding School Nutrition
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                Cafeteria Serving Indian, Chinese & Continental Cuisine
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Food is catered strictly according to principles of nutrition as per standard boarding schools. 
                The criterion for good balanced food is the <strong>long-term health of children</strong>, rather than momentary cravings. 
                Our diet produces the optimal mental stamina for academic thinking, avoids hyperactivity, and prevents nutritional fatigue.
              </p>
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 text-sm text-slate-700 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <span>Balanced 4-Course Daily Dining</span>
                  <span className="text-amber-700 font-mono">100% Hygienic</span>
                </div>
                <p>• <strong>Breakfast:</strong> Fresh fruits, whole grains, dairy, hot South & North Indian breakfasts</p>
                <p>• <strong>Lunch & Dinner:</strong> Multi-cuisine rotating menus with Indian curries, dal, continental roasts, and Chinese noodles</p>
                <p>• <strong>Evening Snacks:</strong> Wholesome post-games snacks with hot milk, cookies, and seasonal fruits</p>
              </div>
            </div>
          )}

          {activeTab === 'prep' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                Supervised Evening Prep Guided by Resident Teachers
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Evening study prep is closely supervised by experienced educators who understand that every child learns differently. 
                Teachers provide structured academic reinforcement, clarify doubts from morning classes, and nurture disciplined self-study habits.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-700">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Personalized Care</span>
                  <p className="text-xs sm:text-sm text-slate-600">Low mentor-to-student ratios guarantee no learner is left behind.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Doubt Clearing Cells</span>
                  <p className="text-xs sm:text-sm text-slate-600">Daily 1-on-1 subject clinics in Math, Science, and English.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recreation' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                Weekend Picnics, Movie Screenings & Holiday Activities
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Cleanliness and emotional joy are assigned topmost priority. On weekends and holidays, special programmes like picnics, 
                cinema theater outings, nature trails, and friendly sports matches are organized to make the hostel stay cheerful, refreshing, 
                and ready for a fresh academic beginning each week.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Outdoor Picnics', 'Movie Outings', 'Inter-Floor Sports', 'Cooking & Baking Workshops', 'Music & Jamming Sessions'].map((act, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-800 shadow-xs">
                    ★ {act}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Visual Showcase Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                activeTab === 'girls'
                  ? 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'
                  : activeTab === 'nutrition'
                  ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
                  : activeTab === 'prep'
                  ? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
                  : activeTab === 'recreation'
                  ? 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'
                  : 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
              }
              alt="Prince Public School Hostel & Boarding Facilities"
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded">
                Residential Life
              </span>
              <h4 className="text-base sm:text-lg font-bold">Prince Public School Boarding House</h4>
              <p className="text-xs sm:text-sm text-slate-200">24/7 Security • Resident Wardens • Medical Clinic</p>
            </div>
          </div>

          {/* Quick Stats Pill Bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xl font-black text-blue-700 block">2/3/4</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Seater Rooms</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xl font-black text-amber-600 block">100%</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Nutritional Menus</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xl font-black text-emerald-600 block">24/7</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Security & Wardens</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostelFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {feat.badge}
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">{feat.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>

    </section>
  );
}
