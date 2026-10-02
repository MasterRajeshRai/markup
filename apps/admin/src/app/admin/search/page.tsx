'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Image as ImageIcon, Tags, Users, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'content' | 'media' | 'taxonomy' | 'user';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: any;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const executeSearch = (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/v1/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.results) setResults(data.results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (initialQuery) executeSearch(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'media':
        return <ImageIcon className="h-4 w-4 text-purple-500" />;
      case 'taxonomy':
        return <Tags className="h-4 w-4 text-emerald-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-amber-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Unified Search</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Deep search indexing across content models, digital assets, taxonomy categories, and users.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all entities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10 text-sm"
            autoFocus
          />
        </form>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Found {results.length} matched results for "{query}"</span>
          {loading && <span>Indexing & querying...</span>}
        </div>

        {results.length === 0 && !loading && query && (
          <Card className="p-12 text-center text-xs text-muted-foreground">
            No results found matching your search.
          </Card>
        )}

        <div className="space-y-2">
          {results.map((r) => (
            <Link key={`${r.type}_${r.id}`} href={r.url} className="block">
              <Card className="p-3.5 hover:border-primary/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted/40 flex items-center justify-center">
                    {getTypeIcon(r.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{r.title}</span>
                      <Badge variant="outline" className="font-mono text-[9px] uppercase">
                        {r.type}
                      </Badge>
                    </div>
                    {r.subtitle && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{r.subtitle}</p>
                    )}
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
