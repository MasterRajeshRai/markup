import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';

export interface NotificationItem {
  id: string;
  category: 'workflow' | 'comment' | 'system' | 'publishing';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  actionLabel?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}

let MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    category: 'workflow',
    title: 'Review Requested',
    message: 'Sarah Jenkins submitted "Next.js 15 Server Components Deep Dive" for editorial review.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    read: false,
    link: '/admin/content/articles/art_review_1',
    actionLabel: 'Review Draft',
    actor: { name: 'Sarah Jenkins' },
  },
  {
    id: 'notif_2',
    category: 'comment',
    title: 'New Comment Awaiting Moderation',
    message: 'Marcus Chen left a comment on "Getting Started with Modern Headless Architecture".',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    read: false,
    link: '/admin/comments',
    actionLabel: 'Moderate',
    actor: { name: 'Marcus Chen' },
  },
  {
    id: 'notif_3',
    category: 'publishing',
    title: 'Scheduled Article Published',
    message: '"State of Headless CMS 2026 Report" was automatically published at 00:00 UTC.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    read: false,
    link: '/admin/publishing',
    actionLabel: 'View Queue',
  },
  {
    id: 'notif_4',
    category: 'system',
    title: 'Media Temp Storage Cleaned',
    message: 'Zero-retention daemon purged 14 orphaned temporary upload files (18.4 MB reclaimed).',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    read: true,
    link: '/admin/media',
    actionLabel: 'DAM',
  },
  {
    id: 'notif_5',
    category: 'workflow',
    title: 'Revision Snapshot Restored',
    message: 'Elena Rostova restored revision snapshot v4 for "Enterprise Cloud Architecture".',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
    read: true,
    link: '/admin/revisions',
    actionLabel: 'Audit Logs',
    actor: { name: 'Elena Rostova' },
  },
];

export async function GET(request: NextRequest) {
  const sec = await guard(request, {});
  if (!sec.ok) return sec.response;
  return NextResponse.json({
    success: true,
    notifications: MOCK_NOTIFICATIONS,
    unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
  });
}

export async function POST(req: NextRequest) {
  const sec = await guard(req, {});
  if (!sec.ok) return sec.response;
  try {
    const body = await req.json();
    const { action, id } = body;

    if (action === 'mark_all_read') {
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) => ({ ...n, read: true }));
      return NextResponse.json({ success: true, notifications: MOCK_NOTIFICATIONS, unreadCount: 0 });
    }

    if (action === 'mark_read' && id) {
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return NextResponse.json({
        success: true,
        notifications: MOCK_NOTIFICATIONS,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
      });
    }

    if (action === 'clear_all') {
      MOCK_NOTIFICATIONS = [];
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}
