'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileCode,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface PageEntry {
  id: string;
  slug: string;
  title: string;
  status: string;
  locale: string;
  contentType: string;
  currentVersion?: number;
  publishedAt?: string;
  updatedAt: string;
  author?: { name: string } | null;
}

export default function PagesManagementPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create page modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('type', 'pages');
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('q', search);

    fetch(`/api/v1/content?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setPages(res.data);
        } else {
          // If no type=pages, fetch all and filter client side
          fetch('/api/v1/content')
            .then((r) => r.json())
            .then((allRes) => {
              if (allRes.data) {
                const filtered = allRes.data.filter(
                  (item: PageEntry) =>
                    item.contentType?.toLowerCase() === 'page' ||
                    item.contentType?.toLowerCase() === 'pages'
                );
                setPages(filtered.length > 0 ? filtered : allRes.data.slice(0, 8));
              }
              setLoading(false);
            });
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const res = await fetch('/api/v1/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTypeSlug: 'pages',
          title,
          slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create page');
        setCreating(false);
        return;
      }

      setIsCreateOpen(false);
      setTitle('');
      setSlug('');
      router.push(`/admin/content/pages/${data.entry.id}`);
    } catch {
      setError('An unexpected error occurred');
      setCreating(false);
    }
  };

  const handlePublish = async (id: string) => {
    await fetch(`/api/v1/content/${id}/publish`, { method: 'POST' });
    fetchPages();
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`Are you sure you want to delete page "${pageTitle}"?`)) return;
    await fetch(`/api/v1/content/${id}`, { method: 'DELETE' });
    fetchPages();
  };

  const publishedCount = pages.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = pages.filter((p) => p.status === 'DRAFT').length;

  return (
    <ModuleGuard moduleId="content_core">
      <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pages</h1>
            <Badge variant="secondary" className="text-xs font-mono">
              {pages.length} Pages
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Build and publish hierarchical website landing pages, marketing pages, and legal layouts.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Create Page</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Pages</div>
            <div className="text-2xl font-bold mt-0.5">{pages.length}</div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Live / Published</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{publishedCount}</div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Drafts In Progress</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{draftCount}</div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm">
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPages();
            }}
            className="relative w-full md:w-80"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-36"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchPages} className="h-9 text-xs">
              Filter
            </Button>
          </div>
        </div>

        {/* Pages Table */}
        <div className="border-t">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">Loading pages directory...</div>
          ) : pages.length === 0 ? (
            <div className="py-16 text-center">
              <FileCode className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <div className="text-sm font-semibold">No pages found</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No landing pages match your search criteria. Create a new page to begin structuring your site layout.
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="sm" className="mt-4 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Create First Page</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Page Title & Path</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Locale</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pages.map((p) => {
                    const isPublished = p.status === 'PUBLISHED';
                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/content/${p.contentType === 'page' ? 'pages' : (p.contentType || 'pages')}/${p.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <FileCode className="h-3.5 w-3.5 text-primary" />
                            <span>{p.title}</span>
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            /{p.slug}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              isPublished
                                ? 'success'
                                : p.status === 'DRAFT'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-[10px]"
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {p.locale || 'en-US'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          v{p.currentVersion || 1}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`http://localhost:3001/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View on Frontend"
                            >
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                            <Link href={`/admin/content/${p.contentType === 'page' ? 'pages' : (p.contentType || 'pages')}/${p.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit in Block Builder">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            {!isPublished && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublish(p.id)}
                                className="h-7 px-2 text-[11px] text-emerald-600 hover:text-emerald-700"
                              >
                                Publish
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(p.id, p.title)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete Page"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Create Page Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md shadow-2xl border">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Create New Page</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Add a new dynamic landing page and begin editing in the Visual Block Editor.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateSubmit}>
              <CardContent className="space-y-4 pt-4">
                {error && (
                  <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Page Title</label>
                  <Input
                    required
                    placeholder="e.g. About Our Mission"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">URL Slug</label>
                  <Input
                    required
                    placeholder="e.g. about-our-mission"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                  <div className="text-[10px] text-muted-foreground">
                    Public preview route: <code className="text-foreground">/{slug || 'slug'}</code>
                  </div>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 border-t p-4 bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creating} className="text-xs gap-1.5">
                  {creating ? 'Creating...' : 'Create & Open Editor'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
    </ModuleGuard>
  );
}
