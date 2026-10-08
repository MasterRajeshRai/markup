import React from 'react';
import { cmsClient } from '@/lib/cms-client';
import { BlockRenderer } from '@/components/block-renderer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let homeEntry: any = null;
  let errorMsg = null;

  try {
    const res = await cmsClient.getEntry('home');
    homeEntry = res.data;
  } catch (err: any) {
    errorMsg = err.message;
  }

  if (!homeEntry) {
    return (
      <div className="py-24 text-center max-w-xl mx-auto px-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Connecting to Markup CMS...</h1>
        <p className="text-xs text-slate-400">
          Make sure the CMS API is running at <code>http://localhost:3000</code>.
        </p>
      </div>
    );
  }

  const blocks = Array.isArray(homeEntry.blocks) ? homeEntry.blocks : [];

  return (
    <div>
      {/* Schema.org JSON-LD from CMS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: homeEntry.title,
            description: homeEntry.seo?.description || '',
          }),
        }}
      />

      {/* Render Dynamic Visual Blocks from Headless CMS */}
      {blocks.map((block: any) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
