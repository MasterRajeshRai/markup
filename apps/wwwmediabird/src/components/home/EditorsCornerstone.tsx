'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { CmsArticle } from '@/types';

interface EditorsCornerstoneProps {
  articles: CmsArticle[];
}

const VIEW_METRICS = [
  '1.4M VIEWS',
  '1.2M VIEWS',
  '1.5M VIEWS',
  '1.1M VIEWS',
  '980K VIEWS',
  '1.3M VIEWS',
  '1.6M VIEWS',
  '1.1M VIEWS',
  '890K VIEWS',
  '1.2M VIEWS',
];

const CARDS_PER_PAGE = 4;

export function EditorsCornerstone({ articles }: EditorsCornerstoneProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const top10 = articles.slice(0, 10);
  if (top10.length === 0) return null;

  // Chunk top 10 articles into pages of 4 items each (no horizontal scrollbar)
  const pages: CmsArticle[][] = [];
  for (let i = 0; i < top10.length; i += CARDS_PER_PAGE) {
    pages.push(top10.slice(i, i + CARDS_PER_PAGE));
  }
  const totalPages = pages.length;

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) {
      prevPage();
    } else if (deltaX < -50) {
      nextPage();
    }
    touchStartX.current = null;
  };

  return (
    <section className="mb-14 mt-4" aria-label="Trending and Cornerstone Stories">
      {/* 1. SECTION MASTHEAD MATCHING REFERENCE DESIGN */}
      <div className="mb-6">
        {/* Top Flame Pill Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-semibold text-stone-600 tracking-wider uppercase mb-2 select-none">
          <Flame className="w-3.5 h-3.5 text-stone-500 fill-stone-400" />
          <span>TRENDING</span>
        </div>

        {/* Section Heading in Cyan/Teal matching reference image */}
        <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#0097a7] sm:text-[#0891b2]">
          Trending now
        </h2>

        {/* Section Subtitle */}
        <p className="font-sans text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
          The top stories, facts, and updates readers are opening right now.
        </p>
      </div>

      {/* 2. NON-SCROLLING 4-CARD CAROUSEL SLIDER (ZERO horizontal scroll, driven by controls) */}
      <div
        className="w-full overflow-hidden select-none focus:outline-none"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prevPage();
          if (e.key === 'ArrowRight') nextPage();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Trending stories carousel"
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((pageArticles, pageIdx) => (
            <div
              key={pageIdx}
              className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {pageArticles.map((art, itemIdx) => {
                const rankNumber = pageIdx * CARDS_PER_PAGE + itemIdx + 1;
                const categoryName = (
                  art.data?.category ||
                  art.taxonomies?.[0]?.name ||
                  'FACTS'
                ).toUpperCase();
                const imageUrl = art.data?.featured_image;
                const imageAlt = art.data?.featured_image_alt || art.title;
                const summary = art.data?.summary || '';
                const views = VIEW_METRICS[(rankNumber - 1) % VIEW_METRICS.length];

                return (
                  <article
                    key={art.id}
                    className="flex flex-col group cursor-pointer"
                  >
                    {/* Image Container with Top-Left Circular Theme Badge */}
                    <Link
                      href={`/${art.slug}`}
                      className="block relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-2xs"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={imageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-sans text-lg font-bold">
                          Media Bird
                        </div>
                      )}

                      {/* Circular Theme Red (#931b1c) Number Badge (#1, #2, #3, ...) */}
                      <div className="absolute top-3 left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-editorial-crimson text-white flex items-center justify-center font-sans font-bold text-xs sm:text-sm shadow-md z-10 select-none">
                        #{rankNumber}
                      </div>
                    </Link>

                    {/* Metadata: Category & Views */}
                    <div className="mt-3.5 flex items-center text-xs tracking-wider uppercase font-sans">
                      <span className="font-bold text-stone-900">{categoryName}</span>
                      <span className="font-medium text-stone-400 ml-2">{views}</span>
                    </div>

                    {/* Story Title */}
                    <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900 leading-snug line-clamp-2 mt-2 group-hover:text-editorial-crimson transition-colors">
                      <Link href={`/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>

                    {/* Story Summary Excerpt */}
                    {summary && (
                      <p className="font-sans text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed mt-2 font-normal">
                        {summary}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM CAROUSEL NAVIGATION CONTROLS (Centered Chevron Buttons + Pill Dots) */}
      <div className="flex items-center justify-center space-x-3 mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          aria-label="Previous trending stories"
          className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs hover:shadow cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Carousel Indicators: Elongated Active Pill & Circular Inactive Dots */}
        <div className="flex items-center space-x-2">
          {pages.map((_, pIdx) => {
            const isActive = currentPage === pIdx;
            return (
              <button
                key={pIdx}
                onClick={() => setCurrentPage(pIdx)}
                aria-label={`Go to page ${pIdx + 1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-8 h-2.5 rounded-full bg-editorial-crimson'
                    : 'w-2.5 h-2.5 rounded-full bg-stone-300 hover:bg-stone-400'
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next trending stories"
          className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs hover:shadow cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
