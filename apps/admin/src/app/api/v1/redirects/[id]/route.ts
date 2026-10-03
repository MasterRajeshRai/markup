import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { fallbackRedirects } from '../fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);

    try {
      const redirect = await prisma.redirect.findFirst({
        where: { id, siteId: site?.id || 'site_default_01' },
      });
      if (redirect) return NextResponse.json({ data: redirect });
    } catch {
      // In-memory fallback
    }

    const fallback = fallbackRedirects.find((r) => r.id === id);
    if (fallback) return NextResponse.json({ data: fallback });

    return NextResponse.json({ error: 'Redirect rule not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch redirect' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    const adminSession = await getAdminSession(req);
    if (adminSession) {
      const guard = requirePermission(adminSession, 'redirects.manage');
      if (!guard.authorized) return guard.response!;
    }

    const body = await req.json();
    const { sourceUrl, destinationUrl, statusCode, notes, isActive } = body;

    try {
      const updated = await prisma.redirect.update({
        where: { id },
        data: {
          ...(sourceUrl && { sourceUrl }),
          ...(destinationUrl && { destinationUrl }),
          ...(statusCode && { statusCode: parseInt(String(statusCode), 10) }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      await recordAuditLog({
        actorId: adminSession?.user?.id,
        action: 'redirect.update',
        entityType: 'Redirect',
        entityId: id,
        metadata: { sourceUrl, destinationUrl, statusCode },
        req,
      }).catch(() => {});

      return NextResponse.json({ success: true, redirect: updated });
    } catch {
      // In-memory fallback
      const idx = fallbackRedirects.findIndex((r) => r.id === id);
      if (idx !== -1) {
        fallbackRedirects[idx] = {
          ...fallbackRedirects[idx],
          ...(sourceUrl && { sourceUrl }),
          ...(destinationUrl && { destinationUrl }),
          ...(statusCode && { statusCode: parseInt(String(statusCode), 10) }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
        };
        return NextResponse.json({ success: true, redirect: fallbackRedirects[idx] });
      }
      return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update redirect' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = await getAdminSession(req);
    if (adminSession) {
      const guard = requirePermission(adminSession, 'redirects.manage');
      if (!guard.authorized) return guard.response!;
    }

    try {
      await prisma.redirect.delete({
        where: { id },
      });

      await recordAuditLog({
        actorId: adminSession?.user?.id,
        action: 'redirect.delete',
        entityType: 'Redirect',
        entityId: id,
        req,
      }).catch(() => {});

      return NextResponse.json({ success: true, message: 'Redirect rule deleted' });
    } catch {
      // In-memory fallback
      const idx = fallbackRedirects.findIndex((r) => r.id === id);
      if (idx !== -1) {
        fallbackRedirects.splice(idx, 1);
        return NextResponse.json({ success: true, message: 'Redirect rule deleted' });
      }
      return NextResponse.json({ error: 'Redirect rule not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete redirect' }, { status: 500 });
  }
}
