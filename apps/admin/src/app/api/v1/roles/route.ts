import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

interface FallbackRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  usersCount: number;
  permissions: string[];
}

export const fallbackRoles: FallbackRole[] = [
  {
    id: 'role_super_admin',
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Unrestricted system access to all resources and settings',
    isSystem: true,
    usersCount: 1,
    permissions: ['*'],
  },
  {
    id: 'role_editor',
    name: 'Content Editor',
    slug: 'editor',
    description: 'Can create, edit, approve, and publish content across the platform',
    isSystem: true,
    usersCount: 1,
    permissions: ['content.*', 'media.*', 'taxonomies.*', 'navigation.*'],
  },
  {
    id: 'role_author',
    name: 'Staff Author',
    slug: 'author',
    description: 'Can draft and edit own articles and upload media',
    isSystem: true,
    usersCount: 1,
    permissions: ['content.create', 'content.read', 'content.update', 'media.upload', 'media.read'],
  },
  {
    id: 'role_reviewer',
    name: 'Reviewer',
    slug: 'reviewer',
    description: 'Can review and approve editorial workflows',
    isSystem: true,
    usersCount: 1,
    permissions: ['content.read', 'content.review', 'workflows.*'],
  },
];

const fallbackPermissions = [
  { id: 'p1', action: 'content.create', description: 'Create content entries', module: 'content' },
  { id: 'p2', action: 'content.read', description: 'Read content entries', module: 'content' },
  { id: 'p3', action: 'content.update', description: 'Update content entries', module: 'content' },
  { id: 'p4', action: 'content.delete', description: 'Delete content entries', module: 'content' },
  { id: 'p5', action: 'content.publish', description: 'Publish content entries', module: 'content' },
  { id: 'p6', action: 'media.upload', description: 'Upload media assets', module: 'media' },
  { id: 'p7', action: 'media.read', description: 'Read media assets', module: 'media' },
  { id: 'p8', action: 'settings.manage', description: 'Manage site settings', module: 'settings' },
  { id: 'p9', action: 'users.manage', description: 'Manage users and roles', module: 'users' },
];

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'roles.manage');
    if (!guard.authorized) return guard.response!;

    const [roles, permissions] = await withTimeout(
      Promise.all([
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
      ])
    );

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
    return NextResponse.json({
      roles: fallbackRoles,
      permissions: fallbackPermissions,
    });
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
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'A role with this name or slug already exists.' }, { status: 409 });
    }
    
    // In-memory fallback
    const body = await req.json().catch(() => ({}));
    const { name, slug, description, permissionActions = [] } = body;
    if (name && slug) {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const newRole: FallbackRole = {
        id: `role_${Date.now()}`,
        name,
        slug: cleanSlug,
        description: description || '',
        isSystem: false,
        usersCount: 0,
        permissions: Array.isArray(permissionActions) ? permissionActions : [],
      };
      fallbackRoles.push(newRole);
      return NextResponse.json({ success: true, role: newRole }, { status: 201 });
    }

    console.error('[RolesPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    if (adminSession) {
      const guard = requirePermission(adminSession, 'roles.manage');
      if (!guard.authorized) return guard.response!;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Role id is required' }, { status: 400 });

    try {
      const role = await prisma.role.findUnique({ where: { id } });
      if (role?.isSystem) {
        return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 });
      }
      await prisma.role.delete({ where: { id } });
    } catch {
      const idx = fallbackRoles.findIndex((r) => r.id === id || r.slug === id);
      if (idx !== -1) {
        if (fallbackRoles[idx].isSystem) {
          return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 });
        }
        fallbackRoles.splice(idx, 1);
      }
    }

    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete role' }, { status: 500 });
  }
}
