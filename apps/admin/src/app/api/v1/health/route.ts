import { prisma } from '@headless/database';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { public: true, rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
  });
}
