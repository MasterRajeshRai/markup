'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Images, 
  Plus, 
  Search, 
  CloudUpload, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle, 
  Calendar, 
  Layers, 
  Sparkles, 
  X, 
  ExternalLink,
  RefreshCw,
  FolderPlus,
  Image as ImageIcon
} from 'lucide-react';
import { GalleryAlbum, GalleryPhoto } from '@/lib/gallery-service';

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [syncingR2, setSyncingR2] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [managingAlbum, setManagingAlbum] = useState<GalleryAlbum | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Events');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCover, setFormCover] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80');

  // Photo adder state for managing album
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/gallery');
      const data = await res.json();
      if (data.success && data.albums) {
        setAlbums(data.albums);
      }
    } catch (err) {
      console.error('Failed to load albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const res = await fetch('/api/v1/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          subtitle: formSubtitle,
          description: formDesc,
          eventDate: formDate,
          coverImage: formCover,
          photos: [
            {
              title: `${formName} Primary Cover`,
              caption: formSubtitle || formName,
              imageUrl: formCover,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        setFormName('');
        setFormSubtitle('');
        setFormDesc('');
        fetchAlbums();
      }
    } catch (err) {
      console.error('Failed to create album:', err);
    }
  };

  const handleDeleteAlbum = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    try {
      const res = await fetch(`/api/v1/gallery?slug=${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAlbums((prev) => prev.filter((a) => a.slug !== slug));
        if (managingAlbum?.slug === slug) setManagingAlbum(null);
      }
    } catch (err) {
      console.error('Failed to delete album:', err);
    }
  };

  const handleAddPhotoToAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingAlbum || !newPhotoUrl.trim()) return;

    const newPhoto: GalleryPhoto = {
      id: `photo_${Date.now()}`,
      title: newPhotoTitle || `Photo ${managingAlbum.photos.length + 1}`,
      caption: newPhotoCaption,
      imageUrl: newPhotoUrl,
      order: managingAlbum.photos.length + 1,
      r2Key: `gallery/${managingAlbum.slug}/${newPhotoUrl.split('/').pop() || 'photo.webp'}`,
      syncStatus: 'local',
      dateAdded: new Date().toISOString().split('T')[0],
    };

    const updatedPhotos = [...managingAlbum.photos, newPhoto];

    try {
      const res = await fetch('/api/v1/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: managingAlbum.slug,
          photos: updatedPhotos,
          photoCount: updatedPhotos.length,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setManagingAlbum(data.album);
        setAlbums((prev) => prev.map((a) => (a.slug === data.album.slug ? data.album : a)));
        setNewPhotoTitle('');
        setNewPhotoCaption('');
        setNewPhotoUrl('');
      }
    } catch (err) {
      console.error('Failed to add photo:', err);
    }
  };

  const handleDeletePhotoFromAlbum = async (photoId: string) => {
    if (!managingAlbum) return;
    const updatedPhotos = managingAlbum.photos.filter((p) => p.id !== photoId);

    try {
      const res = await fetch('/api/v1/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: managingAlbum.slug,
          photos: updatedPhotos,
          photoCount: updatedPhotos.length,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setManagingAlbum(data.album);
        setAlbums((prev) => prev.map((a) => (a.slug === data.album.slug ? data.album : a)));
      }
    } catch (err) {
      console.error('Failed to remove photo:', err);
    }
  };

  const handleSyncCloudflareR2 = async () => {
    try {
      setSyncingR2(true);
      const res = await fetch('/api/v1/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_r2' }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`Successfully synchronized ${data.result.syncedCount} images to Cloudflare R2 bucket "${data.result.destination}".`);
        fetchAlbums();
      }
    } catch (err) {
      console.error('R2 sync failed:', err);
      setSyncMessage('Failed to trigger R2 sync.');
    } finally {
      setSyncingR2(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  const filteredAlbums = albums.filter((a) => {
    const matchCategory =
      selectedCategory === 'all' ||
      a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Images className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600">
              Media &amp; Albums Module
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            Photo Gallery &amp; Albums Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Create and curate album-wise photo collections, manage high-resolution media galleries, and prepare assets for Cloudflare R2 edge synchronization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncCloudflareR2}
            disabled={syncingR2}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className={`w-4 h-4 text-amber-600 ${syncingR2 ? 'animate-bounce' : ''}`} />
            <span>{syncingR2 ? 'Syncing to R2...' : 'Sync to Cloudflare R2'}</span>
          </button>
          
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Album</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cloudflare R2 Storage Status Cockpit */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#09182d] to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Cloudflare R2 Object Storage
            </div>
            <div className="text-sm font-bold text-slate-100">
              Target Bucket: <span className="font-mono text-amber-300">cms-media-production</span> &bull; CDN Acceleration
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            R2 Sync Engine Ready
          </span>
          <span className="text-slate-400 hidden sm:inline">
            All images auto-mapped with R2 key prefixes
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search albums by name or theme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#09182d]/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'Events', label: 'Events' },
            { id: 'Projects', label: 'Projects' },
            { id: 'Campus & Facilities', label: 'Campus & Facilities' },
            { id: 'Media & Press', label: 'Media & Press' },
            { id: 'General', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-[#09182d] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Albums Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading photo albums...</div>
      ) : filteredAlbums.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Images className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-slate-600 font-bold">No albums found</div>
          <p className="text-xs text-slate-400">Click &ldquo;Create New Album&rdquo; to add your first photo collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Cover Photo */}
                <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#e2a02b] border border-[#e2a02b]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {album.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-mono font-bold flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-amber-300" />
                      {album.photoCount} Photos
                    </span>
                  </div>

                  {/* Album Name over image bottom */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1">
                      {album.name}
                    </h3>
                    <div className="text-[11px] text-slate-300 font-medium flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      {album.eventDate}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5">
                  {album.subtitle && (
                    <div className="text-xs font-bold text-amber-700 font-sans line-clamp-1">
                      {album.subtitle}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {album.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">R2 Storage:</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      album.syncStatus === 'synced' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        album.syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`} />
                      {album.syncStatus === 'synced' ? 'Synced to R2' : 'Local (Ready for Sync)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setManagingAlbum(album)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#09182d] hover:bg-[#09182d] hover:text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Manage Photos ({album.photoCount})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteAlbum(album.slug)}
                    aria-label="Delete album"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create New Album Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-[#09182d] font-sans">Create New Photo Album</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Album Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g., "Annual Digital Summit 2026" or "Product Launch"'
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#09182d]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                  >
                    <option value="Events">Events</option>
                    <option value="Projects">Projects</option>
                    <option value="Campus & Facilities">Campus &amp; Facilities</option>
                    <option value="Media & Press">Media &amp; Press</option>
                    <option value="General">General</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Subtitle / Theme
                </label>
                <input
                  type="text"
                  placeholder="e.g., Fostering environmental love and maternal respect"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Album Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe the significance of this event or collection..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Photos Modal */}
      {managingAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600">
                  Album Photos Manager
                </span>
                <h3 className="text-xl font-black text-[#09182d] font-sans">
                  {managingAlbum.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {managingAlbum.photos.length} photos in this album &bull; R2 Prefix: <span className="font-mono text-amber-700">{managingAlbum.r2Prefix}</span>
                </p>
              </div>
              <button onClick={() => setManagingAlbum(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Photo Form */}
            <form onSubmit={handleAddPhotoToAlbum} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-[#09182d] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Add New Photo to &ldquo;{managingAlbum.name}&rdquo;
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Photo Title (e.g. Stage Ceremony)"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Image URL (e.g. /images/... or https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional caption explaining the photo..."
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#09182d] hover:bg-[#162a45] text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Add Photo
                </button>
              </div>
            </form>

            {/* Photos List Grid */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Current Photos ({managingAlbum.photos.length})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {managingAlbum.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{photo.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{photo.caption || 'No caption'}</div>
                      <div className="text-[10px] font-mono text-amber-700 truncate mt-0.5">
                        R2 Key: {photo.r2Key}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePhotoFromAlbum(photo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Remove photo from album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setManagingAlbum(null)}
                className="px-4 py-2 rounded-xl bg-[#09182d] text-white text-xs font-bold cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
