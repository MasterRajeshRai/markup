'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SiteConfig {
  id: string;
  name: string;
  slug: string;
  domain: string;
  frontendUrl: string;
  defaultLocale: string;
  isDefault: boolean;
  tagline?: string;
  badge?: string;
}

export const REGISTERED_SITES: SiteConfig[] = [
  {
    id: 'site_mediabird_03',
    name: 'Media Bird Magazine',
    slug: 'mediabird',
    domain: 'https://www.mediabirdmag.com',
    frontendUrl: 'http://localhost:3001',
    defaultLocale: 'en-US',
    isDefault: true,
    tagline: 'Telling It Slow, Saying It Right!',
    badge: 'Connected Frontend (Port 3001)',
  },
];

interface SiteContextType {
  currentSite: SiteConfig;
  sites: SiteConfig[];
  switchSite: (slug: string) => void;
  fetchWithSite: (url: string, options?: RequestInit) => Promise<Response>;
}

const SiteContext = createContext<SiteContextType>({
  currentSite: REGISTERED_SITES[0],
  sites: REGISTERED_SITES,
  switchSite: () => {},
  fetchWithSite: (url, opts) => fetch(url, opts),
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [currentSite, setCurrentSite] = useState<SiteConfig>(REGISTERED_SITES[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSlug = localStorage.getItem('markup_site_slug');
      const found = savedSlug ? REGISTERED_SITES.find((s) => s.slug === savedSlug) : null;
      if (found) {
        setCurrentSite(found);
      } else {
        // Default to Media Bird Magazine
        setCurrentSite(REGISTERED_SITES[0]);
        localStorage.setItem('markup_site_slug', REGISTERED_SITES[0].slug);
        document.cookie = `markup_site_slug=${REGISTERED_SITES[0].slug}; path=/; max-age=31536000`;
      }
    }
  }, []);

  const switchSite = (slug: string) => {
    const found = REGISTERED_SITES.find((s) => s.slug === slug);
    if (!found) return;

    setCurrentSite(found);
    if (typeof window !== 'undefined') {
      localStorage.setItem('markup_site_slug', slug);
      document.cookie = `markup_site_slug=${encodeURIComponent(slug)}; path=/; max-age=31536000`;
      window.dispatchEvent(new CustomEvent('markup-site-changed', { detail: found }));
    }
  };

  const fetchWithSite = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    headers.set('x-site-slug', currentSite.slug);
    return fetch(url, { ...options, headers });
  };

  return (
    <SiteContext.Provider
      value={{
        currentSite,
        sites: REGISTERED_SITES,
        switchSite,
        fetchWithSite,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}
