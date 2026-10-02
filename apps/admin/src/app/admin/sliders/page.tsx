'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { ModuleGuard } from '@/components/module-guard';
import {
  SlidersHorizontal,
  Plus,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  Code2,
  Copy,
  Check,
  Trash2,
  Edit3,
  ExternalLink,
  Layers,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  CheckCircle2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Video,
  Palette,
  Settings2,
  Calendar,
  Globe,
  Tag,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Slider, Slide, SlideCta } from '@/lib/slider-service';

export default function SlidersAdminPage() {
  return (
    <ModuleGuard moduleId="hero_slider">
      <SlidersDashboard />
    </ModuleGuard>
  );
}

function SlidersDashboard() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sliders' | 'editor' | 'preview' | 'developer'>('sliders');
  const [selectedSliderSlug, setSelectedSliderSlug] = useState<string>('homepage-hero');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [editorSubTab, setEditorSubTab] = useState<'content' | 'media' | 'settings' | 'custom'>('content');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Live preview state & smooth animation controls
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [enableKenBurns, setEnableKenBurns] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [devCodeFramework, setDevCodeFramework] = useState<'tailwind' | 'framer' | 'swiper' | 'api'>('tailwind');

  // Fetch sliders from API
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/sliders');
      const data = await res.json();
      if (data.success && Array.isArray(data.sliders)) {
        setSliders(data.sliders);
        if (data.sliders.length > 0 && !data.sliders.some((s: Slider) => s.slug === selectedSliderSlug)) {
          setSelectedSliderSlug(data.sliders[0].slug);
        }
      }
    } catch {
      showNotification('Failed to load sliders. Using cached data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  // Currently active slider in editor or preview
  const currentSlider = sliders.find((s) => s.slug === selectedSliderSlug) || sliders[0];
  const currentSlide = currentSlider?.slides?.[selectedSlideIndex] || currentSlider?.slides?.[0];

  const handleNextSlide = () => {
    if (!currentSlider || currentSlider.slides.length <= 1) return;
    setSlideDirection('next');
    setPreviewSlideIndex((prev) => (prev + 1) % currentSlider.slides.length);
  };

  const handlePrevSlide = () => {
    if (!currentSlider || currentSlider.slides.length <= 1) return;
    setSlideDirection('prev');
    setPreviewSlideIndex((prev) => (prev - 1 + currentSlider.slides.length) % currentSlider.slides.length);
  };

  const handleGoToSlide = (idx: number) => {
    setSlideDirection(idx > previewSlideIndex ? 'next' : 'prev');
    setPreviewSlideIndex(idx);
  };

  // Live preview autoplay timer
  useEffect(() => {
    if (!isPlaying || !currentSlider || currentSlider.slides.length <= 1) return;
    const intervalMs = currentSlider.autoplayInterval || 5000;
    const timer = setInterval(() => {
      setSlideDirection('next');
      setPreviewSlideIndex((prev) => (prev + 1) % currentSlider.slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, currentSlider, currentSlider?.slides?.length]);

  // Handle saving current slider
  const handleSaveSlider = async (updatedSlider: Slider) => {
    try {
      const res = await fetch(`/api/v1/sliders/${updatedSlider.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlider),
      });
      const data = await res.json();
      if (data.success) {
        setSliders((prev) =>
          prev.map((s) => (s.slug === updatedSlider.slug ? data.slider : s))
        );
        showNotification(`Slider '${updatedSlider.name}' saved successfully.`);
      } else {
        showNotification(data.error || 'Failed to save slider', 'error');
      }
    } catch {
      showNotification('Error updating slider', 'error');
    }
  };

  // Add new slide
  const handleAddSlide = () => {
    if (!currentSlider) return;
    const newSlideId = `slide_${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      title: 'Exciting New Heading for This Slide',
      subtitle: 'Optional Eyebrow Subtitle',
      description: 'Highlight your client product benefits, core value proposition, or seasonal campaign features.',
      badgeText: 'New',
      badgeVariant: 'emerald',
      imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2000&q=80',
      mediaType: 'image',
      primaryCta: {
        label: 'Get Started',
        url: '/get-started',
        target: '_self',
        variant: 'glow',
      },
      contentAlignment: 'left',
      verticalAlignment: 'center',
      overlayOpacity: 60,
      overlayGradient: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)',
      textColor: '#ffffff',
      accentColor: '#10b981',
      order: currentSlider.slides.length + 1,
      isActive: true,
    };

    const updated = {
      ...currentSlider,
      slides: [...currentSlider.slides, newSlide],
    };

    handleSaveSlider(updated);
    setSelectedSlideIndex(updated.slides.length - 1);
  };

  // Delete slide
  const handleDeleteSlide = (indexToDelete: number) => {
    if (!currentSlider || currentSlider.slides.length <= 1) {
      showNotification('A slider must have at least one slide.', 'error');
      return;
    }
    const updatedSlides = currentSlider.slides
      .filter((_, idx) => idx !== indexToDelete)
      .map((s, idx) => ({ ...s, order: idx + 1 }));

    const updated = {
      ...currentSlider,
      slides: updatedSlides,
    };

    handleSaveSlider(updated);
    setSelectedSlideIndex(Math.max(0, indexToDelete - 1));
  };

  // Reorder slide up or down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!currentSlider) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSlider.slides.length) return;

    const newSlides = [...currentSlider.slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    const reordered = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    const updated = {
      ...currentSlider,
      slides: reordered,
    };

    handleSaveSlider(updated);
    setSelectedSlideIndex(targetIndex);
  };

  // Create new slider
  const handleCreateSlider = async () => {
    const name = prompt('Enter a name for the new Hero Slider:');
    if (!name) return;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    try {
      const res = await fetch('/api/v1/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          placement: 'custom_section',
          status: 'PUBLISHED',
          slides: [
            {
              id: `slide_${Date.now()}`,
              title: `${name} - First Slide`,
              subtitle: 'Lead in subtitle',
              description: 'Customize this slide to showcase your brand visual identity.',
              imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
              mediaType: 'image',
              primaryCta: { label: 'Explore Now', url: '#' },
              contentAlignment: 'left',
              verticalAlignment: 'center',
              overlayOpacity: 65,
              textColor: '#ffffff',
              accentColor: '#3b82f6',
              order: 1,
              isActive: true,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSliders((prev) => [...prev, data.slider]);
        setSelectedSliderSlug(data.slider.slug);
        setActiveTab('editor');
        showNotification(`Created slider '${name}' successfully.`);
      } else {
        showNotification(data.error || 'Failed to create slider', 'error');
      }
    } catch {
      showNotification('Error creating slider', 'error');
    }
  };

  // Duplicate slider
  const handleDuplicateSlider = async (sourceSlug: string) => {
    try {
      const res = await fetch('/api/v1/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          sourceSlug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSliders((prev) => [...prev, data.slider]);
        setSelectedSliderSlug(data.slider.slug);
        showNotification('Slider duplicated successfully.');
      }
    } catch {
      showNotification('Failed to duplicate slider', 'error');
    }
  };

  // Delete entire slider
  const handleDeleteSlider = async (slugToDelete: string) => {
    if (!confirm(`Are you sure you want to delete slider '${slugToDelete}'?`)) return;
    try {
      const res = await fetch(`/api/v1/sliders/${slugToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSliders((prev) => prev.filter((s) => s.slug !== slugToDelete));
        if (selectedSliderSlug === slugToDelete) {
          const remaining = sliders.filter((s) => s.slug !== slugToDelete);
          if (remaining.length > 0) {
            setSelectedSliderSlug(remaining[0].slug);
          }
        }
        showNotification(`Slider '${slugToDelete}' deleted.`);
      }
    } catch {
      showNotification('Error deleting slider', 'error');
    }
  };

  // Filtered sliders
  const filteredSliders = sliders.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.placement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActiveSlides = sliders.reduce(
    (acc, s) => acc + s.slides.filter((slide) => slide.isActive).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-rose-950/90 text-rose-200 border-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold text-slate-100">Hero Section Sliders & Carousels</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Headless Ready
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Design custom hero banners and carousels for client websites. Export clean React, HTML, or REST API payloads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSliders}
            title="Refresh Sliders"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateSlider}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Slider</span>
          </button>
        </div>
      </div>

      {/* Top Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-lg">
          <span className="text-xs font-medium text-slate-400">Total Sliders</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{sliders.length}</div>
          <span className="text-[11px] text-slate-500">Across all placements</span>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-lg">
          <span className="text-xs font-medium text-slate-400">Active Live Slides</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalActiveSlides}</div>
          <span className="text-[11px] text-slate-500">Published to frontends</span>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-lg">
          <span className="text-xs font-medium text-slate-400">Public REST API</span>
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm">/api/v1/sliders/public</span>
          </div>
          <span className="text-[11px] text-slate-500">CORS enabled & cached</span>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-lg">
          <span className="text-xs font-medium text-slate-400">Frontend Integration</span>
          <div className="text-sm font-semibold text-amber-400 mt-1">React, Swiper, HTML</div>
          <span className="text-[11px] text-slate-500">Tailwind & CSS ready</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('sliders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[5px] ${
            activeTab === 'sliders'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Sliders ({sliders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[5px] ${
            activeTab === 'editor'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Visual Slide Editor</span>
          {currentSlider && (
            <span className="px-1.5 py-0.5 text-[11px] bg-slate-800 text-slate-300 rounded">
              {currentSlider.slug}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[5px] ${
            activeTab === 'preview'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Interactive Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('developer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[5px] ${
            activeTab === 'developer'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Frontend Integration & Code</span>
        </button>
      </div>

      {/* TAB 1: ALL SLIDERS DIRECTORY */}
      {activeTab === 'sliders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sliders by name, slug, placement..."
                className="w-full px-3.5 py-2 text-sm bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <div className="flex bg-slate-900/60 border border-slate-800 rounded-lg p-0.5">
                {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === status
                        ? 'bg-slate-800 text-amber-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSliders.map((slider) => {
              const activeCount = slider.slides.filter((s) => s.isActive).length;
              const firstSlide = slider.slides[0];

              return (
                <div
                  key={slider.id}
                  className="bg-slate-900/50 border border-slate-800 hover:border-slate-700/80 rounded-xl overflow-hidden transition-all flex flex-col"
                >
                  {/* Card Thumbnail Banner */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                    {firstSlide?.imageUrl ? (
                      <img
                        src={firstSlide.imageUrl}
                        alt={firstSlide.title}
                        className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status & Placement Tags */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                          slider.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {slider.status}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-slate-900/80 text-slate-300 border border-slate-700 rounded-full backdrop-blur-sm">
                        {slider.placement}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {slider.autoplay && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full backdrop-blur-sm">
                          <Play className="w-3 h-3 fill-current" />
                          <span>{slider.autoplayInterval}ms</span>
                        </span>
                      )}
                    </div>

                    {/* Headline Overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-semibold text-slate-100 line-clamp-1">
                        {slider.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                          {slider.slug}
                        </code>
                        <span className="text-xs text-slate-400">
                          • {slider.slides.length} slides ({activeCount} active)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {slider.description || 'No description provided for this slider.'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                      <span>Aspect: {slider.aspectRatio}</span>
                      <span>Transition: {slider.transitionEffect}</span>
                      <span>Loop: {slider.loop ? 'Yes' : 'No'}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSliderSlug(slider.slug);
                            setActiveTab('editor');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit Slides</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSliderSlug(slider.slug);
                            setActiveTab('preview');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/api/v1/sliders/public/${slider.slug}`,
                              `api_${slider.slug}`
                            )
                          }
                          title="Copy Public JSON API Endpoint"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          {copiedCodeKey === `api_${slider.slug}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Code2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicateSlider(slider.slug)}
                          title="Duplicate Slider"
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlider(slider.slug)}
                          title="Delete Slider"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL SLIDE EDITOR */}
      {activeTab === 'editor' && currentSlider && (
        <div className="space-y-4">
          {/* Editor Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-400">Current Slider:</label>
              <select
                value={selectedSliderSlug}
                onChange={(e) => {
                  setSelectedSliderSlug(e.target.value);
                  setSelectedSlideIndex(0);
                }}
                className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
              >
                {sliders.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => handleSaveSlider(currentSlider)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Slides Manager (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">
                  Slides Queue ({currentSlider.slides.length})
                </h3>
                <button
                  onClick={handleAddSlide}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentSlider.slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedSlideIndex === idx
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-10 rounded overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                          None
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          Slide #{idx + 1}
                        </span>
                        {!slide.isActive && (
                          <span className="px-1 text-[10px] bg-slate-800 text-slate-400 rounded">
                            Off
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {slide.title || 'Untitled Slide'}
                      </p>
                    </div>

                    {/* Order & Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, 'up');
                        }}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, 'down');
                        }}
                        disabled={idx === currentSlider.slides.length - 1}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        title="Delete Slide"
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Slide Detail Editor (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-5">
              {currentSlide ? (
                <>
                  {/* Subtabs for Slide Configuration */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <button
                      onClick={() => setEditorSubTab('content')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        editorSubTab === 'content'
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Headline & Typography
                    </button>
                    <button
                      onClick={() => setEditorSubTab('media')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        editorSubTab === 'media'
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Media & Styling
                    </button>
                    <button
                      onClick={() => setEditorSubTab('settings')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        editorSubTab === 'settings'
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Slider Global Playback
                    </button>
                    <button
                      onClick={() => setEditorSubTab('custom')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        editorSubTab === 'custom'
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Client Custom Metadata
                    </button>
                  </div>

                  {/* Subtab 1: Content & Typography */}
                  {editorSubTab === 'content' && (
                    <div className="space-y-4">
                      {/* Active toggle */}
                      <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-xs font-semibold text-slate-200">Slide Active Status</span>
                          <p className="text-[11px] text-slate-400">
                            Inactive slides are hidden from frontend clients.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentSlide.isActive}
                          onChange={(e) => {
                            const updatedSlides = [...currentSlider.slides];
                            updatedSlides[selectedSlideIndex].isActive = e.target.checked;
                            handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                          }}
                          className="w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-700"
                        />
                      </div>

                      {/* Eyebrow & Badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-300">Subtitle / Eyebrow</label>
                          <input
                            type="text"
                            value={currentSlide.subtitle || ''}
                            onChange={(e) => {
                              const updatedSlides = [...currentSlider.slides];
                              updatedSlides[selectedSlideIndex].subtitle = e.target.value;
                              handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                            }}
                            placeholder="e.g. Enterprise Content Infrastructure"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-300">Badge Text (Kicker)</label>
                          <input
                            type="text"
                            value={currentSlide.badgeText || ''}
                            onChange={(e) => {
                              const updatedSlides = [...currentSlider.slides];
                              updatedSlides[selectedSlideIndex].badgeText = e.target.value;
                              handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                            }}
                            placeholder="e.g. New Release / 2026 Collection"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Headline Title */}
                      <div>
                        <label className="text-xs font-medium text-slate-300">Headline Title</label>
                        <input
                          type="text"
                          value={currentSlide.title}
                          onChange={(e) => {
                            const updatedSlides = [...currentSlider.slides];
                            updatedSlides[selectedSlideIndex].title = e.target.value;
                            handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                          }}
                          placeholder="Compelling main headline..."
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-semibold"
                        />
                      </div>

                      {/* Body Description */}
                      <div>
                        <label className="text-xs font-medium text-slate-300">Description</label>
                        <textarea
                          rows={3}
                          value={currentSlide.description || ''}
                          onChange={(e) => {
                            const updatedSlides = [...currentSlider.slides];
                            updatedSlides[selectedSlideIndex].description = e.target.value;
                            handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                          }}
                          placeholder="Supporting paragraph for this slide..."
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Call-to-Action 1 */}
                      <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
                        <span className="text-xs font-semibold text-amber-400">Primary Call-to-Action</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-slate-400">Button Label</label>
                            <input
                              type="text"
                              value={currentSlide.primaryCta?.label || ''}
                              onChange={(e) => {
                                const updatedSlides = [...currentSlider.slides];
                                const currentCta = updatedSlides[selectedSlideIndex].primaryCta || { label: '', url: '' };
                                updatedSlides[selectedSlideIndex].primaryCta = { ...currentCta, label: e.target.value };
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              placeholder="e.g. Learn More"
                              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400">URL / Route</label>
                            <input
                              type="text"
                              value={currentSlide.primaryCta?.url || ''}
                              onChange={(e) => {
                                const updatedSlides = [...currentSlider.slides];
                                const currentCta = updatedSlides[selectedSlideIndex].primaryCta || { label: '', url: '' };
                                updatedSlides[selectedSlideIndex].primaryCta = { ...currentCta, url: e.target.value };
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              placeholder="/solutions"
                              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400">Button Variant</label>
                            <select
                              value={currentSlide.primaryCta?.variant || 'glow'}
                              onChange={(e) => {
                                const updatedSlides = [...currentSlider.slides];
                                const currentCta = updatedSlides[selectedSlideIndex].primaryCta || { label: '', url: '' };
                                updatedSlides[selectedSlideIndex].primaryCta = { ...currentCta, variant: e.target.value as any };
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                            >
                              <option value="solid">Solid Fill</option>
                              <option value="glow">Vibrant Glow</option>
                              <option value="outline">Outline</option>
                              <option value="white">High Contrast White</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Call-to-Action 2 */}
                      <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
                        <span className="text-xs font-semibold text-slate-300">Secondary Call-to-Action (Optional)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-slate-400">Button Label</label>
                            <input
                              type="text"
                              value={currentSlide.secondaryCta?.label || ''}
                              onChange={(e) => {
                                const updatedSlides = [...currentSlider.slides];
                                const currentCta = updatedSlides[selectedSlideIndex].secondaryCta || { label: '', url: '' };
                                updatedSlides[selectedSlideIndex].secondaryCta = { ...currentCta, label: e.target.value };
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              placeholder="e.g. Contact Us"
                              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400">URL / Route</label>
                            <input
                              type="text"
                              value={currentSlide.secondaryCta?.url || ''}
                              onChange={(e) => {
                                const updatedSlides = [...currentSlider.slides];
                                const currentCta = updatedSlides[selectedSlideIndex].secondaryCta || { label: '', url: '' };
                                updatedSlides[selectedSlideIndex].secondaryCta = { ...currentCta, url: e.target.value };
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              placeholder="/contact"
                              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subtab 2: Media & Styling */}
                  {editorSubTab === 'media' && (
                    <div className="space-y-4">
                      {/* Media URL */}
                      <div>
                        <label className="text-xs font-medium text-slate-300">Desktop Background Image URL</label>
                        <input
                          type="text"
                          value={currentSlide.imageUrl}
                          onChange={(e) => {
                            const updatedSlides = [...currentSlider.slides];
                            updatedSlides[selectedSlideIndex].imageUrl = e.target.value;
                            handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                        />

                        {/* Quick Presets */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-slate-500">Presets:</span>
                          {[
                            { name: 'Tech Matrix', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80' },
                            { name: 'Cloud Neon', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80' },
                            { name: 'Cyber Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80' },
                            { name: 'Modern Minimal', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80' },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                const updatedSlides = [...currentSlider.slides];
                                updatedSlides[selectedSlideIndex].imageUrl = preset.url;
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Image & Video */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-300">Mobile-Optimized Image URL</label>
                          <input
                            type="text"
                            value={currentSlide.mobileImageUrl || ''}
                            onChange={(e) => {
                              const updatedSlides = [...currentSlider.slides];
                              updatedSlides[selectedSlideIndex].mobileImageUrl = e.target.value;
                              handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                            }}
                            placeholder="Optional vertical/square variant..."
                            className="mt-1 w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-300">Background Video URL (MP4 / WebM)</label>
                          <input
                            type="text"
                            value={currentSlide.videoUrl || ''}
                            onChange={(e) => {
                              const updatedSlides = [...currentSlider.slides];
                              updatedSlides[selectedSlideIndex].videoUrl = e.target.value;
                              handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                            }}
                            placeholder="Optional video loop URL..."
                            className="mt-1 w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                          />
                        </div>
                      </div>

                      {/* Overlay Opacity & Alignment */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-lg border border-slate-800">
                        <div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-medium">Dark Overlay Opacity</span>
                            <span className="text-amber-400 font-bold">{currentSlide.overlayOpacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="95"
                            value={currentSlide.overlayOpacity}
                            onChange={(e) => {
                              const updatedSlides = [...currentSlider.slides];
                              updatedSlides[selectedSlideIndex].overlayOpacity = parseInt(e.target.value, 10);
                              handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                            }}
                            className="w-full mt-2 accent-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-300">Content Alignment</label>
                          <div className="flex gap-1 mt-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                onClick={() => {
                                  const updatedSlides = [...currentSlider.slides];
                                  updatedSlides[selectedSlideIndex].contentAlignment = align;
                                  handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                                }}
                                className={`flex-1 py-1 text-xs capitalize rounded ${
                                  currentSlide.contentAlignment === align
                                    ? 'bg-slate-800 text-amber-400 font-semibold'
                                    : 'text-slate-400'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-300">Accent Highlight Color</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={currentSlide.accentColor || '#10b981'}
                              onChange={(e) => {
                                const updatedSlides = [...currentSlider.slides];
                                updatedSlides[selectedSlideIndex].accentColor = e.target.value;
                                handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                              }}
                              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                            <span className="text-xs font-mono text-slate-300">
                              {currentSlide.accentColor}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subtab 3: Slider Global Settings */}
                  {editorSubTab === 'settings' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-300">Transition Effect</label>
                          <select
                            value={currentSlider.transitionEffect}
                            onChange={(e) =>
                              handleSaveSlider({ ...currentSlider, transitionEffect: e.target.value as any })
                            }
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                          >
                            <option value="slide">Horizontal Slide</option>
                            <option value="fade">Cross Fade</option>
                            <option value="zoom">Ken Burns Zoom</option>
                            <option value="parallax">Parallax Shift</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-300">Aspect Ratio Hint</label>
                          <select
                            value={currentSlider.aspectRatio}
                            onChange={(e) =>
                              handleSaveSlider({ ...currentSlider, aspectRatio: e.target.value as any })
                            }
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                          >
                            <option value="21:9">Ultra-Wide (21:9)</option>
                            <option value="16:9">Widescreen (16:9)</option>
                            <option value="fullscreen">Full Viewport (100vh)</option>
                            <option value="auto">Auto Adaptive</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-300">Autoplay Interval (ms)</label>
                          <input
                            type="number"
                            min="2000"
                            max="15000"
                            step="500"
                            value={currentSlider.autoplayInterval}
                            onChange={(e) =>
                              handleSaveSlider({ ...currentSlider, autoplayInterval: parseInt(e.target.value, 10) })
                            }
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-300">Transition Speed (ms)</label>
                          <input
                            type="number"
                            min="200"
                            max="2000"
                            step="100"
                            value={currentSlider.transitionSpeed}
                            onChange={(e) =>
                              handleSaveSlider({ ...currentSlider, transitionSpeed: parseInt(e.target.value, 10) })
                            }
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                          />
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentSlider.autoplay}
                            onChange={(e) => handleSaveSlider({ ...currentSlider, autoplay: e.target.checked })}
                            className="w-4 h-4 text-amber-500 rounded bg-slate-800"
                          />
                          <span className="text-xs text-slate-300 font-medium">Autoplay</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentSlider.showArrows}
                            onChange={(e) => handleSaveSlider({ ...currentSlider, showArrows: e.target.checked })}
                            className="w-4 h-4 text-amber-500 rounded bg-slate-800"
                          />
                          <span className="text-xs text-slate-300 font-medium">Arrows</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentSlider.showDots}
                            onChange={(e) => handleSaveSlider({ ...currentSlider, showDots: e.target.checked })}
                            className="w-4 h-4 text-amber-500 rounded bg-slate-800"
                          />
                          <span className="text-xs text-slate-300 font-medium">Indicators</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentSlider.loop}
                            onChange={(e) => handleSaveSlider({ ...currentSlider, loop: e.target.checked })}
                            className="w-4 h-4 text-amber-500 rounded bg-slate-800"
                          />
                          <span className="text-xs text-slate-300 font-medium">Loop Infinite</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Subtab 4: Custom Metadata */}
                  {editorSubTab === 'custom' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-300">Custom CSS Class Names</label>
                        <input
                          type="text"
                          value={currentSlide.customCssClass || ''}
                          onChange={(e) => {
                            const updatedSlides = [...currentSlider.slides];
                            updatedSlides[selectedSlideIndex].customCssClass = e.target.value;
                            handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                          }}
                          placeholder="e.g. client-hero-slide custom-promo"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                        />
                        <span className="text-[11px] text-slate-500">
                          Passed directly to the frontend wrapper for client-specific styling.
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300">
                          Client Custom JSON Metadata (Attributes, Ratings, Extra Props)
                        </label>
                        <textarea
                          rows={6}
                          value={JSON.stringify(currentSlide.customData || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              const updatedSlides = [...currentSlider.slides];
                              updatedSlides[selectedSlideIndex].customData = parsed;
                              handleSaveSlider({ ...currentSlider, slides: updatedSlides });
                            } catch {
                              // Let user type
                            }
                          }}
                          className="mt-1 w-full font-mono text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[11px] text-slate-500">
                          JSON object accessible in your frontend component props.
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  Select a slide on the left to edit its properties.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE INTERACTIVE PREVIEW */}
      {activeTab === 'preview' && currentSlider && (
        <div className="space-y-4">
          {/* Preview Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            {/* Device Viewport Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  previewDevice === 'desktop'
                    ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (100%)</span>
              </button>
              <button
                onClick={() => setPreviewDevice('laptop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  previewDevice === 'laptop'
                    ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptop (1024px)</span>
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  previewDevice === 'tablet'
                    ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (768px)</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  previewDevice === 'mobile'
                    ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>

            {/* Animation & Autoplay Controls */}
            <div className="flex items-center gap-2">
              {/* Ken Burns Toggle */}
              <button
                onClick={() => setEnableKenBurns(!enableKenBurns)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  enableKenBurns
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                }`}
                title="Cinematic background slow zoom & pan animation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ken Burns: {enableKenBurns ? 'ON' : 'OFF'}</span>
              </button>

              {/* Autoplay Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlaying ? 'Pause' : 'Autoplay'}</span>
              </button>

              <span className="text-xs text-slate-400 px-2 py-1 bg-slate-950 rounded border border-slate-800">
                {previewSlideIndex + 1} / {currentSlider.slides.length}
              </span>
            </div>
          </div>

          {/* Interactive Hero Slider Canvas with Smooth Animations */}
          <div className="flex justify-center p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden min-h-[520px]">
            <div
              className={`w-full transition-all duration-500 ease-out ${
                previewDevice === 'desktop'
                  ? 'max-w-full'
                  : previewDevice === 'laptop'
                  ? 'max-w-[1024px]'
                  : previewDevice === 'tablet'
                  ? 'max-w-[768px]'
                  : 'max-w-[375px]'
              }`}
            >
              {(() => {
                const slide = currentSlider.slides[previewSlideIndex] || currentSlider.slides[0];
                if (!slide) return null;

                const alignmentClass =
                  slide.contentAlignment === 'center'
                    ? 'text-center items-center'
                    : slide.contentAlignment === 'right'
                    ? 'text-right items-end'
                    : 'text-left items-start';

                return (
                  <div
                    className="relative w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-center border border-slate-800 select-none"
                    style={{
                      height: previewDevice === 'mobile' ? currentSlider.heightMobile : currentSlider.heightDesktop,
                    }}
                  >
                    {/* Background Media with Cinematic Motion */}
                    <div className="absolute inset-0 overflow-hidden bg-slate-950">
                      <img
                        key={`bg-${slide.id}-${previewSlideIndex}`}
                        src={previewDevice === 'mobile' && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl}
                        alt={slide.title}
                        className={`w-full h-full object-cover transition-opacity duration-700 ${
                          enableKenBurns ? 'animate-hero-ken-burns' : 'scale-100'
                        }`}
                      />
                    </div>

                    {/* Gradient & Dark Lighting Overlay */}
                    <div
                      className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background:
                          slide.overlayGradient ||
                          `linear-gradient(to right, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.55) 60%, rgba(15, 23, 42, 0.2) 100%)`,
                        opacity: slide.overlayOpacity / 100,
                      }}
                    />

                    {/* Top Animated Autoplay Progress Bar */}
                    {currentSlider.showProgressBar && isPlaying && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900/60 z-30 overflow-hidden">
                        <div
                          key={`progress-${previewSlideIndex}`}
                          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 origin-left"
                          style={{
                            animation: `heroProgressTimer ${currentSlider.autoplayInterval}ms linear forwards`,
                          }}
                        />
                      </div>
                    )}

                    {/* Staggered Animated Content Block */}
                    <div
                      key={`content-${slide.id}-${previewSlideIndex}`}
                      className={`relative z-10 px-8 sm:px-16 max-w-4xl flex flex-col ${alignmentClass} animate-hero-slide-in`}
                    >
                      {/* Badge / Kicker Pill */}
                      {slide.badgeText && (
                        <div className="animate-hero-badge mb-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/10 text-white border border-white/20 shadow-lg">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{slide.badgeText}</span>
                        </div>
                      )}

                      {/* Subtitle Eyebrow */}
                      {slide.subtitle && (
                        <span className="animate-hero-subtitle text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">
                          {slide.subtitle}
                        </span>
                      )}

                      {/* Main Headline Title */}
                      <h2
                        className="animate-hero-title text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 drop-shadow-md"
                        style={{ color: slide.textColor || '#ffffff' }}
                      >
                        {slide.title}
                      </h2>

                      {/* Description Paragraph */}
                      {slide.description && (
                        <p className="animate-hero-description text-sm sm:text-base text-slate-200/90 leading-relaxed mb-7 max-w-2xl drop-shadow">
                          {slide.description}
                        </p>
                      )}

                      {/* Dual Action Buttons */}
                      <div className="animate-hero-cta flex flex-wrap items-center gap-3.5">
                        {slide.primaryCta?.label && (
                          <a
                            href={slide.primaryCta.url}
                            target={slide.primaryCta.target || '_self'}
                            onClick={(e) => e.preventDefault()}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-xl transition-all duration-200 active:scale-95 bg-amber-400 text-slate-950 hover:bg-amber-300 hover:shadow-amber-500/25 cursor-pointer"
                          >
                            {slide.primaryCta.label}
                          </a>
                        )}

                        {slide.secondaryCta?.label && (
                          <a
                            href={slide.secondaryCta.url}
                            target={slide.secondaryCta.target || '_self'}
                            onClick={(e) => e.preventDefault()}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            {slide.secondaryCta.label}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Navigation Arrows with Hover Glow */}
                    {currentSlider.showArrows && currentSlider.slides.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevSlide}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-xl hover:border-amber-400/50"
                          title="Previous Slide"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-200" />
                        </button>
                        <button
                          onClick={handleNextSlide}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-xl hover:border-amber-400/50"
                          title="Next Slide"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-200" />
                        </button>
                      </>
                    )}

                    {/* Smooth Morphing Indicator Dots */}
                    {currentSlider.showDots && currentSlider.slides.length > 1 && (
                      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2.5">
                        {currentSlider.slides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleGoToSlide(idx)}
                            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                              previewSlideIndex === idx
                                ? 'w-10 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                                : 'w-2.5 bg-white/35 hover:bg-white/70'
                            }`}
                            title={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FRONTEND DEVELOPER INTEGRATION & CODE GENERATOR */}
      {activeTab === 'developer' && currentSlider && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              <span>Headless Frontend Slider Code & Motion Architecture</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every client has unique design requirements. Choose your preferred frontend stack below for ready-to-copy code featuring 60 FPS smooth animations, Ken Burns zoom, and staggered typography reveals.
            </p>
          </div>

          {/* Framework Choice Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setDevCodeFramework('tailwind')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                devCodeFramework === 'tailwind'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              Next.js + Tailwind (Zero Dependencies)
            </button>
            <button
              onClick={() => setDevCodeFramework('framer')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                devCodeFramework === 'framer'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              Framer Motion (Spring Physics & Gestures)
            </button>
            <button
              onClick={() => setDevCodeFramework('swiper')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                devCodeFramework === 'swiper'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              Swiper.js / Touch Carousel
            </button>
            <button
              onClick={() => setDevCodeFramework('api')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                devCodeFramework === 'api'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              REST API & TypeScript Schema
            </button>
          </div>

          {/* Option 1: Tailwind CSS Zero-Dependency Component */}
          {devCodeFramework === 'tailwind' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-semibold text-amber-400 font-mono">
                  components/HeroSlider.tsx (60 FPS Native CSS Animations)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `'use client';

import React, { useState, useEffect } from 'react';

export function HeroSlider({ slug = '${currentSlider.slug}' }: { slug?: string }) {
  const [data, setData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(\`/api/v1/sliders/public/\${slug}\`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      });
  }, [slug]);

  const slides = data?.slides || [];
  const slider = data?.slider || {};

  useEffect(() => {
    if (!slides.length || !slider.autoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, slider.autoplayInterval || 5000);
    return () => clearInterval(interval);
  }, [slides.length, slider.autoplay, slider.autoplayInterval]);

  if (!slides.length) return null;
  const current = slides[currentIndex];

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center select-none"
      style={{ height: slider.heightDesktop || '680px' }}
    >
      {/* Background with Cinematic Ken Burns Zoom */}
      <div className="absolute inset-0 overflow-hidden bg-slate-950">
        <img
          key={\`bg-\${currentIndex}\`}
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover animate-hero-ken-burns transition-opacity duration-700"
        />
      </div>

      {/* Dynamic Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: current.overlayGradient || 'linear-gradient(to right, rgba(15,23,42,0.92), rgba(15,23,42,0.4))',
          opacity: (current.overlayOpacity ?? 60) / 100,
        }}
      />

      {/* Staggered Typography Content */}
      <div 
        key={\`content-\${currentIndex}\`}
        className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 text-white flex flex-col animate-hero-slide-in"
      >
        {current.badgeText && (
          <span className="animate-hero-badge inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md mb-3 border border-white/20 w-fit">
            ✨ {current.badgeText}
          </span>
        )}
        {current.subtitle && (
          <span className="animate-hero-subtitle text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">
            {current.subtitle}
          </span>
        )}
        <h1 className="animate-hero-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
          {current.title}
        </h1>
        <p className="animate-hero-description text-base sm:text-lg text-slate-200/90 max-w-2xl mb-8 leading-relaxed">
          {current.description}
        </p>
        <div className="animate-hero-cta flex flex-wrap gap-4">
          {current.primaryCta && (
            <a
              href={current.primaryCta.url}
              className="px-6 py-3 rounded-lg font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-transform active:scale-95 shadow-xl"
            >
              {current.primaryCta.label}
            </a>
          )}
          {current.secondaryCta && (
            <a
              href={current.secondaryCta.url}
              className="px-6 py-3 rounded-lg font-semibold backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-transform active:scale-95"
            >
              {current.secondaryCta.label}
            </a>
          )}
        </div>
      </div>

      {/* Morphing Dots Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2.5">
        {slides.map((_: any, idx: number) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={\`h-2.5 rounded-full transition-all duration-500 \${
              currentIndex === idx 
                ? 'w-10 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }\`}
          />
        ))}
      </div>
    </section>
  );
}`,
                      'tailwind_snippet'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {copiedCodeKey === 'tailwind_snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Component</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed">
{`// 100% Native Tailwind CSS + 60fps GPU Hardware Accelerated Animations
// Includes Ken Burns slow cinematic drift and staggered text entrance`}
              </pre>
            </div>
          )}

          {/* Option 2: Framer Motion Component */}
          {devCodeFramework === 'framer' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-semibold text-blue-400 font-mono">
                  components/FramerHeroSlider.tsx (Spring Physics & AnimatePresence)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FramerHeroSlider({ slider, slides }: { slider: any; slides: any[] }) {
  const [index, setIndex] = useState(0);
  const current = slides[index];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: slider.heightDesktop || '650px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center"
        >
          <motion.img
            src={current.imageUrl}
            alt={current.title}
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 7, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl font-black mb-4"
            >
              {current.title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-lg text-slate-200 mb-6"
            >
              {current.description}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}`,
                      'framer_snippet'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {copiedCodeKey === 'framer_snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Framer Component</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed">
{`// Framer Motion implementation with spring physics and AnimatePresence exit/enter choreography`}
              </pre>
            </div>
          )}

          {/* Option 3: Swiper.js Component */}
          {devCodeFramework === 'swiper' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-semibold text-rose-400 font-mono">
                  components/SwiperHeroSlider.tsx (Touch & Gestures)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function SwiperHero({ slides, slider }: { slides: any[]; slider: any }) {
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Navigation, Pagination]}
      effect="fade"
      loop={slider.loop}
      autoplay={{ delay: slider.autoplayInterval || 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation={slider.showArrows}
      className="w-full h-[650px]"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id} className="relative flex items-center justify-center">
          <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-4xl px-8 text-white">
            <h2 className="text-5xl font-black mb-3">{slide.title}</h2>
            <p className="text-lg text-slate-200">{slide.description}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}`,
                      'swiper_snippet'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {copiedCodeKey === 'swiper_snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Swiper Component</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed">
{`// Swiper.js setup with EffectFade, Autoplay, touch swiping and mobile optimization`}
              </pre>
            </div>
          )}

          {/* Option 4: REST API & Types */}
          {devCodeFramework === 'api' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  GET /api/v1/sliders/public/{currentSlider.slug}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `// Fetch active hero slides for server components or client fetching
const res = await fetch('https://your-domain.com/api/v1/sliders/public/${currentSlider.slug}', {
  next: { revalidate: 60 } // Incremental Static Regeneration (1 min)
});

const { success, slider, slides } = await res.json();`,
                      'api_snippet'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {copiedCodeKey === 'api_snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy API Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed">
{`// Fetch active hero slides for server components or client fetching
const res = await fetch('https://your-domain.com/api/v1/sliders/public/${currentSlider.slug}', {
  next: { revalidate: 60 } // Incremental Static Regeneration (1 min)
});

const { success, slider, slides } = await res.json();`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

