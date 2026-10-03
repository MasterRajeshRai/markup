import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { fallbackUsers } from '../fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.read');
    if (!guard.authorized) return guard.response!;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isActive: true,
          isEmailVerified: true,
          mfaEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: {
              role: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      });

      if (user) {
        return NextResponse.json({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            mfaEnabled: user.mfaEnabled,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            roles: user.userRoles.map((ur) => ur.role),
          },
        });
      }
    } catch {
      // In-memory fallback
    }

    const fallback = fallbackUsers.find((u) => u.id === id);
    if (fallback) {
      return NextResponse.json({ data: fallback });
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, email, isActive, roleIds } = body;

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(email && { email: String(email).toLowerCase().trim() }),
            ...(isActive !== undefined && { isActive }),
          },
        });

        if (Array.isArray(roleIds)) {
          await tx.userRole.deleteMany({ where: { userId: id } });
          for (const roleId of roleIds) {
            await tx.userRole.create({
              data: { userId: id, roleId },
            });
          }
        }

        return u;
      });

      await recordAuditLog({
        actorId: adminSession?.user?.id,
        action: 'user.update',
        entityType: 'User',
        entityId: id,
        metadata: { name, email, isActive },
        req,
      }).catch(() => {});

      return NextResponse.json({ success: true, user: updated });
    } catch {
      // In-memory fallback
      const idx = fallbackUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        fallbackUsers[idx] = {
          ...fallbackUsers[idx],
          ...(name && { name }),
          ...(email && { email: String(email).toLowerCase().trim() }),
          ...(isActive !== undefined && { isActive }),
        };
        return NextResponse.json({ success: true, user: fallbackUsers[idx] });
      }

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.manage');
    if (!guard.authorized) return guard.response!;

    if (id === 'user_admin_01' || id === adminSession?.user?.id) {
      return NextResponse.json({ error: 'The primary super administrator account cannot be deleted' }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
      });

      await recordAuditLog({
        actorId: adminSession?.user?.id,
        action: 'user.delete',
        entityType: 'User',
        entityId: id,
        req,
      }).catch(() => {});

      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch {
      // In-memory fallback
      const idx = fallbackUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        fallbackUsers.splice(idx, 1);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
