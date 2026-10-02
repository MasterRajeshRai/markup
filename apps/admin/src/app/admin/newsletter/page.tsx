'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Mail,
  Send,
  Users,
  UserPlus,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Code2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Calendar,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';
import type { Subscriber, NewsletterCampaign } from '@/lib/newsletter-service';

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns' | 'embed' | 'import_export' | 'settings'>('subscribers');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    pendingSubscribers: 0,
    unsubscribed: 0,
    sentCampaigns: 0,
    availableTags: [] as string[],
    thirtyDayGrowthPct: 18.4,
    avgOpenRate: 46.8,
  });

  // Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');

  // Campaigns
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subjectLine: '',
    previewText: '',
    htmlContent: '',
    targetTag: '',
  });
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  // New Subscriber Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubTags, setNewSubTags] = useState('tech-weekly, product-updates');

  // Import text
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<{ imported: number; skipped: number } | null>(null);

  // Embed code copied
  const [codeCopied, setCodeCopied] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/newsletter');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Error fetching newsletter stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (tagFilter !== 'ALL') params.set('tag', tagFilter);
      if (search.trim()) params.set('q', search.trim());

      const res = await fetch(`/api/v1/newsletter/subscribers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [search, statusFilter, tagFilter]);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;

    try {
      const tags = newSubTags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await fetch('/api/v1/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newSubEmail.trim(),
          name: newSubName.trim() || undefined,
          tags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubModalOpen(false);
        setNewSubEmail('');
        setNewSubName('');
        fetchSubscribers();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Remove "${email}" from subscriber list?`)) return;
    try {
      await fetch(`/api/v1/newsletter/subscribers?id=${id}`, { method: 'DELETE' });
      fetchSubscribers();
      fetchOverview();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaignForm.title,
          subjectLine: campaignForm.subjectLine,
          previewText: campaignForm.previewText,
          htmlContent: campaignForm.htmlContent || `<p>${campaignForm.subjectLine}</p>`,
          targetTags: campaignForm.targetTag ? [campaignForm.targetTag] : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCampaignModalOpen(false);
        setCampaignForm({ title: '', subjectLine: '', previewText: '', htmlContent: '', targetTag: '' });
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to broadcast this campaign to targeted subscribers via Resend?')) return;
    setBroadcastingId(campaignId);
    setBroadcastResult(null);
    try {
      const res = await fetch('/api/v1/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', campaignId }),
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastResult(`Broadcast successfully dispatched to ${data.recipientsCount} subscribers via Resend!`);
        fetchOverview();
      } else {
        setBroadcastResult(`Broadcast failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setBroadcastResult(`Error: ${err.message}`);
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportReport(null);
    try {
      const res = await fetch('/api/v1/newsletter/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: importText }),
      });
      const data = await res.json();
      if (data.success) {
        setImportReport(data.report);
        setImportText('');
        fetchSubscribers();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModuleGuard moduleId="newsletter">
      <div className="space-y-6 pb-16">
        {/* ── Top Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-2xs">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">Newsletter &amp; Audience Subscriptions</h1>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10">
                    {stats.activeSubscribers} Active Subscribers
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/40 text-blue-500 bg-blue-500/10 text-[10px]">
                    Resend Powered
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage audience opt-ins, segment tags, automated welcome emails, and dispatch email broadcast campaigns.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/v1/newsletter/export', '_blank')}
              className="h-8 gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsSubModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Subscriber</span>
            </Button>
          </div>
        </div>

        {/* ── Top Metrics Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/60">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">Active Subscribers</div>
            <div className="text-2xl font-bold mt-1 text-foreground">
              {stats.activeSubscribers}
            </div>
            <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+{stats.thirtyDayGrowthPct}% this month</span>
            </div>
          </Card>

          <Card className="p-4 bg-card/60">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">Avg. Open Rate</div>
            <div className="text-2xl font-bold mt-1 text-emerald-500">
              {stats.avgOpenRate}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              +14.2% above industry median
            </div>
          </Card>

          <Card className="p-4 bg-card/60">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">Campaigns Sent</div>
            <div className="text-2xl font-bold mt-1 text-foreground">
              {stats.sentCampaigns}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Dispatched via Resend API
            </div>
          </Card>

          <Card className="p-4 bg-card/60">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">Unsubscribe Rate</div>
            <div className="text-2xl font-bold mt-1 text-foreground">
              0.4%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {stats.unsubscribed} total unsubscribes
            </div>
          </Card>
        </div>

        {/* ── Navigation Tabs ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 border-b overflow-x-auto pb-1 text-xs">
          {[
            { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: Users },
            { id: 'campaigns', label: `Campaigns (${campaigns.length})`, icon: Mail },
            { id: 'embed', label: 'Subscription Widget Code', icon: Code2 },
            { id: 'import_export', label: 'Import / Export', icon: Download },
            { id: 'settings', label: 'Settings & Opt-In', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary bg-primary/5 font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: Subscribers Directory ─────────────────────────────────── */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card rounded-xl border">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email, name, or tag..."
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 text-xs bg-background border rounded-lg px-2 text-foreground focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBSCRIBED">Subscribed</option>
                  <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                  <option value="UNSUBSCRIBED">Unsubscribed</option>
                </select>

                {/* Tag Filter */}
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="h-8 text-xs bg-background border rounded-lg px-2 text-foreground focus:outline-none"
                >
                  <option value="ALL">All Tags</option>
                  {stats.availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-3 px-4">Subscriber</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Tags</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Date Joined</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subscribers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-muted-foreground">
                            No subscribers match the current filter.
                          </td>
                        </tr>
                      ) : (
                        subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-muted/20">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground">{sub.email}</div>
                              {sub.name && <div className="text-[11px] text-muted-foreground">{sub.name}</div>}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  sub.status === 'SUBSCRIBED'
                                    ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                                    : sub.status === 'PENDING_CONFIRMATION'
                                    ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
                                    : 'border-slate-500/40 text-slate-400 bg-slate-500/10'
                                }`}
                              >
                                {sub.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {sub.tags.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-[10px]">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                              {sub.source}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-[11px]">
                              {new Date(sub.subscribedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                title="Remove subscriber"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB 2: Campaigns & Broadcasts ─────────────────────────────────── */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Email Newsletters &amp; Broadcasts</h3>
                <p className="text-xs text-muted-foreground">Draft rich newsletters and dispatch to targeted segments.</p>
              </div>
              <Button size="sm" onClick={() => setIsCampaignModalOpen(true)} className="gap-1.5 h-8 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Campaign</span>
              </Button>
            </div>

            {broadcastResult && (
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{broadcastResult}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <Card key={camp.id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={camp.status === 'SENT' ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10' : 'border-amber-500/40 text-amber-500 bg-amber-500/10'}>
                        {camp.status}
                      </Badge>
                      {camp.targetTags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {camp.targetTags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-foreground mt-2">{camp.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Subject:</strong> {camp.subjectLine}
                    </p>
                    {camp.previewText && (
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-2">
                        {camp.previewText}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t mt-4 flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground">
                      {camp.status === 'SENT' ? (
                        <span>
                          Sent to <strong>{camp.recipientsCount}</strong> &bull; {camp.openRate}% opens
                        </span>
                      ) : (
                        <span>Draft &bull; Ready to dispatch</span>
                      )}
                    </div>

                    {camp.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={() => handleBroadcastCampaign(camp.id)}
                        disabled={broadcastingId === camp.id}
                        className="gap-1.5 h-7 text-xs"
                      >
                        <Send className="h-3 w-3" />
                        <span>{broadcastingId === camp.id ? 'Sending...' : 'Broadcast'}</span>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: Embed Widgets ──────────────────────────────────────────── */}
        {activeTab === 'embed' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold">Embeddable HTML Subscription Form</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Copy and paste this form directly into landing pages, footer templates, or markdown blocks.
                </p>
              </div>

              <div className="relative bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto text-foreground">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const htmlCode = `<form action="/api/v1/newsletter" method="POST">\n  <input type="email" name="email" placeholder="Enter your email" required />\n  <input type="text" name="honeypot" style="display:none" tabIndex="-1" />\n  <button type="submit">Subscribe</button>\n</form>`;
                    navigator.clipboard.writeText(htmlCode);
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 h-7 text-[10px] gap-1"
                >
                  {codeCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{codeCopied ? 'Copied' : 'Copy HTML'}</span>
                </Button>
                <pre>{`<form action="/api/v1/newsletter" method="POST">
  <input type="email" name="email" placeholder="Enter your email" required />
  <!-- Anti-Spam Honeypot Guard -->
  <input type="text" name="honeypot" style="display:none" tabIndex="-1" />
  <button type="submit">Subscribe</button>
</form>`}</pre>
              </div>

              <div className="border rounded-lg p-4 bg-card/60">
                <h4 className="text-xs font-semibold mb-2">Live Preview Widget:</h4>
                <div className="flex gap-2">
                  <Input placeholder="name@company.com" className="h-8 text-xs bg-background" />
                  <Button size="sm" className="h-8 text-xs">
                    Subscribe
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold">Public REST API Endpoint</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send subscriptions directly from Next.js, Nuxt, Astro, or mobile frontends via fetch.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto text-foreground">
                <pre>{`// JavaScript / React fetch example
await fetch('/api/v1/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'Jane Doe',
    tags: ['tech-weekly']
  })
});`}</pre>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB 4: Import / Export ────────────────────────────────────────── */}
        {activeTab === 'import_export' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold">Bulk Import Subscribers</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste a list of email addresses, or CSV lines in format: <code>email, name, tags</code>.
                </p>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="sarah@example.com, Sarah, tech-weekly&#10;david@example.com, David, enterprise&#10;elena@example.com"
                rows={6}
                className="w-full rounded-lg border bg-background p-3 text-xs font-mono focus:outline-none"
              />

              {importReport && (
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                  Successfully imported <strong>{importReport.imported}</strong> subscribers ({importReport.skipped} skipped).
                </div>
              )}

              <Button
                size="sm"
                onClick={handleImport}
                disabled={importing || !importText.trim()}
                className="gap-1.5 text-xs font-semibold"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{importing ? 'Importing...' : 'Execute Import'}</span>
              </Button>
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold">Export Audience Data</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Export complete mailing lists with tags, subscription dates, and engagement status to standard CSV.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border text-xs text-muted-foreground space-y-2">
                <div>&bull; Total records: <strong>{subscribers.length}</strong></div>
                <div>&bull; Compliant with Mailchimp, ConvertKit, and Resend CSV imports.</div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/api/v1/newsletter/export', '_blank')}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Full CSV Export</span>
              </Button>
            </Card>
          </div>
        )}

        {/* ── TAB 5: Settings ───────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <Card className="max-w-2xl">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-base font-bold">Newsletter Policies &amp; Opt-In</CardTitle>
              <CardDescription className="text-xs">
                Configure double opt-in confirmation, automated welcome emails, and default segment tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Automated Welcome Email</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Send immediate confirmation note via Resend whenever a visitor subscribes.
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="text-xs font-semibold">Double Opt-In Verification</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Subscribers must click an email confirmation link before receiving newsletters.
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-xs font-semibold">Default Tags Assigned to New Subscribers</Label>
                <Input defaultValue="general-newsletter, website-signup" className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Unsubscribe Redirect URL</Label>
                <Input defaultValue="/newsletter/unsubscribed" className="text-xs" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Modal: Add Subscriber ─────────────────────────────────────────── */}
        <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleAddSubscriber}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Add Subscriber</DialogTitle>
                <DialogDescription className="text-xs">
                  Manually add a contact to your newsletter database.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address *</Label>
                  <Input
                    type="email"
                    required
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name (Optional)</Label>
                  <Input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Jane Doe"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tags (comma-separated)</Label>
                  <Input
                    type="text"
                    value={newSubTags}
                    onChange={(e) => setNewSubTags(e.target.value)}
                    placeholder="tech-weekly, enterprise"
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-semibold text-xs">
                  Add Subscriber
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Modal: Create Campaign ────────────────────────────────────────── */}
        <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
          <DialogContent className="max-w-xl">
            <form onSubmit={handleCreateCampaign}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Create Newsletter Campaign</DialogTitle>
                <DialogDescription className="text-xs">
                  Compose a broadcast to dispatch to your audience.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Campaign Title *</Label>
                  <Input
                    type="text"
                    required
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                    placeholder="October Monthly Digest"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subject Line *</Label>
                  <Input
                    type="text"
                    required
                    value={campaignForm.subjectLine}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subjectLine: e.target.value })}
                    placeholder="What we shipped this month in Headless CMS"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Preview / Subheader Text</Label>
                  <Input
                    type="text"
                    value={campaignForm.previewText}
                    onChange={(e) => setCampaignForm({ ...campaignForm, previewText: e.target.value })}
                    placeholder="A quick summary of our recent architectural improvements"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Tag Segment (Optional)</Label>
                  <select
                    value={campaignForm.targetTag}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetTag: e.target.value })}
                    className="w-full h-8 rounded-lg border bg-background px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="">All Active Subscribers</option>
                    {stats.availableTags.map((t) => (
                      <option key={t} value={t}>
                        Only subscribers with "{t}"
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">HTML Message Body</Label>
                  <textarea
                    rows={5}
                    value={campaignForm.htmlContent}
                    onChange={(e) => setCampaignForm({ ...campaignForm, htmlContent: e.target.value })}
                    placeholder="<h2>Hello!</h2><p>Here is our latest article...</p>"
                    className="w-full rounded-lg border bg-background p-3 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCampaignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-semibold text-xs">
                  Save Campaign
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleGuard>
  );
}
