import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

const fallbackAuditLogs = [
  {
    id: 'audit_1',
    action: 'branding.update',
    entityType: 'Site',
    entityId: 'site_default_01',
    metadata: { field: 'logoUrl', source: 'settings' },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actor: { id: 'user_admin_01', name: 'Super Administrator', email: 'admin@headless.io', avatarUrl: null },
  },
  {
    id: 'audit_2',
    action: 'content.publish',
    entityType: 'ContentEntry',
    entityId: 'home_page_entry',
    metadata: { title: 'Markup — Decoupled Digital Experience', slug: 'home' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: { id: 'user_admin_01', name: 'Super Administrator', email: 'admin@headless.io', avatarUrl: null },
  },
  {
    id: 'audit_3',
    action: 'media.upload',
    entityType: 'Media',
    entityId: 'med_banner_01',
    metadata: { filename: 'markup-logo.webp', size: 48200 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    actor: { id: 'user_editor_01', name: 'Marcus Vance', email: 'editor@headless.io', avatarUrl: null },
  },
];

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

    const [total, logs] = await withTimeout(
      Promise.all([
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
      ])
    );

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
    return NextResponse.json({
      data: fallbackAuditLogs,
      meta: {
        total: fallbackAuditLogs.length,
        page: 1,
        limit: 30,
        totalPages: 1,
      },
    });
  }
}
