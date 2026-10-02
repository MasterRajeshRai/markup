import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'webhooks.manage');
    if (!guard.authorized) return guard.response!;

    const webhooks = await prisma.webhook.findMany({
      where: { siteId: site.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { deliveries: true } },
      },
    });

    return NextResponse.json({
      data: webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        events: w.events,
        isActive: w.isActive,
        retryCount: w.retryCount,
        deliveriesCount: w._count.deliveries,
        createdAt: w.createdAt,
      })),
    });
  } catch (err) {
    console.error('[WebhooksGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve webhooks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'webhooks.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, url, events = ['content.published'], secret, headers = {}, retryCount = 3 } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL format' }, { status: 400 });
    }

    const signingSecret = secret || crypto.randomBytes(24).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        siteId: site.id,
        name,
        url,
        secret: signingSecret,
        events: events as Prisma.InputJsonValue,
        headers: headers as Prisma.InputJsonValue,
        retryCount: parseInt(String(retryCount), 10) || 3,
        isActive: true,
      },
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'webhook.create',
      entityType: 'Webhook',
      entityId: webhook.id,
      metadata: { name, url, events },
      req,
    });

    return NextResponse.json({ success: true, webhook }, { status: 201 });
  } catch (err) {
    console.error('[WebhooksPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}
