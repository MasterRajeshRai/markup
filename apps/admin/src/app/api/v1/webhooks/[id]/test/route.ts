import { prisma } from '@headless/database';
import { executeWebhookDelivery } from '@/lib/webhooks';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
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
    const guard = requirePermission(adminSession, 'webhooks.manage');
    if (!guard.authorized) return guard.response!;

    const webhook = await prisma.webhook.findFirst({
      where: { siteId: site.id, id },
    });

    if (!webhook) return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });

    const mockPayload = {
      test: true,
      message: 'This is a test webhook payload triggered from the admin dashboard.',
      siteSlug: site.slug,
      timestamp: new Date().toISOString(),
    };

    const success = await executeWebhookDelivery(
      webhook.id,
      webhook.url,
      webhook.secret,
      'webhook.test',
      mockPayload,
      1
    );

    // Fetch the delivery log that was just created
    const delivery = await prisma.webhookDelivery.findFirst({
      where: { webhookId: webhook.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success,
      delivery,
    });
  } catch (err) {
    console.error('[WebhookTestPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to test webhook' }, { status: 500 });
  }
}
