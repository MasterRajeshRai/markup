'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface ClientRole {
  slug: string;
  name?: string;
  permissions: string[];
}

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  roleName: string;
  roles: ClientRole[];
  permissions: string[];
}

interface AuthContextValue {
  user: ClientUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleSlug: string) => boolean;
  hasAnyRole: (roleSlugs: string[]) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  canViewAllContent: boolean;
  canViewAllMedia: boolean;
  canViewAllRevisions: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Route-to-Permission mapping table for admin path security.
 * Unlisted admin subpaths default to general administrative access or content read.
 */
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/admin': 'content.read', // Dashboard overview
  '/admin/content': 'content.read',
  '/admin/pages': 'content.read',
  '/admin/sliders': 'sliders.read',
  '/admin/content-types': 'content_type.read',
  '/admin/calendar': 'calendar.read',
  '/admin/publishing': 'content.publish',
  '/admin/workflows': 'workflows.read',
  '/admin/revisions': 'revisions.read',
  '/admin/media': 'media.read',
  '/admin/newsletter': 'newsletter.read',
  '/admin/forms': 'forms.read',
  '/admin/comments': 'comments.read',
  '/admin/seo': 'seo.manage',
  '/admin/ads': 'ads.manage',
  '/admin/redirects': 'redirects.manage',
  '/admin/navigation': 'navigation.manage',
  '/admin/taxonomies': 'taxonomy.manage',
  '/admin/users': 'users.read',
  '/admin/roles': 'roles.manage',
  '/admin/api-keys': 'api.manage',
  '/admin/audit-logs': 'audit.read',
  '/admin/emails': 'email.manage',
  '/admin/graphql': 'api.manage',
  '/admin/webhooks': 'webhooks.manage',
  '/admin/integrations': 'integrations.manage',
  '/admin/import-export': 'import_export.manage',
  '/admin/sites': 'sites.manage',
  '/admin/modules': 'settings.manage',
  '/admin/settings': 'settings.manage',
  '/admin/system': 'settings.manage',
};

export const DEFAULT_ADMIN_USER: ClientUser = {
  id: 'usr_admin',
  email: 'admin@headless.io',
  name: 'Alex Morgan',
  avatarUrl: null,
  role: 'super_admin',
  roleName: 'Super Administrator',
  roles: [
    {
      slug: 'super_admin',
      name: 'Super Administrator',
      permissions: ['*'],
    },
  ],
  permissions: ['*'],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(DEFAULT_ADMIN_USER);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        // Fallback to default admin in development / demo mode
        setUser(DEFAULT_ADMIN_USER);
        return;
      }
      const data = await res.json();
      if (data.authenticated && data.user) {
        const u = data.user;
        const role = u.role || (u.roles?.[0]?.slug) || 'admin';
        const roleName = u.roleName || (u.roles?.[0]?.name) || role.charAt(0).toUpperCase() + role.slice(1);
        const permissions: string[] = u.permissions || (u.roles?.flatMap((r: any) => r.permissions) ?? []);

        setUser({
          id: u.id,
          email: u.email,
          name: u.name || 'User',
          avatarUrl: u.avatarUrl || null,
          role,
          roleName,
          roles: u.roles || [],
          permissions,
        });
      } else {
        setUser(DEFAULT_ADMIN_USER);
      }
    } catch {
      setUser(DEFAULT_ADMIN_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // Super admin or full wildcard has unrestricted permissions
      if (user.role === 'super_admin' || user.roles?.some((r) => r.slug === 'super_admin')) {
        return true;
      }
      if (user.permissions?.includes('*')) {
        return true;
      }

      const normalizedDot = permission.replace(/:/g, '.');
      const normalizedColon = permission.replace(/\./g, ':');

      const userPermSet = new Set<string>();
      if (Array.isArray(user.permissions)) {
        for (const p of user.permissions) {
          userPermSet.add(p);
          userPermSet.add(p.replace(/:/g, '.'));
          userPermSet.add(p.replace(/\./g, ':'));
        }
      }
      if (Array.isArray(user.roles)) {
        for (const r of user.roles) {
          for (const p of r.permissions || []) {
            userPermSet.add(p);
            userPermSet.add(p.replace(/:/g, '.'));
            userPermSet.add(p.replace(/\./g, ':'));
          }
        }
      }

      // Exact match
      if (
        userPermSet.has(permission) ||
        userPermSet.has(normalizedDot) ||
        userPermSet.has(normalizedColon)
      ) {
        return true;
      }

      // Check module level wildcard: e.g. "content.*" allows "content.read"
      const [module] = normalizedDot.split('.');
      if (
        module &&
        (userPermSet.has(`${module}.*`) ||
          userPermSet.has(`${module}:*`) ||
          userPermSet.has(`${module}.manage`))
      ) {
        return true;
      }

      return false;
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const hasRole = useCallback(
    (roleSlug: string): boolean => {
      if (!user) return false;
      if (user.role?.toLowerCase() === roleSlug.toLowerCase()) return true;
      return user.roles?.some((r) => r.slug.toLowerCase() === roleSlug.toLowerCase()) ?? false;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roleSlugs: string[]): boolean => {
      return roleSlugs.some((r) => hasRole(r));
    },
    [hasRole]
  );

  const canAccessRoute = useCallback(
    (routePath: string): boolean => {
      // Main dashboard overview is always accessible
      const cleanPath = routePath.split('?')[0];
      if (cleanPath === '/admin' || cleanPath === '') {
        return true;
      }

      if (!user) return false;
      if (user.role === 'super_admin' || user.roles?.some((r) => r.slug === 'super_admin')) {
        return true;
      }

      // Find best matching route prefix
      const matchingKey = Object.keys(ROUTE_PERMISSION_MAP)
        .filter((k) => cleanPath === k || cleanPath.startsWith(`${k}/`))
        .sort((a, b) => b.length - a.length)[0];

      if (!matchingKey) {
        return true; // Unspecified route
      }

      const requiredPerm = ROUTE_PERMISSION_MAP[matchingKey];
      return hasPermission(requiredPerm);
    },
    [user, hasPermission]
  );

  const canViewAllContent = React.useMemo(() => {
    if (!user) return false;
    if (
      ['super_admin', 'administrator', 'admin', 'editor', 'reviewer'].includes(
        user.role?.toLowerCase()
      )
    ) {
      return true;
    }
    return hasPermission('content.read_all');
  }, [user, hasPermission]);

  const canViewAllMedia = React.useMemo(() => {
    if (!user) return false;
    if (
      ['super_admin', 'administrator', 'admin', 'editor', 'media_manager'].includes(
        user.role?.toLowerCase()
      )
    ) {
      return true;
    }
    return hasPermission('media.read_all');
  }, [user, hasPermission]);

  const canViewAllRevisions = React.useMemo(() => {
    if (!user) return false;
    if (
      ['super_admin', 'administrator', 'admin', 'editor', 'reviewer'].includes(
        user.role?.toLowerCase()
      )
    ) {
      return true;
    }
    return hasPermission('revisions.read_all');
  }, [user, hasPermission]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network error during logout
    }
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        canAccessRoute,
        canViewAllContent,
        canViewAllMedia,
        canViewAllRevisions,
        refreshUser: fetchCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
