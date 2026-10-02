'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tags, Plus, FolderTree, Hash, Layers,
  Trash2, Search, Tag, ChevronRight, X,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface Term {
  id: string;
  name: string;
  slug: string;
  _count?: { entries: number };
}

interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  isHierarchical: boolean;
  terms: Term[];
}

const COLORS = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
];

const BAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
];

const TAX_ICON_COLORS = [
  { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
  { bg: 'bg-violet-500/10', text: 'text-violet-500', dot: 'bg-violet-500' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  { bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
];

const MOCK: TaxonomyItem[] = [
  { id: 'cat', name: 'Categories', slug: 'categories', isHierarchical: true, terms: [{ id: '1', name: 'Engineering', slug: 'engineering', _count: { entries: 24 } }, { id: '2', name: 'Design', slug: 'design', _count: { entries: 12 } }, { id: '3', name: 'Business', slug: 'business', _count: { entries: 18 } }, { id: '4', name: 'Cloud & API', slug: 'cloud-api', _count: { entries: 9 } }] },
  { id: 'tag', name: 'Tags', slug: 'tags', isHierarchical: false, terms: [{ id: '5', name: 'react', slug: 'react', _count: { entries: 9 } }, { id: '6', name: 'nextjs', slug: 'nextjs', _count: { entries: 7 } }, { id: '7', name: 'typescript', slug: 'typescript', _count: { entries: 15 } }] },
  { id: 'reg', name: 'Regions', slug: 'regions', isHierarchical: true, terms: [{ id: '8', name: 'North America', slug: 'north-america', _count: { entries: 30 } }, { id: '9', name: 'Europe', slug: 'europe', _count: { entries: 22 } }] },
];

export default function TaxonomiesPage() {
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTaxId, setActiveTaxId] = useState<string | null>(null);
  const [termName, setTermName] = useState('');
  const [termSlug, setTermSlug] = useState('');
  const [termSearch, setTermSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxSlug, setTaxSlug] = useState('');
  const [isHierarchical, setIsHierarchical] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/v1/taxonomies').then(r => r.json())
      .then(res => {
        const data = res.data?.length ? res.data : MOCK;
        setTaxonomies(data);
        setActiveTaxId(data[0]?.id ?? null);
        setLoading(false);
      })
      .catch(() => { setTaxonomies(MOCK); setActiveTaxId(MOCK[0].id); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const createTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/taxonomies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: taxName, slug: taxSlug, isHierarchical }) });
    setShowModal(false); setTaxName(''); setTaxSlug(''); load();
  };

  const createTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaxId) return;
    await fetch('/api/v1/taxonomies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'term', taxonomyId: activeTaxId, name: termName, slug: termSlug }) });
    setTermName(''); setTermSlug(''); load();
  };

  const activeTax = taxonomies.find(t => t.id === activeTaxId);
  const filtered = (activeTax?.terms ?? []).filter(t => !termSearch || t.name.toLowerCase().includes(termSearch.toLowerCase()));
  const maxEntries = Math.max(...(activeTax?.terms ?? []).map(t => t._count?.entries ?? 0), 1);
  const totalEntries = (activeTax?.terms ?? []).reduce((s, t) => s + (t._count?.entries ?? 0), 0);
  const taxIdx = (id: string) => taxonomies.findIndex(t => t.id === id);

  return (
    <ModuleGuard moduleId="taxonomies">
      <div className="h-full flex flex-col gap-4">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Taxonomies</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Organize content with categories, tags &amp; custom classifications.</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5" /> New Taxonomy
        </Button>
      </div>

      {/* ── Body: 3-column layout ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ─── Col 1: Taxonomy list ─── */}
        <div className="w-56 shrink-0 flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">
            All ({taxonomies.length})
          </p>
          {loading
            ? [1,2,3].map(i => <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />)
            : taxonomies.map((tax, i) => {
                const c = TAX_ICON_COLORS[i % TAX_ICON_COLORS.length];
                const active = tax.id === activeTaxId;
                return (
                  <button
                    key={tax.id}
                    onClick={() => { setActiveTaxId(tax.id); setTermSearch(''); }}
                    className={cn(
                      'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all',
                      active
                        ? 'bg-card border-primary/25 shadow-sm'
                        : 'bg-card/50 border-transparent hover:bg-card hover:border-border'
                    )}
                  >
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', c.bg)}>
                      {tax.isHierarchical
                        ? <FolderTree className={cn('h-3.5 w-3.5', c.text)} />
                        : <Hash className={cn('h-3.5 w-3.5', c.text)} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-foreground truncate">{tax.name}</span>
                        <span className={cn('text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0', active ? c.bg + ' ' + c.text : 'bg-muted text-muted-foreground')}>
                          {tax.terms?.length ?? 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{tax.isHierarchical ? 'Hierarchical' : 'Flat tags'}</span>
                    </div>
                  </button>
                );
              })
          }
        </div>

        {/* ─── Col 2: Terms panel ─── */}
        {activeTax ? (
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Panel header */}
            <div className="bg-card border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', TAX_ICON_COLORS[taxIdx(activeTax.id) % TAX_ICON_COLORS.length].bg)}>
                  {activeTax.isHierarchical
                    ? <FolderTree className={cn('h-3.5 w-3.5', TAX_ICON_COLORS[taxIdx(activeTax.id) % TAX_ICON_COLORS.length].text)} />
                    : <Hash className={cn('h-3.5 w-3.5', TAX_ICON_COLORS[taxIdx(activeTax.id) % TAX_ICON_COLORS.length].text)} />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground leading-tight">{activeTax.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="text-[10px] text-muted-foreground font-mono">{activeTax.slug}</code>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground">{activeTax.terms.length} terms</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground">{totalEntries} entries</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] ml-1">
                  {activeTax.isHierarchical ? 'Hierarchical' : 'Flat Tags'}
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input value={termSearch} onChange={e => setTermSearch(e.target.value)} placeholder="Filter terms…" className="pl-8 h-8 text-xs w-44" />
              </div>
            </div>

            {/* Add term form */}
            <form onSubmit={createTerm} className="bg-card border rounded-xl px-4 py-3 flex gap-2 items-end shrink-0">
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Term Name</label>
                <Input
                  required
                  placeholder={activeTax.isHierarchical ? 'e.g. Cloud Native' : 'e.g. typescript'}
                  value={termName}
                  onChange={e => { setTermName(e.target.value); setTermSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div className="w-40 shrink-0">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Slug</label>
                <Input required placeholder="cloud-native" value={termSlug} onChange={e => setTermSlug(e.target.value)} className="h-8 text-xs font-mono mt-1" />
              </div>
              <Button type="submit" size="sm" className="h-8 text-xs gap-1 shrink-0">
                <Plus className="h-3.5 w-3.5" /> Add Term
              </Button>
            </form>

            {/* Terms list */}
            <div className="bg-card border rounded-xl overflow-hidden flex-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  {activeTax.isHierarchical
                    ? <FolderTree className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    : <Hash className="h-10 w-10 text-muted-foreground/20 mb-3" />}
                  <p className="text-sm font-semibold text-muted-foreground">
                    {termSearch ? 'No terms match' : 'No terms yet'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {termSearch ? `Nothing matched "${termSearch}"` : 'Add your first term using the form above'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_120px_160px_32px] gap-2 px-4 py-2 border-b bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    <span>Term</span>
                    <span>Entries</span>
                    <span>Usage</span>
                    <span />
                  </div>

                  {/* Term rows */}
                  {filtered.map((term, i) => {
                    const count = term._count?.entries ?? 0;
                    const pct = Math.round((count / maxEntries) * 100);
                    const color = COLORS[i % COLORS.length];
                    const barColor = BAR_COLORS[i % BAR_COLORS.length];
                    return (
                      <div
                        key={term.id}
                        className="group grid grid-cols-[1fr_120px_160px_32px] gap-2 items-center px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        {/* Term name + slug */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={cn('inline-flex items-center justify-center h-6 w-6 rounded-md text-[10px] font-bold shrink-0', color)}>
                            {term.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground leading-tight">{term.name}</div>
                            <code className="text-[10px] text-muted-foreground font-mono">{term.slug}</code>
                          </div>
                        </div>

                        {/* Entry count */}
                        <div className="text-xs font-semibold text-foreground">{count} <span className="font-normal text-muted-foreground text-[10px]">entries</span></div>

                        {/* Usage bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-7 text-right shrink-0">{pct}%</span>
                        </div>

                        {/* Delete */}
                        <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border rounded-xl border-dashed bg-card/50">
            <div className="text-center">
              <Tags className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Select a taxonomy</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Choose one from the left panel</p>
            </div>
          </div>
        )}

        {/* ─── Col 3: Quick info ─── */}
        <div className="w-52 shrink-0 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2">Overview</p>

          {/* Stats */}
          {activeTax && (
            <>
              {[
                { label: 'Terms', value: activeTax.terms.length, icon: Tag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Total Entries', value: totalEntries, icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
                    <Icon className={cn('h-4 w-4', color)} />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Type guide */}
          <div className="bg-card border rounded-xl p-4 space-y-3 mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Type Guide</p>
            {[
              { icon: FolderTree, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Hierarchical', desc: 'Parent → child nesting' },
              { icon: Hash, color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'Flat Tags', desc: 'Simple keyword labels' },
            ].map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className={cn('h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5', bg)}>
                  <Icon className={cn('h-3.5 w-3.5', color)} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* All taxonomy overview */}
          {taxonomies.length > 0 && (
            <div className="bg-card border rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">All Taxonomies</p>
              {taxonomies.map((tax, i) => {
                const c = TAX_ICON_COLORS[i % TAX_ICON_COLORS.length];
                return (
                  <div key={tax.id} className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', c.dot)} />
                    <span className="text-xs text-foreground flex-1 truncate">{tax.name}</span>
                    <span className="text-[10px] text-muted-foreground">{tax.terms.length}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Taxonomy Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-sm font-bold text-foreground">New Taxonomy</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Define a classification system</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={createTaxonomy}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold">Name</label>
                  <Input required value={taxName} onChange={e => { setTaxName(e.target.value); setTaxSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} placeholder="e.g. Regions" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold">API Slug</label>
                  <Input required value={taxSlug} onChange={e => setTaxSlug(e.target.value)} placeholder="regions" className="h-8 text-xs font-mono mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">Used in API endpoints and content queries</p>
                </div>
                <div>
                  <label className="text-xs font-semibold">Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {[
                      { label: 'Hierarchical', sub: 'Nested categories', icon: FolderTree, val: true },
                      { label: 'Flat Tags', sub: 'Simple labels', icon: Hash, val: false },
                    ].map(opt => (
                      <button key={String(opt.val)} type="button" onClick={() => setIsHierarchical(opt.val)}
                        className={cn('flex items-center gap-2 p-3 rounded-xl border text-left transition-all', isHierarchical === opt.val ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40')}>
                        <opt.icon className={cn('h-4 w-4 shrink-0', isHierarchical === opt.val ? 'text-primary' : 'text-muted-foreground')} />
                        <div>
                          <div className="text-xs font-semibold">{opt.label}</div>
                          <div className="text-[10px] text-muted-foreground">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-4 border-t bg-muted/20 rounded-b-2xl">
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="text-xs gap-1"><Plus className="h-3.5 w-3.5" /> Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ModuleGuard>
  );
}
