'use client';

import React, { useState } from 'react';
import type { BlockNode, BlockType } from '@headless/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlockPicker } from './block-picker';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  Settings,
  GripVertical,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface BlockEditorProps {
  blocks: BlockNode[];
  onChange: (blocks: BlockNode[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const openPicker = (index?: number) => {
    setInsertIndex(index !== undefined ? index : blocks.length);
    setIsPickerOpen(true);
  };

  const handleAddBlock = (type: BlockType, defaultData: Record<string, unknown>) => {
    const newBlock: BlockNode = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      data: JSON.parse(JSON.stringify(defaultData)),
    };

    const targetIdx = insertIndex !== null ? insertIndex : blocks.length;
    const updated = [...blocks];
    updated.splice(targetIdx, 0, newBlock);
    onChange(updated);
  };

  const handleUpdateBlockData = (id: string, key: string, value: unknown) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, data: { ...b.data, [key]: value } };
      }
      return b;
    });
    onChange(updated);
  };

  const handleUploadBlockImage = async (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBlockId(blockId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('seoName', file.name.replace(/\.[^/.]+$/, ''));

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const uploadedUrl = data.assets?.[0]?.publicUrl || data.assets?.[0]?.variants?.[0]?.publicUrl;
      if (uploadedUrl) {
        handleUpdateBlockData(blockId, 'url', uploadedUrl);
        const curr = blocks.find((b) => b.id === blockId);
        if (!curr?.data.alt) {
          handleUpdateBlockData(blockId, 'alt', file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingBlockId(null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  const handleDuplicate = (index: number) => {
    const original = blocks[index];
    const copy: BlockNode = {
      ...JSON.parse(JSON.stringify(original)),
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, copy);
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border p-12 text-center bg-card/40">
          <Sparkles className="mx-auto h-8 w-8 text-primary/60 mb-2" />
          <h3 className="font-semibold text-sm text-foreground">Canvas is currently empty</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Build this layout using visual blocks like Hero, Features Grid, Call to Action, and Typography.
          </p>
          <Button onClick={() => openPicker(0)} size="sm" className="gap-1.5 font-medium">
            <Plus className="h-4 w-4" />
            <span>Add First Block</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/40 group relative"
            >
              {/* Block Header Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 rounded-t-lg text-xs">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 cursor-grab" />
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    {block.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">#{block.id.slice(-6)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Move block up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === blocks.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Move block down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(index)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Duplicate block"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(block.id)}
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    title="Delete block"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Block Content Editor */}
              <div className="p-4">
                {/* 1. HERO */}
                {block.type === 'hero' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Badge Text</label>
                        <Input
                          value={String(block.data.badge || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'badge', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="e.g. New Announcement"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Main Title</label>
                        <Input
                          value={String(block.data.title || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'title', e.target.value)}
                          className="h-8 text-xs font-semibold"
                          placeholder="Hero headline"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Subtitle</label>
                      <textarea
                        value={String(block.data.subtitle || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'subtitle', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Hero supporting description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex gap-2">
                        <Input
                          value={String((block.data.primaryCta as any)?.label || '')}
                          onChange={(e) =>
                            handleUpdateBlockData(block.id, 'primaryCta', {
                              ...(block.data.primaryCta as any),
                              label: e.target.value,
                            })
                          }
                          placeholder="Primary CTA Label"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={String((block.data.primaryCta as any)?.url || '')}
                          onChange={(e) =>
                            handleUpdateBlockData(block.id, 'primaryCta', {
                              ...(block.data.primaryCta as any),
                              url: e.target.value,
                            })
                          }
                          placeholder="URL"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={String((block.data.secondaryCta as any)?.label || '')}
                          onChange={(e) =>
                            handleUpdateBlockData(block.id, 'secondaryCta', {
                              ...(block.data.secondaryCta as any),
                              label: e.target.value,
                            })
                          }
                          placeholder="Secondary CTA Label"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={String((block.data.secondaryCta as any)?.url || '')}
                          onChange={(e) =>
                            handleUpdateBlockData(block.id, 'secondaryCta', {
                              ...(block.data.secondaryCta as any),
                              url: e.target.value,
                            })
                          }
                          placeholder="URL"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. HEADING */}
                {block.type === 'heading' && (
                  <div className="flex items-center gap-3">
                    <select
                      value={Number(block.data.level) || 2}
                      onChange={(e) => handleUpdateBlockData(block.id, 'level', parseInt(e.target.value, 10))}
                      className="h-8 w-20 rounded-md border bg-background px-2 text-xs font-semibold"
                    >
                      <option value={1}>H1</option>
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                      <option value={4}>H4</option>
                      <option value={5}>H5</option>
                      <option value={6}>H6</option>
                    </select>
                    <Input
                      value={String(block.data.text || '')}
                      onChange={(e) => handleUpdateBlockData(block.id, 'text', e.target.value)}
                      placeholder="Heading text..."
                      className="h-8 text-xs font-semibold flex-1"
                    />
                  </div>
                )}

                {/* 3. PARAGRAPH */}
                {block.type === 'paragraph' && (
                  <textarea
                    value={String(block.data.text || '')}
                    onChange={(e) => handleUpdateBlockData(block.id, 'text', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    placeholder="Write body paragraph text..."
                  />
                )}

                {/* 4. CARDS */}
                {block.type === 'cards' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Card Items</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const items = (block.data.items as any[]) || [];
                          handleUpdateBlockData(block.id, 'items', [
                            ...items,
                            { title: `Card ${items.length + 1}`, description: 'Feature description', icon: 'Star' },
                          ]);
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Card</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {((block.data.items as any[]) || []).map((card, idx) => (
                        <div key={idx} className="p-2.5 rounded border bg-background/50 space-y-2 text-xs">
                          <Input
                            value={card.title}
                            onChange={(e) => {
                              const items = [...(block.data.items as any[])];
                              items[idx].title = e.target.value;
                              handleUpdateBlockData(block.id, 'items', items);
                            }}
                            placeholder="Card Title"
                            className="h-7 text-xs font-semibold"
                          />
                          <textarea
                            value={card.description}
                            onChange={(e) => {
                              const items = [...(block.data.items as any[])];
                              items[idx].description = e.target.value;
                              handleUpdateBlockData(block.id, 'items', items);
                            }}
                            rows={2}
                            placeholder="Card description"
                            className="w-full rounded border bg-background p-1.5 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. QUOTE */}
                {block.type === 'quote' && (
                  <div className="space-y-2">
                    <textarea
                      value={String(block.data.quote || '')}
                      onChange={(e) => handleUpdateBlockData(block.id, 'quote', e.target.value)}
                      rows={2}
                      className="w-full rounded-md border bg-background p-2.5 text-xs italic focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="“Enter inspirational quote or testimonial...”"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={String(block.data.author || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'author', e.target.value)}
                        placeholder="Author Name"
                        className="h-7 text-xs"
                      />
                      <Input
                        value={String(block.data.role || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'role', e.target.value)}
                        placeholder="Author Role / Company"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 6. CALL TO ACTION (CTA) */}
                {block.type === 'cta' && (
                  <div className="space-y-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                    <Input
                      value={String(block.data.title || '')}
                      onChange={(e) => handleUpdateBlockData(block.id, 'title', e.target.value)}
                      placeholder="CTA Headline"
                      className="h-8 text-xs font-bold"
                    />
                    <Input
                      value={String(block.data.description || '')}
                      onChange={(e) => handleUpdateBlockData(block.id, 'description', e.target.value)}
                      placeholder="Supporting text..."
                      className="h-8 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Input
                        value={String(block.data.buttonText || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'buttonText', e.target.value)}
                        placeholder="Button Text"
                        className="h-8 text-xs font-semibold"
                      />
                      <Input
                        value={String(block.data.buttonUrl || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'buttonUrl', e.target.value)}
                        placeholder="Button Target URL"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 7. ACCORDION */}
                {block.type === 'accordion' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Accordion Panels</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const items = (block.data.items as any[]) || [];
                          handleUpdateBlockData(block.id, 'items', [
                            ...items,
                            { title: `Question ${items.length + 1}`, content: 'Answer text' },
                          ]);
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Item</span>
                      </Button>
                    </div>
                    {((block.data.items as any[]) || []).map((item, idx) => (
                      <div key={idx} className="p-2 border rounded bg-background/40 space-y-1.5 text-xs">
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const items = [...(block.data.items as any[])];
                            items[idx].title = e.target.value;
                            handleUpdateBlockData(block.id, 'items', items);
                          }}
                          placeholder="Panel Header / Question"
                          className="h-7 text-xs font-medium"
                        />
                        <textarea
                          value={item.content}
                          onChange={(e) => {
                            const items = [...(block.data.items as any[])];
                            items[idx].content = e.target.value;
                            handleUpdateBlockData(block.id, 'items', items);
                          }}
                          rows={2}
                          placeholder="Panel Content / Answer"
                          className="w-full rounded border bg-background p-1.5 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 8. CODE */}
                {block.type === 'code' && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center gap-2">
                      <Input
                        value={String(block.data.language || 'typescript')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'language', e.target.value)}
                        placeholder="Language (e.g. tsx, python, json)"
                        className="h-7 w-40 text-xs"
                      />
                      <Input
                        value={String(block.data.filename || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'filename', e.target.value)}
                        placeholder="Optional filename"
                        className="h-7 text-xs flex-1"
                      />
                    </div>
                    <textarea
                      value={String(block.data.code || '')}
                      onChange={(e) => handleUpdateBlockData(block.id, 'code', e.target.value)}
                      rows={5}
                      className="w-full rounded-md border bg-zinc-950 text-zinc-100 p-3 text-xs focus:outline-none"
                      placeholder="// Enter code here..."
                    />
                  </div>
                )}

                {/* 9. IMAGE */}
                {block.type === 'image' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      id={`img_input_${block.id}`}
                      accept="image/*"
                      onChange={(e) => handleUploadBlockImage(block.id, e)}
                      className="hidden"
                    />

                    {/* Image Preview & Upload Controls */}
                    <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg border bg-muted/20">
                      <div className="h-20 w-32 rounded-md border border-dashed bg-background flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
                        {block.data.url ? (
                          <img
                            src={String(block.data.url)}
                            alt={String(block.data.alt || 'Preview')}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground/60">
                            <ImageIcon className="h-6 w-6 mb-1" />
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={uploadingBlockId === block.id}
                            onClick={() => {
                              const el = document.getElementById(`img_input_${block.id}`) as HTMLInputElement;
                              el?.click();
                            }}
                            className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
                          >
                            <Upload className={`h-3.5 w-3.5 ${uploadingBlockId === block.id ? 'animate-spin' : ''}`} />
                            <span>{uploadingBlockId === block.id ? 'Uploading...' : block.data.url ? 'Change Image' : 'Upload Image'}</span>
                          </Button>

                          {block.data.url ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateBlockData(block.id, 'url', '')}
                              className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Clear</span>
                            </Button>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Direct upload converts to auto-cropped WebP via DAM Pipeline.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Image URL / Source</label>
                      <Input
                        value={String(block.data.url || '')}
                        onChange={(e) => handleUpdateBlockData(block.id, 'url', e.target.value)}
                        placeholder="https://... or /uploads/..."
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Alt Text (Accessibility & SEO)</label>
                        <Input
                          value={String(block.data.alt || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'alt', e.target.value)}
                          placeholder="Descriptive alt text"
                          className="h-7 text-xs mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Caption / Subtitle</label>
                        <Input
                          value={String(block.data.caption || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'caption', e.target.value)}
                          placeholder="Photo credits or caption"
                          className="h-7 text-xs mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback JSON / Generic Text for other block types */}
                {!['hero', 'heading', 'paragraph', 'cards', 'quote', 'cta', 'accordion', 'code', 'image'].includes(block.type) && (
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Block Data (JSON)</label>
                    <textarea
                      value={JSON.stringify(block.data, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          const updated = blocks.map((b) => (b.id === block.id ? { ...b, data: parsed } : b));
                          onChange(updated);
                        } catch {
                          // Allow typing partial json
                        }
                      }}
                      rows={4}
                      className="w-full rounded border bg-background p-2 font-mono text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Add Block Between separator button */}
              <div className="flex justify-center -mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openPicker(index + 1)}
                  className="h-6 px-2 text-[10px] gap-1 bg-card rounded-full shadow-sm border border-primary/30 text-primary"
                >
                  <Plus className="h-3 w-3" />
                  <span>Insert Block Here</span>
                </Button>
              </div>
            </div>
          ))}

          {/* Bottom Add Block Trigger */}
          <div className="pt-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPicker(blocks.length)}
              className="gap-1.5 text-xs font-semibold border-dashed"
            >
              <Plus className="h-4 w-4" />
              <span>Add Visual Block</span>
            </Button>
          </div>
        </div>
      )}

      {/* Block Picker Modal */}
      <BlockPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectBlock={handleAddBlock}
      />
    </div>
  );
}
