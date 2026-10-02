import { prisma } from '@headless/database';
import { hashPassword } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.update');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, email, password, isActive, roleIds } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = String(email).toLowerCase().trim();
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    if (Array.isArray(roleIds)) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      for (const roleId of roleIds) {
        await prisma.userRole.create({ data: { userId: id, roleId } });
      }
    }

    await recordAuditLog({
      actorId: adminSession?.user.id,
      action: 'user.update',
      entityType: 'User',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error('[UserItemPATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.delete');
    if (!guard.authorized) return guard.response!;

    if (adminSession?.user.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own active administrator account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await recordAuditLog({
      actorId: adminSession?.user.id,
      action: 'user.delete',
      entityType: 'User',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('[UserItemDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
