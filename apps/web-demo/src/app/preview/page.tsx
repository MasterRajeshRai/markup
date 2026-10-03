import React from 'react';
import { cmsClient } from '@/lib/cms-client';
import { BlockRenderer } from '@/components/block-renderer';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; entryId?: string }>;
}) {
  const { token, entryId } = await searchParams;

  if (!token || !entryId) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-6 space-y-2">
        <h1 className="text-xl font-bold text-slate-900">Missing Preview Credentials</h1>
        <p className="text-xs text-slate-600">A signed preview token and entryId parameter are required.</p>
      </div>
    );
  }

  let entry: any = null;
  let errorMsg = null;

  try {
    const res = await cmsClient.getEntry(entryId, token);
    entry = res.data;
  } catch (err: any) {
    errorMsg = err.message;
  }

  if (!entry) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-6 space-y-2">
        <h1 className="text-xl font-bold text-rose-600">Invalid or Expired Preview Token</h1>
        <p className="text-xs text-slate-600">{errorMsg || 'The preview token has expired or is invalid.'}</p>
      </div>
    );
  }

  const blocks = Array.isArray(entry.blocks) ? entry.blocks : [];

  return (
    <div>
      {/* Top Preview Banner */}
      <div className="sticky top-16 z-30 bg-amber-500 text-slate-950 px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
        <span>PREVIEW MODE — Viewing unpublished draft (Version {entry.currentVersion || 1})</span>
        <span className="font-mono text-xs bg-amber-600/30 px-2.5 py-0.5 rounded font-bold">
          Status: {entry.status}
        </span>
      </div>

      <div className="py-8 max-w-4xl mx-auto px-6 text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 font-sans">{entry.title}</h1>
        <p className="text-sm text-slate-600 font-mono">Slug: /{entry.slug}</p>
      </div>

      {blocks.map((block: any) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
