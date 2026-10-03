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
  category: 'Ek Ped Maa Ke Naam' | 'Special Initiatives' | 'Sports & Athletics' | 'STEM & Innovation' | 'Cultural & Arts' | 'Campus & Facilities' | 'Academics & Merit' | string;
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
    id: 'alb_ek_ped_maa_ke_naam',
    name: 'Ek Ped Maa Ke Naam',
    slug: 'ek-ped-maa-ke-naam',
    category: 'Ek Ped Maa Ke Naam',
    subtitle: 'Planting Trees, Honoring Mothers & Fostering Green Stewardship',
    description:
      'Prince Public School students, respected teachers, and administrative leaders assembled on stage in front of the Saraswati auditorium for the nationwide "Ek Ped Maa Ke Naam" campaign. A cherished initiative celebrating maternal love while creating lasting environmental awareness.',
    coverImage: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
    eventDate: '2026-09-15',
    isFeatured: true,
    status: 'PUBLISHED',
    photoCount: 4,
    r2Bucket: 'pps-media-production',
    r2Prefix: 'gallery/ek-ped-maa-ke-naam/',
    syncStatus: 'local',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-03T02:00:00Z',
    photos: [
      {
        id: 'photo_epmkn_1',
        title: 'Leadership, Teachers & Young Scholars Assemble on Stage',
        caption: 'Director Gaurav Sharma, Principal Shailendra Upadhyay, senior faculty, and students gathered in school uniform before the Saraswati mural for "Ek Ped Maa Ke Naam".',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
        altText: 'Prince Public School faculty and students on stage for Ek Ped Maa Ke Naam',
        order: 1,
        isCover: true,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_epmkn_2',
        title: 'Primary & Pre-School Participants with School Mentors',
        caption: 'Young learners from foundational classes proudly taking part in the environmental reverence drive alongside their class mentors.',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-2.webp',
        altText: 'Students and teachers pledging for green living',
        order: 2,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-2.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_epmkn_3',
        title: 'Commitment to Nature and Motherly Dedication',
        caption: 'Secondary faculty members and student leaders commending the tree plantation saplings dedicated to mothers across India.',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-3.webp',
        altText: 'Secondary wing faculty and students during commemorative tree drive',
        order: 3,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-3.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_epmkn_4',
        title: 'School Community United for Environmental Responsibility',
        caption: 'A complete panoramic gathering celebrating green campus life and value-based education at Prince Public School, Mehrauli.',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-4.webp',
        altText: 'Complete group photo of Prince Public School community for Ek Ped Maa Ke Naam',
        order: 4,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-4.webp',
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
      category: input.category || 'Special Initiatives',
      subtitle: input.subtitle || '',
      description: input.description || '',
      coverImage: input.coverImage || photos[0]?.imageUrl || '/images/pps-building-facade.webp',
      eventDate: input.eventDate || new Date().toISOString().split('T')[0],
      isFeatured: false,
      status: 'PUBLISHED',
      photoCount: photos.length,
      photos,
      r2Bucket: 'pps-media-production',
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
        photo.r2Url = `https://pps-media.r2.cloudflarestorage.com/${photo.r2Key}`;
        count++;
      });
    });

    return {
      syncedCount: count,
      status: 'Cloudflare R2 Synchronized',
      destination: 'pps-media-production.r2.cloudflarestorage.com',
    };
  },
};
