'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Key, Plus, Trash2, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  role: string;
  environment: string;
  lastUsedAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Key Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('READ_ONLY');
  const [environment, setEnvironment] = useState('PRODUCTION');

  // Revealed Secret State
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const fetchKeys = () => {
    setLoading(true);
    fetch('/api/v1/api-keys')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setKeys(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, environment }),
    });

    const data = await res.json();
    if (res.ok && data.apiKey?.secretKey) {
      setRevealedKey(data.apiKey.secretKey);
      fetchKeys();
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke API key "${name}"? Applications using this key will immediately lose access.`)) return;
    await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
    fetchKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API Secret Key copied to clipboard!');
  };

  return (
    <ModuleGuard moduleId="api_keys">
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">API Keys & Access Tokens</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Provision scoped API credentials for client frontends, mobile applications, and microservices.
          </p>
        </div>
        <Button onClick={() => { setRevealedKey(null); setIsModalOpen(true); }} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Generate API Key</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Key Name</th>
                  <th className="py-3 px-4">Key Prefix</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Used</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading API keys...
                    </td>
                  </tr>
                ) : keys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Key className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">No API keys provisioned</p>
                      <p className="text-[11px] mt-0.5">Generate an API key to query content from your frontend.</p>
                    </td>
                  </tr>
                ) : (
                  keys.map((k) => (
                    <tr key={k.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-semibold text-foreground">{k.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {k.keyPrefix}••••••••
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {k.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={k.environment === 'PRODUCTION' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {k.environment}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={k.revokedAt ? 'destructive' : 'success'} className="text-[10px]">
                          {k.revokedAt ? 'Revoked' : 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!k.revokedAt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(k.id, k.name)}
                            className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Generate Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>Provision API Key</CardTitle>
              <CardDescription>Create credentials for external applications</CardDescription>
            </CardHeader>
            {revealedKey ? (
              <div className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Copy this secret key immediately. It will never be displayed again.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Your Secret API Key</label>
                  <div className="flex gap-2">
                    <Input readOnly value={revealedKey} className="font-mono text-xs h-9 bg-muted/40" />
                    <Button onClick={() => copyToClipboard(revealedKey)} size="sm" className="gap-1">
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </Button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button size="sm" onClick={() => setIsModalOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate}>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Key Identifier Name</label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Next.js Marketing Frontend"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Permissions Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-9 rounded border bg-background px-3 text-xs"
                    >
                      <option value="READ_ONLY">READ_ONLY (Safe for public clients)</option>
                      <option value="READ_WRITE">READ_WRITE (Server-side mutations)</option>
                      <option value="ADMIN">ADMIN (Full administrative access)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Environment</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full h-9 rounded border bg-background px-3 text-xs"
                    >
                      <option value="PRODUCTION">Production (cms_live_...)</option>
                      <option value="STAGING">Staging (cms_test_...)</option>
                      <option value="DEVELOPMENT">Development (cms_test_...)</option>
                    </select>
                  </div>
                </CardContent>
                <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Generate Key
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
    </ModuleGuard>
  );
}
