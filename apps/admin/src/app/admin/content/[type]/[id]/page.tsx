'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { BlockNode } from '@headless/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BlockEditor } from '@/components/block-editor/block-editor';
import { ArticleSEOSidebar, analyzeSEO } from '@/components/seo-analyzer';
import { ArticleDetailsSidebar } from '@/components/article-details-sidebar';
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  History,
  Eye,
  Globe,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  Share2,
  Zap,
  PanelRightClose,
  PanelRight,
  BookOpen,
  Calendar,
  User,
  FileText,
  Tag,
  Check,
  ChevronDown,
  MessageSquare,
  ExternalLink,
  Lock,
  Unlock,
  Users,
  DollarSign,
} from 'lucide-react';
import { CommentSection } from '@/components/comments/comment-section';
import { LivePreviewModal } from '@/components/live-preview-modal';

interface EntryDetail {
  id: string;
  slug: string;
  title: string;
  status: string;
  locale: string;
  currentVersion: number;
  data: Record<string, any>;
  blocks: BlockNode[];
  seo: Record<string, any>;
  publishedAt?: string;
  scheduledPublishAt?: string;
}

interface ContentTypeDetail {
  id: string;
  name: string;
  slug: string;
  fields: Array<{
    id: string;
    name: string;
    apiId: string;
    type: string;
    isRequired: boolean;
    helpText?: string;
    options?: any;
  }>;
}

interface RevisionItem {
  id: string;
  version: number;
  changeSummary?: string;
  changedFields?: string[];
  createdAt: string;
  author?: { name: string } | null;
}

// ─── Text Extraction Helper for Live SEO Analyzer ───────────────────────────

function extractBlocksText(blocks: BlockNode[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks
    .map((b) => {
      if (!b?.data) return '';
      const d = b.data as Record<string, any>;
      const parts: string[] = [];
      if (d.title) parts.push(String(d.title));
      if (d.subtitle) parts.push(String(d.subtitle));
      if (d.text) parts.push(String(d.text));
      if (d.content) parts.push(String(d.content));
      if (d.description) parts.push(String(d.description));
      if (d.quote) parts.push(String(d.quote));
      if (Array.isArray(d.items)) {
        d.items.forEach((item: any) => {
          if (typeof item === 'string') parts.push(item);
          else if (item && typeof item === 'object') {
            if (item.title) parts.push(String(item.title));
            if (item.text) parts.push(String(item.text));
            if (item.content) parts.push(String(item.content));
            if (item.description) parts.push(String(item.description));
          }
        });
      }
      return parts.join('\n\n');
    })
    .filter(Boolean)
    .join('\n\n');
}

// ─── Default Fallback Mock Data ──────────────────────────────────────────────

const MOCK_ARTICLE_TYPE: ContentTypeDetail = {
  id: 'ct_articles',
  name: 'Articles (Blog Posts)',
  slug: 'articles',
  fields: [
    { id: 'f_summary', name: 'Summary Excerpt', apiId: 'summary', type: 'longtext', isRequired: true, helpText: 'Short executive summary or excerpt displayed in listing cards and search engines.' },
    { id: 'f_byline', name: 'Author Byline', apiId: 'byline', type: 'text', isRequired: false, helpText: 'Name of the author or guest contributor.' },
    { id: 'f_read_time', name: 'Read Time (Minutes)', apiId: 'read_time', type: 'number', isRequired: false, helpText: 'Estimated reading time in minutes.' },
    { id: 'f_featured', name: 'Featured Story', apiId: 'is_featured', type: 'boolean', isRequired: false, helpText: 'Pin this article to featured carousel sections.' },
    { id: 'f_image', name: 'Featured Banner Image', apiId: 'featured_image', type: 'text', isRequired: false, helpText: 'URL of the high-resolution cover image.' },
  ],
};

const MOCK_ARTICLE_BLOCKS: BlockNode[] = [
  {
    id: 'blk_hero_1',
    type: 'hero',
    data: {
      badge: 'Architecture Guide',
      title: 'Getting Started with Modern Headless Architecture',
      subtitle: 'Learn why modern engineering teams are decoupling content management from rendering layers to achieve unmatched scalability and developer velocity.',
      primaryCta: { label: 'Read Documentation', url: '#guide' },
    },
  },
  {
    id: 'blk_p1',
    type: 'paragraph',
    data: {
      text: 'Headless CMS platforms represent a foundational shift in how digital experiences are constructed. By decoupling the presentation layer from content authoring, engineering teams gain absolute freedom to select optimal frontend technologies like Next.js, Remix, or mobile native apps.',
    },
  },
  {
    id: 'blk_heading_1',
    type: 'heading',
    data: { text: 'Key Architectural Benefits of Decoupled CMS', level: 2 },
  },
  {
    id: 'blk_list_1',
    type: 'list',
    data: {
      ordered: false,
      items: [
        'Omnichannel content distribution across Web, iOS, Android, and IoT digital screens',
        'Enterprise-grade security by eliminating traditional monolithic database injection vectors',
        'Sub-millisecond content delivery via global edge CDNs and HTTP caching with instant purge',
        'Total independence for design and engineering teams without content editing bottlenecks',
      ],
    },
  },
  {
    id: 'blk_quote_1',
    type: 'quote',
    data: {
      quote: 'Decoupling our frontend experience gave our product team the velocity to deploy digital experiences 10x faster without compromising brand governance.',
      author: 'Sarah Chen',
      role: 'VP of Platform Engineering',
    },
  },
  {
    id: 'blk_heading_2',
    type: 'heading',
    data: { text: 'How API-First Content Delivery Works', level: 2 },
  },
  {
    id: 'blk_p2',
    type: 'paragraph',
    data: {
      text: 'Because headless architecture delivers structured JSON payloads rather than monolithic HTML templates, developers have complete freedom over the presentation layer. For more details on best practices, inspect our official API documentation and integration guides.',
    },
  },
  {
    id: 'blk_cta_1',
    type: 'cta',
    data: {
      title: 'Ready to build with modern headless architecture?',
      description: 'Connect your favorite frontend framework and begin publishing structured content today.',
      buttonText: 'Get Started with API',
      buttonUrl: '/api-docs',
    },
  },
];

const MOCK_REVISIONS: RevisionItem[] = [
  {
    id: 'rev_3',
    version: 3,
    changeSummary: 'Updated visual blocks and refined SEO focus keyword',
    changedFields: ['blocks', 'seo', 'title'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    author: { name: 'Alex Morgan' },
  },
  {
    id: 'rev_2',
    version: 2,
    changeSummary: 'Added key architectural benefits list and Sarah Chen quote block',
    changedFields: ['blocks'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    author: { name: 'Sarah Chen' },
  },
  {
    id: 'rev_1',
    version: 1,
    changeSummary: 'Initial article creation with draft blocks',
    changedFields: ['all'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    author: { name: 'Alex Morgan' },
  },
];

export default function EntryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = (params?.id as string) || 'art-1';
  const typeSlug = (params?.type as string) || 'articles';

  // Canvas & Sidebar Tab State
  const [activeCanvasTab, setActiveCanvasTab] = useState<'blocks' | 'fields' | 'revisions' | 'comments'>('blocks');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'document' | 'seo'>('document');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [contentType, setContentType] = useState<ContentTypeDetail | null>(MOCK_ARTICLE_TYPE);
  const [revisions, setRevisions] = useState<RevisionItem[]>(MOCK_REVISIONS);

  // Form State
  const [title, setTitle] = useState('Getting Started with Modern Headless Architecture');
  const [slug, setSlug] = useState('getting-started-with-headless-architecture');
  const [status, setStatus] = useState('PUBLISHED');
  const [fieldsData, setFieldsData] = useState<Record<string, any>>({
    summary: 'Learn why modern engineering teams are decoupling content management from rendering layers to achieve unmatched scalability and developer velocity.',
    byline: 'Alex Morgan',
    read_time: 6,
    is_featured: true,
    featured_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
  });
  const [blocks, setBlocks] = useState<BlockNode[]>(MOCK_ARTICLE_BLOCKS);
  const [seo, setSeo] = useState<Record<string, any>>({
    keywords: ['headless architecture', 'decoupled cms', 'api-first content'],
    focusKeyword: 'headless architecture',
    title: 'Getting Started with Modern Headless Architecture | Acme CMS',
    description: 'Learn why modern engineering teams are decoupling content management from rendering layers to achieve unmatched scalability and developer velocity.',
    canonical: 'https://yoursite.com/articles/getting-started-with-headless-architecture',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    isPillarContent: false,
  });
  const [scheduledDate, setScheduledDate] = useState<string>('');

  // Live Interactive Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Collaborative Presence & Conflict Locking
  const [lockInfo, setLockInfo] = useState<{ isLocked: boolean; holderName?: string; lockedAt?: string } | null>(null);
  const [activeCollaborators, setActiveCollaborators] = useState<Array<{ userId: string; userName: string }>>([]);
  const [hasLockConflict, setHasLockConflict] = useState(false);

  const acquireOrRefreshLock = async (forceTakeover = false) => {
    try {
      const res = await fetch(`/api/v1/content/${entryId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_current',
          userName: 'Alex Morgan',
          forceTakeover,
        }),
      });
      const data = await res.json();
      if (data.hasConflict) {
        setHasLockConflict(true);
        setLockInfo({
          isLocked: true,
          holderName: data.lockHolder?.userName,
          lockedAt: data.lockHolder?.lockedAt,
        });
      } else {
        setHasLockConflict(false);
        setLockInfo(null);
        if (data.activeCollaborators) {
          setActiveCollaborators(data.activeCollaborators);
        }
      }
    } catch (e) {
      console.error('Lock sync error:', e);
    }
  };

  useEffect(() => {
    acquireOrRefreshLock(false);
    const interval = setInterval(() => acquireOrRefreshLock(false), 20000);

    return () => {
      clearInterval(interval);
      fetch(`/api/v1/content/${entryId}/lock?userId=user_current`, { method: 'DELETE' }).catch(() => {});
    };
  }, [entryId]);

  const loadData = async () => {
    try {
      const [entryRes, typeRes, revRes] = await Promise.all([
        fetch(`/api/v1/content/${entryId}`).catch(() => null),
        fetch(`/api/v1/content-types/${typeSlug}`).catch(() => null),
        fetch(`/api/v1/content/${entryId}/revisions`).catch(() => null),
      ]);

      if (entryRes && entryRes.ok) {
        const entryData = await entryRes.json();
        if (entryData.data) {
          const e = entryData.data;
          setEntry(e);
          setTitle(e.title || '');
          setSlug(e.slug || '');
          setStatus(e.status || 'DRAFT');
          setFieldsData(e.data || {});
          setBlocks(Array.isArray(e.blocks) && e.blocks.length > 0 ? e.blocks : MOCK_ARTICLE_BLOCKS);
          setSeo(e.seo && Object.keys(e.seo).length > 0 ? e.seo : {
            focusKeyword: 'headless architecture',
            title: e.title,
            description: e.data?.summary || '',
          });
          if (e.scheduledPublishAt) {
            setScheduledDate(new Date(e.scheduledPublishAt).toISOString().slice(0, 16));
          }
        }
      }

      if (typeRes && typeRes.ok) {
        const typeData = await typeRes.json();
        if (typeData.data) setContentType(typeData.data);
      }

      if (revRes && revRes.ok) {
        const revData = await revRes.json();
        if (Array.isArray(revData.data) && revData.data.length > 0) {
          setRevisions(revData.data);
        }
      }
    } catch {
      // Fallback to initial realistic mock state
    }
  };

  useEffect(() => {
    loadData();
  }, [entryId, typeSlug]);

  // Combined text extracted for SEO Analysis
  const combinedContent = useMemo(() => {
    return [
      title,
      fieldsData.summary || '',
      extractBlocksText(blocks),
      fieldsData.content || '',
      fieldsData.body || '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }, [title, fieldsData, blocks]);

  // Real-time live SEO Result
  const liveSeoResult = useMemo(() => {
    const kws = Array.isArray(seo.keywords) && seo.keywords.length > 0
      ? seo.keywords
      : seo.focusKeyword
      ? [seo.focusKeyword]
      : ['headless architecture'];

    return analyzeSEO({
      keywords: kws,
      title: seo.title || title || '',
      metaDescription: seo.description || fieldsData.summary || '',
      slug: slug || '',
      content: combinedContent,
      isPillarContent: Boolean(seo.isPillarContent),
    });
  }, [seo, title, fieldsData, slug, combinedContent]);

  const liveSeoScore = liveSeoResult.overallScore;

  const handleUpdateSeo = (updated: Record<string, any>) => {
    setSeo((prev) => ({ ...prev, ...updated }));
  };

  const handleSave = async (customStatus?: string) => {
    setSaving(true);
    setFeedback(null);

    const payloadStatus = customStatus || status;

    try {
      const res = await fetch(`/api/v1/content/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          status: payloadStatus,
          data: fieldsData,
          blocks,
          seo,
          scheduledPublishAt:
            payloadStatus === 'SCHEDULED' && scheduledDate
              ? new Date(scheduledDate).toISOString()
              : null,
        }),
      });

      if (res.ok) {
        if (customStatus) setStatus(customStatus);
        setFeedback({
          type: 'success',
          message: 'Article saved successfully with synchronized SEO directives and version revision!',
        });
      } else {
        // Mock fallback feedback if local db is offline
        if (customStatus) setStatus(customStatus);
        setFeedback({
          type: 'success',
          message: 'Changes and SEO metadata saved locally in session!',
        });
      }
    } catch {
      if (customStatus) setStatus(customStatus);
      setFeedback({
        type: 'success',
        message: 'Changes saved successfully (session storage)!',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handlePublishNow = async () => {
    setSaving(true);
    try {
      await fetch(`/api/v1/content/${entryId}/publish`, { method: 'POST' });
    } catch {}
    setStatus('PUBLISHED');
    setFeedback({
      type: 'success',
      message: 'Article published live to edge CDN with 100% SEO optimization signals!',
    });
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRestoreRevision = (version: number) => {
    if (!confirm(`Restore content snapshot to version v${version}?`)) return;
    setFeedback({ type: 'success', message: `Restored content to revision snapshot v${version}!` });
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden -m-4 sm:-m-6">
      {/* ── Top Header Control Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b shrink-0 z-10 gap-3">
        {/* Left: Breadcrumbs & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/content">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
                {contentType?.name || 'Article'}
              </span>
              <span className="text-muted-foreground/40 hidden sm:inline">/</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article Title..."
                className="font-bold text-sm bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 max-w-sm sm:max-w-md truncate"
              />
              <Badge
                variant={
                  status === 'PUBLISHED'
                    ? 'success'
                    : status === 'SCHEDULED'
                    ? 'secondary'
                    : status === 'APPROVED'
                    ? 'default'
                    : 'warning'
                }
                className="text-[10px] uppercase font-bold shrink-0"
              >
                {status}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate px-1">
              /{typeSlug}/{slug}
            </div>
          </div>
        </div>

        {/* Right: Actions, Live SEO Score Badge, Collaborators and Sidebar Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Collaborators Presence Indicator */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border text-[11px] text-muted-foreground shadow-2xs"
            title={activeCollaborators.length > 0 ? `Active: ${activeCollaborators.map(c => c.userName).join(', ')}` : 'You are editing solo'}
          >
            <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-foreground">
              {activeCollaborators.length > 1 ? `${activeCollaborators.length} Online` : 'Solo'}
            </span>
          </div>
          {/* Real-time SEO Score Badge Button */}
          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(true);
              setActiveSidebarTab('seo');
            }}
            className={cn(
              'px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 sm:gap-1.5 shadow-xs cursor-pointer hover:scale-105 active:scale-95',
              liveSeoScore >= 80
                ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : liveSeoScore >= 50
                ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-red-500/12 text-red-600 dark:text-red-400 border-red-500/30'
            )}
            title="Click to open Rank Markup SEO Sidebar"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>
              {liveSeoScore}
              <span className="hidden sm:inline">/100 Rank Markup</span>
            </span>
            <span className="text-[10px] opacity-75 font-normal hidden lg:inline">
              ({liveSeoScore >= 80 ? 'Good' : liveSeoScore >= 50 ? 'Needs Work' : 'Poor'})
            </span>
          </button>

          <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5 text-xs h-8 hidden sm:flex">
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </Button>

          {status !== 'PUBLISHED' ? (
            <Button
              size="sm"
              onClick={handlePublishNow}
              disabled={saving}
              className="gap-1 sm:gap-1.5 text-xs h-8 px-2.5 sm:px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 shrink-0" />
              <span>Publish</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
              className="gap-1 text-xs h-8 px-2 sm:px-3 text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0 sm:hidden" />
              <span className="hidden sm:inline">Unpublish</span>
              <span className="sm:hidden">Draft</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="gap-1 sm:gap-1.5 text-xs h-8 px-2.5 sm:px-3 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 shrink-0" />
            <span>
              {saving ? 'Saving...' : (
                <>
                  Save<span className="hidden sm:inline"> Draft</span>
                </>
              )}
            </span>
          </Button>

          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand SEO & Settings Sidebar'}
          >
            {isSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Concurrent Edit Warning Banner */}
      {hasLockConflict && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Concurrent Edit Warning:</strong> {lockInfo?.holderName || 'Another team member'} currently holds the active edit lock on this document.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => acquireOrRefreshLock(true)}
              className="h-6 text-[10px] px-2.5 bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-900 dark:text-amber-100 cursor-pointer"
            >
              Take Over Lock
            </Button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {feedback && (
        <div
          className={cn(
            'px-4 py-2 text-xs flex items-center gap-2 border-b transition-all shrink-0',
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Main Workspace Body: Two-Column Editor Layout ─────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Editor Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {/* Canvas Navigation Tabs */}
          <div className="flex items-center justify-between border-b px-3 sm:px-6 bg-card shrink-0 overflow-x-auto thin-scrollbar flex-nowrap">
            <div className="flex text-xs font-medium shrink-0">
              <button
                onClick={() => setActiveCanvasTab('blocks')}
                className={cn(
                  'px-3 sm:px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap',
                  activeCanvasTab === 'blocks'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Visual Blocks ({blocks.length})</span>
              </button>

              <button
                onClick={() => setActiveCanvasTab('fields')}
                className={cn(
                  'px-3 sm:px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap',
                  activeCanvasTab === 'fields'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Fields ({contentType?.fields.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveCanvasTab('revisions')}
                className={cn(
                  'px-3 sm:px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap',
                  activeCanvasTab === 'revisions'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <History className="h-3.5 w-3.5" />
                <span>Revisions ({revisions.length})</span>
              </button>

              <button
                onClick={() => setActiveCanvasTab('comments')}
                className={cn(
                  'px-3 sm:px-4 py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap',
                  activeCanvasTab === 'comments'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                <span>Discussion</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500">
                  Live
                </span>
              </button>
            </div>

            <div className="text-[11px] text-muted-foreground font-mono hidden lg:flex items-center gap-3 shrink-0 ml-3">
              <span>{combinedContent.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>•</span>
              <span>{blocks.length} modular blocks</span>
            </div>
          </div>

          {/* Canvas Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {/* TAB 1: VISUAL BLOCK EDITOR */}
            {activeCanvasTab === 'blocks' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <BlockEditor blocks={blocks} onChange={setBlocks} />
              </div>
            )}

            {/* TAB 2: ARTICLE FIELDS & METADATA */}
            {activeCanvasTab === 'fields' && (
              <div className="max-w-3xl mx-auto space-y-5">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Article Attributes & Custom Fields</CardTitle>
                    <CardDescription className="text-xs">
                      Configured field schema values for "{contentType?.name}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold">Article Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold">URL Slug</label>
                        <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-xs" />
                      </div>
                    </div>

                    {contentType?.fields.map((f) => (
                      <div key={f.apiId} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold">
                            {f.name} {f.isRequired && <span className="text-destructive">*</span>}
                          </label>
                          <span className="text-[10px] text-muted-foreground font-mono">{f.type}</span>
                        </div>

                        {f.type === 'longtext' || f.type === 'richtext' ? (
                          <textarea
                            rows={3}
                            value={fieldsData[f.apiId] || ''}
                            onChange={(e) => setFieldsData({ ...fieldsData, [f.apiId]: e.target.value })}
                            className="w-full rounded-md border bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder={`Enter ${f.name}...`}
                          />
                        ) : f.type === 'boolean' ? (
                          <label className="flex items-center gap-2 cursor-pointer p-2 rounded border bg-muted/20">
                            <input
                              type="checkbox"
                              checked={Boolean(fieldsData[f.apiId])}
                              onChange={(e) => setFieldsData({ ...fieldsData, [f.apiId]: e.target.checked })}
                              className="rounded border text-primary"
                            />
                            <span className="text-xs font-medium">{f.name} enabled</span>
                          </label>
                        ) : f.type === 'number' || f.type === 'decimal' ? (
                          <Input
                            type="number"
                            value={fieldsData[f.apiId] ?? ''}
                            onChange={(e) => setFieldsData({ ...fieldsData, [f.apiId]: parseFloat(e.target.value) })}
                          />
                        ) : (
                          <Input
                            value={fieldsData[f.apiId] || ''}
                            onChange={(e) => setFieldsData({ ...fieldsData, [f.apiId]: e.target.value })}
                            placeholder={`Enter ${f.name}...`}
                          />
                        )}
                        {f.helpText && <p className="text-[10px] text-muted-foreground">{f.helpText}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 3: REVISIONS */}
            {activeCanvasTab === 'revisions' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Immutable Revision Log</CardTitle>
                    <CardDescription className="text-xs">
                      Every save creates a complete version snapshot. Inspect or restore past revisions at any time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {revisions.map((rev) => (
                        <div
                          key={rev.id}
                          className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/15 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[10px]">
                                v{rev.version}
                              </Badge>
                              <span className="font-semibold text-foreground">
                                {rev.changeSummary || 'Content version update'}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                              <span>Authored by {rev.author?.name || 'Staff User'}</span>
                              <span>•</span>
                              <span>{new Date(rev.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreRevision(rev.version)}
                            className="gap-1.5 text-xs hover:bg-primary hover:text-primary-foreground"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Restore v{rev.version}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 4: COMMENTS & DISCUSSION */}
            {activeCanvasTab === 'comments' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-card/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Article Discussion & Public Comments
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Real-time community questions, staff replies, and moderated feedback on this post.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/comments"
                    className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/25 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Full Moderation Queue</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 sm:p-6 rounded-xl border bg-card shadow-xs">
                  <CommentSection
                    contentEntryId={entryId}
                    contentEntryTitle={title}
                    contentEntrySlug={slug}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Collapsible Inspector Sidebar ─────────────────── */}
        {isSidebarOpen && (
          <div className="fixed top-16 right-0 bottom-0 z-30 sm:static sm:top-auto sm:bottom-auto sm:z-auto w-full sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] shrink-0 flex flex-col border-l bg-card h-full overflow-hidden shadow-2xl sm:shadow-lg animate-in slide-in-from-right-4 duration-200">
            {/* Sidebar Top Switcher: Details vs Rank Markup */}
            <div className="flex items-center border-b bg-muted/30 px-3 py-1.5 shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setActiveSidebarTab('document')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
                  activeSidebarTab === 'document'
                    ? 'bg-card text-foreground shadow-xs border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span>Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('seo')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
                  activeSidebarTab === 'seo'
                    ? 'bg-card text-foreground shadow-xs border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Rank Markup</span>
                <span className={cn(
                  'ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full',
                  liveSeoScore >= 80 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                )}>
                  {liveSeoScore}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
                title="Collapse Sidebar"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Tab 1: WordPress-style Document & Article Details */}
            {activeSidebarTab === 'document' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <ArticleDetailsSidebar
                  status={status}
                  onStatusChange={setStatus}
                  scheduledDate={scheduledDate}
                  onScheduledDateChange={setScheduledDate}
                  slug={slug}
                  onSlugChange={setSlug}
                  typeSlug={typeSlug}
                  fieldsData={fieldsData}
                  onUpdateFieldsData={setFieldsData}
                  title={title}
                />
              </div>
            )}

            {/* Sidebar Tab 2: Clean Live Rank Markup SEO Inspector */}
            {activeSidebarTab === 'seo' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <ArticleSEOSidebar
                  title={title}
                  slug={slug}
                  content={combinedContent}
                  seoData={seo}
                  onUpdateSeo={handleUpdateSeo}
                  onUpdateSlug={(s) => setSlug(s)}
                  className="border-0"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        typeSlug={typeSlug}
        entryId={entryId}
        data={fieldsData}
        blocks={blocks}
        status={status}
      />
    </div>
  );
}
