import React from 'react';
import Link from 'next/link';
import { cmsClient } from '@/lib/cms-client';

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
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
      <div>
        <span className="text-xs uppercase font-mono font-semibold tracking-wider text-blue-400">
          CMS Delivery API
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1">
          Articles & Insights
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">
          Content dynamically retrieved from the Markup Headless CMS articles content model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={`/articles/${art.slug}`}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {art.taxonomies?.map((t: any) => (
                  <span
                    key={t.id}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    {t.name}
                  </span>
                ))}
                <span className="text-[11px] text-slate-500 font-mono">
                  {art.data?.read_time || 5} min read
                </span>
              </div>

              <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {art.title}
              </h2>
              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                {art.data?.summary || art.seo?.description || ''}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 mt-4">
              <span>{art.data?.byline || 'Staff Writer'}</span>
              <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
