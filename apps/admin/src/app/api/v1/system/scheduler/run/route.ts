import { runScheduledTasks } from '@/lib/scheduler';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.JWT_SECRET || 'scheduler-secret';

    // Simple secret token check for cron runners
    if (authHeader && authHeader.replace('Bearer ', '') === secret) {
      const result = await runScheduledTasks();
      return NextResponse.json({ success: true, result });
    }

    const result = await runScheduledTasks();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[SchedulerRunPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to run scheduler tasks' }, { status: 500 });
  }
}
