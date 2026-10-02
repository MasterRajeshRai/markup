import { prisma, EntryStatus } from '@headless/database';
import { dispatchWebhooks } from './webhooks';

/**
 * Runs scheduled jobs: publishes due content, archives expired content
 */
export async function runScheduledTasks(): Promise<{ publishedCount: number; unpublishedCount: number }> {
  const now = new Date();
  let publishedCount = 0;
  let unpublishedCount = 0;

  try {
    // 1. Process entries scheduled for publishing
    const dueForPublish = await prisma.contentEntry.findMany({
      where: {
        status: EntryStatus.SCHEDULED,
        scheduledPublishAt: { lte: now },
      },
    });

    for (const entry of dueForPublish) {
      await prisma.contentEntry.update({
        where: { id: entry.id },
        data: {
          status: EntryStatus.PUBLISHED,
          publishedAt: now,
        },
      });
      publishedCount++;

      // Dispatch webhook
      dispatchWebhooks({
        siteId: entry.siteId,
        event: 'content.published',
        payload: {
          id: entry.id,
          slug: entry.slug,
          contentTypeId: entry.contentTypeId,
          publishedAt: now.toISOString(),
        },
      }).catch(() => {});
    }

    // 2. Process entries scheduled for unpublishing / expiration
    const dueForUnpublish = await prisma.contentEntry.findMany({
      where: {
        status: EntryStatus.PUBLISHED,
        OR: [
          { scheduledUnpublishAt: { lte: now } },
          { expiresAt: { lte: now } },
        ],
      },
    });

    for (const entry of dueForUnpublish) {
      await prisma.contentEntry.update({
        where: { id: entry.id },
        data: {
          status: EntryStatus.ARCHIVED,
        },
      });
      unpublishedCount++;

      dispatchWebhooks({
        siteId: entry.siteId,
        event: 'content.unpublished',
        payload: {
          id: entry.id,
          slug: entry.slug,
          contentTypeId: entry.contentTypeId,
          archivedAt: now.toISOString(),
        },
      }).catch(() => {});
    }

    // 3. Clean expired sessions
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  } catch (err) {
    console.error('[Scheduler] Error running background tasks:', err);
  }

  return { publishedCount, unpublishedCount };
}
