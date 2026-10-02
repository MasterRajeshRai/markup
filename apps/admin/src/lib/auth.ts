import { prisma, type User } from '@headless/database';
import { hasPermission, type PermissionAction, type UserAuthContext } from '@headless/core';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'cms_session';

export interface AdminAuthSession {
  user: UserAuthContext & {
    name: string;
    avatarUrl: string | null;
  };
  sessionId: string;
}

/**
 * Retrieves the current authenticated admin user from session cookie or Bearer token
 */
export async function getAdminSession(req?: NextRequest): Promise<AdminAuthSession | null> {
  let token: string | undefined;

  // 1. Check Bearer token from header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Check HTTP-only cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Cookies not accessible in current context
    }
  }

  if (!token) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (session && session.expiresAt >= new Date() && session.user.isActive) {
      // Flatten roles and permissions
      const roles = session.user.userRoles.map((ur) => ({
        slug: ur.role.slug,
        name: ur.role.name,
        permissions: ur.role.rolePermissions.map((rp) => rp.permission.action),
      }));

      const primaryRole = roles[0]?.slug || 'admin';
      const roleName = roles[0]?.name || primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1);
      const permissions = Array.from(new Set(roles.flatMap((r) => r.permissions)));

      return {
        sessionId: session.id,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatarUrl: session.user.avatarUrl,
          role: primaryRole,
          roleName,
          roles,
          permissions,
        },
      };
    }
  } catch {
    // Database offline
  }

  // Resilient fallback from auth-service
  const { validateSessionToken } = await import('@/lib/auth-service');
  const fallbackUser = await validateSessionToken(token);
  if (fallbackUser) {
    const roleSlug = fallbackUser.role;
    const roleNameMap: Record<string, string> = {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      editor: 'Lead Editor',
      author: 'Staff Author',
      reviewer: 'Content Reviewer',
      contributor: 'Contributor',
      developer: 'Developer',
      seo_manager: 'SEO Manager',
      media_manager: 'Media Manager',
      read_only: 'Read Only',
    };
    const roleName = roleNameMap[roleSlug] || roleSlug.charAt(0).toUpperCase() + roleSlug.slice(1);

    return {
      sessionId: `fallback_${fallbackUser.id}`,
      user: {
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        avatarUrl: fallbackUser.avatarUrl,
        role: roleSlug,
        roleName,
        roles: [
          {
            slug: fallbackUser.role,
            name: roleName,
            permissions: fallbackUser.permissions as any,
          },
        ],
        permissions: fallbackUser.permissions,
      },
    };
  }

  return null;
}

/**
 * Enforces a required permission or throws a 403 Forbidden response
 */
export function requirePermission(
  session: AdminAuthSession | null,
  permission: PermissionAction | string
): { authorized: boolean; response?: NextResponse } {
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(session.user, permission)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Forbidden: Missing required permission [${permission}]` },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}
