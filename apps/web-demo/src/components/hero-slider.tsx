'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, ArrowRight, X, Volume2 } from 'lucide-react';
import { Slide, SliderData, FALLBACK_SLIDER } from '@/lib/cms-client';

interface HeroSliderProps {
  initialData?: {
    slider: Omit<SliderData, 'slides'>;
    slides: Slide[];
  };
}

export function HeroSlider({ initialData = FALLBACK_SLIDER }: HeroSliderProps) {
  const { slider, slides } = initialData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(slider.autoplay ?? true);
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const duration = slider.autoplayInterval || 5500;
  const slidesCount = slides.length;

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex((index + slidesCount) % slidesCount);
      setProgress(0);
    },
    [slidesCount]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay timer and progress bar
  useEffect(() => {
    if (!isPlaying || slidesCount <= 1 || videoModalOpen) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const progressStep = (stepMs / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentIndex, duration, slidesCount, nextSlide, videoModalOpen]);

  // Keyboard navigation & modal escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (videoModalOpen && e.key === 'Escape') {
        setVideoModalOpen(false);
        return;
      }
      if (!videoModalOpen) {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, videoModalOpen]);

  // Lock body scroll when video modal is open
  useEffect(() => {
    if (videoModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [videoModalOpen]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    setTouchStartX(null);
  };

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const handleSecondaryCtaClick = (e: React.MouseEvent, url?: string) => {
    if (url === '#video-tour' || !url || url.includes('video')) {
      e.preventDefault();
      setVideoModalOpen(true);
    }
  };

  return (
    <>
      <section
        className="relative w-full overflow-hidden bg-slate-950 select-none group border-b border-slate-200"
        style={{ minHeight: '680px', height: 'calc(100vh - 100px)', maxHeight: '820px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Prince Public School Flagship Hero Slider"
      >
        {/* Background Slides with Cross-Fade and Ken Burns Zoom */}
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with Cinematic Ken Burns effect */}
              <div
                className={`absolute inset-0 overflow-hidden transition-transform duration-[8000ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover object-[center_30%]"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>

              {/* Scrim: Dark navy on left for razor-sharp typography, transparent on right for bright student imagery */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(9, 24, 45, 0.94) 0%, rgba(9, 24, 45, 0.82) 36%, rgba(9, 24, 45, 0.42) 65%, rgba(9, 24, 45, 0.08) 100%)',
                }}
              />

              {/* Bottom Scrim for Navigation Readability */}
              <div
                className="absolute inset-x-0 bottom-0 h-40"
                style={{
                  background: 'linear-gradient(to top, rgba(9, 24, 45, 0.85) 0%, rgba(9, 24, 45, 0) 100%)',
                }}
              />
            </div>
          );
        })}

        {/* Slide Content Layer (10% reduced from navigation width) */}
        <div className="relative z-20 max-w-[1600px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-2xl lg:max-w-3xl space-y-5 pt-4 pb-28 sm:pb-32 lg:pb-36">
            {/* Eyebrow Badge & Subtitle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {currentSlide.badgeText && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {currentSlide.badgeText}
                </span>
              )}
              {currentSlide.subtitle && (
                <p className="text-[#f7b801] font-bold text-xs sm:text-sm tracking-[0.18em] uppercase animate-in fade-in slide-in-from-bottom-3 duration-500 font-mono">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Main Title (Modern Sans-Serif) */}
            <h1
              key={`title-${currentIndex}`}
              className="text-3xl sm:text-5xl lg:text-[3.75rem] font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans"
            >
              {currentSlide.title}
            </h1>

            {/* Description */}
            {currentSlide.description && (
              <p
                key={`desc-${currentIndex}`}
                className="text-slate-100 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl drop-shadow animate-in fade-in slide-in-from-bottom-5 duration-700 font-normal"
              >
                {currentSlide.description}
              </p>
            )}

            {/* Dual Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {currentSlide.primaryCta && (
                <Link
                  href={currentSlide.primaryCta.url}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#e2a02b] hover:bg-[#d99b26] text-[#09182d] font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-black/30 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{currentSlide.primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              )}

              {currentSlide.secondaryCta && (
                <button
                  type="button"
                  onClick={(e) => handleSecondaryCtaClick(e, currentSlide.secondaryCta?.url)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base backdrop-blur-md border border-white/40 shadow-xl shadow-black/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                  </div>
                  <span>{currentSlide.secondaryCta.label}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top Linear Progress Bar */}
        {slider.showProgressBar && (
          <div className="absolute top-0 inset-x-0 h-1 bg-slate-900/80 z-30">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-tiger_orange-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Navigation Circular Arrows (Left & Right) */}
        {slider.showArrows && (
          <div className="absolute inset-y-0 inset-x-4 sm:inset-x-8 flex items-center justify-between pointer-events-none z-30">
            <button
              onClick={prevSlide}
              className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-black/60 text-white/90 hover:text-white border border-white/30 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-black/60 text-white/90 hover:text-white border border-white/30 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Bottom Interactive Controls Bar */}
        <div className="absolute bottom-16 sm:bottom-20 lg:bottom-24 inset-x-0 z-30">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Interactive Slide Category Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {slides.map((s, idx) => {
                const isActive = idx === currentIndex;
                const tabLabel = s.customData?.tabLabel || `Slide ${idx + 1}`;
                return (
                  <button
                    key={s.id || idx}
                    onClick={() => goToSlide(idx)}
                    className={`relative px-3.5 py-2 rounded-xl text-left transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-md'
                        : 'bg-black/20 hover:bg-white/10 text-white/70 hover:text-white border border-transparent'
                    }`}
                    aria-label={`Go to slide ${idx + 1}: ${tabLabel}`}
                  >
                    <span
                      className={`text-xs sm:text-sm font-mono font-bold ${
                        isActive ? 'text-amber-400' : 'text-white/60'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
                      {tabLabel}
                    </span>

                    {/* Active Tab Underline Progress */}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-tiger_orange-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slide Counter & Play/Pause Controller */}
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-md">
              {/* Minimalist Reference Dots */}
              <div className="flex items-center gap-1.5 pr-2 border-r border-white/20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentIndex ? 'w-5 h-2 bg-amber-400' : 'w-2 h-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Jump to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-white/80">
                <span className="text-amber-400 font-bold">0{currentIndex + 1}</span>
                <span className="text-white/40">/</span>
                <span>0{slidesCount}</span>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white/70 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Video Modal */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h3 id="video-modal-title" className="text-white font-bold text-base sm:text-lg">
                  Prince Public School — Campus Experience & Tour
                </h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Close Video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Iframe Embed */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/9No-FiEInLA?autoplay=1&rel=0&modestbranding=1"
                title="Prince Public School Virtual Campus Experience"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 sm:p-5 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Admissions Open for Session 2026-27 (Pre-School to Class X • 100% CBSE Board Result)</span>
              </div>
              <Link
                href="/admissions"
                onClick={() => setVideoModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
