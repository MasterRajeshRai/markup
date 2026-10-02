import { prisma, type Site } from '@headless/database';
import { NextRequest } from 'next/server';

export const DEFAULT_SITE: Site = {
  id: 'site_default_01',
  name: 'Headless CMS Default Site',
  slug: 'default',
  domain: 'localhost',
  defaultLocale: 'en-US',
  isDefault: true,
  branding: {},
  settings: {},
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

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
    }
  }

  try {
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

    return defaultSite || DEFAULT_SITE;
  } catch (err: any) {
    // Graceful offline fallback: allows local execution without requiring a live Postgres daemon
    return DEFAULT_SITE;
  }
}
