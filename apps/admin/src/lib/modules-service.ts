import { prisma } from '@headless/database';

export type ModuleCategory =
  | 'marketing'
  | 'content'
  | 'developer'
  | 'media'
  | 'community'
  | 'security'
  | 'system';

export interface CmsModule {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  category: ModuleCategory;
  categoryLabel: string;
  icon: string; // Lucide icon component name
  author: string;
  website?: string;
  enabled: boolean;
  isCore?: boolean; // Core modules are essential foundation
  routes: string[]; // Administrative and frontend paths
  apiRoutes: string[]; // API endpoints
  settingsPath?: string;
  tags: string[];
}

export const REGISTERED_MODULES: CmsModule[] = [
  // 1. Marketing & Revenue
  {
    id: 'adsense',
    name: 'AdSense & Monetization Suite',
    slug: 'ads',
    description: 'Enterprise Google AdSense ad units, automated header bidding partner injection, revenue estimator, and live ads.txt syntax validator.',
    version: '1.2.0',
    category: 'marketing',
    categoryLabel: 'Marketing & Revenue',
    icon: 'DollarSign',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/ads', '/ads.txt'],
    apiRoutes: ['/api/v1/ads'],
    settingsPath: '/admin/ads',
    tags: ['adsense', 'ads.txt', 'monetization', 'prebid', 'revenue'],
  },
  {
    id: 'seo',
    name: 'Advanced SEO & Rich Snippets',
    slug: 'seo',
    description: 'Automated Open Graph meta generation, JSON-LD Schema.org rich snippets, dynamic sitemap.xml, robots.txt, and SERP simulator.',
    version: '1.4.0',
    category: 'marketing',
    categoryLabel: 'Marketing & Growth',
    icon: 'Search',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/seo', '/sitemap.xml', '/robots.txt'],
    apiRoutes: ['/api/v1/seo'],
    settingsPath: '/admin/seo',
    tags: ['seo', 'sitemap', 'schema.org', 'open-graph', 'meta'],
  },
  {
    id: 'redirects',
    name: 'URL Redirects & Routing',
    slug: 'redirects',
    description: '301 Permanent and 302 Temporary URL redirection manager with automated circular loop cycle detection.',
    version: '1.0.0',
    category: 'marketing',
    categoryLabel: 'Structure & SEO',
    icon: 'RotateCcw',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/redirects'],
    apiRoutes: ['/api/v1/redirects'],
    settingsPath: '/admin/redirects',
    tags: ['redirects', 'routing', '301', '302', 'links'],
  },

  // 2. Audience & Community
  {
    id: 'forms',
    name: 'Forms & Lead Submissions Builder',
    slug: 'forms',
    description: 'Custom drag-and-drop form schema builder, custom input types, submission inbox, spam honeypot guard, and CSV export.',
    version: '1.1.0',
    category: 'content',
    categoryLabel: 'Audience & Leads',
    icon: 'FileSpreadsheet',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/forms'],
    apiRoutes: ['/api/v1/forms'],
    settingsPath: '/admin/forms',
    tags: ['forms', 'leads', 'inbox', 'submissions', 'contact'],
  },
  {
    id: 'comments',
    name: 'Comments & Community Discussions',
    slug: 'comments',
    description: 'Threaded discussions, community upvoting, automated keyword profanity filtering, and editorial moderation queue.',
    version: '1.3.0',
    category: 'community',
    categoryLabel: 'Community & Engagement',
    icon: 'MessageSquare',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/comments'],
    apiRoutes: ['/api/v1/comments'],
    settingsPath: '/admin/comments',
    tags: ['comments', 'moderation', 'automod', 'discussions', 'community'],
  },
  {
    id: 'newsletter',
    name: 'Newsletter & Audience Subscriptions',
    slug: 'newsletter',
    description: 'Audience opt-in capture, tag segmentation, double opt-in verification, CSV data portability, and email campaign broadcasts.',
    version: '1.1.0',
    category: 'community',
    categoryLabel: 'Audience & Subscriptions',
    icon: 'Mail',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/newsletter'],
    apiRoutes: ['/api/v1/newsletter', '/api/v1/newsletter/subscribers', '/api/v1/newsletter/campaigns'],
    settingsPath: '/admin/newsletter',
    tags: ['newsletter', 'subscribers', 'campaigns', 'broadcast', 'opt-in', 'leads', 'resend'],
  },

  // 3. Editorial & Content Operations
  {
    id: 'hero_slider',
    name: 'Hero Section Sliders & Carousels',
    slug: 'sliders',
    description: 'Bespoke hero sliders, multimedia banners, and responsive client frontend code integration with live preview.',
    version: '1.2.0',
    category: 'content',
    categoryLabel: 'Content & Layout',
    icon: 'SlidersHorizontal',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/sliders'],
    apiRoutes: ['/api/v1/sliders', '/api/v1/sliders/[slug]', '/api/v1/sliders/public/[slug]'],
    settingsPath: '/admin/sliders',
    tags: ['sliders', 'hero', 'carousel', 'banner', 'slides', 'cta', 'frontend'],
  },
  {
    id: 'gallery',
    name: 'Photo Albums & Media Gallery',
    slug: 'gallery',
    description: 'Album-wise photo collections, high-resolution media galleries, Cloudflare R2 object storage sync, and cinematic frontend presentation.',
    version: '1.2.0',
    category: 'media',
    categoryLabel: 'Media & Galleries',
    icon: 'Images',
    author: 'Markup Core Team',
    enabled: true,
    isCore: false,
    routes: ['/admin/gallery', '/gallery'],
    apiRoutes: ['/api/v1/gallery'],
    settingsPath: '/admin/gallery',
    tags: ['gallery', 'albums', 'photos', 'r2', 'media', 'cloudflare'],
  },
  {
    id: 'calendar',
    name: 'Editorial Calendar & Timeline',
    slug: 'calendar',
    description: 'Visual editorial scheduling matrix, release pipelines, publishing deadlines, and drag-and-drop date rescheduling.',
    version: '1.1.0',
    category: 'content',
    categoryLabel: 'Content Operations',
    icon: 'Calendar',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/calendar'],
    apiRoutes: ['/api/v1/publishing'],
    settingsPath: '/admin/calendar',
    tags: ['calendar', 'scheduling', 'timeline', 'editorial', 'deadlines'],
  },
  {
    id: 'media',
    name: 'Media Library & Cloudflare R2 DAM',
    slug: 'media',
    description: 'Focal-point auto-cropping, intermediate JPEG to high-efficiency WebP conversion, zero original retention, SEO friendly naming, and Cloudflare R2 storage.',
    version: '2.0.0',
    category: 'media',
    categoryLabel: 'Media & Assets',
    icon: 'Image',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/media'],
    apiRoutes: ['/api/v1/media'],
    settingsPath: '/admin/media',
    tags: ['media', 'dam', 'cloudflare-r2', 'webp', 'auto-crop', 'seo-names'],
  },
  {
    id: 'workflows',
    name: 'Editorial Workflows & Approvals',
    slug: 'workflows',
    description: 'Custom multi-stage publishing pipelines, role-restricted transition rules, and approval governance before going live.',
    version: '1.0.0',
    category: 'content',
    categoryLabel: 'Content Operations',
    icon: 'GitBranch',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/workflows'],
    apiRoutes: ['/api/v1/workflows'],
    settingsPath: '/admin/workflows',
    tags: ['workflows', 'governance', 'approvals', 'pipelines', 'review'],
  },
  {
    id: 'publishing_queue',
    name: 'Scheduled Publishing Queue',
    slug: 'publishing',
    description: 'Automated queue runner for scheduled content releases with background cron dispatch.',
    version: '1.0.0',
    category: 'content',
    categoryLabel: 'Content Operations',
    icon: 'Send',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/publishing'],
    apiRoutes: ['/api/v1/publishing'],
    settingsPath: '/admin/publishing',
    tags: ['publishing', 'queue', 'scheduler', 'releases', 'cron'],
  },
  {
    id: 'revisions',
    name: 'Content Revisions & JSON Diff',
    slug: 'revisions',
    description: 'Visual timeline of changes, side-by-side JSON diff comparator, and instant snapshot restoration.',
    version: '1.0.0',
    category: 'content',
    categoryLabel: 'Content Operations',
    icon: 'History',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/revisions'],
    apiRoutes: ['/api/v1/content/[id]/revisions'],
    settingsPath: '/admin/revisions',
    tags: ['revisions', 'history', 'diff', 'restore', 'versions'],
  },
  {
    id: 'taxonomies',
    name: 'Taxonomies & Categorization',
    slug: 'taxonomies',
    description: 'Hierarchical nested categories, tags, and classification vocabularies.',
    version: '1.0.0',
    category: 'content',
    categoryLabel: 'Structure & Content',
    icon: 'Tags',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/taxonomies'],
    apiRoutes: ['/api/v1/taxonomies'],
    settingsPath: '/admin/taxonomies',
    tags: ['taxonomies', 'categories', 'tags', 'classification'],
  },
  {
    id: 'navigation',
    name: 'Navigation Menus Builder',
    slug: 'navigation',
    description: 'Multi-tier visual menu builder for headers, footers, and mega-menus with drag-and-drop hierarchy.',
    version: '1.0.0',
    category: 'content',
    categoryLabel: 'Structure & Content',
    icon: 'Menu',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/navigation'],
    apiRoutes: ['/api/v1/navigation'],
    settingsPath: '/admin/navigation',
    tags: ['navigation', 'menus', 'headers', 'footers', 'mega-menu'],
  },
  {
    id: 'ai_assistant',
    name: 'AI Editorial Assistant & Co-Pilot',
    slug: 'ai-assistant',
    description: 'Gemini generative AI integrations for article outlines, title suggestions, SEO meta generation, and translation.',
    version: '1.2.0',
    category: 'content',
    categoryLabel: 'AI & Productivity',
    icon: 'Cpu',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: [],
    apiRoutes: ['/api/v1/ai'],
    tags: ['ai', 'gemini', 'summarizer', 'co-pilot', 'productivity'],
  },

  // 4. Developer & APIs
  {
    id: 'graphql',
    name: 'GraphQL API Endpoint',
    slug: 'graphql',
    description: 'High-performance decoupled GraphQL query and mutation endpoint with interactive GraphiQL IDE playground.',
    version: '1.2.0',
    category: 'developer',
    categoryLabel: 'Developer & APIs',
    icon: 'Code2',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/graphql', '/api/graphql'],
    apiRoutes: ['/api/graphql'],
    settingsPath: '/admin/graphql',
    tags: ['graphql', 'api', 'headless', 'graphiql', 'schema'],
  },
  {
    id: 'webhooks',
    name: 'Webhooks & Event Subscriptions',
    slug: 'webhooks',
    description: 'Automated HTTP push notifications on publish, update, and delete events with cryptographic HMAC SHA-256 signatures.',
    version: '1.1.0',
    category: 'developer',
    categoryLabel: 'Developer & APIs',
    icon: 'Webhook',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/webhooks'],
    apiRoutes: ['/api/v1/webhooks'],
    settingsPath: '/admin/webhooks',
    tags: ['webhooks', 'events', 'hmac', 'push', 'automation'],
  },
  {
    id: 'api_keys',
    name: 'API Keys & Security Scopes',
    slug: 'api-keys',
    description: 'Granular content delivery and content management API credentials with rate-limiting and IP allowlisting.',
    version: '1.0.0',
    category: 'security',
    categoryLabel: 'Security & Access',
    icon: 'Key',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/api-keys'],
    apiRoutes: ['/api/v1/api-keys'],
    settingsPath: '/admin/api-keys',
    tags: ['api-keys', 'tokens', 'security', 'scopes', 'developer'],
  },
  {
    id: 'audit_logs',
    name: 'Audit Logs & Governance Stream',
    slug: 'audit-logs',
    description: 'Tamper-evident activity trail recording all logins, content edits, publishing actions, and role updates.',
    version: '1.0.0',
    category: 'security',
    categoryLabel: 'Security & Access',
    icon: 'BarChart3',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/audit-logs'],
    apiRoutes: ['/api/v1/audit-logs'],
    settingsPath: '/admin/audit-logs',
    tags: ['audit', 'compliance', 'security', 'logs', 'governance'],
  },
  {
    id: 'email',
    name: 'Transactional Email (Resend)',
    slug: 'emails',
    description: 'High-deliverability transactional messaging, welcome emails, lead notifications, and DKIM/SPF domain verification powered by Resend.',
    version: '1.0.0',
    category: 'developer',
    categoryLabel: 'Developer & Email',
    icon: 'Mail',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/emails'],
    apiRoutes: ['/api/v1/emails', '/api/v1/emails/test'],
    settingsPath: '/admin/emails',
    tags: ['email', 'resend', 'transactional', 'templates', 'delivery', 'notifications'],
  },

  // 5. System & Connectors
  {
    id: 'integrations',
    name: 'Integrations & Connectors Hub',
    slug: 'integrations',
    description: 'Pre-configured third-party connectors for Cloudflare, Algolia search, SendGrid transactional emails, and AWS S3/R2.',
    version: '1.0.0',
    category: 'system',
    categoryLabel: 'System & Connectors',
    icon: 'Puzzle',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/integrations'],
    apiRoutes: ['/api/v1/integrations'],
    settingsPath: '/admin/integrations',
    tags: ['integrations', 'connectors', 'algolia', 'sendgrid', 'cloudflare'],
  },
  {
    id: 'import_export',
    name: 'Data Portability & Import/Export',
    slug: 'import-export',
    description: 'Site backup exports, JSON schema portability, and WordPress WXR XML data ingestion wizard.',
    version: '1.0.0',
    category: 'system',
    categoryLabel: 'System & Data',
    icon: 'Download',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/import-export'],
    apiRoutes: ['/api/v1/export', '/api/v1/import'],
    settingsPath: '/admin/import-export',
    tags: ['import', 'export', 'backup', 'migration', 'wordpress'],
  },
  {
    id: 'multisite',
    name: 'Multi-Tenant Sites & Localization',
    slug: 'sites',
    description: 'Multi-tenant domain routing, cross-site content syndication, and locale language matrix.',
    version: '1.0.0',
    category: 'system',
    categoryLabel: 'System & Architecture',
    icon: 'Globe',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: false,
    routes: ['/admin/sites'],
    apiRoutes: ['/api/v1/sites'],
    settingsPath: '/admin/sites',
    tags: ['multisite', 'tenancy', 'domains', 'locales', 'i18n'],
  },

  // 6. Foundation Core (Protected)
  {
    id: 'content_core',
    name: 'Core Content & Schema Modeling',
    slug: 'content',
    description: 'Foundational content entries, pages, visual block rendering, and content type schema definitions.',
    version: '2.0.0',
    category: 'content',
    categoryLabel: 'Foundation Core',
    icon: 'Layers',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: true,
    routes: ['/admin/content', '/admin/content-types', '/admin/pages'],
    apiRoutes: ['/api/v1/content', '/api/v1/content-types'],
    settingsPath: '/admin/content-types',
    tags: ['core', 'content', 'schema', 'entries', 'pages'],
  },
  {
    id: 'users_roles',
    name: 'Users, Authentication & RBAC',
    slug: 'users',
    description: 'Core user management, permission evaluations, security sessions, and administrative access control.',
    version: '2.0.0',
    category: 'security',
    categoryLabel: 'Foundation Core',
    icon: 'Users',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: true,
    routes: ['/admin/users', '/admin/roles'],
    apiRoutes: ['/api/v1/users', '/api/v1/roles', '/api/v1/auth'],
    settingsPath: '/admin/users',
    tags: ['core', 'users', 'roles', 'rbac', 'security'],
  },
  {
    id: 'system_settings',
    name: 'System Telemetry & Platform Settings',
    slug: 'settings',
    description: 'Core platform branding, site defaults, database connection pool telemetry, and runtime diagnostics.',
    version: '2.0.0',
    category: 'system',
    categoryLabel: 'Foundation Core',
    icon: 'Settings',
    author: 'Headless CMS Core',
    enabled: true,
    isCore: true,
    routes: ['/admin/settings', '/admin/system', '/admin/modules'],
    apiRoutes: ['/api/v1/settings', '/api/v1/system', '/api/v1/modules'],
    settingsPath: '/admin/settings',
    tags: ['core', 'system', 'diagnostics', 'telemetry', 'settings'],
  },
];

// In-memory module toggle cache for fast lookups & DB offline resilience
let MODULES_STATE_CACHE: Record<string, boolean> = {};

// Initialize defaults
for (const m of REGISTERED_MODULES) {
  MODULES_STATE_CACHE[m.id] = m.enabled;
}

/**
 * Retrieves all CMS modules with their current active/inactive status.
 */
export async function getAllModules(siteId?: string): Promise<CmsModule[]> {
  try {
    if (siteId) {
      const setting = await prisma.setting.findFirst({
        where: { siteId, key: 'active_cms_modules' },
      });
      if (setting && setting.value && typeof setting.value === 'object') {
        const savedStates = setting.value as Record<string, boolean>;
        MODULES_STATE_CACHE = { ...MODULES_STATE_CACHE, ...savedStates };
      }
    }
  } catch {
    // Graceful offline fallback
  }

  return REGISTERED_MODULES.map((mod) => ({
    ...mod,
    enabled: mod.isCore ? true : (MODULES_STATE_CACHE[mod.id] ?? mod.enabled),
  }));
}

/**
 * Checks whether a specific module is currently enabled.
 */
export async function isModuleEnabled(moduleId: string, siteId?: string): Promise<boolean> {
  const mod = REGISTERED_MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  if (mod.isCore) return true;

  if (MODULES_STATE_CACHE[moduleId] !== undefined) {
    return MODULES_STATE_CACHE[moduleId];
  }

  const all = await getAllModules(siteId);
  const found = all.find((m) => m.id === moduleId);
  return found ? found.enabled : false;
}

/**
 * Synchronous check against the memory cache.
 */
export function isModuleEnabledSync(moduleId: string): boolean {
  const mod = REGISTERED_MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  if (mod.isCore) return true;
  return MODULES_STATE_CACHE[moduleId] ?? mod.enabled;
}

/**
 * Toggles a single module's enabled status and persists state.
 */
export async function setModuleEnabled(
  moduleId: string,
  enabled: boolean,
  siteId?: string
): Promise<CmsModule> {
  const mod = REGISTERED_MODULES.find((m) => m.id === moduleId);
  if (!mod) {
    throw new Error(`Module with ID "${moduleId}" not found.`);
  }

  if (mod.isCore && !enabled) {
    throw new Error(`Core foundation module "${mod.name}" cannot be deactivated.`);
  }

  MODULES_STATE_CACHE[moduleId] = enabled;

  try {
    if (siteId) {
      await prisma.setting.upsert({
        where: { siteId_key: { siteId, key: 'active_cms_modules' } },
        create: {
          siteId,
          key: 'active_cms_modules',
          value: MODULES_STATE_CACHE,
          isPublic: true,
        },
        update: {
          value: MODULES_STATE_CACHE,
        },
      });
    }
  } catch {
    // Offline resilience
  }

  return {
    ...mod,
    enabled,
  };
}

/**
 * Bulk updates multiple modules.
 */
export async function bulkSetModules(
  states: Record<string, boolean>,
  siteId?: string
): Promise<CmsModule[]> {
  for (const [id, enabled] of Object.entries(states)) {
    const mod = REGISTERED_MODULES.find((m) => m.id === id);
    if (mod && !mod.isCore) {
      MODULES_STATE_CACHE[id] = Boolean(enabled);
    }
  }

  try {
    if (siteId) {
      await prisma.setting.upsert({
        where: { siteId_key: { siteId, key: 'active_cms_modules' } },
        create: {
          siteId,
          key: 'active_cms_modules',
          value: MODULES_STATE_CACHE,
          isPublic: true,
        },
        update: {
          value: MODULES_STATE_CACHE,
        },
      });
    }
  } catch {
    // Offline resilience
  }

  return getAllModules(siteId);
}

/**
 * Determines which module owns a specific pathname.
 */
export function getModuleForRoute(pathname: string): CmsModule | null {
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '');
  for (const mod of REGISTERED_MODULES) {
    if (mod.routes.some((r) => cleanPath === r || cleanPath.startsWith(r + '/'))) {
      return mod;
    }
  }
  return null;
}
