'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  FileText,
  FileCode,
  Image as ImageIcon,
  Boxes,
  Tags,
  Users,
  Key,
  Webhook,
  Globe,
  Settings,
  Activity,
  History,
  GitMerge,
  Sparkles,
  Plug,
  ArrowDownUp,
  Compass,
  Menu as MenuIcon,
  CalendarClock,
  ArrowRight,
  Command,
  X,
  CornerDownLeft,
  LayoutDashboard,
  DollarSign,
  FileSpreadsheet,
  MessageSquare,
  Calendar,
  Radio,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import { useModules } from '@/components/modules-context';

interface SearchModalContextType {
  isOpen: boolean;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
}

const SearchModalContext = createContext<SearchModalContextType>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export const useSearchModal = () => useContext(SearchModalContext);

// Pre-indexed quick actions for platform modules
const SYSTEM_MODULES = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: 'Overview', desc: 'Real-time telemetry, queue, and metrics', moduleId: 'system_settings' },
  { title: 'Modules & Plugins', href: '/admin/modules', icon: Boxes, module: 'System', desc: 'Manage, enable, and disable CMS modular capabilities', moduleId: 'system_settings' },
  { title: 'Content Entries', href: '/admin/content', icon: FileText, module: 'Content', desc: 'Manage articles, products, and dynamic entries', moduleId: 'content_core' },
  { title: 'Pages', href: '/admin/pages', icon: FileCode, module: 'Content', desc: 'Landing and marketing pages with Visual Block Editor', moduleId: 'content_core' },
  { title: 'Hero Sliders & Carousels', href: '/admin/sliders', icon: SlidersHorizontal, module: 'Content', desc: 'Hero banners, promo carousels, and frontend slider code generators', moduleId: 'hero_slider' },
  { title: 'Content Types', href: '/admin/content-types', icon: Boxes, module: 'Content', desc: 'Schema modeling and custom field builder', moduleId: 'content_core' },
  { title: 'Media Library', href: '/admin/media', icon: ImageIcon, module: 'Media', desc: 'Digital Asset Management and auto-crop pipeline', moduleId: 'media' },
  { title: 'Forms & Leads', href: '/admin/forms', icon: FileSpreadsheet, module: 'Content', desc: 'Drag-and-drop form builder, submissions, and inbox', moduleId: 'forms' },
  { title: 'Editorial Calendar', href: '/admin/calendar', icon: Calendar, module: 'Publishing', desc: 'Release scheduling, drag-and-drop editorial calendar', moduleId: 'calendar' },
  { title: 'Publishing Queue', href: '/admin/publishing', icon: CalendarClock, module: 'Publishing', desc: 'Scheduled releases and calendar timeline', moduleId: 'publishing_queue' },
  { title: 'Content Revisions', href: '/admin/revisions', icon: History, module: 'Publishing', desc: 'Immutable version history and JSON diff comparison', moduleId: 'revisions' },
  { title: 'Editorial Workflows', href: '/admin/workflows', icon: GitMerge, module: 'Publishing', desc: 'Approval pipelines and transition rules', moduleId: 'workflows' },
  { title: 'Comments & Discussions', href: '/admin/comments', icon: MessageSquare, module: 'Community', desc: 'Threaded discussions and automated moderation queue', moduleId: 'comments' },
  { title: 'Newsletter & Subscribers', href: '/admin/newsletter', icon: Mail, module: 'Audience', desc: 'Audience lists, campaigns, and opt-in capture', moduleId: 'newsletter' },
  { title: 'Transactional Email', href: '/admin/emails', icon: Mail, module: 'Developer', desc: 'Resend API gateway, templates, and outbound delivery stream', moduleId: 'email' },
  { title: 'AdSense & Monetization', href: '/admin/ads', icon: DollarSign, module: 'Marketing', desc: 'Google AdSense, header bidding, revenue, and ads.txt validator', moduleId: 'adsense' },
  { title: 'SEO & Metadata', href: '/admin/seo', icon: Sparkles, module: 'SEO', desc: 'Open Graph, JSON-LD schema, and sitemaps', moduleId: 'seo' },
  { title: 'Taxonomies', href: '/admin/taxonomies', icon: Tags, module: 'Taxonomies', desc: 'Hierarchical categories and multi-tags', moduleId: 'taxonomies' },
  { title: 'Navigation Menus', href: '/admin/navigation', icon: MenuIcon, module: 'Navigation', desc: 'Multi-level nested header and footer menus', moduleId: 'navigation' },
  { title: 'Redirects', href: '/admin/redirects', icon: Compass, module: 'SEO', desc: '301/302 URL rules with loop detection', moduleId: 'redirects' },
  { title: 'GraphQL Playground', href: '/admin/graphql', icon: Radio, module: 'Developer', desc: 'Interactive GraphQL IDE, schema explorer, and query execution', moduleId: 'graphql' },
  { title: 'Users', href: '/admin/users', icon: Users, module: 'Security', desc: 'User directory, credentials, and lockout status', moduleId: 'users_roles' },
  { title: 'Roles & Permissions', href: '/admin/roles', icon: Users, module: 'Security', desc: 'Granular RBAC matrix and access control', moduleId: 'users_roles' },
  { title: 'API & Tokens', href: '/admin/api-keys', icon: Key, module: 'Security', desc: 'Delivery and management API credentials', moduleId: 'api_keys' },
  { title: 'Webhooks', href: '/admin/webhooks', icon: Webhook, module: 'Security', desc: 'Event subscriptions with HMAC signatures', moduleId: 'webhooks' },
  { title: 'Sites & Domains', href: '/admin/sites', icon: Globe, module: 'System', desc: 'Multi-tenant site definitions and locales', moduleId: 'multisite' },
  { title: 'Integrations Hub', href: '/admin/integrations', icon: Plug, module: 'System', desc: 'Analytics, storage, email, and search connectors', moduleId: 'integrations' },
  { title: 'Import / Export', href: '/admin/import-export', icon: ArrowDownUp, module: 'System', desc: 'Complete site data portability and migration', moduleId: 'import_export' },
  { title: 'Site Settings', href: '/admin/settings', icon: Settings, module: 'System', desc: 'System preferences, branding, and defaults', moduleId: 'system_settings' },
  { title: 'Audit Logs', href: '/admin/audit-logs', icon: History, module: 'System', desc: 'Immutable governance security stream', moduleId: 'audit_logs' },
  { title: 'System Diagnostics', href: '/admin/system', icon: Activity, module: 'System', desc: 'Database health, pool telemetry, and memory', moduleId: 'system_settings' },
];

interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  url: string;
  metadata?: any;
}

export function SearchModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'content' | 'pages' | 'media' | 'taxonomies' | 'users' | 'system'>('all');
  const [apiResults, setApiResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = (initialQuery = '') => {
    setQuery(initialQuery);
    setIsOpen(true);
    setSelectedIndex(0);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setApiResults([]);
  };

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live API Search
  useEffect(() => {
    if (!query.trim()) {
      setApiResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/v1/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results && Array.isArray(data.results)) {
            setApiResults(data.results);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const { isModuleEnabled } = useModules();

  // Filter modules based on whether they are enabled
  const activeModules = SYSTEM_MODULES.filter((m) => !m.moduleId || isModuleEnabled(m.moduleId));

  // Matching System Module routes
  const cleanQuery = query.toLowerCase().trim();
  const matchedModules = !cleanQuery
    ? activeModules.slice(0, 6)
    : activeModules.filter(
        (m: (typeof SYSTEM_MODULES)[number]) =>
          m.title.toLowerCase().includes(cleanQuery) ||
          m.desc.toLowerCase().includes(cleanQuery) ||
          m.module.toLowerCase().includes(cleanQuery) ||
          m.href.toLowerCase().includes(cleanQuery)
      );

  // Filtered API results based on category
  const filteredApiResults =
    selectedCategory === 'all'
      ? apiResults
      : selectedCategory === 'content'
      ? apiResults.filter((r: SearchResultItem) => r.type === 'content' && r.metadata?.contentType !== 'pages')
      : selectedCategory === 'pages'
      ? apiResults.filter((r: SearchResultItem) => r.type === 'content' && r.metadata?.contentType === 'pages')
      : selectedCategory === 'media'
      ? apiResults.filter((r: SearchResultItem) => r.type === 'media')
      : selectedCategory === 'taxonomies'
      ? apiResults.filter((r: SearchResultItem) => r.type === 'taxonomy')
      : selectedCategory === 'users'
      ? apiResults.filter((r: SearchResultItem) => r.type === 'user')
      : apiResults;

  // Combined interactive items list for keyboard navigation
  const allNavigableItems: { id: string; url: string; title: string }[] = [];
  matchedModules.forEach((m: (typeof SYSTEM_MODULES)[number]) => {
    allNavigableItems.push({ id: `mod-${m.href}`, url: m.href, title: m.title });
  });
  filteredApiResults.forEach((r: SearchResultItem) => {
    allNavigableItems.push({ id: `res-${r.id}`, url: r.url, title: r.title });
  });

  const handleSelect = (url: string) => {
    closeSearch();
    router.push(url);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allNavigableItems.length > 0 ? (prev + 1) % allNavigableItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allNavigableItems.length > 0 ? (prev - 1 + allNavigableItems.length) % allNavigableItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allNavigableItems[selectedIndex]) {
        handleSelect(allNavigableItems[selectedIndex].url);
      }
    }
  };

  const getItemIcon = (type: string) => {
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
    <SearchModalContext.Provider value={{ isOpen, openSearch, closeSearch }}>
      {children}

      {/* Global Search Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-background/80 backdrop-blur-md transition-all animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          {/* Modal Box */}
          <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150">
            {/* Top Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b bg-card/60">
              <Search className={cn('h-5 w-5 shrink-0 text-muted-foreground', loading && 'animate-pulse text-primary')} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInput}
                placeholder="Search across all modules (Content, Pages, Media, Users, Settings...)"
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none text-foreground font-medium"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted text-xs cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground font-semibold">
                  ESC
                </kbd>
              )}
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b bg-muted/20 overflow-x-auto text-[11px] no-scrollbar">
              {[
                { id: 'all', label: 'All Modules' },
                { id: 'content', label: 'Content Entries' },
                { id: 'pages', label: 'Pages' },
                { id: 'media', label: 'Media Library' },
                { id: 'taxonomies', label: 'Taxonomies' },
                { id: 'users', label: 'Users & Roles' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(tab.id as any);
                    setSelectedIndex(0);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer',
                    selectedCategory === tab.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Results Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 max-h-[58vh]">
              {/* Module Jump / Navigation Actions */}
              {matchedModules.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {query ? 'Matched Modules & Navigation' : 'Quick Navigation Modules'}
                  </div>
                  <div className="space-y-0.5">
                    {matchedModules.map((m: (typeof SYSTEM_MODULES)[number]) => {
                      const Icon = m.icon;
                      const globalIdx = allNavigableItems.findIndex((it: { id: string }) => it.id === `mod-${m.href}`);
                      const isSelected = globalIdx === selectedIndex;

                      return (
                        <div
                          key={m.href}
                          onClick={() => handleSelect(m.href)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs',
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'hover:bg-accent/70 text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'h-7 w-7 rounded-md flex items-center justify-center shrink-0',
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{m.title}</div>
                              <div
                                className={cn(
                                  'text-[10px] truncate',
                                  isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                )}
                              >
                                {m.desc}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pl-2">
                            <span
                              className={cn(
                                'text-[9px] uppercase px-1.5 py-0.5 rounded font-mono',
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted/70 text-muted-foreground'
                              )}
                            >
                              {m.module}
                            </span>
                            <ArrowRight className={cn('h-3.5 w-3.5 opacity-60', isSelected && 'opacity-100')} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data Entities Results from Database */}
              {filteredApiResults.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Database Entries & Entities ({filteredApiResults.length})
                  </div>
                  <div className="space-y-0.5">
                    {filteredApiResults.map((r: SearchResultItem) => {
                      const globalIdx = allNavigableItems.findIndex((it: { id: string }) => it.id === `res-${r.id}`);
                      const isSelected = globalIdx === selectedIndex;

                      return (
                        <div
                          key={r.id}
                          onClick={() => handleSelect(r.url)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs',
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'hover:bg-accent/70 text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'h-7 w-7 rounded-md flex items-center justify-center shrink-0',
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted'
                              )}
                            >
                              {getItemIcon(r.type)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{r.title}</div>
                              {r.subtitle && (
                                <div
                                  className={cn(
                                    'text-[10px] truncate',
                                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                  )}
                                >
                                  {r.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pl-2">
                            {r.metadata?.status && (
                              <span
                                className={cn(
                                  'text-[9px] uppercase px-1.5 py-0.5 rounded font-mono',
                                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted/70 text-muted-foreground'
                                )}
                              >
                                {r.metadata.status}
                              </span>
                            )}
                            <span
                              className={cn(
                                'text-[9px] uppercase px-1.5 py-0.5 rounded font-mono',
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {r.type}
                            </span>
                            <ArrowRight className={cn('h-3.5 w-3.5 opacity-60', isSelected && 'opacity-100')} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {query && matchedModules.length === 0 && filteredApiResults.length === 0 && !loading && (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <p>No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[11px] mt-1 text-muted-foreground/70">
                    Try searching for content titles, page names, media filenames, or system modules.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Helper Footer */}
            <div className="px-4 py-2.5 border-t bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↑</kbd>
                  <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                  <span>Open</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">ESC</kbd>
                  <span>Close</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/75 font-mono">
                <Command className="h-3 w-3" /> Universal Search
              </div>
            </div>
          </div>
        </div>
      )}
    </SearchModalContext.Provider>
  );
}
