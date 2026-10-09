import { searchCms } from '@/lib/search';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.publicSearch });
  if (!sec.ok) return sec.response;
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const q = req.nextUrl.searchParams.get('q') || '';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    const results = await searchCms(site.id, q, limit);

    return NextResponse.json({
      query: q,
      results,
    });
  } catch (err) {
    console.error('[SearchGET] Error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
