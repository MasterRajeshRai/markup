import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'roles.manage');
    if (!guard.authorized) return guard.response!;

    const [roles, permissions] = await Promise.all([
      prisma.role.findMany({
        orderBy: { name: 'asc' },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
          _count: { select: { userRoles: true } },
        },
      }),
      prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
      }),
    ]);

    return NextResponse.json({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        isSystem: r.isSystem,
        usersCount: r._count.userRoles,
        permissions: r.rolePermissions.map((rp) => rp.permission.action),
      })),
      permissions,
    });
  } catch (err) {
    console.error('[RolesGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve roles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'roles.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, slug, description, permissionActions = [] } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Role name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    const role = await prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: {
          name,
          slug: cleanSlug,
          description,
          isSystem: false,
        },
      });

      if (Array.isArray(permissionActions) && permissionActions.length > 0) {
        const perms = await tx.permission.findMany({
          where: { action: { in: permissionActions } },
        });

        for (const p of perms) {
          await tx.rolePermission.create({
            data: { roleId: created.id, permissionId: p.id },
          });
        }
      }

      return created;
    });

    await recordAuditLog({
      actorId: adminSession?.user.id,
      action: 'role.create',
      entityType: 'Role',
      entityId: role.id,
      metadata: { name, slug: cleanSlug },
      req,
    });

    return NextResponse.json({ success: true, role }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A role with this name or slug already exists.' }, { status: 409 });
    }
    console.error('[RolesPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
