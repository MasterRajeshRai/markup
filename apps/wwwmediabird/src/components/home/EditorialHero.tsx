import React from 'react';
import { CmsArticle } from '@/types';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ArticleCard } from '@/components/article/ArticleCard';

interface EditorialHeroProps {
  sliderArticles: CmsArticle[];
  secondaryStories?: CmsArticle[];
}

export function EditorialHero({
  sliderArticles,
  secondaryStories = [],
}: EditorialHeroProps) {
  if (!sliderArticles || sliderArticles.length === 0) return null;

  return (
    <section className="w-full m-0 p-0" aria-label="Editorial Lead Section">
      {/* Top 5 Latest Posts Hero Slider */}
      <HeroSlider articles={sliderArticles} />

      {/* Secondary Features Grid (if provided) */}
      {secondaryStories && secondaryStories.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {secondaryStories.map((story) => (
              <ArticleCard key={story.id} article={story} variant="featured" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
