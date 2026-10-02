import { prisma } from '@headless/database';
import { getMockContentEntries } from '@/lib/mock-content-store';

export interface SearchResultItem {
  id: string;
  type: 'content' | 'media' | 'taxonomy' | 'user';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

const fallbackUsers = [
  { id: 'user_admin_01', name: 'Super Administrator', email: 'admin@headless.io' },
  { id: 'user_editor_01', name: 'Marcus Vance (Lead Editor)', email: 'editor@headless.io' },
  { id: 'user_author_01', name: 'Elena Rostova (Staff Author)', email: 'author@headless.io' },
  { id: 'user_reviewer_01', name: 'David Kim (Fact Checker)', email: 'reviewer@headless.io' },
];

/**
 * Searches across multiple CMS entities: Content, Media, Taxonomies, and Users
 */
export async function searchCms(
  siteId: string,
  query: string,
  limit = 20
): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: SearchResultItem[] = [];

  try {
    // 1. Search Content Entries
    const entries = await withTimeout(
      prisma.contentEntry.findMany({
        where: {
          siteId,
          OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { slug: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        include: {
          contentType: true,
        },
        take: limit,
      })
    );

    for (const e of entries) {
      results.push({
        id: e.id,
        type: 'content',
        title: e.title,
        subtitle: `${e.contentType.name} • ${e.status} • /${e.slug}`,
        url: `/admin/content/${e.contentType.slug}/${e.id}`,
        metadata: { status: e.status, contentType: e.contentType.slug },
      });
    }

    // 2. Search Media
    const media = await withTimeout(
      prisma.media.findMany({
        where: {
          siteId,
          OR: [
            { originalName: { contains: trimmed, mode: 'insensitive' } },
            { altText: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        take: Math.min(10, limit),
      })
    );

    for (const m of media) {
      results.push({
        id: m.id,
        type: 'media',
        title: m.originalName,
        subtitle: `${m.mimeType} • ${(m.size / 1024).toFixed(1)} KB`,
        url: `/admin/media?id=${m.id}`,
        metadata: { mimeType: m.mimeType, url: m.publicUrl },
      });
    }

    // 3. Search Taxonomy Terms
    const terms = await withTimeout(
      prisma.taxonomyTerm.findMany({
        where: {
          taxonomy: { siteId },
          name: { contains: trimmed, mode: 'insensitive' },
        },
        include: { taxonomy: true },
        take: 5,
      })
    );

    for (const t of terms) {
      results.push({
        id: t.id,
        type: 'taxonomy',
        title: t.name,
        subtitle: `Taxonomy: ${t.taxonomy.name} • ${t.slug}`,
        url: `/admin/taxonomies`,
      });
    }

    // 4. Search Users
    const users = await withTimeout(
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: trimmed, mode: 'insensitive' } },
            { email: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        take: 5,
      })
    );

    for (const u of users) {
      results.push({
        id: u.id,
        type: 'user',
        title: u.name,
        subtitle: u.email,
        url: `/admin/users`,
      });
    }
  } catch (err) {
    // Database offline or query timed out - fallback to in-memory store
  }

  // Fallback to in-memory store if no results found or DB offline
  if (results.length === 0) {
    const mockEntries = getMockContentEntries({ search: trimmed, limit });
    for (const e of mockEntries.data) {
      results.push({
        id: e.id,
        type: 'content',
        title: e.title,
        subtitle: `${e.contentType} • ${e.status} • /${e.slug}`,
        url: `/admin/content/${e.contentType}/${e.id}`,
        metadata: { status: e.status, contentType: e.contentType },
      });
    }

    const matchedUsers = fallbackUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        u.email.toLowerCase().includes(trimmed.toLowerCase())
    );
    for (const u of matchedUsers) {
      results.push({
        id: u.id,
        type: 'user',
        title: u.name,
        subtitle: u.email,
        url: `/admin/users`,
      });
    }
  }

  return results.slice(0, limit);
}
