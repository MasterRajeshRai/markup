import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';
import { getArticles } from '@/lib/cms';
import { ArticleCard } from '@/components/article/ArticleCard';
import { AdUnit } from '@/components/monetization/AdUnit';
import { ADSENSE_CONFIG } from '@/lib/monetization';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for “${q}” — Media Bird Magazine` : 'Search Stories — Media Bird Magazine',
    description: `Search articles across Culture, Leisure, Newscast, Odyssey, and Rendezvous on Media Bird Magazine.`,
    robots: {
      index: false, // Don't index dynamic search queries
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', page: pageParam } = await searchParams;
  const query = q.trim();
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));

  const { data: results, meta } = await getArticles({
    search: query || undefined,
    page: currentPage,
    limit: 12,
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-editorial-crimson transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-editorial-crimson font-semibold">Search</span>
      </nav>

      {/* Search Header Form */}
      <header className="max-w-3xl mx-auto text-center space-y-4 mb-12">
        <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Search Media Bird
        </h1>
        <p className="font-sans text-sm text-stone-500">
          Find long-form investigative journalism, cultural analysis, and reflective essays.
        </p>

        <form method="GET" action="/search" className="relative max-w-xl mx-auto mt-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search keywords, topics, or authors..."
            className="w-full pl-12 pr-28 py-3.5 text-sm bg-white border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-editorial-crimson/20 focus:border-editorial-crimson"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-editorial-crimson hover:bg-red-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-md transition-colors"
          >
            Search
          </button>
        </form>
      </header>

      {/* Results Indicator */}
      {query ? (
        <div className="mb-8 pb-4 border-b border-stone-200 flex items-center justify-between text-xs font-sans text-stone-500">
          <span>
            Found <strong className="text-stone-900 font-semibold">{meta.total}</strong> results for{' '}
            <strong className="text-editorial-crimson font-semibold">“{query}”</strong>
          </span>
          <span>Page {meta.page} of {meta.totalPages}</span>
        </div>
      ) : (
        <div className="mb-8 pb-4 border-b border-stone-200 text-xs font-sans text-stone-500">
          Browsing latest published articles ({meta.total} total)
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((art) => (
            <ArticleCard key={art.id} article={art} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="max-w-lg mx-auto text-center py-16 bg-white rounded-xl border border-stone-200 p-8 space-y-4">
          <p className="font-sans text-xl font-bold text-stone-800">
            No stories matched your search
          </p>
          <p className="font-sans text-xs text-stone-500 leading-relaxed">
            We couldn’t find any articles matching “{query}”. Try adjusting your spelling or searching for a broader term like “India”, “Culture”, or “Asha Bhosle”.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-5 py-2.5 bg-stone-900 hover:bg-editorial-crimson text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      )}

      {/* In-Feed Advertisement */}
      <AdUnit
        slotId={ADSENSE_CONFIG.slots.categoryInFeed}
        minHeight="140px"
        className="my-10"
        label="Editorial Advertisement"
      />

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="mt-12 pt-6 border-t border-stone-200 flex items-center justify-between text-xs font-sans">
          {meta.hasPrevPage ? (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
              className="px-4 py-2 border border-stone-300 rounded font-semibold text-stone-700 hover:border-editorial-crimson hover:text-editorial-crimson transition-colors"
            >
              ← Previous
            </Link>
          ) : (
            <span className="opacity-40 px-4 py-2 border border-stone-200 rounded font-semibold text-stone-400 cursor-not-allowed">
              ← Previous
            </span>
          )}

          <span className="text-stone-500">
            Page {currentPage} of {meta.totalPages}
          </span>

          {meta.hasNextPage ? (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
              className="px-4 py-2 bg-stone-900 text-white rounded font-semibold hover:bg-editorial-crimson transition-colors"
            >
              Next →
            </Link>
          ) : (
            <span className="opacity-40 px-4 py-2 bg-stone-200 rounded font-semibold text-stone-400 cursor-not-allowed">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
