import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const menus = await prisma.menu.findMany({
      where: { siteId: site.id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ data: menus });
  } catch (err) {
    console.error('[NavigationGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve menus' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'navigation.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, slug, description, location } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: {
        siteId: site.id,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        description,
        location,
      },
    });

    return NextResponse.json({ success: true, menu }, { status: 201 });
  } catch (err) {
    console.error('[NavigationPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}
