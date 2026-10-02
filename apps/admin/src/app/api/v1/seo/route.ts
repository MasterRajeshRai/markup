import { prisma } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const site = await prisma.site.findFirst();
    if (!site) {
      return NextResponse.json({ error: 'No site found' }, { status: 404 });
    }

    const settings = (site.settings as Record<string, any>) || {};
    const seo = settings.seo || {
      metaTitleTemplate: '%s | Enterprise Platform',
      defaultMetaTitle: site.name,
      defaultMetaDescription: 'Enterprise Headless CMS powered by Next.js 16 and PostgreSQL 18.',
      canonicalDomain: site.domain || 'https://example.com',
      defaultOgImage: '',
      twitterCardType: 'summary_large_image',
      robotsIndexing: 'index, follow',
      googleSiteVerification: '',
    };

    return NextResponse.json({
      siteId: site.id,
      siteName: site.name,
      domain: site.domain,
      seo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch SEO settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const site = await prisma.site.findFirst();
    if (!site) {
      return NextResponse.json({ error: 'No site found' }, { status: 404 });
    }

    const currentSettings = (site.settings as Record<string, any>) || {};
    const updatedSettings = {
      ...currentSettings,
      seo: {
        ...(currentSettings.seo || {}),
        ...body.seo,
      },
    };

    const updatedSite = await prisma.site.update({
      where: { id: site.id },
      data: {
        settings: updatedSettings,
      },
    });

    return NextResponse.json({ success: true, site: updatedSite });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update SEO settings' }, { status: 500 });
  }
}
