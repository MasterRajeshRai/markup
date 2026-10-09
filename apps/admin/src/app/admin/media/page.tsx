'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Image as ImageIcon,
  Upload,
  Folder,
  Plus,
  Trash2,
  Search,
  File,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Layers,
  Crosshair,
  Sparkles,
  RefreshCw,
  HardDrive,
  Shield,
  Globe,
  FileText,
  Lock,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCheck,
  Info,
  Sliders,
  X,
  Download,
} from 'lucide-react';
import { DEFAULT_CROP_PRESETS, toSeoFriendlyName, type CropPresetDefinition } from '@headless/core';
import { ModuleGuard } from '@/components/module-guard';
import { useAuth } from '@/components/auth-context';
import { cn } from '@/lib/utils';
import { evaluateImageSeo, generateSmartAltFromFilename, type ImageSeoResult } from '@/lib/image-seo';

interface PresetItem extends CropPresetDefinition {
  id?: string;
}

interface MediaVariantItem {
  id: string;
  presetSlug: string;
  presetName?: string;
  width: number;
  height: number;
  format: string;
  quality: number;
  fileSize: number;
  storageProvider: string;
  storageBucket?: string;
  storageKey?: string;
  publicUrl: string;
  seoName?: string;
  r2ReferenceName?: string;
}

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  seoName?: string;
  r2ReferenceName?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  focalPoint?: { x: number; y: number };
  focalX?: number;
  focalY?: number;
  originalWidth?: number;
  originalHeight?: number;
  originalSize?: number;
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  focusKeyword?: string;
  publicUrl: string;
  storageDriver?: string;
  storageBucket?: string;
  storageKey?: string;
  variants?: MediaVariantItem[];
  mediaVariants?: MediaVariantItem[];
  usageCount: number;
  createdAt: string;
  metadata?: any;
  uploaderName?: string;
  createdById?: string;
}

interface FolderItem {
  id: string;
  name: string;
  slug: string;
  _count?: { media: number };
}

interface ProcessingStep {
  id: string;
  label: string;
}

const PIPELINE_STEPS: ProcessingStep[] = [
  { id: 'validating', label: 'Magic Bytes & Decompression Bomb Validation' },
  { id: 'cropping', label: 'Focal-Point Aspect-Ratio Auto-Cropping' },
  { id: 'converting', label: 'Intermediate JPEG & High-Efficiency WebP Conversion' },
  { id: 'uploading', label: 'Cloudflare R2 Bucket Upload' },
  { id: 'verifying', label: 'Cloudflare R2 HeadObject Verification' },
  { id: 'cleaning', label: 'Purging Temporary Original File (Zero-Retention)' },
];

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const { user, canViewAllMedia } = useAuth();
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine'>('all');

  // WordPress-style Toolbar Controls
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [seoFilter, setSeoFilter] = useState<'all' | 'missing_alt' | 'needs_work' | 'good'>('all');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Selected asset for inspector
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(0);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [assetVariants, setAssetVariants] = useState<MediaVariantItem[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Inspector Editing State
  const [editingTitle, setEditingTitle] = useState('');
  const [editingAltText, setEditingAltText] = useState('');
  const [editingCaption, setEditingCaption] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingFocusKeyword, setEditingFocusKeyword] = useState('');
  const [metadataSaved, setMetadataSaved] = useState(false);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  // Available presets from API / defaults
  const [presets, setPresets] = useState<PresetItem[]>(DEFAULT_CROP_PRESETS);
  const [selectedPresetSlugs, setSelectedPresetSlugs] = useState<string[]>(
    DEFAULT_CROP_PRESETS.filter((p) => p.isDefault).map((p) => p.slug)
  );

  // Upload configuration modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customSeoName, setCustomSeoName] = useState<string>('');
  const [focalX, setFocalX] = useState<number>(0.5);
  const [focalY, setFocalY] = useState<number>(0.5);

  // Live Pipeline Progress state
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('validating');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);

  // Preset Manager modal state
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetWidth, setNewPresetWidth] = useState('800');
  const [newPresetHeight, setNewPresetHeight] = useState('600');
  const [newPresetFit, setNewPresetFit] = useState<'cover' | 'contain'>('cover');
  const [creatingPreset, setCreatingPreset] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  // Fetch Media Items
  const fetchMedia = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (!canViewAllMedia || scopeFilter === 'mine') {
      params.set('uploader', 'me');
    }
    if (selectedFolder) params.set('folderId', selectedFolder);
    if (filterType) params.set('mimeType', filterType);
    if (search) params.set('q', search);

    fetch(`/api/v1/media?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          let list = res.data;
          if (!canViewAllMedia || scopeFilter === 'mine') {
            if (user) {
              list = list.filter((m: any) =>
                m.createdById === user.id ||
                m.uploaderName?.includes(user.name.split(' ')[0])
              );
            }
          }
          setMedia(list);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchFolders = () => {
    fetch('/api/v1/media/folders')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setFolders(res.data);
      });
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const res = await fetch('/api/v1/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) fetchFolders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete folder "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/media/folders?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedFolder === id) setSelectedFolder('');
        fetchFolders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPresets = () => {
    fetch('/api/v1/media/presets')
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setPresets(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchFolders();
    fetchPresets();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder, filterType]);

  // Filter media based on SEO filter and search
  const filteredMedia = useMemo(() => {
    return media.filter((asset) => {
      if (seoFilter === 'missing_alt') {
        return !asset.altText || asset.altText.trim() === '';
      }
      if (seoFilter === 'needs_work') {
        const res = evaluateImageSeo({
          filename: asset.filename,
          altText: asset.altText,
          title: asset.title || asset.metadata?.title,
          focusKeyword: asset.focusKeyword || asset.metadata?.focusKeyword,
          size: asset.size,
          mimeType: asset.mimeType,
        });
        return res.score < 75;
      }
      if (seoFilter === 'good') {
        const res = evaluateImageSeo({
          filename: asset.filename,
          altText: asset.altText,
          title: asset.title || asset.metadata?.title,
          focusKeyword: asset.focusKeyword || asset.metadata?.focusKeyword,
          size: asset.size,
          mimeType: asset.mimeType,
        });
        return res.score >= 75;
      }
      return true;
    });
  }, [media, seoFilter]);

  // Open inspector & load variants
  const handleSelectAsset = (asset: MediaItem, index?: number) => {
    setSelectedAsset(asset);
    setSelectedAssetIndex(
      index !== undefined ? index : filteredMedia.findIndex((m) => m.id === asset.id)
    );
    setIsInspectorOpen(true);
    setLoadingVariants(true);

    // Sync input fields with asset
    setEditingTitle(asset.title || asset.metadata?.title || '');
    setEditingAltText(asset.altText || '');
    setEditingCaption(asset.caption || '');
    setEditingDescription(asset.description || '');
    setEditingFocusKeyword(asset.focusKeyword || asset.metadata?.focusKeyword || '');
    setMetadataSaved(false);

    fetch(`/api/v1/media/${asset.id}/variants`)
      .then((r) => r.json())
      .then((res) => {
        if (res.variants) {
          setAssetVariants(res.variants);
        } else if (asset.mediaVariants) {
          setAssetVariants(asset.mediaVariants);
        } else {
          setAssetVariants([]);
        }
        setLoadingVariants(false);
      })
      .catch(() => {
        if (asset.mediaVariants) setAssetVariants(asset.mediaVariants);
        setLoadingVariants(false);
      });
  };

  // Next and Previous Asset Navigation (WordPress Attachment Viewer)
  const handlePrevAsset = () => {
    if (filteredMedia.length <= 1) return;
    const newIndex = selectedAssetIndex > 0 ? selectedAssetIndex - 1 : filteredMedia.length - 1;
    handleSelectAsset(filteredMedia[newIndex], newIndex);
  };

  const handleNextAsset = () => {
    if (filteredMedia.length <= 1) return;
    const newIndex = selectedAssetIndex < filteredMedia.length - 1 ? selectedAssetIndex + 1 : 0;
    handleSelectAsset(filteredMedia[newIndex], newIndex);
  };

  // Keyboard navigation for attachment viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInspectorOpen) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevAsset();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextAsset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInspectorOpen, selectedAssetIndex, filteredMedia]);

  // Handle files selected via file input
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const firstFile = fileList[0];

    if (firstFile.type.startsWith('image/') && !firstFile.type.includes('svg')) {
      setPendingFiles(fileList);
      setPreviewUrl(URL.createObjectURL(firstFile));
      setCustomSeoName(toSeoFriendlyName(firstFile.name));
      setFocalX(0.5);
      setFocalY(0.5);
      setIsUploadModalOpen(true);
    } else {
      startPipelineUpload(fileList, [], 0.5, 0.5);
    }
  };

  // Focal point click handler
  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imagePreviewRef.current) return;
    const rect = imagePreviewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setFocalX(Math.round(x * 100) / 100);
    setFocalY(Math.round(y * 100) / 100);
  };

  // Execute upload pipeline
  const startPipelineUpload = async (
    files: File[],
    selectedPresets: string[],
    fx: number,
    fy: number,
    seoSlug?: string
  ) => {
    setIsUploadModalOpen(false);
    setIsProcessingModalOpen(true);
    setProcessingProgress(15);
    setCurrentStep('validating');
    setProcessingError(null);
    setProcessingComplete(false);

    const formData = new FormData();
    if (selectedFolder) formData.append('folderId', selectedFolder);
    formData.append('focalX', fx.toString());
    formData.append('focalY', fy.toString());
    if (seoSlug) {
      formData.append('seoName', seoSlug);
    }
    if (selectedPresets.length > 0) {
      formData.append('presets', selectedPresets.join(','));
    }

    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const progressTimer = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev < 30) {
            setCurrentStep('cropping');
            return prev + 5;
          }
          if (prev < 65) {
            setCurrentStep('converting');
            return prev + 4;
          }
          if (prev < 85) {
            setCurrentStep('uploading');
            return prev + 3;
          }
          if (prev < 95) {
            setCurrentStep('verifying');
            return prev + 1;
          }
          return prev;
        });
      }, 300);

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      const data = await res.json();

      if (!res.ok) {
        setProcessingError(data.error || 'Pipeline upload failed.');
        setCurrentStep('failed');
        return;
      }

      setCurrentStep('cleaning');
      setProcessingProgress(100);
      setProcessingComplete(true);

      fetchMedia();
      fetchFolders();

      setTimeout(() => {
        setIsProcessingModalOpen(false);
      }, 1500);
    } catch {
      setProcessingError('Network error while processing media pipeline.');
      setCurrentStep('failed');
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  // Delete single asset
  const handleDelete = async (id: string, force = false) => {
    const res = await fetch(`/api/v1/media/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.requireConfirmation) {
        if (
          confirm(
            `${data.error}\n\nDo you want to FORCE DELETE this asset and purge all associated Cloudflare R2 WebP variants?`
          )
        ) {
          handleDelete(id, true);
        }
      } else {
        alert(data.error || 'Delete failed');
      }
      return;
    }

    setIsInspectorOpen(false);
    setSelectedAsset(null);
    fetchMedia();
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected asset(s)?`)) return;

    for (const id of Array.from(selectedIds)) {
      await fetch(`/api/v1/media/${id}?force=true`, { method: 'DELETE' });
    }
    setSelectedIds(new Set());
    setBulkMode(false);
    fetchMedia();
  };

  // Save metadata & Image SEO fields
  const handleUpdateMetadata = async () => {
    if (!selectedAsset) return;
    setIsSavingMetadata(true);

    try {
      const res = await fetch(`/api/v1/media/${selectedAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: editingAltText,
          title: editingTitle,
          caption: editingCaption,
          description: editingDescription,
          focusKeyword: editingFocusKeyword,
        }),
      });

      if (res.ok) {
        setMetadataSaved(true);
        setTimeout(() => setMetadataSaved(false), 2500);

        // Update local media state directly so UI remains instant
        setMedia((prev) =>
          prev.map((m) =>
            m.id === selectedAsset.id
              ? {
                  ...m,
                  altText: editingAltText,
                  title: editingTitle,
                  caption: editingCaption,
                  description: editingDescription,
                  focusKeyword: editingFocusKeyword,
                  metadata: {
                    ...(m.metadata || {}),
                    title: editingTitle,
                    focusKeyword: editingFocusKeyword,
                  },
                }
              : m
          )
        );

        setSelectedAsset((prev) =>
          prev
            ? {
                ...prev,
                altText: editingAltText,
                title: editingTitle,
                caption: editingCaption,
                description: editingDescription,
                focusKeyword: editingFocusKeyword,
                metadata: {
                  ...(prev.metadata || {}),
                  title: editingTitle,
                  focusKeyword: editingFocusKeyword,
                },
              }
            : null
        );
      }
    } finally {
      setIsSavingMetadata(false);
    }
  };

  // Smart Alt Text generation
  const handleSuggestAlt = () => {
    if (!selectedAsset) return;
    const suggestion = generateSmartAltFromFilename(
      selectedAsset.originalName || selectedAsset.filename
    );
    setEditingAltText(suggestion);
    if (!editingTitle) {
      setEditingTitle(suggestion);
    }
  };

  // Clean temp uploads
  const handleCleanupTempFiles = async () => {
    try {
      const res = await fetch('/api/v1/media/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxAgeMinutes: 60 }),
      });
      const data = await res.json();
      alert(data.message || 'Cleanup completed');
    } catch {
      alert('Cleanup request failed');
    }
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Public asset URL copied to clipboard!');
  };

  const togglePresetSelection = (slug: string) => {
    setSelectedPresetSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim() || !newPresetWidth || !newPresetHeight) return;
    setCreatingPreset(true);
    try {
      const slug = newPresetName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const res = await fetch('/api/v1/media/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPresetName,
          slug,
          width: parseInt(newPresetWidth),
          height: parseInt(newPresetHeight),
          fit: newPresetFit,
          isDefault: false,
        }),
      });
      if (res.ok) {
        fetchPresets();
        setNewPresetName('');
        setIsPresetModalOpen(false);
      }
    } finally {
      setCreatingPreset(false);
    }
  };

  const handleDeletePreset = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/media/presets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPresets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time SEO analysis for selected asset
  const liveSeo: ImageSeoResult | null = useMemo(() => {
    if (!selectedAsset) return null;
    return evaluateImageSeo({
      filename: selectedAsset.filename,
      originalName: selectedAsset.originalName,
      altText: editingAltText,
      title: editingTitle,
      caption: editingCaption,
      description: editingDescription,
      focusKeyword: editingFocusKeyword,
      size: selectedAsset.size,
      mimeType: selectedAsset.mimeType,
      width: selectedAsset.width,
      height: selectedAsset.height,
    });
  }, [selectedAsset, editingAltText, editingTitle, editingCaption, editingDescription, editingFocusKeyword]);

  return (
    <ModuleGuard moduleId="media">
      <div className="space-y-6">
        {/* Top Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Library</h1>
              <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                WordPress DAM & Image SEO
              </Badge>
              {!canViewAllMedia && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Lock className="h-3 w-3" />
                  Your Uploads Only
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Complete media asset management with real-time Image SEO scoring, WebP variants, and Cloudflare R2 storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canViewAllMedia && (
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs mr-1">
                <button
                  type="button"
                  onClick={() => setScopeFilter('all')}
                  className={cn(
                    'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
                    scopeFilter === 'all'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All Media
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('mine')}
                  className={cn(
                    'px-3 py-1 rounded-md font-medium transition-colors cursor-pointer',
                    scopeFilter === 'mine'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  My Uploads
                </button>
              </div>
            )}

            <Button
              size="sm"
              variant={bulkMode ? 'default' : 'outline'}
              onClick={() => {
                setBulkMode(!bulkMode);
                setSelectedIds(new Set());
              }}
              className="text-xs gap-1.5 h-8 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>{bulkMode ? 'Cancel Selection' : 'Bulk Select'}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanupTempFiles}
              title="Clean orphaned temp uploads older than 60 minutes"
              className="text-xs gap-1.5 h-8 cursor-pointer hidden sm:flex"
            >
              <HardDrive className="h-3.5 w-3.5" />
              <span>Temp Clean</span>
            </Button>

            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 shadow-sm h-8 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Upload className="h-4 w-4" />
              <span>Add New Media</span>
            </Button>
          </div>
        </div>

        {/* Limited User Scope Banner */}
        {!canViewAllMedia && user && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Lock className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="font-medium truncate">
                Authorship Scoped: Logged in as <strong className="font-semibold text-foreground">{user.name}</strong> ({user.roleName || user.role}). Only media assets uploaded by you are displayed.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono text-[10px] shrink-0 font-semibold">
              RBAC PROTECTED
            </span>
          </div>
        )}

        {/* WordPress-style Filter Toolbar */}
        <Card className="p-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left: View Switcher & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* View Switcher: Grid vs List */}
              <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2.5 text-xs gap-1"
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="h-7 px-2.5 text-xs gap-1"
                  title="List View"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>

              {/* Filter: Media Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs shadow-2xs font-medium text-foreground focus:outline-none"
              >
                <option value="">All Media Types</option>
                <option value="image">Images (WebP, JPG, PNG)</option>
                <option value="video">Videos (MP4, WebM)</option>
                <option value="audio">Audio Tracks</option>
                <option value="application">Documents & PDFs</option>
              </select>

              {/* Filter: Image SEO Status */}
              <select
                value={seoFilter}
                onChange={(e) => setSeoFilter(e.target.value as any)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs shadow-2xs font-medium text-foreground focus:outline-none"
              >
                <option value="all">All Image SEO Statuses</option>
                <option value="missing_alt">🔴 Missing Alt Text (Action Needed)</option>
                <option value="needs_work">🟡 Needs SEO Work (&lt; 75)</option>
                <option value="good">🟢 Good Image SEO (75+)</option>
              </select>

              {/* Filter: Storage Folder */}
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs shadow-2xs font-medium text-foreground focus:outline-none"
              >
                <option value="">All Storage Folders</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name} ({f._count?.media || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Search box */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by title, alt text, filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                className="pl-8 pr-7 text-xs h-8 bg-card"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchMedia();
                  }}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bulk Action Controls Bar */}
          {bulkMode && (
            <div className="mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2 bg-muted/20 -mx-3 -mb-3 p-3 rounded-b-xl">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedIds.size === filteredMedia.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(filteredMedia.map((m) => m.id)));
                    }
                  }}
                  className="h-7 text-xs"
                >
                  {selectedIds.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-xs text-muted-foreground font-medium">
                  {selectedIds.size} of {filteredMedia.length} item(s) selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={selectedIds.size === 0}
                  onClick={handleBulkDelete}
                  className="h-7 text-xs gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Main Area: Folders & Presets on Left, Assets on Right */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column: Folders & Preset Manager */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Storage Folders</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground"
                  title="Create New Folder"
                  onClick={() => {
                    const name = prompt('Enter new folder name:');
                    if (name && name.trim()) {
                      handleCreateFolder(name.trim());
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                <Button
                  variant={selectedFolder === '' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFolder('')}
                  className="w-full justify-between h-8 text-xs font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-3.5 w-3.5" />
                    <span>All Media</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
                    {media.length}
                  </Badge>
                </Button>

                {folders.map((f) => (
                  <div key={f.id} className="group flex items-center gap-1">
                    <Button
                      variant={selectedFolder === f.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedFolder(f.id)}
                      className="flex-1 justify-between h-8 text-xs font-medium cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Folder className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
                        {f._count?.media || 0}
                      </Badge>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleDeleteFolder(e, f.id, f.name)}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer transition-opacity"
                      title={`Delete folder ${f.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Crop Presets Specs Card */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Crop Presets</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">{presets.length} Active</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPresetModalOpen(true)}
                      className="h-6 px-1.5 text-[10px] text-primary"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 text-[11px] text-muted-foreground">
                {presets.map((p) => (
                  <div key={p.slug} className="flex items-center justify-between py-0.5 border-b border-muted/50 last:border-0">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="font-mono text-[10px]">{p.width}×{p.height} ({p.fit})</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Image SEO Summary Card */}
            <Card className="bg-muted/15 border-dashed">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Image SEO Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-[11px] text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  • <strong>Descriptive Alt Text:</strong> Always describe the image subject for Google Image ranking and accessibility.
                </p>
                <p>
                  • <strong>10–125 Characters:</strong> Keep alt text concise without keyword stuffing.
                </p>
                <p>
                  • <strong>WebP Format:</strong> WebP reduces size by 30% compared to JPG/PNG, speeding up Largest Contentful Paint (LCP).
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Media Assets (Grid or List View) */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="py-20 text-center text-xs text-muted-foreground">
                Loading digital media library...
              </div>
            ) : filteredMedia.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-foreground text-sm">No media assets found</p>
                <p className="text-xs mt-0.5">Try relaxing filters or upload new images to begin.</p>
              </Card>
            ) : viewMode === 'grid' ? (
              /* ----------------------------------------------------------- */
              /* 1. WORDPRESS GRID VIEW */
              /* ----------------------------------------------------------- */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((asset, index) => {
                  const isImage = asset.mimeType.startsWith('image/');
                  const isSelected = selectedIds.has(asset.id);
                  const seo = evaluateImageSeo({
                    filename: asset.filename,
                    altText: asset.altText,
                    title: asset.title || asset.metadata?.title,
                    focusKeyword: asset.focusKeyword || asset.metadata?.focusKeyword,
                    size: asset.size,
                    mimeType: asset.mimeType,
                  });

                  return (
                    <Card
                      key={asset.id}
                      onClick={() => {
                        if (bulkMode) {
                          const next = new Set(selectedIds);
                          if (isSelected) next.delete(asset.id);
                          else next.add(asset.id);
                          setSelectedIds(next);
                        } else {
                          handleSelectAsset(asset, index);
                        }
                      }}
                      className={cn(
                        'group relative overflow-hidden hover:border-primary/60 cursor-pointer transition-all flex flex-col justify-between',
                        isSelected && 'border-primary ring-2 ring-primary/40'
                      )}
                    >
                      {/* Thumbnail Container */}
                      <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden relative select-none">
                        {isImage ? (
                          <img
                            src={asset.publicUrl}
                            alt={asset.altText || asset.originalName}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <File className="h-10 w-10 text-muted-foreground/60" />
                        )}

                        {/* Top-Left: Image SEO Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          {asset.altText && asset.altText.trim() ? (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px] font-mono px-1.5 py-0.5 backdrop-blur-md shadow-xs gap-1',
                                seo.grade === 'Good'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                              )}
                            >
                              <span>SEO {seo.score}</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="text-[9px] px-1.5 py-0.5 bg-rose-950/90 text-rose-300 border border-rose-600/40"
                            >
                              No Alt Text
                            </Badge>
                          )}
                        </div>

                        {/* Top-Right: Selection checkbox or usage badge */}
                        <div className="absolute top-2 right-2 z-10">
                          {bulkMode ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = new Set(selectedIds);
                                if (isSelected) next.delete(asset.id);
                                else next.add(asset.id);
                                setSelectedIds(next);
                              }}
                              className={cn(
                                'h-5 w-5 rounded border bg-background/90 flex items-center justify-center',
                                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                              )}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </div>
                          ) : asset.usageCount > 0 ? (
                            <Badge
                              variant="secondary"
                              className="text-[9px] bg-background/85 backdrop-blur-sm"
                            >
                              {asset.usageCount} {asset.usageCount === 1 ? 'use' : 'uses'}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {/* Card Meta footer */}
                      <div className="p-2.5 space-y-1">
                        <div className="font-semibold text-xs text-foreground truncate" title={asset.title || asset.filename}>
                          {asset.title || asset.filename}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate" title={asset.altText || 'No Alt Text'}>
                          {asset.altText ? (
                            <span className="text-muted-foreground">Alt: {asset.altText}</span>
                          ) : (
                            <span className="text-rose-500/80 italic">Alt text missing</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 border-t border-border/40">
                          <span>{(asset.size / 1024).toFixed(1)} KB</span>
                          <span className="uppercase font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {asset.mimeType === 'image/webp' ? 'WEBP' : asset.mimeType.split('/')[1]}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* ----------------------------------------------------------- */
              /* 2. WORDPRESS LIST VIEW (Classic Media Table) */
              /* ----------------------------------------------------------- */
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground text-[11px] font-semibold">
                      <tr>
                        {bulkMode && <th className="p-3 w-8"></th>}
                        <th className="p-3 w-16">Preview</th>
                        <th className="p-3">File / Title</th>
                        <th className="p-3">Image SEO Status</th>
                        <th className="p-3">Dimensions & Size</th>
                        <th className="p-3">Folder</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredMedia.map((asset, index) => {
                        const isImage = asset.mimeType.startsWith('image/');
                        const isSelected = selectedIds.has(asset.id);
                        const seo = evaluateImageSeo({
                          filename: asset.filename,
                          altText: asset.altText,
                          title: asset.title || asset.metadata?.title,
                          focusKeyword: asset.focusKeyword || asset.metadata?.focusKeyword,
                          size: asset.size,
                          mimeType: asset.mimeType,
                        });

                        return (
                          <tr
                            key={asset.id}
                            onClick={() => {
                              if (bulkMode) {
                                const next = new Set(selectedIds);
                                if (isSelected) next.delete(asset.id);
                                else next.add(asset.id);
                                setSelectedIds(next);
                              } else {
                                handleSelectAsset(asset, index);
                              }
                            }}
                            className={cn(
                              'hover:bg-muted/30 cursor-pointer transition-colors',
                              isSelected && 'bg-primary/5'
                            )}
                          >
                            {bulkMode && (
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    const next = new Set(selectedIds);
                                    if (isSelected) next.delete(asset.id);
                                    else next.add(asset.id);
                                    setSelectedIds(next);
                                  }}
                                  className="h-4 w-4 rounded border-border"
                                />
                              </td>
                            )}

                            {/* Thumbnail */}
                            <td className="p-3">
                              <div className="h-11 w-11 rounded-lg overflow-hidden bg-muted/50 border flex items-center justify-center shrink-0">
                                {isImage ? (
                                  <img
                                    src={asset.publicUrl}
                                    alt={asset.altText || ''}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <File className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            </td>

                            {/* File / Title */}
                            <td className="p-3 max-w-xs">
                              <div className="font-semibold text-foreground truncate">
                                {asset.title || asset.filename}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono truncate">
                                {asset.filename}
                              </div>
                            </td>

                            {/* Image SEO Status */}
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    'text-[10px] font-mono font-semibold',
                                    seo.grade === 'Good'
                                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                  )}
                                >
                                  SEO {seo.score}/100
                                </Badge>
                                {asset.altText ? (
                                  <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                    "{asset.altText}"
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-rose-500 font-medium">Missing Alt Text</span>
                                )}
                              </div>
                            </td>

                            {/* Dimensions & Size */}
                            <td className="p-3 text-[11px] text-muted-foreground">
                              <div>{asset.width && asset.height ? `${asset.width}×${asset.height} px` : 'Vector/Doc'}</div>
                              <div className="font-mono text-[10px]">{(asset.size / 1024).toFixed(1)} KB</div>
                            </td>

                            {/* Folder */}
                            <td className="p-3 text-[11px] text-muted-foreground">
                              {asset.metadata?.folderName || 'Root'}
                            </td>

                            {/* Date */}
                            <td className="p-3 text-[11px] text-muted-foreground whitespace-nowrap">
                              {new Date(asset.createdAt).toLocaleDateString()}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSelectAsset(asset, index)}
                                  className="h-7 px-2 text-xs"
                                >
                                  Edit SEO
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyUrlToClipboard(asset.publicUrl)}
                                  className="h-7 w-7"
                                  title="Copy URL"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. SHADCN DIALOG: INTERACTIVE UPLOAD & FOCAL POINT MODAL */}
        {/* ------------------------------------------------------------- */}
        <Dialog
          open={isUploadModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsUploadModalOpen(false);
              if (previewUrl) URL.revokeObjectURL(previewUrl);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:rounded-2xl">
            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-card">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <DialogTitle className="text-base font-bold">Configure Auto-Crop & Focal Point</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground pl-9 text-left">
                Click the preview image to position the focal center point. Choose the target crop presets to generate.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-130px)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Image Preview with Crosshair */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <Crosshair className="h-3.5 w-3.5 text-primary" />
                      <span>Focal Point Position</span>
                    </Label>
                    <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0.5">
                      X: {focalX.toFixed(2)}, Y: {focalY.toFixed(2)}
                    </Badge>
                  </div>

                  <div
                    ref={imagePreviewRef}
                    onClick={handleFocalPointClick}
                    className="relative rounded-xl border bg-slate-950 flex items-center justify-center h-72 sm:h-80 w-full overflow-hidden cursor-crosshair select-none ring-1 ring-border/50 shadow-inner group"
                  >
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Upload Preview"
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                    )}

                    <div
                      className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center z-10"
                      style={{ left: `${focalX * 100}%`, top: `${focalY * 100}%` }}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/25 backdrop-blur-xs shadow-xl flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 text-[10px] bg-black/75 text-white/90 px-2.5 py-1 rounded-md backdrop-blur-sm pointer-events-none flex items-center gap-1.5 border border-white/10 shadow-sm">
                      <Crosshair className="h-3 w-3 text-primary" />
                      <span>Click anywhere to position crop center</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="text-[11px]">Quick positions:</span>
                    <div className="flex gap-1.5">
                      {[
                        { label: 'Center', x: 0.5, y: 0.5 },
                        { label: 'Top', x: 0.5, y: 0.2 },
                        { label: 'Bottom', x: 0.5, y: 0.8 },
                        { label: 'Left', x: 0.2, y: 0.5 },
                        { label: 'Right', x: 0.8, y: 0.5 },
                      ].map((pos) => (
                        <Button
                          key={pos.label}
                          type="button"
                          size="sm"
                          variant={focalX === pos.x && focalY === pos.y ? 'default' : 'outline'}
                          onClick={() => {
                            setFocalX(pos.x);
                            setFocalY(pos.y);
                          }}
                          className="h-6 px-2 text-[10px] font-medium"
                        >
                          {pos.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Presets & SEO Filename */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 p-3 rounded-xl border bg-muted/25">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customSeoName" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        <span>SEO Friendly Image Name</span>
                      </Label>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono border-emerald-500/30">
                        Primary Filename
                      </Badge>
                    </div>
                    <Input
                      id="customSeoName"
                      value={customSeoName}
                      onChange={(e) => setCustomSeoName(toSeoFriendlyName(e.target.value))}
                      placeholder="e.g. modern-living-room-decor-2026"
                      className="h-8 font-mono text-xs"
                    />
                    <div className="space-y-1 text-[11px] pt-0.5">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Resulting Filename:</span>
                        <span className="font-mono text-foreground font-semibold">{customSeoName || 'image'}.webp</span>
                      </div>
                    </div>
                  </div>

                  {/* Presets Grid */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>Target Presets ({selectedPresetSlugs.length})</span>
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() =>
                            setSelectedPresetSlugs(presets.filter((p) => p.isDefault).map((p) => p.slug))
                          }
                          className="h-auto p-0 text-[11px] text-primary"
                        >
                          Defaults
                        </Button>
                        <span className="text-muted-foreground/60 text-[11px]">|</span>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setSelectedPresetSlugs(presets.map((p) => p.slug))}
                          className="h-auto p-0 text-[11px] text-primary"
                        >
                          All
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {presets.map((p) => {
                        const isSelected = selectedPresetSlugs.includes(p.slug);
                        return (
                          <div
                            key={p.slug}
                            onClick={() => togglePresetSelection(p.slug)}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-foreground font-medium ring-1 ring-primary/60 shadow-xs'
                                : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40 hover:border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <Label htmlFor={p.slug} className="font-semibold text-foreground text-[11px] cursor-pointer">
                                {p.name}
                              </Label>
                              <Checkbox
                                id={p.slug}
                                checked={isSelected}
                                onCheckedChange={() => togglePresetSelection(p.slug)}
                                className="h-3.5 w-3.5"
                              />
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {p.width} × {p.height} px ({p.fit})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadModalOpen(false)}
                      size="sm"
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        startPipelineUpload(pendingFiles, selectedPresetSlugs, focalX, focalY, customSeoName)
                      }
                      className="text-xs font-semibold gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Start Pipeline Upload</span>
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ------------------------------------------------------------- */}
        {/* 2. SHADCN DIALOG: PIPELINE PROGRESS */}
        {/* ------------------------------------------------------------- */}
        <Dialog open={isProcessingModalOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:rounded-2xl">
            <DialogHeader className="px-6 py-4 border-b bg-card">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Media Processing Pipeline</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground text-left">
                Auto-Crop → JPEG → WebP → Cloudflare R2 execution
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">{processingComplete ? 'Completed Successfully!' : 'Processing Image Assets...'}</span>
                  <span className="font-mono text-primary">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} />
              </div>

              <div className="space-y-2.5 pt-2 border-t text-xs">
                {PIPELINE_STEPS.map((step, idx) => {
                  const stepIndex = PIPELINE_STEPS.findIndex((s) => s.id === currentStep);
                  const isDone = processingComplete || idx < stepIndex;
                  const isCurrent = !processingComplete && idx === stepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2.5 transition-colors ${
                        isDone
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : isCurrent
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground/60'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : isCurrent ? (
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className="text-[11px] leading-tight">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {processingError && (
                <div className="p-3.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Processing Failed</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{processingError}</p>
                </div>
              )}
            </div>

            {processingError && (
              <DialogFooter className="p-4 border-t bg-muted/20">
                <Button size="sm" variant="outline" onClick={() => setIsProcessingModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* ------------------------------------------------------------- */}
        {/* 3. WORDPRESS ATTACHMENT DETAILS MODAL & IMAGE SEO INSPECTOR */}
        {/* ------------------------------------------------------------- */}
        <Dialog
          open={isInspectorOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsInspectorOpen(false);
              setSelectedAsset(null);
            }
          }}
        >
          {selectedAsset && (
            <DialogContent className="max-w-5xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col sm:rounded-2xl">
              {/* Modal Header with Previous / Next Asset Navigation */}
              <DialogHeader className="px-6 py-3.5 border-b shrink-0 bg-card flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                  <DialogTitle className="text-base font-bold truncate">
                    Attachment Details
                  </DialogTitle>
                  <Badge variant="secondary" className="font-mono text-[10px] hidden sm:inline-flex">
                    {selectedAssetIndex + 1} of {filteredMedia.length}
                  </Badge>
                  {liveSeo && (
                    <Badge
                      className={cn(
                        'text-[10px] font-mono font-semibold',
                        liveSeo.grade === 'Good'
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      )}
                    >
                      Image SEO: {liveSeo.score}/100 ({liveSeo.grade})
                    </Badge>
                  )}
                </div>

                {/* Previous & Next Navigation Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevAsset}
                    disabled={filteredMedia.length <= 1}
                    className="h-7 w-7 p-0"
                    title="Previous Image (← Left Arrow)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNextAsset}
                    disabled={filteredMedia.length <= 1}
                    className="h-7 w-7 p-0"
                    title="Next Image (→ Right Arrow)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              {/* Modal Body: 2 Columns (WordPress Attachment Details Layout) */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(92vh-125px)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Visual Preview, Technical Specs, Variants */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Image Viewport Container */}
                    <div className="rounded-xl border bg-slate-950 flex items-center justify-center h-72 sm:h-80 overflow-hidden relative shadow-inner select-none group">
                      {selectedAsset.mimeType.startsWith('image/') ? (
                        <img
                          src={selectedAsset.publicUrl}
                          alt={editingAltText || selectedAsset.altText || ''}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <File className="h-14 w-14 text-muted-foreground" />
                      )}

                      {/* Dimensions Overlay */}
                      {selectedAsset.width && selectedAsset.height && (
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white/90 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                          {selectedAsset.width} × {selectedAsset.height} px
                        </div>
                      )}

                      {/* Format Badge Overlay */}
                      <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 uppercase">
                        {selectedAsset.mimeType === 'image/webp' ? 'WEBP' : selectedAsset.mimeType.split('/')[1]}
                      </div>

                      {/* Fullscreen New Tab Link */}
                      <a
                        href={selectedAsset.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black text-white/90 p-1.5 rounded-lg border border-white/10 transition-colors"
                        title="Open Image in Full Resolution"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Quick Tools & Downloads */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPendingFiles([]);
                            setPreviewUrl(selectedAsset.publicUrl);
                            setCustomSeoName(selectedAsset.seoName || selectedAsset.filename.replace(/\.webp$/, ''));
                            setFocalX(selectedAsset.focalX || 0.5);
                            setFocalY(selectedAsset.focalY || 0.5);
                            setIsUploadModalOpen(true);
                          }}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Crosshair className="h-3.5 w-3.5 text-primary" />
                          <span>Edit Focal Point</span>
                        </Button>

                        <a
                          href={selectedAsset.publicUrl}
                          download={selectedAsset.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium hover:bg-muted transition-colors text-foreground"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      {selectedAsset.usageCount > 0 ? (
                        <Badge variant="secondary" className="text-[10px] text-amber-500 bg-amber-500/10 border-amber-500/20">
                          {selectedAsset.usageCount} content reference(s)
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                          Zero active references
                        </Badge>
                      )}
                    </div>

                    {/* Primary Delivery URL */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Public Delivery URL</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={selectedAsset.publicUrl} className="h-8 font-mono text-xs bg-muted/20" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyUrlToClipboard(selectedAsset.publicUrl)}
                          className="h-8 px-2.5"
                          title="Copy Public URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Generated WebP Variants */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          <span>Generated WebP Variants ({assetVariants.length})</span>
                        </Label>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {selectedAsset.storageDriver === 'cloudflare_r2' ? 'Cloudflare R2' : 'R2 Mock'}
                        </Badge>
                      </div>

                      {loadingVariants ? (
                        <div className="text-xs text-muted-foreground py-3 text-center">Loading variants...</div>
                      ) : assetVariants.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-2 text-center border rounded-lg">
                          No crop variants generated for this asset.
                        </div>
                      ) : (
                        <div className="space-y-1.5 border rounded-lg p-2 bg-muted/20 max-h-36 overflow-y-auto">
                          {assetVariants.map((v) => (
                            <div
                              key={v.id || v.presetSlug}
                              className="flex items-center justify-between p-1.5 rounded-md bg-card border text-xs gap-2"
                            >
                              <div>
                                <span className="font-semibold text-foreground capitalize mr-1">
                                  {v.presetName || v.presetSlug}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  ({v.width}×{v.height} px • {(v.fileSize / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyUrlToClipboard(v.publicUrl)}
                                  className="h-6 w-6 p-0"
                                  title="Copy URL"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <a
                                  href={v.publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-muted text-muted-foreground"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: WordPress Details & Live Image SEO Form */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* WordPress File Info Block */}
                    <div className="p-3 rounded-xl border bg-muted/20 text-xs space-y-1 text-muted-foreground">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        <div>
                          <span className="font-semibold text-foreground">File name: </span>
                          <span className="font-mono">{selectedAsset.filename}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">File type: </span>
                          <span>{selectedAsset.mimeType}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">File size: </span>
                          <span>{(selectedAsset.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Dimensions: </span>
                          <span>{selectedAsset.width ? `${selectedAsset.width} × ${selectedAsset.height} px` : 'N/A'}</span>
                        </div>
                        <div className="col-span-2 pt-0.5">
                          <span className="font-semibold text-foreground">Uploaded on: </span>
                          <span>{new Date(selectedAsset.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rank Markup Live Image SEO Analysis Box */}
                    {liveSeo && (
                      <div className="p-3.5 rounded-xl border bg-gradient-to-br from-card to-muted/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-bold text-foreground">Rank Markup Image SEO</span>
                          </div>
                          <Badge
                            className={cn(
                              'text-xs font-mono font-bold px-2 py-0.5',
                              liveSeo.score >= 80
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : liveSeo.score >= 50
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            )}
                          >
                            Score: {liveSeo.score}/100 ({liveSeo.grade})
                          </Badge>
                        </div>

                        {/* Progress Meter */}
                        <Progress value={liveSeo.score} className="h-1.5" />

                        {/* Live SEO Checklist */}
                        <div className="space-y-1.5 pt-1 text-xs">
                          {liveSeo.checks.map((chk) => (
                            <div key={chk.id} className="flex items-start gap-2">
                              {chk.status === 'passed' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              ) : chk.status === 'warning' ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <div className="text-[11px] leading-tight flex-1">
                                <span className="font-medium text-foreground">{chk.title}: </span>
                                <span className="text-muted-foreground">{chk.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* WordPress Image SEO & Metadata Fields Form */}
                    <div className="space-y-3 pt-1">
                      {/* 1. Alternative Text (Alt Text) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="altText" className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <span>Alternative Text (Alt Text)</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {editingAltText.length}/125 chars
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={handleSuggestAlt}
                              className="h-6 px-1.5 text-[10px] text-primary gap-1"
                              title="Auto-generate alt text from filename"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Suggest Alt</span>
                            </Button>
                          </div>
                        </div>

                        <Textarea
                          id="altText"
                          rows={2}
                          value={editingAltText}
                          onChange={(e) => setEditingAltText(e.target.value)}
                          placeholder="Describe the image purpose for screen readers and Google Image search..."
                          className="text-xs resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Learn how to describe the purpose of the image. Leave empty only if the image is purely decorative.
                        </p>
                      </div>

                      {/* 2. Image Title */}
                      <div className="space-y-1">
                        <Label htmlFor="imgTitle" className="text-xs font-semibold text-foreground">
                          Title
                        </Label>
                        <Input
                          id="imgTitle"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          placeholder="Image title for galleries and indexers..."
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* 3. Caption */}
                      <div className="space-y-1">
                        <Label htmlFor="caption" className="text-xs font-semibold text-foreground">
                          Caption
                        </Label>
                        <Input
                          id="caption"
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          placeholder="Caption displayed directly below the image on pages..."
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* 4. Description */}
                      <div className="space-y-1">
                        <Label htmlFor="description" className="text-xs font-semibold text-foreground">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          rows={2}
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Extended description and context for search engines..."
                          className="text-xs resize-none"
                        />
                      </div>

                      {/* 5. Focus Keyword */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="focusKeyword" className="text-xs font-semibold text-foreground">
                            Target Focus Keyword
                          </Label>
                          <span className="text-[10px] text-muted-foreground">For Image SEO</span>
                        </div>
                        <Input
                          id="focusKeyword"
                          value={editingFocusKeyword}
                          onChange={(e) => setEditingFocusKeyword(e.target.value)}
                          placeholder="e.g. school campus, modern building..."
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <DialogFooter className="px-6 py-3 border-t shrink-0 bg-card flex sm:flex-row items-center justify-between sm:justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedAsset.id)}
                  className="gap-1.5 text-xs h-8 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </Button>

                <div className="flex items-center gap-2">
                  {metadataSaved && (
                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 animate-fade-in">
                      <Check className="h-3.5 w-3.5" />
                      Saved Successfully!
                    </span>
                  )}
                  <Button
                    size="sm"
                    onClick={handleUpdateMetadata}
                    disabled={isSavingMetadata}
                    className="h-8 px-4 text-xs font-semibold cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSavingMetadata ? 'Saving...' : 'Save Metadata & SEO'}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* ------------------------------------------------------------- */}
        {/* 4. SHADCN DIALOG: CROP PRESET MANAGER */}
        {/* ------------------------------------------------------------- */}
        <Dialog open={isPresetModalOpen} onOpenChange={setIsPresetModalOpen}>
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Manage Crop Presets</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define target aspect ratios, dimensions, and fit algorithms for WebP variant processing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePreset} className="space-y-3 py-2 border-b pb-4">
              <h4 className="text-xs font-semibold text-foreground">Add Custom Crop Preset</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="presetName" className="text-[11px] font-semibold">Preset Name</Label>
                  <Input
                    id="presetName"
                    placeholder="e.g. Banner 4K"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="presetFit" className="text-[11px] font-semibold">Fit Mode</Label>
                  <select
                    id="presetFit"
                    value={newPresetFit}
                    onChange={(e) => setNewPresetFit(e.target.value as any)}
                    className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-xs"
                  >
                    <option value="cover">Cover (Aspect Crop)</option>
                    <option value="contain">Contain (Scale)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="presetWidth" className="text-[11px] font-semibold">Width (px)</Label>
                  <Input
                    id="presetWidth"
                    type="number"
                    placeholder="1200"
                    value={newPresetWidth}
                    onChange={(e) => setNewPresetWidth(e.target.value)}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="presetHeight" className="text-[11px] font-semibold">Height (px)</Label>
                  <Input
                    id="presetHeight"
                    type="number"
                    placeholder="800"
                    value={newPresetHeight}
                    onChange={(e) => setNewPresetHeight(e.target.value)}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <Button type="submit" size="sm" disabled={creatingPreset || !newPresetName.trim()} className="w-full h-8 text-xs font-semibold mt-1">
                {creatingPreset ? 'Saving Preset...' : 'Add Preset'}
              </Button>
            </form>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Active Presets ({presets.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {presets.map((p) => (
                  <div key={p.slug} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                        {p.width}×{p.height} ({p.fit})
                      </span>
                    </div>
                    {p.isDefault ? (
                      <Badge variant="secondary" className="text-[9px]">Default</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePreset(p.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete preset"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsPresetModalOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleGuard>
  );
}
