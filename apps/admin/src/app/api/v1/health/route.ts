import { prisma } from '@headless/database';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
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
