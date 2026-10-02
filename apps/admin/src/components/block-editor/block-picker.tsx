'use client';

import React, { useState } from 'react';
import { BLOCK_DEFINITIONS, type BlockType, type BlockDefinition } from '@headless/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pilcrow,
  Heading,
  FileText,
  List,
  Quote,
  Code,
  Image as ImageIcon,
  Images,
  Video,
  Music,
  Paperclip,
  SquarePlay,
  Link as LinkIcon,
  Table,
  Minus,
  Maximize2,
  Columns,
  LayoutGrid,
  Sparkles,
  Megaphone,
  ChevronDown,
  FolderKanban,
  ExternalLink,
  FileCode,
  Sliders,
  Search,
  X,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Pilcrow,
  Heading,
  FileText,
  List,
  Quote,
  Code,
  Image: ImageIcon,
  Images,
  Video,
  Music,
  Paperclip,
  SquarePlay,
  Link: LinkIcon,
  Table,
  Minus,
  Maximize2,
  Columns,
  LayoutGrid,
  Sparkles,
  Megaphone,
  ChevronDown,
  FolderKanban,
  ExternalLink,
  FileCode,
  Sliders,
};

interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType, defaultData: Record<string, unknown>) => void;
}

export function BlockPicker({ isOpen, onClose, onSelectBlock }: BlockPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Blocks' },
    { id: 'layout', label: 'Layout & Hero' },
    { id: 'typography', label: 'Typography' },
    { id: 'interactive', label: 'Interactive' },
    { id: 'media', label: 'Media' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const filteredBlocks = BLOCK_DEFINITIONS.filter((b) => {
    const matchesSearch =
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base">Insert Visual Block</CardTitle>
            <CardDescription className="text-xs">Choose from 25+ production-grade modular components</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="p-4 border-b space-y-3 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blocks (hero, columns, accordion, quote, image, cta...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBlocks.map((b) => {
              const Icon = ICON_MAP[b.icon] || FileText;
              return (
                <button
                  key={b.type}
                  onClick={() => {
                    onSelectBlock(b.type, b.defaultData);
                    onClose();
                  }}
                  className="flex flex-col text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-xs text-foreground">{b.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
