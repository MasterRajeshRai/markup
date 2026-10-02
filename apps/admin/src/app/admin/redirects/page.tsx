'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Compass, Plus, Trash2, ArrowRight, AlertCircle, Edit } from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface RedirectItem {
  id: string;
  sourceUrl: string;
  destinationUrl: string;
  statusCode: number;
  hitCount: number;
  notes?: string;
  createdAt: string;
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [statusCode, setStatusCode] = useState('301');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchRedirects = () => {
    setLoading(true);
    fetch('/api/v1/redirects')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setRedirects(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setSourceUrl('');
    setDestinationUrl('');
    setStatusCode('301');
    setNotes('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: RedirectItem) => {
    setEditingId(r.id);
    setSourceUrl(r.sourceUrl);
    setDestinationUrl(r.destinationUrl);
    setStatusCode(String(r.statusCode));
    setNotes(r.notes || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isEdit = Boolean(editingId);
    const url = isEdit ? `/api/v1/redirects/${editingId}` : '/api/v1/redirects';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceUrl,
        destinationUrl,
        statusCode: parseInt(statusCode, 10),
        notes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || `Failed to ${isEdit ? 'update' : 'create'} redirect`);
      return;
    }

    setIsModalOpen(false);
    setEditingId(null);
    setSourceUrl('');
    setDestinationUrl('');
    setNotes('');
    fetchRedirects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this redirect rule?')) return;
    await fetch(`/api/v1/redirects/${id}`, { method: 'DELETE' });
    fetchRedirects();
  };

  return (
    <ModuleGuard moduleId="redirects">
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Redirect Manager</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage 301 and 302 URL redirects with automated loop and cycle detection.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Redirect</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Source URL</th>
                  <th className="py-3 px-4"></th>
                  <th className="py-3 px-4">Destination URL</th>
                  <th className="py-3 px-4">Status Code</th>
                  <th className="py-3 px-4">Hits</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading redirects...
                    </td>
                  </tr>
                ) : redirects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Compass className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">No redirect rules</p>
                      <p className="text-[11px] mt-0.5">Add your first URL redirect rule.</p>
                    </td>
                  </tr>
                ) : (
                  redirects.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-mono font-medium">{r.sourceUrl}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </td>
                      <td className="py-3 px-4 font-mono text-primary">{r.destinationUrl}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono">
                          {r.statusCode}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono">{r.hitCount}</td>
                      <td className="py-3 px-4 text-muted-foreground truncate max-w-xs">{r.notes || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(r)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit Redirect"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            title="Delete Redirect"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: New / Edit Redirect */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Redirect Rule' : 'Create Redirect Rule'}</CardTitle>
              <CardDescription>Setup automatic redirection with loop prevention</CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-3">
                {error && (
                  <div className="p-2.5 rounded bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Source Path</label>
                  <Input
                    required
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="/old-path"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Destination Path</label>
                  <Input
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="/new-destination"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">HTTP Status Code</label>
                  <select
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  >
                    <option value="301">301 — Moved Permanently (SEO Recommended)</option>
                    <option value="302">302 — Found / Temporary Redirect</option>
                    <option value="307">307 — Temporary Redirect (Preserve Method)</option>
                    <option value="308">308 — Permanent Redirect (Preserve Method)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Notes</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Migration from legacy blog"
                    className="text-xs"
                  />
                </div>
              </CardContent>
              <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingId ? 'Save Changes' : 'Add Redirect'}
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
