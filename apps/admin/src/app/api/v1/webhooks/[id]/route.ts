import { prisma } from '@headless/database';
import { executeWebhookDelivery } from '@/lib/webhooks';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'webhooks.manage');
    if (!guard.authorized) return guard.response!;

    const webhook = await prisma.webhook.findFirst({
      where: { siteId: site.id, id },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!webhook) return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });

    return NextResponse.json({ data: webhook });
  } catch (err) {
    console.error('[WebhookDetailGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve webhook' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'webhooks.manage');
    if (!guard.authorized) return guard.response!;

    await prisma.webhook.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Webhook deleted' });
  } catch (err) {
    console.error('[WebhookDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}
