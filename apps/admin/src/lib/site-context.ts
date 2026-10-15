import { prisma, type Site } from '@markup/database';
import { NextRequest } from 'next/server';

export const MEDIABIRD_SITE: Site = {
  id: 'site_mediabird_03',
  name: 'Media Bird Magazine',
  slug: 'mediabird',
  domain: 'https://www.mediabirdmag.com',
  defaultLocale: 'en-US',
  isDefault: true,
  branding: { primaryColor: '#ef4444' },
  settings: { site_title: 'Media Bird Magazine', tagline: 'Telling It Slow, Saying It Right!' },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const DEFAULT_SITE: Site = MEDIABIRD_SITE;

/**
 * Resolves the active Site context based on:
 * 1. X-Site-Slug or X-Site-Id header
 * 2. Host header / domain mapping
 * 3. Default site fallback
 * 4. In-memory fallback if database server is offline or unreachable
 */
export async function resolveSiteContext(req?: NextRequest | Request): Promise<Site | null> {
  let siteSlug: string | null = null;
  let host: string | null = null;

  if (req) {
    if (req.headers instanceof Headers) {
      siteSlug = req.headers.get('x-site-slug') || req.headers.get('x-site-id');
      host = req.headers.get('host');

      // Check cookie header if siteSlug not present in header
      if (!siteSlug) {
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/markup_site_slug=([^;]+)/);
        if (match) {
          siteSlug = decodeURIComponent(match[1]);
        }
      }
    }

    // Check NextRequest searchParams or URL query params
    if (!siteSlug && 'nextUrl' in req && (req as NextRequest).nextUrl) {
      siteSlug = (req as NextRequest).nextUrl.searchParams.get('site') ||
                 (req as NextRequest).nextUrl.searchParams.get('siteSlug') ||
                 (req as NextRequest).nextUrl.searchParams.get('site_slug');
    }

    // Check NextRequest cookies
    if (!siteSlug && 'cookies' in req && (req as any).cookies?.get) {
      siteSlug = (req as any).cookies.get('markup_site_slug')?.value || null;
    }
  }

  try {
    const resolvePromise = async () => {
      // 1. By slug or ID
      if (siteSlug) {
        const site = await prisma.site.findFirst({
          where: {
            OR: [{ slug: siteSlug }, { id: siteSlug }],
          },
        });
        if (site) return site;
      }

      // 2. By domain
      if (host) {
        const cleanHost = host.split(':')[0]; // strip port
        const site = await prisma.site.findFirst({
          where: {
            OR: [{ domain: host }, { domain: cleanHost }],
          },
        });
        if (site) return site;
      }

      // 3. Fallback to default site
      let defaultSite = await prisma.site.findFirst({
        where: { isDefault: true },
      });

      if (!defaultSite) {
        defaultSite = await prisma.site.findFirst({
          orderBy: { createdAt: 'asc' },
        });
      }

      return defaultSite || (siteSlug === 'mediabird' ? MEDIABIRD_SITE : DEFAULT_SITE);
    };

    const timeoutPromise = new Promise<Site>((_, reject) =>
      setTimeout(() => reject(new Error('Site Context DB Timeout')), 600)
    );

    return await Promise.race([resolvePromise(), timeoutPromise]);
  } catch (err: any) {
    // Graceful offline fallback: Media Bird Magazine is the connected client site
    return MEDIABIRD_SITE;
  }
}
