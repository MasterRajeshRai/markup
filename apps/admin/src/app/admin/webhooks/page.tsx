'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Webhook as WebhookIcon, Plus, Trash2, Send, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  deliveriesCount: number;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Webhook Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'content.published',
    'content.created',
    'media.uploaded',
  ]);

  // Test Delivery Result Modal
  const [testResult, setTestResult] = useState<any>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchWebhooks = () => {
    setLoading(true);
    fetch('/api/v1/webhooks')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setWebhooks(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        url,
        events: selectedEvents,
      }),
    });

    setIsModalOpen(false);
    setName('');
    setUrl('');
    fetchWebhooks();
  };

  const handleTestWebhook = async (id: string) => {
    setTestingId(id);
    const res = await fetch(`/api/v1/webhooks/${id}/test`, { method: 'POST' });
    const data = await res.json();
    setTestingId(null);
    setTestResult(data.delivery || data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook registration?')) return;
    await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
    fetchWebhooks();
  };

  const availableEvents = [
    'content.created',
    'content.updated',
    'content.published',
    'content.unpublished',
    'content.deleted',
    'media.uploaded',
    'media.deleted',
    'user.created',
  ];

  return (
    <ModuleGuard moduleId="webhooks">
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Webhooks & Event Dispatcher</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Dispatch signed HMAC events to external pipelines, Netlify/Vercel build triggers, or microservices.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Register Webhook</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Webhook Name</th>
                  <th className="py-3 px-4">Target URL</th>
                  <th className="py-3 px-4">Subscribed Events</th>
                  <th className="py-3 px-4">Deliveries</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading webhooks...
                    </td>
                  </tr>
                ) : webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <WebhookIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">No webhooks configured</p>
                      <p className="text-[11px] mt-0.5">Register a webhook URL to receive live publishing events.</p>
                    </td>
                  </tr>
                ) : (
                  webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-semibold text-foreground">{w.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground truncate max-w-xs">
                        {w.url}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {w.events.map((ev) => (
                            <Badge key={ev} variant="outline" className="font-mono text-[9px]">
                              {ev}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">{w.deliveriesCount}</td>
                      <td className="py-3 px-4">
                        <Badge variant={w.isActive ? 'success' : 'secondary'} className="text-[10px]">
                          {w.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={testingId === w.id}
                          onClick={() => handleTestWebhook(w.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Send className="h-3 w-3" />
                          <span>{testingId === w.id ? 'Sending...' : 'Test'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(w.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Test Delivery Feedback Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Webhook Delivery Inspection</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTestResult(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-xs font-mono">
              <div className="flex justify-between py-1 border-b">
                <span className="font-sans text-muted-foreground">HTTP Status:</span>
                <Badge variant={testResult.success ? 'success' : 'destructive'}>
                  {testResult.responseStatus || 'Failed'}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="font-sans text-muted-foreground">Duration:</span>
                <span>{testResult.durationMs || 0} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="font-sans text-muted-foreground">Timestamp:</span>
                <span>{testResult.createdAt || new Date().toISOString()}</span>
              </div>
              {testResult.error && (
                <div className="p-2.5 rounded bg-destructive/15 text-destructive font-sans">
                  <strong>Delivery Error:</strong> {testResult.error}
                </div>
              )}
              {testResult.responseBody && (
                <div className="space-y-1">
                  <span className="font-sans text-muted-foreground block">Response Body:</span>
                  <pre className="p-2.5 rounded bg-zinc-950 text-zinc-100 text-[11px] overflow-x-auto max-h-36">
                    {testResult.responseBody}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: New Webhook */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>Register Webhook</CardTitle>
              <CardDescription>Setup an endpoint to receive payload notifications</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateWebhook}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Webhook Name</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Production Deploy Hook"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Endpoint URL</label>
                  <Input
                    required
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.myapp.com/webhooks/cms"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-xs font-semibold">Subscribed Events:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {availableEvents.map((ev) => (
                      <label key={ev} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(ev)}
                          onChange={() => {
                            if (selectedEvents.includes(ev)) {
                              setSelectedEvents(selectedEvents.filter((x) => x !== ev));
                            } else {
                              setSelectedEvents([...selectedEvents, ev]);
                            }
                          }}
                        />
                        <span className="font-mono text-[11px]">{ev}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Register Webhook
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
