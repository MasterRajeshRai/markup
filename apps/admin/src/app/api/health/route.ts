import { NextResponse } from 'next/server';
import { prisma } from '@headless/database';
import type { NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { public: true, rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;
  try {
    let dbStatus = 'healthy';
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
      ]);
    } catch {
      dbStatus = 'degraded';
    }

    return NextResponse.json({
      status: 'ok',
      service: 'markup-admin',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', error: err?.message || 'Health check failed' },
      { status: 500 }
    );
  }
}
