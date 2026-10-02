import { prisma, EntryStatus } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'content.publish');
    if (!guard.authorized) return guard.response!;

    const entry = await prisma.contentEntry.findFirst({
      where: { siteId: site.id, id },
    });

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    const updated = await prisma.contentEntry.update({
      where: { id },
      data: {
        status: EntryStatus.DRAFT,
      },
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'content.unpublish',
      entityType: 'ContentEntry',
      entityId: id,
      metadata: { title: entry.title, slug: entry.slug },
      req,
    });

    dispatchWebhooks({
      siteId: site.id,
      event: 'content.unpublished',
      payload: { id: updated.id, slug: updated.slug },
    }).catch(() => {});

    return NextResponse.json({ success: true, entry: updated });
  } catch (err) {
    console.error('[UnpublishPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to unpublish entry' }, { status: 500 });
  }
}
