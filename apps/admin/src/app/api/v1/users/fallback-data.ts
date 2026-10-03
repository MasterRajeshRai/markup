export interface FallbackUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  roles: Array<{ id: string; name: string; slug: string }>;
}

export const fallbackUsers: FallbackUser[] = [
  {
    id: 'user_admin_01',
    email: 'admin@headless.io',
    name: 'Super Administrator',
    avatarUrl: null,
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date('2025-01-01').toISOString(),
    roles: [{ id: 'role_super_admin', name: 'Super Admin', slug: 'super_admin' }],
  },
  {
    id: 'user_editor_01',
    email: 'editor@headless.io',
    name: 'Content Editor',
    avatarUrl: null,
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date('2025-01-02').toISOString(),
    roles: [{ id: 'role_editor', name: 'Content Editor', slug: 'editor' }],
  },
  {
    id: 'user_author_01',
    email: 'author@headless.io',
    name: 'Staff Author',
    avatarUrl: null,
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date('2025-01-03').toISOString(),
    roles: [{ id: 'role_author', name: 'Staff Author', slug: 'author' }],
  },
  {
    id: 'user_reviewer_01',
    email: 'reviewer@headless.io',
    name: 'Chief Reviewer',
    avatarUrl: null,
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date('2025-01-04').toISOString(),
    roles: [{ id: 'role_reviewer', name: 'Reviewer', slug: 'reviewer' }],
  },
];
