import { buildRobotsTxt } from '@headless/core';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const baseUrl = site?.domain ? `https://${site.domain}` : 'http://localhost:3000';

    const robots = buildRobotsTxt({
      sitemapUrl: `${baseUrl}/sitemap.xml`,
      disallowPaths: ['/admin', '/api/v1/auth', '/api/v1/users'],
    });

    return new NextResponse(robots, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (err) {
    return new NextResponse('User-agent: *\nAllow: /', { headers: { 'Content-Type': 'text/plain' } });
  }
}
