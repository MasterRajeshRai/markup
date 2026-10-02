import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'redirects.manage');
    if (!guard.authorized) return guard.response!;

    const existing = await prisma.redirect.findFirst({
      where: { siteId: site.id, id },
    });

    if (!existing) return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });

    await prisma.redirect.delete({ where: { id } });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'redirect.delete',
      entityType: 'Redirect',
      entityId: id,
      metadata: { sourceUrl: existing.sourceUrl },
      req,
    });

    return NextResponse.json({ success: true, message: 'Redirect rule deleted' });
  } catch (err) {
    console.error('[RedirectsDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete redirect' }, { status: 500 });
  }
}
