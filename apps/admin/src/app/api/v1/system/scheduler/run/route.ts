import { runScheduledTasks } from '@/lib/scheduler';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { safeEqual } from '@headless/core';
import { rateLimit } from '@/lib/security/rate-limit';
import { getClientIp } from '@/lib/security/client-ip';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = await rateLimit({ name: 'cron_run', limit: 12, windowMs: 60_000 }, ip);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const authHeader = req.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    const cronSecret = process.env.CRON_SECRET || (process.env.NODE_ENV !== 'production' ? 'scheduler-secret' : null);

    // 1. Authorized via CRON_SECRET bearer token
    if (bearer && cronSecret && safeEqual(bearer, cronSecret)) {
      const result = await runScheduledTasks();
      return NextResponse.json({ success: true, triggeredBy: 'cron_token', result });
    }

    // 2. Or authorized via authenticated admin session with settings.manage permission
    const session = await getAdminSession(req);
    if (session) {
      const check = requirePermission(session, 'settings.manage');
      if (check.authorized) {
        const result = await runScheduledTasks();
        return NextResponse.json({ success: true, triggeredBy: session.user.email, result });
      }
      return check.response!;
    }

    return NextResponse.json(
      { error: 'Unauthorized: Valid CRON_SECRET bearer token or admin session with settings.manage is required.' },
      { status: 401 }
    );
  } catch (err) {
    console.error('[SchedulerRunPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to run scheduler tasks' }, { status: 500 });
  }
}
