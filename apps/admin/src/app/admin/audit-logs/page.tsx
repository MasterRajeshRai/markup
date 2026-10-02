'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { History, Shield, Filter, Search } from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorType: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
  actor?: { name: string; email: string } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);

    fetch(`/api/v1/audit-logs?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setLogs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <ModuleGuard moduleId="audit_logs">
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Governance Audit Logs</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Immutable, tamper-resistant trail of all security, authentication, and content mutations.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter by action (e.g. auth.login, content.publish, media.upload)..."
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details / Metadata</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-sans">
                      Loading audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground font-sans">
                      <Shield className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">No audit logs recorded</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            log.action.includes('delete') || log.action.includes('revoke')
                              ? 'destructive'
                              : log.action.includes('publish')
                              ? 'success'
                              : 'outline'
                          }
                          className="font-mono text-[10px]"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-sans font-medium">
                        {log.actor?.name || log.actorType}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-foreground">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-[10px] text-muted-foreground block">
                            #{log.entityId.slice(-6)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[10px] truncate max-w-xs">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                      <td className="py-3 px-4 text-right font-sans text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </ModuleGuard>
  );
}
