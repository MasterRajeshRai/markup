const CMS_BASE_URL = process.env.CMS_BASE_URL || 'http://localhost:3000/api/v1';
const CMS_API_KEY = process.env.CMS_API_KEY || 'cms_live_caadf19cfe32247af2e4bf793e445c135990f319b9398a99';

export async function fetchCmsApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${CMS_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('X-API-Key', CMS_API_KEY);
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store', // Always fetch fresh in demo
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CMS API Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const FALLBACK_HOME = {
  id: 'home_page_entry',
  slug: 'home',
  title: 'Markup — Decoupled Digital Experience',
  seo: {
    description: 'Universal Content Operating System powering web apps and omnichannel digital platforms.',
  },
  blocks: [
    {
      id: 'blk_hero_1',
      type: 'hero',
      data: {
        badge: 'Enterprise Headless Platform',
        title: 'Universal Content Operating System',
        subtitle: 'Powering web apps, mobile apps, digital kiosks, and commerce with unparalleled API performance and visual block editing.',
        primaryCta: { label: 'Explore Articles', url: '/articles' },
        secondaryCta: { label: 'View Documentation', url: 'http://localhost:3000/api-docs' },
      },
    },
    {
      id: 'blk_cards_1',
      type: 'cards',
      data: {
        columns: 3,
        items: [
          {
            title: 'API-First & Headless',
            description: 'Ultra-fast REST & GraphQL-ready delivery with deep population controls, ETags, and edge caching.',
            icon: 'Zap',
          },
          {
            title: 'Visual Block Composer',
            description: '25+ enterprise blocks with nested columns, accordions, heroes, cards, and custom components.',
            icon: 'Layout',
          },
          {
            title: 'Multi-Tenant & Multi-Site',
            description: 'Manage multiple domains, locales, and digital products from a single unified control plane.',
            icon: 'Globe',
          },
        ],
      },
    },
    {
      id: 'blk_quote_1',
      type: 'quote',
      data: {
        quote: 'Decoupling our frontend experience gave our product team the velocity to deploy digital experiences 10x faster.',
        author: 'Sarah Chen',
        role: 'VP of Platform Engineering',
      },
    },
    {
      id: 'blk_accordion_1',
      type: 'accordion',
      data: {
        items: [
          {
            title: 'Can this CMS power multiple websites simultaneously?',
            content: 'Yes! The multi-site architecture allows managing unlimited independent domains, locales, and content models from one central installation.',
          },
          {
            title: 'Is content protected by revisions and workflows?',
            content: 'Every change is versioned with full JSON snapshotting, visual diffing, and configurable approval workflows.',
          },
        ],
      },
    },
    {
      id: 'blk_cta_1',
      type: 'cta',
      data: {
        title: 'Ready to build your next digital platform?',
        description: 'Connect your favorite frontend framework — Next.js, Nuxt, Remix, Astro, or Flutter.',
        buttonText: 'Read Architecture Guides',
        buttonUrl: '/articles',
      },
    },
  ],
};

export const FALLBACK_ARTICLES = [
  {
    id: 'art-1',
    slug: 'building-enterprise-headless-cms-with-nextjs',
    title: 'Architecting Enterprise Headless CMS with Next.js & Edge Caching',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    data: {
      summary: 'Explore how decoupled content architecture eliminates database hotspots, scales across distributed CDN edges, and accelerates time-to-market.',
      byline: 'Devin Vance',
      read_time: 6,
    },
    taxonomies: [
      { id: 't1', name: 'Next.js', slug: 'nextjs' },
      { id: 't2', name: 'Architecture', slug: 'architecture' },
    ],
    blocks: [
      {
        id: 'b1',
        type: 'hero',
        data: {
          badge: 'Technical Deep Dive',
          title: 'Decoupled Content at Global Scale',
          subtitle: 'Why modern engineering organizations are moving away from monolithic CMS stacks towards headless API backbones.',
        },
      },
      {
        id: 'b2',
        type: 'paragraph',
        data: {
          text: 'Traditional monolithic content management systems couple content authoring directly to server-side HTML rendering. As traffic surges or digital omnichannel requirements emerge, monolithic architectures struggle under database contention and cache invalidation complexity.',
        },
      },
      {
        id: 'b3',
        type: 'quote',
        data: {
          quote: 'Headless CMS gives developers the freedom of modern JavaScript frameworks while giving content creators the power of visual, structured authoring without compromises.',
          author: 'Sarah Chen',
          role: 'VP of Platform Engineering',
        },
      },
    ],
  },
  {
    id: 'art-2',
    slug: 'high-performance-media-pipelines-cloudflare-r2',
    title: 'Cloudflare R2 & Smart WebP Media Pipelines with Zero Storage Overhead',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    data: {
      summary: 'Automate focal point detection, crop presets, and aggressive image optimization while maintaining zero-egress cost Cloudflare R2 storage.',
      byline: 'Elena Rostova',
      read_time: 4,
    },
    taxonomies: [
      { id: 't3', name: 'Cloudflare R2', slug: 'cloudflare-r2' },
      { id: 't4', name: 'Performance', slug: 'performance' },
    ],
    blocks: [
      {
        id: 'b21',
        type: 'paragraph',
        data: {
          text: 'By taking advantage of Cloudflare R2 zero-egress pricing combined with on-the-fly Sharp auto-cropping into WebP and JPEG fallbacks, media management becomes virtually costless at scale.',
        },
      },
    ],
  },
];

export const cmsClient = {
  async getEntries(type?: string, q?: string) {
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (q) params.set('q', q);
      const res = await fetchCmsApi<{ data: any[]; meta: any }>(`/content?${params.toString()}`);
      if (res.data && res.data.length > 0) return res;
      return { data: FALLBACK_ARTICLES, meta: { total: FALLBACK_ARTICLES.length } };
    } catch {
      return { data: FALLBACK_ARTICLES, meta: { total: FALLBACK_ARTICLES.length } };
    }
  },

  async getEntry(idOrSlug: string, previewToken?: string) {
    try {
      const params = new URLSearchParams();
      if (previewToken) params.set('previewToken', previewToken);
      const res = await fetchCmsApi<{ data: any }>(`/content/${idOrSlug}?${params.toString()}`);
      if (res.data) return res;
      throw new Error('Not found');
    } catch {
      if (idOrSlug === 'home') return { data: FALLBACK_HOME };
      const found = FALLBACK_ARTICLES.find((a) => a.slug === idOrSlug || a.id === idOrSlug);
      if (found) return { data: found };
      throw new Error('Entry not found');
    }
  },

  async getNavigation(slug = 'main-navigation') {
    try {
      const res = await fetchCmsApi<{ data: any }>(`/navigation/${slug}`);
      if (res.data?.items) return res;
      return {
        data: {
          items: [
            { title: 'Home', url: '/' },
            { title: 'Articles', url: '/articles' },
          ],
        },
      };
    } catch {
      return {
        data: {
          items: [
            { title: 'Home', url: '/' },
            { title: 'Articles', url: '/articles' },
          ],
        },
      };
    }
  },

  async getSettings() {
    try {
      const res = await fetchCmsApi<{
        site?: { name?: string; domain?: string; branding?: { logoUrl?: string; faviconUrl?: string; primaryColor?: string } };
        branding?: { logoUrl?: string; faviconUrl?: string; primaryColor?: string };
        settings?: Record<string, any>;
      }>('/settings');
      return res;
    } catch {
      return { site: {}, branding: {}, settings: {} };
    }
  },
};

