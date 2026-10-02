import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'settings.manage');
    if (!guard.authorized) return guard.response!;

    const [contentTypes, contentEntries, taxonomies, menus, settings] = await Promise.all([
      prisma.contentType.findMany({
        where: { siteId: site.id },
        include: { fields: true },
      }),
      prisma.contentEntry.findMany({
        where: { siteId: site.id },
      }),
      prisma.taxonomy.findMany({
        where: { siteId: site.id },
        include: { terms: true },
      }),
      prisma.menu.findMany({
        where: { siteId: site.id },
        include: { items: true },
      }),
      prisma.setting.findMany({
        where: { siteId: site.id },
      }),
    ]);

    const exportBundle = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      site: {
        name: site.name,
        slug: site.slug,
        defaultLocale: site.defaultLocale,
      },
      contentTypes,
      contentEntries,
      taxonomies,
      menus,
      settings,
    };

    return NextResponse.json(exportBundle, {
      headers: {
        'Content-Disposition': `attachment; filename="${site.slug}-export-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error('[ExportGET] Error:', err);
    return NextResponse.json({ error: 'Failed to export site data' }, { status: 500 });
  }
}
