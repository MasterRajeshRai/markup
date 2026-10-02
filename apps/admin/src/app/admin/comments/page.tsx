'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ThumbsUp,
  Search,
  Filter,
  Check,
  X,
  Pin,
  Reply,
  Sliders,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Eye,
  Globe,
  Monitor,
  ShieldCheck,
  UserCheck,
  Save,
  Clock,
  ArrowUpDown,
  Tag,
  Share2,
} from 'lucide-react';
import {
  CommentItem,
  CommentStatus,
  CommentSettings,
  CommentStats,
} from '@headless/core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ModuleGuard } from '@/components/module-guard';
import { CommentSection } from '@/components/comments/comment-section';

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [stats, setStats] = useState<CommentStats>({
    total: 0,
    pending: 0,
    approved: 0,
    spam: 0,
    trash: 0,
    totalVotes: 0,
    spamRate: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0, spam: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH' | 'SETTINGS' | 'PREVIEW'
  >('ALL');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'votesCount' | 'spamScore'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [inspectComment, setInspectComment] = useState<CommentItem | null>(null);
  const [replyingComment, setReplyingComment] = useState<CommentItem | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<CommentSettings>({
    moderationMode: 'FIRST_TIME_ONLY',
    allowGuestComments: true,
    requireEmailVerification: false,
    maxLinksAllowed: 2,
    closeCommentsAfterDays: 0,
    maxThreadDepth: 3,
    enableMarkdown: true,
    enableUpvotes: true,
    enableAvatars: true,
    blocklistKeywords: ['viagra', 'crypto pump', 'free spins', 'buy backlinks'],
    notifyAdminOnNew: true,
    notifyAuthorOnReply: true,
    akismetEnabled: false,
    turnstileEnabled: false,
  });
  const [settingsKeywordsInput, setSettingsKeywordsInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  const fetchCommentsData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (activeTab !== 'ALL' && activeTab !== 'SETTINGS' && activeTab !== 'PREVIEW') {
        queryParams.set('status', activeTab);
      }
      if (selectedArticle !== 'ALL') {
        queryParams.set('contentEntryId', selectedArticle);
      }
      if (searchQuery.trim()) {
        queryParams.set('search', searchQuery.trim());
      }
      queryParams.set('sortBy', sortBy);
      queryParams.set('sortOrder', sortOrder);

      const res = await fetch(`/api/v1/comments?${queryParams.toString()}`);
      const data = await res.json();

      if (data.comments) {
        setComments(data.comments);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('[AdminComments] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/comments/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setSettingsKeywordsInput((data.settings.blocklistKeywords || []).join(', '));
      }
    } catch (err) {
      console.error('[AdminComments] Settings fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCommentsData();
  }, [activeTab, selectedArticle, sortBy, sortOrder]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommentsData();
  };

  // Status Change single
  const handleUpdateStatus = async (id: string, newStatus: CommentStatus) => {
    try {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      const res = await fetch(`/api/v1/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Refresh to update counters accurately
      fetchCommentsData();
    } catch (err) {
      console.error('Update status error:', err);
      fetchCommentsData();
    }
  };

  // Toggle Pinned
  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isPinned: !currentPinned } : c))
      );

      await fetch(`/api/v1/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
    } catch (err) {
      console.error('Toggle pin error:', err);
      fetchCommentsData();
    }
  };

  // Bulk actions
  const handleBulkStatus = async (newStatus: CommentStatus) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/v1/comments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchCommentsData();
      }
    } catch (err) {
      console.error('Bulk action error:', err);
    }
  };

  // Permanent Delete
  const handleDeletePermanent = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return;
    try {
      await fetch(`/api/v1/comments/${id}?permanent=true`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== id));
      fetchCommentsData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Select all toggle
  const handleToggleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Admin Reply submission
  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingComment || !adminReplyText.trim()) return;

    try {
      setIsSubmittingReply(true);
      const res = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentEntryId: replyingComment.contentEntryId,
          contentEntryTitle: replyingComment.contentEntryTitle,
          contentEntrySlug: replyingComment.contentEntrySlug,
          parentId: replyingComment.id,
          author: {
            name: 'Editorial Admin',
            email: 'admin@enterprise-cms.io',
            role: 'admin',
            isGuest: false,
            isVerified: true,
          },
          content: adminReplyText,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit admin reply');

      setAdminReplyText('');
      setReplyingComment(null);
      fetchCommentsData();
    } catch (err: any) {
      alert(err.message || 'Error posting reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const keywords = settingsKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const updated = {
        ...settings,
        blocklistKeywords: keywords,
      };

      const res = await fetch('/api/v1/comments/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setSettings(updated);
        setSettingsSaveSuccess(true);
        setTimeout(() => setSettingsSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Extract unique articles from comments for filter dropdown
  const uniqueArticles = Array.from(
    new Map(
      comments.map((c) => [c.contentEntryId, c.contentEntryTitle || 'Article'])
    ).entries()
  );

  return (
    <ModuleGuard moduleId="comments">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                Comments & Moderation
                <Badge className="bg-emerald-950/80 text-emerald-400 border-emerald-800/80 text-xs">
                  Automod Active
                </Badge>
              </h1>
              <p className="text-sm text-slate-400">
                Manage discussions, review pending submissions, flag spam, and customize auto-moderation rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCommentsData}
            className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab('PREVIEW')}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Live Widget Preview
          </Button>
        </div>
      </div>

      {/* Analytics KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-slate-400">Total Comments</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span>Across all entries</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-950/20 border-amber-900/40">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-amber-400 flex items-center justify-between">
              <span>Pending Review</span>
              {stats.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats.pending}</div>
            <div className="text-[11px] text-amber-400/70 mt-0.5">Needs editorial action</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-950/20 border-emerald-900/40">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-emerald-400">Approved & Live</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.approved}</div>
            <div className="text-[11px] text-emerald-400/70 mt-0.5">Publicly visible</div>
          </CardContent>
        </Card>

        <Card className="bg-rose-950/20 border-rose-900/40">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-rose-400">Spam Caught</div>
            <div className="text-2xl font-bold text-rose-300 mt-1">{stats.spam}</div>
            <div className="text-[11px] text-rose-400/70 mt-0.5">Automod filtered</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-blue-400 flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>Community Votes</span>
            </div>
            <div className="text-2xl font-bold text-blue-300 mt-1">{stats.totalVotes}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Engagement reactions</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-purple-400">Sentiment Split</div>
            <div className="flex items-center gap-1 mt-2">
              <div
                className="h-2 rounded-xs bg-emerald-500"
                style={{
                  width: `${Math.max(
                    15,
                    (stats.sentimentBreakdown.positive / (stats.total || 1)) * 100
                  )}%`,
                }}
                title={`Positive: ${stats.sentimentBreakdown.positive}`}
              />
              <div
                className="h-2 rounded-xs bg-slate-500"
                style={{
                  width: `${Math.max(
                    15,
                    (stats.sentimentBreakdown.neutral / (stats.total || 1)) * 100
                  )}%`,
                }}
                title={`Neutral: ${stats.sentimentBreakdown.neutral}`}
              />
              <div
                className="h-2 rounded-xs bg-rose-500"
                style={{
                  width: `${Math.max(
                    15,
                    (stats.sentimentBreakdown.negative / (stats.total || 1)) * 100
                  )}%`,
                }}
                title={`Negative/Spam: ${stats.sentimentBreakdown.negative + stats.sentimentBreakdown.spam}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span className="text-emerald-400">+{stats.sentimentBreakdown.positive}</span>
              <span className="text-slate-400">~{stats.sentimentBreakdown.neutral}</span>
              <span className="text-rose-400">-{stats.sentimentBreakdown.negative + stats.sentimentBreakdown.spam}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto thin-scrollbar">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Comments</span>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs py-0">
            {stats.total}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PENDING'
              ? 'border-amber-500 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Pending Review</span>
          {stats.pending > 0 && (
            <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/60 text-xs py-0">
              {stats.pending}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'APPROVED'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Approved</span>
          <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-xs py-0">
            {stats.approved}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('SPAM')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'SPAM'
              ? 'border-rose-500 text-rose-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Spam Queue</span>
          {stats.spam > 0 && (
            <Badge className="bg-rose-950 text-rose-400 border-rose-800 text-xs py-0">
              {stats.spam}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab('TRASH')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TRASH'
              ? 'border-slate-500 text-slate-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Trash</span>
          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs py-0">
            {stats.trash}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ml-auto ${
            activeTab === 'SETTINGS'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Automod & Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PREVIEW'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* TAB: PUBLIC WIDGET PREVIEW */}
      {activeTab === 'PREVIEW' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Interactive Comment Section Preview
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                This is exactly how the discussion widget renders on your public articles and pages. Try leaving a comment or reply below!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 sm:p-6 rounded-xl bg-slate-950/80 border border-slate-800">
                <CommentSection
                  contentEntryId="entry-article-1"
                  contentEntryTitle="Building Ultra-Fast Next.js 16 Web Applications"
                  contentEntrySlug="building-ultra-fast-nextjs-16"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: AUTOMOD & SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in-50 duration-200">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Editorial Moderation Policy
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Control how newly posted comments from visitors and registered users are held or approved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.moderationMode === 'FIRST_TIME_ONLY'
                      ? 'bg-blue-950/30 border-blue-500/50 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="moderationMode"
                    value="FIRST_TIME_ONLY"
                    checked={settings.moderationMode === 'FIRST_TIME_ONLY'}
                    onChange={() =>
                      setSettings({ ...settings, moderationMode: 'FIRST_TIME_ONLY' })
                    }
                    className="sr-only"
                  />
                  <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    First-Time Review (Recommended)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Hold comments from first-time authors for approval. Once approved, subsequent comments publish automatically.
                  </p>
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.moderationMode === 'MANUAL_ALL'
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="moderationMode"
                    value="MANUAL_ALL"
                    checked={settings.moderationMode === 'MANUAL_ALL'}
                    onChange={() =>
                      setSettings({ ...settings, moderationMode: 'MANUAL_ALL' })
                    }
                    className="sr-only"
                  />
                  <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Hold All for Moderation
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Every comment must be explicitly approved by an administrator or editor before appearing publicly.
                  </p>
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.moderationMode === 'AUTO_APPROVE'
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="moderationMode"
                    value="AUTO_APPROVE"
                    checked={settings.moderationMode === 'AUTO_APPROVE'}
                    onChange={() =>
                      setSettings({ ...settings, moderationMode: 'AUTO_APPROVE' })
                    }
                    className="sr-only"
                  />
                  <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Instant Auto-Approve
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Comments publish immediately unless flagged by the automated anti-spam heuristic engine.
                  </p>
                </label>
              </div>

              {/* Discussion Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Allow Guest Commenting</div>
                    <div className="text-[11px] text-slate-400">Allow unauthenticated visitors to comment with name and email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowGuestComments}
                    onChange={(e) =>
                      setSettings({ ...settings, allowGuestComments: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Markdown & Formatting</div>
                    <div className="text-[11px] text-slate-400">Allow commenters to use bold, italic, code snippets, and quotes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableMarkdown}
                    onChange={(e) =>
                      setSettings({ ...settings, enableMarkdown: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Upvotes & Reactions</div>
                    <div className="text-[11px] text-slate-400">Allow community members to upvote helpful comments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableUpvotes}
                    onChange={(e) =>
                      setSettings({ ...settings, enableUpvotes: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Max Link Limit</div>
                    <div className="text-[11px] text-slate-400">Auto-flag comments exceeding this link threshold</div>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={settings.maxLinksAllowed}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxLinksAllowed: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-16 h-8 text-xs bg-slate-900 border-slate-700 text-center"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anti-Spam & Stopwords */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Anti-Spam & Keyword Blocklist
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Comments containing these words or phrases will be immediately caught and directed to the spam queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Blocklisted Keywords (Comma separated)
                </label>
                <Textarea
                  value={settingsKeywordsInput}
                  onChange={(e) => setSettingsKeywordsInput(e.target.value)}
                  placeholder="viagra, casino, crypto pump, buy backlinks, telegram.me"
                  rows={3}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Akismet Spam Protection</div>
                  <div className="text-[11px] text-slate-400">Connect cloud AI spam scoring API</div>
                </div>
                <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                  Ready to configure
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Save Action Bar */}
          <div className="flex items-center justify-between">
            {settingsSaveSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> Settings updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Changes apply immediately to all incoming comments.
              </span>
            )}

            <Button
              type="submit"
              disabled={savingSettings}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 px-5 flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      )}

      {/* TAB: COMMENTS LIST / MODERATION */}
      {activeTab !== 'SETTINGS' && activeTab !== 'PREVIEW' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search comment text, author name, email, IP..."
                className="pl-9 bg-slate-950 border-slate-800 text-xs h-8 focus-visible:ring-blue-500"
              />
            </form>

            {/* Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter by Article */}
              <select
                value={selectedArticle}
                onChange={(e) => setSelectedArticle(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-hidden"
              >
                <option value="ALL">All Articles</option>
                {uniqueArticles.map(([id, title]) => (
                  <option key={id} value={id}>
                    {title.length > 25 ? `${title.substring(0, 25)}...` : title}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-hidden"
              >
                <option value="createdAt">Date (Newest)</option>
                <option value="votesCount">Most Upvoted</option>
                <option value="spamScore">Spam Risk Score</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar (Visible when items selected) */}
          {selectedIds.length > 0 && (
            <div className="p-2.5 px-3.5 sm:px-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in-50 duration-150">
              <div className="text-xs text-blue-300 font-medium">
                {selectedIds.length} comment{selectedIds.length > 1 ? 's' : ''} selected
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatus('APPROVED')}
                  className="h-7 px-2.5 text-xs border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Approve<span className="hidden sm:inline"> Selected</span></span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatus('SPAM')}
                  className="h-7 px-2.5 text-xs border-rose-700/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  <span>Spam</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatus('TRASH')}
                  className="h-7 px-2.5 text-xs border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Trash</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                  className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Deselect
                </Button>
              </div>
            </div>
          )}

          {/* Master Table Header Selection */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={comments.length > 0 && selectedIds.length === comments.length}
                onChange={handleToggleSelectAll}
                className="h-3.5 w-3.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Select all on page</span>
            </label>
            <span>Showing {comments.length} comments</span>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                  <div className="h-4 w-40 bg-slate-800 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-xl bg-slate-900/30 border border-dashed border-slate-800">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-base font-semibold text-slate-200">No comments found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No comments match your active filters or search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const isSelected = selectedIds.includes(comment.id);
                const isSpam = comment.status === 'SPAM';
                const isPending = comment.status === 'PENDING';
                const isApproved = comment.status === 'APPROVED';

                return (
                  <Card
                    key={comment.id}
                    className={`transition-all border ${
                      isSelected
                        ? 'border-blue-500/60 bg-slate-900/90 shadow-md'
                        : isPending
                        ? 'border-amber-500/30 bg-slate-900/70 hover:border-amber-500/50'
                        : isSpam
                        ? 'border-rose-900/40 bg-rose-950/10 hover:border-rose-800'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      {/* Top Row: Checkbox, Author, Badges, Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(comment.id)}
                            className="mt-1 h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 shrink-0"
                          />

                          {/* Avatar */}
                          {comment.author.avatarUrl ? (
                            <img
                              src={comment.author.avatarUrl}
                              alt={comment.author.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                              {comment.author.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Author Info */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-100 text-sm">
                                {comment.author.name}
                              </span>

                              <span className="text-xs text-slate-400">
                                {comment.author.email}
                              </span>

                              {comment.author.role === 'admin' && (
                                <Badge className="bg-purple-900/60 text-purple-300 border-purple-700/60 text-[10px] px-1.5 py-0">
                                  <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Staff Admin
                                </Badge>
                              )}

                              {comment.author.role === 'author' && (
                                <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/60 text-[10px] px-1.5 py-0">
                                  <UserCheck className="w-2.5 h-2.5 mr-0.5" /> Post Author
                                </Badge>
                              )}

                              {comment.isPinned && (
                                <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/60 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                                  <Pin className="w-2.5 h-2.5 fill-amber-300/30" /> Pinned
                                </Badge>
                              )}
                            </div>

                            {/* Telemetry info */}
                            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(comment.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>

                              {comment.location && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-slate-400" />
                                  {comment.location}
                                </span>
                              )}

                              {comment.clientIp && (
                                <span className="text-slate-400 font-mono text-[10px]">
                                  IP: {comment.clientIp}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Upvotes */}
                        <div className="flex items-center gap-2 shrink-0">
                          {comment.votesCount !== 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-950/40 border border-blue-800/60 px-2 py-0.5 rounded-md">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{comment.votesCount}</span>
                            </div>
                          )}

                          {isPending && (
                            <Badge className="bg-amber-950 text-amber-400 border-amber-700 text-xs">
                              PENDING REVIEW
                            </Badge>
                          )}
                          {isApproved && (
                            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-700 text-xs">
                              APPROVED
                            </Badge>
                          )}
                          {isSpam && (
                            <Badge className="bg-rose-950 text-rose-400 border-rose-700 text-xs flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> SPAM ({comment.spamScore}%)
                            </Badge>
                          )}
                          {comment.status === 'TRASH' && (
                            <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                              TRASH
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="mt-3.5 pl-7 sm:pl-12 text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                        {comment.content}
                      </div>

                      {/* Flagged Reasons (If flagged by automod) */}
                      {comment.flaggedReasons && comment.flaggedReasons.length > 0 && (
                        <div className="mt-3 ml-7 sm:ml-12 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs text-rose-400 space-y-1">
                          <div className="font-semibold flex items-center gap-1 text-[11px] text-rose-300">
                            <ShieldAlert className="w-3 h-3" /> Automod Triggers:
                          </div>
                          {comment.flaggedReasons.map((reason, idx) => (
                            <div key={idx} className="text-[11px] pl-4 list-disc">
                              • {reason}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bottom Context Row & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 pl-7 sm:pl-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Target Article Reference */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="text-slate-400">Article:</span>
                          <span className="font-medium text-slate-300 hover:text-blue-400 transition-colors">
                            {comment.contentEntryTitle || 'Standalone Post'}
                          </span>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          {/* Approve Button */}
                          {comment.status !== 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(comment.id, 'APPROVED')}
                              className="h-7.5 px-2.5 text-xs border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer"
                              title="Approve comment"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              <span>Approve</span>
                            </Button>
                          )}

                          {/* Reject / Spam Button */}
                          {comment.status !== 'SPAM' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(comment.id, 'SPAM')}
                              className="h-7.5 px-2.5 text-xs border-rose-800/60 bg-rose-950/30 text-rose-400 hover:bg-rose-900/60 cursor-pointer"
                              title="Mark as spam"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                              <span>Spam</span>
                            </Button>
                          )}

                          {/* Reply as Admin */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingComment(comment);
                              setAdminReplyText('');
                            }}
                            className="h-7.5 px-2 sm:px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                            title="Reply as Staff"
                          >
                            <Reply className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Reply</span>
                          </Button>

                          {/* Pin Toggle */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTogglePin(comment.id, comment.isPinned)}
                            className={`h-7.5 px-2 sm:px-2.5 text-xs cursor-pointer ${
                              comment.isPinned
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title={comment.isPinned ? 'Unpin comment' : 'Pin to top'}
                          >
                            <Pin className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">
                              {comment.isPinned ? 'Unpin' : 'Pin'}
                            </span>
                          </Button>

                          {/* Inspect Modal */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectComment(comment)}
                            className="h-7.5 px-2 sm:px-2.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                            title="Inspect Diagnostics"
                          >
                            <Eye className="w-3.5 h-3.5 md:mr-1" />
                            <span className="hidden md:inline">Inspect</span>
                          </Button>

                          {/* Move to Trash or Permanent Delete */}
                          {comment.status !== 'TRASH' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(comment.id, 'TRASH')}
                              className="h-7.5 px-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer"
                              title="Move to trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePermanent(comment.id)}
                              className="h-7.5 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              <span>Purge</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Quick Reply Dialog */}
      <Dialog
        open={!!replyingComment}
        onOpenChange={(open) => !open && setReplyingComment(null)}
      >
        <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Reply className="w-4 h-4 text-blue-400" />
              Reply to {replyingComment?.author.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Your response will be posted with an official Staff badge and will be automatically approved.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
              "{replyingComment?.content}"
            </div>

            <Textarea
              value={adminReplyText}
              onChange={(e) => setAdminReplyText(e.target.value)}
              placeholder="Write official response or clarification..."
              rows={4}
              className="bg-slate-950 border-slate-800 text-xs focus-visible:ring-blue-500"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingComment(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdminReply}
              disabled={isSubmittingReply || !adminReplyText.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
            >
              {isSubmittingReply ? 'Posting...' : 'Post Reply as Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspect Technical Diagnostics Modal */}
      <Dialog
        open={!!inspectComment}
        onOpenChange={(open) => !open && setInspectComment(null)}
      >
        <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Comment Technical Diagnostics
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Full telemetry, automod heuristics, and author verification metadata.
            </DialogDescription>
          </DialogHeader>

          {inspectComment && (
            <div className="space-y-4 text-xs py-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Comment ID:</span>
                  <span className="font-mono text-slate-200">{inspectComment.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-semibold text-slate-200">{inspectComment.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Spam Probability:</span>
                  <span
                    className={`font-semibold ${
                      inspectComment.spamScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {inspectComment.spamScore}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sentiment:</span>
                  <span className="font-semibold text-slate-200">{inspectComment.sentiment || 'NEUTRAL'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Client IP:</span>
                  <span className="font-mono text-slate-200">{inspectComment.clientIp || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location:</span>
                  <span className="text-slate-200">{inspectComment.location || 'Unknown'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">User Agent:</span>
                <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-300 break-all">
                  {inspectComment.userAgent || 'N/A'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Raw Content:</span>
                <div className="p-3 rounded bg-slate-950 text-slate-200 text-xs whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {inspectComment.content}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInspectComment(null)}
              className="text-xs border-slate-700 bg-slate-800 text-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ModuleGuard>
  );
}
