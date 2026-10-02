import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'audit.read');
    if (!guard.authorized) return guard.response!;

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));

    const where: Prisma.AuditLogWhereInput = {};
    if (site) where.siteId = site.id;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[AuditLogsGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
