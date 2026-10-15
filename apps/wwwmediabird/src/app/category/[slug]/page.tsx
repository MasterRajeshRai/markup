import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { getArticles, getCategoryMeta, getCategories } from '@/lib/cms';
import { ArticleCard } from '@/components/article/ArticleCard';
import { AdUnit } from '@/components/monetization/AdUnit';
import { ADSENSE_CONFIG } from '@/lib/monetization';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryMeta(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mediabirdmag.com';

  return {
    title: `${category.name} Stories & Long-Form Essays`,
    description: category.description || `Browse in-depth reporting and reflective essays in ${category.name} on Media Bird Magazine.`,
    alternates: {
      canonical: `${siteUrl}/category/${category.slug}/`,
    },
    openGraph: {
      title: `${category.name} — Media Bird Magazine`,
      description: category.description,
      url: `${siteUrl}/category/${category.slug}/`,
    },
  };
}

export default async function CategoryArchivePage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryMeta(slug);

  if (!category) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));
  const limit = 12;

  const { data: articles, meta } = await getArticles({
    category: category.slug,
    page: currentPage,
    limit,
  });

  const leadStory = currentPage === 1 && articles.length > 0 ? articles[0] : null;
  const gridStories = currentPage === 1 ? articles.slice(1) : articles;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-editorial-crimson transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-editorial-crimson font-semibold uppercase tracking-wider">
          {category.name}
        </span>
      </nav>

      {/* Category Masthead Header */}
      <header className="pb-8 mb-10 border-b-2 border-stone-900">
        <div className="flex items-center space-x-2.5 mb-2">
          <span className="px-2.5 py-0.5 bg-editorial-crimson text-white text-[10px] sm:text-[11px] font-sans font-extrabold uppercase tracking-[0.2em] rounded">
            Editorial Vertical
          </span>
          <span className="text-xs font-sans font-bold text-stone-400 uppercase tracking-wider">
            {meta.total} Verified Stories
          </span>
        </div>
        <h1 className="font-sans text-3xl sm:text-5xl font-black tracking-tight text-stone-900 mb-3">
          {category.name}
        </h1>
        {category.description && (
          <p className="font-sans text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
      </header>

      {/* Featured Lead Story (Page 1 only) */}
      {leadStory && (
        <section className="mb-12">
          <ArticleCard article={leadStory} variant="lead" priority={true} />
        </section>
      )}

      {/* In-Feed Advertisement */}
      <AdUnit
        slotId={ADSENSE_CONFIG.slots.categoryInFeed}
        minHeight="140px"
        className="my-10"
        label="Editorial Advertisement"
      />

      {/* Articles Grid */}
      {gridStories.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridStories.map((story) => (
            <ArticleCard key={story.id} article={story} variant="grid" />
          ))}
        </section>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-stone-200">
          <p className="font-sans text-lg text-stone-600">
            No articles found in this category.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-xs font-sans font-bold uppercase tracking-wider text-editorial-crimson hover:underline"
          >
            ← Return to Homepage
          </Link>
        </div>
      )}

      {/* Crawlable Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="mt-14 pt-8 border-t border-stone-200 flex items-center justify-between">
          <div>
            {meta.hasPrevPage ? (
              <Link
                href={`/category/${category.slug}?page=${currentPage - 1}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-stone-300 rounded text-xs font-sans font-semibold text-stone-700 hover:border-editorial-crimson hover:text-editorial-crimson transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </Link>
            ) : (
              <span className="opacity-40 inline-flex items-center space-x-1.5 px-4 py-2 border border-stone-200 rounded text-xs font-sans font-semibold text-stone-400 cursor-not-allowed">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </span>
            )}
          </div>

          <div className="text-xs font-sans text-stone-500 font-medium">
            Page {currentPage} of {meta.totalPages}
          </div>

          <div>
            {meta.hasNextPage ? (
              <Link
                href={`/category/${category.slug}?page=${currentPage + 1}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-900 text-white rounded text-xs font-sans font-semibold hover:bg-editorial-crimson transition-colors"
              >
                <span>Next Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="opacity-40 inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-200 rounded text-xs font-sans font-semibold text-stone-400 cursor-not-allowed">
                <span>Next Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
