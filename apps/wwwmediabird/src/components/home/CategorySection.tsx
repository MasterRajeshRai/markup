import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { CmsArticle, CmsCategory } from '@/types';
import { formatShortDate } from '@/lib/utils';

interface CategorySectionProps {
  category: CmsCategory;
  articles: CmsArticle[];
  layout?: string;
}

export function CategorySection({
  category,
  articles,
}: CategorySectionProps) {
  if (!articles || articles.length === 0) return null;

  // Unified Leisure-style structure: Top 2-Card Grid + Bottom 3-Card Rich List View
  const gridArticles = articles.slice(0, 2);
  const listArticles = articles.slice(2, 5);

  return (
    <section
      className="pt-8 first:pt-0"
      aria-label={`Category ${category.name}`}
    >
      {/* 1. SIMPLE, BOLD & CLEAN SECTION TITLE */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-7 sm:h-8 bg-editorial-crimson rounded-full shrink-0" />
          <h2 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
            <Link
              href={`/category/${category.slug}`}
              className="hover:text-editorial-crimson transition-colors duration-200"
            >
              {category.name}
            </Link>
          </h2>
        </div>

        <Link
          href={`/category/${category.slug}`}
          className="group inline-flex items-center space-x-1.5 text-xs sm:text-sm font-sans font-bold text-editorial-crimson hover:text-red-900 transition-colors shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 2. NEAT & CLEAN LEISURE-STYLE STRUCTURE */}
      <div className="space-y-4">
        {/* Top 2-Column Grid with Light Shadow & Border */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {gridArticles.map((art) => (
            <article
              key={art.id}
              className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <Link
                  href={`/${art.slug}`}
                  className="block relative aspect-widescreen aspect-[1.91/1] w-full overflow-hidden bg-stone-100"
                >
                  {art.data?.featured_image ? (
                    <Image
                      src={art.data.featured_image}
                      alt={art.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-sans text-sm">
                      Media Bird
                    </div>
                  )}
                </Link>

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-sans text-stone-400">
                    <span className="font-semibold text-stone-600">{art.data?.byline || category.name}</span>
                    <span>•</span>
                    <span>{formatShortDate(art.publishedAt || art.createdAt)}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{art.data?.read_time || 4} min</span>
                    </span>
                  </div>

                  <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-editorial-crimson transition-colors duration-200">
                    <Link href={`/${art.slug}`}>{art.title}</Link>
                  </h3>

                  {art.data?.summary && (
                    <p className="font-sans text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {art.data.summary}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-0 flex items-center justify-end text-xs font-sans">
                <span className="text-editorial-crimson font-bold inline-flex items-center space-x-1 group-hover:underline">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom 3-Card Stacked List View: Neat, Clean, Light Border & Shadow */}
        {listArticles.length > 0 && (
          <div className="space-y-3.5">
            {listArticles.map((art) => (
              <article
                key={art.id}
                className="group bg-white border border-stone-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-300 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-5 cursor-pointer"
              >
                <Link
                  href={`/${art.slug}`}
                  className="block relative w-full sm:w-44 aspect-widescreen aspect-[1.91/1] shrink-0 rounded-xl overflow-hidden bg-stone-100"
                >
                  {art.data?.featured_image ? (
                    <Image
                      src={art.data.featured_image}
                      alt={art.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 180px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-xs">
                      MB
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center space-x-2 text-[10px] font-sans text-stone-400">
                    <span className="font-semibold text-stone-600">{art.data?.byline || category.name}</span>
                    <span>•</span>
                    <span>{formatShortDate(art.publishedAt || art.createdAt)}</span>
                    <span>•</span>
                    <span>{art.data?.read_time || 4} min</span>
                  </div>

                  <h4 className="font-sans text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-editorial-crimson transition-colors duration-200">
                    <Link href={`/${art.slug}`}>{art.title}</Link>
                  </h4>

                  {art.data?.summary && (
                    <p className="font-sans text-xs text-stone-500 line-clamp-1 leading-relaxed">
                      {art.data.summary}
                    </p>
                  )}
                </div>

                <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-stone-50 group-hover:bg-red-50 text-stone-400 group-hover:text-editorial-crimson transition-all duration-200 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
