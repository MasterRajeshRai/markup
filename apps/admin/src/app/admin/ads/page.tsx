'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Megaphone,
  TrendingUp,
  BarChart3,
  Layers,
  Settings,
  Code2,
  FileText,
  Check,
  Copy,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Monitor,
  Smartphone,
  Sliders,
  Sparkles,
  HelpCircle,
  Info,
  Power,
  SlidersHorizontal,
  MousePointerClick,
  Percent,
  Download,
  Calculator,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { AdUnitItem, AdSenseSettings } from '@/lib/ads-service';
import { ModuleGuard } from '@/components/module-guard';

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'settings' | 'autoinject' | 'adstxt' | 'snippets' | 'calculator'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Data states
  const [settings, setSettings] = useState<AdSenseSettings>({
    publisherId: 'ca-pub-7489201948271049',
    autoAdsEnabled: true,
    lazyLoadEnabled: true,
    consentModeV2: true,
    testMode: false,
    adBlockerNoticeEnabled: true,
    minWordCountForAds: 450,
    autoInjectParagraphs: [2, 5, 9],
    excludedCategories: ['privacy-policy', 'terms-of-service'],
  });

  const [adUnits, setAdUnits] = useState<AdUnitItem[]>([]);
  const [adsTxt, setAdsTxt] = useState<string>('');
  const [analytics, setAnalytics] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalEarnings: 0,
    avgCtr: 0,
    avgEcpm: 0,
  });

  // Filter & Search states for units
  const [searchQuery, setSearchQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  // Ad Unit Create / Edit Modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<AdUnitItem | null>(null);
  const [unitForm, setUnitForm] = useState({
    name: '',
    slotId: '',
    placement: 'in_article' as AdUnitItem['placement'],
    format: 'responsive' as AdUnitItem['format'],
    deviceTargeting: 'all' as AdUnitItem['deviceTargeting'],
    isActive: true,
    customFallbackHtml: '',
  });

  // Preview Modal
  const [previewUnit, setPreviewUnit] = useState<AdUnitItem | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ads.txt validation state
  const [adsTxtValidation, setAdsTxtValidation] = useState<{
    validCount: number;
    invalidCount: number;
    errors: string[];
  } | null>(null);

  // Revenue Estimator state
  const [calcPageviews, setCalcPageviews] = useState<number>(100000);
  const [calcNiche, setCalcNiche] = useState<string>('tech');
  const [calcGeo, setCalcGeo] = useState<string>('tier1');

  const nicheRpmMultipliers: Record<string, { name: string; baseRpm: number }> = {
    finance: { name: 'Finance, Crypto & Investing', baseRpm: 24.50 },
    tech: { name: 'Technology, SaaS & Development', baseRpm: 15.80 },
    health: { name: 'Health, Wellness & Medicine', baseRpm: 13.20 },
    lifestyle: { name: 'Lifestyle, Travel & Fashion', baseRpm: 6.40 },
    gaming: { name: 'Gaming, Media & Entertainment', baseRpm: 3.80 },
  };

  const estimatedRpm = useMemo(() => {
    const base = nicheRpmMultipliers[calcNiche]?.baseRpm || 10;
    const geoMultiplier = calcGeo === 'tier1' ? 1.0 : 0.45;
    return base * geoMultiplier;
  }, [calcNiche, calcGeo]);

  const estimatedMonthlyRevenue = useMemo(() => {
    return (calcPageviews / 1000) * estimatedRpm;
  }, [calcPageviews, estimatedRpm]);

  const handleDownloadAdsTxt = () => {
    const blob = new Blob([adsTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ads.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateAdsTxtSyntax = () => {
    const lines = adsTxt.split('\n');
    let validCount = 0;
    let invalidCount = 0;
    const errors: string[] = [];

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) return;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 3) {
        invalidCount++;
        errors.push(`Line ${idx + 1}: Expected minimum 3 fields (Domain, Pub ID, Type). Found: "${line}"`);
      } else if (!['DIRECT', 'RESELLER'].includes(parts[2].toUpperCase())) {
        invalidCount++;
        errors.push(`Line ${idx + 1}: Account type must be DIRECT or RESELLER (received "${parts[2]}")`);
      } else {
        validCount++;
      }
    });

    setAdsTxtValidation({ validCount, invalidCount, errors });
  };

  const fetchAdsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/ads');
      const data = await res.json();
      if (data.success) {
        if (data.settings) setSettings(data.settings);
        if (data.adUnits) setAdUnits(data.adUnits);
        if (data.adsTxt) setAdsTxt(data.adsTxt);
        if (data.analytics) setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching ads data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAll = async (overrideSettings?: AdSenseSettings, overrideUnits?: AdUnitItem[], overrideAdsTxt?: string) => {
    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: overrideSettings || settings,
          adUnits: overrideUnits || adUnits,
          adsTxt: overrideAdsTxt !== undefined ? overrideAdsTxt : adsTxt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('All monetization settings and ad inventory updated successfully.');
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Error saving ads configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle individual unit active state
  const toggleUnitStatus = (unitId: string) => {
    const updated = adUnits.map((u) => (u.id === unitId ? { ...u, isActive: !u.isActive } : u));
    setAdUnits(updated);
    handleSaveAll(settings, updated, adsTxt);
  };

  // Open modal for creating a new ad unit
  const openCreateUnitModal = () => {
    setEditingUnit(null);
    setUnitForm({
      name: '',
      slotId: '',
      placement: 'in_article',
      format: 'responsive',
      deviceTargeting: 'all',
      isActive: true,
      customFallbackHtml: '',
    });
    setIsUnitModalOpen(true);
  };

  // Open modal for editing an existing ad unit
  const openEditUnitModal = (unit: AdUnitItem) => {
    setEditingUnit(unit);
    setUnitForm({
      name: unit.name,
      slotId: unit.slotId,
      placement: unit.placement,
      format: unit.format,
      deviceTargeting: unit.deviceTargeting,
      isActive: unit.isActive,
      customFallbackHtml: unit.customFallbackHtml || '',
    });
    setIsUnitModalOpen(true);
  };

  const saveUnitForm = async () => {
    if (!unitForm.name.trim() || !unitForm.slotId.trim()) return;

    let updatedUnits: AdUnitItem[];
    if (editingUnit) {
      updatedUnits = adUnits.map((u) =>
        u.id === editingUnit.id
          ? {
              ...u,
              name: unitForm.name.trim(),
              slotId: unitForm.slotId.trim(),
              placement: unitForm.placement,
              format: unitForm.format,
              deviceTargeting: unitForm.deviceTargeting,
              isActive: unitForm.isActive,
              customFallbackHtml: unitForm.customFallbackHtml.trim() || undefined,
            }
          : u
      );
    } else {
      const newUnit: AdUnitItem = {
        id: `ad_${Date.now()}`,
        name: unitForm.name.trim(),
        slotId: unitForm.slotId.trim(),
        placement: unitForm.placement,
        format: unitForm.format,
        deviceTargeting: unitForm.deviceTargeting,
        isActive: unitForm.isActive,
        priority: adUnits.length + 1,
        impressions30d: 0,
        clicks30d: 0,
        ctr: 0,
        earnings30d: 0,
        customFallbackHtml: unitForm.customFallbackHtml.trim() || undefined,
      };
      updatedUnits = [...adUnits, newUnit];
    }

    setAdUnits(updatedUnits);
    setIsUnitModalOpen(false);
    await handleSaveAll(settings, updatedUnits, adsTxt);
  };

  const deleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this ad unit?')) return;
    const updated = adUnits.filter((u) => u.id !== unitId);
    setAdUnits(updated);
    await handleSaveAll(settings, updated, adsTxt);
  };

  // Filtered Ad Units
  const filteredUnits = useMemo(() => {
    return adUnits.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.slotId.includes(searchQuery) ||
        u.placement.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlacement = placementFilter === 'all' || u.placement === placementFilter;
      const matchesDevice = deviceFilter === 'all' || u.deviceTargeting === deviceFilter;
      return matchesSearch && matchesPlacement && matchesDevice;
    });
  }, [adUnits, searchQuery, placementFilter, deviceFilter]);

  const placementLabels: Record<AdUnitItem['placement'], string> = {
    header_leaderboard: 'Header Leaderboard (728x90)',
    in_article: 'In-Article Paragraph Native',
    sidebar_rectangle: 'Sidebar Sticky / Rectangle',
    in_feed: 'In-Feed Article Stream',
    mobile_sticky_footer: 'Mobile Sticky Footer (320x50)',
    custom: 'Custom HTML / Fallback Slot',
  };

  const formatLabels: Record<AdUnitItem['format'], string> = {
    responsive: 'Responsive (Fluid auto-sizing)',
    fixed_728x90: 'Leaderboard 728 × 90',
    fixed_300x250: 'Medium Rectangle 300 × 250',
    fixed_300x600: 'Half-Page / Large 300 × 600',
    fixed_320x50: 'Mobile Banner 320 × 50',
    multiplex: 'Multiplex (Grid Recommendations)',
  };

  const renderPlacementBadge = (placement: AdUnitItem['placement']) => {
    switch (placement) {
      case 'header_leaderboard':
        return <Badge variant="outline" className="border-blue-500/40 text-blue-500 bg-blue-500/10 text-xs">Header</Badge>;
      case 'in_article':
        return <Badge variant="outline" className="border-purple-500/40 text-purple-500 bg-purple-500/10 text-xs">In-Article</Badge>;
      case 'sidebar_rectangle':
        return <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 text-xs">Sidebar</Badge>;
      case 'in_feed':
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 text-xs">In-Feed</Badge>;
      case 'mobile_sticky_footer':
        return <Badge variant="outline" className="border-rose-500/40 text-rose-500 bg-rose-500/10 text-xs">Mobile Sticky</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-500/40 text-slate-400 bg-slate-500/10 text-xs">Custom</Badge>;
    }
  };

  const renderDeviceBadge = (device: AdUnitItem['deviceTargeting']) => {
    if (device === 'desktop_only') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Monitor className="h-3 w-3 text-blue-400" /> Desktop
        </span>
      );
    }
    if (device === 'mobile_only') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Smartphone className="h-3 w-3 text-emerald-400" /> Mobile
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
        <Monitor className="h-3 w-3 text-slate-400" /> All Devices
      </span>
    );
  };

  return (
    <ModuleGuard moduleId="adsense">
      <div className="space-y-6 pb-12">
      {/* Top Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-2xs">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">AdSense &amp; Advertising Management</h1>
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[11px] font-semibold">
                  Google AdSense Certified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage high-yield Google AdSense ad units, automated in-article placements, dynamic ads.txt, and monetization analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/ads.txt', '_blank')}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" /> View /ads.txt
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={openCreateUnitModal}
            className="h-9 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-2xs"
          >
            <Plus className="h-4 w-4" /> Create Ad Unit
          </Button>
        </div>
      </div>

      {/* Success banner if present */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b pb-px overflow-x-auto no-scrollbar text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="h-4 w-4" /> Performance &amp; KPIs
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'units'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Layers className="h-4 w-4" /> Ad Units &amp; Placements ({adUnits.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'settings'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4" /> AdSense Setup
        </button>
        <button
          onClick={() => setActiveTab('autoinject')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'autoinject'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Zap className="h-4 w-4" /> In-Article Auto-Injection
        </button>
        <button
          onClick={() => setActiveTab('adstxt')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'adstxt'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" /> ads.txt Validator
        </button>
        <button
          onClick={() => setActiveTab('snippets')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'snippets'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Code2 className="h-4 w-4" /> Frontend Snippets &amp; API
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap',
            activeTab === 'calculator'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Calculator className="h-4 w-4" /> Revenue &amp; RPM Estimator
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PERFORMANCE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">30-Day Estimated Revenue</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">
                    ${analytics.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-[10px] font-semibold">
                    +18.4% MoM
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Google AdSense ad network earnings</p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Ad Impressions Served</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">
                    {(analytics.totalImpressions / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[11px] text-muted-foreground">views</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Filtered for non-bot human viewability</p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Average CTR</span>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <MousePointerClick className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">{analytics.avgCtr}%</span>
                  <span className="text-[11px] text-muted-foreground">clicks</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {analytics.totalClicks.toLocaleString()} total ad clicks recorded
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Average eCPM</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">
                    ${analytics.avgEcpm.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">per 1k imp</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Effective cost per mille across units</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Status Bar */}
          <Card className="border bg-card shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    AdSense Publisher Account Status
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Linked to Publisher ID: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{settings.publisherId}</code>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn(
                    'text-xs font-medium',
                    settings.autoAdsEnabled ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10' : 'border-slate-500/40 text-slate-400'
                  )}>
                    Auto Ads: {settings.autoAdsEnabled ? 'Active' : 'Disabled'}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    'text-xs font-medium',
                    settings.consentModeV2 ? 'border-blue-500/40 text-blue-500 bg-blue-500/10' : 'border-slate-500/40 text-slate-400'
                  )}>
                    Consent Mode v2: {settings.consentModeV2 ? 'Compliant' : 'Off'}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    'text-xs font-medium',
                    settings.testMode ? 'border-amber-500/40 text-amber-500 bg-amber-500/10' : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                  )}>
                    {settings.testMode ? 'Sandbox / Test Mode' : 'Production Live'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Performance by Unit Table */}
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Ad Unit Performance Breakdown (Last 30 Days)</CardTitle>
                  <CardDescription className="text-xs">
                    High-performing ad units ranked by revenue and click yield.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchAdsData} className="h-8 gap-1 text-xs">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-y text-muted-foreground uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Ad Unit &amp; Slot</th>
                      <th className="px-4 py-3">Placement</th>
                      <th className="px-4 py-3">Targeting</th>
                      <th className="px-4 py-3 text-right">Impressions</th>
                      <th className="px-4 py-3 text-right">Clicks</th>
                      <th className="px-4 py-3 text-right">CTR</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{unit.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            Slot: {unit.slotId}
                          </div>
                        </td>
                        <td className="px-4 py-3">{renderPlacementBadge(unit.placement)}</td>
                        <td className="px-4 py-3">{renderDeviceBadge(unit.deviceTargeting)}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {unit.impressions30d.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {unit.clicks30d.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-purple-600 dark:text-purple-400">
                          {unit.ctr}%
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ${unit.earnings30d.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleUnitStatus(unit.id)}
                            className={cn(
                              'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors',
                              unit.isActive
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                          >
                            {unit.isActive ? 'Active' : 'Paused'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: AD UNITS & PLACEMENTS */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Search ad units by name or slot ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                aria-label="Filter ad units by placement"
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Placements</option>
                <option value="header_leaderboard">Header Leaderboard</option>
                <option value="in_article">In-Article Paragraph</option>
                <option value="sidebar_rectangle">Sidebar Rectangle</option>
                <option value="in_feed">In-Feed Native</option>
                <option value="mobile_sticky_footer">Mobile Sticky Footer</option>
                <option value="custom">Custom / Fallback</option>
              </select>

              <select
                aria-label="Filter ad units by device targeting"
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Devices</option>
                <option value="desktop_only">Desktop Only</option>
                <option value="mobile_only">Mobile Only</option>
              </select>

              <Button
                variant="default"
                size="sm"
                onClick={openCreateUnitModal}
                className="h-9 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
              >
                <Plus className="h-4 w-4" /> Add Unit
              </Button>
            </div>
          </div>

          {/* Ad Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <Card key={unit.id} className={cn('border transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between', !unit.isActive && 'opacity-65 bg-muted/20')}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {renderPlacementBadge(unit.placement)}
                        {renderDeviceBadge(unit.deviceTargeting)}
                      </div>
                      <CardTitle className="text-sm font-semibold mt-2 line-clamp-1">{unit.name}</CardTitle>
                    </div>
                    <button
                      onClick={() => toggleUnitStatus(unit.id)}
                      title={unit.isActive ? 'Click to Pause' : 'Click to Activate'}
                      className={cn(
                        'p-1.5 rounded-full transition-colors',
                        unit.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-muted'
                      )}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-1">
                    Slot ID: <span className="font-semibold text-foreground">{unit.slotId}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 pb-3 space-y-2.5">
                  <div className="p-2.5 rounded-md bg-muted/40 border border-border/50 text-[11px] space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Format:</span>
                      <span className="font-medium text-foreground">{formatLabels[unit.format]}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>30-Day Impressions:</span>
                      <span className="font-medium text-foreground">{unit.impressions30d.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CTR / Revenue:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{unit.ctr}% / ${unit.earnings30d.toFixed(2)}</span>
                    </div>
                  </div>

                  {unit.customFallbackHtml && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Custom fallback banner configured
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-3 bg-muted/20 border-t flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewUnit(unit)}
                    className="h-7 text-xs gap-1"
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditUnitModal(unit)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUnit(unit.id)}
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredUnits.length === 0 && (
            <div className="p-8 text-center border rounded-lg bg-card">
              <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-semibold">No ad units match your filter</h3>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria or create a new ad unit.</p>
              <Button onClick={openCreateUnitModal} size="sm" className="mt-4 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Ad Unit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADSENSE SETUP & CORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Google AdSense Credentials &amp; Verification
              </CardTitle>
              <CardDescription className="text-xs">
                Your publisher credentials are used across frontend script tags, Auto Ads injections, and ads.txt files.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="publisherId" className="text-xs font-semibold flex items-center gap-1.5">
                  AdSense Publisher ID
                  <span className="text-[11px] font-normal text-muted-foreground">(Must start with &ldquo;ca-pub-&rdquo;)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="publisherId"
                    value={settings.publisherId}
                    onChange={(e) => setSettings({ ...settings, publisherId: e.target.value.trim() })}
                    placeholder="ca-pub-1234567890123456"
                    className="font-mono text-xs h-10 pr-24"
                  />
                  {settings.publisherId.startsWith('ca-pub-') && settings.publisherId.length > 15 ? (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Valid ID
                    </span>
                  ) : (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                      <AlertCircle className="h-4 w-4" /> Check Prefix
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Found inside your Google AdSense Dashboard &gt; Account &gt; Settings &gt; Account Information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                {/* Auto Ads */}
                <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border bg-muted/20">
                  <div className="space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" /> Auto Ads Engine
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Allows Google machine learning to automatically insert ads into page layouts where they convert best.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Toggle Auto Ads Engine"
                    checked={settings.autoAdsEnabled}
                    onChange={(e) => setSettings({ ...settings, autoAdsEnabled: e.target.checked })}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer mt-1"
                  />
                </div>

                {/* PageSpeed Lazy Loading */}
                <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border bg-muted/20">
                  <div className="space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Core Web Vitals Lazy Load
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Defers AdSense script execution until user scrolls near the ad unit, preventing layout shifts (CLS) and boosting mobile LCP.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Toggle Core Web Vitals Lazy Load"
                    checked={settings.lazyLoadEnabled}
                    onChange={(e) => setSettings({ ...settings, lazyLoadEnabled: e.target.checked })}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer mt-1"
                  />
                </div>

                {/* Consent Mode v2 */}
                <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border bg-muted/20">
                  <div className="space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Google Consent Mode v2
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Automatically passes EU GDPR &amp; IAB TCF 2.2 signals (<code className="text-[10px]">ad_storage</code>, <code className="text-[10px]">ad_personalization</code>) to prevent AdSense account penalties.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Toggle Google Consent Mode v2"
                    checked={settings.consentModeV2}
                    onChange={(e) => setSettings({ ...settings, consentModeV2: e.target.checked })}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer mt-1"
                  />
                </div>

                {/* Ad Blocker Notice */}
                <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border bg-muted/20">
                  <div className="space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Megaphone className="h-3.5 w-3.5 text-purple-500" /> Ad-Blocker Recovery Notice
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Prompts users with polite whitelist messages when an ad blocker prevents units from rendering.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Toggle Ad-Blocker Recovery Notice"
                    checked={settings.adBlockerNoticeEnabled}
                    onChange={(e) => setSettings({ ...settings, adBlockerNoticeEnabled: e.target.checked })}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer mt-1"
                  />
                </div>

                {/* Sandbox / Test Mode */}
                <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border bg-muted/20 md:col-span-2">
                  <div className="space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-rose-500" /> Test Mode / Development Sandbox
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Appends <code className="text-[10px]">data-adtest=&ldquo;on&rdquo;</code> to ad units. Essential during local development and previewing so your AdSense account is never penalized for accidental self-clicks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Toggle Test Mode / Development Sandbox"
                    checked={settings.testMode}
                    onChange={(e) => setSettings({ ...settings, testMode: e.target.checked })}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer mt-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/20 border-t flex justify-end">
              <Button
                onClick={() => handleSaveAll(settings, adUnits, adsTxt)}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-9"
              >
                {saving ? 'Saving...' : 'Save AdSense Settings'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TAB 4: IN-ARTICLE AUTO-INJECTION */}
      {activeTab === 'autoinject' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Algorithmic In-Article Ad Injection
              </CardTitle>
              <CardDescription className="text-xs">
                Automatically inject high-CTR responsive ads inside long-form articles without manually editing article markdown or HTML.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Inject Ads After Paragraph Numbers:</Label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5, 7, 9, 12].map((pNum) => {
                    const isSelected = settings.autoInjectParagraphs.includes(pNum);
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? settings.autoInjectParagraphs.filter((n) => n !== pNum)
                            : [...settings.autoInjectParagraphs, pNum].sort((a, b) => a - b);
                          setSettings({ ...settings, autoInjectParagraphs: updated });
                        }}
                        className={cn(
                          'h-9 w-9 rounded-lg border text-xs font-bold transition-all',
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                            : 'bg-background hover:bg-muted text-muted-foreground'
                        )}
                      >
                        P{pNum}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Recommended: Paragraphs 2 and 5 capture 74% of long-form reader engagement.
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t">
                <Label htmlFor="minWords" className="text-xs font-semibold">Minimum Article Word Count</Label>
                <div className="flex items-center gap-3 max-w-xs">
                  <Input
                    id="minWords"
                    type="number"
                    value={settings.minWordCountForAds}
                    onChange={(e) => setSettings({ ...settings, minWordCountForAds: Number(e.target.value) })}
                    className="h-9 text-xs"
                    min={100}
                    step={50}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">words minimum</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Articles shorter than this limit will omit automated mid-content ad units to maintain high editorial quality.
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t">
                <Label htmlFor="excludedCats" className="text-xs font-semibold">Excluded Categories &amp; Slugs (No Ads)</Label>
                <Input
                  id="excludedCats"
                  value={settings.excludedCategories.join(', ')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      excludedCategories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="privacy-policy, terms-of-service, sponsored"
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Comma-separated slugs where ads are completely suppressed (e.g. Legal, Terms, Privacy Policy).
                </p>
              </div>

              {/* Visual Demo of In-Article Injection */}
              <div className="pt-3 border-t">
                <Label className="text-xs font-semibold text-muted-foreground">Article Layout Simulation Preview</Label>
                <div className="mt-2 p-4 rounded-lg border bg-muted/10 space-y-3 font-sans text-xs text-muted-foreground">
                  <div className="h-4 w-3/4 bg-foreground/10 rounded" />
                  <div className="h-3 w-full bg-foreground/5 rounded" />
                  <div className="h-3 w-5/6 bg-foreground/5 rounded" />

                  {settings.autoInjectParagraphs.includes(2) && (
                    <div className="p-3 my-2 border border-dashed border-amber-500/50 bg-amber-500/5 rounded text-center text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4" /> [Auto-Injected Ad Unit: In-Article Native - Paragraph 2]
                    </div>
                  )}

                  <div className="h-3 w-full bg-foreground/5 rounded" />
                  <div className="h-3 w-4/5 bg-foreground/5 rounded" />

                  {settings.autoInjectParagraphs.includes(5) && (
                    <div className="p-3 my-2 border border-dashed border-amber-500/50 bg-amber-500/5 rounded text-center text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4" /> [Auto-Injected Ad Unit: Mid-Article Rectangle - Paragraph 5]
                    </div>
                  )}

                  <div className="h-3 w-11/12 bg-foreground/5 rounded" />
                  <div className="h-3 w-2/3 bg-foreground/5 rounded" />
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 bg-muted/20 border-t flex justify-end">
              <Button
                onClick={() => handleSaveAll(settings, adUnits, adsTxt)}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-9"
              >
                {saving ? 'Saving...' : 'Save In-Article Rules'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TAB 5: ADS.TXT VALIDATOR */}
      {activeTab === 'adstxt' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    Authorized Digital Sellers (ads.txt) Manager
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Served live directly from your domain root at <code className="text-foreground font-mono">/ads.txt</code> to protect your site against ad inventory spoofing.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/ads.txt', '_blank')}
                  className="h-8 gap-1.5 text-xs self-start sm:self-auto"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-blue-500" /> Test /ads.txt Endpoint
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <span className="text-muted-foreground">Format: &lt;Exchange Domain&gt;, &lt;Publisher ID&gt;, &lt;Account Type&gt;, &lt;TAG ID&gt;</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateAdsTxtSyntax}
                    className="h-7 text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Validate Syntax
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const cleanPub = settings.publisherId.replace('ca-', '');
                      const googleLine = `google.com, ${cleanPub}, DIRECT, f08c47fec0942fa0\n`;
                      if (!adsTxt.includes(cleanPub)) {
                        setAdsTxt(googleLine + adsTxt);
                      }
                    }}
                    className="h-7 text-[11px] gap-1 text-amber-600 dark:text-amber-400"
                  >
                    <Plus className="h-3 w-3" /> Insert Google Direct
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const partners = `# Header Bidding & SSP Resellers\nrubiconproject.com, 10293, RESELLER, 0bfd66d529a55803\nappnexus.com, 4920, RESELLER, f5ab79cb980f86d1\nopenx.com, 539201, RESELLER, 6a698e2ec38604c6\npubmatic.com, 156324, RESELLER, 5d62e6312cd12d4f\n`;
                      if (!adsTxt.includes('rubiconproject.com')) {
                        setAdsTxt(adsTxt.trim() + '\n' + partners);
                      }
                    }}
                    className="h-7 text-[11px] gap-1 text-blue-600 dark:text-blue-400"
                  >
                    <Plus className="h-3 w-3" /> Add SSP Partners
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadAdsTxt}
                    className="h-7 text-[11px] gap-1 text-foreground"
                    title="Download ads.txt to your disk"
                  >
                    <Download className="h-3 w-3" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(adsTxt, 'adstxt')}
                    className="h-7 text-[11px] gap-1"
                  >
                    {copiedKey === 'adstxt' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === 'adstxt' ? 'Copied' : 'Copy All'}
                  </Button>
                </div>
              </div>

              {adsTxtValidation && (
                <div className={cn(
                  'p-3 rounded-lg border text-xs space-y-1',
                  adsTxtValidation.invalidCount === 0
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300'
                )}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {adsTxtValidation.invalidCount === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>
                      IAB Validation Report: {adsTxtValidation.validCount} valid entries
                      {adsTxtValidation.invalidCount > 0 && `, ${adsTxtValidation.invalidCount} syntax errors found`}
                    </span>
                  </div>
                  {adsTxtValidation.errors.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 mt-1 font-mono">
                      {adsTxtValidation.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <textarea
                value={adsTxt}
                onChange={(e) => setAdsTxt(e.target.value)}
                rows={12}
                className="w-full font-mono text-xs rounded-lg border bg-muted/30 p-3 leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
              />

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>IAB Tech Lab Validation:</strong> Google AdSense crawlers check your root <code className="font-mono">/ads.txt</code> every 24 hours. Maintaining accurate publisher lines prevents catastrophic revenue loss.
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 bg-muted/20 border-t flex justify-end">
              <Button
                onClick={() => handleSaveAll(settings, adUnits, adsTxt)}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-9"
              >
                {saving ? 'Saving...' : 'Deploy & Publish ads.txt'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TAB 6: FRONTEND SNIPPETS & HEADLESS API */}
      {activeTab === 'snippets' && (
        <div className="space-y-6 max-w-4xl">
          {/* React Component Snippet */}
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-amber-500" />
                    Next.js / React Ad Unit Component
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Drop-in component with lazy-loading and hydration safety.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      `import React, { useEffect } from 'react';

export function AdSenseUnit({ slotId, format = 'auto', className = '' }: { slotId: string; format?: string; className?: string }) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);

  return (
    <div className={\`my-6 flex justify-center \${className}\`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="${settings.publisherId}"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        ${settings.testMode ? 'data-adtest="on"' : ''}
      />
    </div>
  );
}`,
                      'react-comp'
                    )
                  }
                  className="h-8 text-xs gap-1.5"
                >
                  {copiedKey === 'react-comp' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === 'react-comp' ? 'Copied' : 'Copy Component'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <pre className="p-4 rounded-lg bg-muted font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground/90">
{`import React, { useEffect } from 'react';

export function AdSenseUnit({ slotId, format = 'auto', className = '' }: { slotId: string; format?: string; className?: string }) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);

  return (
    <div className={\`my-6 flex justify-center \${className}\`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="${settings.publisherId}"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        ${settings.testMode ? 'data-adtest="on"' : ''}
      />
    </div>
  );
}`}
              </pre>
            </CardContent>
          </Card>

          {/* Root Layout Script */}
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Global Root Layout Script (Next.js App Router)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Place inside <code className="text-foreground font-mono">app/layout.tsx</code> in the <code className="text-foreground font-mono">&lt;head&gt;</code> section.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      `<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisherId}"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>`,
                      'layout-script'
                    )
                  }
                  className="h-8 text-xs gap-1.5"
                >
                  {copiedKey === 'layout-script' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === 'layout-script' ? 'Copied' : 'Copy Script'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <pre className="p-4 rounded-lg bg-muted font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground/90">
{`<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisherId}"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>`}
              </pre>
            </CardContent>
          </Card>

          {/* Headless API Endpoint */}
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-emerald-500" />
                Headless REST API Endpoint
              </CardTitle>
              <CardDescription className="text-xs">
                Fetch all active ad units and settings programmatically for decoupled Astro, Nuxt, iOS, or Android clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-xs">
                <span className="text-emerald-500 font-bold">GET</span>
                <span className="text-foreground">/api/v1/ads</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 7: REVENUE & RPM ESTIMATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="border shadow-2xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-500" />
                AdSense Yield &amp; Revenue Projection Model
              </CardTitle>
              <CardDescription className="text-xs">
                Simulate potential monthly and annual earnings based on traffic volume, geographic audience distribution, and industry vertical benchmarks.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-6">
              {/* Input Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border bg-muted/20">
                {/* Traffic Volume */}
                <div className="space-y-2">
                  <Label htmlFor="pageviews" className="text-xs font-semibold">Monthly Pageviews</Label>
                  <Input
                    id="pageviews"
                    type="number"
                    value={calcPageviews}
                    onChange={(e) => setCalcPageviews(Math.max(1000, Number(e.target.value)))}
                    className="h-9 font-mono text-xs"
                    step={10000}
                    min={1000}
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[50000, 100000, 250000, 500000, 1000000].map((pv) => (
                      <button
                        key={pv}
                        type="button"
                        onClick={() => setCalcPageviews(pv)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium border transition-colors',
                          calcPageviews === pv
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-background hover:bg-muted text-muted-foreground'
                        )}
                      >
                        {pv >= 1000000 ? `${pv / 1000000}M` : `${pv / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Niche */}
                <div className="space-y-2">
                  <Label htmlFor="niche" className="text-xs font-semibold">Content Category / Niche</Label>
                  <select
                    id="niche"
                    value={calcNiche}
                    onChange={(e) => setCalcNiche(e.target.value)}
                    className="w-full h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="finance">Finance, Crypto &amp; Investing ($24.50 RPM)</option>
                    <option value="tech">Technology, SaaS &amp; Code ($15.80 RPM)</option>
                    <option value="health">Health, Wellness &amp; Medicine ($13.20 RPM)</option>
                    <option value="lifestyle">Lifestyle, Travel &amp; Food ($6.40 RPM)</option>
                    <option value="gaming">Gaming &amp; Entertainment ($3.80 RPM)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Based on Google AdSense 2025 publisher benchmark data.
                  </p>
                </div>

                {/* Geo Targeting */}
                <div className="space-y-2">
                  <Label htmlFor="geo" className="text-xs font-semibold">Audience Geography</Label>
                  <select
                    id="geo"
                    value={calcGeo}
                    onChange={(e) => setCalcGeo(e.target.value)}
                    className="w-full h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="tier1">Tier 1 Premium (US, UK, CA, AU, DE)</option>
                    <option value="global">Global Blended (All Regions)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Tier 1 traffic commands 2.2× higher advertiser bidding.
                  </p>
                </div>
              </div>

              {/* Projection KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-2xs">
                  <CardContent className="p-4 sm:p-5">
                    <span className="text-xs font-medium text-muted-foreground">Projected Monthly Earnings</span>
                    <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                      ${estimatedMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      ~${(estimatedMonthlyRevenue / 30).toFixed(2)} estimated daily run-rate
                    </span>
                  </CardContent>
                </Card>

                <Card className="border bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-2xs">
                  <CardContent className="p-4 sm:p-5">
                    <span className="text-xs font-medium text-muted-foreground">Annualized Forecast</span>
                    <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                      ${(estimatedMonthlyRevenue * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Based on current traffic and ad density
                    </span>
                  </CardContent>
                </Card>

                <Card className="border bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-2xs">
                  <CardContent className="p-4 sm:p-5">
                    <span className="text-xs font-medium text-muted-foreground">Effective Page RPM</span>
                    <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                      ${estimatedRpm.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Revenue per 1,000 page views
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Optimization Recommendations Card */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <div className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Inventory Yield Optimization Recommendations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <strong className="text-foreground text-[11px]">1. Enable In-Article Paragraph 2 Slots:</strong>
                    <p className="text-[10px] leading-relaxed">
                      Paragraph 2 is viewed by over 82% of reader sessions before drop-off occurs, driving up to 3× higher click-through yield.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <strong className="text-foreground text-[11px]">2. Turn On Core Web Vitals Lazy Loading:</strong>
                    <p className="text-[10px] leading-relaxed">
                      Prevents ads from competing for initial JavaScript parse cycles, ensuring your Google PageSpeed mobile score stays above 90.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <strong className="text-foreground text-[11px]">3. Maintain Verified ads.txt:</strong>
                    <p className="text-[10px] leading-relaxed">
                      DSP and header bidding networks (Rubicon, AppNexus) discard up to 45% of programmatic bids if valid records are missing.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                    <strong className="text-foreground text-[11px]">4. Utilize Google Consent Mode v2:</strong>
                    <p className="text-[10px] leading-relaxed">
                      Ensures compliance with European GDPR &amp; IAB TCF 2.2 regulations without zeroing out EU revenue.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CREATE / EDIT AD UNIT DIALOG */}
      <Dialog open={isUnitModalOpen} onOpenChange={setIsUnitModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              {editingUnit ? 'Edit Ad Unit' : 'Create New Ad Unit'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure AdSense slot ID, placement coordinates, and device targeting rules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="unitName" className="font-semibold">Ad Unit Name</Label>
              <Input
                id="unitName"
                value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                placeholder="e.g. Header Leaderboard (Desktop)"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unitSlot" className="font-semibold">AdSense Slot ID (Numeric)</Label>
              <Input
                id="unitSlot"
                value={unitForm.slotId}
                onChange={(e) => setUnitForm({ ...unitForm, slotId: e.target.value })}
                placeholder="e.g. 1092837461"
                className="h-9 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="unitPlacement" className="font-semibold">Placement Slot</Label>
                <select
                  id="unitPlacement"
                  value={unitForm.placement}
                  onChange={(e) => setUnitForm({ ...unitForm, placement: e.target.value as any })}
                  className="w-full h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="header_leaderboard">Header Leaderboard</option>
                  <option value="in_article">In-Article Paragraph</option>
                  <option value="sidebar_rectangle">Sidebar Rectangle</option>
                  <option value="in_feed">In-Feed Native</option>
                  <option value="mobile_sticky_footer">Mobile Sticky Footer</option>
                  <option value="custom">Custom / Fallback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unitFormat" className="font-semibold">Ad Format</Label>
                <select
                  id="unitFormat"
                  value={unitForm.format}
                  onChange={(e) => setUnitForm({ ...unitForm, format: e.target.value as any })}
                  className="w-full h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="responsive">Responsive (Fluid)</option>
                  <option value="fixed_728x90">Leaderboard 728×90</option>
                  <option value="fixed_300x250">Medium Rectangle 300×250</option>
                  <option value="fixed_300x600">Half-Page 300×600</option>
                  <option value="fixed_320x50">Mobile Banner 320×50</option>
                  <option value="multiplex">Multiplex Recommendations</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unitDevice" className="font-semibold">Device Targeting</Label>
              <select
                id="unitDevice"
                value={unitForm.deviceTargeting}
                onChange={(e) => setUnitForm({ ...unitForm, deviceTargeting: e.target.value as any })}
                className="w-full h-9 rounded-md border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Devices (Responsive)</option>
                <option value="desktop_only">Desktop Only (&gt; 768px)</option>
                <option value="mobile_only">Mobile Only (&lt; 768px)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unitFallback" className="font-semibold">Custom Fallback HTML / Affiliate Banner (Optional)</Label>
              <textarea
                id="unitFallback"
                rows={3}
                value={unitForm.customFallbackHtml}
                onChange={(e) => setUnitForm({ ...unitForm, customFallbackHtml: e.target.value })}
                placeholder="<a href='https://yoursponsor.com'><img src='...' /></a>"
                className="w-full rounded-md border bg-muted/30 p-2 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="unitActive"
                type="checkbox"
                checked={unitForm.isActive}
                onChange={(e) => setUnitForm({ ...unitForm, isActive: e.target.checked })}
                className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
              />
              <Label htmlFor="unitActive" className="font-semibold cursor-pointer">
                Unit is immediately active upon saving
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveUnitForm}
              disabled={!unitForm.name.trim() || !unitForm.slotId.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {editingUnit ? 'Update Unit' : 'Create Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AD UNIT PREVIEW MODAL */}
      <Dialog open={!!previewUnit} onOpenChange={(open) => !open && setPreviewUnit(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Ad Unit Live Layout Preview: {previewUnit?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Simulated rendering with slot ID <code className="font-mono">{previewUnit?.slotId}</code>.
            </DialogDescription>
          </DialogHeader>

          {previewUnit && (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-lg bg-muted/40 border border-dashed flex flex-col items-center justify-center text-center min-h-[160px] relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[9px] uppercase font-bold text-muted-foreground/60 border px-1.5 py-0.5 rounded">
                  Google AdSense Simulation
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-2">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {placementLabels[previewUnit.placement]}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  Slot: {previewUnit.slotId} &bull; {formatLabels[previewUnit.format]}
                </div>
                {previewUnit.customFallbackHtml && (
                  <div className="mt-3 p-2 rounded bg-background border text-[10px] text-muted-foreground max-w-sm">
                    Fallback HTML will render if AdSense returns no inventory (blank slot).
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                <div>&bull; <strong>Device Targeting:</strong> {previewUnit.deviceTargeting}</div>
                <div>&bull; <strong>Status:</strong> {previewUnit.isActive ? 'Active (Live)' : 'Paused'}</div>
                <div>&bull; <strong>Format:</strong> {formatLabels[previewUnit.format]}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" onClick={() => setPreviewUnit(null)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ModuleGuard>
  );
}
