import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cmsClient } from '@/lib/cms-client';
import { BlockRenderer } from '@/components/block-renderer';

export const dynamic = 'force-dynamic';

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article: any = null;

  try {
    const res = await cmsClient.getEntry(slug);
    article = res.data;
  } catch {
    notFound();
  }

  if (!article) notFound();

  const blocks = Array.isArray(article.blocks) ? article.blocks : [];

  return (
    <article className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      {/* Schema.org Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.data?.summary || '',
            datePublished: article.publishedAt,
            author: { '@type': 'Person', name: article.data?.byline || 'PPS Editorial Cell' },
          }),
        }}
      />

      <div className="space-y-4 border-b border-slate-200 pb-8 text-center max-w-2xl mx-auto">
        <Link
          href="/articles"
          className="text-sm font-bold text-blue-700 hover:underline inline-block mb-2"
        >
          ← Back to Articles
        </Link>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight font-sans">
          {article.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">{article.data?.summary}</p>
        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-slate-500 pt-2 font-mono">
          <span>By {article.data?.byline || 'PPS Editorial Cell'}</span>
          <span>•</span>
          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>v{article.currentVersion || 1}</span>
        </div>
      </div>

      {/* Render Visual Blocks from CMS */}
      <div className="space-y-4">
        {blocks.map((b: any) => (
          <BlockRenderer key={b.id} block={b} />
        ))}
      </div>
    </article>
  );
}
