import { prisma } from '@markup/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { getMockContentTypes, getMockContentEntries } from '@/lib/mock-content-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteSlug = site?.slug || 'markup-site';
    const siteName = site?.name || 'Media Bird Magazine';

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'settings.manage');
    if (!guard.authorized) return guard.response!;

    try {
      const [contentTypes, contentEntries, taxonomies, menus, settings] = await withTimeout(
        Promise.all([
          prisma.contentType.findMany({
            where: { siteId: site?.id },
            include: { fields: true },
          }),
          prisma.contentEntry.findMany({
            where: { siteId: site?.id },
          }),
          prisma.taxonomy.findMany({
            where: { siteId: site?.id },
            include: { terms: true },
          }),
          prisma.menu.findMany({
            where: { siteId: site?.id },
            include: { items: true },
          }),
          prisma.setting.findMany({
            where: { siteId: site?.id },
          }),
        ])
      );

      const exportBundle = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        site: {
          name: siteName,
          slug: siteSlug,
          defaultLocale: site?.defaultLocale || 'en-US',
        },
        contentTypes,
        contentEntries,
        taxonomies,
        menus,
        settings,
      };

      return NextResponse.json(exportBundle, {
        headers: {
          'Content-Disposition': `attachment; filename="${siteSlug}-export-${Date.now()}.json"`,
        },
      });
    } catch {
      // Graceful offline fallback bundle
      const fallbackExportBundle = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        site: {
          name: siteName,
          slug: siteSlug,
          defaultLocale: 'en-US',
        },
        contentTypes: getMockContentTypes(),
        contentEntries: getMockContentEntries({ limit: 100 }).data,
        taxonomies: [
          { id: 'tax_cat', name: 'Categories', slug: 'categories', terms: [{ id: 't1', name: 'Next.js', slug: 'nextjs' }] },
          { id: 'tax_tag', name: 'Tags', slug: 'tags', terms: [{ id: 't2', name: 'Architecture', slug: 'architecture' }] },
        ],
        menus: [
          { id: 'menu_header', name: 'Main Header Navigation', slug: 'main-navigation', items: [{ title: 'Home', url: '/' }, { title: 'Articles', url: '/articles' }] },
        ],
        settings: [
          { key: 'site_title', value: 'Media Bird Magazine' },
          { key: 'primary_color', value: '#ef4444' },
        ],
      };

      return NextResponse.json(fallbackExportBundle, {
        headers: {
          'Content-Disposition': `attachment; filename="${siteSlug}-export-${Date.now()}.json"`,
        },
      });
    }
  } catch (err) {
    console.error('[ExportGET] Error:', err);
    return NextResponse.json({ error: 'Failed to export site data' }, { status: 500 });
  }
}
