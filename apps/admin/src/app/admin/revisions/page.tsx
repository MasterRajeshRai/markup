'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  History,
  Search,
  RotateCcw,
  Eye,
  FileText,
  Clock,
  User,
  ArrowRight,
  GitCommit,
  CheckCircle,
  Lock,
  UserCheck,
  Filter,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';
import { useAuth } from '@/components/auth-context';

interface RevisionSummary {
  id: string;
  version: number;
  entryTitle: string;
  entryId: string;
  contentType: string;
  authorName: string;
  authorId?: string | null;
  createdAt: string;
  changeSummary?: string;
  status: string;
}

export default function RevisionsHistoryPage() {
  const { user, canViewAllRevisions } = useAuth();
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine'>('all');

  const fetchRevisions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (!canViewAllRevisions || scopeFilter === 'mine') {
      params.set('author', 'me');
    }
    if (search) {
      params.set('q', search);
    }

    fetch(`/api/v1/revisions?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRevisions(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRevisions();
  }, [canViewAllRevisions, scopeFilter]);

  const filteredRevisions = revisions.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        r.entryTitle.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        r.contentType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ModuleGuard moduleId="revisions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Revisions</h1>
              <Badge variant="secondary" className="text-xs font-mono">
                Immutable History
              </Badge>
              {!canViewAllRevisions && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Lock className="h-3 w-3" />
                  Your Work Only
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Audit revision snapshots, track editorial changes over time, and compare or restore historical versions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Scoping Toggle for Authorized Users */}
            {canViewAllRevisions && (
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setScopeFilter('all')}
                  className={cn(
                    'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
                    scopeFilter === 'all'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All Revisions
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('mine')}
                  className={cn(
                    'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
                    scopeFilter === 'mine'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  My Work
                </button>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={fetchRevisions} className="gap-1.5 text-xs cursor-pointer">
              <History className="h-3.5 w-3.5" />
              <span>Refresh History</span>
            </Button>
          </div>
        </div>

        {/* Limited User Ownership Scope Banner */}
        {!canViewAllRevisions && user && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Lock className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="font-medium truncate">
                Authorship Scoped: You are logged in as <strong className="font-semibold text-foreground">{user.name}</strong> ({user.roleName || user.role}). Only revisions for content you have created or contributed to are shown.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono text-[10px] shrink-0 font-semibold">
              RBAC PROTECTED
            </span>
          </div>
        )}

        {/* Search & Filter */}
        <Card className="shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or content model..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredRevisions.length}</span> revision snapshots
            </div>
          </div>
        </Card>

        {/* Revisions Feed */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Loading revision ledger...
            </div>
          ) : filteredRevisions.length === 0 ? (
            <Card className="p-12 text-center shadow-sm">
              <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No content revisions found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {!canViewAllRevisions
                  ? 'You have not authored or edited any content snapshots yet. Once you publish or edit content, your revision history will appear here.'
                  : 'Revisions are automatically captured whenever content entries are created, updated, or published.'}
              </p>
            </Card>
          ) : (
            filteredRevisions.map((rev) => (
              <Card key={rev.id} className="p-4 shadow-sm hover:border-primary/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <GitCommit className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground hover:underline cursor-pointer truncate">
                          {rev.entryTitle}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          v{rev.version}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                          {rev.contentType}
                        </Badge>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                            rev.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : rev.status === 'CREATE'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          )}
                        >
                          {rev.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {rev.changeSummary}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {rev.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link href={`/admin/content/articles/${rev.entryId}`}>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs cursor-pointer">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ModuleGuard>
  );
}
