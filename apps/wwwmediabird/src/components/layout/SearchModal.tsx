'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { EDITORIAL_CATEGORIES } from '@/data/categories';
import { formatShortDate } from '@/lib/utils';

interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  date: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input and lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live instant search debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Submit search query to full search results page
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSelectResult = (slug: string) => {
    router.push(`/${slug}`);
    onClose();
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 transform transition-all animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center px-4 sm:px-6 py-4 border-b border-stone-100 relative"
        >
          <Search className="w-5 h-5 text-stone-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, ideas, topics..."
            className="w-full bg-transparent text-base sm:text-lg font-sans text-stone-900 placeholder:text-stone-400 focus:outline-none pr-16"
          />

          <div className="absolute right-4 flex items-center space-x-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close search modal"
            >
              <kbd className="hidden sm:inline-block text-[10px] font-sans font-medium text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 mr-1.5">
                ESC
              </kbd>
              <X className="w-4 h-4 inline sm:hidden" />
            </button>
          </div>
        </form>

        {/* Modal Body / Results & Suggestions */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 divide-y divide-stone-100">
          {/* 1. Live Instant Results */}
          {query.trim().length >= 2 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-sans text-stone-400 font-semibold uppercase tracking-wider px-2">
                <span>{loading ? 'Searching...' : `Results (${results.length})`}</span>
                {results.length > 0 && (
                  <button
                    onClick={handleSubmit}
                    className="text-editorial-crimson hover:underline normal-case font-medium flex items-center space-x-1"
                  >
                    <span>View all matching stories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectResult(item.slug)}
                      className="w-full text-left p-3 rounded-xl hover:bg-stone-50 transition-colors flex items-start space-x-3 group cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-editorial-crimson shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm sm:text-base font-bold text-stone-900 group-hover:text-editorial-crimson transition-colors line-clamp-1">
                          {item.title}
                        </p>
                        <div className="flex items-center space-x-2 text-xs font-sans text-stone-400 mt-0.5">
                          <span className="font-semibold text-stone-600">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span>{formatShortDate(item.date)}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-editorial-crimson group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              ) : !loading ? (
                <div className="py-8 text-center text-stone-500 space-y-2">
                  <p className="font-sans text-base text-stone-700">
                    No matching articles found for “{query}”
                  </p>
                  <p className="text-xs text-stone-400">
                    Try checking spelling or browsing one of our editorial categories below.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            /* 2. Initial State: Quick Categories */
            <div className="space-y-4">
              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-stone-400 mb-3 px-1">
                  Explore Editorial Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {EDITORIAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-editorial-crimson hover:text-white text-stone-700 font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 text-xs font-sans text-stone-400 flex items-center justify-between">
                <span>Telling It Slow, Saying It Right!</span>
                <span className="hidden sm:inline">Press Enter to search</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
