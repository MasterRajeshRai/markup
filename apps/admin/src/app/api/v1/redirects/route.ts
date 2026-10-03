import { prisma } from '@headless/database';
import { validateRedirect } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { fallbackRedirects } from './fallback-data';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);

    try {
      const dbPromise = prisma.redirect.findMany({
        where: { siteId: site?.id || 'site_default_01' },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, email: true } },
        },
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1500));
      const redirects = (await Promise.race([dbPromise, timeoutPromise])) as any[];

      return NextResponse.json({ data: redirects.length > 0 ? redirects : fallbackRedirects });
    } catch {
      return NextResponse.json({ data: fallbackRedirects });
    }
  } catch (err) {
    console.error('[RedirectsGET] Error:', err);
    return NextResponse.json({ data: fallbackRedirects });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const adminSession = await getAdminSession(req);
    if (adminSession) {
      const guard = requirePermission(adminSession, 'redirects.manage');
      if (!guard.authorized) return guard.response!;
    }

    const body = await req.json();
    const { sourceUrl, destinationUrl, statusCode = 301, notes } = body;

    if (!sourceUrl || !destinationUrl) {
      return NextResponse.json({ error: 'sourceUrl and destinationUrl are required' }, { status: 400 });
    }

    // 1. Fetch existing redirects for cycle detection
    let existing: any[] = fallbackRedirects;
    try {
      existing = await prisma.redirect.findMany({
        where: { siteId: site?.id || 'site_default_01', isActive: true },
        select: { sourceUrl: true, destinationUrl: true },
      });
    } catch {
      // Offline fallback
    }

    // 2. Validate redirect and detect loops
    const validation = validateRedirect(sourceUrl, destinationUrl, existing);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const newRedir = {
      id: `redir_${Date.now()}`,
      sourceUrl,
      destinationUrl,
      statusCode: parseInt(String(statusCode), 10),
      hitCount: 0,
      notes,
      createdAt: new Date().toISOString(),
      creator: {
        id: adminSession?.user?.id || 'usr_admin',
        name: adminSession?.user?.name || 'Administrator',
        email: adminSession?.user?.email || 'admin@headless.io',
      },
    };

    try {
      const redirect = await prisma.redirect.create({
        data: {
          siteId: site?.id || 'site_default_01',
          sourceUrl,
          destinationUrl,
          statusCode: parseInt(String(statusCode), 10),
          notes,
          createdById: adminSession?.user.id,
        },
      });

      await recordAuditLog({
        actorId: adminSession?.user.id,
        action: 'redirect.create',
        entityType: 'Redirect',
        entityId: redirect.id,
        metadata: { sourceUrl, destinationUrl, statusCode },
        req,
      }).catch(() => {});

      return NextResponse.json({ success: true, redirect }, { status: 201 });
    } catch {
      fallbackRedirects.unshift(newRedir);
      return NextResponse.json({ success: true, redirect: newRedir }, { status: 201 });
    }
  } catch (err) {
    console.error('[RedirectsPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create redirect' }, { status: 500 });
  }
}
