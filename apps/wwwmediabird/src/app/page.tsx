import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import {
  getArticles,
  getCategories,
  getEditorsPicks,
} from '@/lib/cms';
import { EditorialHero } from '@/components/home/EditorialHero';
import { EditorsCornerstone } from '@/components/home/EditorsCornerstone';
import { CategorySection } from '@/components/home/CategorySection';
import { HomeStickySidebar } from '@/components/home/HomeStickySidebar';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { AdUnit } from '@/components/monetization/AdUnit';
import { AffiliateCard } from '@/components/monetization/AffiliateCard';
import { ADSENSE_CONFIG, CURATED_AFFILIATE_PRODUCTS } from '@/lib/monetization';

export const revalidate = 60; // Next.js ISR revalidation every 60 seconds

export default async function HomePage() {
  // 1. Fetch Top 5 Latest Articles for the Hero Slider
  const { data: top5Articles } = await getArticles({ limit: 5 });

  // 2. Fetch Top 10 Editor's Cornerstone Articles
  const cornerstoneArticles = await getEditorsPicks(10);

  // 3. Fetch Top 5 Trending Articles for the Sticky Sidebar Briefing
  const { data: trendingArticles } = await getArticles({ limit: 5 });

  // 4. Fetch Category Stories for all 5 core categories (limit: 6 for rich grid + list mix)
  const categories = await getCategories();
  const categoryStoriesMap: Record<string, any[]> = {};

  for (const cat of categories) {
    const { data: catStories } = await getArticles({
      category: cat.slug,
      limit: 6,
    });
    categoryStoriesMap[cat.slug] = catStories;
  }

  return (
    <div className="w-full">
      {/* 1. EDITORIAL HERO SLIDER (Top 5 Latest Posts) - Full Width */}
      <EditorialHero sliderArticles={top5Articles} />

      {/* 2. PREMIUM BILLBOARD AD PLACEMENT (970 × 250 px) - Below Hero Section */}
      <section
        className="w-full py-3 sm:py-4 bg-stone-50/40 border-b border-stone-200/70"
        aria-label="Billboard Advertisement"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <AdUnit
            slotId={ADSENSE_CONFIG.slots.homeLeadAfter}
            width={970}
            height={250}
            className="my-0 w-full flex flex-col items-center"
            label="Advertisement • 970 × 250 Billboard"
          />
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14">
        {/* 3. EDITOR'S CORNERSTONE (Trending Now 4-Card Widescreen Carousel) */}
        <EditorsCornerstone articles={cornerstoneArticles} />

        {/* 4. MAIN EDITORIAL CONTENT GRID WITH STICKY ADSENSE SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start my-10">
          {/* 4.1 THE 5 REDESIGNED CATEGORY SECTIONS (Culture, Leisure, Newscast, Odyssey, Rendezvous) */}
          <div className="lg:col-span-8 space-y-14">
            {/* 4.1.1 Culture */}
            {categoryStoriesMap['culture'] && (
              <CategorySection
                category={categories.find((c) => c.slug === 'culture')!}
                articles={categoryStoriesMap['culture']}
                layout="culture"
              />
            )}

            {/* 4.1.2 Leisure */}
            {categoryStoriesMap['leisure'] && (
              <CategorySection
                category={categories.find((c) => c.slug === 'leisure')!}
                articles={categoryStoriesMap['leisure']}
                layout="leisure"
              />
            )}

            {/* In-feed Editorial Ad Separator */}
            <div className="bg-stone-50/60 border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
              <AdUnit
                slotId={ADSENSE_CONFIG.slots.categoryInFeed}
                className="my-0 w-full"
                label="Editorial In-Feed Advertisement"
              />
            </div>

            {/* 4.1.3 Newscast */}
            {categoryStoriesMap['newscast'] && (
              <CategorySection
                category={categories.find((c) => c.slug === 'newscast')!}
                articles={categoryStoriesMap['newscast']}
                layout="newscast"
              />
            )}

            {/* 4.1.4 Odyssey */}
            {categoryStoriesMap['odyssey'] && (
              <CategorySection
                category={categories.find((c) => c.slug === 'odyssey')!}
                articles={categoryStoriesMap['odyssey']}
                layout="odyssey"
              />
            )}

            {/* 4.1.5 Rendezvous */}
            {categoryStoriesMap['rendezvous'] && (
              <CategorySection
                category={categories.find((c) => c.slug === 'rendezvous')!}
                articles={categoryStoriesMap['rendezvous']}
                layout="rendezvous"
              />
            )}
          </div>

          {/* 4.2 STICKY SIDEBAR FOR GOOGLE ADSENSE & EDITORIAL WIDGETS */}
          <div className="lg:col-span-4">
            <HomeStickySidebar trendingArticles={trendingArticles} />
          </div>
        </div>

        {/* 5. CURATED EDITORIAL AFFILIATE SPOTLIGHT */}
        <section className="my-16 pt-8 border-t border-stone-200" aria-label="Editorial Buying Guide">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center space-x-2 text-editorial-crimson">
                <BookOpen className="w-4 h-4" />
                <h3 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                  Editorial Companion & Buying Guides
                </h3>
              </div>
              <p className="font-sans text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
                Thoughtfully curated tools, books, and gear aligned with slow living, intentional reading, and mindful inquiry.
              </p>
            </div>
            <span className="text-[11px] font-sans text-stone-400 uppercase tracking-wider">
              Sponsored Recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AffiliateCard product={CURATED_AFFILIATE_PRODUCTS.culture[0]} />
            <AffiliateCard product={CURATED_AFFILIATE_PRODUCTS.leisure[0]} />
            <AffiliateCard product={CURATED_AFFILIATE_PRODUCTS.odyssey[0]} />
          </div>
        </section>

        {/* 6. NEWSLETTER SUBSCRIPTION */}
        <NewsletterSection />
      </div>
    </div>
  );
}
