'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Flame,
  GitBranch,
  Globe,
  Image as ImageIcon,
  Key,
  Layers,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export interface DashboardMetricsProps {
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  mediaCount: number;
  usersCount: number;
  contentTypesCount: number;
}

type Timeframe = '7d' | '30d' | '90d' | '1y';
type ModuleFilter = 'all' | 'content' | 'audience' | 'media' | 'revenue' | 'system';

// High-contrast, clean theme palette
const PALETTE = {
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  rose: '#f43f5e',
  indigo: '#6366f1',
};

// -------------------------------------------------------------
// Chart Configurations for shadcn/ui
// -------------------------------------------------------------
const contentVelocityConfig: ChartConfig = {
  published: {
    label: 'Published',
    color: PALETTE.blue,
  },
  drafts: {
    label: 'Drafts Created',
    color: PALETTE.emerald,
  },
  scheduled: {
    label: 'Scheduled',
    color: PALETTE.amber,
  },
};

const audienceGrowthConfig: ChartConfig = {
  subscribers: {
    label: 'Newsletter Subscriptions',
    color: PALETTE.blue,
  },
  leads: {
    label: 'Form Lead Inbound',
    color: PALETTE.emerald,
  },
  comments: {
    label: 'Community Discussions',
    color: PALETTE.purple,
  },
};

const mediaStorageConfig: ChartConfig = {
  hero: {
    label: 'Hero',
    color: PALETTE.blue,
  },
  medium: {
    label: 'Medium',
    color: PALETTE.emerald,
  },
  card: {
    label: 'Card',
    color: PALETTE.amber,
  },
  thumbnail: {
    label: 'Thumbnail',
    color: PALETTE.purple,
  },
  custom: {
    label: 'Custom',
    color: PALETTE.cyan,
  },
};

const monetizationConfig: ChartConfig = {
  revenue: {
    label: 'Ad Revenue ($)',
    color: PALETTE.emerald,
  },
  ecpm: {
    label: 'eCPM ($)',
    color: PALETTE.amber,
  },
};

const healthRadarConfig: ChartConfig = {
  score: {
    label: 'Operational Score',
    color: PALETTE.blue,
  },
  benchmark: {
    label: 'Target Benchmark',
    color: PALETTE.emerald,
  },
};

const workflowsConfig: ChartConfig = {
  draftReview: {
    label: 'Draft Review SLA',
    color: PALETTE.blue,
  },
  legalApproval: {
    label: 'Legal Approval',
    color: PALETTE.emerald,
  },
  seoCheck: {
    label: 'SEO Audit',
    color: PALETTE.amber,
  },
  publishingQueue: {
    label: 'Queue Dispatch',
    color: PALETTE.purple,
  },
};

const contentTypeConfig: ChartConfig = {
  requests: {
    label: 'API Delivery Reads (k)',
    color: PALETTE.cyan,
  },
};

export function InteractiveDashboard({
  publishedCount,
  draftCount,
  scheduledCount,
  mediaCount,
  usersCount,
  contentTypesCount,
}: DashboardMetricsProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [activeModule, setActiveModule] = useState<ModuleFilter>('all');
  const [barLayout, setBarLayout] = useState<'grouped' | 'stacked'>('grouped');
  const [eventTickerIndex, setEventTickerIndex] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setEventTickerIndex((prev) => (prev + 1) % RECENT_EVENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------------------------------------
  // Dynamic Datasets based on timeframe
  // -----------------------------------------------------------
  const contentVelocityData = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return [
          { period: 'Mon', published: 4, drafts: 8, scheduled: 2 },
          { period: 'Tue', published: 7, drafts: 12, scheduled: 3 },
          { period: 'Wed', published: 6, drafts: 9, scheduled: 4 },
          { period: 'Thu', published: 11, drafts: 14, scheduled: 5 },
          { period: 'Fri', published: 9, drafts: 10, scheduled: 2 },
          { period: 'Sat', published: 3, drafts: 4, scheduled: 1 },
          { period: 'Sun', published: 5, drafts: 6, scheduled: 3 },
        ];
      case '90d':
        return [
          { period: 'Wk 1-2', published: 28, drafts: 45, scheduled: 12 },
          { period: 'Wk 3-4', published: 34, drafts: 52, scheduled: 15 },
          { period: 'Wk 5-6', published: 42, drafts: 61, scheduled: 18 },
          { period: 'Wk 7-8', published: 39, drafts: 58, scheduled: 22 },
          { period: 'Wk 9-10', published: 48, drafts: 70, scheduled: 26 },
          { period: 'Wk 11-12', published: 56, drafts: 84, scheduled: 31 },
        ];
      case '1y':
        return [
          { period: 'Q1', published: 120, drafts: 210, scheduled: 54 },
          { period: 'Q2', published: 185, drafts: 290, scheduled: 78 },
          { period: 'Q3', published: 240, drafts: 340, scheduled: 95 },
          { period: 'Q4', published: 310, drafts: 420, scheduled: 130 },
        ];
      case '30d':
      default:
        return [
          { period: 'Day 1-5', published: 12, drafts: 24, scheduled: 6 },
          { period: 'Day 6-10', published: 18, drafts: 32, scheduled: 9 },
          { period: 'Day 11-15', published: 15, drafts: 28, scheduled: 11 },
          { period: 'Day 16-20', published: 26, drafts: 40, scheduled: 14 },
          { period: 'Day 21-25', published: 22, drafts: 36, scheduled: 12 },
          { period: 'Day 26-30', published: 34, drafts: 48, scheduled: 18 },
        ];
    }
  }, [timeframe]);

  const audienceGrowthData = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return [
          { period: 'Mon', subscribers: 24, leads: 14, comments: 18 },
          { period: 'Tue', subscribers: 38, leads: 22, comments: 26 },
          { period: 'Wed', subscribers: 45, leads: 28, comments: 31 },
          { period: 'Thu', subscribers: 52, leads: 34, comments: 40 },
          { period: 'Fri', subscribers: 48, leads: 29, comments: 35 },
          { period: 'Sat', subscribers: 19, leads: 12, comments: 14 },
          { period: 'Sun', subscribers: 26, leads: 16, comments: 20 },
        ];
      case '90d':
        return [
          { period: 'M1', subscribers: 380, leads: 210, comments: 290 },
          { period: 'M2', subscribers: 540, leads: 320, comments: 410 },
          { period: 'M3', subscribers: 720, leads: 430, comments: 560 },
        ];
      case '1y':
        return [
          { period: 'Q1', subscribers: 1200, leads: 680, comments: 890 },
          { period: 'Q2', subscribers: 1850, leads: 1100, comments: 1450 },
          { period: 'Q3', subscribers: 2600, leads: 1620, comments: 2100 },
          { period: 'Q4', subscribers: 3450, leads: 2190, comments: 2980 },
        ];
      case '30d':
      default:
        return [
          { period: 'Wk 1', subscribers: 95, leads: 54, comments: 72 },
          { period: 'Wk 2', subscribers: 142, leads: 88, comments: 110 },
          { period: 'Wk 3', subscribers: 186, leads: 112, comments: 145 },
          { period: 'Wk 4', subscribers: 230, leads: 145, comments: 182 },
        ];
    }
  }, [timeframe]);

  const mediaStorageData = useMemo(() => [
    { name: 'Hero', value: 420, fill: PALETTE.blue },
    { name: 'Medium', value: 310, fill: PALETTE.emerald },
    { name: 'Card', value: 380, fill: PALETTE.amber },
    { name: 'Thumbnail', value: 240, fill: PALETTE.purple },
    { name: 'Custom', value: 132, fill: PALETTE.cyan },
  ], []);

  const totalAssetsCount = useMemo(() => {
    return mediaStorageData.reduce((acc, curr) => acc + curr.value, 0) + mediaCount;
  }, [mediaStorageData, mediaCount]);

  const monetizationData = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return [
          { period: 'Mon', revenue: 420, ecpm: 16.4 },
          { period: 'Tue', revenue: 580, ecpm: 17.8 },
          { period: 'Wed', revenue: 640, ecpm: 18.2 },
          { period: 'Thu', revenue: 720, ecpm: 19.5 },
          { period: 'Fri', revenue: 690, ecpm: 18.9 },
          { period: 'Sat', revenue: 450, ecpm: 15.2 },
          { period: 'Sun', revenue: 510, ecpm: 16.8 },
        ];
      case '90d':
        return [
          { period: 'Month 1', revenue: 6800, ecpm: 17.2 },
          { period: 'Month 2', revenue: 8400, ecpm: 18.5 },
          { period: 'Month 3', revenue: 11200, ecpm: 21.4 },
        ];
      case '1y':
        return [
          { period: 'Q1', revenue: 19400, ecpm: 16.8 },
          { period: 'Q2', revenue: 26800, ecpm: 18.2 },
          { period: 'Q3', revenue: 34500, ecpm: 20.6 },
          { period: 'Q4', revenue: 43200, ecpm: 23.4 },
        ];
      case '30d':
      default:
        return [
          { period: 'Wk 1', revenue: 1620, ecpm: 16.8 },
          { period: 'Wk 2', revenue: 2150, ecpm: 18.4 },
          { period: 'Wk 3', revenue: 2840, ecpm: 19.8 },
          { period: 'Wk 4', revenue: 3420, ecpm: 22.1 },
        ];
    }
  }, [timeframe]);

  const healthRadarData = useMemo(() => [
    { metric: 'SEO Health', score: 96, benchmark: 88 },
    { metric: 'Content Velocity', score: 91, benchmark: 82 },
    { metric: 'Media Optimization', score: 98, benchmark: 85 },
    { metric: 'Security & RBAC', score: 100, benchmark: 90 },
    { metric: 'Community Growth', score: 86, benchmark: 75 },
    { metric: 'API Reliability', score: 99, benchmark: 95 },
  ], []);

  const workflowsData = useMemo(() => [
    { name: 'Queue Dispatch', value: 98, fill: PALETTE.purple },
    { name: 'SEO Audit', value: 95, fill: PALETTE.amber },
    { name: 'Legal Approval', value: 84, fill: PALETTE.emerald },
    { name: 'Draft Review SLA', value: 92, fill: PALETTE.blue },
  ], []);

  const contentTypeData = useMemo(() => [
    { model: 'Articles', requests: 420, fill: PALETTE.blue },
    { model: 'Landing Pages', requests: 310, fill: PALETTE.emerald },
    { model: 'Documentation', requests: 280, fill: PALETTE.amber },
    { model: 'Case Studies', requests: 190, fill: PALETTE.purple },
    { model: 'Product Specs', requests: 140, fill: PALETTE.cyan },
  ], []);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------- */}
      {/* TOP COMMAND HEADER WITH TIMEFRAME & INTERACTIVE MODULE TABS */}
      {/* ------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              Platform Intelligence
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Edge Active
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time analytics across all 12 CMS engine modules, audience capture, Cloudflare R2 assets, and delivery APIs.
          </p>
        </div>

        {/* Action & Filter Cluster */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Timeframe Selector Pill */}
          <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/30 p-1 text-xs font-medium shadow-2xs">
            {(['7d', '30d', '90d', '1y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium',
                  timeframe === tf
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Quick Create Buttons */}
          <Link href="/admin/content?type=articles">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-1.5 border-border/80 bg-card hover:bg-accent hover:text-foreground shadow-2xs cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              <span>New Article</span>
            </Button>
          </Link>

          <Link href="/admin/media">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-1.5 border-border/80 bg-card hover:bg-accent hover:text-foreground shadow-2xs cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
              <span>Upload Media</span>
            </Button>
          </Link>

          <Link href="/admin/content">
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Entry</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* INTERACTIVE MODULE FILTER TABS */}
      {/* ------------------------------------------------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Modules', icon: Sparkles, badge: 'Full Matrix' },
          { id: 'content', label: 'Content & Editorial', icon: FileText, badge: `${publishedCount} Published` },
          { id: 'audience', label: 'Audience & Leads', icon: Users, badge: 'Form + Mail' },
          { id: 'media', label: 'Media & R2 DAM', icon: ImageIcon, badge: `${mediaCount} Assets` },
          { id: 'revenue', label: 'Revenue & Monetization', icon: DollarSign, badge: 'AdSense' },
          { id: 'system', label: 'System & RBAC', icon: ShieldCheck, badge: `${usersCount} Users` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id as ModuleFilter)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border',
                isActive
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-xs'
                  : 'bg-card text-muted-foreground border-border/70 hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------- */}
      {/* ROW 1: TOP 6 METRIC CARDS WITH ANIMATED SPARKLINE STATS */}
      {/* ------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Content Velocity */}
        <Card className="p-4 flex flex-col justify-between rounded-xl bg-card border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Content Velocity</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {publishedCount + draftCount + scheduledCount}
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +18.4%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {publishedCount} published • {draftCount} in drafts
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Publish rate</span>
            <span className="font-semibold text-foreground">94.2% on-time</span>
          </div>
        </Card>

        {/* Metric 2: Media DAM Assets */}
        <Card className="p-4 flex flex-col justify-between rounded-xl bg-card border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Cloudflare R2 DAM</span>
              <ImageIcon className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {totalAssetsCount}
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +74.2%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              WebP converted • Zero JPEG retention
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Storage saved</span>
            <span className="font-semibold text-foreground">14.8 GB</span>
          </div>
        </Card>

        {/* Metric 3: Inbound Leads */}
        <Card className="p-4 flex flex-col justify-between rounded-xl bg-card border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Forms & Leads</span>
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                1,428
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +26.5%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Qualified contact & demo submissions
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Conversion rate</span>
            <span className="font-semibold text-foreground">6.8%</span>
          </div>
        </Card>

        {/* Metric 4: Newsletter Subscribers */}
        <Card className="p-4 flex flex-col justify-between rounded-xl bg-card border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Subscribers</span>
              <Mail className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                8,642
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +31.2%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active verified newsletter readers
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Avg Open Rate</span>
            <span className="font-semibold text-foreground">42.4%</span>
          </div>
        </Card>

        {/* Metric 5: AdSense Revenue */}
        <Card className="p-4 flex flex-col justify-between rounded-xl bg-card border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Ad Monetization</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                $23.4k
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +14.8%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              eCPM $18.42 • 100% ads.txt valid
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Header bidding</span>
            <span className="font-semibold text-foreground">Prebid Active</span>
          </div>
        </Card>

        {/* Metric 6: Edge API Delivery */}
        <Card className="p-4 flex flex-col justify-between rounded-xl bg-card border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Edge API Delivery</span>
              <Zap className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                99.98%
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-500">
                <CheckCircle2 className="h-3 w-3 mr-0.5" />
                SLA Met
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              12ms p99 cache response time
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Monthly requests</span>
            <span className="font-semibold text-foreground">14.2M</span>
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------- */}
      {/* SECTION 2: PRIMARY INTERACTIVE CHARTS (AREA + BAR) */}
      {/* ------------------------------------------------------- */}
      {(activeModule === 'all' || activeModule === 'content' || activeModule === 'audience') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* CHART 1: INTERACTIVE AREA CHART - CONTENT PUBLISHING VELOCITY */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Content Publishing Velocity & Output
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Published articles, in-flight drafts, and queued releases over {timeframe.toUpperCase()}.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
                Interactive Area
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={contentVelocityConfig} className="h-[280px] w-full">
                <AreaChart data={contentVelocityData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillPublished" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.7} />
                      <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillDrafts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.7} />
                      <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.amber} stopOpacity={0.7} />
                      <stop offset="95%" stopColor={PALETTE.amber} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    type="monotone"
                    dataKey="published"
                    stroke={PALETTE.blue}
                    fill="url(#fillPublished)"
                    strokeWidth={2}
                    stackId="a"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="drafts"
                    stroke={PALETTE.emerald}
                    fill="url(#fillDrafts)"
                    strokeWidth={2}
                    stackId="a"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    stroke={PALETTE.amber}
                    fill="url(#fillScheduled)"
                    strokeWidth={2}
                    stackId="a"
                    isAnimationActive={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 mt-3 py-2.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Peak Velocity: 56 releases / cycle
              </span>
              <Link href="/admin/content" className="text-primary hover:underline font-semibold flex items-center gap-1">
                View Content Table <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* CHART 2: INTERACTIVE BAR CHART - AUDIENCE ACQUISITION & LEADS */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Audience Growth & Inbound Leads
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Subscribers, Form Leads, and Community comments across channels.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setBarLayout(barLayout === 'grouped' ? 'stacked' : 'grouped')}
                  className="px-2.5 py-1 text-[11px] rounded-md border border-border/80 bg-accent/40 hover:bg-accent text-foreground font-medium transition-colors cursor-pointer"
                >
                  {barLayout === 'grouped' ? 'Stack Bars' : 'Group Bars'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={audienceGrowthConfig} className="h-[280px] w-full">
                <BarChart data={audienceGrowthData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar
                    dataKey="subscribers"
                    fill={PALETTE.blue}
                    radius={barLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    stackId={barLayout === 'stacked' ? 'a' : undefined}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="leads"
                    fill={PALETTE.emerald}
                    radius={barLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    stackId={barLayout === 'stacked' ? 'a' : undefined}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="comments"
                    fill={PALETTE.purple}
                    radius={[4, 4, 0, 0]}
                    stackId={barLayout === 'stacked' ? 'a' : undefined}
                    isAnimationActive={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 mt-3 py-2.5">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Lead conversion rate: 26.5% (+4.2% QoQ)
              </span>
              <Link href="/admin/forms" className="text-primary hover:underline font-semibold flex items-center gap-1">
                Submissions Inbox <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* SECTION 3: TRI-PANEL ADVANCED CHARTS (DONUT + DUAL-AXIS LINE + RADAR) */}
      {/* ------------------------------------------------------- */}
      {(activeModule === 'all' || activeModule === 'media' || activeModule === 'revenue' || activeModule === 'system') && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* CHART 3: DONUT CHART - CLOUDFLARE R2 ASSETS BY PRESET */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-500" />
                  R2 DAM WebP Presets
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Donut
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Zero-retention auto-crop variants in Cloudflare R2.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={mediaStorageConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={mediaStorageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {mediaStorageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
              <div className="text-center pt-1">
                <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                  {totalAssetsCount.toLocaleString()} Assets
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  Optimized WebP Variants (74.2% Saved)
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 py-2.5">
              <span>Cloudflare R2 active</span>
              <Link href="/admin/media" className="text-primary hover:underline font-semibold flex items-center gap-1">
                Media DAM <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* CHART 4: DUAL-AXIS MULTI-LINE CHART - ADSENSE & REVENUE PERFORMANCE */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Monetization & AdSense
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Dual-Axis Line
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Real-time RPM, impressions, and estimated ad revenue.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={monetizationConfig} className="h-[220px] w-full">
                <LineChart data={monetizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[10, 25]}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={PALETTE.emerald}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PALETTE.emerald }}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ecpm"
                    stroke={PALETTE.amber}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: PALETTE.amber }}
                    isAnimationActive={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
              <div className="text-center pt-1">
                <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                  $23,450.00
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  Average eCPM: $18.42 / 1k impressions
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 py-2.5">
              <span>Header bidding: Active</span>
              <Link href="/admin/ads" className="text-primary hover:underline font-semibold flex items-center gap-1">
                AdSense Settings <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* CHART 5: RADAR CHART - CMS PLATFORM HEALTH MATRIX */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Module Health Radar
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Spider Radar
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Multi-dimensional evaluation against benchmarks.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={healthRadarConfig} className="h-[220px] w-full">
                <RadarChart data={healthRadarData} outerRadius="65%">
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9.5, fill: 'var(--muted-foreground)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar
                    name="score"
                    dataKey="score"
                    stroke={PALETTE.blue}
                    fill={PALETTE.blue}
                    fillOpacity={0.35}
                    isAnimationActive={false}
                  />
                  <Radar
                    name="benchmark"
                    dataKey="benchmark"
                    stroke={PALETTE.emerald}
                    fill={PALETTE.emerald}
                    fillOpacity={0.15}
                    isAnimationActive={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
              <div className="text-center pt-1">
                <div className="text-xl font-bold font-mono tracking-tight text-emerald-500">
                  95.7 / 100 Score
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  Grade A+ Enterprise Health
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 py-2.5">
              <span>All 12 modules healthy</span>
              <span className="font-semibold text-emerald-500">0 critical alerts</span>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* SECTION 4: WORKFLOW RADIAL BAR & CONTENT TYPES HORIZONTAL */}
      {/* ------------------------------------------------------- */}
      {(activeModule === 'all' || activeModule === 'content' || activeModule === 'system') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* CHART 6: RADIAL BAR CHART - WORKFLOW SLA & STAGE COMPLETIONS */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-violet-500" />
                  Editorial Governance & Workflow SLA Rings
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Multi-tier editorial stages and automated release pipeline health.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-violet-500/10 text-violet-400 border-violet-500/20">
                Radial Bar
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={workflowsConfig} className="h-[250px] w-full">
                <RadialBarChart
                  data={workflowsData}
                  innerRadius="30%"
                  outerRadius="100%"
                  barSize={12}
                  startAngle={180}
                  endAngle={0}
                >
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
                  <RadialBar background dataKey="value" cornerRadius={6} isAnimationActive={false} />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadialBarChart>
              </ChartContainer>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 text-center">
                <div className="p-2 rounded-lg bg-muted/20">
                  <div className="text-xs text-muted-foreground">Draft Review</div>
                  <div className="text-base font-bold text-foreground font-mono">92%</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20">
                  <div className="text-xs text-muted-foreground">Legal Approval</div>
                  <div className="text-base font-bold text-foreground font-mono">84%</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20">
                  <div className="text-xs text-muted-foreground">SEO Audit</div>
                  <div className="text-base font-bold text-foreground font-mono">95%</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/20">
                  <div className="text-xs text-muted-foreground">Queue Dispatch</div>
                  <div className="text-base font-bold text-foreground font-mono">98%</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 mt-3 py-2.5">
              <span>Zero blocked approval queues</span>
              <Link href="/admin/workflows" className="text-primary hover:underline font-semibold flex items-center gap-1">
                Workflow Rules <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* CHART 7: HORIZONTAL BAR CHART - CONTENT MODELS BY POPULARITY */}
          <Card className="rounded-xl bg-card border-border/80 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-500" />
                  Top Content Models by API Read Throughput
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Schema delivery request distribution across modern edge endpoints.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                Horizontal Bar
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={contentTypeConfig} className="h-[250px] w-full">
                <BarChart
                  data={contentTypeData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    dataKey="model"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground px-2">
                <span>Cache hit ratio: <strong>99.4%</strong></span>
                <span>Fastest route: <strong>/api/v1/content/articles</strong> (4ms)</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 mt-3 py-2.5">
              <span>{contentTypesCount} active custom content types</span>
              <Link href="/admin/content-types" className="text-primary hover:underline font-semibold flex items-center gap-1">
                Schema Builder <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* SECTION 5: LIVE EVENT STREAM & QUICK MODULE DISPATCH */}
      {/* ------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Real-time Ticker */}
        <Card className="lg:col-span-2 rounded-xl bg-card border-border/80 shadow-2xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <CardTitle className="text-sm font-bold text-foreground">
                Real-Time Module Telemetry Feed
              </CardTitle>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              WebSocket Channel: #cms-edge-events
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {RECENT_EVENTS.map((evt, idx) => {
              const isCurrent = idx === eventTickerIndex;
              return (
                <div
                  key={evt.id}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs',
                    isCurrent
                      ? 'bg-primary/5 border-primary/30 shadow-2xs'
                      : 'bg-muted/10 border-border/40 hover:bg-muted/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-md flex items-center justify-center font-bold text-xs',
                        evt.badgeColor
                      )}
                    >
                      {evt.badgeText}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {evt.title}
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-mono">
                            just now
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        {evt.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap ml-4">
                    {evt.time}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Rapid Operational Dispatch */}
        <Card className="rounded-xl bg-card border-border/80 shadow-2xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Rapid Module Shortcuts
            </CardTitle>
            <CardDescription className="text-xs">
              One-click access to administrative modules and configuration suites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {[
              { label: 'Cloudflare R2 Media Auto-Crop', href: '/admin/media', icon: ImageIcon, color: 'text-amber-500' },
              { label: 'Editorial Calendar & Schedules', href: '/admin/calendar', icon: Calendar, color: 'text-blue-500' },
              { label: 'Newsletter Campaign Dispatch', href: '/admin/newsletter', icon: Mail, color: 'text-indigo-500' },
              { label: 'Inbound Forms & Lead Inbox', href: '/admin/forms', icon: FileSpreadsheet, color: 'text-emerald-500' },
              { label: 'Google AdSense & ads.txt', href: '/admin/ads', icon: DollarSign, color: 'text-emerald-400' },
              { label: 'API Keys & Developer Webhooks', href: '/admin/api-keys', icon: Key, color: 'text-cyan-500' },
            ].map((shortcut, sIdx) => {
              const Icon = shortcut.icon;
              return (
                <Link
                  key={sIdx}
                  href={shortcut.href}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/60 hover:border-border transition-all text-xs group"
                >
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Icon className={cn('h-3.5 w-3.5', shortcut.color)} />
                    {shortcut.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </CardContent>
          <CardFooter className="pt-0 text-[11px] text-muted-foreground border-t border-border/40 py-2.5">
            <span>Markup Core Engine v1.0 • Postgres 18 Edge</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

const RECENT_EVENTS = [
  {
    id: 'evt_1',
    badgeText: 'DAM',
    badgeColor: 'bg-amber-500/10 text-amber-500',
    title: 'Cloudflare R2 WebP Asset Generated',
    description: 'Auto-cropped DSC_9482.jpg into Hero & Card WebP variants with focal-point (0.55, 0.42).',
    time: '12s ago',
  },
  {
    id: 'evt_2',
    badgeText: 'LEAD',
    badgeColor: 'bg-emerald-500/10 text-emerald-500',
    title: 'New Enterprise Lead Captured',
    description: 'Received RFQ submission from Acme Corporation via Enterprise Inbound Form.',
    time: '1m ago',
  },
  {
    id: 'evt_3',
    badgeText: 'SEO',
    badgeColor: 'bg-blue-500/10 text-blue-500',
    title: 'Sitemap.xml Auto-Regenerated',
    description: '34 published content entries indexed with Schema.org JSON-LD canonical references.',
    time: '3m ago',
  },
  {
    id: 'evt_4',
    badgeText: 'ADS',
    badgeColor: 'bg-purple-500/10 text-purple-500',
    title: 'AdSense Header Bidding Auction',
    description: 'Prebid cleared at $21.40 eCPM across in_article_banner slot.',
    time: '5m ago',
  },
  {
    id: 'evt_5',
    badgeText: 'AUTH',
    badgeColor: 'bg-cyan-500/10 text-cyan-500',
    title: 'RBAC Policy Verified',
    description: 'Super Administrator session authenticated via PBKDF2 token.',
    time: '8m ago',
  },
];
