import { PERMISSIONS, type PermissionAction } from '../constants/permissions';

export interface UserAuthContext {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  role?: string;
  roleName?: string;
  roles: {
    slug: string;
    name?: string;
    permissions: string[];
  }[];
  permissions?: string[];
}

/**
 * Evaluates whether a user's roles have the required permission.
 * Supports:
 * - Direct action match (e.g. 'content.create')
 * - Wildcard matching (e.g. 'content.*' or '*')
 * - Super admin bypass ('super_admin' role)
 */
export function hasPermission(
  user: UserAuthContext | null | undefined,
  requiredPermission: PermissionAction | string
): boolean {
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  // Super admin has unrestricted permission
  if (user.roles.some((r) => r.slug === 'super_admin' || r.slug === 'administrator')) {
    return true;
  }

  const userPermissions = new Set<string>();
  for (const role of user.roles) {
    for (const perm of role.permissions) {
      userPermissions.add(perm);
      userPermissions.add(perm.replace(/:/g, '.'));
      userPermissions.add(perm.replace(/\./g, ':'));
    }
  }

  // Check wildcard all
  if (userPermissions.has('*')) {
    return true;
  }

  // Check exact match in either format
  const normalizedDot = requiredPermission.replace(/:/g, '.');
  const normalizedColon = requiredPermission.replace(/\./g, ':');
  if (
    userPermissions.has(requiredPermission) ||
    userPermissions.has(normalizedDot) ||
    userPermissions.has(normalizedColon)
  ) {
    return true;
  }

  // Check module-level wildcard: e.g. "content.*" or "content:*"
  const [module] = normalizedDot.split('.');
  if (
    module &&
    (userPermissions.has(`${module}.*`) ||
      userPermissions.has(`${module}:*`) ||
      userPermissions.has(`${module}.manage`))
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if user has a specific role slug
 */
export function hasRole(
  user: UserAuthContext | null | undefined,
  roleSlug: string
): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((r) => r.slug.toLowerCase() === roleSlug.toLowerCase());
}

/**
 * Checks if user has any of the given role slugs
 */
export function hasAnyRole(
  user: UserAuthContext | null | undefined,
  roleSlugs: string[]
): boolean {
  if (!user || !user.roles) return false;
  const set = new Set(roleSlugs.map((s) => s.toLowerCase()));
  return user.roles.some((r) => set.has(r.slug.toLowerCase()));
}

/**
 * Checks if user has any of the given permissions
 */
export function hasAnyPermission(
  user: UserAuthContext | null | undefined,
  requiredPermissions: (PermissionAction | string)[]
): boolean {
  return requiredPermissions.some((perm) => hasPermission(user, perm));
}

/**
 * Checks if user has all of the given permissions
 */
export function hasAllPermissions(
  user: UserAuthContext | null | undefined,
  requiredPermissions: (PermissionAction | string)[]
): boolean {
  return requiredPermissions.every((perm) => hasPermission(user, perm));
}

/**
 * Checks if the user has permission to view team-wide content,
 * or should be strictly restricted to items they authored.
 */
export function canViewAllContent(user: UserAuthContext | null | undefined): boolean {
  if (!user || !user.roles) return false;
  if (
    user.roles.some((r) =>
      ['super_admin', 'administrator', 'admin', 'editor', 'reviewer'].includes(r.slug.toLowerCase())
    )
  ) {
    return true;
  }
  return hasPermission(user, 'content.read_all');
}

/**
 * Checks if the user has permission to view team-wide media,
 * or should be restricted only to media they uploaded.
 */
export function canViewAllMedia(user: UserAuthContext | null | undefined): boolean {
  if (!user || !user.roles) return false;
  if (
    user.roles.some((r) =>
      ['super_admin', 'administrator', 'admin', 'editor', 'media_manager'].includes(r.slug.toLowerCase())
    )
  ) {
    return true;
  }
  return hasPermission(user, 'media.read_all');
}

/**
 * Checks if the user has permission to view team-wide revisions,
 * or should be restricted only to revisions for items they worked on.
 */
export function canViewAllRevisions(user: UserAuthContext | null | undefined): boolean {
  if (!user || !user.roles) return false;
  if (
    user.roles.some((r) =>
      ['super_admin', 'administrator', 'admin', 'editor', 'reviewer'].includes(r.slug.toLowerCase())
    )
  ) {
    return true;
  }
  return hasPermission(user, 'revisions.read_all');
}

