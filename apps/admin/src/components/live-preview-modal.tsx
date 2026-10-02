'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  Check,
  Eye,
  Calendar,
  Clock,
  User,
  Share2,
  RefreshCw,
  DollarSign,
  Megaphone,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { BlockNode } from '@headless/core';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  typeSlug: string;
  entryId: string;
  data: Record<string, any>;
  blocks: BlockNode[];
  status: string;
}

export function LivePreviewModal({
  isOpen,
  onClose,
  title,
  typeSlug,
  entryId,
  data,
  blocks,
  status,
}: LivePreviewModalProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'rendered' | 'iframe'>('rendered');
  const [customFrontendUrl, setCustomFrontendUrl] = useState('http://localhost:3000');
  const [showAdsSimulation, setShowAdsSimulation] = useState(!data?.disableAds);

  if (!isOpen) return null;

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/api/v1/content/${entryId}?preview=true&token=prv_mock_${entryId.slice(0, 8)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[390px] border-x-[8px] border-t-[16px] border-b-[24px] border-neutral-800 rounded-[44px] shadow-2xl';
      case 'tablet':
        return 'max-w-[768px] border-[8px] border-neutral-800 rounded-[28px] shadow-2xl';
      case 'desktop':
      default:
        return 'w-full max-w-4xl shadow-md border rounded-xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-md animate-in fade-in-50 duration-200">
      {/* ── Top Control Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
            <Eye className="h-3.5 w-3.5" />
            <span>Interactive Live Preview</span>
          </div>
          <Badge
            variant={status === 'PUBLISHED' ? 'success' : 'secondary'}
            className="text-[10px] font-mono uppercase"
          >
            {status}
          </Badge>
          <span className="text-xs text-muted-foreground truncate hidden md:inline">
            /{typeSlug}/{entryId}
          </span>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            size="sm"
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
            onClick={() => setViewport('desktop')}
            className={cn('h-7.5 px-3 text-xs gap-1.5 cursor-pointer', viewport === 'desktop' && 'bg-background shadow-xs font-semibold')}
            title="Desktop View (100%)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button
            size="sm"
            variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
            onClick={() => setViewport('tablet')}
            className={cn('h-7.5 px-3 text-xs gap-1.5 cursor-pointer', viewport === 'tablet' && 'bg-background shadow-xs font-semibold')}
            title="Tablet View (768px)"
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </Button>
          <Button
            size="sm"
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
            onClick={() => setViewport('mobile')}
            className={cn('h-7.5 px-3 text-xs gap-1.5 cursor-pointer', viewport === 'mobile' && 'bg-background shadow-xs font-semibold')}
            title="Mobile View (390px)"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
        </div>

        {/* Center-Right: AdSense Placement Preview Toggle */}
        <Button
          size="sm"
          variant={showAdsSimulation ? 'secondary' : 'ghost'}
          onClick={() => setShowAdsSimulation(!showAdsSimulation)}
          className={cn(
            'h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer',
            showAdsSimulation && 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-semibold border border-amber-500/30'
          )}
          title="Toggle simulated Google AdSense placements in preview"
        >
          <DollarSign className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">{showAdsSimulation ? 'Ads Preview: ON' : 'Ads Preview: OFF'}</span>
        </Button>

        {/* Right: Share, Next.js Mode & Close */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyShareLink}
            className="h-8 text-xs gap-1.5 cursor-pointer"
            title="Copy signed preview link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share Draft Link'}</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-lg cursor-pointer"
            title="Close Preview (ESC)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Viewport Stage ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-muted/40">
        <div
          className={cn(
            'bg-card text-card-foreground transition-all duration-300 min-h-[85vh] overflow-hidden flex flex-col',
            getViewportWidth()
          )}
        >
          {/* Simulated Browser Address Bar for Mobile & Tablet */}
          {viewport !== 'desktop' && (
            <div className="h-6 bg-neutral-900 flex items-center justify-center shrink-0">
              <div className="h-3.5 w-20 bg-neutral-800 rounded-full" />
            </div>
          )}

          {/* Rendered Frontend Website Shell */}
          <div className="p-6 sm:p-10 md:p-12 space-y-8 flex-1">
            {/* Header / Meta */}
            <header className="space-y-4 border-b pb-8">
              <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider">
                <span>{typeSlug}</span>
                <span>•</span>
                <span className="text-muted-foreground">{data.read_time ? `${data.read_time} min read` : '5 min read'}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {title || 'Untitled Document'}
              </h1>

              {data.summary && (
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {data.summary}
                </p>
              )}

              {/* Byline / Date */}
              <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {data.byline ? data.byline.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{data.byline || 'Editorial Staff'}</div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">Verified Live Preview</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Image if present */}
            {data.featured_image && (
              <div className="rounded-xl overflow-hidden border bg-muted aspect-video relative">
                <img
                  src={data.featured_image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* AdSense Suppression Notice */}
            {data.disableAds && showAdsSimulation && (
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center justify-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Monetization Notice: AdSense ads are explicitly disabled for this entry.</span>
              </div>
            )}

            {/* Header Leaderboard Ad Preview */}
            {!data.disableAds && showAdsSimulation && (
              <div className="p-3 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 text-center text-xs text-amber-700 dark:text-amber-300 font-semibold space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Megaphone className="h-3.5 w-3.5 text-amber-500" />
                  <span>Google AdSense Header Leaderboard (728×90)</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">Slot ID #1092837461 • Responsive Banner</div>
              </div>
            )}

            {/* Dynamic Blocks Body */}
            <article className="space-y-6">
              {blocks.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                  No visual blocks added yet. Use the block editor to add headings, text, callouts, or media.
                </div>
              ) : (
                (() => {
                  let paragraphCounter = 0;
                  return blocks.map((b) => {
                    const d: any = (b as any).data || {};
                    const bType: string = (b as any).type || '';

                    if (bType === 'hero') {
                      return (
                        <div key={b.id} className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border space-y-3">
                          {d.badge && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                              {String(d.badge)}
                            </span>
                          )}
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{String(d.title || '')}</h2>
                          {d.subtitle && <p className="text-sm text-muted-foreground">{String(d.subtitle)}</p>}
                          {d.primaryCta?.label && (
                            <div className="pt-2">
                              <span className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs">
                                {String(d.primaryCta.label)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (bType === 'heading') {
                      const level = Number(d.level) || 2;
                      return level === 1 ? (
                        <h1 key={b.id} className="text-2xl sm:text-3xl font-bold text-foreground pt-4">{String(d.text || '')}</h1>
                      ) : level === 2 ? (
                        <h2 key={b.id} className="text-xl sm:text-2xl font-bold text-foreground pt-3">{String(d.text || '')}</h2>
                      ) : (
                        <h3 key={b.id} className="text-lg sm:text-xl font-semibold text-foreground pt-2">{String(d.text || '')}</h3>
                      );
                    }

                    if (bType === 'paragraph' || bType === 'text' || bType === 'rich_text') {
                      paragraphCounter++;
                      const injectAd = !data.disableAds && showAdsSimulation && (paragraphCounter === 2 || paragraphCounter === 5);
                      return (
                        <React.Fragment key={b.id}>
                          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                            {String(d.text || d.content || '')}
                          </p>
                          {injectAd && (
                            <div className="my-4 p-4 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 text-center text-xs text-amber-700 dark:text-amber-300 font-semibold space-y-1">
                              <div className="flex items-center justify-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                                <span>In-Article Native Ad (Post Paragraph {paragraphCounter})</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                Slot ID #{paragraphCounter === 2 ? '4920194820' : '8392019481'} • Auto-Injected Native Unit
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    }

                    if (bType === 'callout') {
                      return (
                        <div key={b.id} className="p-4 rounded-xl border-l-4 border-l-blue-500 bg-blue-500/10 border space-y-1">
                          {d.title && <div className="font-bold text-sm text-foreground">{String(d.title)}</div>}
                          <p className="text-xs sm:text-sm text-muted-foreground">{String(d.text || d.content || '')}</p>
                        </div>
                      );
                    }

                    if (bType === 'quote') {
                      return (
                        <blockquote key={b.id} className="p-4 border-l-4 border-primary pl-4 italic text-sm sm:text-base text-foreground/90 my-4 bg-muted/20 rounded-r-lg">
                          &ldquo;{String(d.quote || d.text || '')}&rdquo;
                          {d.author && <div className="not-italic text-xs font-semibold text-muted-foreground mt-2">— {String(d.author)}</div>}
                        </blockquote>
                      );
                    }

                    if (bType === 'image') {
                      return (
                        <figure key={b.id} className="space-y-2 my-4">
                          <div className="rounded-xl overflow-hidden border bg-muted">
                            <img src={String(d.url || '')} alt={String(d.alt || '')} className="w-full max-h-96 object-cover" />
                          </div>
                          {d.caption && <figcaption className="text-center text-xs text-muted-foreground">{String(d.caption)}</figcaption>}
                        </figure>
                      );
                    }

                    if (bType === 'code') {
                      return (
                        <div key={b.id} className="my-4 rounded-xl overflow-hidden border bg-neutral-950 text-neutral-100 font-mono text-xs">
                          {d.language && (
                            <div className="px-4 py-1.5 border-b border-neutral-800 text-[11px] text-neutral-400">
                              {String(d.language)}
                            </div>
                          )}
                          <pre className="p-4 overflow-x-auto">
                            <code>{String(d.code || '')}</code>
                          </pre>
                        </div>
                      );
                    }

                    // Default block fallback
                    return (
                      <div key={b.id} className="p-4 rounded-lg border bg-muted/10 text-xs">
                        <span className="font-semibold uppercase text-muted-foreground text-[10px]">{bType} Block</span>
                        <pre className="mt-1 text-[11px] text-foreground/80 overflow-x-auto">
                          {JSON.stringify(d, null, 2)}
                        </pre>
                      </div>
                    );
                  });
                })()
              )}
            </article>

            {/* Mobile Sticky Bottom Anchor Ad Preview */}
            {!data.disableAds && showAdsSimulation && viewport === 'mobile' && (
              <div className="sticky bottom-0 left-0 right-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-2.5 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 text-white text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xl z-20">
                <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                <span>Mobile Sticky Footer Ad (320×50)</span>
              </div>
            )}

            {/* Footer */}
            <footer className="border-t pt-8 text-center text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Headless CMS Live Frontend Preview • All rights reserved</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
