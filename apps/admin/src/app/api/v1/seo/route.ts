import { prisma } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

let fallbackSeoSettings = {
  metaTitleTemplate: '%s | Markup Digital Platform',
  defaultMetaTitle: 'Markup Digital Portal',
  defaultMetaDescription: 'Enterprise Headless CMS powered by Next.js and high-performance edge delivery.',
  canonicalDomain: 'http://localhost:3000',
  defaultOgImage: '',
  twitterCardType: 'summary_large_image',
  robotsIndexing: 'index, follow',
  googleSiteVerification: '',
};

export async function GET(req: NextRequest) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;
  try {
    const site = await withTimeout(prisma.site.findFirst());
    if (!site) {
      return NextResponse.json({
        siteId: 'site_default_01',
        siteName: 'Markup Digital Portal',
        domain: 'http://localhost:3000',
        seo: fallbackSeoSettings,
      });
    }

    const settings = (site.settings as Record<string, any>) || {};
    const seo = settings.seo || fallbackSeoSettings;

    return NextResponse.json({
      siteId: site.id,
      siteName: site.name,
      domain: site.domain,
      seo,
    });
  } catch (error: any) {
    return NextResponse.json({
      siteId: 'site_default_01',
      siteName: 'Markup Digital Portal',
      domain: 'http://localhost:3000',
      seo: fallbackSeoSettings,
    });
  }
}

export async function PATCH(req: NextRequest) {
  const sec = await guard(req, { permission: 'seo.manage' });
  if (!sec.ok) return sec.response;
  let body: any = {};
  try {
    body = await req.json();
    const site = await withTimeout(prisma.site.findFirst());
    if (!site) {
      if (body.seo) fallbackSeoSettings = { ...fallbackSeoSettings, ...body.seo };
      return NextResponse.json({
        success: true,
        site: { id: 'site_default_01', name: 'Markup Digital Portal', settings: { seo: fallbackSeoSettings } },
      });
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
    if (body.seo) fallbackSeoSettings = { ...fallbackSeoSettings, ...body.seo };
    return NextResponse.json({
      success: true,
      site: { id: 'site_default_01', name: 'Markup Digital Portal', settings: { seo: fallbackSeoSettings } },
    });
  }
}

export const PUT = PATCH;
