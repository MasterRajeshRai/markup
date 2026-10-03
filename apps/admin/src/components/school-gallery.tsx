'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Images,
  FolderOpen,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
  Search,
  Grid,
  ArrowLeft,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { cmsClient, GalleryAlbum, GalleryPhoto, FALLBACK_ALBUMS } from '@/lib/cms-client';

interface SchoolGalleryProps {
  initialAlbumSlug?: string;
  defaultView?: 'albums' | 'wall';
}

export function SchoolGallery({ initialAlbumSlug, defaultView = 'albums' }: SchoolGalleryProps) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(FALLBACK_ALBUMS);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'albums' | 'wall'>(defaultView);

  // Lightbox & Slideshow state
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxAlbum, setLightboxAlbum] = useState<GalleryAlbum | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when lightbox is active to eliminate background bleed
  useEffect(() => {
    if (activePhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePhoto]);

  // Fetch albums from backend CMS client
  useEffect(() => {
    async function loadAlbums() {
      try {
        const data = await cmsClient.getGalleryAlbums();
        if (Array.isArray(data) && data.length > 0) {
          setAlbums(data);
          if (initialAlbumSlug) {
            const found = data.find((a) => a && a.slug === initialAlbumSlug);
            if (found) setSelectedAlbum(found);
          }
        }
      } catch (e) {
        console.error('Failed to load gallery albums:', e);
      }
    }
    loadAlbums();
  }, [initialAlbumSlug]);

  // Categories list - strictly All Collections and Ek Ped Maa Ke Naam
  const categories = [
    { id: 'all', label: 'All Collections' },
    { id: 'Ek Ped Maa Ke Naam', label: 'Ek Ped Maa Ke Naam' },
  ];

  const safeAlbums = Array.isArray(albums) && albums.length > 0 ? albums : FALLBACK_ALBUMS;

  // Filtered albums
  const filteredAlbums = safeAlbums.filter((album) => {
    if (!album) return false;
    const matchesCategory =
      activeCategory === 'all' ||
      (album.category && album.category.toLowerCase() === activeCategory.toLowerCase()) ||
      (activeCategory.toLowerCase() === 'ek ped maa ke naam' &&
        (album.slug === 'ek-ped-maa-ke-naam' || album.category?.toLowerCase() === 'special initiatives'));
    const matchesSearch =
      searchQuery === '' ||
      (album.name && album.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(album.photos) &&
        album.photos.some((p) => p?.title?.toLowerCase().includes(searchQuery.toLowerCase())));
    return Boolean(matchesCategory && matchesSearch);
  });

  // Flat list of all photos for "wall" view
  const allPhotosWithAlbum = safeAlbums
    .flatMap((album) =>
      Array.isArray(album?.photos) ? album.photos.map((photo) => ({ photo, album })) : []
    )
    .filter(({ photo, album }) => {
      if (!photo || !album) return false;
      const matchesCategory =
        activeCategory === 'all' ||
        (album.category && album.category.toLowerCase() === activeCategory.toLowerCase()) ||
        (activeCategory.toLowerCase() === 'ek ped maa ke naam' &&
          (album.slug === 'ek-ped-maa-ke-naam' || album.category?.toLowerCase() === 'special initiatives'));
      const matchesSearch =
        searchQuery === '' ||
        (photo.title && photo.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (photo.caption && photo.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (album.name && album.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return Boolean(matchesCategory && matchesSearch);
    });

  // Flagship featured album: "Ek Ped Maa Ke Naam"
  const featuredAlbum =
    safeAlbums.find((a) => a && (a.slug === 'ek-ped-maa-ke-naam' || a.isFeatured)) || safeAlbums[0];

  // Lightbox handlers
  const openLightbox = (photo: GalleryPhoto, album: GalleryAlbum) => {
    setActivePhoto(photo);
    setLightboxAlbum(album);
    setIsSlideshowPlaying(false);
  };

  const closeLightbox = () => {
    setActivePhoto(null);
    setLightboxAlbum(null);
    setIsSlideshowPlaying(false);
  };

  const currentPhotos = lightboxAlbum?.photos || [];
  const currentPhotoIndex = currentPhotos.findIndex((p) => p.id === activePhoto?.id);

  const goToNextPhoto = useCallback(() => {
    if (!lightboxAlbum || currentPhotos.length === 0) return;
    const nextIdx = (currentPhotoIndex + 1) % currentPhotos.length;
    setActivePhoto(currentPhotos[nextIdx]);
  }, [currentPhotoIndex, currentPhotos, lightboxAlbum]);

  const goToPrevPhoto = useCallback(() => {
    if (!lightboxAlbum || currentPhotos.length === 0) return;
    const prevIdx = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
    setActivePhoto(currentPhotos[prevIdx]);
  }, [currentPhotoIndex, currentPhotos, lightboxAlbum]);

  // Slideshow interval
  useEffect(() => {
    if (!isSlideshowPlaying || !activePhoto || !lightboxAlbum) {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
      return;
    }

    slideshowTimerRef.current = setInterval(() => {
      goToNextPhoto();
    }, 4000);

    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isSlideshowPlaying, activePhoto, lightboxAlbum, goToNextPhoto]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activePhoto) return;
      if (e.key === 'ArrowRight') goToNextPhoto();
      if (e.key === 'ArrowLeft') goToPrevPhoto();
      if (e.key === 'Escape') closeLightbox();
      if (e.key === ' ') {
        e.preventDefault();
        setIsSlideshowPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, goToNextPhoto, goToPrevPhoto]);

  return (
    <section className="space-y-10">
      
      {/* 1. Clean Category Navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (selectedAlbum && cat.id !== 'all') {
                  const isMatch =
                    selectedAlbum.category?.toLowerCase() === cat.id.toLowerCase() ||
                    (cat.id.toLowerCase() === 'ek ped maa ke naam' &&
                      (selectedAlbum.slug === 'ek-ped-maa-ke-naam' ||
                        selectedAlbum.category?.toLowerCase() === 'special initiatives'));
                  if (!isMatch) setSelectedAlbum(null);
                }
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setViewMode('albums');
                setSelectedAlbum(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'albums'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Albums</span>
            </button>
            <button
              onClick={() => setViewMode('wall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'wall'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FEATURED ALBUM BANNER ("Ek Ped Maa Ke Naam") */}
      {!selectedAlbum && viewMode === 'albums' && featuredAlbum && (
        <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40 p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Featured Album
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-900 border border-amber-200">
                  {featuredAlbum.photos.length} Photographs
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-sans">
                  {featuredAlbum.name}
                </h3>
                {featuredAlbum.subtitle && (
                  <p className="text-sm sm:text-base text-emerald-800 font-semibold">
                    {featuredAlbum.subtitle}
                  </p>
                )}
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                {featuredAlbum.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedAlbum(featuredAlbum)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>View All {featuredAlbum.photos.length} Photos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setLightboxAlbum(featuredAlbum);
                    setActivePhoto(featuredAlbum.photos[0]);
                    setIsSlideshowPlaying(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Play Slideshow</span>
                </button>
              </div>
            </div>

            {/* Right Photo Previews */}
            <div className="lg:col-span-6 space-y-3">
              <div
                onClick={() => setSelectedAlbum(featuredAlbum)}
                className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredAlbum.coverImage}
                  alt={featuredAlbum.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Calendar className="w-3 h-3 text-amber-300" />
                    15 September 2026
                  </span>
                  <span className="font-semibold flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Eye className="w-3 h-3" />
                    Click to explore
                  </span>
                </div>
              </div>

              {/* 4 Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {featuredAlbum.photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    onClick={() => openLightbox(photo, featuredAlbum)}
                    className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. ALBUM DEEP-DIVE VIEW */}
      {selectedAlbum && (
        <div className="space-y-6">
          {/* Top Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedAlbum(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300 shadow-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span>All Collections</span>
              </button>
              <div className="h-4 w-px bg-slate-300" />
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 font-mono">
                  {selectedAlbum.category}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {selectedAlbum.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLightboxAlbum(selectedAlbum);
                  setActivePhoto(selectedAlbum.photos[0]);
                  setIsSlideshowPlaying(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play Slideshow</span>
              </button>

              <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700">
                {selectedAlbum.photos.length} Photos
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-2 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedAlbum.name}
            </h2>
            {selectedAlbum.subtitle && (
              <p className="text-sm text-emerald-800 font-semibold">{selectedAlbum.subtitle}</p>
            )}
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {selectedAlbum.description}
            </p>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {selectedAlbum.photos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo, selectedAlbum)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-[4/3] cursor-pointer shadow-xs hover:shadow-lg hover:border-slate-400 transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <p className="text-xs font-bold line-clamp-1">{photo.title}</p>
                  {photo.caption && (
                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{photo.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ALL ALBUMS GRID (Clean Light Cards) */}
      {!selectedAlbum && viewMode === 'albums' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Photo Collections ({filteredAlbums.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() => setSelectedAlbum(album)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-white/90 text-slate-900 backdrop-blur-xs shadow-xs">
                      {album.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                      <Images className="w-3 h-3" />
                      {album.photoCount}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs">
                    <span className="text-[11px] text-amber-200 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {album.eventDate}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {album.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {album.description}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    <span>Explore Album</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PHOTO WALL VIEW (All Photos Clean Grid) */}
      {viewMode === 'wall' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              All Photographs ({allPhotosWithAlbum.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPhotosWithAlbum.map(({ photo, album }) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo, album)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                  <span className="self-start text-[10px] font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                    {album.name}
                  </span>
                  <p className="text-xs font-bold line-clamp-1">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CLEAN CINEMATIC LIGHTBOX PORTAL (Mounted directly to document.body with max z-index) */}
      {activePhoto && lightboxAlbum && isMounted && createPortal(
        <div
          style={{ zIndex: 999999 }}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/95 backdrop-blur-md flex flex-col justify-between text-white overflow-hidden"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-4 bg-black/70 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
                {lightboxAlbum.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentPhotoIndex + 1} / {currentPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSlideshowPlaying((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSlideshowPlaying ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {isSlideshowPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSlideshowPlaying ? 'Pause' : 'Slideshow'}</span>
              </button>

              <button
                onClick={closeLightbox}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all ml-2"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Stage */}
          <div
            className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={goToPrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-white hover:text-black text-white transition-all z-20 shadow-xl border border-white/10"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-white hover:text-black text-white transition-all z-20 shadow-xl border border-white/10"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-h-[75vh] max-w-[90vw] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activePhoto.id}
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-all select-none"
              />
            </div>
          </div>

          {/* Caption & Filmstrip Bottom Bar */}
          <div
            className="px-6 py-4 bg-black/70 border-t border-white/10 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center max-w-xl mx-auto">
              <h4 className="text-sm sm:text-base font-bold text-white">{activePhoto.title}</h4>
              {activePhoto.caption && (
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{activePhoto.caption}</p>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none">
              {currentPhotos.map((photo) => {
                const isCurrent = photo.id === activePhoto.id;
                return (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      isCurrent
                        ? 'border-emerald-400 scale-105 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-90'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
