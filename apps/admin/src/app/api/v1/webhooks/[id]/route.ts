import { prisma } from '@headless/database';
import { executeWebhookDelivery } from '@/lib/webhooks';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { fallbackWebhooks } from '../route';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

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

    try {
      const webhook = await withTimeout(
        prisma.webhook.findFirst({
          where: { siteId: site.id, id },
          include: {
            deliveries: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        }),
        1500
      );

      if (webhook) return NextResponse.json({ data: webhook });
    } catch {
      // Fallback to in-memory
    }

    const fallback = fallbackWebhooks.find((w) => w.id === id);
    if (fallback) {
      return NextResponse.json({
        data: {
          ...fallback,
          deliveries: [],
        },
      });
    }

    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
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

    try {
      await withTimeout(prisma.webhook.delete({ where: { id } }), 1500);
    } catch {
      const idx = fallbackWebhooks.findIndex((w) => w.id === id);
      if (idx !== -1) {
        fallbackWebhooks.splice(idx, 1);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook deleted' });
  } catch (err) {
    console.error('[WebhookDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}

