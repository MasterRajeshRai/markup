import { prisma } from '@headless/database';

export interface SearchResultItem {
  id: string;
  type: 'content' | 'media' | 'taxonomy' | 'user';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

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
    const entries = await prisma.contentEntry.findMany({
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
    });

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
    const media = await prisma.media.findMany({
      where: {
        siteId,
        OR: [
          { originalName: { contains: trimmed, mode: 'insensitive' } },
          { altText: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      take: Math.min(10, limit),
    });

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
    const terms = await prisma.taxonomyTerm.findMany({
      where: {
        taxonomy: { siteId },
        name: { contains: trimmed, mode: 'insensitive' },
      },
      include: { taxonomy: true },
      take: 5,
    });

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
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { email: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

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
    console.error('[Search] Error executing search:', err);
  }

  return results.slice(0, limit);
}
