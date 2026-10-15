'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { CmsArticle } from '@/types';
import { formatShortDate } from '@/lib/utils';

interface HeroSliderProps {
  articles: CmsArticle[];
  autoPlayInterval?: number; // default 6000ms
}

export function HeroSlider({
  articles,
  autoPlayInterval = 6000,
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = Math.min(5, articles.length);
  const currentArticles = articles.slice(0, total);

  // Advance to next slide
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Go to previous slide
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Jump to specific slide
  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, total, handleNext]);

  // Touch Swipe Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) return null;

  const activeArticle = currentArticles[currentIndex];
  const activeCategory =
    activeArticle.data?.category ||
    activeArticle.taxonomies?.[0]?.name ||
    'UNCATEGORIZED';

  return (
    <section
      className="w-full relative group overflow-hidden bg-stone-900 select-none m-0 p-0 min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex flex-col justify-between"
      aria-roledescription="carousel"
      aria-label="Top 5 Featured Stories"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. BACKGROUND FEATURED IMAGES FOR ALL SLIDES */}
      {currentArticles.map((article, idx) => {
        const isCurrent = idx === currentIndex;
        const img = article.data?.featured_image;

        return (
          <div
            key={article.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            {img ? (
              <Image
                src={img}
                alt={article.data?.featured_image_alt || article.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-stone-600 via-stone-500 to-stone-700 flex items-center justify-center">
                <FileText className="w-28 h-28 sm:w-40 sm:h-40 text-white/15 stroke-1" />
              </div>
            )}
          </div>
        );
      })}

      {/* 2. SOPHISTICATED GRADIENT SCRIM (Guarantees WCAG Contrast) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/40 to-black/75 pointer-events-none" />

      {/* 3. CHEVRON NAVIGATION (LEFT & RIGHT) */}
      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white transition-all transform hover:scale-110 cursor-pointer focus:outline-none"
        aria-label="Previous article"
      >
        <ChevronLeft className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.5]" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white transition-all transform hover:scale-110 cursor-pointer focus:outline-none"
        aria-label="Next article"
      >
        <ChevronRight className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.5]" />
      </button>

      {/* 4. MAIN ACTIVE SLIDE CONTENT (TITLE OVER BACKGROUND) */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pt-20 sm:pt-28 pb-48 sm:pb-52">
        <div className="max-w-4xl space-y-3">
          {/* Category Label */}
          <div className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.2em] text-white/90 drop-shadow">
            {activeCategory}
          </div>

          {/* Large Headline */}
          <h1 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight sm:leading-[1.15] tracking-tight drop-shadow-md">
            <Link
              href={`/${activeArticle.slug}`}
              className="hover:text-stone-200 transition-colors"
            >
              {activeArticle.title}
            </Link>
          </h1>
        </div>
      </div>

      {/* 5. BOTTOM "LATEST" POST NAVIGATION CARD (SOLID RED, NO LINES, NO HORIZONTAL SCROLL) */}
      <div className="absolute bottom-5 sm:bottom-7 left-4 right-4 sm:left-8 sm:right-8 z-30 max-w-6xl mx-auto">
        <div className="bg-[#931b1c] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl text-white">
          {/* DESKTOP & TABLET: Clean 5-column grid without any horizontal scroll */}
          <div className="hidden md:block">
            <div className="text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-white/80 mb-3 pl-1">
              LATEST
            </div>
            <div className="grid grid-cols-5 gap-2.5 lg:gap-3.5">
              {currentArticles.map((article, idx) => {
                const isCurrent = idx === currentIndex;
                const cat =
                  article.data?.category ||
                  article.taxonomies?.[0]?.name ||
                  'UNCATEGORIZED';
                const date = formatShortDate(
                  article.publishedAt || article.createdAt
                );
                const img = article.data?.featured_image;

                return (
                  <button
                    key={article.id}
                    onClick={() => handleSelect(idx)}
                    className={`flex items-center space-x-3 p-2.5 rounded-2xl transition-all text-left cursor-pointer w-full ${
                      isCurrent
                        ? 'bg-black/30 shadow-inner'
                        : 'hover:bg-white/10'
                    }`}
                    aria-label={`Go to slide ${idx + 1}: ${article.title}`}
                  >
                    {/* Rounded white box thumbnail */}
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                      {img ? (
                        <Image
                          src={img}
                          alt={article.title}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6 lg:w-7 lg:h-7 text-stone-400 stroke-1" />
                      )}
                    </div>

                    {/* Text metadata */}
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="font-sans text-xs font-bold text-white line-clamp-2 leading-snug">
                        {article.title}
                      </p>
                      <div className="text-[10px] font-medium text-white/70 uppercase tracking-wider mt-1 truncate">
                        <span className="font-semibold text-white/90">{cat}</span>
                        <span className="mx-1">•</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOBILE: Compact clean layout with 5 selector tabs + active story (No horizontal scroll) */}
          <div className="md:hidden space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-white/80">
                LATEST
              </span>
              {/* 5-Slide Quick Step Pills */}
              <div className="flex items-center space-x-1.5">
                {currentArticles.map((_, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`px-2 py-0.5 text-[11px] font-sans font-bold rounded-md transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-[#931b1c]'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                      aria-label={`Go to story ${idx + 1}`}
                    >
                      0{idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Story Card on mobile */}
            <div className="flex items-center space-x-3 p-2 bg-black/25 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                {activeArticle.data?.featured_image ? (
                  <Image
                    src={activeArticle.data.featured_image}
                    alt={activeArticle.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-stone-400 stroke-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs font-bold text-white line-clamp-2 leading-tight">
                  {activeArticle.title}
                </p>
                <div className="text-[10px] font-medium text-white/70 uppercase tracking-wider mt-0.5 truncate">
                  <span className="font-semibold text-white/90">{activeCategory}</span>
                  <span className="mx-1">•</span>
                  <span>{formatShortDate(activeArticle.publishedAt || activeArticle.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
