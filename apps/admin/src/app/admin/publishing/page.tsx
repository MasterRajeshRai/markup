'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Archive,
  RefreshCw,
  FileText,
  Send,
  Eye,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface PublishingEntry {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string;
  scheduledPublishAt?: string;
  scheduledUnpublishAt?: string;
  expiresAt?: string;
  updatedAt: string;
  contentType: { name: string; slug: string };
  author?: { name: string; email: string };
}

export default function PublishingPage() {
  const [data, setData] = useState<{
    scheduled: PublishingEntry[];
    pendingReview: PublishingEntry[];
    expiring: PublishingEntry[];
    archived: PublishingEntry[];
    counts: { scheduled: number; pendingReview: number; expiring: number; archived: number };
  }>({
    scheduled: [],
    pendingReview: [],
    expiring: [],
    archived: [],
    counts: { scheduled: 0, pendingReview: 0, expiring: 0, archived: 0 },
  });

  const [activeTab, setActiveTab] = useState<'scheduled' | 'review' | 'expiring' | 'archived'>('scheduled');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPublishingQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/publishing');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishingQueue();
  }, []);

  const handleTriggerScheduler = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_scheduler' }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(`Scheduler triggered! Published: ${json.result?.publishedCount || 0}, Archived: ${json.result?.unpublishedCount || 0}`);
        fetchPublishingQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchPublish = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_publish', entryIds: [id] }),
      });
      if (res.ok) {
        fetchPublishingQueue();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const currentList =
    activeTab === 'scheduled'
      ? data.scheduled
      : activeTab === 'review'
      ? data.pendingReview
      : activeTab === 'expiring'
      ? data.expiring
      : data.archived;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Publishing & Scheduling</h1>
            <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
              Automated Queue
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage scheduled publications, editorial approvals, expiration dates, and background job triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPublishingQueue}
            disabled={loading}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleTriggerScheduler}
            disabled={actionLoading}
            className="text-xs gap-1.5 h-8 font-semibold shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Run Scheduler Worker</span>
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between">
          <span>{message}</span>
          <Button variant="ghost" size="sm" onClick={() => setMessage(null)} className="h-6 px-2 text-[10px]">
            Dismiss
          </Button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          onClick={() => setActiveTab('scheduled')}
          className={`cursor-pointer transition-all ${
            activeTab === 'scheduled' ? 'border-primary ring-1 ring-primary/50' : 'hover:border-border'
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Scheduled Release</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{data.counts.scheduled}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('review')}
          className={`cursor-pointer transition-all ${
            activeTab === 'review' ? 'border-primary ring-1 ring-primary/50' : 'hover:border-border'
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Review</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{data.counts.pendingReview}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('expiring')}
          className={`cursor-pointer transition-all ${
            activeTab === 'expiring' ? 'border-primary ring-1 ring-primary/50' : 'hover:border-border'
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Expiring Soon</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{data.counts.expiring}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('archived')}
          className={`cursor-pointer transition-all ${
            activeTab === 'archived' ? 'border-primary ring-1 ring-primary/50' : 'hover:border-border'
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Archived Content</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{data.counts.archived}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-slate-500/10 text-slate-500 flex items-center justify-center">
              <Archive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tab Queue List */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base capitalize">
                {activeTab === 'scheduled'
                  ? 'Scheduled Publishing Queue'
                  : activeTab === 'review'
                  ? 'Pending Editorial Review'
                  : activeTab === 'expiring'
                  ? 'Content with Scheduled Expiration'
                  : 'Archived Entries'}
              </CardTitle>
              <CardDescription className="text-xs">
                {currentList.length} items in current view
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Loading queue entries...</div>
          ) : currentList.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500/50 mb-1" />
              <p className="font-semibold text-foreground">No entries in this queue</p>
              <p className="text-[11px]">All scheduled jobs and workflows are up to date.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {currentList.map((entry) => (
                <div key={entry.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{entry.title}</span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {entry.contentType.name}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono ${
                          entry.status === 'PUBLISHED'
                            ? 'text-emerald-500 border-emerald-500/30'
                            : entry.status === 'SCHEDULED'
                            ? 'text-blue-500 border-blue-500/30'
                            : entry.status === 'IN_REVIEW'
                            ? 'text-amber-500 border-amber-500/30'
                            : 'text-slate-500 border-slate-500/30'
                        }`}
                      >
                        {entry.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Slug: <code className="font-mono text-foreground">{entry.slug}</code></span>
                      {entry.author && <span>Author: {entry.author.name}</span>}
                      {entry.scheduledPublishAt && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>Publishes: {new Date(entry.scheduledPublishAt).toLocaleString()}</span>
                        </span>
                      )}
                      {entry.scheduledUnpublishAt && (
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>Unpublishes: {new Date(entry.scheduledUnpublishAt).toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeTab === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBatchPublish(entry.id)}
                        disabled={actionLoading}
                        className="text-xs h-8"
                      >
                        Publish Now
                      </Button>
                    )}
                    {activeTab === 'review' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleBatchPublish(entry.id)}
                        disabled={actionLoading}
                        className="text-xs h-8 gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve & Publish</span>
                      </Button>
                    )}
                    <Link href={`/admin/content/${entry.contentType.slug}/${entry.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs gap-1">
                        <span>Edit</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
