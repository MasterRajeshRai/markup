'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSite } from './site-context';
import { Globe, ExternalLink, ChevronDown, Check, Newspaper, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SiteSwitcher() {
  const { currentSite, sites, switchSite } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs',
          currentSite.slug === 'mediabird'
            ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/15'
            : 'border-border/80 bg-background/80 hover:bg-muted text-foreground'
        )}
        title="Switch Active Site Context"
      >
        {currentSite.slug === 'mediabird' ? (
          <Newspaper className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
        ) : (
          <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        )}
        <span className="font-bold truncate max-w-[120px] sm:max-w-[160px]">
          {currentSite.name}
        </span>
        <span className="hidden xl:inline-block px-1.5 py-0.2 rounded text-[10px] bg-background/60 border font-mono">
          {currentSite.slug}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform text-muted-foreground', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 rounded-xl border bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b mb-1">
            Managed Client Sites
          </div>
          <div className="space-y-1">
            {sites.map((site) => {
              const isSelected = site.slug === currentSite.slug;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => {
                    switchSite(site.slug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer text-xs',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {site.slug === 'mediabird' ? (
                      <Newspaper className={cn('h-4 w-4', isSelected ? 'text-red-600' : 'text-muted-foreground')} />
                    ) : (
                      <Globe className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[13px] truncate">{site.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    {site.tagline && (
                      <p className="text-[11px] text-muted-foreground truncate">{site.tagline}</p>
                    )}
                    <span className="inline-block mt-0.5 text-[10px] font-mono text-muted-foreground/80">
                      {site.frontendUrl}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 mt-1 border-t px-1">
            <a
              href={currentSite.frontendUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Open {currentSite.name} in Browser</span>
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
