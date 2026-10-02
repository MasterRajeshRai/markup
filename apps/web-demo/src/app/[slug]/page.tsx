import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cmsClient } from '@/lib/cms-client';
import { BlockRenderer } from '@/components/block-renderer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await cmsClient.getEntry(slug);
    const entry = res.data;
    if (!entry) return { title: 'Page Not Found' };

    return {
      title: `${entry.title} | Markup Digital`,
      description: entry.seo?.description || entry.data?.summary || 'Markup Enterprise CMS Page',
      openGraph: {
        title: entry.title,
        description: entry.seo?.description || entry.data?.summary || '',
      },
    };
  } catch {
    return { title: 'Page Not Found' };
  }
}

export default async function DynamicCMSPage({ params }: PageProps) {
  const { slug } = await params;
  let page: any = null;

  try {
    const res = await cmsClient.getEntry(slug);
    page = res.data;
  } catch {
    notFound();
  }

  if (!page) notFound();

  const blocks = Array.isArray(page.blocks) ? page.blocks : [];

  return (
    <main className="min-h-screen">
      {/* Schema.org WebPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description: page.seo?.description || page.data?.summary || '',
            datePublished: page.publishedAt || page.createdAt,
            dateModified: page.updatedAt,
          }),
        }}
      />

      {/* If page has blocks, render them */}
      {blocks.length > 0 ? (
        <div className="space-y-12 pb-24">
          {blocks.map((block: any, idx: number) => (
            <BlockRenderer key={block.id || idx} block={block} />
          ))}
        </div>
      ) : (
        /* Default Page Hero & Body container */
        <article className="max-w-4xl mx-auto px-6 py-16 space-y-8">
          <div className="space-y-3 border-b border-slate-800 pb-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {page.title}
            </h1>
            {page.data?.summary && (
              <p className="text-base text-slate-300 leading-relaxed">{page.data.summary}</p>
            )}
          </div>

          {page.data?.content && (
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
              {page.data.content}
            </div>
          )}
        </article>
      )}
    </main>
  );
}
