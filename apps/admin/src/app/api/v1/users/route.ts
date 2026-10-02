import { prisma } from '@headless/database';
import { hashPassword } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.read');
    if (!guard.authorized) return guard.response!;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
        isEmailVerified: u.isEmailVerified,
        mfaEnabled: u.mfaEnabled,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        roles: u.userRoles.map((ur) => ur.role),
      })),
    });
  } catch (err) {
    console.error('[UsersGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'users.create');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { email, password, name, roleIds = [] } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase().trim(),
        name,
        passwordHash,
        isActive: true,
        isEmailVerified: true,
      },
    });

    // Assign roles
    if (Array.isArray(roleIds) && roleIds.length > 0) {
      for (const roleId of roleIds) {
        await prisma.userRole.create({
          data: { userId: user.id, roleId },
        });
      }
    }

    await recordAuditLog({
      actorId: adminSession?.user.id,
      action: 'user.create',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email, name: user.name },
      req,
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }
    console.error('[UsersPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
