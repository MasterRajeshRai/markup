import { prisma, EntryStatus } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';
import { runScheduledTasks } from '@/lib/scheduler';
import { dispatchWebhooks } from '@/lib/webhooks';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    const siteWhere = siteId ? { siteId } : {};

    const [scheduled, pendingReview, published, archived] = await Promise.all([
      prisma.contentEntry.findMany({
        where: {
          ...siteWhere,
          status: EntryStatus.SCHEDULED,
        },
        include: {
          contentType: { select: { name: true, slug: true } },
          author: { select: { name: true, email: true } },
        },
        orderBy: { scheduledPublishAt: 'asc' },
      }),
      prisma.contentEntry.findMany({
        where: {
          ...siteWhere,
          status: EntryStatus.IN_REVIEW,
        },
        include: {
          contentType: { select: { name: true, slug: true } },
          author: { select: { name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.contentEntry.findMany({
        where: {
          ...siteWhere,
          status: EntryStatus.PUBLISHED,
          OR: [
            { scheduledUnpublishAt: { not: null } },
            { expiresAt: { not: null } },
          ],
        },
        include: {
          contentType: { select: { name: true, slug: true } },
          author: { select: { name: true, email: true } },
        },
        orderBy: { scheduledUnpublishAt: 'asc' },
      }),
      prisma.contentEntry.findMany({
        where: {
          ...siteWhere,
          status: EntryStatus.ARCHIVED,
        },
        include: {
          contentType: { select: { name: true, slug: true } },
          author: { select: { name: true, email: true } },
        },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      scheduled,
      pendingReview,
      expiring: published,
      archived,
      counts: {
        scheduled: scheduled.length,
        pendingReview: pendingReview.length,
        expiring: published.length,
        archived: archived.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch publishing queue' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entryIds = [], scheduledPublishAt, scheduledUnpublishAt } = body;

    if (action === 'trigger_scheduler') {
      const result = await runScheduledTasks();
      return NextResponse.json({ success: true, message: 'Scheduler triggered successfully', result });
    }

    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json({ error: 'entryIds array is required' }, { status: 400 });
    }

    const now = new Date();

    switch (action) {
      case 'batch_publish': {
        await prisma.contentEntry.updateMany({
          where: { id: { in: entryIds } },
          data: {
            status: EntryStatus.PUBLISHED,
            publishedAt: now,
          },
        });
        return NextResponse.json({ success: true, count: entryIds.length });
      }
      case 'batch_unpublish': {
        await prisma.contentEntry.updateMany({
          where: { id: { in: entryIds } },
          data: {
            status: EntryStatus.DRAFT,
          },
        });
        return NextResponse.json({ success: true, count: entryIds.length });
      }
      case 'batch_archive': {
        await prisma.contentEntry.updateMany({
          where: { id: { in: entryIds } },
          data: {
            status: EntryStatus.ARCHIVED,
          },
        });
        return NextResponse.json({ success: true, count: entryIds.length });
      }
      case 'schedule': {
        await prisma.contentEntry.updateMany({
          where: { id: { in: entryIds } },
          data: {
            status: EntryStatus.SCHEDULED,
            scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
            scheduledUnpublishAt: scheduledUnpublishAt ? new Date(scheduledUnpublishAt) : null,
          },
        });
        return NextResponse.json({ success: true, count: entryIds.length });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process publishing action' }, { status: 500 });
  }
}
