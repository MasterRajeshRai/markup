/**
 * In-memory Mock Content Store
 * Provides resilient fallbacks for Content Entries and Content Types
 * Ensures admin UI and frontend delivery APIs function reliably even when Postgres is offline or timing out.
 */

export interface MockContentType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isSingle: boolean;
  isPublishable: boolean;
  hasDrafts: boolean;
  hasRevisions: boolean;
  entriesCount?: number;
  fields: Array<{
    id: string;
    name: string;
    apiId: string;
    type: string;
    isRequired: boolean;
    order?: number;
    options?: any;
    helpText?: string;
  }>;
  seoConfig?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockContentEntry {
  id: string;
  slug: string;
  title: string;
  status: string;
  locale: string;
  contentType: string; // slug
  currentVersion?: number;
  data: Record<string, any>;
  blocks: any[];
  seo: Record<string, any>;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
  taxonomies?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export const initialMockContentTypes: MockContentType[] = [
  {
    id: 'ct_articles',
    name: 'Articles (Blog Posts)',
    slug: 'articles',
    description: 'News, editorial blog posts, and technical articles with SEO optimization and visual blocks.',
    icon: 'BookOpen',
    isSingle: false,
    isPublishable: true,
    hasDrafts: true,
    hasRevisions: true,
    entriesCount: 5,
    fields: [
      { id: 'f_summary', name: 'Summary Excerpt', apiId: 'summary', type: 'longtext', isRequired: true, order: 1 },
      { id: 'f_byline', name: 'Author Byline', apiId: 'byline', type: 'text', isRequired: false, order: 2 },
      { id: 'f_read_time', name: 'Read Time (Minutes)', apiId: 'read_time', type: 'number', isRequired: false, order: 3 },
      { id: 'f_featured', name: 'Featured Story', apiId: 'is_featured', type: 'boolean', isRequired: false, order: 4 },
      { id: 'f_image', name: 'Featured Banner Image', apiId: 'featured_image', type: 'media', isRequired: false, order: 5 },
    ],
    seoConfig: { defaultRobots: 'index, follow' },
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ct_pages',
    name: 'Pages',
    slug: 'pages',
    description: 'Dynamic visual landing and marketing pages composed with nested block sections.',
    icon: 'Layout',
    isSingle: false,
    isPublishable: true,
    hasDrafts: true,
    hasRevisions: true,
    entriesCount: 2,
    fields: [
      { id: 'f_p_summary', name: 'Summary Excerpt', apiId: 'excerpt', type: 'longtext', isRequired: false, order: 1 },
      { id: 'f_p_template', name: 'Template Style', apiId: 'template', type: 'select', isRequired: false, order: 2, options: { options: ['default', 'landing', 'full-width', 'minimal'] } },
      { id: 'f_p_image', name: 'Featured Image', apiId: 'featured_image', type: 'media', isRequired: false, order: 3 },
    ],
    seoConfig: { defaultRobots: 'index, follow' },
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ct_products',
    name: 'Products',
    slug: 'products',
    description: 'E-commerce and SaaS product catalogue entries with SKU and pricing.',
    icon: 'Package',
    isSingle: false,
    isPublishable: true,
    hasDrafts: true,
    hasRevisions: true,
    entriesCount: 3,
    fields: [
      { id: 'f_price', name: 'Price USD', apiId: 'price', type: 'number', isRequired: true, order: 1 },
      { id: 'f_sku', name: 'SKU Identifier', apiId: 'sku', type: 'text', isRequired: true, order: 2 },
      { id: 'f_stock', name: 'Stock Count', apiId: 'stock', type: 'number', isRequired: false, order: 3 },
    ],
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ct_faqs',
    name: 'FAQs',
    slug: 'faqs',
    description: 'Frequently asked questions and support answers.',
    icon: 'HelpCircle',
    isSingle: false,
    isPublishable: true,
    hasDrafts: true,
    hasRevisions: true,
    entriesCount: 4,
    fields: [
      { id: 'f_question', name: 'Question', apiId: 'question', type: 'text', isRequired: true, order: 1 },
      { id: 'f_answer', name: 'Answer', apiId: 'answer', type: 'richtext', isRequired: true, order: 2 },
    ],
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialMockContentEntries: MockContentEntry[] = [
  {
    id: 'home_page_entry',
    slug: 'home',
    title: 'Markup — Decoupled Digital Experience',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'pages',
    currentVersion: 4,
    data: {
      excerpt: 'Universal Content Operating System powering modern digital platforms.',
      template: 'landing',
    },
    seo: {
      metaTitle: 'Markup — Decoupled Digital Experience',
      description: 'Universal Content Operating System powering web apps and omnichannel digital platforms.',
      keywords: 'headless cms, nextjs, decoupled, markup',
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
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_admin_01', name: 'Sarah Connor (Super Admin)', email: 'admin@headless.io' },
    taxonomies: [{ id: 't2', name: 'Architecture', slug: 'architecture' }],
  },
  {
    id: 'pg_about_02',
    slug: 'about-us',
    title: 'About Markup Enterprise Platform',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'pages',
    currentVersion: 2,
    data: {
      excerpt: 'Learn about our journey in building an enterprise-grade open-source headless CMS.',
      template: 'default',
    },
    seo: {
      metaTitle: 'About Us — Markup Enterprise Platform',
      description: 'Learn about our journey in building an enterprise-grade open-source headless CMS.',
    },
    blocks: [
      {
        id: 'blk_about_hero',
        type: 'hero',
        data: {
          badge: 'About Markup',
          title: 'Engineered for Digital Autonomy',
          subtitle: 'Empowering engineering organizations to decouple content authoring from rendering layers.',
        },
      },
      {
        id: 'blk_about_text',
        type: 'paragraph',
        data: {
          text: 'Markup was architected to bridge the divide between high-performing engineering workflows and intuitive editorial block composition.',
        },
      },
    ],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    createdAt: new Date('2025-01-05').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_editor_01', name: 'Marcus Vance (Lead Editor)', email: 'editor@headless.io' },
    taxonomies: [{ id: 't2', name: 'Architecture', slug: 'architecture' }],
  },
  {
    id: 'art-1',
    slug: 'building-enterprise-headless-cms-with-nextjs',
    title: 'Architecting Enterprise Headless CMS with Next.js & Edge Caching',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 3,
    data: {
      summary: 'Explore how decoupled content architecture eliminates database hotspots, scales across distributed CDN edges, and accelerates time-to-market.',
      byline: 'Devin Vance',
      read_time: 6,
      is_featured: true,
    },
    seo: {
      metaTitle: 'Architecting Enterprise Headless CMS with Next.js & Edge Caching',
      description: 'Explore how decoupled content architecture eliminates database hotspots, scales across distributed CDN edges, and accelerates time-to-market.',
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
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date('2025-01-10').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_admin_01', name: 'Sarah Connor (Super Admin)', email: 'admin@headless.io' },
  },
  {
    id: 'art-2',
    slug: 'high-performance-media-pipelines-cloudflare-r2',
    title: 'Cloudflare R2 & Smart WebP Media Pipelines with Zero Storage Overhead',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 2,
    data: {
      summary: 'Automate focal point detection, crop presets, and aggressive image optimization while maintaining zero-egress cost Cloudflare R2 storage.',
      byline: 'Elena Rostova',
      read_time: 4,
      is_featured: false,
    },
    seo: {
      metaTitle: 'Cloudflare R2 & Smart WebP Media Pipelines with Zero Storage Overhead',
      description: 'Automate focal point detection, crop presets, and aggressive image optimization while maintaining zero-egress cost Cloudflare R2 storage.',
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
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: new Date('2025-01-12').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_author_01', name: 'Elena Rostova (Staff Author)', email: 'author@headless.io' },
  },
  {
    id: 'art-3',
    slug: 'getting-started-with-headless-architecture',
    title: 'Getting Started with Modern Headless Architecture',
    status: 'PUBLISHED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 3,
    data: {
      summary: 'A comprehensive beginner guide to decoupling your CMS from your presentation tier with high-efficiency edge delivery.',
      byline: 'Sarah Connor',
      read_time: 5,
      is_featured: true,
    },
    seo: {
      metaTitle: 'Getting Started with Modern Headless Architecture',
      description: 'A comprehensive beginner guide to decoupling your CMS from your presentation tier.',
    },
    taxonomies: [
      { id: 't1', name: 'Next.js', slug: 'nextjs' },
      { id: 't2', name: 'Architecture', slug: 'architecture' },
    ],
    blocks: [
      {
        id: 'b31',
        type: 'paragraph',
        data: {
          text: 'Learn how to structure your schemas, connect modern API keys, and build ultra-fast static and dynamic web experiences.',
        },
      },
    ],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_admin_01', name: 'Sarah Connor (Super Admin)', email: 'admin@headless.io' },
  },
  {
    id: 'art-4',
    slug: 'mastering-visual-block-composition',
    title: 'Mastering Visual Block Composition in Enterprise CMS',
    status: 'DRAFT',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 1,
    data: {
      summary: 'How modular block editors empower editors without sacrificing design system consistency or accessibility.',
      byline: 'Marcus Vance',
      read_time: 7,
      is_featured: false,
    },
    seo: {
      metaTitle: 'Mastering Visual Block Composition in Enterprise CMS',
      description: 'How modular block editors empower editors without sacrificing design system consistency.',
    },
    taxonomies: [{ id: 't1', name: 'Next.js', slug: 'nextjs' }],
    blocks: [],
    publishedAt: null,
    createdAt: new Date('2025-01-18').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_editor_01', name: 'Marcus Vance (Lead Editor)', email: 'editor@headless.io' },
  },
  {
    id: 'art-5',
    slug: 'multi-site-and-localization-at-scale',
    title: 'Multi-Site and Global Localization at Enterprise Scale',
    status: 'APPROVED',
    locale: 'en-US',
    contentType: 'articles',
    currentVersion: 2,
    data: {
      summary: 'Managing dozens of brands and regional locales from a unified API and admin control plane.',
      byline: 'David Kim',
      read_time: 8,
      is_featured: false,
    },
    seo: {
      metaTitle: 'Multi-Site and Global Localization at Enterprise Scale',
      description: 'Managing dozens of brands and regional locales from a unified API and admin control plane.',
    },
    taxonomies: [{ id: 't2', name: 'Architecture', slug: 'architecture' }],
    blocks: [],
    publishedAt: null,
    createdAt: new Date('2025-01-20').toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'user_reviewer_01', name: 'David Kim (Fact Checker)', email: 'reviewer@headless.io' },
  },
];

let contentTypesStore: MockContentType[] = [...initialMockContentTypes];
let contentEntriesStore: MockContentEntry[] = [...initialMockContentEntries];

export function getMockContentTypes(): MockContentType[] {
  return contentTypesStore.map((ct) => {
    const entriesCount = contentEntriesStore.filter((e) => e.contentType === ct.slug).length;
    return { ...ct, entriesCount };
  });
}

export function getMockContentTypeBySlug(slug: string): MockContentType | null {
  const found = contentTypesStore.find((ct) => ct.slug === slug || ct.id === slug);
  if (!found) return null;
  const entriesCount = contentEntriesStore.filter((e) => e.contentType === found.slug).length;
  return { ...found, entriesCount };
}

export function saveMockContentType(ct: Partial<MockContentType> & { name: string; slug: string }): MockContentType {
  const existingIdx = contentTypesStore.findIndex((c) => c.slug === ct.slug || c.id === ct.id);
  const item: MockContentType = {
    id: ct.id || `ct_${Date.now()}`,
    name: ct.name,
    slug: ct.slug,
    description: ct.description || '',
    icon: ct.icon || 'FileText',
    isSingle: ct.isSingle || false,
    isPublishable: ct.isPublishable ?? true,
    hasDrafts: ct.hasDrafts ?? true,
    hasRevisions: ct.hasRevisions ?? true,
    fields: ct.fields || [],
    seoConfig: ct.seoConfig || {},
    createdAt: ct.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    contentTypesStore[existingIdx] = { ...contentTypesStore[existingIdx], ...item };
    return contentTypesStore[existingIdx];
  } else {
    contentTypesStore.unshift(item);
    return item;
  }
}

export interface GetEntriesFilter {
  typeSlug?: string | null;
  locale?: string | null;
  status?: string | null;
  search?: string | null;
  category?: string | null;
  tag?: string | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  authorId?: string | null;
  statusFilter?: string[];
}

export function getMockContentEntries(filter: GetEntriesFilter = {}) {
  const {
    typeSlug,
    locale,
    search,
    category,
    tag,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    authorId,
    statusFilter,
  } = filter;

  let filtered = [...contentEntriesStore];

  if (typeSlug) {
    filtered = filtered.filter((e) => e.contentType === typeSlug);
  }

  if (locale) {
    filtered = filtered.filter((e) => e.locale === locale);
  }

  if (statusFilter && statusFilter.length > 0) {
    filtered = filtered.filter((e) => statusFilter.includes(e.status));
  }

  if (authorId) {
    filtered = filtered.filter((e) => e.author?.id === authorId);
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.slug.toLowerCase().includes(s) ||
        (e.data?.summary && String(e.data.summary).toLowerCase().includes(s))
    );
  }

  const term = category || tag;
  if (term) {
    filtered = filtered.filter((e) =>
      e.taxonomies?.some((t) => t.slug === term || t.id === term || t.name.toLowerCase() === term.toLowerCase())
    );
  }

  // Sorting
  filtered.sort((a: any, b: any) => {
    const valA = a[sortBy] ?? a.data?.[sortBy] ?? '';
    const valB = b[sortBy] ?? b.data?.[sortBy] ?? '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    data: paginated,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export function getMockContentEntryByIdOrSlug(idOrSlug: string): MockContentEntry | null {
  return (
    contentEntriesStore.find((e) => e.id === idOrSlug || e.slug === idOrSlug) || null
  );
}

export function createMockContentEntry(entry: Partial<MockContentEntry> & { title: string; slug: string; contentType: string }): MockContentEntry {
  const newEntry: MockContentEntry = {
    id: entry.id || `ent_${Date.now()}`,
    slug: entry.slug,
    title: entry.title,
    status: entry.status || 'DRAFT',
    locale: entry.locale || 'en-US',
    contentType: entry.contentType,
    currentVersion: 1,
    data: entry.data || {},
    blocks: entry.blocks || [],
    seo: entry.seo || {},
    publishedAt: entry.status === 'PUBLISHED' ? new Date().toISOString() : null,
    scheduledPublishAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: entry.author || { id: 'user_admin_01', name: 'Super Administrator', email: 'admin@headless.io' },
    taxonomies: entry.taxonomies || [],
  };

  contentEntriesStore.unshift(newEntry);
  return newEntry;
}

export function updateMockContentEntry(idOrSlug: string, updates: Partial<MockContentEntry>): MockContentEntry | null {
  const idx = contentEntriesStore.findIndex((e) => e.id === idOrSlug || e.slug === idOrSlug);
  if (idx === -1) return null;

  const current = contentEntriesStore[idx];
  const updated: MockContentEntry = {
    ...current,
    ...updates,
    currentVersion: (current.currentVersion || 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  if (updates.status === 'PUBLISHED' && !current.publishedAt) {
    updated.publishedAt = new Date().toISOString();
  }

  contentEntriesStore[idx] = updated;
  return updated;
}

export function deleteMockContentEntry(idOrSlug: string): boolean {
  const initialLength = contentEntriesStore.length;
  contentEntriesStore = contentEntriesStore.filter((e) => e.id !== idOrSlug && e.slug !== idOrSlug);
  return contentEntriesStore.length < initialLength;
}
