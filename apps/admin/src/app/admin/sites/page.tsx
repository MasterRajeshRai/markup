'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, Plus, Layers, ArrowRight, Trash2 } from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface SiteItem {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  defaultLocale: string;
  isDefault: boolean;
  _count?: {
    contentEntries: number;
    contentTypes: number;
    media: number;
  };
}

export default function SitesPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Site Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [defaultLocale, setDefaultLocale] = useState('en-US');

  const fetchSites = () => {
    setLoading(true);
    fetch('/api/v1/sites')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setSites(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, domain, defaultLocale }),
    });

    setIsModalOpen(false);
    setName('');
    setSlug('');
    setDomain('');
    fetchSites();
  };

  const handleDeleteSite = async (id: string, siteName: string) => {
    if (!confirm(`Delete site "${siteName}"? This action cannot be undone.`)) return;
    const res = await fetch(`/api/v1/sites?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to delete site');
      return;
    }
    fetchSites();
  };

  return (
    <ModuleGuard moduleId="multisite">
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Multi-Site Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage multiple independent brand sites, portals, and domains from a single headless cluster.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Site</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Loading managed sites...
          </div>
        ) : (
          sites.map((s) => (
            <Card key={s.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={s.isDefault ? 'default' : 'secondary'} className="text-[10px]">
                    {s.isDefault ? 'Default Hub' : 'Sub-Site'}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">/{s.slug}</span>
                    {!s.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSite(s.id, s.name)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive p-0"
                        title="Delete Site"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-base mt-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>{s.name}</span>
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  {s.domain || 'No custom domain bound'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-2 p-2 rounded bg-muted/20 text-center text-xs">
                  <div>
                    <div className="font-bold">{s._count?.contentEntries || 0}</div>
                    <div className="text-[10px] text-muted-foreground">Entries</div>
                  </div>
                  <div>
                    <div className="font-bold">{s._count?.contentTypes || 0}</div>
                    <div className="text-[10px] text-muted-foreground">Models</div>
                  </div>
                  <div>
                    <div className="font-bold">{s._count?.media || 0}</div>
                    <div className="text-[10px] text-muted-foreground">Media</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t text-muted-foreground">
                  <span>Locale: <strong className="text-foreground">{s.defaultLocale}</strong></span>
                  <Badge variant="outline" className="text-[10px]">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal: New Site */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>Create New Site</CardTitle>
              <CardDescription>Setup an isolated domain and brand tenancy</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateSite}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Site Name</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    placeholder="e.g. Acme Mobile PWA"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Site Slug</label>
                  <Input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme-pwa" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Domain Binding</label>
                  <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="app.acme.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Default Locale</label>
                  <Input value={defaultLocale} onChange={(e) => setDefaultLocale(e.target.value)} placeholder="en-US" />
                </div>
              </CardContent>
              <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create Site
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
    </ModuleGuard>
  );
}
