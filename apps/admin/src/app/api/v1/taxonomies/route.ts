import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const taxonomies = await prisma.taxonomy.findMany({
      where: { siteId: site.id },
      include: {
        terms: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { entries: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: taxonomies });
  } catch (err) {
    console.error('[TaxonomiesGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve taxonomies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'taxonomy.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { type, taxonomyId, name, slug, description, isHierarchical = false, appliesTo = [] } = body;

    // Creating a term under a taxonomy
    if (type === 'term') {
      if (!taxonomyId || !name || !slug) {
        return NextResponse.json({ error: 'taxonomyId, name, and slug are required for term' }, { status: 400 });
      }

      const term = await prisma.taxonomyTerm.create({
        data: {
          taxonomyId,
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
          description,
        },
      });

      return NextResponse.json({ success: true, term }, { status: 201 });
    }

    // Creating a taxonomy
    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const taxonomy = await prisma.taxonomy.create({
      data: {
        siteId: site.id,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        description,
        isHierarchical: Boolean(isHierarchical),
        appliesTo: appliesTo as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, taxonomy }, { status: 201 });
  } catch (err) {
    console.error('[TaxonomiesPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create taxonomy or term' }, { status: 500 });
  }
}
