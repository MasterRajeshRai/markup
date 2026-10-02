'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Boxes,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FieldInput {
  name: string;
  apiId: string;
  type: string;
  isRequired: boolean;
  helpText: string;
}

interface ContentTypeItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isSingle: boolean;
  entriesCount: number;
  fields: Array<{ id: string; name: string; apiId: string; type: string; isRequired: boolean }>;
}

const FIELD_TYPES = [
  'text',
  'longtext',
  'richtext',
  'number',
  'boolean',
  'date',
  'email',
  'url',
  'color',
  'select',
  'media',
  'json',
  'markdown',
  'code',
];

const MOCK_CONTENT_TYPES: ContentTypeItem[] = [
  {
    id: 'ct_articles',
    name: 'Articles (Blog Posts)',
    slug: 'articles',
    description: 'News, editorial blog posts, and technical articles with SEO optimization and visual blocks.',
    icon: 'BookOpen',
    isSingle: false,
    entriesCount: 3,
    fields: [
      { id: 'f_summary', name: 'Summary Excerpt', apiId: 'summary', type: 'longtext', isRequired: true },
      { id: 'f_byline', name: 'Author Byline', apiId: 'byline', type: 'text', isRequired: false },
      { id: 'f_read_time', name: 'Read Time (Minutes)', apiId: 'read_time', type: 'number', isRequired: false },
      { id: 'f_featured', name: 'Featured Story', apiId: 'is_featured', type: 'boolean', isRequired: false },
      { id: 'f_image', name: 'Featured Banner Image', apiId: 'featured_image', type: 'media', isRequired: false },
    ],
  },
  {
    id: 'ct_pages',
    name: 'Pages',
    slug: 'pages',
    description: 'Dynamic visual landing and marketing pages composed with nested block sections.',
    icon: 'FileCode',
    isSingle: false,
    entriesCount: 2,
    fields: [
      { id: 'f_p_summary', name: 'Summary Excerpt', apiId: 'excerpt', type: 'longtext', isRequired: false },
      { id: 'f_p_template', name: 'Template Style', apiId: 'template', type: 'select', isRequired: false },
      { id: 'f_p_image', name: 'Featured Image', apiId: 'featured_image', type: 'media', isRequired: false },
    ],
  },
  {
    id: 'ct_products',
    name: 'Products',
    slug: 'products',
    description: 'E-commerce and SaaS product catalogue entries with SKU and pricing.',
    icon: 'Package',
    isSingle: false,
    entriesCount: 4,
    fields: [
      { id: 'f_price', name: 'Price USD', apiId: 'price', type: 'decimal', isRequired: true },
      { id: 'f_sku', name: 'SKU Identifier', apiId: 'sku', type: 'text', isRequired: true },
      { id: 'f_stock', name: 'Stock Count', apiId: 'stock', type: 'number', isRequired: false },
    ],
  },
];

export default function ContentTypesPage() {
  const [types, setTypes] = useState<ContentTypeItem[]>(MOCK_CONTENT_TYPES);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSingle, setIsSingle] = useState(false);
  const [fields, setFields] = useState<FieldInput[]>([
    { name: 'Summary', apiId: 'summary', type: 'longtext', isRequired: false, helpText: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = () => {
    fetch('/api/v1/content-types')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTypes(res.data);
        } else {
          setTypes(MOCK_CONTENT_TYPES);
        }
        setLoading(false);
      })
      .catch(() => {
        setTypes(MOCK_CONTENT_TYPES);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: 'New Field', apiId: `field_${fields.length + 1}`, type: 'text', isRequired: false, helpText: '' },
    ]);
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx: number, key: keyof FieldInput, value: any) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], [key]: value };
    if (key === 'name') {
      updated[idx].apiId = value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/v1/content-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        description,
        isSingle,
        fields,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create content model');
      return;
    }

    setIsModalOpen(false);
    setName('');
    setSlug('');
    setDescription('');
    fetchTypes();
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete content type "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/v1/content-types/${slug}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to delete');
      return;
    }
    fetchTypes();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Type Builder</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Define content models, field schemas, relationships, and publishing rules.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Content Model</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Loading content models...
          </div>
        ) : (
          types.map((ct) => (
            <Card key={ct.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {ct.slug}
                  </Badge>
                  <Badge variant={ct.isSingle ? 'secondary' : 'default'} className="text-[10px]">
                    {ct.isSingle ? 'Single Type' : 'Collection'}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{ct.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {ct.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-md border bg-muted/20 p-2.5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-muted-foreground flex justify-between">
                    <span>Configured Fields</span>
                    <span>{ct.fields?.length || 0} fields</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(ct.fields || []).slice(0, 5).map((f) => (
                      <span
                        key={f.apiId}
                        className="px-1.5 py-0.5 rounded bg-background border text-[10px] font-mono text-muted-foreground"
                      >
                        {f.name}
                      </span>
                    ))}
                    {(ct.fields || []).length > 5 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{ct.fields.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground font-medium">{ct.entriesCount} entries</span>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/content?type=${ct.slug}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <span>Entries</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ct.slug, ct.name)}
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      title="Delete model"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal: New Content Model */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <CardHeader className="border-b">
              <CardTitle>Create New Content Model</CardTitle>
              <CardDescription>Define the schema attributes and dynamic fields</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <CardContent className="space-y-4 p-6 flex-1">
                {error && (
                  <div className="text-xs text-destructive bg-destructive/15 p-3 rounded border border-destructive/30">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Model Name</label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Case Study"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">API Slug</label>
                    <Input
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. case-studies"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this content model..."
                  />
                </div>

                {/* Field Builder */}
                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Content Fields</h4>
                      <p className="text-[11px] text-muted-foreground">Define attributes for this content type</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddField} className="h-7 text-xs gap-1">
                      <Plus className="h-3 w-3" />
                      <span>Add Field</span>
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {fields.map((f, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-background/50 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Input
                            value={f.name}
                            onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                            placeholder="Field Label"
                            className="h-8 flex-1 text-xs"
                          />
                          <Input
                            value={f.apiId}
                            onChange={(e) => handleFieldChange(idx, 'apiId', e.target.value)}
                            placeholder="api_key"
                            className="h-8 w-36 text-xs font-mono"
                          />
                          <select
                            value={f.type}
                            onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                            className="h-8 rounded border bg-background px-2 text-xs font-semibold"
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-[11px]">
                            <input
                              type="checkbox"
                              checked={f.isRequired}
                              onChange={(e) => handleFieldChange(idx, 'isRequired', e.target.checked)}
                            />
                            Required
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveField(idx)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create Content Model
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
