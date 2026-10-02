'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useModules } from '@/components/modules-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Puzzle,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Power,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  DollarSign,
  Image as ImageIcon,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  GitBranch,
  Code2,
  Webhook,
  Key,
  BarChart3,
  Download,
  Globe,
  Settings,
  Cpu,
  Tags,
  Menu,
  Send,
  History,
  Boxes,
} from 'lucide-react';
import type { CmsModule, ModuleCategory } from '@/lib/modules-service';

// Icon mapping helper
const ICON_MAP: Record<string, React.ElementType> = {
  DollarSign,
  Search,
  RotateCcw,
  FileSpreadsheet,
  MessageSquare,
  Calendar,
  Image: ImageIcon,
  GitBranch,
  Send,
  History,
  Tags,
  Menu,
  Cpu,
  Code2,
  Webhook,
  Key,
  BarChart3,
  Puzzle,
  Download,
  Globe,
  Layers,
  Users: Shield,
  Settings,
  Boxes,
};

const CATEGORY_COLORS: Record<ModuleCategory, { bg: string; text: string; border: string }> = {
  marketing: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  content: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
  developer: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/30' },
  media: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  community: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/30' },
  security: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  system: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30' },
};

export default function ModulesManagerPage() {
  const { modules, isModuleEnabled, toggleModule, bulkUpdateModules, counts, loading, refreshModules } = useModules();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Filter modules
  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesSearch =
        !search.trim() ||
        mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase()) ||
        mod.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        mod.routes.some((r) => r.toLowerCase().includes(search.toLowerCase()));

      let matchesFilter = true;
      if (selectedCategory === 'active') {
        matchesFilter = mod.enabled;
      } else if (selectedCategory === 'inactive') {
        matchesFilter = !mod.enabled;
      } else if (selectedCategory === 'core') {
        matchesFilter = Boolean(mod.isCore);
      } else if (selectedCategory !== 'all') {
        matchesFilter = mod.category === selectedCategory;
      }

      return matchesSearch && matchesFilter;
    });
  }, [modules, search, selectedCategory]);

  const handleToggle = async (module: CmsModule) => {
    if (module.isCore) return;
    setTogglingId(module.id);
    try {
      await toggleModule(module.id);
    } finally {
      setTogglingId(null);
    }
  };

  const handleActivateAll = async () => {
    if (!confirm('Activate all optional modules across your site?')) return;
    setBulkProcessing(true);
    const updates: Record<string, boolean> = {};
    for (const m of modules) {
      if (!m.isCore) updates[m.id] = true;
    }
    await bulkUpdateModules(updates);
    setBulkProcessing(false);
  };

  const handleDeactivateAll = async () => {
    if (!confirm('Deactivate all optional modules? Core foundation features will remain intact.')) return;
    setBulkProcessing(true);
    const updates: Record<string, boolean> = {};
    for (const m of modules) {
      if (!m.isCore) updates[m.id] = false;
    }
    await bulkUpdateModules(updates);
    setBulkProcessing(false);
  };

  const handleResetRecommended = async () => {
    if (!confirm('Reset module activations to system recommended defaults?')) return;
    setBulkProcessing(true);
    const defaults: Record<string, boolean> = {
      adsense: true,
      seo: true,
      forms: true,
      comments: true,
      calendar: true,
      media: true,
      workflows: true,
      redirects: true,
      graphql: true,
      webhooks: true,
      api_keys: true,
      audit_logs: true,
      integrations: true,
      import_export: true,
      ai_assistant: true,
      multisite: true,
      publishing_queue: true,
      revisions: true,
      taxonomies: true,
      navigation: true,
    };
    await bulkUpdateModules(defaults);
    setBulkProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Modules & Plugins Manager</h1>
            <Badge variant="outline" className="border-primary/40 text-primary text-[11px] font-mono">
              Modular Architecture
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Enable or deactivate platform modules on-demand just like WordPress plugins. Deactivated modules hide administrative routes and release resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshModules}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Status</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Total Modules</span>
            <div className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{counts.total}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Puzzle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Active Plugins</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{counts.active}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Deactivated</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{counts.inactive}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Core Foundation</span>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{counts.core}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Shield className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter & Toolbar */}
      <Card className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search plugins by name, keyword, or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs font-medium"
            />
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleActivateAll}
              disabled={bulkProcessing}
              className="h-8 text-xs gap-1"
            >
              <Power className="h-3.5 w-3.5 text-emerald-500" />
              <span>Activate All</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeactivateAll}
              disabled={bulkProcessing}
              className="h-8 text-xs gap-1"
            >
              <Power className="h-3.5 w-3.5 text-amber-500" />
              <span>Deactivate All</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetRecommended}
              disabled={bulkProcessing}
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Defaults</span>
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t text-xs">
          {[
            { id: 'all', label: `All (${counts.total})` },
            { id: 'active', label: `Active (${counts.active})` },
            { id: 'inactive', label: `Inactive (${counts.inactive})` },
            { id: 'marketing', label: 'Marketing & Revenue' },
            { id: 'content', label: 'Content Operations' },
            { id: 'developer', label: 'Developer & APIs' },
            { id: 'media', label: 'Media & DAM' },
            { id: 'community', label: 'Community' },
            { id: 'security', label: 'Security & Access' },
            { id: 'system', label: 'System' },
          ].map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'secondary'}
              onClick={() => setSelectedCategory(cat.id)}
              className="h-7 px-2.5 text-xs font-medium"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredModules.map((mod) => {
          const IconComponent = ICON_MAP[mod.icon] || Puzzle;
          const colors = CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.system;
          const isToggling = togglingId === mod.id;

          return (
            <Card
              key={mod.id}
              className={`flex flex-col justify-between transition-all border ${
                mod.enabled
                  ? 'border-border/80 bg-card hover:border-primary/40 shadow-xs'
                  : 'border-border/40 bg-muted/20 opacity-75 hover:opacity-100'
              }`}
            >
              <CardHeader className="p-4 pb-3 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 border ${colors.border}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CardTitle className="text-sm font-bold text-foreground truncate">
                          {mod.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4">
                          v{mod.version}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {mod.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    {mod.isCore ? (
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        Core
                      </Badge>
                    ) : (
                      <Switch
                        checked={mod.enabled}
                        disabled={isToggling || bulkProcessing}
                        onCheckedChange={() => handleToggle(mod)}
                        aria-label={`Toggle ${mod.name}`}
                      />
                    )}
                  </div>
                </div>

                <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                  {mod.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-2.5">
                {/* Associated Routes */}
                {mod.routes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-muted-foreground/80 font-mono">Routes:</span>
                    {mod.routes.map((r) => (
                      <Badge
                        key={r}
                        variant="outline"
                        className="text-[10px] font-mono px-1.5 py-0 bg-background/50"
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">
                  Status:{' '}
                  <strong className={mod.enabled ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}>
                    {mod.enabled ? 'Active' : 'Deactivated'}
                  </strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {mod.enabled && mod.settingsPath ? (
                    <Link href={mod.settingsPath}>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-primary">
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Puzzle className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-foreground text-sm">No modules found</p>
          <p className="text-xs mt-0.5">Try clearing your search query or choosing another category filter.</p>
        </Card>
      )}
    </div>
  );
}
