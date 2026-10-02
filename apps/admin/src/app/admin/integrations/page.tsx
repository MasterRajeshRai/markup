'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plug,
  BarChart,
  HardDrive,
  Sparkles,
  Mail,
  Search,
  Eye,
  CheckCircle2,
  RefreshCw,
  Settings2,
  Activity,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/integrations');
      const data = await res.json();
      if (res.ok) {
        setIntegrations(data.integrations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: id, enabled: !currentStatus }),
      });
      if (res.ok) {
        setIntegrations((prev) =>
          prev.map((i) => (i.id === id ? { ...i, enabled: !currentStatus } : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', integrationId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data.message);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedItem.id,
          config: selectedItem.config,
        }),
      });
      if (res.ok) {
        setSelectedItem(null);
        fetchIntegrations();
      }
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BarChart':
        return <BarChart className="h-5 w-5" />;
      case 'HardDrive':
        return <HardDrive className="h-5 w-5" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5" />;
      case 'Mail':
        return <Mail className="h-5 w-5" />;
      case 'Search':
        return <Search className="h-5 w-5" />;
      case 'Eye':
        return <Eye className="h-5 w-5" />;
      default:
        return <Plug className="h-5 w-5" />;
    }
  };

  return (
    <ModuleGuard moduleId="integrations">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Integrations & Connectors</h1>
            <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
              Ecosystem Hub
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Connect your Headless CMS with third-party analytics, storage drivers, search indices, email providers, and AI engines.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchIntegrations}
          disabled={loading}
          className="text-xs gap-1.5 h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {getIcon(item.icon)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{item.name}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-mono mt-0.5">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(item.id, item.enabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    item.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label="Toggle integration"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      item.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <CardDescription className="text-xs text-muted-foreground pt-2 line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
                    }`}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {item.enabled ? 'Connected' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTestConnection(item.id)}
                    disabled={!item.enabled || testing}
                    className="h-7 text-[11px] px-2 gap-1"
                    title="Test connection"
                  >
                    <Activity className="h-3 w-3" />
                    <span>Ping</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(item);
                      setTestResult(null);
                    }}
                    className="h-7 text-[11px] px-2 gap-1"
                  >
                    <Settings2 className="h-3 w-3" />
                    <span>Configure</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {getIcon(selectedItem.icon)}
                </div>
                <DialogTitle className="text-base font-bold">{selectedItem.name}</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure credentials, endpoints, and behavior settings.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveConfig} className="space-y-4 py-2">
              {Object.entries(selectedItem.config).map(([key, val]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key} className="text-xs font-semibold capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <Input
                    id={key}
                    value={typeof val === 'boolean' ? String(val) : String(val)}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        config: {
                          ...selectedItem.config,
                          [key]: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 font-mono"
                  />
                </div>
              ))}

              {testResult && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving} className="font-semibold">
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
    </ModuleGuard>
  );
}
