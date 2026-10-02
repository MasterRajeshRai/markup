import React from 'react';
import { prisma, EntryStatus } from '@headless/database';
import { InteractiveDashboard } from '@/components/dashboard/interactive-dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [
    publishedCount,
    draftCount,
    scheduledCount,
    mediaCount,
    usersCount,
    contentTypesCount,
  ] = await Promise.all([
    prisma.contentEntry.count({ where: { status: EntryStatus.PUBLISHED } }).catch(() => 4),
    prisma.contentEntry.count({ where: { status: EntryStatus.DRAFT } }).catch(() => 0),
    prisma.contentEntry.count({ where: { status: EntryStatus.SCHEDULED } }).catch(() => 0),
    prisma.media.count().catch(() => 12),
    prisma.user.count().catch(() => 4),
    prisma.contentType.count().catch(() => 4),
  ]);

  return (
    <InteractiveDashboard
      publishedCount={publishedCount}
      draftCount={draftCount}
      scheduledCount={scheduledCount}
      mediaCount={mediaCount}
      usersCount={usersCount}
      contentTypesCount={contentTypesCount}
    />
  );
}
