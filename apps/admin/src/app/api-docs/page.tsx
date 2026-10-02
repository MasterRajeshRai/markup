'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BookOpen, Send, Layers, Key, Shield } from 'lucide-react';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/content');
  const [selectedMethod, setSelectedMethod] = useState<string>('get');
  const [activeApiKey, setActiveApiKey] = useState<string>('cms_live_caadf19cfe32247af2e4bf793e445c135990f319b9398a99');

  // Interactive Runner State
  const [testUrl, setTestUrl] = useState<string>('/api/v1/content?type=articles');
  const [running, setRunning] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/openapi.json')
      .then((r) => r.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      });
  }, []);

  const handleExecute = async () => {
    setRunning(true);
    setTestResponse(null);

    const startTime = Date.now();
    try {
      const res = await fetch(testUrl, {
        method: selectedMethod.toUpperCase(),
        headers: {
          'X-API-Key': activeApiKey,
          'Content-Type': 'application/json',
        },
      });

      const durationMs = Date.now() - startTime;
      const data = await res.json();
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      });
    } catch (err: any) {
      setTestResponse({
        error: err.message,
      });
    } finally {
      setRunning(false);
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get':
        return 'success';
      case 'post':
        return 'default';
      case 'patch':
      case 'put':
        return 'warning';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-muted/15 p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Admin</span>
              </Button>
            </Link>
            <Badge variant="outline" className="font-mono text-xs">
              OpenAPI 3.0.3
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            <span>Universal Headless CMS — API Explorer</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl">
            Complete API specification for content delivery, asset retrieval, webhooks, and administrative operations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border rounded-lg p-2 text-xs">
          <Key className="h-4 w-4 text-muted-foreground" />
          <Input
            value={activeApiKey}
            onChange={(e) => setActiveApiKey(e.target.value)}
            placeholder="Active API Key..."
            className="h-8 text-xs font-mono w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground">
          Loading OpenAPI specification...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints Sidebar */}
          <Card className="lg:col-span-1 p-2 space-y-1 max-h-[75vh] overflow-y-auto">
            <div className="p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Endpoints</div>
            {Object.entries(spec?.paths || {}).map(([pathKey, methods]: [string, any]) =>
              Object.entries(methods).map(([method, def]: [string, any]) => (
                <button
                  key={`${method}_${pathKey}`}
                  onClick={() => {
                    setSelectedEndpoint(pathKey);
                    setSelectedMethod(method);
                    setTestUrl(`/api/v1${pathKey.replace(/\{(\w+)\}/g, 'home')}`);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-xs font-mono text-left transition-colors ${
                    selectedEndpoint === pathKey && selectedMethod === method
                      ? 'bg-accent text-accent-foreground font-semibold border-l-2 border-primary'
                      : 'hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Badge variant={getMethodBadgeVariant(method) as any} className="uppercase text-[9px] w-12 text-center justify-center font-bold">
                      {method}
                    </Badge>
                    <span className="truncate">{pathKey}</span>
                  </div>
                </button>
              ))
            )}
          </Card>

          {/* Endpoint Details & Interactive Runner */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={getMethodBadgeVariant(selectedMethod) as any} className="uppercase font-bold text-xs px-2.5 py-1">
                    {selectedMethod}
                  </Badge>
                  <span className="font-mono text-sm font-semibold">{selectedEndpoint}</span>
                </div>
                <CardDescription className="text-xs mt-2">
                  {spec?.paths?.[selectedEndpoint]?.[selectedMethod]?.summary || 'API Operation'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Live Runner Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Interactive Request Runner:</label>
                  <div className="flex gap-2">
                    <Input
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      className="font-mono text-xs h-9"
                    />
                    <Button onClick={handleExecute} disabled={running} size="sm" className="gap-1.5 font-semibold">
                      <Send className="h-3.5 w-3.5" />
                      <span>{running ? 'Calling...' : 'Execute'}</span>
                    </Button>
                  </div>
                </div>

                {/* Response Viewer */}
                {testResponse && (
                  <div className="space-y-2 pt-2 border-t font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Response Status:</span>
                        <Badge variant={testResponse.status < 400 ? 'success' : 'destructive'}>
                          {testResponse.status} {testResponse.statusText}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{testResponse.durationMs} ms</span>
                    </div>

                    <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 overflow-x-auto text-[11px] max-h-80 leading-relaxed border">
                      {JSON.stringify(testResponse.body, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
