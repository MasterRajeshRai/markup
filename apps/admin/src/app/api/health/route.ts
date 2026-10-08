import { NextResponse } from 'next/server';
import { prisma } from '@headless/database';

export const dynamic = 'force-dynamic';

export async function GET() {
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
