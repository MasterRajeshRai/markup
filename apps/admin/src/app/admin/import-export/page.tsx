'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Play,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importJson, setImportJson] = useState('');
  const [dryRunReport, setDryRunReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDownloadExport = () => {
    window.location.href = '/api/v1/export';
  };

  const handleDryRun = async () => {
    if (!importJson.trim()) return;
    setLoading(true);
    setDryRunReport(null);
    setStatusMessage(null);
    try {
      const bundle = JSON.parse(importJson);
      const res = await fetch('/api/v1/import?dryRun=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      });
      const data = await res.json();
      if (res.ok) {
        setDryRunReport(data.report);
      } else {
        setStatusMessage(data.error || 'Validation failed');
      }
    } catch (e: any) {
      setStatusMessage(`JSON Parse Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!importJson.trim()) return;
    setLoading(true);
    try {
      const bundle = JSON.parse(importJson);
      const res = await fetch('/api/v1/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Content successfully imported into database!');
        setDryRunReport(null);
        setImportJson('');
      } else {
        setStatusMessage(data.error || 'Import failed');
      }
    } catch (e: any) {
      setStatusMessage(`Import Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleGuard moduleId="import_export">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Import & Export Migration</h1>
            <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
              Data Portability
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Export complete site bundles or import content models, entries, taxonomies, and settings with dry-run validation.
          </p>
        </div>

        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <Button
            size="sm"
            variant={activeTab === 'export' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('export')}
            className="text-xs h-7"
          >
            Export Bundle
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'import' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('import')}
            className="text-xs h-7"
          >
            Import Data
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusMessage}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setStatusMessage(null)} className="h-6 px-2 text-[10px]">
            Dismiss
          </Button>
        </div>
      )}

      {activeTab === 'export' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="p-5 border-b">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Complete Site JSON Bundle</CardTitle>
                  <CardDescription className="text-xs">
                    Full backup of Content Types, Entries, Taxonomies, Menus, and Site Settings.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Schema definitions with all 25+ dynamic field configurations</p>
                <p>• All published and draft content entries and visual block data</p>
                <p>• Hierarchical taxonomy terms and menu structures</p>
                <p>• Site settings and SEO defaults</p>
              </div>

              <Button onClick={handleDownloadExport} className="w-full gap-2 text-xs font-semibold shadow-sm">
                <FileJson className="h-4 w-4" />
                <span>Download Site Export (.json)</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-dashed">
            <CardHeader className="p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span>Data Portability & Zero Lock-in</span>
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-2">
                The exported JSON adheres strictly to OpenAPI 3.0 schemas and can be restored to any instance of the CMS or transformed for migration to other databases or headless platforms.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <span>Import JSON Payload</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Paste the exported JSON bundle below to validate and import into the current site.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <textarea
                rows={8}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='Paste JSON export bundle here: { "version": "1.0.0", "contentEntries": [...] }'
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Always run a dry-run test before importing to verify relational integrity.
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDryRun}
                    disabled={loading || !importJson.trim()}
                    className="text-xs h-8"
                  >
                    Run Dry-Run Check
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExecuteImport}
                    disabled={loading || !dryRunReport}
                    className="text-xs h-8 font-semibold shadow-sm"
                  >
                    Execute Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {dryRunReport && (
            <Card className="border-emerald-500/40 bg-emerald-500/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Dry-Run Validation Succeeded</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg border bg-background">
                    <div className="text-[10px] text-muted-foreground">Content Types</div>
                    <div className="text-base font-bold font-mono mt-0.5">{dryRunReport.contentTypesToImport}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border bg-background">
                    <div className="text-[10px] text-muted-foreground">Entries</div>
                    <div className="text-base font-bold font-mono mt-0.5 text-primary">{dryRunReport.entriesToImport}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border bg-background">
                    <div className="text-[10px] text-muted-foreground">Taxonomies</div>
                    <div className="text-base font-bold font-mono mt-0.5">{dryRunReport.taxonomiesToImport}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border bg-background">
                    <div className="text-[10px] text-muted-foreground">Settings</div>
                    <div className="text-base font-bold font-mono mt-0.5">{dryRunReport.settingsToImport}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
    </ModuleGuard>
  );
}
