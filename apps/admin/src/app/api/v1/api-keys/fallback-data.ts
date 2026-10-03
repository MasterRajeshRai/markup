export interface FallbackApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  role: string;
  scopes: string[];
  environment: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  creator: { id: string; name: string; email: string };
}

export const fallbackApiKeys: FallbackApiKey[] = [
  {
    id: 'key_live_demo',
    name: 'Frontend Demo API Key',
    keyPrefix: 'cms_live_caadf',
    role: 'ADMIN',
    scopes: ['content:read', 'content:create', 'media:read'],
    environment: 'PRODUCTION',
    expiresAt: null,
    lastUsedAt: new Date().toISOString(),
    revokedAt: null,
    createdAt: new Date('2025-01-01').toISOString(),
    creator: { id: 'user_admin_01', name: 'Super Administrator', email: 'admin@headless.io' },
  },
  {
    id: 'key_read_only',
    name: 'Public Delivery Key',
    keyPrefix: 'cms_live_pub98',
    role: 'READ_ONLY',
    scopes: ['content:read', 'media:read'],
    environment: 'PRODUCTION',
    expiresAt: null,
    lastUsedAt: new Date().toISOString(),
    revokedAt: null,
    createdAt: new Date('2025-01-02').toISOString(),
    creator: { id: 'user_admin_01', name: 'Super Administrator', email: 'admin@headless.io' },
  },
];
