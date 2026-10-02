'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Database,
  HardDrive,
  Cpu,
  Layers,
  RefreshCw,
  Play,
  CheckCircle2,
  Trash2,
  Server,
  Zap,
} from 'lucide-react';

export default function SystemPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/system/diagnostics');
      const data = await res.json();
      if (res.ok) {
        setDiagnostics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleCleanupTemp = async () => {
    setCleaning(true);
    try {
      const res = await fetch('/api/v1/media/cleanup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Temporary cleanup finished! Cleaned: ${data.result?.purgedCount || 0} orphaned files.`);
        fetchDiagnostics();
      }
    } finally {
      setCleaning(false);
    }
  };

  const handleRunScheduler = async () => {
    try {
      const res = await fetch('/api/v1/system/scheduler/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Background scheduler completed! Published: ${data.result?.publishedCount || 0}, Archived: ${data.result?.unpublishedCount || 0}.`);
        fetchDiagnostics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">System & Observability</h1>
            <Badge variant="outline" className="text-xs font-mono border-emerald-500/40 text-emerald-500">
              Operational Health
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time telemetry, database connections, R2 storage driver status, memory allocation, and worker jobs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDiagnostics}
            disabled={loading}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{actionMessage}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setActionMessage(null)} className="h-6 px-2 text-[10px]">
            Dismiss
          </Button>
        </div>
      )}

      {/* Primary Status Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Database Engine</span>
              <h3 className="text-lg font-bold text-foreground">PostgreSQL 18</h3>
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected ({diagnostics?.database?.latencyMs || 0}ms latency)</span>
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Storage Engine</span>
              <h3 className="text-lg font-bold text-foreground">Cloudflare R2</h3>
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Zero-Retention Guard Active</span>
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Node.js Runtime</span>
              <h3 className="text-lg font-bold text-foreground">{diagnostics?.runtime?.nodeVersion || 'Node.js'}</h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Uptime: {Math.floor((diagnostics?.runtime?.uptimeSeconds || 0) / 60)} min • {diagnostics?.runtime?.cpus || 1} CPU Core(s)
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Technical Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory & Heap Allocation */}
        <Card>
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Process Memory Allocation</span>
            </CardTitle>
            <CardDescription className="text-xs">Active V8 engine heap and resident memory</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Heap Used / Heap Total</span>
                <span className="font-mono text-foreground">
                  {diagnostics?.runtime?.memoryMb?.heapUsed || 0} MB / {diagnostics?.runtime?.memoryMb?.heapTotal || 0} MB
                </span>
              </div>
              <Progress
                value={
                  diagnostics?.runtime?.memoryMb?.heapTotal
                    ? (diagnostics.runtime.memoryMb.heapUsed / diagnostics.runtime.memoryMb.heapTotal) * 100
                    : 0
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">RSS</div>
                <div className="text-sm font-bold font-mono mt-0.5">{diagnostics?.runtime?.memoryMb?.rss || 0} MB</div>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Heap Used</div>
                <div className="text-sm font-bold font-mono mt-0.5">{diagnostics?.runtime?.memoryMb?.heapUsed || 0} MB</div>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/20">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Platform</div>
                <div className="text-xs font-bold font-mono mt-1 truncate">{diagnostics?.runtime?.platform || 'Node'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Table Entities Count */}
        <Card>
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span>Database Volume & Entities</span>
            </CardTitle>
            <CardDescription className="text-xs">Record counts across core schema models</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-muted">
                <span className="text-muted-foreground">Content Entries</span>
                <span className="font-bold font-mono text-foreground">{diagnostics?.database?.tables?.contentEntries ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-muted">
                <span className="text-muted-foreground">Media Assets</span>
                <span className="font-bold font-mono text-foreground">{diagnostics?.database?.tables?.mediaAssets ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-muted">
                <span className="text-muted-foreground">WebP Crop Variants</span>
                <span className="font-bold font-mono text-foreground text-primary">{diagnostics?.database?.tables?.mediaVariants ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-muted">
                <span className="text-muted-foreground">System Users</span>
                <span className="font-bold font-mono text-foreground">{diagnostics?.database?.tables?.users ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Media Processing Jobs</span>
                <span className="font-bold font-mono text-foreground">{diagnostics?.database?.tables?.processingJobs ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Actions Card */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Administrative Maintenance Actions</span>
          </CardTitle>
          <CardDescription className="text-xs">Execute background workers, garbage collection, and queue maintenance</CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCleanupTemp}
            disabled={cleaning}
            className="text-xs gap-1.5 h-8"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{cleaning ? 'Purging...' : 'Purge Orphaned Temp Files'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunScheduler}
            className="text-xs gap-1.5 h-8"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Trigger Content Scheduler</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
