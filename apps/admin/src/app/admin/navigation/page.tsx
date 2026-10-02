'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  GripVertical,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  Sliders,
  Eye,
  Layers,
  Sparkles,
  Zap,
  ExternalLink,
  Globe,
  Rocket,
  Shield,
  Code,
  BookOpen,
  Compass,
  ShoppingBag,
  LayoutGrid,
  Copy,
  Check,
  X,
  Monitor,
  Smartphone,
  Folder,
  Tag,
  Grid,
  ArrowRight,
  Indent,
  Outdent,
  Search,
} from 'lucide-react';
import { ModuleGuard } from '@/components/module-guard';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeColor = 'primary' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';

export interface FeaturedPromoCard {
  badge?: string;
  title: string;
  description: string;
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface MegaMenuConfig {
  columns: number; // 2, 3, 4, 5
  layout: 'columns' | 'featured';
  featuredCard?: FeaturedPromoCard | null;
}

export interface MenuItem {
  id?: string;
  title: string;
  url: string;
  target?: string;
  type?: string;
  description?: string;
  badge?: string;
  badgeColor?: BadgeColor;
  icon?: string;
  isMegaMenu?: boolean;
  megaMenuConfig?: MegaMenuConfig;
  children?: MenuItem[];
  isExpanded?: boolean;
}

export interface MenuData {
  id: string;
  name: string;
  slug: string;
  location?: string;
  items: MenuItem[];
}

// ─── Available Icons for Nav Items ──────────────────────────────────────────

const AVAILABLE_ICONS: Record<string, React.ElementType> = {
  Layers,
  Sparkles,
  Zap,
  Globe,
  Rocket,
  Shield,
  Code,
  BookOpen,
  Compass,
  ShoppingBag,
  LayoutGrid,
  Folder,
  Tag,
};

// ─── Default Sample Menu Data ────────────────────────────────────────────────

const DEFAULT_SAMPLE_ITEMS: MenuItem[] = [
  {
    title: 'Products',
    url: '/products',
    isMegaMenu: true,
    badge: 'NEW',
    badgeColor: 'primary',
    megaMenuConfig: {
      columns: 3,
      layout: 'featured',
      featuredCard: {
        badge: 'Featured Release',
        title: 'Enterprise CMS 2.0',
        description: 'Explore multi-keyword Rank Markup, visual composition, and omnichannel edge delivery.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        ctaText: 'Explore Features',
        ctaUrl: '/products/features',
      },
    },
    children: [
      {
        title: 'Core Platform',
        url: '/platform',
        children: [
          {
            title: 'Headless CMS',
            url: '/platform/cms',
            description: 'Ultra-fast edge API content engine with GraphQL',
            icon: 'Layers',
            badge: 'HOT',
            badgeColor: 'rose',
          },
          {
            title: 'Visual Block Editor',
            url: '/platform/editor',
            description: 'Modular drag-and-drop page composition canvas',
            icon: 'LayoutGrid',
          },
          {
            title: 'Digital Asset Manager',
            url: '/platform/assets',
            description: 'Next-gen Cloudflare R2 media processing pipeline',
            icon: 'Folder',
          },
        ],
      },
      {
        title: 'Developer Tools',
        url: '/developers',
        children: [
          {
            title: 'GraphQL & REST APIs',
            url: '/developers/api',
            description: 'High throughput, auto-generated edge schemas',
            icon: 'Code',
          },
          {
            title: 'Webhooks & Events',
            url: '/developers/webhooks',
            description: 'Real-time event streaming to serverless workers',
            icon: 'Zap',
            badge: 'PRO',
            badgeColor: 'emerald',
          },
          {
            title: 'TypeScript SDK',
            url: '/developers/sdk',
            description: 'Type-safe SDK with end-to-end IDE autocompletion',
            icon: 'Rocket',
          },
        ],
      },
      {
        title: 'Security & Access',
        url: '/security',
        children: [
          {
            title: 'Enterprise RBAC',
            url: '/security/rbac',
            description: 'Role-based access control and field permissions',
            icon: 'Shield',
          },
          {
            title: 'Audit Logs',
            url: '/security/audit',
            description: 'Immutable regulatory change audit logging',
            icon: 'BookOpen',
          },
          {
            title: 'Global Multi-Site',
            url: '/security/sites',
            description: 'Unified management across brands and domains',
            icon: 'Globe',
          },
        ],
      },
    ],
  },
  {
    title: 'Solutions',
    url: '/solutions',
    children: [
      {
        title: 'E-Commerce Storefronts',
        url: '/solutions/ecommerce',
        description: 'Omnichannel commerce with headless checkouts',
        icon: 'ShoppingBag',
      },
      {
        title: 'Media & Publishing',
        url: '/solutions/publishing',
        description: 'High-traffic newsrooms and dynamic article portals',
        icon: 'BookOpen',
      },
      {
        title: 'Mobile Applications',
        url: '/solutions/mobile',
        description: 'Native iOS & Android powered by edge CDN endpoints',
        icon: 'Compass',
      },
    ],
  },
  { title: 'Pricing', url: '/pricing' },
  { title: 'Documentation', url: '/docs', target: '_blank' },
  { title: 'Blog', url: '/blog' },
];

export default function NavigationPage() {
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [activeMenuSlug, setActiveMenuSlug] = useState<string>('main-navigation');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewMega, setActivePreviewMega] = useState<number | null>(0);
  const [mobileSimulatorNavOpen, setMobileSimulatorNavOpen] = useState(true);
  const [openMobileAccordions, setOpenMobileAccordions] = useState<Record<number, boolean>>({ 0: true });
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleMobileAccordion = (idx: number) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Inspector State
  const [editingPath, setEditingPath] = useState<number[] | null>(null);

  // Drag and Drop State
  const [draggedPath, setDraggedPath] = useState<number[] | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    path: number[];
    position: 'above' | 'below' | 'inside';
  } | null>(null);

  const fetchMenus = () => {
    fetch('/api/v1/navigation')
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setMenus(res.data);
          const current = res.data.find((m: MenuData) => m.slug === activeMenuSlug) || res.data[0];
          setActiveMenuSlug(current.slug);
          loadMenuDetail(current.slug);
        } else {
          // Initialize with default sample
          setItems(DEFAULT_SAMPLE_ITEMS);
        }
      })
      .catch(() => {
        setItems(DEFAULT_SAMPLE_ITEMS);
      });
  };

  const loadMenuDetail = (slug: string) => {
    fetch(`/api/v1/navigation/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          setItems(res.data.items);
        } else {
          setItems(DEFAULT_SAMPLE_ITEMS);
        }
      })
      .catch(() => {
        setItems(DEFAULT_SAMPLE_ITEMS);
      });
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSelectMenu = (slug: string) => {
    setActiveMenuSlug(slug);
    loadMenuDetail(slug);
  };

  // ─── Helper Functions for Nested Item Manipulation ─────────────────────────

  const getItemByPath = (tree: MenuItem[], path: number[]): MenuItem | null => {
    let current: any = tree;
    for (let i = 0; i < path.length; i++) {
      const idx = path[i];
      if (!current || !current[idx]) return null;
      if (i === path.length - 1) return current[idx];
      current = current[idx].children;
    }
    return null;
  };

  const updateItemByPath = (
    tree: MenuItem[],
    path: number[],
    updater: (item: MenuItem) => MenuItem
  ): MenuItem[] => {
    const clone = JSON.parse(JSON.stringify(tree));
    let target = clone;
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]].children;
    }
    const lastIdx = path[path.length - 1];
    target[lastIdx] = updater(target[lastIdx]);
    return clone;
  };

  const removeItemByPath = (tree: MenuItem[], path: number[]): { newTree: MenuItem[]; removed: MenuItem | null } => {
    const clone = JSON.parse(JSON.stringify(tree));
    let target = clone;
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]].children;
    }
    const lastIdx = path[path.length - 1];
    const removed = target.splice(lastIdx, 1)[0] || null;
    return { newTree: clone, removed };
  };

  const insertItemByPath = (
    tree: MenuItem[],
    path: number[],
    position: 'above' | 'below' | 'inside',
    item: MenuItem
  ): MenuItem[] => {
    const clone = JSON.parse(JSON.stringify(tree));
    if (position === 'inside') {
      let target = clone;
      for (let i = 0; i < path.length; i++) {
        if (i === path.length - 1) {
          target = target[path[i]];
          if (!target.children) target.children = [];
          target.children.push(item);
          target.isExpanded = true;
          return clone;
        }
        target = target[path[i]].children;
      }
    } else {
      let target = clone;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]].children;
      }
      const lastIdx = path[path.length - 1];
      const insertIdx = position === 'above' ? lastIdx : lastIdx + 1;
      target.splice(insertIdx, 0, item);
    }
    return clone;
  };

  // ─── User Actions ─────────────────────────────────────────────────────────

  const handleAddItem = (parentPath?: number[]) => {
    const newItem: MenuItem = {
      title: parentPath ? 'New Sub-Link' : 'New Navigation Item',
      url: '/',
      target: '_self',
      children: [],
    };

    if (!parentPath) {
      setItems([...items, newItem]);
      setEditingPath([items.length]);
    } else {
      const updated = insertItemByPath(items, parentPath, 'inside', newItem);
      setItems(updated);
      const parent = getItemByPath(updated, parentPath);
      const newIdx = (parent?.children?.length || 1) - 1;
      setEditingPath([...parentPath, newIdx]);
    }
  };

  const handleRemoveItem = (path: number[]) => {
    const { newTree } = removeItemByPath(items, path);
    setItems(newTree);
    if (editingPath && editingPath.join('-') === path.join('-')) {
      setEditingPath(null);
    }
  };

  const handleDuplicateItem = (path: number[]) => {
    const item = getItemByPath(items, path);
    if (!item) return;
    const duplicate: MenuItem = JSON.parse(JSON.stringify(item));
    duplicate.title = `${duplicate.title} (Copy)`;
    const updated = insertItemByPath(items, path, 'below', duplicate);
    setItems(updated);
  };

  const handleMove = (path: number[], direction: 'up' | 'down') => {
    const lastIdx = path[path.length - 1];
    const targetIdx = direction === 'up' ? lastIdx - 1 : lastIdx + 1;
    if (targetIdx < 0) return;

    const clone = JSON.parse(JSON.stringify(items));
    let target = clone;
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]].children;
    }
    if (targetIdx >= target.length) return;

    const [moved] = target.splice(lastIdx, 1);
    target.splice(targetIdx, 0, moved);
    setItems(clone);
  };

  const handleIndent = (path: number[]) => {
    const lastIdx = path[path.length - 1];
    if (lastIdx === 0) return; // Cannot indent the first item among siblings

    const prevSiblingPath = [...path.slice(0, -1), lastIdx - 1];
    const { newTree, removed } = removeItemByPath(items, path);
    if (!removed) return;

    const updated = insertItemByPath(newTree, prevSiblingPath, 'inside', removed);
    setItems(updated);
  };

  const handleOutdent = (path: number[]) => {
    if (path.length <= 1) return; // Already at top root level

    const parentPath = path.slice(0, -1);
    const { newTree, removed } = removeItemByPath(items, path);
    if (!removed) return;

    const updated = insertItemByPath(newTree, parentPath, 'below', removed);
    setItems(updated);
  };

  const handleToggleExpand = (path: number[]) => {
    setItems(
      updateItemByPath(items, path, (item) => ({
        ...item,
        isExpanded: item.isExpanded === false ? true : false,
      }))
    );
  };

  // ─── Drag and Drop Handlers ────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, path: number[]) => {
    e.stopPropagation();
    setDraggedPath(path);
    e.dataTransfer.setData('text/plain', JSON.stringify(path));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, path: number[]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedPath) return;

    // Do not allow dropping on oneself or descendant
    const draggedStr = draggedPath.join('-');
    const currentStr = path.join('-');
    if (currentStr.startsWith(draggedStr)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const height = rect.height;

    let position: 'above' | 'below' | 'inside' = 'below';
    if (clientY < height * 0.25) {
      position = 'above';
    } else if (clientY > height * 0.75) {
      position = 'below';
    } else {
      // Cannot drop inside if depth would exceed 3
      if (path.length < 3) {
        position = 'inside';
      } else {
        position = 'below';
      }
    }

    setDropTarget({ path, position });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, path: number[]) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedPath || !dropTarget) {
      setDraggedPath(null);
      setDropTarget(null);
      return;
    }

    const draggedStr = draggedPath.join('-');
    const targetStr = path.join('-');
    if (targetStr.startsWith(draggedStr)) {
      setDraggedPath(null);
      setDropTarget(null);
      return;
    }

    const { newTree, removed } = removeItemByPath(items, draggedPath);
    if (!removed) {
      setDraggedPath(null);
      setDropTarget(null);
      return;
    }

    // Adjust target path if the removed item was before target at the same parent level
    let adjustedTargetPath = [...dropTarget.path];
    if (
      draggedPath.length === dropTarget.path.length &&
      draggedPath.slice(0, -1).join('-') === dropTarget.path.slice(0, -1).join('-')
    ) {
      const draggedIdx = draggedPath[draggedPath.length - 1];
      const targetIdx = dropTarget.path[dropTarget.path.length - 1];
      if (draggedIdx < targetIdx) {
        adjustedTargetPath[adjustedTargetPath.length - 1] = targetIdx - 1;
      }
    }

    const finalTree = insertItemByPath(newTree, adjustedTargetPath, dropTarget.position, removed);
    setItems(finalTree);
    setDraggedPath(null);
    setDropTarget(null);
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/navigation/${activeMenuSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Menu hierarchy & Mega-menu configuration saved successfully!');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback(data.error || 'Failed to save menu.');
      }
    } catch {
      setFeedback('Error connecting to server.');
    } finally {
      setSaving(false);
    }
  };

  const currentlyEditingItem = editingPath ? getItemByPath(items, editingPath) : null;

  // ─── Recursive Tree Item Renderer ─────────────────────────────────────────

  const renderTreeItem = (item: MenuItem, path: number[]) => {
    const isEditing = editingPath && editingPath.join('-') === path.join('-');
    const isDragged = draggedPath && draggedPath.join('-') === path.join('-');
    const isTarget = dropTarget && dropTarget.path.join('-') === path.join('-');
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const isExpanded = item.isExpanded !== false;
    const depth = path.length - 1; // 0, 1, 2

    const IconComp = item.icon && AVAILABLE_ICONS[item.icon] ? AVAILABLE_ICONS[item.icon] : null;

    return (
      <div key={path.join('-')} className="relative select-none">
        {/* Drop Indicator: Above */}
        {isTarget && dropTarget?.position === 'above' && (
          <div className="h-1 bg-primary rounded-full mb-1 shadow-sm animate-pulse" />
        )}

        <div
          draggable
          onDragStart={(e) => handleDragStart(e, path)}
          onDragOver={(e) => handleDragOver(e, path)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, path)}
          className={cn(
            'group flex items-center justify-between p-2.5 rounded-lg border transition-all',
            depth === 0 && 'bg-card border-border shadow-2xs font-semibold',
            depth === 1 && 'bg-muted/30 border-border/70 ml-2.5 sm:ml-6 text-foreground/90 font-medium',
            depth === 2 && 'bg-muted/15 border-border/50 ml-5 sm:ml-12 text-muted-foreground font-normal',
            isEditing && 'ring-2 ring-primary border-primary/50 bg-primary/5',
            isDragged && 'opacity-30 border-dashed border-primary',
            isTarget && dropTarget?.position === 'inside' && 'ring-2 ring-emerald-500 bg-emerald-500/10'
          )}
        >
          {/* Left: Drag Handle, Expand Toggle & Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground transition-colors p-0.5"
              title="Drag to reorder or nest"
            >
              <GripVertical className="h-4 w-4" />
            </span>

            {hasChildren ? (
              <button
                type="button"
                onClick={() => handleToggleExpand(path)}
                className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              </div>
            )}

            {IconComp && (
              <IconComp className="h-4 w-4 text-primary shrink-0" />
            )}

            <div className="flex items-center gap-2 truncate">
              <span className="truncate text-[15px]">{item.title || 'Untitled Link'}</span>
              <span className="text-[12px] font-mono text-muted-foreground/70 hidden sm:inline truncate max-w-[150px]">
                {item.url}
              </span>
            </div>

            {/* Badges */}
            {item.isMegaMenu && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1 px-1.5 py-0.2">
                <Zap className="h-3 w-3 fill-current" />
                Mega Menu ({item.megaMenuConfig?.columns || 3} cols)
              </Badge>
            )}

            {item.badge && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-bold uppercase px-1.5 py-0.2',
                  item.badgeColor === 'rose' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                  item.badgeColor === 'emerald' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                  item.badgeColor === 'amber' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                  (!item.badgeColor || item.badgeColor === 'primary') && 'bg-primary/10 text-primary border-primary/20'
                )}
              >
                {item.badge}
              </Badge>
            )}

            {hasChildren && (
              <span className="text-[11px] text-muted-foreground/70 font-mono">
                ({item.children?.length} {item.children?.length === 1 ? 'child' : 'children'})
              </span>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Indent / Outdent Quick Actions */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={path.length <= 1}
              onClick={() => handleOutdent(path)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Outdent (Move Up a Level)"
            >
              <Outdent className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={path[path.length - 1] === 0 || path.length >= 3}
              onClick={() => handleIndent(path)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Indent (Nest under previous item)"
            >
              <Indent className="h-3.5 w-3.5" />
            </Button>

            {/* Add Child (up to depth 2) */}
            {depth < 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAddItem(path)}
                className="h-7 px-1.5 sm:px-2 text-[12px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Add Sub-Item / Column"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden md:inline">Child</span>
              </Button>
            )}

            {/* Edit / Configure Mega Menu */}
            <Button
              type="button"
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditingPath(isEditing ? null : path)}
              className={cn(
                'h-7 px-2 sm:px-2.5 text-[12px] gap-1.5 transition-all cursor-pointer',
                item.isMegaMenu && !isEditing && 'border-amber-500/40 text-amber-600 hover:bg-amber-500/10'
              )}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{item.isMegaMenu ? 'Mega Menu' : 'Settings'}</span>
            </Button>

            {/* Duplicate Item (Visible on sm+) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDuplicateItem(path)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer hidden sm:flex"
              title="Duplicate Item"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(path)}
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              title="Remove Item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Drop Indicator: Below */}
        {isTarget && dropTarget?.position === 'below' && (
          <div className="h-1 bg-primary rounded-full mt-1 shadow-sm animate-pulse" />
        )}

        {/* Nested Child Items */}
        {hasChildren && isExpanded && (
          <div className="space-y-1.5 mt-1.5">
            {item.children?.map((child, childIdx) =>
              renderTreeItem(child, [...path, childIdx])
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <ModuleGuard moduleId="navigation">
      <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Navigation Menus</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1">
              <Sparkles className="h-3 w-3" />
              Multi-Level & Mega-Menu
            </Badge>
          </div>
          <p className="text-[14px] text-muted-foreground mt-1">
            Reorder items with drag-and-drop, nest submenus up to 3 levels deep, and design full-width interactive Mega-Menus.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* View Mode Switcher: Tree Editor vs Live Preview */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-lg border bg-muted/30">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={cn(
                'px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'editor'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Tree<span className="hidden sm:inline"> Editor</span></span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'preview'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              <span>Preview</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleSaveMenu}
            disabled={saving}
            className="gap-1.5 shadow-xs text-xs sm:text-[14px] h-9 px-3.5 sm:px-4 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : (
              <>
                Save<span className="hidden sm:inline"> Navigation</span>
              </>
            )}</span>
          </Button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className="p-3 text-[14px] rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── Mode 1: TREE EDITOR ────────────────────────────────────────────── */}
      {viewMode === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Col 1: Menu Selector (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-2 space-y-1">
              <div className="p-2 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Menus
              </div>
              {menus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMenu(m.slug)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-md text-[14px] font-medium transition-colors text-left',
                    activeMenuSlug === m.slug
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  <span className="truncate">{m.name}</span>
                  <Badge variant="outline" className="text-[11px] ml-1 shrink-0">
                    {m.location || 'header'}
                  </Badge>
                </button>
              ))}
            </Card>

            {/* Quick Tips Card */}
            <Card className="p-4 bg-muted/20 border-dashed text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <GripVertical className="h-4 w-4 text-primary" />
                <span>Drag & Drop Tips</span>
              </div>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside leading-relaxed text-[13px]">
                <li>Drag top or bottom to reorder at same level.</li>
                <li>Drag into center of an item to nest as child.</li>
                <li>Use <kbd className="px-1 border rounded bg-background">Indent</kbd> / <kbd className="px-1 border rounded bg-background">Outdent</kbd> for 1-click nesting.</li>
                <li>Click <strong>Mega Menu</strong> to activate rich columns & promo banners.</li>
              </ul>
            </Card>
          </div>

          {/* Col 2: Navigation Hierarchy Tree (5 or 9 cols depending on inspector) */}
          <div className={cn(editingPath ? 'lg:col-span-5' : 'lg:col-span-9')}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>Menu Hierarchy</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      ({items.length} top-level items)
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Drag items by handle or use indent/outdent buttons to adjust depth.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddItem()}
                  className="gap-1.5 text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Root Item</span>
                </Button>
              </CardHeader>

              <CardContent className="p-5 space-y-2.5">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
                    <p>No navigation items found in this menu.</p>
                    <Button size="sm" onClick={() => setItems(DEFAULT_SAMPLE_ITEMS)} variant="outline">
                      Load Sample Mega-Menu Structure
                    </Button>
                  </div>
                ) : (
                  items.map((item, idx) => renderTreeItem(item, [idx]))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Col 3: Inspector Panel (Modal dialog on mobile, 4-col sticky card on desktop) */}
          {editingPath && currentlyEditingItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 lg:p-0 lg:static lg:bg-transparent lg:backdrop-blur-none lg:col-span-4 animate-in fade-in-50 duration-200">
              <Card className="w-full max-w-lg lg:max-w-none max-h-[90vh] lg:max-h-none overflow-hidden flex flex-col lg:sticky lg:top-20 border-primary/40 shadow-2xl lg:shadow-md bg-card">
                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-primary" />
                      <span>Item Settings</span>
                    </CardTitle>
                    <CardDescription className="text-xs truncate max-w-[220px]">
                      Editing "{currentlyEditingItem.title}"
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingPath(null)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto thin-scrollbar text-xs">
                  {/* Basic Link Information */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Navigation Label</label>
                      <Input
                        value={currentlyEditingItem.title}
                        onChange={(e) =>
                          setItems(
                            updateItemByPath(items, editingPath, (it) => ({
                              ...it,
                              title: e.target.value,
                            }))
                          )
                        }
                        className="h-8 text-xs font-medium"
                        placeholder="e.g. Products, Documentation"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Destination URL</label>
                      <Input
                        value={currentlyEditingItem.url}
                        onChange={(e) =>
                          setItems(
                            updateItemByPath(items, editingPath, (it) => ({
                              ...it,
                              url: e.target.value,
                            }))
                          )
                        }
                        className="h-8 text-xs font-mono"
                        placeholder="/products or https://..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Subtitle / Description</label>
                      <Input
                        value={currentlyEditingItem.description || ''}
                        onChange={(e) =>
                          setItems(
                            updateItemByPath(items, editingPath, (it) => ({
                              ...it,
                              description: e.target.value,
                            }))
                          )
                        }
                        className="h-8 text-xs"
                        placeholder="Short 1-line description for mega-menu..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Target Window</label>
                        <select
                          value={currentlyEditingItem.target || '_self'}
                          onChange={(e) =>
                            setItems(
                              updateItemByPath(items, editingPath, (it) => ({
                                ...it,
                                target: e.target.value,
                              }))
                            )
                          }
                          className="w-full h-8 rounded border bg-background px-2 text-xs"
                        >
                          <option value="_self">Same tab (_self)</option>
                          <option value="_blank">New tab (_blank)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Item Icon</label>
                        <select
                          value={currentlyEditingItem.icon || ''}
                          onChange={(e) =>
                            setItems(
                              updateItemByPath(items, editingPath, (it) => ({
                                ...it,
                                icon: e.target.value,
                              }))
                            )
                          }
                          className="w-full h-8 rounded border bg-background px-2 text-xs"
                        >
                          <option value="">(No icon)</option>
                          {Object.keys(AVAILABLE_ICONS).map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Badge Configuration */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Badge Text</label>
                        <Input
                          value={currentlyEditingItem.badge || ''}
                          onChange={(e) =>
                            setItems(
                              updateItemByPath(items, editingPath, (it) => ({
                                ...it,
                                badge: e.target.value,
                              }))
                            )
                          }
                          placeholder="e.g. NEW, PRO, HOT"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Badge Color</label>
                        <select
                          value={currentlyEditingItem.badgeColor || 'primary'}
                          onChange={(e) =>
                            setItems(
                              updateItemByPath(items, editingPath, (it) => ({
                                ...it,
                                badgeColor: e.target.value as BadgeColor,
                              }))
                            )
                          }
                          className="w-full h-8 rounded border bg-background px-2 text-xs"
                        >
                          <option value="primary">Blue / Primary</option>
                          <option value="emerald">Emerald / Green</option>
                          <option value="amber">Amber / Orange</option>
                          <option value="rose">Rose / Red</option>
                          <option value="purple">Purple</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── MEGA-MENU MASTER CONTROLS (Root Items Only) ────────── */}
                  {editingPath.length === 1 && (
                    <div className="border-t pt-4 space-y-3.5">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/10 border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <div>
                            <div className="font-bold text-foreground text-xs">Mega-Menu Mode</div>
                            <div className="text-[11px] text-muted-foreground">
                              Render rich multi-column dropdown
                            </div>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(currentlyEditingItem.isMegaMenu)}
                            onChange={(e) =>
                              setItems(
                                updateItemByPath(items, editingPath, (it) => ({
                                  ...it,
                                  isMegaMenu: e.target.checked,
                                  megaMenuConfig: it.megaMenuConfig || {
                                    columns: 3,
                                    layout: 'columns',
                                    featuredCard: null,
                                  },
                                }))
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {currentlyEditingItem.isMegaMenu && (
                        <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-semibold text-foreground">Columns Count</label>
                              <select
                                value={currentlyEditingItem.megaMenuConfig?.columns || 3}
                                onChange={(e) =>
                                  setItems(
                                    updateItemByPath(items, editingPath, (it) => ({
                                      ...it,
                                      megaMenuConfig: {
                                        ...it.megaMenuConfig!,
                                        columns: parseInt(e.target.value, 10),
                                      },
                                    }))
                                  )
                                }
                                className="w-full h-8 rounded border bg-background px-2 text-xs"
                              >
                                <option value="2">2 Columns</option>
                                <option value="3">3 Columns</option>
                                <option value="4">4 Columns</option>
                                <option value="5">5 Columns</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-semibold text-foreground">Menu Layout</label>
                              <select
                                value={currentlyEditingItem.megaMenuConfig?.layout || 'columns'}
                                onChange={(e) =>
                                  setItems(
                                    updateItemByPath(items, editingPath, (it) => ({
                                      ...it,
                                      megaMenuConfig: {
                                        ...it.megaMenuConfig!,
                                        layout: e.target.value as 'columns' | 'featured',
                                      },
                                    }))
                                  )
                                }
                                className="w-full h-8 rounded border bg-background px-2 text-xs"
                              >
                                <option value="columns">Grid Columns Only</option>
                                <option value="featured">Columns + Featured Card</option>
                              </select>
                            </div>
                          </div>

                          {/* Featured Promotional Banner Configuration */}
                          {currentlyEditingItem.megaMenuConfig?.layout === 'featured' && (
                            <div className="space-y-2 pt-2 border-t">
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span>Featured Promo Card</span>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] text-muted-foreground">Promo Card Badge</label>
                                <Input
                                  value={currentlyEditingItem.megaMenuConfig.featuredCard?.badge || ''}
                                  onChange={(e) =>
                                    setItems(
                                      updateItemByPath(items, editingPath, (it) => ({
                                        ...it,
                                        megaMenuConfig: {
                                          ...it.megaMenuConfig!,
                                          featuredCard: {
                                            title: it.megaMenuConfig?.featuredCard?.title || '',
                                            description: it.megaMenuConfig?.featuredCard?.description || '',
                                            ...it.megaMenuConfig?.featuredCard,
                                            badge: e.target.value,
                                          },
                                        },
                                      }))
                                    )
                                  }
                                  placeholder="e.g. Featured Release"
                                  className="h-7 text-xs"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] text-muted-foreground">Promo Card Title</label>
                                <Input
                                  value={currentlyEditingItem.megaMenuConfig.featuredCard?.title || ''}
                                  onChange={(e) =>
                                    setItems(
                                      updateItemByPath(items, editingPath, (it) => ({
                                        ...it,
                                        megaMenuConfig: {
                                          ...it.megaMenuConfig!,
                                          featuredCard: {
                                            description: it.megaMenuConfig?.featuredCard?.description || '',
                                            ...it.megaMenuConfig?.featuredCard,
                                            title: e.target.value,
                                          },
                                        },
                                      }))
                                    )
                                  }
                                  placeholder="e.g. Enterprise CMS 2.0"
                                  className="h-7 text-xs font-semibold"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] text-muted-foreground">Short Description</label>
                                <textarea
                                  rows={2}
                                  value={currentlyEditingItem.megaMenuConfig.featuredCard?.description || ''}
                                  onChange={(e) =>
                                    setItems(
                                      updateItemByPath(items, editingPath, (it) => ({
                                        ...it,
                                        megaMenuConfig: {
                                          ...it.megaMenuConfig!,
                                          featuredCard: {
                                            title: it.megaMenuConfig?.featuredCard?.title || '',
                                            ...it.megaMenuConfig?.featuredCard,
                                            description: e.target.value,
                                          },
                                        },
                                      }))
                                    )
                                  }
                                  placeholder="Brief teaser for promo banner..."
                                  className="w-full rounded border bg-background p-2 text-xs"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] text-muted-foreground">Image Thumbnail URL</label>
                                <Input
                                  value={currentlyEditingItem.megaMenuConfig.featuredCard?.image || ''}
                                  onChange={(e) =>
                                    setItems(
                                      updateItemByPath(items, editingPath, (it) => ({
                                        ...it,
                                        megaMenuConfig: {
                                          ...it.megaMenuConfig!,
                                          featuredCard: {
                                            title: it.megaMenuConfig?.featuredCard?.title || '',
                                            description: it.megaMenuConfig?.featuredCard?.description || '',
                                            ...it.megaMenuConfig?.featuredCard,
                                            image: e.target.value,
                                          },
                                        },
                                      }))
                                    )
                                  }
                                  placeholder="https://images.unsplash.com/..."
                                  className="h-7 text-xs font-mono"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-muted-foreground">CTA Text</label>
                                  <Input
                                    value={currentlyEditingItem.megaMenuConfig.featuredCard?.ctaText || ''}
                                    onChange={(e) =>
                                      setItems(
                                        updateItemByPath(items, editingPath, (it) => ({
                                          ...it,
                                          megaMenuConfig: {
                                            ...it.megaMenuConfig!,
                                            featuredCard: {
                                              title: it.megaMenuConfig?.featuredCard?.title || '',
                                              description: it.megaMenuConfig?.featuredCard?.description || '',
                                              ...it.megaMenuConfig?.featuredCard,
                                              ctaText: e.target.value,
                                            },
                                          },
                                        }))
                                      )
                                    }
                                    placeholder="Learn More"
                                    className="h-7 text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-muted-foreground">CTA URL</label>
                                  <Input
                                    value={currentlyEditingItem.megaMenuConfig.featuredCard?.ctaUrl || ''}
                                    onChange={(e) =>
                                      setItems(
                                        updateItemByPath(items, editingPath, (it) => ({
                                          ...it,
                                          megaMenuConfig: {
                                            ...it.megaMenuConfig!,
                                            featuredCard: {
                                              title: it.megaMenuConfig?.featuredCard?.title || '',
                                              description: it.megaMenuConfig?.featuredCard?.description || '',
                                              ...it.megaMenuConfig?.featuredCard,
                                              ctaUrl: e.target.value,
                                            },
                                          },
                                        }))
                                      )
                                    }
                                    placeholder="/promo"
                                    className="h-7 text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => setEditingPath(null)}
                    className="w-full mt-2 text-xs"
                  >
                    Done Editing
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── Mode 2: LIVE MEGA-MENU INTERACTIVE PREVIEW ─────────────────────────── */}
      {viewMode === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border bg-card">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Interactive Navigation Simulator</span>
              <span className="text-xs text-muted-foreground">
                Hover or click menu items below to test your Mega-Menu drawer.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
                className="gap-1.5 h-8 text-xs"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop View</span>
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
                className="gap-1.5 h-8 text-xs"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile Accordion</span>
              </Button>
            </div>
          </div>

          {/* Simulated Browser Frame */}
          <div className="rounded-xl border bg-background shadow-lg overflow-hidden min-h-[500px]">
            {/* Browser Address Bar Mock */}
            <div className="bg-muted/40 border-b px-4 py-2.5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block" />
              </div>
              <div className="flex-1 max-w-md mx-auto bg-card border rounded-md px-3 py-1 text-[11px] text-muted-foreground font-mono text-center flex items-center justify-center gap-1.5">
                <Globe className="h-3 w-3 text-muted-foreground/60" />
                <span>https://yourwebsite.com</span>
              </div>
            </div>

            {/* Desktop Navbar Simulator */}
            {previewDevice === 'desktop' ? (
              <div className="relative">
                {/* Navbar Bar */}
                <header className="h-16 px-8 border-b bg-card flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5 font-bold text-base text-foreground">
                      <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center text-xs">
                        ⚡
                      </div>
                      <span>Acme Brand</span>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex items-center gap-1">
                      {items.map((item, idx) => {
                        const isMega = item.isMegaMenu;
                        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                        const isOpen = activePreviewMega === idx;

                        return (
                          <div
                            key={idx}
                            className="relative"
                            onMouseEnter={() => {
                              if (isMega || hasChildren) setActivePreviewMega(idx);
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActivePreviewMega(isOpen ? null : idx);
                              }}
                              className={cn(
                                'px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer',
                                isOpen
                                  ? 'bg-accent text-foreground'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              )}
                            >
                              <span>{item.title}</span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase',
                                    item.badgeColor === 'rose' && 'bg-rose-500/15 text-rose-600',
                                    item.badgeColor === 'emerald' && 'bg-emerald-500/15 text-emerald-600',
                                    item.badgeColor === 'amber' && 'bg-amber-500/15 text-amber-600',
                                    (!item.badgeColor || item.badgeColor === 'primary') && 'bg-primary/15 text-primary'
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {(isMega || hasChildren) && (
                                <ChevronDown
                                  className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
                                />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Sign In
                    </Button>
                    <Button size="sm" className="text-xs">
                      Get Started
                    </Button>
                  </div>
                </header>

                {/* ── Active Mega Menu Overlay Drawer ────────────────────────── */}
                {activePreviewMega !== null && items[activePreviewMega] && (
                  <div
                    onMouseLeave={() => setActivePreviewMega(null)}
                    className="absolute top-16 left-0 right-0 border-b bg-card/95 backdrop-blur-md shadow-2xl p-8 z-30 animate-in fade-in-50 slide-in-from-top-2 duration-200"
                  >
                    {items[activePreviewMega].isMegaMenu ? (
                      /* Rich Multi-Column Mega Menu */
                      <div className="max-w-7xl mx-auto flex gap-8">
                        {/* Categorized Columns Grid */}
                        <div
                          className={cn(
                            'grid gap-8 flex-1',
                            (items[activePreviewMega].megaMenuConfig?.columns || 3) === 2 && 'grid-cols-2',
                            (items[activePreviewMega].megaMenuConfig?.columns || 3) === 3 && 'grid-cols-3',
                            (items[activePreviewMega].megaMenuConfig?.columns || 3) === 4 && 'grid-cols-4',
                            (items[activePreviewMega].megaMenuConfig?.columns || 3) === 5 && 'grid-cols-5'
                          )}
                        >
                          {items[activePreviewMega].children?.map((col, colIdx) => (
                            <div key={colIdx} className="space-y-3">
                              {/* Column Header */}
                              <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 border-b pb-1.5 flex items-center justify-between">
                                <span>{col.title}</span>
                              </div>

                              {/* Column Items */}
                              <div className="space-y-2">
                                {col.children?.map((sub, subIdx) => {
                                  const SubIcon = sub.icon && AVAILABLE_ICONS[sub.icon] ? AVAILABLE_ICONS[sub.icon] : null;

                                  return (
                                    <a
                                      key={subIdx}
                                      href={sub.url}
                                      onClick={(e) => e.preventDefault()}
                                      className="group flex items-start gap-3 p-2 rounded-lg hover:bg-accent/60 transition-colors"
                                    >
                                      {SubIcon ? (
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                          <SubIcon className="h-4 w-4" />
                                        </div>
                                      ) : (
                                        <div className="h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                                          <ArrowRight className="h-3.5 w-3.5" />
                                        </div>
                                      )}

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                                            {sub.title}
                                          </span>
                                          {sub.badge && (
                                            <span
                                              className={cn(
                                                'text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase',
                                                sub.badgeColor === 'rose' && 'bg-rose-500/15 text-rose-600',
                                                sub.badgeColor === 'emerald' && 'bg-emerald-500/15 text-emerald-600',
                                                sub.badgeColor === 'amber' && 'bg-amber-500/15 text-amber-600',
                                                (!sub.badgeColor || sub.badgeColor === 'primary') && 'bg-primary/15 text-primary'
                                              )}
                                            >
                                              {sub.badge}
                                            </span>
                                          )}
                                        </div>
                                        {sub.description && (
                                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                                            {sub.description}
                                          </p>
                                        )}
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Optional Featured Promo Card */}
                        {items[activePreviewMega].megaMenuConfig?.layout === 'featured' &&
                          items[activePreviewMega].megaMenuConfig?.featuredCard && (
                            <div className="w-72 shrink-0 border-l pl-8 flex flex-col justify-between">
                              <div className="space-y-3">
                                {items[activePreviewMega].megaMenuConfig?.featuredCard?.image && (
                                  <div className="h-36 w-full rounded-lg overflow-hidden border">
                                    <img
                                      src={items[activePreviewMega].megaMenuConfig?.featuredCard?.image}
                                      alt="Featured"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}

                                <div className="space-y-1">
                                  {items[activePreviewMega].megaMenuConfig?.featuredCard?.badge && (
                                    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                                      {items[activePreviewMega].megaMenuConfig?.featuredCard?.badge}
                                    </Badge>
                                  )}
                                  <h4 className="font-bold text-sm text-foreground">
                                    {items[activePreviewMega].megaMenuConfig?.featuredCard?.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {items[activePreviewMega].megaMenuConfig?.featuredCard?.description}
                                  </p>
                                </div>
                              </div>

                              <Button size="sm" className="w-full gap-1.5 mt-4 text-xs font-semibold">
                                <span>
                                  {items[activePreviewMega].megaMenuConfig?.featuredCard?.ctaText || 'Learn More'}
                                </span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                      </div>
                    ) : (
                      /* Standard Dropdown */
                      <div className="max-w-xs space-y-1">
                        {items[activePreviewMega].children?.map((sub, sIdx) => (
                          <a
                            key={sIdx}
                            href={sub.url}
                            onClick={(e) => e.preventDefault()}
                            className="block px-3 py-2 rounded-md hover:bg-accent text-xs font-medium text-foreground transition-colors"
                          >
                            <div className="font-semibold">{sub.title}</div>
                            {sub.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{sub.description}</p>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Hero Body Placeholder */}
                <div className="py-24 text-center space-y-4 max-w-2xl mx-auto px-4">
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Next-Gen Headless Digital Experiences
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Delivering structured content through ultra-responsive multi-level and mega navigation systems.
                  </p>
                </div>
              </div>
            ) : (
              /* Mobile View Simulator: Realistic Smartphone Shell */
              <div className="py-6 px-2 sm:px-4 flex justify-center bg-muted/20 overflow-x-auto">
                <div className="w-full max-w-[390px] rounded-[2.5rem] border-[6px] border-zinc-800 dark:border-zinc-700 bg-background shadow-2xl overflow-hidden flex flex-col min-h-[640px] max-h-[780px]">
                  {/* Phone Status Bar */}
                  <div className="bg-card px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground select-none">
                    <span>9:41</span>
                    {/* Dynamic Island Pill */}
                    <div className="h-4 w-20 rounded-full bg-zinc-800 mx-auto" />
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Mobile Header Bar */}
                  <div className="h-14 px-4 bg-card border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">
                        ⚡
                      </div>
                      <span className="font-bold text-sm tracking-tight text-foreground">Acme Brand</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMobileSimulatorNavOpen(!mobileSimulatorNavOpen)}
                        className="p-1.5 rounded-lg border bg-muted/30 text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title={mobileSimulatorNavOpen ? 'Close Menu' : 'Open Menu'}
                      >
                        {mobileSimulatorNavOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Drawer Body */}
                  {mobileSimulatorNavOpen ? (
                    <div className="flex-1 overflow-y-auto thin-scrollbar p-3.5 space-y-3.5 animate-in fade-in-50 duration-200">
                      {/* Mobile In-Menu Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search products, solutions, docs..."
                          className="h-8.5 pl-9 pr-3 text-xs bg-muted/30 rounded-xl"
                        />
                      </div>

                      {/* Accordion Menu Items */}
                      <div className="space-y-2">
                        {items.map((item, idx) => {
                          const isMega = item.isMegaMenu;
                          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                          const isOpen = Boolean(openMobileAccordions[idx]);

                          return (
                            <div key={idx} className="rounded-xl border bg-card/60 overflow-hidden transition-all shadow-2xs">
                              {/* Top Row / Accordion Header */}
                              <div
                                onClick={() => {
                                  if (isMega || hasChildren) {
                                    toggleMobileAccordion(idx);
                                  }
                                }}
                                className={cn(
                                  'flex items-center justify-between p-3 transition-colors cursor-pointer select-none',
                                  isOpen && (isMega || hasChildren) ? 'bg-accent/40 font-semibold' : 'hover:bg-muted/30'
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[13.5px] font-semibold text-foreground">{item.title}</span>
                                  {isMega && (
                                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2">
                                      ⚡ Mega
                                    </Badge>
                                  )}
                                  {item.badge && (
                                    <span
                                      className={cn(
                                        'text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase',
                                        item.badgeColor === 'rose' && 'bg-rose-500/15 text-rose-600',
                                        item.badgeColor === 'emerald' && 'bg-emerald-500/15 text-emerald-600',
                                        item.badgeColor === 'amber' && 'bg-amber-500/15 text-amber-600',
                                        (!item.badgeColor || item.badgeColor === 'primary') && 'bg-primary/15 text-primary'
                                      )}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </div>

                                {hasChildren || isMega ? (
                                  <ChevronDown
                                    className={cn(
                                      'h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0',
                                      isOpen && 'rotate-180 text-foreground'
                                    )}
                                  />
                                ) : (
                                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                                )}
                              </div>

                              {/* Accordion Content for Mega-Menu & Submenus */}
                              {(hasChildren || isMega) && isOpen && (
                                <div className="p-3 pt-0 space-y-3.5 border-t bg-background/50">
                                  {isMega ? (
                                    /* Rich Mobile Mega-Menu Sections */
                                    <div className="space-y-4 pt-2">
                                      {item.children?.map((col, colIdx) => (
                                        <div key={colIdx} className="space-y-2">
                                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between border-b pb-1">
                                            <span>{col.title}</span>
                                            <span className="text-[9.5px] font-normal text-muted-foreground">
                                              ({col.children?.length || 0})
                                            </span>
                                          </div>

                                          <div className="space-y-1.5">
                                            {col.children?.map((sub, sIdx) => {
                                              const SubIcon =
                                                sub.icon && AVAILABLE_ICONS[sub.icon]
                                                  ? AVAILABLE_ICONS[sub.icon]
                                                  : null;

                                              return (
                                                <div
                                                  key={sIdx}
                                                  className="p-2 rounded-lg bg-card border hover:border-primary/40 transition-all flex items-start gap-2.5 cursor-pointer"
                                                >
                                                  {SubIcon ? (
                                                    <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                      <SubIcon className="h-3.5 w-3.5" />
                                                    </div>
                                                  ) : (
                                                    <div className="h-7 w-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                                                      <ArrowRight className="h-3 w-3" />
                                                    </div>
                                                  )}

                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="font-semibold text-xs text-foreground truncate">
                                                        {sub.title}
                                                      </span>
                                                      {sub.badge && (
                                                        <span
                                                          className={cn(
                                                            'text-[8.5px] font-bold px-1.2 py-0.2 rounded-full uppercase',
                                                            sub.badgeColor === 'rose' &&
                                                              'bg-rose-500/15 text-rose-600',
                                                            sub.badgeColor === 'emerald' &&
                                                              'bg-emerald-500/15 text-emerald-600',
                                                            sub.badgeColor === 'amber' &&
                                                              'bg-amber-500/15 text-amber-600',
                                                            (!sub.badgeColor || sub.badgeColor === 'primary') &&
                                                              'bg-primary/15 text-primary'
                                                          )}
                                                        >
                                                          {sub.badge}
                                                        </span>
                                                      )}
                                                    </div>
                                                    {sub.description && (
                                                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                                        {sub.description}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}

                                      {/* Mobile Featured Promo Card */}
                                      {item.megaMenuConfig?.layout === 'featured' &&
                                        item.megaMenuConfig?.featuredCard && (
                                          <div className="rounded-xl border bg-gradient-to-br from-amber-500/10 via-background to-primary/5 p-3 space-y-2 mt-2 shadow-xs">
                                            {item.megaMenuConfig.featuredCard.image && (
                                              <div className="h-28 w-full rounded-lg overflow-hidden border">
                                                <img
                                                  src={item.megaMenuConfig.featuredCard.image}
                                                  alt="Featured"
                                                  className="h-full w-full object-cover"
                                                />
                                              </div>
                                            )}

                                            <div className="space-y-1">
                                              {item.megaMenuConfig.featuredCard.badge && (
                                                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[9px] font-bold">
                                                  {item.megaMenuConfig.featuredCard.badge}
                                                </Badge>
                                              )}
                                              <div className="font-bold text-xs text-foreground">
                                                {item.megaMenuConfig.featuredCard.title}
                                              </div>
                                              <p className="text-[10.5px] text-muted-foreground leading-relaxed line-clamp-2">
                                                {item.megaMenuConfig.featuredCard.description}
                                              </p>
                                            </div>

                                            <Button size="sm" className="w-full h-7 text-xs font-semibold gap-1 mt-2">
                                              <span>
                                                {item.megaMenuConfig.featuredCard.ctaText || 'Learn More'}
                                              </span>
                                              <ArrowRight className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    /* Standard Dropdown in Mobile Accordion */
                                    <div className="space-y-1 pt-1.5">
                                      {item.children?.map((sub, sIdx) => (
                                        <div
                                          key={sIdx}
                                          className="p-2 rounded-md hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center justify-between"
                                        >
                                          <span>{sub.title}</span>
                                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Drawer Bottom Actions */}
                      <div className="pt-3 border-t space-y-2">
                        <Button className="w-full text-xs h-8.5">Get Started</Button>
                        <Button variant="outline" className="w-full text-xs h-8.5">
                          Sign In
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed Mobile Page Preview */
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div className="font-bold text-sm text-foreground">Mobile Menu Collapsed</div>
                      <p className="text-xs text-muted-foreground">
                        Tap the hamburger menu in the top bar to inspect your interactive mobile Mega-Menu.
                      </p>
                      <Button size="sm" onClick={() => setMobileSimulatorNavOpen(true)} className="gap-1.5 text-xs">
                        <MenuIcon className="h-3.5 w-3.5" />
                        <span>Open Mobile Menu</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </ModuleGuard>
  );
}
