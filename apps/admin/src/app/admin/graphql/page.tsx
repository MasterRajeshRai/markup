'use client';

import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Database,
  Layers,
  FileText,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ModuleGuard } from '@/components/module-guard';

const PRESET_QUERIES = [
  {
    name: 'Fetch Published Articles with SEO',
    query: `query GetArticles {
  entries(type: "articles", limit: 5) {
    id
    title
    slug
    status
    publishedAt
    seoScore
    summary
  }
}`,
  },
  {
    name: 'Single Entry Details',
    query: `query GetEntryBySlug {
  entry(slug: "getting-started-with-headless-architecture") {
    id
    title
    slug
    status
    publishedAt
    data
    seoScore
  }
}`,
  },
  {
    name: 'Media DAM Assets',
    query: `query GetMediaAssets {
  media(limit: 5) {
    id
    filename
    publicUrl
    mimeType
    size
    width
    height
  }
}`,
  },
  {
    name: 'System Health & Engine Specs',
    query: `query GetSystemDiagnostics {
  systemHealth {
    status
    database
    storageDriver
    version
    uptimeSeconds
  }
  contentTypes {
    name
    slug
    isPublishable
  }
}`,
  },
];

export default function GraphQLExplorerPage() {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [result, setResult] = useState<string>('// Click "Run Query" to execute GraphQL request against live endpoint.');
  const [loading, setLoading] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      setExecutionTimeMs(Math.round(performance.now() - start));
    } catch (e: any) {
      setResult(JSON.stringify({ error: e.message || 'Execution error' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModuleGuard moduleId="graphql">
      <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Code2 className="h-6 w-6 text-pink-500" />
              <span>GraphQL API &amp; Schema Explorer</span>
            </h1>
            <Badge variant="outline" className="text-[11px] font-mono border-pink-500/40 text-pink-500">
              /api/graphql
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Declarative data fetching for Next.js, Remix, mobile apps, and Gatsby frontends with zero over-fetching.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a href="/api/graphql" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 cursor-pointer">
              <span>Open GraphiQL IDE</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>

          <Button
            size="sm"
            onClick={handleExecute}
            disabled={loading}
            className="gap-1.5 h-8 text-xs bg-pink-600 hover:bg-pink-700 text-white font-semibold cursor-pointer shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{loading ? 'Executing...' : 'Run Query'}</span>
          </Button>
        </div>
      </div>

      {/* ── Presets Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground font-semibold shrink-0">Sample Queries:</span>
        {PRESET_QUERIES.map((preset) => (
          <Button
            key={preset.name}
            size="sm"
            variant="ghost"
            onClick={() => setQuery(preset.query)}
            className={cn(
              'h-7 text-xs px-2.5 rounded-lg border bg-card hover:border-pink-500/40 whitespace-nowrap cursor-pointer',
              query === preset.query && 'border-pink-500/50 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-semibold'
            )}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* ── Two-Pane Editor & Results Layout ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[520px]">
        {/* Left Pane: GraphQL Query Input */}
        <Card className="flex flex-col overflow-hidden border">
          <CardHeader className="p-3 border-b bg-muted/40 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground">GraphQL Query</span>
              <Badge variant="secondary" className="text-[10px] font-mono">POST</Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setQuery(PRESET_QUERIES[0].query)}
              className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          </CardHeader>
          <div className="flex-1 bg-neutral-950 p-4 font-mono text-xs text-neutral-100 flex flex-col">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 bg-transparent resize-none focus:outline-none leading-relaxed text-pink-300 font-mono"
            />
          </div>
        </Card>

        {/* Right Pane: JSON Execution Result */}
        <Card className="flex flex-col overflow-hidden border">
          <CardHeader className="p-3 border-b bg-muted/40 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground">Response Payload</span>
              {executionTimeMs !== null && (
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  {executionTimeMs} ms
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyResult}
              className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
              title="Copy JSON Response"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </CardHeader>
          <div className="flex-1 bg-neutral-950 p-4 font-mono text-xs overflow-auto">
            <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
              <code>{result}</code>
            </pre>
          </div>
        </Card>
      </div>
    </div>
    </ModuleGuard>
  );
}
