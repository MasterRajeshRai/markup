'use client';

import React, { useState, useRef, useMemo } from 'react';
import type { BlockNode, BlockType } from '@headless/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlockPicker } from './block-picker';
import { cn } from '@/lib/utils';
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
  ChevronUp,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
  Code as CodeIcon,
  FileCode,
  Terminal,
  Eye,
  Edit3,
  Check,
  CheckCheck,
  Bold,
  Italic,
  Link as LinkIcon,
  Maximize2,
  Pilcrow,
  Heading as HeadingIcon,
  Quote as QuoteIcon,
  Layers,
  Sparkle,
  Monitor,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  List as ListIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreVertical,
  CornerDownRight,
  HelpCircle,
} from 'lucide-react';

export type CodeThemeStyle = 'vscode' | 'terminal' | 'github' | 'dracula' | 'monokai';

interface ProgramStyleConfig {
  id: CodeThemeStyle;
  name: string;
  badge: string;
  bgClass: string;
  headerBg: string;
  borderClass: string;
  textColor: string;
  lineNumClass: string;
  dotsStyle: 'macos' | 'terminal' | 'minimal';
}

const PROGRAM_STYLES: ProgramStyleConfig[] = [
  {
    id: 'vscode',
    name: 'VS Code Dark',
    badge: 'Modern Dark',
    bgClass: 'bg-[#181825]',
    headerBg: 'bg-[#11111b] border-b border-[#313244]',
    borderClass: 'border-[#313244]',
    textColor: 'text-[#cdd6f4]',
    lineNumClass: 'text-[#585b70] bg-[#11111b]/40 border-r border-[#313244]/80',
    dotsStyle: 'macos',
  },
  {
    id: 'terminal',
    name: 'Mac Terminal',
    badge: 'Hacker Shell',
    bgClass: 'bg-black',
    headerBg: 'bg-zinc-900 border-b border-zinc-800',
    borderClass: 'border-zinc-800',
    textColor: 'text-emerald-400',
    lineNumClass: 'text-zinc-600 bg-zinc-950/80 border-r border-zinc-800',
    dotsStyle: 'macos',
  },
  {
    id: 'github',
    name: 'GitHub Light',
    badge: 'Clean Minimal',
    bgClass: 'bg-slate-50',
    headerBg: 'bg-slate-100 border-b border-slate-200',
    borderClass: 'border-slate-300',
    textColor: 'text-slate-900',
    lineNumClass: 'text-slate-400 bg-slate-200/50 border-r border-slate-200',
    dotsStyle: 'minimal',
  },
  {
    id: 'dracula',
    name: 'Dracula Neon',
    badge: 'Cyberpunk',
    bgClass: 'bg-[#282a36]',
    headerBg: 'bg-[#21222c] border-b border-purple-500/20',
    borderClass: 'border-purple-500/30',
    textColor: 'text-[#f8f8f2]',
    lineNumClass: 'text-[#6272a4] bg-[#21222c]/50 border-r border-purple-500/20',
    dotsStyle: 'macos',
  },
  {
    id: 'monokai',
    name: 'Monokai Warm',
    badge: 'Classic Retro',
    bgClass: 'bg-[#272822]',
    headerBg: 'bg-[#1e1f1c] border-b border-amber-500/20',
    borderClass: 'border-amber-500/25',
    textColor: 'text-[#f8f8f2]',
    lineNumClass: 'text-[#75715e] bg-[#1e1f1c]/50 border-r border-amber-500/20',
    dotsStyle: 'macos',
  },
];

const PROGRAM_LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML / XML' },
  { value: 'css', label: 'CSS / SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'bash', label: 'Shell / Bash' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'graphql', label: 'GraphQL' },
];

/**
 * High-performance, lightweight syntax highlighting tokenizer.
 * Formats tokens with the appropriate theme colors.
 */
function highlightCodeTokens(lineText: string, theme: CodeThemeStyle) {
  if (!lineText) return <span>&nbsp;</span>;

  // Single line comments
  if (lineText.trim().startsWith('//') || lineText.trim().startsWith('#')) {
    const commentClass =
      theme === 'vscode'
        ? 'text-[#6c7086] italic'
        : theme === 'terminal'
        ? 'text-zinc-600 italic'
        : theme === 'github'
        ? 'text-[#6e7781] italic'
        : theme === 'dracula'
        ? 'text-[#6272a4] italic'
        : 'text-[#75715e] italic';
    return <span className={commentClass}>{lineText}</span>;
  }

  const tokenRegex =
    /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\b(?:import|export|from|default|const|let|var|function|return|class|if|else|switch|case|break|for|while|do|async|await|try|catch|finally|throw|new|typeof|instanceof|this|super|def|lambda|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|GROUP|BY|ORDER|HAVING|public|private|protected|interface|type|extends|implements|enum|package|namespace)\b|\b(?:\d+(?:\.\d+)?|true|false|null|undefined|None|True|False)\b|\b(?:string|number|boolean|any|void|never|unknown|object|Promise|Record|Array|Map|Set|int|float|str|bool|dict|list)\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()|(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%<>=!&|^~?:])|[^\s"'\w]+|\s+|\w+)/g;

  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = tokenRegex.exec(lineText)) !== null) {
    const text = match[0];
    keyIndex++;

    // Strings
    if (/^(".*"|'.*'|`.*`)$/.test(text)) {
      const cls =
        theme === 'vscode'
          ? 'text-[#a6e3a1]'
          : theme === 'terminal'
          ? 'text-lime-300'
          : theme === 'github'
          ? 'text-[#0a3069]'
          : theme === 'dracula'
          ? 'text-[#f1fa8c]'
          : 'text-[#e6db74]';
      elements.push(<span key={keyIndex} className={cls}>{text}</span>);
    }
    // Keywords
    else if (
      /^\b(import|export|from|default|const|let|var|function|return|class|if|else|switch|case|break|for|while|do|async|await|try|catch|finally|throw|new|typeof|instanceof|this|super|def|lambda|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|GROUP|BY|ORDER|HAVING|public|private|protected|interface|type|extends|implements|enum|package|namespace)\b$/.test(
        text
      )
    ) {
      const cls =
        theme === 'vscode'
          ? 'text-[#cba6f7] font-semibold'
          : theme === 'terminal'
          ? 'text-emerald-400 font-bold'
          : theme === 'github'
          ? 'text-[#cf222e] font-semibold'
          : theme === 'dracula'
          ? 'text-[#ff79c6] font-semibold'
          : 'text-[#f92672] font-semibold';
      elements.push(<span key={keyIndex} className={cls}>{text}</span>);
    }
    // Numbers & Booleans
    else if (/^\b(\d+(\.\d+)?|true|false|null|undefined|None|True|False)\b$/.test(text)) {
      const cls =
        theme === 'vscode'
          ? 'text-[#fab387]'
          : theme === 'terminal'
          ? 'text-cyan-300'
          : theme === 'github'
          ? 'text-[#0550ae]'
          : theme === 'dracula'
          ? 'text-[#bd93f9]'
          : 'text-[#ae81ff]';
      elements.push(<span key={keyIndex} className={cls}>{text}</span>);
    }
    // Types
    else if (
      /^\b(string|number|boolean|any|void|never|unknown|object|Promise|Record|Array|Map|Set|int|float|str|bool|dict|list)\b$/.test(
        text
      )
    ) {
      const cls =
        theme === 'vscode'
          ? 'text-[#f9e2af]'
          : theme === 'terminal'
          ? 'text-emerald-300'
          : theme === 'github'
          ? 'text-[#953800]'
          : theme === 'dracula'
          ? 'text-[#8be9fd]'
          : 'text-[#66d9ef]';
      elements.push(<span key={keyIndex} className={cls}>{text}</span>);
    }
    // Operators
    else if (/^(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%<>=!&|^~?:])+$/.test(text)) {
      const cls =
        theme === 'vscode'
          ? 'text-[#89dceb]'
          : theme === 'terminal'
          ? 'text-emerald-500'
          : theme === 'github'
          ? 'text-[#24292f]'
          : theme === 'dracula'
          ? 'text-[#ff79c6]'
          : 'text-[#f92672]';
      elements.push(<span key={keyIndex} className={cls}>{text}</span>);
    } else {
      elements.push(<span key={keyIndex}>{text}</span>);
    }
  }

  return elements.length > 0 ? elements : <span>{lineText}</span>;
}

/**
 * Inline Markdown Parser: renders neat & clean inline code `code`, **bold**, *italic*, and links
 */
function renderInlineMarkdown(content: string): React.ReactNode {
  if (!content) return null;

  // Split content by inline code backticks
  const parts = content.split(/(`[^`]+`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeSnippet = part.slice(1, -1);
      return (
        <code key={idx} className="gutenberg-inline-code">
          {codeSnippet}
        </code>
      );
    }

    // Process bold (**...**) and italic (*...*) in non-code parts
    const subParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={idx}>
        {subParts.map((sub, sIdx) => {
          if (sub.startsWith('**') && sub.endsWith('**')) {
            return <strong key={sIdx} className="font-semibold text-foreground">{sub.slice(2, -2)}</strong>;
          }
          if (sub.startsWith('*') && sub.endsWith('*')) {
            return <em key={sIdx} className="italic text-foreground/90">{sub.slice(1, -1)}</em>;
          }
          return sub;
        })}
      </span>
    );
  });
}

interface BlockEditorProps {
  blocks: BlockNode[];
  onChange: (blocks: BlockNode[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const openPicker = (index?: number) => {
    setInsertIndex(index !== undefined ? index : blocks.length);
    setIsPickerOpen(true);
  };

  const handleAddBlock = (type: BlockType, defaultData: Record<string, unknown>) => {
    // If adding a code block, default to vscode style with line numbers
    const initialData = { ...defaultData };
    if (type === 'code') {
      if (!initialData.themeStyle) initialData.themeStyle = 'vscode';
      if (initialData.showLineNumbers === undefined) initialData.showLineNumbers = true;
      if (!initialData.language) initialData.language = 'typescript';
    }

    const newBlock: BlockNode = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      data: initialData,
    };

    const targetIdx = insertIndex !== null ? insertIndex : blocks.length;
    const updated = [...blocks];
    updated.splice(targetIdx, 0, newBlock);
    onChange(updated);
    setActiveBlockId(newBlock.id);
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

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const updated = [...blocks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
    setDraggedIndex(null);
    setDropTargetIndex(null);
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

  // Helper to wrap selected text in paragraph with inline code or markdown syntax
  const handleWrapSelection = (blockId: string, currentText: string, prefix: string, suffix: string) => {
    const textarea = document.getElementById(`textarea_${blockId}`) as HTMLTextAreaElement | null;
    if (!textarea) {
      handleUpdateBlockData(blockId, 'text', currentText + `${prefix}code${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentText.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}code${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    handleUpdateBlockData(blockId, 'text', newText);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
      } else {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + 4;
      }
    }, 0);
  };

  // Live total word count across all visual blocks
  const totalWordCount = useMemo(() => {
    return blocks.reduce((acc, b) => {
      const rawText = JSON.stringify(b.data || {});
      const words = rawText.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
      return acc + words.length;
    }, 0);
  }, [blocks]);

  return (
    <div className="space-y-4">
      {/* ── Gutenberg Top Canvas Action Bar ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card shadow-2xs">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => openPicker(0)}
            className="h-8.5 px-3 text-xs gap-1.5 font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Block</span>
          </Button>

          <div className="h-4 w-px bg-border/80 mx-1" />

          {/* Mode Switcher: Gutenberg Canvas vs Genesis Live Preview */}
          <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={cn(
                'px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                viewMode === 'edit'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Gutenberg Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                viewMode === 'preview'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Genesis Live Preview</span>
            </button>
          </div>
        </div>

        {/* Document Stats Pill */}
        <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground font-mono">
          <Badge variant="outline" className="text-[11px] font-medium bg-muted/30">
            {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
          </Badge>
          <span>•</span>
          <span>{totalWordCount} words</span>
          <span>•</span>
          <span>~{Math.max(1, Math.ceil(totalWordCount / 200))} min read</span>
        </div>
      </div>

      {/* ── Empty Canvas State ────────────────────────────────────────── */}
      {blocks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/80 p-12 text-center bg-card/40">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Canvas is currently empty</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto mb-5 leading-relaxed">
            Build your page with modular Gutenberg & Genesis blocks: Hero, Code snippets with multiple IDE themes, Paragraphs with neat inline code, and Visual Media.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => openPicker(0)} size="sm" className="gap-1.5 font-semibold cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>Add First Block</span>
            </Button>
          </div>
        </div>
      ) : viewMode === 'preview' ? (
        /* ── GENESIS LIVE PREVIEW MODE ────────────────────────────────── */
        <div className="rounded-2xl border bg-card p-6 sm:p-10 shadow-sm space-y-8 max-w-3xl mx-auto">
          {blocks.map((block) => (
            <div key={block.id} className="space-y-4">
              {/* Heading */}
              {block.type === 'heading' && (
                <div className="pt-2">
                  {Number(block.data.level) === 1 && (
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground border-b pb-2">
                      {renderInlineMarkdown(String(block.data.text || ''))}
                    </h1>
                  )}
                  {Number(block.data.level) === 2 && (
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground border-b pb-1.5 mt-4">
                      {renderInlineMarkdown(String(block.data.text || ''))}
                    </h2>
                  )}
                  {Number(block.data.level) === 3 && (
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-3">
                      {renderInlineMarkdown(String(block.data.text || ''))}
                    </h3>
                  )}
                  {Number(block.data.level) >= 4 && (
                    <h4 className="text-lg font-semibold text-foreground mt-2">
                      {renderInlineMarkdown(String(block.data.text || ''))}
                    </h4>
                  )}
                </div>
              )}

              {/* Paragraph with Neat Inline Code */}
              {block.type === 'paragraph' && (
                <p className="text-[15px] sm:text-[16px] leading-relaxed text-foreground/90">
                  {renderInlineMarkdown(String(block.data.text || ''))}
                </p>
              )}

              {/* Quote */}
              {block.type === 'quote' && (
                <blockquote className="border-l-4 border-primary pl-4 py-2 italic text-foreground/80 bg-muted/20 rounded-r-lg">
                  <p className="text-base sm:text-lg">“{String(block.data.quote || '')}”</p>
                  {(block.data.author || block.data.role) && (
                    <footer className="text-xs font-semibold not-italic text-muted-foreground mt-1.5">
                      — {String(block.data.author || '')} {block.data.role ? `(${block.data.role})` : ''}
                    </footer>
                  )}
                </blockquote>
              )}

              {/* Code Block with Theme Styling */}
              {block.type === 'code' && (
                <CodeBlockDisplay
                  code={String(block.data.code || '')}
                  language={String(block.data.language || 'typescript')}
                  filename={String(block.data.filename || '')}
                  themeStyle={(block.data.themeStyle as CodeThemeStyle) || 'vscode'}
                  showLineNumbers={block.data.showLineNumbers !== false}
                />
              )}

              {/* Image */}
              {block.type === 'image' && block.data.url && (
                <figure className="space-y-2 my-4">
                  <img
                    src={String(block.data.url)}
                    alt={String(block.data.alt || 'Visual')}
                    className="w-full rounded-xl object-cover shadow-sm border border-border"
                  />
                  {block.data.caption && (
                    <figcaption className="text-xs text-center text-muted-foreground italic">
                      {String(block.data.caption)}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Hero */}
              {block.type === 'hero' && (
                <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border text-center space-y-4">
                  {block.data.badge && (
                    <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs">
                      {String(block.data.badge)}
                    </Badge>
                  )}
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                    {String(block.data.title || '')}
                  </h1>
                  {block.data.subtitle && (
                    <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
                      {String(block.data.subtitle)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── GUTENBERG CANVAS EDITING MODE (WITH DRAG & DROP) ──────────── */
        <div className="space-y-4">
          {blocks.map((block, index) => {
            const isDraggingThis = draggedIndex === index;
            const isDropTarget = dropTargetIndex === index;
            const isFocused = activeBlockId === block.id;

            return (
              <React.Fragment key={block.id}>
                {/* Drop Insertion Bar */}
                {isDropTarget && draggedIndex !== null && draggedIndex !== index && (
                  <div className="h-1.5 bg-primary rounded-full shadow-lg -my-1 z-30 animate-pulse transition-all" />
                )}

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dropTargetIndex !== index) {
                      setDropTargetIndex(index);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  onClick={() => setActiveBlockId(block.id)}
                  className={cn(
                    'rounded-xl border bg-card text-card-foreground shadow-xs transition-all relative group',
                    isFocused ? 'ring-2 ring-primary/40 border-primary/60 shadow-sm' : 'hover:border-primary/30',
                    isDraggingThis && 'opacity-40 border-dashed border-primary scale-[0.99]'
                  )}
                >
                  {/* ── Gutenberg Block Header Toolbar ──────────────────── */}
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 rounded-t-xl text-xs gap-2 select-none">
                    {/* Left: Drag Handle, Type & ID */}
                    <div className="flex items-center gap-2 min-w-0">
                      {/* HTML5 Drag Handle */}
                      <div
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', index.toString());
                          setDraggedIndex(index);
                        }}
                        onDragEnd={() => {
                          setDraggedIndex(null);
                          setDropTargetIndex(null);
                        }}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground/70 hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to reorder block (Gutenberg)"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      <Badge variant="outline" className="text-[10.5px] font-mono capitalize px-2 py-0.5 bg-background shadow-2xs font-semibold">
                        {block.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                        #{block.id.slice(-6)}
                      </span>
                    </div>

                    {/* Middle: Quick In-Block Action Tools */}
                    <div className="flex items-center gap-1">
                      {block.type === 'paragraph' && (
                        <div className="hidden sm:flex items-center gap-1 bg-background border rounded-md px-1 py-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWrapSelection(block.id, String(block.data.text || ''), '**', '**');
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Format Bold (**text**)"
                          >
                            <Bold className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWrapSelection(block.id, String(block.data.text || ''), '*', '*');
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Format Italic (*text*)"
                          >
                            <Italic className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWrapSelection(block.id, String(block.data.text || ''), '`', '`');
                            }}
                            className="px-1.5 py-0.5 rounded hover:bg-primary/10 text-primary font-mono text-[11px] font-bold cursor-pointer"
                            title="Format Neat Inline Code (`code`)"
                          >
                            &lt;/&gt;
                          </button>
                        </div>
                      )}

                      {block.type === 'code' && (
                        <div className="hidden sm:flex items-center gap-1 bg-background border rounded-md px-1.5 py-0.5 text-[11px] font-mono shadow-2xs">
                          <span className="text-muted-foreground">Theme:</span>
                          <span className="font-semibold text-primary capitalize">
                            {String(block.data.themeStyle || 'vscode')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Reorder & Management Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, 'up');
                        }}
                        className="h-6.5 w-6.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move block up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === blocks.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, 'down');
                        }}
                        className="h-6.5 w-6.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move block down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(index);
                        }}
                        className="h-6.5 w-6.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Duplicate block"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(block.id);
                        }}
                        className="h-6.5 w-6.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* ── Block Content Editor Canvas ────────────────────── */}
                  <div className="p-4 sm:p-5">
                    {/* 1. HERO BLOCK */}
                    {block.type === 'hero' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Badge Text</label>
                            <Input
                              value={String(block.data.badge || '')}
                              onChange={(e) => handleUpdateBlockData(block.id, 'badge', e.target.value)}
                              className="h-8 text-xs mt-1"
                              placeholder="e.g. Genesis Feature"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Main Title</label>
                            <Input
                              value={String(block.data.title || '')}
                              onChange={(e) => handleUpdateBlockData(block.id, 'title', e.target.value)}
                              className="h-8 text-xs font-semibold mt-1"
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
                            className="w-full rounded-md border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary mt-1"
                            placeholder="Hero supporting description..."
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. HEADING BLOCK */}
                    {block.type === 'heading' && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Heading Level Pills */}
                          <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium">
                            {[1, 2, 3, 4, 5, 6].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleUpdateBlockData(block.id, 'level', lvl)}
                                className={cn(
                                  'px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer',
                                  (Number(block.data.level) || 2) === lvl
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                H{lvl}
                              </button>
                            ))}
                          </div>
                          <Input
                            value={String(block.data.text || '')}
                            onChange={(e) => handleUpdateBlockData(block.id, 'text', e.target.value)}
                            placeholder="Enter heading text..."
                            className="h-8.5 text-xs font-semibold flex-1 min-w-[200px]"
                          />
                        </div>
                        {block.data.text && (
                          <div className="p-2 rounded bg-muted/20 border border-dashed text-muted-foreground">
                            <span className="text-[10px] font-mono text-muted-foreground/70 uppercase mr-2">Preview:</span>
                            <span className="font-bold text-foreground">
                              {renderInlineMarkdown(String(block.data.text || ''))}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. PARAGRAPH BLOCK WITH INLINE CODE FORMATTING */}
                    {block.type === 'paragraph' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Pilcrow className="h-3.5 w-3.5 text-primary" />
                            <span>Paragraph Body (supports backtick <code>`inline code`</code>, <strong>**bold**</strong>, <em>*italic*</em>)</span>
                          </label>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleWrapSelection(block.id, String(block.data.text || ''), '`', '`')}
                              className="h-6.5 px-2 text-[11px] font-mono font-bold text-primary gap-1 border-primary/30 hover:bg-primary/10 cursor-pointer"
                              title="Format selected text as Inline Code"
                            >
                              <span>&lt;/&gt; Inline Code</span>
                            </Button>
                          </div>
                        </div>

                        <textarea
                          id={`textarea_${block.id}`}
                          value={String(block.data.text || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'text', e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                          placeholder="Write body paragraph text. Wrap code in backticks like `npm install @headless/core`..."
                        />

                        {/* Live Typography Preview Showing Neat Inline Code */}
                        {block.data.text && (
                          <div className="p-3 rounded-lg bg-muted/20 border text-xs leading-relaxed">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mb-1 flex items-center gap-1">
                              <Sparkle className="h-3 w-3 text-primary" />
                              <span>Live Gutenberg Typography Preview:</span>
                            </div>
                            <div className="text-foreground/90">
                              {renderInlineMarkdown(String(block.data.text || ''))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. CODE BLOCK WITH MULTIPLE PROGRAM STYLES */}
                    {block.type === 'code' && (
                      <CodeBlockEditor
                        block={block}
                        onUpdateData={(key, val) => handleUpdateBlockData(block.id, key, val)}
                      />
                    )}

                    {/* 5. IMAGE BLOCK */}
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
                        <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl border bg-muted/20">
                          <div className="h-20 w-32 rounded-lg border border-dashed bg-background flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
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
                                <Upload className={cn('h-3.5 w-3.5', uploadingBlockId === block.id && 'animate-spin')} />
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
                              Images optimize with responsive presets and DAM pipeline automatically.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Image URL</label>
                            <Input
                              value={String(block.data.url || '')}
                              onChange={(e) => handleUpdateBlockData(block.id, 'url', e.target.value)}
                              placeholder="https://... or /media/..."
                              className="h-8 text-xs font-mono mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Alt Text (SEO)</label>
                            <Input
                              value={String(block.data.alt || '')}
                              onChange={(e) => handleUpdateBlockData(block.id, 'alt', e.target.value)}
                              placeholder="Accessible description"
                              className="h-8 text-xs mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. QUOTE BLOCK */}
                    {block.type === 'quote' && (
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                          <QuoteIcon className="h-3.5 w-3.5 text-primary" />
                          <span>Blockquote / Testimonial</span>
                        </label>
                        <textarea
                          value={String(block.data.quote || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'quote', e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border bg-background p-2.5 text-xs italic focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                          placeholder="“Enter inspirational quote or testimonial...”"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={String(block.data.author || '')}
                            onChange={(e) => handleUpdateBlockData(block.id, 'author', e.target.value)}
                            placeholder="Author Name"
                            className="h-7.5 text-xs"
                          />
                          <Input
                            value={String(block.data.role || '')}
                            onChange={(e) => handleUpdateBlockData(block.id, 'role', e.target.value)}
                            placeholder="Author Role / Company"
                            className="h-7.5 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* 7. CARDS GRID */}
                    {block.type === 'cards' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Genesis Feature Cards</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const items = (block.data.items as any[]) || [];
                              handleUpdateBlockData(block.id, 'items', [
                                ...items,
                                { title: `Feature ${items.length + 1}`, description: 'Feature description' },
                              ]);
                            }}
                            className="h-7 text-xs gap-1 cursor-pointer font-medium"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Card</span>
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {((block.data.items as any[]) || []).map((card, idx) => (
                            <div key={idx} className="p-3 rounded-lg border bg-background/60 space-y-2 text-xs">
                              <Input
                                value={card.title}
                                onChange={(e) => {
                                  const items = [...(block.data.items as any[])];
                                  items[idx].title = e.target.value;
                                  handleUpdateBlockData(block.id, 'items', items);
                                }}
                                placeholder="Card Title"
                                className="h-7.5 text-xs font-semibold"
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
                                className="w-full rounded border bg-background p-2 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 8. CALL TO ACTION (CTA) */}
                    {block.type === 'cta' && (
                      <div className="space-y-2.5 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <Input
                          value={String(block.data.title || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'title', e.target.value)}
                          placeholder="CTA Headline"
                          className="h-8.5 text-xs font-bold"
                        />
                        <Input
                          value={String(block.data.description || '')}
                          onChange={(e) => handleUpdateBlockData(block.id, 'description', e.target.value)}
                          placeholder="Supporting call to action text..."
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
                            placeholder="Target URL (/contact)"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* 9. ACCORDION / FAQ */}
                    {block.type === 'accordion' && (
                      <div className="space-y-2.5">
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
                            className="h-7 text-xs gap-1 cursor-pointer font-medium"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Item</span>
                          </Button>
                        </div>
                        {((block.data.items as any[]) || []).map((item, idx) => (
                          <div key={idx} className="p-2.5 border rounded-lg bg-background/50 space-y-1.5 text-xs">
                            <Input
                              value={item.title}
                              onChange={(e) => {
                                const items = [...(block.data.items as any[])];
                                items[idx].title = e.target.value;
                                handleUpdateBlockData(block.id, 'items', items);
                              }}
                              placeholder="Panel Header / Question"
                              className="h-7.5 text-xs font-medium"
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
                              className="w-full rounded border bg-background p-2 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fallback for other block types */}
                    {!['hero', 'heading', 'paragraph', 'code', 'image', 'quote', 'cards', 'cta', 'accordion'].includes(
                      block.type
                    ) && (
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Block Data (JSON)
                        </label>
                        <textarea
                          value={JSON.stringify(block.data, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              handleUpdateBlockData(block.id, 'data', parsed);
                            } catch {}
                          }}
                          rows={4}
                          className="w-full rounded-lg border bg-background p-2.5 font-mono text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Gutenberg In-Between Block Inserter ────────────────── */}
                <div className="relative py-1 group/insert flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-transparent group-hover/insert:bg-primary/30 transition-colors" />
                  <button
                    type="button"
                    onClick={() => openPicker(index + 1)}
                    className="opacity-0 group-hover/insert:opacity-100 transition-all duration-150 transform scale-90 group-hover/insert:scale-100 h-6 px-2.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shadow-md hover:bg-primary/90 cursor-pointer z-10"
                    title="Insert block here"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Insert Block</span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}

          {/* Bottom Add Block Trigger */}
          <div className="pt-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPicker(blocks.length)}
              className="gap-1.5 text-xs font-semibold border-dashed cursor-pointer hover:border-primary/60"
            >
              <Plus className="h-4 w-4" />
              <span>Add Block to End</span>
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

// ────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENT: CODE BLOCK EDITOR WITH MULTIPLE PROGRAM STYLES
// ────────────────────────────────────────────────────────────────────────────

interface CodeBlockEditorProps {
  block: BlockNode;
  onUpdateData: (key: string, value: unknown) => void;
}

function CodeBlockEditor({ block, onUpdateData }: CodeBlockEditorProps) {
  const [tabMode, setTabMode] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);

  const code = String(block.data.code || '');
  const language = String(block.data.language || 'typescript');
  const filename = String(block.data.filename || '');
  const themeStyle = (block.data.themeStyle as CodeThemeStyle) || 'vscode';
  const showLineNumbers = block.data.showLineNumbers !== false;

  const currentTheme = PROGRAM_STYLES.find((t) => t.id === themeStyle) || PROGRAM_STYLES[0];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Support Tab key indentation inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      onUpdateData('code', newVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="space-y-3">
      {/* Code Configuration Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border bg-muted/30 text-xs">
        {/* Program Style Selector */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>Program Style:</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {PROGRAM_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => onUpdateData('themeStyle', style.id)}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer border',
                  themeStyle === style.id
                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-2xs'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                )}
                title={`${style.name} (${style.badge})`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Tools: Line Numbers toggle & Editor/Preview tabs */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground font-medium select-none">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => onUpdateData('showLineNumbers', e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Line Numbers</span>
          </label>

          <div className="inline-flex items-center rounded-md border bg-background p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setTabMode('editor')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors cursor-pointer',
                tabMode === 'editor' ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              Input Code
            </button>
            <button
              type="button"
              onClick={() => setTabMode('preview')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors cursor-pointer',
                tabMode === 'preview' ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              Live Highlight
            </button>
          </div>
        </div>
      </div>

      {/* Language & Filename Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Language:</span>
          <select
            value={language}
            onChange={(e) => onUpdateData('language', e.target.value)}
            className="h-8 flex-1 rounded-md border bg-background px-2.5 text-xs font-mono font-medium focus:ring-1 focus:ring-primary"
          >
            {PROGRAM_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label} ({lang.value})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Filename:</span>
          <Input
            value={filename}
            onChange={(e) => onUpdateData('filename', e.target.value)}
            placeholder="e.g. index.ts, schema.prisma, App.vue"
            className="h-8 text-xs font-mono flex-1"
          />
        </div>
      </div>

      {/* Code Editor or Live Program Styled Window */}
      {tabMode === 'editor' ? (
        <div className="relative rounded-xl border overflow-hidden shadow-sm">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b text-[11px] font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold">{filename || `${language}.code`}</span>
              <span className="text-[10px] opacity-70">({language})</span>
            </div>
            <span className="text-[10px] text-muted-foreground/80">Press Tab to indent 2 spaces</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => onUpdateData('code', e.target.value)}
            onKeyDown={handleKeyDown}
            rows={7}
            className="w-full bg-zinc-950 text-zinc-100 p-3 font-mono text-xs focus:outline-none leading-relaxed resize-y selection:bg-primary/40"
            placeholder={`// Write ${language} code here...\nfunction example() {\n  return "neat code";\n}`}
          />
        </div>
      ) : (
        /* Formatted IDE Style Window Preview */
        <CodeBlockDisplay
          code={code}
          language={language}
          filename={filename}
          themeStyle={themeStyle}
          showLineNumbers={showLineNumbers}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENT: CODE BLOCK DISPLAY (IDE WINDOW STYLED PREVIEW)
// ────────────────────────────────────────────────────────────────────────────

interface CodeBlockDisplayProps {
  code: string;
  language: string;
  filename: string;
  themeStyle: CodeThemeStyle;
  showLineNumbers: boolean;
}

function CodeBlockDisplay({
  code,
  language,
  filename,
  themeStyle,
  showLineNumbers,
}: CodeBlockDisplayProps) {
  const [copied, setCopied] = useState(false);
  const themeConfig = PROGRAM_STYLES.find((t) => t.id === themeStyle) || PROGRAM_STYLES[0];
  const lines = code ? code.split('\n') : ['// No code entered'];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden font-mono text-xs shadow-md transition-all',
        themeConfig.bgClass,
        themeConfig.borderClass
      )}
    >
      {/* Titlebar with Window Controls */}
      <div className={cn('flex items-center justify-between px-3 py-2 select-none', themeConfig.headerBg)}>
        {/* Left Window Dots */}
        <div className="flex items-center gap-2">
          {themeConfig.dotsStyle === 'macos' && (
            <div className="flex items-center gap-1.5 mr-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
          )}

          {themeConfig.dotsStyle === 'minimal' && (
            <FileCode className="h-3.5 w-3.5 text-slate-500 mr-1" />
          )}

          <span
            className={cn(
              'font-semibold text-[11.5px] truncate max-w-[200px]',
              themeStyle === 'github' ? 'text-slate-800' : 'text-slate-200'
            )}
          >
            {filename || `${language || 'snippet'}`}
          </span>
          <Badge
            variant="outline"
            className="text-[9px] uppercase font-mono px-1.5 py-0 h-4 border-white/20 text-muted-foreground"
          >
            {language}
          </Badge>
        </div>

        {/* Right Tools: Copy Button & Theme Badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
            {themeConfig.name}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'p-1 px-2 rounded flex items-center gap-1 text-[10.5px] transition-colors cursor-pointer border',
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'hover:bg-white/10 text-muted-foreground hover:text-white border-white/10'
            )}
            title="Copy Code to Clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Optional Line Numbers */}
      <div className={cn('p-3 overflow-x-auto thin-scrollbar leading-relaxed', themeConfig.textColor)}>
        <pre className="font-mono text-xs m-0">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="table-row">
                {showLineNumbers && (
                  <span
                    className={cn(
                      'table-cell select-none text-right pr-3 mr-3 font-mono text-[11px] opacity-60',
                      themeConfig.lineNumClass
                    )}
                    style={{ minWidth: '2.5rem' }}
                  >
                    {idx + 1}
                  </span>
                )}
                <span className="table-cell pl-3 font-mono whitespace-pre">
                  {highlightCodeTokens(line, themeStyle)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
