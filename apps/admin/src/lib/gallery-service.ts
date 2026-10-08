export interface GalleryPhoto {
  id: string;
  title: string;
  caption?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  width?: number;
  height?: number;
  order: number;
  isCover?: boolean;
  r2Key?: string;
  r2Url?: string;
  syncStatus: 'local' | 'synced' | 'pending';
  dateAdded: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  slug: string;
  category: 'General' | 'Events' | 'Projects' | 'Campus & Facilities' | 'Media & Press' | 'Community' | string;
  subtitle?: string;
  description: string;
  coverImage: string;
  eventDate: string;
  isFeatured?: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  photoCount: number;
  photos: GalleryPhoto[];
  r2Bucket?: string;
  r2Prefix?: string;
  syncStatus: 'local' | 'synced' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback and persistent store for albums
let MOCK_ALBUMS: GalleryAlbum[] = [
  {
    id: 'alb_annual_conference',
    name: 'Annual Digital Conference',
    slug: 'annual-digital-conference',
    category: 'Events',
    subtitle: 'Showcasing innovations in digital media and software architecture',
    description:
      'Keynotes, workshop sessions, and collaborative breakout meetings from our annual industry summit. Exploring next-generation headless architectures and omnichannel content delivery.',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    eventDate: '2026-09-15',
    isFeatured: true,
    status: 'PUBLISHED',
    photoCount: 2,
    r2Bucket: 'cms-media-production',
    r2Prefix: 'gallery/annual-conference/',
    syncStatus: 'local',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-03T02:00:00Z',
    photos: [
      {
        id: 'photo_conf_1',
        title: 'Keynote Presentation',
        caption: 'Opening keynote discussing headless architecture and content velocity.',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        altText: 'Keynote speaker on stage during conference',
        order: 1,
        isCover: true,
        r2Key: 'gallery/annual-conference/conf-1.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_conf_2',
        title: 'Collaborative Workshop',
        caption: 'Engineers and designers collaborating during hands-on design system lab.',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
        altText: 'Participants engaged in interactive workshop',
        order: 2,
        r2Key: 'gallery/annual-conference/conf-2.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
    ],
  },
];

export const galleryService = {
  async getAllAlbums(): Promise<GalleryAlbum[]> {
    return MOCK_ALBUMS;
  },

  async getAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
    const album = MOCK_ALBUMS.find((a) => a.slug === slug);
    return album || null;
  },

  async createAlbum(input: {
    name: string;
    slug?: string;
    category?: GalleryAlbum['category'];
    subtitle?: string;
    description?: string;
    coverImage?: string;
    eventDate?: string;
    photos?: Partial<GalleryPhoto>[];
  }): Promise<GalleryAlbum> {
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const photos: GalleryPhoto[] = (input.photos || []).map((p, idx) => ({
      id: p.id || `photo_${Date.now()}_${idx}`,
      title: p.title || `Photo ${idx + 1}`,
      caption: p.caption || '',
      imageUrl: p.imageUrl || '',
      thumbnailUrl: p.thumbnailUrl || p.imageUrl || '',
      altText: p.altText || p.title || '',
      order: p.order ?? idx + 1,
      isCover: idx === 0,
      r2Key: `gallery/${slug}/${p.imageUrl?.split('/').pop() || `photo-${idx + 1}.webp`}`,
      syncStatus: 'local',
      dateAdded: new Date().toISOString().split('T')[0],
    }));

    const newAlbum: GalleryAlbum = {
      id: `alb_${Date.now()}`,
      name: input.name,
      slug,
      category: input.category || 'General',
      subtitle: input.subtitle || '',
      description: input.description || '',
      coverImage: input.coverImage || photos[0]?.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      eventDate: input.eventDate || new Date().toISOString().split('T')[0],
      isFeatured: false,
      status: 'PUBLISHED',
      photoCount: photos.length,
      photos,
      r2Bucket: 'cms-media-production',
      r2Prefix: `gallery/${slug}/`,
      syncStatus: 'local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_ALBUMS.unshift(newAlbum);
    return newAlbum;
  },

  async updateAlbum(slug: string, updates: Partial<GalleryAlbum>): Promise<GalleryAlbum | null> {
    const idx = MOCK_ALBUMS.findIndex((a) => a.slug === slug);
    if (idx === -1) return null;

    const current = MOCK_ALBUMS[idx];
    const updated: GalleryAlbum = {
      ...current,
      ...updates,
      photoCount: updates.photos ? updates.photos.length : current.photoCount,
      updatedAt: new Date().toISOString(),
    };

    MOCK_ALBUMS[idx] = updated;
    return updated;
  },

  async deleteAlbum(slug: string): Promise<boolean> {
    const initialLen = MOCK_ALBUMS.length;
    MOCK_ALBUMS = MOCK_ALBUMS.filter((a) => a.slug !== slug);
    return MOCK_ALBUMS.length < initialLen;
  },

  async triggerR2Sync(slug?: string): Promise<{ syncedCount: number; status: string; destination: string }> {
    const targetAlbums = slug ? MOCK_ALBUMS.filter((a) => a.slug === slug) : MOCK_ALBUMS;
    let count = 0;

    targetAlbums.forEach((album) => {
      album.syncStatus = 'synced';
      album.photos.forEach((photo) => {
        photo.syncStatus = 'synced';
        photo.r2Url = `https://cms-media.r2.cloudflarestorage.com/${photo.r2Key}`;
        count++;
      });
    });

    return {
      syncedCount: count,
      status: 'Cloudflare R2 Synchronized',
      destination: 'cms-media-production.r2.cloudflarestorage.com',
    };
  },
};
