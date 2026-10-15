'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Clock, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { CmsArticle } from '@/types';
import { AdUnit } from '@/components/monetization/AdUnit';
import { ADSENSE_CONFIG, CURATED_AFFILIATE_PRODUCTS } from '@/lib/monetization';
import { formatShortDate } from '@/lib/utils';

interface HomeStickySidebarProps {
  trendingArticles?: CmsArticle[];
}

const VERTICAL_CHANNELS = [
  { name: 'Culture', slug: 'culture', desc: 'Arts & Civilization' },
  { name: 'Leisure', slug: 'leisure', desc: 'Slow Living & Wellness' },
  { name: 'Newscast', slug: 'newscast', desc: 'Investigative & Affairs' },
  { name: 'Odyssey', slug: 'odyssey', desc: 'Tech & Human Frontiers' },
  { name: 'Rendezvous', slug: 'rendezvous', desc: 'Exclusive Dialogues' },
];

export function HomeStickySidebar({ trendingArticles = [] }: HomeStickySidebarProps) {
  const topArticle = trendingArticles[0];
  const supportingBriefings = trendingArticles.slice(1, 5);
  const affiliateProduct = CURATED_AFFILIATE_PRODUCTS.culture?.[0];

  return (
    <aside className="w-full space-y-7" aria-label="Editorial Sidebar & Advertisements">
      {/* 1. EDITORIAL BRIEFING / MOST READ DISPATCHES */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-editorial-crimson">
              <Flame className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-sans text-base font-extrabold text-stone-900 tracking-tight">
                Editor’s Briefing
              </h3>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400">
                Top Stories Now
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-editorial-crimson text-[10px] font-bold uppercase tracking-wider">
            Trending
          </span>
        </div>

        {/* Lead Story with Widescreen Thumbnail */}
        {topArticle && (
          <article className="group pb-4 mb-3 border-b border-stone-100 cursor-pointer">
            <Link
              href={`/${topArticle.slug}`}
              className="block relative aspect-widescreen aspect-[1.91/1] w-full rounded-xl overflow-hidden bg-stone-100 mb-2.5 shadow-2xs"
            >
              {topArticle.data?.featured_image ? (
                <Image
                  src={topArticle.data.featured_image}
                  alt={topArticle.title}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-xs font-bold">
                  Media Bird
                </div>
              )}
              <div className="absolute top-2 left-2 z-10 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-editorial-crimson text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                  1
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-900/90 text-white font-sans text-[10px] uppercase tracking-wider font-bold">
                  {(topArticle.data?.category || topArticle.taxonomies?.[0]?.name || 'FEATURE').toUpperCase()}
                </span>
              </div>
            </Link>

            <h4 className="font-sans text-sm font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-editorial-crimson transition-colors duration-200">
              <Link href={`/${topArticle.slug}`}>{topArticle.title}</Link>
            </h4>

            <div className="flex items-center space-x-2 text-[10px] font-sans text-stone-400 mt-1.5">
              <span>{formatShortDate(topArticle.publishedAt || topArticle.createdAt)}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{topArticle.data?.read_time || 4} min read</span>
              </span>
            </div>
          </article>
        )}

        {/* Ranked Secondary Stories (#2 to #5) */}
        <div className="divide-y divide-stone-100">
          {supportingBriefings.map((art, idx) => {
            const rankNumber = idx + 2;
            const categoryName = (
              art.data?.category ||
              art.taxonomies?.[0]?.name ||
              'News'
            ).toUpperCase();

            return (
              <article
                key={art.id}
                className="py-3 first:pt-1 last:pb-0 group hover:bg-stone-50/80 rounded-xl p-2 -mx-1 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-red-50 text-stone-700 group-hover:text-editorial-crimson flex items-center justify-center font-sans font-extrabold text-xs shrink-0 select-none transition-colors">
                    #{rankNumber}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-[10px] font-sans text-stone-400 mb-0.5">
                      <span className="font-bold text-stone-600 tracking-wider">
                        {categoryName}
                      </span>
                      <span>•</span>
                      <span>{formatShortDate(art.publishedAt || art.createdAt)}</span>
                    </div>

                    <h5 className="font-sans text-xs font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-editorial-crimson transition-colors duration-200">
                      <Link href={`/${art.slug}`}>{art.title}</Link>
                    </h5>

                    <div className="flex items-center space-x-1.5 text-[10px] font-sans text-stone-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{art.data?.read_time || 4} min read</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 2. CHANNELS & TOPIC PILLARS EXPLORER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center space-x-2 pb-3 mb-3.5 border-b border-stone-100">
          <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
            <Compass className="w-4 h-4" />
          </span>
          <h4 className="font-sans text-sm font-extrabold text-stone-900 uppercase tracking-wider">
            Explore Channels
          </h4>
        </div>

        <div className="space-y-2">
          {VERTICAL_CHANNELS.map((ch) => (
            <Link
              key={ch.slug}
              href={`/category/${ch.slug}`}
              className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all duration-200"
            >
              <div>
                <span className="font-sans font-bold text-xs text-stone-900 group-hover:text-editorial-crimson transition-colors block">
                  {ch.name}
                </span>
                <span className="text-[10px] font-sans text-stone-400 block">
                  {ch.desc}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-editorial-crimson group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. STICKY GOOGLE ADSENSE 300 × 600 PX HALF-PAGE BILLBOARD */}
      <div className="sticky top-24 space-y-6">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-md transition-shadow">
          <AdUnit
            slotId={ADSENSE_CONFIG.slots.footerAbove}
            width={300}
            height={600}
            className="my-0 w-full"
            label="Advertisement • 300 × 600 Half-Page"
          />
        </div>

        {/* 4. SPONSORED EDITORIAL COMPANION */}
        {affiliateProduct && (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
              <div className="flex items-center space-x-1.5 text-editorial-crimson">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
                  Editorial Companion
                </span>
              </div>
              <span className="text-[9px] font-sans text-stone-400 uppercase tracking-widest">
                Sponsored
              </span>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-sans font-semibold">
                {affiliateProduct.badge}
              </span>
              <h5 className="font-sans text-xs font-bold text-stone-900 leading-snug">
                {affiliateProduct.name}
              </h5>
              <p className="font-sans text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                {affiliateProduct.description}
              </p>
              <a
                href={affiliateProduct.merchantUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-sans font-bold text-editorial-crimson hover:underline pt-1"
              >
                <span>View on {affiliateProduct.merchant.split('/')[0].trim()}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
