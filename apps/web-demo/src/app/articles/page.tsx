import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cmsClient } from '@/lib/cms-client';
import { Newspaper, Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School News & Stories | Prince Public School',
  description: 'Latest stories, student achievements, Olympiad laureates, and campus updates from Prince Public School.',
};

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  let articles: any[] = [];
  try {
    const res = await cmsClient.getEntries('articles');
    articles = res.data || [];
  } catch (err) {
    console.error('Failed to load articles from CMS API:', err);
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          <Newspaper className="w-3.5 h-3.5 text-amber-700" />
          Press & Campus Chronicle
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
          School News & Academic Articles
        </h1>
        <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
          Stay connected with pedagogical insights, competition victories, student initiatives, and faculty publications from Prince Public School.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={`/articles/${art.slug}`}
            className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {art.taxonomies?.map((t: any) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    {t.name}
                  </span>
                ))}
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {art.data?.read_time || 4} min
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {art.title}
              </h2>
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {art.data?.summary || art.seo?.description || ''}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500 mt-4">
              <span className="font-medium text-slate-700">{art.data?.byline || 'PPS Editorial Cell'}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(art.publishedAt || art.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
