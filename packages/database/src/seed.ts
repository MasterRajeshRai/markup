import { PrismaClient, EntryStatus, ApiKeyRole, ApiKeyEnvironment, SettingCategory } from '@prisma/client';
import {
  hashPassword,
  generateApiKey,
  PERMISSIONS,
  DEFAULT_ROLES,
} from '@headless/core';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Headless CMS database seed...');

  // 1. Seed Permissions
  console.log('  -> Seeding granular permissions...');
  for (const [key, action] of Object.entries(PERMISSIONS)) {
    const [module] = action.split('.');
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: {
        action,
        description: `Permission to execute ${action}`,
        module: module || 'general',
      },
    });
  }

  // 2. Seed Default Roles and RolePermissions
  console.log('  -> Seeding default roles & role permissions...');
  for (const roleDef of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: {
        name: roleDef.name,
        description: roleDef.description,
      },
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });

    // Assign permissions to role
    for (const permAction of roleDef.permissions) {
      const perm = await prisma.permission.findUnique({ where: { action: permAction } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }
  }

  // 3. Seed Users
  console.log('  -> Seeding default administrative & editorial users...');
  const defaultPasswordHash = await hashPassword('AdminPass123!');

  const usersData = [
    {
      email: 'admin@headless.io',
      name: 'Super Administrator',
      roleSlug: 'super_admin',
    },
    {
      email: 'editor@headless.io',
      name: 'Content Editor',
      roleSlug: 'editor',
    },
    {
      email: 'author@headless.io',
      name: 'Staff Author',
      roleSlug: 'author',
    },
    {
      email: 'reviewer@headless.io',
      name: 'Chief Reviewer',
      roleSlug: 'reviewer',
    },
  ];

  const userMap = new Map<string, string>();

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: defaultPasswordHash,
        isActive: true,
        isEmailVerified: true,
      },
    });
    userMap.set(u.email, user.id);

    const role = await prisma.role.findUnique({ where: { slug: u.roleSlug } });
    if (role) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }
  }

  const adminUserId = userMap.get('admin@headless.io')!;

  // 4. Seed Default Site
  console.log('  -> Seeding default site & locales...');
  const site = await prisma.site.upsert({
    where: { slug: 'acme-portal' },
    update: {
      name: 'Acme Digital Portal',
      domain: 'localhost:3000',
      defaultLocale: 'en-US',
      isDefault: true,
      branding: {
        logoText: 'ACME CMS',
        primaryColor: '#2563eb',
        accentColor: '#10b981',
      },
    },
    create: {
      name: 'Acme Digital Portal',
      slug: 'acme-portal',
      domain: 'localhost:3000',
      defaultLocale: 'en-US',
      isDefault: true,
      branding: {
        logoText: 'ACME CMS',
        primaryColor: '#2563eb',
        accentColor: '#10b981',
      },
      settings: {
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
      },
    },
  });

  // Seed Locales
  const locales = [
    { code: 'en-US', name: 'English (US)', isDefault: true },
    { code: 'es-ES', name: 'Español (ES)', isDefault: false },
    { code: 'fr-FR', name: 'Français (FR)', isDefault: false },
  ];
  for (const loc of locales) {
    await prisma.locale.upsert({
      where: { siteId_code: { siteId: site.id, code: loc.code } },
      update: { name: loc.name, isDefault: loc.isDefault },
      create: { siteId: site.id, code: loc.code, name: loc.name, isDefault: loc.isDefault },
    });
  }

  // 5. Seed Content Types
  console.log('  -> Seeding content types and dynamic field schemas...');
  // 5A. Pages
  const pageType = await prisma.contentType.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'pages' } },
    update: { name: 'Pages', description: 'Dynamic visual landing and content pages' },
    create: {
      siteId: site.id,
      name: 'Pages',
      slug: 'pages',
      description: 'Dynamic visual landing and content pages',
      icon: 'Layout',
      isSingle: false,
      isPublishable: true,
      hasDrafts: true,
      hasRevisions: true,
      seoConfig: { defaultRobots: 'index, follow' },
    },
  });

  const pageFields = [
    { name: 'Summary Excerpt', apiId: 'excerpt', type: 'longtext', isRequired: false, order: 1 },
    { name: 'Template Style', apiId: 'template', type: 'select', isRequired: false, order: 2, options: { options: ['default', 'landing', 'full-width', 'minimal'] } },
    { name: 'Featured Banner Image', apiId: 'featured_image', type: 'media', isRequired: false, order: 3 },
  ];

  for (const f of pageFields) {
    await prisma.contentField.upsert({
      where: { contentTypeId_apiId: { contentTypeId: pageType.id, apiId: f.apiId } },
      update: f,
      create: { contentTypeId: pageType.id, ...f },
    });
  }

  // 5B. Articles (Blog)
  const articleType = await prisma.contentType.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'articles' } },
    update: { name: 'Articles', description: 'News, blog posts, and technical articles' },
    create: {
      siteId: site.id,
      name: 'Articles',
      slug: 'articles',
      description: 'News, blog posts, and technical articles',
      icon: 'BookOpen',
      isSingle: false,
      isPublishable: true,
      hasDrafts: true,
      hasRevisions: true,
    },
  });

  const articleFields = [
    { name: 'Summary', apiId: 'summary', type: 'longtext', isRequired: true, order: 1 },
    { name: 'Author Byline', apiId: 'byline', type: 'text', isRequired: false, order: 2 },
    { name: 'Read Time (Minutes)', apiId: 'read_time', type: 'number', isRequired: false, order: 3 },
    { name: 'Is Featured Story', apiId: 'is_featured', type: 'boolean', isRequired: false, order: 4 },
  ];

  for (const f of articleFields) {
    await prisma.contentField.upsert({
      where: { contentTypeId_apiId: { contentTypeId: articleType.id, apiId: f.apiId } },
      update: f,
      create: { contentTypeId: articleType.id, ...f },
    });
  }

  // 5C. Products
  const productType = await prisma.contentType.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'products' } },
    update: { name: 'Products', description: 'E-commerce and SaaS product catalogue' },
    create: {
      siteId: site.id,
      name: 'Products',
      slug: 'products',
      description: 'E-commerce and SaaS product catalogue',
      icon: 'Package',
      isSingle: false,
      isPublishable: true,
      hasDrafts: true,
      hasRevisions: true,
    },
  });

  const productFields = [
    { name: 'Price USD', apiId: 'price', type: 'decimal', isRequired: true, order: 1 },
    { name: 'SKU Identifier', apiId: 'sku', type: 'text', isRequired: true, order: 2 },
    { name: 'Stock Count', apiId: 'stock', type: 'number', isRequired: false, order: 3 },
    { name: 'Product Tier', apiId: 'tier', type: 'select', isRequired: false, order: 4, options: { options: ['starter', 'pro', 'enterprise'] } },
  ];

  for (const f of productFields) {
    await prisma.contentField.upsert({
      where: { contentTypeId_apiId: { contentTypeId: productType.id, apiId: f.apiId } },
      update: f,
      create: { contentTypeId: productType.id, ...f },
    });
  }

  // 5D. FAQs
  const faqType = await prisma.contentType.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'faqs' } },
    update: { name: 'FAQs', description: 'Frequently asked questions knowledgebase' },
    create: {
      siteId: site.id,
      name: 'FAQs',
      slug: 'faqs',
      icon: 'HelpCircle',
      isSingle: false,
      isPublishable: true,
      hasDrafts: true,
      hasRevisions: false,
    },
  });

  const faqFields = [
    { name: 'Question', apiId: 'question', type: 'text', isRequired: true, order: 1 },
    { name: 'Answer', apiId: 'answer', type: 'richtext', isRequired: true, order: 2 },
    { name: 'Category', apiId: 'category', type: 'text', isRequired: false, order: 3 },
    { name: 'Display Order', apiId: 'display_order', type: 'number', isRequired: false, order: 4 },
  ];

  for (const f of faqFields) {
    await prisma.contentField.upsert({
      where: { contentTypeId_apiId: { contentTypeId: faqType.id, apiId: f.apiId } },
      update: f,
      create: { contentTypeId: faqType.id, ...f },
    });
  }

  // 6. Seed Taxonomies & Terms
  console.log('  -> Seeding taxonomies and terms...');
  const categoryTax = await prisma.taxonomy.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'categories' } },
    update: { name: 'Categories', isHierarchical: true },
    create: {
      siteId: site.id,
      name: 'Categories',
      slug: 'categories',
      description: 'Main editorial topics and classifications',
      isHierarchical: true,
      appliesTo: ['articles', 'pages', 'products'],
    },
  });

  const terms = [
    { name: 'Architecture', slug: 'architecture' },
    { name: 'Engineering', slug: 'engineering' },
    { name: 'Product Guides', slug: 'product-guides' },
    { name: 'Cloud & API', slug: 'cloud-api' },
  ];

  const termMap = new Map<string, string>();
  for (const t of terms) {
    const term = await prisma.taxonomyTerm.upsert({
      where: { taxonomyId_slug: { taxonomyId: categoryTax.id, slug: t.slug } },
      update: { name: t.name },
      create: { taxonomyId: categoryTax.id, name: t.name, slug: t.slug },
    });
    termMap.set(t.slug, term.id);
  }

  // 7. Seed Content Entries with Visual Blocks
  console.log('  -> Seeding content entries with rich nested block configurations...');
  
  // 7A. Homepage
  const homeBlocks = [
    {
      id: 'blk_hero_1',
      type: 'hero',
      data: {
        badge: 'Enterprise Headless Platform',
        title: 'Universal Content Operating System',
        subtitle: 'Powering web apps, mobile apps, digital kiosks, and commerce with unparalleled API performance and visual block editing.',
        primaryCta: { label: 'Explore API Docs', url: '/api-docs' },
        secondaryCta: { label: 'View Reference Demo', url: '/articles' },
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
        buttonText: 'Get Started with API',
        buttonUrl: '/api/v1/content',
      },
    },
  ];

  await prisma.contentEntry.upsert({
    where: {
      siteId_contentTypeId_slug_locale: {
        siteId: site.id,
        contentTypeId: pageType.id,
        slug: 'home',
        locale: 'en-US',
      },
    },
    update: {
      title: 'Home — Acme Enterprise Platform',
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date(),
      blocks: homeBlocks,
      seo: {
        title: 'Markup Headless CMS | Acme Platform',
        description: 'Enterprise API-first headless content management system.',
        ogTitle: 'Acme Markup Headless CMS',
        robots: 'index, follow',
      },
    },
    create: {
      siteId: site.id,
      contentTypeId: pageType.id,
      slug: 'home',
      title: 'Home — Acme Enterprise Platform',
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: adminUserId,
      locale: 'en-US',
      data: {
        excerpt: 'The central landing page for Acme digital experiences.',
        template: 'landing',
      },
      blocks: homeBlocks,
      seo: {
        title: 'Markup Headless CMS | Acme Platform',
        description: 'Enterprise API-first headless content management system.',
        ogTitle: 'Acme Markup Headless CMS',
        robots: 'index, follow',
      },
    },
  });

  // 7B. Articles
  const articlesSeed = [
    {
      slug: 'getting-started-with-headless-architecture',
      title: 'Getting Started with Modern Headless Architecture',
      summary: 'Learn why modern engineering teams are decoupling content management from rendering layers to achieve unmatched scalability and developer velocity.',
      termSlug: 'architecture',
      blocks: [
        {
          id: 'blk_p1',
          type: 'paragraph',
          data: {
            text: 'Headless CMS platforms represent a foundational shift in how digital experiences are constructed. By decoupling the presentation layer from content authoring, engineering teams gain absolute freedom to select optimal technologies.',
          },
        },
        {
          id: 'blk_heading_1',
          type: 'heading',
          data: { text: 'Key Architectural Benefits', level: 2 },
        },
        {
          id: 'blk_list_1',
          type: 'list',
          data: {
            ordered: false,
            items: [
              'Omnichannel content distribution across Web, iOS, Android, and PWAs',
              'Enterprise-grade security by eliminating traditional monolithic attack vectors',
              'Sub-millisecond content delivery via global edge CDNs and HTTP caching',
            ],
          },
        },
      ],
    },
    {
      slug: 'mastering-visual-block-composition',
      title: 'Mastering Visual Block Composition in Enterprise CMS',
      summary: 'Explore how modular, component-driven block editors empower non-technical marketing teams while guaranteeing design system compliance.',
      termSlug: 'engineering',
      blocks: [
        {
          id: 'blk_p1',
          type: 'paragraph',
          data: {
            text: 'Fixed templates restrict creativity, while open WYSIWYG editors destroy brand consistency. Visual block composition bridges the gap by offering atomic, validated components.',
          },
        },
      ],
    },
    {
      slug: 'multi-site-and-localization-at-scale',
      title: 'Multi-Site and Global Localization at Enterprise Scale',
      summary: 'Managing hundreds of digital properties across dozens of languages requires unified content models and intelligent translation fallback chains.',
      termSlug: 'cloud-api',
      blocks: [
        {
          id: 'blk_p1',
          type: 'paragraph',
          data: {
            text: 'Global enterprises cannot afford fragmented CMS silos. A unified platform guarantees consistent governance, centralized media assets, and streamlined RBAC across all worldwide brands.',
          },
        },
      ],
    },
  ];

  for (const art of articlesSeed) {
    const entry = await prisma.contentEntry.upsert({
      where: {
        siteId_contentTypeId_slug_locale: {
          siteId: site.id,
          contentTypeId: articleType.id,
          slug: art.slug,
          locale: 'en-US',
        },
      },
      update: {
        title: art.title,
        status: EntryStatus.PUBLISHED,
        publishedAt: new Date(),
        data: {
          summary: art.summary,
          byline: 'Acme Editorial Team',
          read_time: 5,
          is_featured: true,
        },
        blocks: art.blocks,
      },
      create: {
        siteId: site.id,
        contentTypeId: articleType.id,
        slug: art.slug,
        title: art.title,
        status: EntryStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: adminUserId,
        locale: 'en-US',
        data: {
          summary: art.summary,
          byline: 'Acme Editorial Team',
          read_time: 5,
          is_featured: true,
        },
        blocks: art.blocks,
        seo: {
          title: `${art.title} | Acme Insights`,
          description: art.summary,
          robots: 'index, follow',
        },
      },
    });

    const termId = termMap.get(art.termSlug);
    if (termId) {
      await prisma.entryTaxonomyTerm.upsert({
        where: { entryId_termId: { entryId: entry.id, termId } },
        update: {},
        create: { entryId: entry.id, termId },
      });
    }
  }

  // 8. Seed Navigation Menus
  console.log('  -> Seeding navigation menus and hierarchy...');
  const headerMenu = await prisma.menu.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'main-navigation' } },
    update: { name: 'Main Navigation', location: 'header' },
    create: {
      siteId: site.id,
      name: 'Main Navigation',
      slug: 'main-navigation',
      description: 'Primary header navigation for desktop and mobile',
      location: 'header',
    },
  });

  const menuItems = [
    { title: 'Home', url: '/', order: 1 },
    { title: 'Articles', url: '/articles', order: 2 },
    { title: 'Products', url: '/products', order: 3 },
    { title: 'Documentation', url: '/docs', order: 4 },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { menuId: headerMenu.id, title: item.title },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          menuId: headerMenu.id,
          title: item.title,
          url: item.url,
          order: item.order,
          isActive: true,
        },
      });
    }
  }

  // 9. Seed Redirects
  console.log('  -> Seeding URL redirects...');
  await prisma.redirect.upsert({
    where: { siteId_sourceUrl: { siteId: site.id, sourceUrl: '/legacy-home' } },
    update: { destinationUrl: '/', statusCode: 301 },
    create: {
      siteId: site.id,
      sourceUrl: '/legacy-home',
      destinationUrl: '/',
      statusCode: 301,
      notes: 'Migrated from legacy frontend',
      createdById: adminUserId,
    },
  });

  // 10. Seed API Keys
  console.log('  -> Seeding live API keys...');
  const deliveryKey = generateApiKey('PRODUCTION');
  await prisma.apiKey.upsert({
    where: { keyHash: deliveryKey.keyHash },
    update: {},
    create: {
      siteId: site.id,
      name: 'Public Content Delivery API Key',
      keyPrefix: deliveryKey.keyPrefix,
      keyHash: deliveryKey.keyHash,
      role: ApiKeyRole.READ_ONLY,
      scopes: ['content:read', 'media:read', 'navigation:read', 'taxonomies:read'],
      environment: ApiKeyEnvironment.PRODUCTION,
      createdById: adminUserId,
    },
  });
  console.log(`  🔑 Public Content Delivery Key: ${deliveryKey.secretKey}`);

  // 11. Seed Central Settings
  console.log('  -> Seeding central site settings...');
  const settingsData = [
    { key: 'site_title', value: 'Acme Digital Platform', category: SettingCategory.GENERAL, isPublic: true },
    { key: 'site_tagline', value: 'The Universal Content Platform', category: SettingCategory.GENERAL, isPublic: true },
    { key: 'meta_description', value: 'Enterprise grade headless content management system.', category: SettingCategory.SEO, isPublic: true },
    { key: 'analytics_id', value: 'G-ACME123456', category: SettingCategory.CODE_INJECTION, isPublic: true },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { siteId_key: { siteId: site.id, key: s.key } },
      update: { value: s.value, category: s.category, isPublic: s.isPublic },
      create: { siteId: site.id, key: s.key, value: s.value, category: s.category, isPublic: s.isPublic },
    });
  }

  // 12. Seed Workflows
  console.log('  -> Seeding editorial workflows & state machines...');
  const defaultWorkflow = await prisma.workflow.upsert({
    where: { siteId_slug: { siteId: site.id, slug: 'editorial-workflow' } },
    update: { name: 'Standard Editorial Workflow' },
    create: {
      siteId: site.id,
      name: 'Standard Editorial Workflow',
      slug: 'editorial-workflow',
      description: 'Standard 4-tier editorial workflow for high-governance publishing',
      isDefault: true,
      contentTypeIds: [pageType.id, articleType.id, productType.id],
    },
  });

  const states = [
    { name: 'Draft', slug: 'draft', color: '#64748b', isInitial: true, isPublished: false, order: 1 },
    { name: 'In Review', slug: 'in_review', color: '#f59e0b', isInitial: false, isPublished: false, order: 2 },
    { name: 'Approved', slug: 'approved', color: '#3b82f6', isInitial: false, isPublished: false, order: 3 },
    { name: 'Published', slug: 'published', color: '#10b981', isInitial: false, isPublished: true, order: 4 },
    { name: 'Archived', slug: 'archived', color: '#ef4444', isInitial: false, isArchived: true, order: 5 },
  ];

  for (const st of states) {
    await prisma.workflowState.upsert({
      where: { workflowId_slug: { workflowId: defaultWorkflow.id, slug: st.slug } },
      update: st,
      create: { workflowId: defaultWorkflow.id, ...st },
    });
  }

  // 13. Seed Default Crop Presets
  console.log('  -> Seeding responsive crop presets...');
  const defaultPresets = [
    { name: 'Thumbnail', slug: 'thumbnail', width: 300, height: 300, fit: 'cover', isDefault: true },
    { name: 'Card', slug: 'card', width: 600, height: 400, fit: 'cover', isDefault: true },
    { name: 'Medium', slug: 'medium', width: 1200, height: 800, fit: 'cover', isDefault: true },
    { name: 'Hero', slug: 'hero', width: 1920, height: 1080, fit: 'cover', isDefault: true },
    { name: 'Social', slug: 'social', width: 1200, height: 630, fit: 'cover', isDefault: false },
    { name: 'Square', slug: 'square', width: 800, height: 800, fit: 'cover', isDefault: false },
    { name: 'Portrait', slug: 'portrait', width: 800, height: 1200, fit: 'cover', isDefault: false },
    { name: 'Landscape', slug: 'landscape', width: 1600, height: 900, fit: 'cover', isDefault: false },
  ];

  for (const preset of defaultPresets) {
    await prisma.cropPreset.upsert({
      where: { siteId_slug: { siteId: site.id, slug: preset.slug } },
      update: preset,
      create: { siteId: site.id, ...preset },
    });
  }

  console.log('✅ Enterprise Headless CMS database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
