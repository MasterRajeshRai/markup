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
  GitMerge,
  ArrowRight,
  Shield,
  Plus,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

interface WorkflowState {
  id: string;
  name: string;
  slug: string;
  color: string;
  isInitial: boolean;
  isPublished: boolean;
  isArchived: boolean;
  order: number;
}

interface WorkflowTransition {
  id: string;
  name: string;
  requiredPermission?: string;
  fromState: WorkflowState;
  toState: WorkflowState;
}

interface WorkflowItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isDefault: boolean;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/workflows');
      const data = await res.json();
      if (res.ok) {
        setWorkflows(data.workflows || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflowName,
          description: newWorkflowDesc,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewWorkflowName('');
        setNewWorkflowDesc('');
        fetchWorkflows();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleGuard moduleId="workflows">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Workflows & Lifecycle</h1>
            <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
              State Machine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure editorial multi-tier review pipelines, state transitions, and RBAC sign-off requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchWorkflows}
            disabled={loading}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs gap-1.5 h-8 font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Workflow</span>
          </Button>
        </div>
      </div>

      {/* Workflows List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <GitMerge className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="font-semibold text-foreground text-sm">No workflows found</p>
          <p className="text-xs mt-0.5">Create your first editorial workflow pipeline.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {workflows.map((wf) => (
            <Card key={wf.id} className="overflow-hidden">
              <CardHeader className="p-5 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{wf.name}</CardTitle>
                      {wf.isDefault && (
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          Default Workflow
                        </Badge>
                      )}
                    </div>
                    {wf.description && (
                      <CardDescription className="text-xs text-muted-foreground">
                        {wf.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {wf.states.length} States • {wf.transitions.length} Transitions
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Visual State Pipeline */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>Editorial States Pipeline</span>
                  </h4>

                  <div className="flex flex-wrap items-center gap-2">
                    {wf.states.map((st, idx) => (
                      <React.Fragment key={st.id}>
                        <div
                          className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 shadow-xs"
                          style={{
                            borderColor: `${st.color}50`,
                            backgroundColor: `${st.color}15`,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: st.color }}
                          />
                          <span className="font-semibold text-foreground">{st.name}</span>
                          {st.isInitial && (
                            <span className="text-[9px] uppercase font-mono bg-background/80 px-1 py-0.5 rounded text-muted-foreground">
                              Initial
                            </span>
                          )}
                          {st.isPublished && (
                            <span className="text-[9px] uppercase font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded">
                              Live
                            </span>
                          )}
                        </div>

                        {idx < wf.states.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Transition Rules & RBAC Permissions */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>Authorized State Transitions</span>
                  </h4>

                  {wf.transitions.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-3 border rounded-lg">
                      No transitions configured.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {wf.transitions.map((tr) => (
                        <div
                          key={tr.id}
                          className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{tr.fromState.name}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-primary">{tr.toState.name}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground">{tr.name}</div>
                          </div>

                          {tr.requiredPermission && (
                            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                              Requires: {tr.requiredPermission}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Workflow Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Editorial Workflow</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new content lifecycle and review process.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWorkflow} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="wfName" className="text-xs font-semibold">Workflow Name</Label>
              <Input
                id="wfName"
                placeholder="e.g. Legal Review Workflow"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wfDesc" className="text-xs font-semibold">Description</Label>
              <Input
                id="wfDesc"
                placeholder="Optional description..."
                value={newWorkflowDesc}
                onChange={(e) => setNewWorkflowDesc(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving || !newWorkflowName.trim()} className="font-semibold">
                {saving ? 'Creating...' : 'Create Workflow'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </ModuleGuard>
  );
}
