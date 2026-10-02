'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import { DEFAULT_CROP_PRESETS, toSeoFriendlyName, type CropPresetDefinition } from '@headless/core';
import { ModuleGuard } from '@/components/module-guard';
import { useAuth } from '@/components/auth-context';
import { cn } from '@/lib/utils';

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
  caption?: string;
  description?: string;
  publicUrl: string;
  storageDriver?: string;
  storageBucket?: string;
  storageKey?: string;
  variants?: MediaVariantItem[];
  mediaVariants?: MediaVariantItem[];
  usageCount: number;
  createdAt: string;
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

  // Selected asset for inspector
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [assetVariants, setAssetVariants] = useState<MediaVariantItem[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

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

  // Open inspector & load variants
  const handleSelectAsset = (asset: MediaItem) => {
    setSelectedAsset(asset);
    setIsInspectorOpen(true);
    setLoadingVariants(true);

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

  // Handle files selected via file input
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const firstFile = fileList[0];

    // If bitmap image, open interactive focal point & crop presets configuration modal
    if (firstFile.type.startsWith('image/') && !firstFile.type.includes('svg')) {
      setPendingFiles(fileList);
      setPreviewUrl(URL.createObjectURL(firstFile));
      setCustomSeoName(toSeoFriendlyName(firstFile.name));
      setFocalX(0.5);
      setFocalY(0.5);
      setIsUploadModalOpen(true);
    } else {
      // Non-image direct upload
      startPipelineUpload(fileList, [], 0.5, 0.5);
    }
  };

  // Focal point click handler on the preview image
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

  const handleUpdateMetadata = async () => {
    if (!selectedAsset) return;

    await fetch(`/api/v1/media/${selectedAsset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        altText: selectedAsset.altText,
        caption: selectedAsset.caption,
        description: selectedAsset.description,
      }),
    });

    fetchMedia();
    alert('Asset metadata updated successfully');
  };

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

  return (
    <ModuleGuard moduleId="media">
      <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Library & DAM</h1>
            <Badge variant="outline" className="text-[11px] font-mono border-primary/40 text-primary">
              WebP / Cloudflare R2
            </Badge>
            {!canViewAllMedia && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="h-3 w-3" />
                Your Uploads Only
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-Crop → JPEG → WebP → Cloudflare R2 image processing pipeline with zero original retention.
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
            variant="outline"
            onClick={handleCleanupTempFiles}
            title="Clean orphaned temp uploads older than 60 minutes"
            className="text-xs gap-1.5 h-8 cursor-pointer"
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
            className="gap-1.5 shadow-sm h-8 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Image</span>
          </Button>
        </div>
      </div>

      {/* Limited User Ownership Scope Banner */}
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

      {/* Main Grid: Folders on Left, Assets on Right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Col: Folders & Filters */}
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

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Filter by Type</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {[
                { id: '', label: 'All File Types' },
                { id: 'image', label: 'WebP & Optimized Images' },
                { id: 'video', label: 'Videos (MP4, WebM)' },
                { id: 'audio', label: 'Audio Tracks' },
                { id: 'application', label: 'Documents & PDFs' },
              ].map((t) => (
                <Button
                  key={t.id}
                  variant={filterType === t.id ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType(t.id)}
                  className="w-full justify-start h-7 text-xs font-normal"
                >
                  {t.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Active Preset Specs card */}
          <Card>
            <CardHeader className="p-4 pb-2">
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
        </div>

        {/* Right 3 Cols: Media Assets Grid */}
        <div className="md:col-span-3 space-y-4">
          <Card className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search assets by filename or alt text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                className="pl-8 text-xs h-8"
              />
            </div>
          </Card>

          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading digital assets...
            </div>
          ) : media.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No assets found</p>
              <p className="text-xs mt-0.5">Upload images to test the Auto-Crop → WebP → R2 pipeline.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((asset) => {
                const isImage = asset.mimeType.startsWith('image/');
                const variantCount = asset.mediaVariants?.length || asset.variants?.length || 0;

                return (
                  <Card
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className="group relative overflow-hidden hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden relative">
                      {isImage ? (
                        <img
                          src={asset.publicUrl}
                          alt={asset.altText || asset.originalName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <File className="h-10 w-10 text-muted-foreground/60" />
                      )}

                      {/* Variant Badge */}
                      {variantCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-[10px] bg-background/85 backdrop-blur-sm gap-1"
                        >
                          <Layers className="h-3 w-3" />
                          <span>{variantCount} WebP</span>
                        </Badge>
                      )}

                      {/* Usage Badge */}
                      {asset.usageCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-[10px] bg-background/85 backdrop-blur-sm"
                        >
                          {asset.usageCount} {asset.usageCount === 1 ? 'use' : 'uses'}
                        </Badge>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1">
                      <div className="font-semibold text-xs text-foreground truncate" title={asset.filename}>
                        {asset.filename}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate" title={asset.originalName}>
                        {asset.originalName}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
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

          {/* Modal Body (2 Columns on Desktop) */}
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

                {/* Image Interactive Canvas */}
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

                  {/* Crosshair Target Indicator */}
                  <div
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center z-10"
                    style={{ left: `${focalX * 100}%`, top: `${focalY * 100}%` }}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/25 backdrop-blur-xs shadow-xl flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
                    </div>
                  </div>

                  {/* Instruction Tag */}
                  <div className="absolute bottom-2.5 left-2.5 text-[10px] bg-black/75 text-white/90 px-2.5 py-1 rounded-md backdrop-blur-sm pointer-events-none flex items-center gap-1.5 border border-white/10 shadow-sm">
                    <Crosshair className="h-3 w-3 text-primary" />
                    <span>Click anywhere to position crop center</span>
                  </div>
                </div>

                {/* Quick Preset Buttons for Focal Position */}
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

              {/* Right Column: Crop Presets & Settings */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {/* SEO-Friendly Name Input Section */}
                <div className="space-y-2 p-3 rounded-xl border bg-muted/25">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customSeoName" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span>SEO Friendly Image Name</span>
                    </Label>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono border-emerald-500/30">
                      Kept as Primary Name
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
                      <span>SEO Filename (Kept):</span>
                      <span className="font-mono text-foreground font-semibold">{customSeoName || 'image'}.webp</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>R2 Reference (At Last):</span>
                      <span className="font-mono text-primary text-[10px] truncate max-w-[210px]" title={`${customSeoName || 'image'}-[preset]-r2-ref.webp`}>
                        {customSeoName || 'image'}-[preset]-r2-xxxx.webp
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preset Selection Box */}
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
                      <span className="text-muted-foreground/60 text-[11px]">|</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setSelectedPresetSlugs([])}
                        className="h-auto p-0 text-[11px] text-muted-foreground"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Presets Grid */}
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
                          <div className="flex items-center justify-between text-[10px] opacity-85 font-mono">
                            <span>{p.width}×{p.height}</span>
                            <span className="uppercase text-[9px] text-muted-foreground font-sans">{p.fit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Callout */}
                <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Output Format:</span>
                    <span className="font-semibold font-mono text-foreground">WebP (q=82)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Target Storage:</span>
                    <span className="font-semibold text-foreground">Cloudflare R2</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Selected Variants:</span>
                    <span className="font-semibold text-primary">{selectedPresetSlugs.length} files</span>
                  </div>
                </div>

                {/* Zero Retention Security Notice */}
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                  <p className="text-[11px] leading-tight">
                    <strong>Zero-Retention Policy:</strong> The original uploaded image is auto-cropped to WebP and purged immediately. Only WebP assets are stored in Cloudflare R2.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <DialogFooter className="px-6 py-3.5 border-t shrink-0 bg-muted/30 flex sm:flex-row items-center justify-between sm:justify-between">
            <div className="text-xs text-muted-foreground font-medium">
              {selectedPresetSlugs.length === 0 ? (
                <span className="text-destructive font-semibold">Please select at least 1 preset</span>
              ) : (
                <span>{selectedPresetSlugs.length} preset(s) selected</span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                }}
                className="h-9 px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={selectedPresetSlugs.length === 0}
                onClick={() =>
                  startPipelineUpload(pendingFiles, selectedPresetSlugs, focalX, focalY, customSeoName)
                }
                className="gap-2 h-9 px-4 text-xs shadow-sm font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Process & Upload ({selectedPresetSlugs.length} Variants)</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 2. SHADCN DIALOG: PROCESSING PIPELINE PROGRESS MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={isProcessingModalOpen}
        onOpenChange={(open) => {
          if (!open && processingComplete) setIsProcessingModalOpen(false);
        }}
      >
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden sm:rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-card">
            <div className="flex items-center gap-2.5">
              <RefreshCw className={`h-4 w-4 text-primary ${processingComplete ? '' : 'animate-spin'}`} />
              <DialogTitle className="text-sm font-bold text-foreground">Media Processing Pipeline</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground text-left">
              Auto-Crop → JPEG → WebP → Cloudflare R2 execution
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground">{processingComplete ? 'Completed Successfully!' : 'Processing Image Assets...'}</span>
                <span className="font-mono text-primary">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>

            {/* Stepped Checklist */}
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

            {/* Error Message if pipeline failed */}
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
      {/* 3. SHADCN DIALOG: ASSET INSPECTOR & WEBP VARIANT MODAL */}
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
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:rounded-2xl">
            {/* Modal Header */}
            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-card">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <DialogTitle className="text-base font-bold truncate max-w-md">
                  {selectedAsset.seoName ? `${selectedAsset.seoName}.webp` : selectedAsset.filename}
                </DialogTitle>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  SEO Name Kept
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground text-left">
                Original Upload: <span className="font-mono text-foreground font-medium">{selectedAsset.originalName}</span> • Cloudflare R2 WebP Delivery & Variants
              </DialogDescription>
            </DialogHeader>

            {/* Modal Body (2 Columns on desktop) */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-130px)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Asset Preview & Delivery */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Asset Canvas */}
                  <div className="rounded-xl border bg-slate-950 flex items-center justify-center h-64 overflow-hidden relative shadow-inner">
                    {selectedAsset.mimeType.startsWith('image/') ? (
                      <img
                        src={selectedAsset.publicUrl}
                        alt={selectedAsset.altText || ''}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <File className="h-14 w-14 text-muted-foreground" />
                    )}

                    {/* Focal Point Indicator */}
                    {selectedAsset.focalX !== undefined && selectedAsset.focalY !== undefined && (
                      <div
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${selectedAsset.focalX * 100}%`, top: `${selectedAsset.focalY * 100}%` }}
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/30 ring-2 ring-white/50 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Usage Reference Badge */}
                  {selectedAsset.usageCount > 0 ? (
                    <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Referenced in <strong>{selectedAsset.usageCount}</strong> content entries. Safe deletion guard is active.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Zero active references. Safe to delete.</span>
                    </div>
                  )}

                  {/* Primary Delivery URL */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Primary Delivery URL (SEO Optimized)</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={selectedAsset.publicUrl} className="h-8 font-mono text-xs" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(selectedAsset.publicUrl)}
                        className="h-8 px-2.5"
                        title="Copy URL"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column: WebP Variants & Metadata Form */}
                <div className="lg:col-span-6 space-y-4">
                  {/* WebP Variants Section */}
                  <div className="space-y-2">
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
                      <div className="text-xs text-muted-foreground py-4 text-center">Loading variants...</div>
                    ) : assetVariants.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-3 text-center border rounded-lg">
                        No crop variants found for this asset.
                      </div>
                    ) : (
                      <div className="space-y-1.5 border rounded-lg p-2 bg-muted/20 max-h-48 overflow-y-auto">
                        {assetVariants.map((v) => (
                          <div
                            key={v.id || v.presetSlug}
                            className="flex items-center justify-between p-2 rounded-md bg-card border text-xs gap-2"
                          >
                            <div>
                              <div className="font-semibold text-foreground capitalize flex items-center gap-1.5">
                                <span>{v.presetName || v.presetSlug}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  ({v.width}×{v.height})
                                </span>
                              </div>
                              <div className="text-[10px] text-primary/90 font-mono truncate max-w-[270px]" title={v.r2ReferenceName || v.storageKey?.split('/').pop() || ''}>
                                R2: {v.r2ReferenceName || v.storageKey?.split('/').pop() || `${(selectedAsset.seoName || selectedAsset.filename).replace(/\.webp$/, '')}-${v.presetSlug}-r2-${selectedAsset.id.slice(0, 8)}.webp`}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {(v.fileSize / 1024).toFixed(1)} KB • {v.format.toUpperCase()}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyUrlToClipboard(v.publicUrl)}
                                className="h-7 w-7 p-0"
                                title="Copy Variant URL"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <a
                                href={v.publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Open Variant in New Tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cloudflare R2 Reference Section (At Last) */}
                  <div className="p-3 rounded-xl border bg-muted/25 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <HardDrive className="h-3.5 w-3.5 text-primary" />
                        <span>Cloudflare R2 Reference</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {selectedAsset.storageDriver === 'cloudflare_r2' ? 'Cloudflare R2' : 'R2 Mock'}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>SEO Name (Kept):</span>
                        <span className="font-mono text-foreground font-semibold">
                          {selectedAsset.seoName ? `${selectedAsset.seoName}.webp` : selectedAsset.filename}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>R2 Reference Filename (At Last):</span>
                        <span className="font-mono text-primary font-medium text-[10px] truncate max-w-[220px]" title={selectedAsset.r2ReferenceName || selectedAsset.storageKey?.split('/').pop() || ''}>
                          {selectedAsset.r2ReferenceName || selectedAsset.storageKey?.split('/').pop() || `${(selectedAsset.seoName || selectedAsset.filename).replace(/\.webp$/, '')}-card-r2-${selectedAsset.id.slice(0, 8)}.webp`}
                        </span>
                      </div>
                      {selectedAsset.storageKey && (
                        <div className="pt-1">
                          <span className="text-[10px] text-muted-foreground block mb-0.5">R2 Storage Key:</span>
                          <div className="flex items-center gap-1.5">
                            <Input readOnly value={selectedAsset.storageKey} className="h-7 text-[10px] font-mono bg-background" />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => copyUrlToClipboard(selectedAsset.storageKey!)}
                              title="Copy R2 Key"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Form */}
                  <div className="space-y-3 pt-1 border-t">
                    <div className="space-y-1">
                      <Label htmlFor="altText" className="text-xs font-semibold">Alt Text (Accessibility & SEO)</Label>
                      <Input
                        id="altText"
                        value={selectedAsset.altText || ''}
                        onChange={(e) => setSelectedAsset({ ...selectedAsset, altText: e.target.value })}
                        placeholder="Descriptive alt text..."
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="caption" className="text-xs font-semibold">Caption</Label>
                      <Input
                        id="caption"
                        value={selectedAsset.caption || ''}
                        onChange={(e) => setSelectedAsset({ ...selectedAsset, caption: e.target.value })}
                        placeholder="Photo caption..."
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="px-6 py-3.5 border-t shrink-0 bg-muted/30 flex sm:flex-row items-center justify-between sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedAsset.id)}
                className="gap-1.5 text-xs h-9"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Asset & R2 Variants</span>
              </Button>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdateMetadata} className="h-9 px-4 text-xs font-semibold">
                  Save Metadata
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* 4. SHADCN DIALOG: CROP PRESET MANAGER */}
      <Dialog open={isPresetModalOpen} onOpenChange={setIsPresetModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Manage Crop Presets</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define target aspect ratios, dimensions, and fit algorithms for WebP variant processing.
            </DialogDescription>
          </DialogHeader>

          {/* Form to add custom preset */}
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

          {/* List existing presets */}
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
