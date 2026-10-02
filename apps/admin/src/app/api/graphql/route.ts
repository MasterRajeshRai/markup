import { NextRequest, NextResponse } from 'next/server';
import { graphql, buildSchema } from 'graphql';
import { getAdsConfig, getAdUnits } from '@/lib/ads-service';

// ── GraphQL Schema Definition ────────────────────────────────────────────────
const schema = buildSchema(`
  enum ContentStatus {
    DRAFT
    IN_REVIEW
    APPROVED
    SCHEDULED
    PUBLISHED
    ARCHIVED
  }

  type ContentEntry {
    id: String!
    title: String!
    slug: String!
    typeSlug: String!
    status: ContentStatus!
    publishedAt: String
    locale: String
    summary: String
    data: String
    seoScore: Int
  }

  type ContentType {
    id: String!
    name: String!
    slug: String!
    description: String
    isPublishable: Boolean
  }

  type MediaItem {
    id: String!
    filename: String!
    originalName: String!
    publicUrl: String!
    mimeType: String!
    size: Int!
    width: Int
    height: Int
  }

  type SystemHealth {
    status: String!
    database: String!
    storageDriver: String!
    version: String!
    uptimeSeconds: Int!
  }

  type AdUnit {
    id: String!
    name: String!
    slotId: String!
    placement: String!
    format: String!
    deviceTargeting: String!
    isActive: Boolean!
    priority: Int!
    customFallbackHtml: String
  }

  type AdSenseConfig {
    publisherId: String!
    autoAdsEnabled: Boolean!
    lazyLoadEnabled: Boolean!
    consentModeV2: Boolean!
    testMode: Boolean!
    adBlockerNoticeEnabled: Boolean!
    minWordCountForAds: Int!
    autoInjectParagraphs: [Int!]!
    excludedCategories: [String!]!
  }

  type Query {
    entries(type: String, status: ContentStatus, limit: Int, search: String): [ContentEntry!]!
    entry(id: String, slug: String): ContentEntry
    contentTypes: [ContentType!]!
    media(limit: Int): [MediaItem!]!
    systemHealth: SystemHealth!
    adUnits(placement: String, isActive: Boolean): [AdUnit!]!
    adsConfig: AdSenseConfig!
  }

  type Mutation {
    publishEntry(id: String!): ContentEntry
    unpublishEntry(id: String!): ContentEntry
  }
`);

// ── Mock Data Layer ──────────────────────────────────────────────────────────
const MOCK_ENTRIES = [
  {
    id: 'art_1',
    title: 'Getting Started with Modern Headless Architecture',
    slug: 'getting-started-with-headless-architecture',
    typeSlug: 'articles',
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    locale: 'en-US',
    summary: 'Learn why modern engineering teams are decoupling content management from rendering layers to achieve unmatched scalability and developer velocity.',
    data: JSON.stringify({ author: 'Alex Morgan', readTime: 6, featured: true }),
    seoScore: 92,
  },
  {
    id: 'art_2',
    title: 'Next.js 15 Server Components & Incremental Static Regeneration',
    slug: 'nextjs-15-server-components-isr',
    typeSlug: 'articles',
    status: 'SCHEDULED',
    publishedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    locale: 'en-US',
    summary: 'Deep dive into Next.js 15 app router caching patterns, React Server Components, and zero-downtime headless CMS webhooks.',
    data: JSON.stringify({ author: 'Sarah Jenkins', readTime: 8, featured: true }),
    seoScore: 88,
  },
  {
    id: 'pg_1',
    title: 'Enterprise Security & Compliance Whitepaper',
    slug: 'security-compliance-whitepaper',
    typeSlug: 'pages',
    status: 'IN_REVIEW',
    publishedAt: null,
    locale: 'en-US',
    summary: 'SOC2 Type II, ISO 27001, and HIPAA compliance guide for headless decoupled content repositories.',
    data: JSON.stringify({ author: 'Elena Rostova', department: 'Security' }),
    seoScore: 78,
  },
];

const MOCK_CONTENT_TYPES = [
  { id: 'ct_articles', name: 'Articles', slug: 'articles', description: 'Long-form editorial blog posts and tutorials', isPublishable: true },
  { id: 'ct_pages', name: 'Pages', slug: 'pages', description: 'Landing pages and marketing assets', isPublishable: true },
  { id: 'ct_authors', name: 'Authors', slug: 'authors', description: 'Guest contributors and editorial staff', isPublishable: false },
];

const MOCK_MEDIA = [
  {
    id: 'med_1',
    filename: 'hero-banner.webp',
    originalName: 'hero-banner.jpg',
    publicUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    mimeType: 'image/webp',
    size: 94200,
    width: 1200,
    height: 630,
  },
  {
    id: 'med_2',
    filename: 'cloud-architecture.webp',
    originalName: 'cloud-architecture.png',
    publicUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
    mimeType: 'image/webp',
    size: 148500,
    width: 1200,
    height: 630,
  },
];

// ── Root Resolvers ───────────────────────────────────────────────────────────
const root = {
  entries: ({ type, status, limit, search }: any) => {
    let result = [...MOCK_ENTRIES];
    if (type) result = result.filter((e) => e.typeSlug === type);
    if (status) result = result.filter((e) => e.status === status);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q));
    }
    if (limit && limit > 0) result = result.slice(0, limit);
    return result;
  },
  entry: ({ id, slug }: any) => {
    return MOCK_ENTRIES.find((e) => (id && e.id === id) || (slug && e.slug === slug)) || null;
  },
  contentTypes: () => MOCK_CONTENT_TYPES,
  media: ({ limit }: any) => {
    if (limit && limit > 0) return MOCK_MEDIA.slice(0, limit);
    return MOCK_MEDIA;
  },
  systemHealth: () => ({
    status: 'HEALTHY',
    database: 'PostgreSQL 16 (Connected)',
    storageDriver: 'Cloudflare R2 (S3 API)',
    version: '1.4.0-enterprise',
    uptimeSeconds: Math.floor(process.uptime()),
  }),
  adUnits: ({ placement, isActive }: { placement?: string; isActive?: boolean }) => {
    let units = getAdUnits();
    if (placement) units = units.filter((u) => u.placement === placement);
    if (typeof isActive === 'boolean') units = units.filter((u) => u.isActive === isActive);
    return units;
  },
  adsConfig: () => getAdsConfig(),
  publishEntry: ({ id }: { id: string }) => {
    const entry = MOCK_ENTRIES.find((e) => e.id === id);
    if (entry) {
      entry.status = 'PUBLISHED';
      entry.publishedAt = new Date().toISOString();
      return entry;
    }
    return null;
  },
  unpublishEntry: ({ id }: { id: string }) => {
    const entry = MOCK_ENTRIES.find((e) => e.id === id);
    if (entry) {
      entry.status = 'DRAFT';
      return entry;
    }
    return null;
  },
};

// ── Route Handlers ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json({ errors: [{ message: 'GraphQL query is required' }] }, { status: 400 });
    }

    const response = await graphql({
      schema,
      source: query,
      rootValue: root,
      variableValues: variables,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { errors: [{ message: error.message || 'Internal GraphQL execution error' }] },
      { status: 500 }
    );
  }
}

// Interactive GraphiQL HTML Playground when accessed via browser GET
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Headless CMS • GraphiQL Playground</title>
  <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
  <style>
    body { height: 100vh; margin: 0; overflow: hidden; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #graphiql { height: 100vh; }
  </style>
</head>
<body>
  <div id="graphiql">Loading Headless CMS GraphQL Playground...</div>
  <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>
  <script>
    const defaultQuery = \`query GetEnterpriseContent {
  entries(limit: 5) {
    id
    title
    slug
    typeSlug
    status
    publishedAt
    summary
    seoScore
  }
  contentTypes {
    name
    slug
  }
  systemHealth {
    status
    database
    storageDriver
  }
  adsConfig {
    publisherId
    autoAdsEnabled
    lazyLoadEnabled
  }
  adUnits(isActive: true) {
    id
    name
    slotId
    placement
  }
}\`;

    function graphQLFetcher(graphQLParams) {
      return fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphQLParams),
      }).then(response => response.json());
    }

    ReactDOM.render(
      React.createElement(GraphiQL, {
        fetcher: graphQLFetcher,
        defaultQuery: defaultQuery,
      }),
      document.getElementById('graphiql')
    );
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
