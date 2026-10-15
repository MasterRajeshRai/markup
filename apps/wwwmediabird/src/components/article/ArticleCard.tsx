import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User } from 'lucide-react';
import { CmsArticle } from '@/types';
import { formatShortDate } from '@/lib/utils';

interface ArticleCardProps {
  article: CmsArticle;
  variant?: 'lead' | 'featured' | 'grid' | 'horizontal' | 'compact' | 'minimal' | 'ranked';
  index?: number;
  priority?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  variant = 'grid',
  index,
  priority = false,
  className = '',
}: ArticleCardProps) {
  const categoryName = article.data?.category || article.taxonomies?.[0]?.name || 'Culture';
  const categorySlug =
    article.data?.category_slug || article.taxonomies?.[0]?.slug || 'culture';
  const readTime = article.data?.read_time || 4;
  const publishedDate = formatShortDate(article.publishedAt || article.createdAt);
  const imageUrl = article.data?.featured_image;
  const imageAlt = article.data?.featured_image_alt || article.title;
  const summary = article.data?.summary || '';

  // 1. LEAD HERO VARIANT
  if (variant === 'lead') {
    return (
      <article
        className={`group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-300 ${className}`}
      >
        <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-stone-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-sans text-2xl">
              Media Bird
            </div>
          )}
          <div className="absolute top-4 left-4 z-10">
            <Link
              href={`/category/${categorySlug}`}
              className="inline-block px-3 py-1 bg-editorial-crimson text-white font-sans text-xs uppercase tracking-wider font-bold rounded shadow-sm hover:bg-red-800 transition-colors"
            >
              {categoryName}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-center space-y-4">
          <div className="flex items-center space-x-3 text-xs font-sans text-stone-500">
            <span>{publishedDate}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime} min read</span>
            </span>
          </div>

          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight group-hover:text-editorial-crimson transition-colors">
            <Link href={`/${article.slug}`}>
              {article.title}
            </Link>
          </h2>

          {summary && (
            <p className="font-sans text-sm sm:text-base text-stone-600 line-clamp-3 leading-relaxed">
              {summary}
            </p>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <div className="flex items-center space-x-2 text-xs font-sans font-medium text-stone-700">
              <User className="w-3.5 h-3.5 text-editorial-crimson" />
              <span>{article.data?.byline || article.author?.name || 'Editorial Team'}</span>
            </div>
            <Link
              href={`/${article.slug}`}
              className="font-sans text-xs uppercase font-bold tracking-wider text-editorial-crimson hover:underline underline-offset-4"
            >
              Read Full Story →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // 2. FEATURED SECONDARY VARIANT
  if (variant === 'featured') {
    return (
      <article className={`group flex flex-col bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-300 ${className}`}>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-sans">
              Media Bird
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            <Link
              href={`/category/${categorySlug}`}
              className="inline-block px-2.5 py-0.5 bg-editorial-crimson text-white font-sans text-[11px] uppercase tracking-wider font-bold rounded shadow-sm hover:bg-red-800 transition-colors"
            >
              {categoryName}
            </Link>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[11px] font-sans text-stone-500">
              <span>{publishedDate}</span>
              <span>•</span>
              <span>{readTime} min read</span>
            </div>

            <h3 className="font-sans text-lg sm:text-xl font-bold text-stone-900 leading-snug group-hover:text-editorial-crimson transition-colors line-clamp-2">
              <Link href={`/${article.slug}`}>
                {article.title}
              </Link>
            </h3>

            {summary && (
              <p className="font-sans text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-sans text-stone-500">
            <span>{article.data?.byline || article.author?.name || 'Media Bird'}</span>
            <span className="text-editorial-crimson font-semibold group-hover:underline">Read →</span>
          </div>
        </div>
      </article>
    );
  }

  // 3. HORIZONTAL / COMPACT LIST VARIANT
  if (variant === 'horizontal' || variant === 'compact') {
    return (
      <article className={`group flex items-start space-x-4 py-4 border-b border-stone-100 last:border-0 ${className}`}>
        <div className="relative w-24 sm:w-32 aspect-[4/3] flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 120px, 160px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-sans text-xs">
              MB
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center space-x-2 text-[11px] font-sans text-stone-500">
            <Link
              href={`/category/${categorySlug}`}
              className="text-editorial-crimson uppercase font-bold tracking-wider hover:underline"
            >
              {categoryName}
            </Link>
            <span>•</span>
            <span>{publishedDate}</span>
          </div>

          <h4 className="font-sans text-base font-bold text-stone-900 leading-snug group-hover:text-editorial-crimson transition-colors line-clamp-2">
            <Link href={`/${article.slug}`}>
              {article.title}
            </Link>
          </h4>

          {variant === 'horizontal' && summary && (
            <p className="font-sans text-xs text-stone-600 line-clamp-2 leading-relaxed hidden sm:block">
              {summary}
            </p>
          )}
        </div>
      </article>
    );
  }

  // 4. RANKED EDITORIAL VARIANT (Numbered 01, 02, 03... for Editor's Picks / Top Lists)
  if (variant === 'ranked') {
    const rankNum = typeof index === 'number' ? String(index + 1).padStart(2, '0') : '';
    return (
      <article className={`group flex items-start space-x-4 py-3.5 border-b border-stone-200/70 last:border-0 ${className}`}>
        {rankNum && (
          <span className="font-sans font-black text-2xl sm:text-3xl text-editorial-crimson/80 group-hover:text-editorial-crimson leading-none pt-0.5 select-none shrink-0 w-8 tracking-tighter">
            {rankNum}
          </span>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-sans text-stone-500">
            <Link
              href={`/category/${categorySlug}`}
              className="text-editorial-crimson uppercase font-bold tracking-wider hover:underline"
            >
              {categoryName}
            </Link>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{readTime} min read</span>
            </span>
          </div>

          <h4 className="font-sans text-sm sm:text-base font-bold text-stone-900 leading-snug group-hover:text-editorial-crimson transition-colors line-clamp-2">
            <Link href={`/${article.slug}`}>
              {article.title}
            </Link>
          </h4>

          <div className="flex items-center space-x-2 text-[10px] font-sans text-stone-400 pt-0.5">
            <span>{publishedDate}</span>
            <span>•</span>
            <span className="truncate">{article.data?.byline || article.author?.name || 'Media Bird'}</span>
          </div>
        </div>
      </article>
    );
  }

  // 5. MINIMAL TEXT-ONLY VARIANT
  if (variant === 'minimal') {
    return (
      <article className={`group py-3 border-b border-stone-100 last:border-0 space-y-1 ${className}`}>
        <div className="flex items-center space-x-2 text-[11px] font-sans text-stone-500">
          <Link
            href={`/category/${categorySlug}`}
            className="text-editorial-crimson uppercase font-bold tracking-wider hover:underline"
          >
            {categoryName}
          </Link>
          <span>•</span>
          <span>{publishedDate}</span>
        </div>
        <h4 className="font-sans text-sm sm:text-base font-bold text-stone-900 group-hover:text-editorial-crimson transition-colors leading-snug line-clamp-2">
          <Link href={`/${article.slug}`}>
            {article.title}
          </Link>
        </h4>
      </article>
    );
  }

  // 5. DEFAULT GRID VARIANT (Standard 3-column / 4-column card)
  return (
    <article className={`group flex flex-col bg-white border border-stone-200/80 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-sans">
            Media Bird
          </div>
        )}
        <div className="absolute top-3 left-3 z-10">
          <Link
            href={`/category/${categorySlug}`}
            className="inline-block px-2 py-0.5 bg-stone-900/90 text-white font-sans text-[10px] uppercase tracking-wider font-bold rounded shadow-sm hover:bg-editorial-crimson transition-colors"
          >
            {categoryName}
          </Link>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[11px] font-sans text-stone-500">
            <span>{publishedDate}</span>
            <span>•</span>
            <span>{readTime} min read</span>
          </div>

          <h3 className="font-sans text-lg font-bold text-stone-900 leading-snug group-hover:text-editorial-crimson transition-colors line-clamp-2">
            <Link href={`/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          {summary && (
            <p className="font-sans text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-sans text-stone-500">
          <span>{article.data?.byline || article.author?.name || 'Media Bird'}</span>
          <span className="text-editorial-crimson font-semibold group-hover:underline">Read →</span>
        </div>
      </div>
    </article>
  );
}
