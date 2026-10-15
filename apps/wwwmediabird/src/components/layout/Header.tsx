'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Mail, Menu, X } from 'lucide-react';
import { EDITORIAL_CATEGORIES } from '@/data/categories';
import { SearchModal } from '@/components/layout/SearchModal';
import { NewsletterModal } from '@/components/layout/NewsletterModal';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#931b1c] text-white shadow-md transition-all">
        {/* Main Masthead / Logo & Primary Navigation */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Identity matching reference */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <span className="font-sans italic font-extrabold text-3xl sm:text-4xl text-white tracking-tighter leading-none select-none">
                  MB
                </span>
                <div className="flex flex-col -space-y-0.5">
                  <span className="font-sans font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-tight">
                    Mediabird
                  </span>
                  <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.3em] uppercase font-bold text-white/90">
                    MAGAZINE
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Category Navigation matching reference (No underline lines) */}
            <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
              {EDITORIAL_CATEGORIES.map((cat) => {
                const isActive = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`font-sans text-sm tracking-wide font-semibold py-1.5 transition-colors flex items-center space-x-1 ${
                      isActive
                        ? 'text-white font-bold opacity-100'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-white/70 text-xs font-normal">+</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Search button, Mail icon & Mobile Menu button */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search Toggle Button: Launches Modal */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Open search modal"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Newsletter Modal Launch Button */}
              <button
                onClick={() => setNewsletterModalOpen(true)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:inline-flex cursor-pointer"
                aria-label="Subscribe to newsletter"
                title="Subscribe to Newsletter"
              >
                <Mail className="w-5 h-5" />
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-full lg:hidden transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#821718] px-4 pt-4 pb-6 space-y-4">
            {/* Search Launcher inside mobile menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-sm bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors text-left cursor-pointer"
            >
              <Search className="w-4 h-4 text-white/70" />
              <span>Search stories, ideas, topics...</span>
            </button>

            {/* Newsletter Launcher inside mobile menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setNewsletterModalOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-sm bg-white/10 text-white/90 hover:text-white rounded-xl transition-colors text-left cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white/80" />
              <span>Subscribe to Weekly Dispatch</span>
            </button>

            <div className="space-y-1">
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-white/60 px-3 py-1">
                Editorial Categories
              </div>
              {EDITORIAL_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-sans font-semibold rounded-md transition-colors ${
                    pathname === `/category/${cat.slug}`
                      ? 'bg-white text-[#931b1c]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 space-y-1">
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-white/60 px-3 py-1">
                Publication
              </div>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 text-sm font-sans text-white/85 hover:text-white"
              >
                About Media Bird
              </Link>
              <Link
                href="/guest-post"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 text-sm font-sans text-white/85 hover:text-white"
              >
                Write for Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 text-sm font-sans text-white/85 hover:text-white"
              >
                Contact the Newsroom
              </Link>
              <Link
                href="/privacy-policy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 text-sm font-sans text-white/85 hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Lightweight Neat and Clean Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Beautiful Newsletter Modal */}
      <NewsletterModal
        isOpen={newsletterModalOpen}
        onClose={() => setNewsletterModalOpen(false)}
      />
    </>
  );
}
