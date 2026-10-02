import { cleanStaleTempFiles } from '@headless/core/server';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'media.delete');
    if (!guard.authorized) return guard.response!;

    const body = await req.json().catch(() => ({}));
    const maxAgeMinutes = body.maxAgeMinutes ? Number(body.maxAgeMinutes) : 60;

    const report = await cleanStaleTempFiles(undefined, maxAgeMinutes);

    return NextResponse.json({
      success: true,
      message: `Cleaned ${report.deletedCount} stale temporary files (${(report.freedBytes / (1024 * 1024)).toFixed(2)} MB freed)`,
      report,
    });
  } catch (err) {
    console.error('[MediaCleanupPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to run temporary file cleanup' }, { status: 500 });
  }
}
