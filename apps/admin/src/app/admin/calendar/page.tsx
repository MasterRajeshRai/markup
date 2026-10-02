'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Send,
  BookOpen,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  Filter,
  Eye,
  ArrowRight,
  Zap,
  List,
  CalendarDays,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ModuleGuard } from '@/components/module-guard';

interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  typeSlug: string;
  typeName: string;
  status: 'PUBLISHED' | 'SCHEDULED' | 'IN_REVIEW' | 'DRAFT';
  date: string; // ISO date string
  author: string;
  seoScore: number;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'art_1',
    title: 'Getting Started with Modern Headless Architecture',
    slug: 'getting-started-with-headless-architecture',
    typeSlug: 'articles',
    typeName: 'Articles',
    status: 'PUBLISHED',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    author: 'Alex Morgan',
    seoScore: 92,
  },
  {
    id: 'art_2',
    title: 'Next.js 15 Server Components & Incremental Static Regeneration',
    slug: 'nextjs-15-server-components-isr',
    typeSlug: 'articles',
    typeName: 'Articles',
    status: 'SCHEDULED',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // in 2 days
    author: 'Sarah Jenkins',
    seoScore: 88,
  },
  {
    id: 'art_3',
    title: 'State of Decoupled CMS Platforms: 2026 Enterprise Report',
    slug: 'state-of-decoupled-cms-2026',
    typeSlug: 'articles',
    typeName: 'Articles',
    status: 'SCHEDULED',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(), // in 6 days
    author: 'Marcus Chen',
    seoScore: 95,
  },
  {
    id: 'pg_1',
    title: 'Enterprise Security & Compliance Whitepaper',
    slug: 'security-compliance-whitepaper',
    typeSlug: 'pages',
    typeName: 'Pages',
    status: 'IN_REVIEW',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), // in 4 days
    author: 'Elena Rostova',
    seoScore: 78,
  },
  {
    id: 'art_4',
    title: 'Benchmarking Cloudflare R2 vs AWS S3 Media CDN Costs',
    slug: 'benchmarking-cloudflare-r2-vs-s3',
    typeSlug: 'articles',
    typeName: 'Articles',
    status: 'DRAFT',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    author: 'Alex Morgan',
    seoScore: 84,
  },
];

export default function EditorialCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== 'ALL' && ev.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && ev.typeSlug !== typeFilter) return false;
    return true;
  });

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter((ev) => {
      const d = new Date(ev.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const getStatusBadge = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success" className="text-[10px] font-semibold">Published</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary" className="text-[10px] font-semibold bg-blue-500/15 text-blue-500 border-blue-500/30">Scheduled</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="warning" className="text-[10px] font-semibold">In Review</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="outline" className="text-[10px] font-semibold">Draft</Badge>;
    }
  };

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return 'border-l-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      case 'SCHEDULED':
        return 'border-l-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'IN_REVIEW':
        return 'border-l-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case 'DRAFT':
      default:
        return 'border-l-slate-400 bg-slate-500/10 text-slate-700 dark:text-slate-300';
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  return (
    <ModuleGuard moduleId="calendar">
      <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <span>Editorial Calendar &amp; Scheduling Timeline</span>
            </h1>
            <Badge variant="outline" className="text-[11px] font-mono border-primary/40 text-primary">
              Live Horizon
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visual publication schedule, multi-channel editorial roadmap, and content deployment timeline.
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-muted rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('calendar')}
              className={cn('h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer', viewMode === 'calendar' && 'bg-background shadow-xs font-semibold')}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('timeline')}
              className={cn('h-7.5 px-2.5 text-xs gap-1.5 cursor-pointer', viewMode === 'timeline' && 'bg-background shadow-xs font-semibold')}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </Button>
          </div>

          <Link href="/admin/content/articles/new">
            <Button size="sm" className="gap-1.5 h-8 text-xs shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>New Entry</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Filter Bar & Month Switcher ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card rounded-xl border">
        {/* Month Stepper */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePrevMonth}
            className="h-8 w-8 rounded-lg cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-bold text-base min-w-[160px] text-center text-foreground">
            {monthNames[month]} {year}
          </span>

          <Button
            size="icon"
            variant="outline"
            onClick={handleNextMonth}
            className="h-8 w-8 rounded-lg cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleToday}
            className="h-8 text-xs font-medium cursor-pointer"
          >
            Today
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs bg-background border rounded-lg px-2 text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Content Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 text-xs bg-background border rounded-lg px-2 text-foreground focus:outline-none"
          >
            <option value="ALL">All Content Types</option>
            <option value="articles">Articles</option>
            <option value="pages">Pages</option>
          </select>
        </div>
      </div>

      {/* ── Calendar Grid View ──────────────────────────────────────────────── */}
      {viewMode === 'calendar' ? (
        <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
            {/* Previous Month filler days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[110px] p-2 bg-muted/15 text-muted-foreground/40 text-xs font-mono select-none"
                >
                  {prevDay}
                </div>
              );
            })}

            {/* Current Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={`day-${day}`}
                  className={cn(
                    'min-h-[110px] p-2 transition-colors relative flex flex-col justify-between group hover:bg-accent/30',
                    today && 'bg-primary/5 ring-1 ring-primary/40'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs font-mono font-medium rounded-full h-6 w-6 flex items-center justify-center',
                        today
                          ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                          : 'text-foreground'
                      )}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {dayEvents.length} {dayEvents.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>

                  {/* Day Content Chips */}
                  <div className="space-y-1 mt-1.5 flex-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        className={cn(
                          'w-full text-left p-1.5 rounded border-l-2 text-[11px] truncate block font-medium transition-all shadow-2xs hover:scale-[1.02] cursor-pointer',
                          getStatusColor(ev.status)
                        )}
                        title={ev.title}
                      >
                        <div className="truncate leading-tight font-semibold">{ev.title}</div>
                        <div className="flex items-center justify-between text-[9px] opacity-75 mt-0.5">
                          <span>{ev.typeName}</span>
                          <span>{new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center font-medium">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Timeline / List View ─────────────────────────────────────────── */
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground text-xs">
              No content items matching filters for this timeline.
            </Card>
          ) : (
            filteredEvents
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((ev) => (
                <Card
                  key={ev.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-all cursor-pointer shadow-xs"
                  onClick={() => setSelectedEvent(ev)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      {ev.typeSlug === 'articles' ? <BookOpen className="h-5 w-5" /> : <Newspaper className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{ev.title}</span>
                        {getStatusBadge(ev.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>By {ev.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {new Date(ev.date).toLocaleDateString()} at {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <Zap className="h-3 w-3 fill-current" /> SEO {ev.seoScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/admin/content/${ev.typeSlug}/${ev.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                        <span>Edit</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
          )}
        </div>
      )}

      {/* ── Event Detail Modal ─────────────────────────────────────────────── */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pb-1">
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {selectedEvent.typeName}
                </Badge>
                {getStatusBadge(selectedEvent.status)}
              </div>
              <DialogTitle className="text-base font-bold leading-tight">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Path: /{selectedEvent.typeSlug}/{selectedEvent.slug}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-2 border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Publication:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedEvent.date).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span className="font-semibold text-foreground">{selectedEvent.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rank Markup SEO Score:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 fill-current" /> {selectedEvent.seoScore}/100 Good
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="text-xs h-8"
              >
                Close
              </Button>
              <Link href={`/admin/content/${selectedEvent.typeSlug}/${selectedEvent.id}`}>
                <Button size="sm" className="gap-1.5 text-xs h-8">
                  <span>Open Full Editor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </ModuleGuard>
  );
}
