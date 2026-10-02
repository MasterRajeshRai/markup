import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'sites.manage');
    if (!guard.authorized) return guard.response!;

    const sites = await prisma.site.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        locales: true,
        _count: {
          select: { contentEntries: true, contentTypes: true, media: true },
        },
      },
    });

    return NextResponse.json({ data: sites });
  } catch (err) {
    console.error('[SitesGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve sites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'sites.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, slug, domain, defaultLocale = 'en-US', branding = {}, settings = {} } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Site name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    const site = await prisma.$transaction(async (tx) => {
      const created = await tx.site.create({
        data: {
          name,
          slug: cleanSlug,
          domain: domain || null,
          defaultLocale,
          branding: branding as Prisma.InputJsonValue,
          settings: settings as Prisma.InputJsonValue,
        },
      });

      // Create default locale
      await tx.locale.create({
        data: {
          siteId: created.id,
          code: defaultLocale,
          name: defaultLocale,
          isDefault: true,
        },
      });

      return created;
    });

    await recordAuditLog({
      actorId: adminSession?.user.id,
      action: 'site.create',
      entityType: 'Site',
      entityId: site.id,
      metadata: { name, slug: cleanSlug, domain },
      req,
    });

    return NextResponse.json({ success: true, site }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A site with this slug or domain already exists.' }, { status: 409 });
    }
    console.error('[SitesPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}
