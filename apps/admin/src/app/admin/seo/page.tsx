'use client';

import React from 'react';
import { SEOAnalyzerWithEditor } from '@/components/seo-analyzer';
import { Sparkles, Zap } from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

export default function SEOPage() {
  return (
    <ModuleGuard moduleId="seo">
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span>Rank Markup SEO Analyzer</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> 5 Keywords
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enterprise multi-keyword SEO &amp; readability scoring — optimize up to 5 focus keywords, pillar content, mobile SERP, and rich snippets.
            </p>
          </div>
        </div>

        {/* Analyzer */}
        <div className="flex-1 min-h-0">
          <SEOAnalyzerWithEditor />
        </div>
      </div>
    </ModuleGuard>
  );
}
