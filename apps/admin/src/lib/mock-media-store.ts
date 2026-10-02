export interface MockMediaVariant {
  id: string;
  presetSlug: string;
  presetName?: string;
  width: number;
  height: number;
  format: string;
  quality: number;
  fileSize: number;
  storageProvider: string;
  storageBucket?: string;
  storageKey?: string;
  publicUrl: string;
  seoName?: string;
  r2ReferenceName?: string;
}

export interface MockMediaItem {
  id: string;
  filename: string;
  originalName: string;
  seoName?: string;
  r2ReferenceName?: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  focalX: number;
  focalY: number;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  altText: string;
  caption?: string;
  description?: string;
  storageDriver?: string;
  storageBucket?: string;
  storageKey?: string;
  publicUrl: string;
  variants: MockMediaVariant[];
  mediaVariants: MockMediaVariant[];
  folderId?: string | null;
  folder?: { id: string; name: string; slug: string } | null;
  usageCount: number;
  createdById?: string | null;
  uploaderName?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MockFolder {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  _count: { media: number; children: number };
}

export interface MockJob {
  id: string;
  status: string;
  progress: number;
  currentStep: string;
  originalFilename: string;
  originalFileSize: number;
  originalWidth?: number;
  originalHeight?: number;
  selectedPresets: string[];
  focalX: number;
  focalY: number;
  error?: string | null;
  mediaId?: string | null;
  media?: any;
  createdAt: string;
  updatedAt: string;
}

let MOCK_FOLDERS: MockFolder[] = [
  { id: 'fld_editorial', name: 'Editorial & Articles', slug: 'editorial', parentId: null, _count: { media: 3, children: 0 } },
  { id: 'fld_banners', name: 'Hero Banners', slug: 'banners', parentId: null, _count: { media: 2, children: 0 } },
  { id: 'fld_products', name: 'Products & Showcase', slug: 'products', parentId: null, _count: { media: 1, children: 0 } },
];

let MOCK_MEDIA: MockMediaItem[] = [
  {
    id: 'med_hero_arch',
    filename: 'hero-architecture.webp',
    originalName: 'hero-architecture.png',
    mimeType: 'image/webp',
    size: 148500,
    width: 1920,
    height: 1080,
    focalPoint: { x: 0.5, y: 0.5 },
    focalX: 0.5,
    focalY: 0.5,
    originalWidth: 1920,
    originalHeight: 1080,
    originalSize: 148500,
    altText: 'Modern Headless CMS Architecture',
    caption: 'Decoupled content mesh diagram',
    description: 'High resolution vector diagram illustrating edge delivery architecture.',
    publicUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
    folderId: 'fld_editorial',
    folder: { id: 'fld_editorial', name: 'Editorial & Articles', slug: 'editorial' },
    usageCount: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    variants: [
      {
        id: 'var_hero_card',
        presetSlug: 'card',
        width: 800,
        height: 450,
        format: 'webp',
        quality: 85,
        fileSize: 42000,
        storageProvider: 'r2_local_mock',
        publicUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
      },
      {
        id: 'var_hero_thumb',
        presetSlug: 'thumbnail',
        width: 300,
        height: 300,
        format: 'webp',
        quality: 85,
        fileSize: 14000,
        storageProvider: 'r2_local_mock',
        publicUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop',
      },
    ],
    mediaVariants: [
      {
        id: 'var_hero_card',
        presetSlug: 'card',
        width: 800,
        height: 450,
        format: 'webp',
        quality: 85,
        fileSize: 42000,
        storageProvider: 'r2_local_mock',
        publicUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
      },
    ],
  },
  {
    id: 'med_nextjs_speed',
    filename: 'nextjs-isr-caching.webp',
    originalName: 'nextjs-isr-caching.jpg',
    mimeType: 'image/webp',
    size: 98200,
    width: 1200,
    height: 800,
    focalPoint: { x: 0.5, y: 0.4 },
    focalX: 0.5,
    focalY: 0.4,
    originalWidth: 1200,
    originalHeight: 800,
    originalSize: 98200,
    altText: 'Next.js App Router Performance Benchmarks',
    caption: 'Sub-millisecond TTFB on Cloudflare Edge',
    description: 'Benchmarking results comparing traditional SSR with Incremental Static Regeneration.',
    publicUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=800&fit=crop',
    folderId: 'fld_editorial',
    folder: { id: 'fld_editorial', name: 'Editorial & Articles', slug: 'editorial' },
    usageCount: 2,
    createdById: 'user_editor_01',
    uploaderName: 'Marcus Vance (Lead Editor)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    variants: [],
    mediaVariants: [],
  },
  {
    id: 'med_author_banner',
    filename: 'responsive-webp-demo.webp',
    originalName: 'responsive-webp-demo.png',
    mimeType: 'image/webp',
    size: 84200,
    width: 1200,
    height: 630,
    focalPoint: { x: 0.5, y: 0.5 },
    focalX: 0.5,
    focalY: 0.5,
    originalWidth: 1200,
    originalHeight: 630,
    originalSize: 84200,
    altText: 'Responsive WebP conversion benchmark chart',
    caption: 'Performance comparison across next-gen image formats',
    description: 'Analytical chart prepared for Web Vitals deep-dive.',
    publicUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    folderId: 'fld_editorial',
    folder: { id: 'fld_editorial', name: 'Editorial & Articles', slug: 'editorial' },
    usageCount: 1,
    createdById: 'user_author_01',
    uploaderName: 'Elena Rostova (Staff Author)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    variants: [],
    mediaVariants: [],
  },
  {
    id: 'med_author_jamstack',
    filename: 'jamstack-pipeline.webp',
    originalName: 'jamstack-pipeline.png',
    mimeType: 'image/webp',
    size: 112000,
    width: 1200,
    height: 630,
    focalPoint: { x: 0.5, y: 0.5 },
    focalX: 0.5,
    focalY: 0.5,
    originalWidth: 1200,
    originalHeight: 630,
    originalSize: 112000,
    altText: 'Next.js App Router edge execution mesh',
    caption: 'Global deployment topology across Cloudflare locations',
    description: 'Architecture diagram for Jamstack article.',
    publicUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop',
    folderId: 'fld_editorial',
    folder: { id: 'fld_editorial', name: 'Editorial & Articles', slug: 'editorial' },
    usageCount: 2,
    createdById: 'user_author_01',
    uploaderName: 'Elena Rostova (Staff Author)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    variants: [],
    mediaVariants: [],
  },
];

let MOCK_JOBS: Record<string, MockJob> = {};

export function getMockMedia(query?: {
  folderId?: string | null;
  search?: string;
  mimeType?: string;
  page?: number;
  limit?: number;
  uploaderId?: string | null;
}) {
  let list = [...MOCK_MEDIA];

  if (query?.uploaderId) {
    list = list.filter((m) => m.createdById === query.uploaderId);
  }

  if (query?.folderId === 'root') {
    list = list.filter((m) => !m.folderId);
  } else if (query?.folderId) {
    list = list.filter((m) => m.folderId === query.folderId);
  }

  if (query?.mimeType) {
    list = list.filter((m) => m.mimeType.startsWith(query.mimeType!));
  }

  if (query?.search) {
    const q = query.search.toLowerCase();
    list = list.filter((m) => m.originalName.toLowerCase().includes(q) || m.altText.toLowerCase().includes(q));
  }

  const page = query?.page || 1;
  const limit = query?.limit || 20;
  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export function addMockMedia(item: MockMediaItem) {
  MOCK_MEDIA.unshift(item);
  return item;
}

export function getMockMediaById(id: string): MockMediaItem | null {
  return MOCK_MEDIA.find((m) => m.id === id) || null;
}

export function updateMockMedia(id: string, updates: Partial<MockMediaItem>): MockMediaItem | null {
  const item = MOCK_MEDIA.find((m) => m.id === id);
  if (!item) return null;
  Object.assign(item, updates, { updatedAt: new Date().toISOString() });
  return item;
}

export function deleteMockMedia(id: string): boolean {
  const initial = MOCK_MEDIA.length;
  MOCK_MEDIA = MOCK_MEDIA.filter((m) => m.id !== id);
  return MOCK_MEDIA.length < initial;
}

export function getMockFolders(): MockFolder[] {
  return MOCK_FOLDERS;
}

export function addMockFolder(folder: { name: string; parentId?: string | null }): MockFolder {
  const newFolder: MockFolder = {
    id: `fld_${Date.now()}`,
    name: folder.name,
    slug: folder.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    parentId: folder.parentId || null,
    _count: { media: 0, children: 0 },
  };
  MOCK_FOLDERS.push(newFolder);
  return newFolder;
}

export function deleteMockFolder(id: string): boolean {
  const initial = MOCK_FOLDERS.length;
  MOCK_FOLDERS = MOCK_FOLDERS.filter((f) => f.id !== id);
  return MOCK_FOLDERS.length < initial;
}

export function getMockJob(jobId: string): MockJob | null {
  return MOCK_JOBS[jobId] || null;
}

export function upsertMockJob(job: Partial<MockJob> & { id: string }): MockJob {
  const existing = MOCK_JOBS[job.id] || {
    id: job.id,
    status: 'PROCESSING',
    progress: 5,
    currentStep: 'validating',
    originalFilename: '',
    originalFileSize: 0,
    selectedPresets: [],
    focalX: 0.5,
    focalY: 0.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_JOBS[job.id] = { ...existing, ...job, updatedAt: new Date().toISOString() };
  return MOCK_JOBS[job.id];
}
