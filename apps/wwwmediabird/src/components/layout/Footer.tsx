import React from 'react';
import Link from 'next/link';
import { EDITORIAL_CATEGORIES } from '@/data/categories';
import { AFFILIATE_DISCLOSURE } from '@/lib/monetization';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t-4 border-editorial-crimson mt-20">
      {/* Upper Footer: Brand, Categories, Newsroom */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <span className="font-sans italic font-extrabold text-3xl sm:text-4xl text-white tracking-tighter leading-none select-none">
                MB
              </span>
              <div className="flex flex-col -space-y-0.5">
                <span className="font-sans font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-tight">
                  Mediabird
                </span>
                <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.3em] uppercase font-bold text-red-400">
                  MAGAZINE
                </span>
              </div>
            </Link>

            <p className="font-sans italic text-base text-stone-300 max-w-sm">
              “Telling It Slow, Saying It Right!”
            </p>

            <p className="font-sans text-xs text-stone-400 leading-relaxed max-w-sm">
              An independent editorial magazine committed to reflective journalism, cultural inquiry,
              and intellectual depth across modern society, science, and the arts.
            </p>

            {/* Social Channels */}
            <div className="pt-2 flex items-center space-x-4 text-xs font-sans text-stone-400">
              <a
                href="https://www.facebook.com/mediabirdmag"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Media Bird Magazine on Facebook"
              >
                Facebook
              </a>
              <span className="text-stone-700">•</span>
              <a
                href="https://x.com/mediabirdmag"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Media Bird Magazine on X"
              >
                X / Twitter
              </a>
              <span className="text-stone-700">•</span>
              <a
                href="https://www.instagram.com/mediabirdmag"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Media Bird Magazine on Instagram"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-stone-400">
              Editorial Categories
            </h3>
            <ul className="space-y-2 text-sm font-sans">
              {EDITORIAL_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-stone-300 hover:text-white transition-colors hover:underline decoration-editorial-crimson underline-offset-4"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsroom & About Column */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-stone-400">
              Newsroom
            </h3>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <Link href="/about" className="text-stone-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/guest-post" className="text-stone-300 hover:text-white transition-colors">
                  Write for Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-300 hover:text-white transition-colors">
                  Contact Newsroom
                </Link>
              </li>
              <li>
                <a
                  href="/api/rss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>RSS Feed</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Governance & Policies Column */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-stone-400">
              Policies & Legal
            </h3>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <Link href="/privacy-policy" className="text-stone-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="text-stone-300 hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-stone-300 hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/comment-policy" className="text-stone-300 hover:text-white transition-colors">
                  Comment Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="mt-12 pt-8 border-t border-stone-800 text-xs font-sans text-stone-400 leading-relaxed">
          <p className="max-w-4xl">
            <strong className="text-stone-300">Editorial Disclosure:</strong> {AFFILIATE_DISCLOSURE}
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-stone-400">
          <p>© {currentYear} Media Bird Magazine. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Powered by independent journalism and decoupled publishing infrastructure.
          </p>
        </div>
      </div>
    </footer>
  );
}
