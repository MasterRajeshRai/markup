'use client';

import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml?: string;
  className?: string;
}

export function TableOfContents({ contentHtml, className = '' }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract h2 and h3 elements from rendered DOM
    const headings = Array.from(document.querySelectorAll('.editorial-content h2, .editorial-content h3'));
    const parsed: TocItem[] = headings
      .map((h, index) => {
        const text = h.textContent?.trim() || '';
        if (!text) return null;
        let id = h.id;
        if (!id) {
          id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          h.id = id;
        }
        return {
          id,
          text,
          level: h.tagName.toLowerCase() === 'h3' ? 3 : 2,
        };
      })
      .filter((item): item is TocItem => item !== null);

    setItems(parsed);

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px' }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [contentHtml]);

  if (items.length < 2) return null;

  return (
    <nav
      className={`p-5 rounded-lg border border-stone-200 bg-stone-50/70 ${className}`}
      aria-label="Table of Contents"
    >
      <div className="flex items-center space-x-2 text-xs font-sans font-bold uppercase tracking-wider text-stone-700 mb-3">
        <List className="w-4 h-4 text-editorial-crimson" />
        <span>In This Story</span>
      </div>

      <ul className="space-y-2 text-xs font-sans">
        {items.map((item) => (
          <li
            key={item.id}
            className={`${item.level === 3 ? 'pl-3' : 'pl-0'}`}
          >
            <a
              href={`#${item.id}`}
              className={`block transition-colors hover:text-editorial-crimson line-clamp-1 ${
                activeId === item.id
                  ? 'text-editorial-crimson font-bold'
                  : 'text-stone-600'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
