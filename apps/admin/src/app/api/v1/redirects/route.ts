import { prisma } from '@headless/database';
import { validateRedirect } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const redirects = await prisma.redirect.findMany({
      where: { siteId: site.id },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: redirects });
  } catch (err) {
    console.error('[RedirectsGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve redirects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'redirects.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { sourceUrl, destinationUrl, statusCode = 301, notes } = body;

    if (!sourceUrl || !destinationUrl) {
      return NextResponse.json({ error: 'sourceUrl and destinationUrl are required' }, { status: 400 });
    }

    // 1. Fetch existing redirects for cycle detection
    const existing = await prisma.redirect.findMany({
      where: { siteId: site.id, isActive: true },
      select: { sourceUrl: true, destinationUrl: true },
    });

    // 2. Validate redirect and detect loops
    const validation = validateRedirect(sourceUrl, destinationUrl, existing);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const redirect = await prisma.redirect.create({
      data: {
        siteId: site.id,
        sourceUrl: sourceUrl.trim(),
        destinationUrl: destinationUrl.trim(),
        statusCode: parseInt(String(statusCode), 10) || 301,
        notes,
        createdById: adminSession?.user.id,
      },
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'redirect.create',
      entityType: 'Redirect',
      entityId: redirect.id,
      metadata: { sourceUrl, destinationUrl, statusCode },
      req,
    });

    return NextResponse.json({ success: true, redirect }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A redirect rule for this source URL already exists.' }, { status: 409 });
    }
    console.error('[RedirectsPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create redirect' }, { status: 500 });
  }
}
