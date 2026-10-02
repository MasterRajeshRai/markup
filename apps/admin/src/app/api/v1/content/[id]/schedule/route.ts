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
    const guard = requirePermission(adminSession, 'content.schedule');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { scheduledPublishAt, scheduledUnpublishAt } = body;

    if (!scheduledPublishAt) {
      return NextResponse.json({ error: 'scheduledPublishAt date is required' }, { status: 400 });
    }

    const publishDate = new Date(scheduledPublishAt);
    if (isNaN(publishDate.getTime()) || publishDate <= new Date()) {
      return NextResponse.json({ error: 'scheduledPublishAt must be a valid future date' }, { status: 400 });
    }

    const updated = await prisma.contentEntry.update({
      where: { id },
      data: {
        status: EntryStatus.SCHEDULED,
        scheduledPublishAt: publishDate,
        scheduledUnpublishAt: scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null,
      },
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'content.schedule',
      entityType: 'ContentEntry',
      entityId: id,
      metadata: { scheduledPublishAt: publishDate.toISOString() },
      req,
    });

    dispatchWebhooks({
      siteId: site.id,
      event: 'content.scheduled',
      payload: {
        id: updated.id,
        slug: updated.slug,
        scheduledPublishAt: publishDate.toISOString(),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, entry: updated });
  } catch (err) {
    console.error('[SchedulePOST] Error:', err);
    return NextResponse.json({ error: 'Failed to schedule entry' }, { status: 500 });
  }
}
