import { prisma, EntryStatus } from '@headless/database';
import { buildXmlSitemap } from '@headless/core';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return new NextResponse('Site not found', { status: 404 });

    const entries = await prisma.contentEntry.findMany({
      where: {
        siteId: site.id,
        status: EntryStatus.PUBLISHED,
      },
      include: { contentType: true },
      orderBy: { updatedAt: 'desc' },
    });

    const baseUrl = site.domain ? `https://${site.domain}` : 'http://localhost:3000';

    const sitemapEntries = entries.map((e) => {
      const pathPrefix = e.contentType.slug === 'pages' ? '' : `/${e.contentType.slug}`;
      const slugPath = e.slug === 'home' ? '' : `/${e.slug}`;
      const url = `${baseUrl}${pathPrefix}${slugPath}` || baseUrl;

      return {
        loc: url,
        lastmod: e.updatedAt.toISOString().split('T')[0],
        changefreq: (e.slug === 'home' ? 'daily' : 'weekly') as any,
        priority: e.slug === 'home' ? 1.0 : 0.8,
      };
    });

    const xml = buildXmlSitemap(sitemapEntries);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('[SitemapGET] Error:', err);
    return new NextResponse('Internal error generating sitemap', { status: 500 });
  }
}
