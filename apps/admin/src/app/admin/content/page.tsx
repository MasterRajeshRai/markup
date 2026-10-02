'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  FileText, Plus, Search, Edit, Trash2, Send,
  ChevronDown, Globe, Clock, CheckCircle2, X,
  LayoutGrid, List, Filter, SlidersHorizontal, Lock, UserCheck,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';

interface EntryItem {
  id: string; slug: string; title: string; status: string;
  locale: string; contentType: string; currentVersion?: number;
  publishedAt?: string; updatedAt: string;
  author?: { id?: string; name: string; email?: string } | null;
}
interface ContentTypeSummary { id: string; name: string; slug: string; }

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PUBLISHED:  { label: 'Published',  className: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  DRAFT:      { label: 'Draft',      className: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' },
  IN_REVIEW:  { label: 'In Review',  className: 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  APPROVED:   { label: 'Approved',   className: 'bg-blue-500/12 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  SCHEDULED:  { label: 'Scheduled',  className: 'bg-violet-500/12 text-violet-700 dark:text-violet-400 border-violet-500/20' },
  ARCHIVED:   { label: 'Archived',   className: 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border', cfg.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
}

function SelectFilter({
  value, onChange, children, placeholder,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode; placeholder: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-8 appearance-none rounded-lg border bg-background pl-3 pr-8 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

const DEFAULT_CONTENT_TYPES: ContentTypeSummary[] = [
  { id: 'articles', name: 'Articles (Blog Posts)', slug: 'articles' },
  { id: 'pages', name: 'Pages', slug: 'pages' },
  { id: 'products', name: 'Products', slug: 'products' },
  { id: 'faqs', name: 'FAQs', slug: 'faqs' },
];

const MOCK_ENTRIES: EntryItem[] = [
  {
    id: 'art-1',
    slug: 'getting-started-with-headless-architecture',
    title: 'Getting Started with Modern Headless Architecture',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 3,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_admin_01', name: 'Sarah Connor (Super Admin)', email: 'admin@headless.io' },
  },
  {
    id: 'art-2',
    slug: 'mastering-visual-block-composition',
    title: 'Mastering Visual Block Composition in Enterprise CMS',
    status: 'DRAFT',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 1,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_editor_01', name: 'Marcus Vance (Lead Editor)', email: 'editor@headless.io' },
  },
  {
    id: 'art-3',
    slug: 'multi-site-and-localization-at-scale',
    title: 'Multi-Site and Global Localization at Enterprise Scale',
    status: 'APPROVED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 2,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_reviewer_01', name: 'David Kim (Fact Checker)', email: 'reviewer@headless.io' },
  },
  {
    id: 'art-4',
    slug: 'practical-guide-to-jamstack-nextjs-15',
    title: 'Practical Guide to Jamstack and Next.js 15 App Router',
    status: 'DRAFT',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 2,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_author_01', name: 'Elena Rostova (Staff Author)', email: 'author@headless.io' },
  },
  {
    id: 'art-5',
    slug: 'optimizing-web-vitals-image-pipelines',
    title: 'Optimizing Web Vitals with High-Efficiency WebP Pipelines',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 1,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_author_01', name: 'Elena Rostova (Staff Author)', email: 'author@headless.io' },
  },
  {
    id: 'pg-1',
    slug: 'home',
    title: 'Home — Acme Enterprise Platform',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'pages',
    currentVersion: 4,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_admin_01', name: 'Sarah Connor (Super Admin)', email: 'admin@headless.io' },
  },
  {
    id: 'pg-2',
    slug: 'about-us',
    title: 'About Acme Digital Cloud Solutions',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'pages',
    currentVersion: 2,
    updatedAt: new Date().toISOString(),
    author: { id: 'user_editor_01', name: 'Marcus Vance (Lead Editor)', email: 'editor@headless.io' },
  },
];

export default function ContentListPage() {
  const router = useRouter();
  const { user, canViewAllContent } = useAuth();
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine'>('all');
  const [entries, setEntries] = useState<EntryItem[]>(MOCK_ENTRIES);
  const [contentTypes, setContentTypes] = useState<ContentTypeSummary[]>(DEFAULT_CONTENT_TYPES);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newType, setNewType] = useState('articles');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const typeParam = new URLSearchParams(window.location.search).get('type');
      if (typeParam) {
        setSelectedType(typeParam);
        setNewType(typeParam);
      }
    }
  }, []);

  const isOwnEntry = (entry: EntryItem) => {
    if (!user) return true;
    const author = entry.author as any;
    if (!author) return false;
    return (
      author.id === user.id ||
      author.email === user.email ||
      (user.name && author.name?.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()))
    );
  };

  const getFilteredMockEntries = () => {
    let filtered = [...MOCK_ENTRIES];
    if (!canViewAllContent || scopeFilter === 'mine') {
      filtered = filtered.filter(isOwnEntry);
    }
    if (selectedType) filtered = filtered.filter(e => e.contentType === selectedType);
    if (selectedStatus) filtered = filtered.filter(e => e.status === selectedStatus);
    if (search) filtered = filtered.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.slug.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  };

  const fetchEntries = () => {
    const params = new URLSearchParams();
    if (!canViewAllContent || scopeFilter === 'mine') {
      params.set('author', 'me');
    }
    if (selectedType) params.set('type', selectedType);
    if (selectedStatus) params.set('status', selectedStatus);
    if (search) params.set('q', search);

    fetch(`/api/v1/content?${params}`)
      .then(r => r.json()).then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          let list = res.data;
          if (!canViewAllContent || scopeFilter === 'mine') {
            list = list.filter(isOwnEntry);
          }
          setEntries(list);
        } else {
          setEntries(getFilteredMockEntries());
        }
        setLoading(false);
      })
      .catch(() => {
        setEntries(getFilteredMockEntries());
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/v1/content-types').then(r => r.json()).then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setContentTypes(res.data);
        if (res.data[0] && !selectedType) setNewType(res.data[0].slug);
      } else {
        setContentTypes(DEFAULT_CONTENT_TYPES);
      }
    }).catch(() => {
      setContentTypes(DEFAULT_CONTENT_TYPES);
    });
  }, []);

  useEffect(() => { fetchEntries(); }, [selectedType, selectedStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateError(null);
    const res = await fetch('/api/v1/content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentTypeSlug: newType, title: newTitle, slug: newSlug }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error || 'Failed to create entry'); return; }
    setIsCreateOpen(false); setNewTitle(''); setNewSlug('');
    router.push(`/admin/content/${newType}/${data.entry.id}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/v1/content/${id}`, { method: 'DELETE' }); fetchEntries();
  };

  const handlePublish = async (id: string) => {
    await fetch(`/api/v1/content/${id}/publish`, { method: 'POST' }); fetchEntries();
  };

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = entries.filter(e => e.status === s).length; return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Content Entries</h1>
            {!canViewAllContent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="h-3 w-3" />
                Your Work Only
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Browse, author, and publish entries across all content models.</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {canViewAllContent && (
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => { setScopeFilter('all'); }}
                className={cn(
                  'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
                  scopeFilter === 'all'
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                All Content
              </button>
              <button
                type="button"
                onClick={() => { setScopeFilter('mine'); }}
                className={cn(
                  'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
                  scopeFilter === 'mine'
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                My Entries
              </button>
            </div>
          )}
          <Button size="sm" className="h-8.5 px-3.5 gap-1.5 text-xs font-semibold cursor-pointer" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Entry
          </Button>
        </div>
      </div>

      {/* Limited User Ownership Scope Banner */}
      {!canViewAllContent && user && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Lock className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="font-medium truncate">
              Authorship Scoped: Logged in as <strong className="font-semibold text-foreground">{user.name}</strong> ({user.roleName || user.role}). Only content entries created or worked on by you are displayed.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono text-[10px] shrink-0 font-semibold">
            RBAC PROTECTED
          </span>
        </div>
      )}

      {/* Status tab strip with horizontal scroll on mobile */}
      <div className="flex items-center gap-1 border-b pb-1 overflow-x-auto thin-scrollbar flex-nowrap">
        {[{ value: '', label: 'All', count: entries.length }, ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label, count: statusCounts[v] ?? 0 }))].map(tab => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={cn(
              'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0',
              selectedStatus === tab.value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn('ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold', selectedStatus === tab.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter bar - wraps on mobile */}
      <div className="flex flex-wrap items-center gap-2.5">
        <form onSubmit={e => { e.preventDefault(); fetchEntries(); }} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title or slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); fetchEntries(); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        <SelectFilter value={selectedType} onChange={setSelectedType} placeholder="All Models">
          <option value="">All Models</option>
          {contentTypes.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
        </SelectFilter>

        {(selectedType || selectedStatus || search) && (
          <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground" onClick={() => { setSelectedType(''); setSelectedStatus(''); setSearch(''); }}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">{entries.length} entries</span>
      </div>

      {/* Table - responsive horizontal scroll container */}
      <div className="rounded-xl border bg-card overflow-x-auto thin-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Model</th>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Locale</th>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Version</th>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Author</th>
              <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="py-3.5 px-4"><div className="h-3.5 bg-muted/60 rounded animate-pulse" style={{ width: j === 0 ? '60%' : j === 6 ? '40px' : '70%' }} /></td>
                  ))}
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No entries found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search || selectedType || selectedStatus ? 'Try adjusting your filters' : 'Create your first content entry to get started'}
                  </p>
                  {!search && !selectedType && !selectedStatus && (
                    <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-3.5 w-3.5" /> Create Entry
                    </Button>
                  )}
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-3 px-4 max-w-[280px]">
                    <Link href={`/admin/content/${entry.contentType}/${entry.id}`} className="font-semibold text-foreground hover:text-primary transition-colors block truncate">
                      {entry.title}
                    </Link>
                    <span className="text-[11px] text-muted-foreground font-mono truncate block">/{entry.slug}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-medium capitalize">{entry.contentType}</span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={entry.status} /></td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Globe className="h-3 w-3" /> {entry.locale}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">v{entry.currentVersion || 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {(entry.author?.name || 'S')[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{entry.author?.name || 'Staff'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/content/${entry.contentType}/${entry.id}`}>
                        <Button variant="ghost" size="icon" className="h-7.5 w-7.5 hover:bg-primary/10 hover:text-primary cursor-pointer" title="Edit">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {entry.status !== 'PUBLISHED' && (
                        <Button variant="ghost" size="icon" className="h-7.5 w-7.5 hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer" onClick={() => handlePublish(entry.id)} title="Publish">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7.5 w-7.5 hover:bg-destructive/10 hover:text-destructive cursor-pointer" onClick={() => handleDelete(entry.id, entry.title)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-sm font-bold">New Content Entry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Select a content model and set the entry identity</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-5 space-y-4">
                {createError && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">{createError}</div>
                )}
                <div>
                  <label className="text-xs font-semibold">Content Model</label>
                  <div className="relative mt-1">
                    <select value={newType} onChange={e => setNewType(e.target.value)} required
                      className="w-full h-9 appearance-none rounded-lg border bg-background px-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {contentTypes.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold">Title</label>
                  <Input required value={newTitle} onChange={e => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} placeholder="e.g. Next-Generation Cloud Infrastructure" className="mt-1 h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold">URL Slug</label>
                  <Input required value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="next-generation-cloud-infrastructure" className="mt-1 h-9 text-xs font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-4 border-t bg-muted/20 rounded-b-2xl">
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="text-xs gap-1"><Plus className="h-3.5 w-3.5" /> Create & Open</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
