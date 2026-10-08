'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Calendar,
  User,
  Globe,
  ExternalLink,
  Copy,
  Check,
  ImageIcon,
  Upload,
  Trash2,
  Tag,
  Folder,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  DollarSign,
  Lock,
  Eye,
  Sliders,
  Pin,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ArticleDetailsSidebarProps {
  status: string;
  onStatusChange: (status: string) => void;
  scheduledDate: string;
  onScheduledDateChange: (date: string) => void;
  slug: string;
  onSlugChange: (slug: string) => void;
  typeSlug: string;
  fieldsData: Record<string, any>;
  onUpdateFieldsData: (updated: Record<string, any>) => void;
  title: string;
  className?: string;
}

// Default fallback categories inspired by WordPress CMS
const DEFAULT_CATEGORIES = [
  { id: 'cat_engineering', name: 'Engineering', slug: 'engineering' },
  { id: 'cat_design', name: 'Design & UX', slug: 'design-ux' },
  { id: 'cat_product', name: 'Product & Business', slug: 'product-business' },
  { id: 'cat_cloud', name: 'Cloud & API Architecture', slug: 'cloud-api' },
  { id: 'cat_tutorials', name: 'Tutorials & Guides', slug: 'tutorials' },
  { id: 'cat_news', name: 'Company & Tech News', slug: 'news' },
];

// Popular preset tags for quick 1-click addition
const POPULAR_TAGS = [
  'Next.js',
  'TypeScript',
  'Headless CMS',
  'API-First',
  'Tailwind CSS',
  'Prisma',
  'GraphQL',
  'Cloudflare R2',
  'Performance',
  'SEO',
];

// Curated stock featured images for quick selection
const PRESET_COVERS = [
  {
    label: 'Modern Tech Workspace',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
  },
  {
    label: 'Abstract Digital Architecture',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop',
  },
  {
    label: 'Cloud & Network Infrastructure',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
  },
  {
    label: 'Modern Code & Software',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
  },
];

export function ArticleDetailsSidebar({
  status,
  onStatusChange,
  scheduledDate,
  onScheduledDateChange,
  slug,
  onSlugChange,
  typeSlug,
  fieldsData,
  onUpdateFieldsData,
  title,
  className,
}: ArticleDetailsSidebarProps) {
  // Accordion section collapse states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: true,
    featuredImage: true,
    categories: true,
    tags: true,
    excerpt: false,
    discussion: false,
    monetization: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // URL Copy state
  const [copiedUrl, setCopiedUrl] = useState(false);
  const publicUrl = `https://yoursite.com/${typeSlug}/${slug || 'post-slug'}`;

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Featured Image States
  const featuredImage = fieldsData.featured_image || '';
  const featuredImageAlt = fieldsData.featured_image_alt || '';
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSetFeaturedImage = (url: string) => {
    onUpdateFieldsData({ ...fieldsData, featured_image: url });
    setShowUrlInput(false);
    setCustomImageUrl('');
  };

  const handleRemoveFeaturedImage = () => {
    onUpdateFieldsData({ ...fieldsData, featured_image: '', featured_image_alt: '' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.assets?.[0]?.publicUrl || data.url || URL.createObjectURL(file);
        handleSetFeaturedImage(url);
      } else {
        // Fallback to local object URL
        handleSetFeaturedImage(URL.createObjectURL(file));
      }
    } catch {
      handleSetFeaturedImage(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  // Categories State
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const selectedCategories: string[] = Array.isArray(fieldsData.categories)
    ? fieldsData.categories
    : ['cat_engineering', 'cat_cloud'];

  const [categorySearch, setCategorySearch] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const handleToggleCategory = (catId: string) => {
    let next: string[];
    if (selectedCategories.includes(catId)) {
      next = selectedCategories.filter((id) => id !== catId);
    } else {
      next = [...selectedCategories, catId];
    }
    onUpdateFieldsData({ ...fieldsData, categories: next });
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const newId = `cat_${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newCat = {
      id: newId,
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    setCategoriesList((prev) => [...prev, newCat]);
    onUpdateFieldsData({
      ...fieldsData,
      categories: [...selectedCategories, newId],
    });
    setNewCatName('');
    setShowAddCat(false);
  };

  // Tags State
  const tagsList: string[] = Array.isArray(fieldsData.tags)
    ? fieldsData.tags
    : ['Next.js', 'Headless CMS', 'Architecture'];

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (rawTag: string) => {
    const trimmed = rawTag.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (tagsList.includes(trimmed)) return;
    const next = [...tagsList, trimmed];
    onUpdateFieldsData({ ...fieldsData, tags: next });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const next = tagsList.filter((t) => t !== tagToRemove);
    onUpdateFieldsData({ ...fieldsData, tags: next });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Visibility state
  const visibility = fieldsData.visibility || 'public';

  return (
    <div className={cn('flex flex-col h-full bg-card overflow-y-auto thin-scrollbar text-[11px]', className)}>
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: STATUS & PUBLISHING DETAILS                               */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="border-b">
        <button
          type="button"
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Publishing &amp; Status</span>
          </div>
          {openSections.status ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.status && (
          <div className="px-3 pb-3 space-y-2.5 pt-0.5">
            {/* Status Dropdown */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-medium text-muted-foreground">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full h-7 rounded-md border bg-background px-2 text-[10.5px] font-normal focus:ring-1 focus:ring-primary"
              >
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Visibility Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-medium text-muted-foreground">Visibility</label>
                <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0 font-normal">
                  {visibility}
                </Badge>
              </div>
              <select
                value={visibility}
                onChange={(e) => onUpdateFieldsData({ ...fieldsData, visibility: e.target.value })}
                className="w-full h-7 rounded-md border bg-background px-2 text-[10.5px] font-normal focus:ring-1 focus:ring-primary"
              >
                <option value="public">Public (Visible to everyone)</option>
                <option value="private">Private (Only editors and admins)</option>
                <option value="password">Password Protected</option>
              </select>
            </div>

            {/* Scheduled Publish Date */}
            {status === 'SCHEDULED' && (
              <div className="space-y-1.5 p-2 rounded-lg border bg-violet-500/8 border-violet-500/20">
                <label className="text-[10.5px] font-medium text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>Schedule Go-Live Date</span>
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => onScheduledDateChange(e.target.value)}
                  className="h-7 text-[10.5px] bg-background font-normal"
                />
              </div>
            )}

            {/* Permalink Slug */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-medium text-muted-foreground">URL Slug</label>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-[9.5px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  {copiedUrl ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
              <Input
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                className="h-7 text-[10.5px] font-mono bg-background font-normal"
                placeholder="article-url-slug"
              />
              <div className="text-[9.5px] text-muted-foreground font-mono truncate flex items-center gap-1 mt-0.5 font-normal">
                <Globe className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{publicUrl}</span>
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1 pt-0.5">
              <label className="text-[10.5px] font-medium text-muted-foreground">Author</label>
              <div className="flex items-center gap-2 p-1.5 rounded-lg border bg-muted/20">
                <div className="h-5.5 w-5.5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium text-[9.5px]">
                  AM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[11px] text-foreground truncate">Alex Morgan</div>
                  <div className="text-[9.5px] text-muted-foreground font-normal">Administrator</div>
                </div>
              </div>
            </div>

            {/* Stick to the Top / Featured Toggle */}
            <div className="pt-2 border-t flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <label htmlFor="isPinned" className="text-[11px] font-medium text-foreground flex items-center gap-1.5 cursor-pointer">
                  <Pin className="h-3 w-3 text-amber-500" />
                  <span>Stick to Top of Blog</span>
                </label>
                <p className="text-[9.5px] text-muted-foreground font-normal">
                  Pins this post to the top of homepage and archives.
                </p>
              </div>
              <input
                id="isPinned"
                type="checkbox"
                checked={Boolean(fieldsData.is_featured)}
                onChange={(e) => onUpdateFieldsData({ ...fieldsData, is_featured: e.target.checked })}
                className="h-3.5 w-3.5 accent-primary rounded cursor-pointer shrink-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: FEATURED IMAGE (WORDPRESS STYLE)                          */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="border-b">
        <button
          type="button"
          onClick={() => toggleSection('featuredImage')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
            <span>Featured Image</span>
          </div>
          {openSections.featuredImage ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.featuredImage && (
          <div className="px-3 pb-3 space-y-2.5 pt-0.5">
            {featuredImage ? (
              /* Image Thumbnail Card */
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border bg-muted/40 aspect-[16/9] shadow-xs group">
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((v) => !v)}
                      className="px-2 py-0.5 rounded bg-white text-slate-900 font-medium text-[10px] shadow-xs hover:bg-slate-100 cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFeaturedImage}
                      className="px-2 py-0.5 rounded bg-red-600 text-white font-medium text-[10px] shadow-xs hover:bg-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Alt Text Input */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-medium text-muted-foreground">
                    Alt Text (Accessibility &amp; SEO)
                  </label>
                  <Input
                    value={featuredImageAlt}
                    onChange={(e) => onUpdateFieldsData({ ...fieldsData, featured_image_alt: e.target.value })}
                    placeholder="Describe image purpose..."
                    className="h-7 text-[10.5px] bg-background font-normal"
                  />
                </div>

                <div className="flex justify-between items-center text-[9.5px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="text-primary hover:underline cursor-pointer font-medium"
                  >
                    Change Image URL
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFeaturedImage}
                    className="text-destructive hover:underline cursor-pointer flex items-center gap-0.5 font-medium"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    <span>Remove image</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Featured Image Dropzone */
              <div className="space-y-2">
                <label className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                    disabled={isUploading}
                  />
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {isUploading ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="text-center">
                    <span className="font-medium text-[11px] text-foreground block">
                      {isUploading ? 'Uploading image...' : 'Set featured image'}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground font-normal">
                      Click to upload (JPG, PNG, WebP)
                    </span>
                  </div>
                </label>

                {/* Direct URL Toggle */}
                <div className="flex items-center justify-between text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    {showUrlInput ? 'Hide URL input' : 'Or paste image URL...'}
                  </button>
                </div>

                {/* Stock Presets Cloud */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[9.5px] font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                    <span>Or choose high-res preset:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleSetFeaturedImage(preset.url)}
                        className="text-left p-1 rounded border bg-background hover:bg-muted text-[9.5px] truncate transition-colors cursor-pointer font-normal"
                        title={preset.label}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom URL Input modal / dropdown */}
            {showUrlInput && (
              <div className="p-2 rounded-lg border bg-muted/30 space-y-1.5 mt-1.5">
                <label className="text-[9.5px] font-medium text-foreground">Paste Image URL:</label>
                <div className="flex gap-1.5">
                  <Input
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="h-6.5 text-[10px] bg-background flex-1 font-normal"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-6.5 text-[9.5px] px-2 font-medium"
                    onClick={() => handleSetFeaturedImage(customImageUrl)}
                    disabled={!customImageUrl.trim()}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3: CATEGORIES (WORDPRESS HIERARCHICAL)                        */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="border-b">
        <button
          type="button"
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Folder className="h-3.5 w-3.5 text-amber-500" />
            <span>Categories</span>
            <span className="text-[9.5px] font-normal text-muted-foreground">
              ({selectedCategories.length} selected)
            </span>
          </div>
          {openSections.categories ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.categories && (
          <div className="px-3 pb-3 space-y-2 pt-0.5">
            {/* Search Categories */}
            {categoriesList.length > 5 && (
              <Input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                className="h-6.5 text-[10.5px] bg-background mb-1.5 font-normal"
              />
            )}

            {/* Checkbox List */}
            <div className="space-y-1 max-h-44 overflow-y-auto thin-scrollbar pr-1">
              {categoriesList
                .filter((c) =>
                  c.name.toLowerCase().includes(categorySearch.toLowerCase())
                )
                .map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={cn(
                        'flex items-center gap-1.5 p-1 rounded-md transition-colors cursor-pointer text-[10.5px] select-none',
                        isChecked
                          ? 'bg-primary/10 text-foreground font-medium'
                          : 'hover:bg-muted text-muted-foreground font-normal'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCategory(cat.id)}
                        className="h-3 w-3 accent-primary rounded cursor-pointer"
                      />
                      <span className="truncate flex-1">{cat.name}</span>
                    </label>
                  );
                })}
            </div>

            {/* Add New Category Link / Form */}
            {!showAddCat ? (
              <button
                type="button"
                onClick={() => setShowAddCat(true)}
                className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1 pt-0.5 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add New Category</span>
              </button>
            ) : (
              <form onSubmit={handleAddNewCategory} className="space-y-1.5 pt-1.5 border-t">
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name..."
                  className="h-6.5 text-[10.5px] bg-background font-normal"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <Button type="submit" size="sm" className="h-6.5 text-[9.5px] px-2.5 font-medium">
                    Add Category
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6.5 text-[9.5px] px-2 font-normal"
                    onClick={() => setShowAddCat(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 4: TAGS (WORDPRESS TAGS CLOUD)                                */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="border-b">
        <button
          type="button"
          onClick={() => toggleSection('tags')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-emerald-500" />
            <span>Tags</span>
            <span className="text-[9.5px] font-normal text-muted-foreground">
              ({tagsList.length})
            </span>
          </div>
          {openSections.tags ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.tags && (
          <div className="px-3 pb-3 space-y-2.5 pt-0.5">
            {/* Tag Input */}
            <div className="flex gap-1.5">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag and press Enter..."
                className="h-7 text-[10.5px] bg-background flex-1 font-normal"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-[9.5px] px-2 font-medium"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Active Tag Pills */}
            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tagsList.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-normal bg-muted border text-foreground"
                  >
                    <span>{tg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tg)}
                      className="hover:text-destructive cursor-pointer"
                      title="Remove tag"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular Tags Suggestion Cloud */}
            <div className="space-y-1 pt-1 border-t">
              <span className="text-[9.5px] font-medium text-muted-foreground">
                Choose from most used tags:
              </span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_TAGS.filter((pt) => !tagsList.includes(pt)).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => handleAddTag(pt)}
                    className="text-[9.5px] px-1.5 py-0.5 rounded border bg-background hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors cursor-pointer font-normal"
                  >
                    +{pt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 5: EXCERPT                                                   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="border-b">
        <button
          type="button"
          onClick={() => toggleSection('excerpt')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-violet-500" />
            <span>Excerpt</span>
          </div>
          {openSections.excerpt ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.excerpt && (
          <div className="px-3 pb-3 space-y-1.5 pt-0.5">
            <textarea
              rows={3}
              value={fieldsData.summary || ''}
              onChange={(e) => onUpdateFieldsData({ ...fieldsData, summary: e.target.value })}
              placeholder="Write an excerpt (optional)..."
              className="w-full rounded-md border bg-background p-2 text-[10.5px] resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed font-normal"
            />
            <p className="text-[9.5px] text-muted-foreground leading-normal font-normal">
              Excerpts are optional hand-crafted summaries used across article listings, feeds, and social previews.
            </p>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 6: DISCUSSION SETTINGS                                       */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="border-b">
        <button
          type="button"
          onClick={() => toggleSection('discussion')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            <span>Discussion Settings</span>
          </div>
          {openSections.discussion ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.discussion && (
          <div className="px-3 pb-3 space-y-2 pt-0.5">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fieldsData.allowComments !== false}
                onChange={(e) => onUpdateFieldsData({ ...fieldsData, allowComments: e.target.checked })}
                className="h-3.5 w-3.5 accent-primary rounded cursor-pointer mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-medium text-foreground block">Allow Comments</span>
                <span className="text-[9.5px] text-muted-foreground block font-normal">
                  Enables reader comments &amp; discussion thread on this post.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer pt-1 border-t">
              <input
                type="checkbox"
                checked={Boolean(fieldsData.allowPingbacks)}
                onChange={(e) => onUpdateFieldsData({ ...fieldsData, allowPingbacks: e.target.checked })}
                className="h-3.5 w-3.5 accent-primary rounded cursor-pointer mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-medium text-foreground block">
                  Allow Pingbacks &amp; Trackbacks
                </span>
                <span className="text-[9.5px] text-muted-foreground block font-normal">
                  Accept notifications when other blogs link to this post.
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* SECTION 7: MONETIZATION & ADS                                        */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('monetization')}
          className="w-full flex items-center justify-between p-2.5 font-medium text-foreground text-[11px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-amber-500" />
            <span>Monetization &amp; Ads</span>
          </div>
          {openSections.monetization ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {openSections.monetization && (
          <div className="px-3 pb-3 space-y-2.5 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <label htmlFor="disableAds" className="font-medium text-[10.5px] cursor-pointer">
                  Disable Ads on this Article
                </label>
                <p className="text-[9.5px] text-muted-foreground font-normal">
                  Suppresses in-article banners for sensitive or sponsored content.
                </p>
              </div>
              <input
                id="disableAds"
                type="checkbox"
                checked={Boolean(fieldsData.disableAds)}
                onChange={(e) => onUpdateFieldsData({ ...fieldsData, disableAds: e.target.checked })}
                className="h-3.5 w-3.5 accent-amber-500 rounded cursor-pointer mt-0.5"
              />
            </div>

            {!fieldsData.disableAds && (
              <div className="pt-1.5 border-t space-y-1">
                <label className="text-[9.5px] font-medium text-muted-foreground">
                  In-Article Frequency
                </label>
                <select
                  value={fieldsData.adInjectionRule || 'default'}
                  onChange={(e) => onUpdateFieldsData({ ...fieldsData, adInjectionRule: e.target.value })}
                  className="w-full h-6.5 rounded border bg-background px-2 text-[10px] font-normal focus:ring-1 focus:ring-primary"
                >
                  <option value="default">Use Global Rules (P2, P5, P9)</option>
                  <option value="conservative">Conservative (P3 Only)</option>
                  <option value="aggressive">High Yield (P1, P3, P5, P7)</option>
                  <option value="header_only">Header &amp; Sidebar Only</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
