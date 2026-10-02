import { prisma } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
    // Test PostgreSQL database connectivity & query latency
    const dbTest = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version();`;
    const dbLatencyMs = Date.now() - startTime;

    // Fetch entity counts
    const [entriesCount, mediaCount, variantsCount, usersCount, jobsCount] = await Promise.all([
      prisma.contentEntry.count(),
      prisma.media.count(),
      prisma.mediaVariant.count(),
      prisma.user.count(),
      prisma.mediaProcessingJob.count(),
    ]);

    const memory = process.memoryUsage();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: dbLatencyMs,
        version: dbTest?.[0]?.version || 'PostgreSQL 18',
        tables: {
          contentEntries: entriesCount,
          mediaAssets: mediaCount,
          mediaVariants: variantsCount,
          users: usersCount,
          processingJobs: jobsCount,
        },
      },
      storage: {
        driver: process.env.R2_SECRET_ACCESS_KEY ? 'Cloudflare R2 (Live)' : 'Cloudflare R2 Mock Driver',
        bucket: process.env.R2_BUCKET_NAME || 'cms-media',
        zeroRetentionPolicy: 'Active (Original files purged after WebP conversion)',
      },
      runtime: {
        nodeVersion: process.version,
        platform: `${process.platform} (${os.arch()})`,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryMb: {
          rss: Math.round(memory.rss / (1024 * 1024)),
          heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
          heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
        },
        cpus: os.cpus().length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'degraded',
      error: error.message || 'System diagnostic check failed',
    }, { status: 500 });
  }
}
