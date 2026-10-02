'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  Code2,
  Trash2,
  Edit,
  Mail,
  CheckCircle2,
  Inbox,
  Sparkles,
  Download,
  Filter,
  Check,
  Copy,
  Shield,
  Layers,
  ArrowUpDown,
  X,
  Send,
  Eye,
  Sliders,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { FormItem, FormField } from '@/app/api/v1/forms/route';
import type { FormSubmission } from '@/app/api/v1/forms/[id]/submissions/route';
import { ModuleGuard } from '@/components/module-guard';

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState<'forms' | 'inbox'>('forms');
  const [forms, setForms] = useState<FormItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('form_contact');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'REVIEWED' | 'SPAM'>('ALL');

  // Embed Modal
  const [embedModalForm, setEmbedModalForm] = useState<FormItem | null>(null);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);

  // Submission Detail Modal
  const [viewingSubmission, setViewingSubmission] = useState<FormSubmission | null>(null);

  // Form Builder Modal
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderForm, setBuilderForm] = useState<Partial<FormItem>>({
    name: '',
    slug: '',
    description: '',
    submitButtonText: 'Submit Form',
    successMessage: 'Thank you! Your submission has been received.',
    enableHoneypot: true,
    fields: [
      { id: 'f_1', name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { id: 'f_2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'jane@example.com' },
      { id: 'f_3', name: 'message', label: 'Your Message', type: 'textarea', required: false, placeholder: 'How can we help you?' },
    ],
  });

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/forms');
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms || []);
        if (data.forms?.length > 0 && !selectedFormId) {
          setSelectedFormId(data.forms[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (formId: string) => {
    try {
      const res = await fetch(`/api/v1/forms/${formId}/submissions?status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      fetchSubmissions(selectedFormId);
    }
  }, [selectedFormId, statusFilter, searchQuery]);

  const handleCreateOrUpdateForm = async () => {
    if (!builderForm.name || !builderForm.slug) return;
    try {
      const res = await fetch('/api/v1/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(builderForm),
      });
      if (res.ok) {
        setIsBuilderOpen(false);
        fetchForms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSubmissionStatus = async (subId: string, newStatus: 'REVIEWED' | 'SPAM') => {
    try {
      const res = await fetch(`/api/v1/forms/${selectedFormId}/submissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: subId, status: newStatus }),
      });
      if (res.ok) {
        fetchSubmissions(selectedFormId);
        if (viewingSubmission?.id === subId) {
          setViewingSubmission((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const allKeys = Array.from(new Set(submissions.flatMap((s) => Object.keys(s.data))));
    const headers = ['ID', 'Date', 'Status', 'IP', ...allKeys];
    const rows = submissions.map((s) => [
      s.id,
      new Date(s.createdAt).toISOString(),
      s.status,
      s.ipAddress,
      ...allKeys.map((k) => `"${(s.data[k] || '').toString().replace(/"/g, '""')}"`),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedFormId}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addFieldToBuilder = (type: FormField['type']) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      name: `field_${Date.now().toString().slice(-4)}`,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type,
      required: false,
      placeholder: '',
      options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    setBuilderForm((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }));
  };

  const removeFieldFromBuilder = (fieldId: string) => {
    setBuilderForm((prev) => ({
      ...prev,
      fields: prev.fields?.filter((f) => f.id !== fieldId),
    }));
  };

  const selectedForm = forms.find((f) => f.id === selectedFormId);

  return (
    <ModuleGuard moduleId="forms">
      <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <span>Forms &amp; Lead Submissions</span>
            </h1>
            <Badge variant="outline" className="text-[11px] font-mono border-primary/40 text-primary">
              Anti-Spam Honeypot
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Build custom forms, capture marketing leads, and manage customer inquiries with zero-overhead webhook syncing.
          </p>
        </div>

        {/* Tab Switcher & New Form CTA */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-muted rounded-lg">
            <Button
              size="sm"
              variant={activeTab === 'forms' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('forms')}
              className={cn('h-7.5 px-3 text-xs gap-1.5 cursor-pointer', activeTab === 'forms' && 'bg-background shadow-xs font-semibold')}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Forms ({forms.length})</span>
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'inbox' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('inbox')}
              className={cn('h-7.5 px-3 text-xs gap-1.5 cursor-pointer', activeTab === 'inbox' && 'bg-background shadow-xs font-semibold')}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>Submissions Inbox</span>
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setBuilderForm({
                name: 'New Contact Form',
                slug: `form-${Date.now().toString().slice(-4)}`,
                description: 'Customer inquiry and lead generation form.',
                submitButtonText: 'Submit Inquiry',
                successMessage: 'Thank you! We will get back to you shortly.',
                enableHoneypot: true,
                fields: [
                  { id: 'f_1', name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Alex Smith' },
                  { id: 'f_2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'alex@example.com' },
                  { id: 'f_3', name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Your message...' },
                ],
              });
              setIsBuilderOpen(true);
            }}
            className="gap-1.5 h-8 text-xs shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Form</span>
          </Button>
        </div>
      </div>

      {/* ── Key Metrics Overview ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Active Forms</div>
          <div className="text-2xl font-bold text-foreground">{forms.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Ready to embed</div>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Total Inquiries</div>
          <div className="text-2xl font-bold text-foreground">
            {forms.reduce((acc, f) => acc + f.submissionCount, 0)}
          </div>
          <div className="text-[11px] text-muted-foreground">All time submissions</div>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Unread Leads</div>
          <div className="text-2xl font-bold text-blue-600">
            {forms.reduce((acc, f) => acc + f.unreadCount, 0)}
          </div>
          <div className="text-[11px] text-blue-500 font-medium">Awaiting follow-up</div>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Avg Conversion</div>
          <div className="text-2xl font-bold text-emerald-600">9.8%</div>
          <div className="text-[11px] text-emerald-600 font-medium">+2.1% from last month</div>
        </Card>
      </div>

      {/* ── TAB 1: Forms List ──────────────────────────────────────────────── */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forms.map((f) => (
            <Card key={f.id} className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs group">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                    {f.status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {f.fields.length} {f.fields.length === 1 ? 'Field' : 'Fields'}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                  {f.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {f.description || 'Custom lead capture form.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs border">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Submissions</span>
                    <span className="font-bold text-sm text-foreground">{f.submissionCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Unread</span>
                    <span className="font-bold text-sm text-blue-600">{f.unreadCount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedFormId(f.id);
                      setActiveTab('inbox');
                    }}
                    className="flex-1 text-xs h-8 gap-1.5 cursor-pointer"
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    <span>Inquiries</span>
                    {f.unreadCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                        {f.unreadCount}
                      </span>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEmbedModalForm(f)}
                    className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Get Embed Code"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Embed</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 2: Submissions Inbox ───────────────────────────────────────── */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card rounded-xl border">
            {/* Form Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Select Form:</Label>
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="h-8 text-xs bg-background border rounded-lg px-2 text-foreground font-medium focus:outline-none"
              >
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.submissionCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter & Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Selector */}
              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                {(['ALL', 'NEW', 'REVIEWED', 'SPAM'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      'px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                      statusFilter === st ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 w-44 sm:w-56"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="h-8 text-xs gap-1.5 cursor-pointer"
                title="Download submissions as CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Submissions Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3 pl-4">Status</th>
                    <th className="p-3">Primary Contact</th>
                    <th className="p-3">Summary Preview</th>
                    <th className="p-3">Submitted At</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground">
                        <Inbox className="h-6 w-6 mx-auto mb-2 opacity-30" />
                        <p>No submissions found for this form filter.</p>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const email = sub.data.workEmail || sub.data.email || '—';
                      const name = sub.data.fullName || sub.data.name || 'Anonymous';
                      const preview = sub.data.message || sub.data.notes || sub.data.company || JSON.stringify(sub.data);

                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setViewingSubmission(sub)}
                          className={cn(
                            'hover:bg-muted/40 cursor-pointer transition-colors',
                            sub.status === 'NEW' && 'bg-primary/5 font-medium'
                          )}
                        >
                          <td className="p-3 pl-4">
                            <Badge
                              variant={
                                sub.status === 'NEW'
                                  ? 'default'
                                  : sub.status === 'REVIEWED'
                                  ? 'success'
                                  : 'destructive'
                              }
                              className="text-[10px] uppercase font-semibold"
                            >
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{email}</div>
                          </td>
                          <td className="p-3 max-w-xs truncate text-muted-foreground">
                            {preview}
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingSubmission(sub);
                              }}
                              className="h-7 text-xs text-primary"
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Submission Detail Drawer Modal ─────────────────────────────────── */}
      {viewingSubmission && (
        <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between pb-1">
                <Badge variant={viewingSubmission.status === 'NEW' ? 'default' : 'success'} className="text-[10px] uppercase">
                  {viewingSubmission.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(viewingSubmission.createdAt).toLocaleString()}
                </span>
              </div>
              <DialogTitle className="text-base font-bold">
                Inquiry from {viewingSubmission.data.fullName || viewingSubmission.data.name || 'Visitor'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submitted through {selectedForm?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                {Object.entries(viewingSubmission.data).map(([key, val]) => (
                  <div key={key} className="space-y-0.5 text-xs">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">{key}:</span>
                    <div className="text-foreground whitespace-pre-line p-2 rounded bg-background border">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Network Metadata */}
              <div className="p-3 rounded-lg border bg-muted/10 text-[11px] text-muted-foreground space-y-1 font-mono">
                <div>IP Address: {viewingSubmission.ipAddress}</div>
                <div className="truncate">Referrer: {viewingSubmission.referrer || 'Direct Entry'}</div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
              <div className="flex items-center gap-1.5">
                {viewingSubmission.status !== 'REVIEWED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateSubmissionStatus(viewingSubmission.id, 'REVIEWED')}
                    className="h-8 text-xs text-emerald-600 gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Reviewed</span>
                  </Button>
                )}
                {viewingSubmission.status !== 'SPAM' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateSubmissionStatus(viewingSubmission.id, 'SPAM')}
                    className="h-8 text-xs text-destructive gap-1"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Mark Spam</span>
                  </Button>
                )}
              </div>
              <Button size="sm" onClick={() => setViewingSubmission(null)} className="h-8 text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Form Builder Modal ─────────────────────────────────────────────── */}
      {isBuilderOpen && (
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Custom Form Builder</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure form fields, spam honeypot rules, and validation triggers.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-3">
              {/* Left Column: Form Settings & Fields Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Form Title</Label>
                  <Input
                    value={builderForm.name}
                    onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                    placeholder="e.g. Enterprise Sales Inquiry"
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Form URL Slug</Label>
                  <Input
                    value={builderForm.slug}
                    onChange={(e) => setBuilderForm({ ...builderForm, slug: e.target.value })}
                    placeholder="e.g. enterprise-contact"
                    className="text-xs h-8 font-mono"
                  />
                </div>

                {/* Add Field Types Toolbar */}
                <div className="space-y-1.5 pt-2 border-t">
                  <Label className="text-xs font-semibold">Add Form Field</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['text', 'email', 'tel', 'textarea', 'select', 'number'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addFieldToBuilder(type)}
                        className="h-7 text-xs px-2 gap-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Fields List */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold">Configured Fields ({builderForm.fields?.length || 0})</Label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {builderForm.fields?.map((f, i) => (
                      <div key={f.id} className="p-2.5 rounded-lg border bg-muted/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-xs">{f.label}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                              {f.type}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => removeFieldFromBuilder(f.id)}
                              className="p-1 rounded text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Field Label"
                            value={f.label}
                            onChange={(e) => {
                              const updated = [...(builderForm.fields || [])];
                              updated[i].label = e.target.value;
                              setBuilderForm({ ...builderForm, fields: updated });
                            }}
                            className="text-xs h-7"
                          />
                          <Input
                            placeholder="Field Key"
                            value={f.name}
                            onChange={(e) => {
                              const updated = [...(builderForm.fields || [])];
                              updated[i].name = e.target.value;
                              setBuilderForm({ ...builderForm, fields: updated });
                            }}
                            className="text-xs h-7 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Visual Form Preview */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-semibold text-foreground">Live Form Preview</span>
                  <Badge variant="outline" className="text-[10px]">Client Preview</Badge>
                </div>

                <div className="space-y-3 bg-card p-4 rounded-xl border shadow-xs">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">{builderForm.name || 'Untitled Form'}</h3>
                    <p className="text-xs text-muted-foreground">{builderForm.description || 'Fill out the form below.'}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {builderForm.fields?.map((f) => (
                      <div key={f.id} className="space-y-1">
                        <Label className="text-xs font-medium">
                          {f.label} {f.required && <span className="text-destructive">*</span>}
                        </Label>
                        {f.type === 'textarea' ? (
                          <textarea
                            disabled
                            placeholder={f.placeholder}
                            className="w-full h-16 rounded-md border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground"
                          />
                        ) : f.type === 'select' ? (
                          <select disabled className="w-full h-8 rounded-md border bg-muted/20 px-2 text-xs text-muted-foreground">
                            {f.options?.map((opt) => <option key={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <Input disabled placeholder={f.placeholder} className="h-8 text-xs bg-muted/20" />
                        )}
                      </div>
                    ))}

                    <Button disabled className="w-full h-8 text-xs mt-2">
                      {builderForm.submitButtonText || 'Submit'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setIsBuilderOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateOrUpdateForm} className="h-8 text-xs shadow-xs">
                Save &amp; Activate Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Embed Code Modal ──────────────────────────────────────────────── */}
      {embedModalForm && (
        <Dialog open={!!embedModalForm} onOpenChange={() => setEmbedModalForm(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Embed Form: {embedModalForm.name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Copy and paste this snippet directly into your frontend website or landing page.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">HTML &amp; REST Endpoint Snippet</Label>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-neutral-950 text-neutral-100 font-mono text-[11px] overflow-x-auto">
                    {`<form action="${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/forms/${embedModalForm.id}/submissions" method="POST">
  <!-- Anti-spam Honeypot -->
  <input type="text" name="_honeypot" style="display:none" tabindex="-1" autocomplete="off" />

${embedModalForm.fields
  .map(
    (f) => `  <label>${f.label}</label>
  <input type="${f.type}" name="${f.name}" ${f.required ? 'required' : ''} />`
  )
  .join('\n')}

  <button type="submit">${embedModalForm.submitButtonText}</button>
</form>`}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const snippet = `<form action="${window.location.origin}/api/v1/forms/${embedModalForm.id}/submissions" method="POST">\n...\n</form>`;
                      navigator.clipboard.writeText(snippet);
                      setEmbedCodeCopied(true);
                      setTimeout(() => setEmbedCodeCopied(false), 2000);
                    }}
                    className="absolute top-2 right-2 h-7 text-[10px] gap-1"
                  >
                    {embedCodeCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{embedCodeCopied ? 'Copied' : 'Copy HTML'}</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setEmbedModalForm(null)} className="h-8 text-xs">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </ModuleGuard>
  );
}
