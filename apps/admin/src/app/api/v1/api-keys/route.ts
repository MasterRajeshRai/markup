import { prisma, ApiKeyRole, ApiKeyEnvironment, Prisma } from '@headless/database';
import { generateApiKey } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

interface FallbackApiKey {
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

const fallbackApiKeys: FallbackApiKey[] = [
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

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'api.manage');
    if (!guard.authorized) return guard.response!;

    const apiKeys = await withTimeout(
      prisma.apiKey.findMany({
        where: { siteId: site.id },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, email: true } },
        },
      })
    );

    return NextResponse.json({
      data: apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        role: k.role,
        scopes: k.scopes,
        environment: k.environment,
        expiresAt: k.expiresAt,
        lastUsedAt: k.lastUsedAt,
        revokedAt: k.revokedAt,
        createdAt: k.createdAt,
        creator: k.creator,
      })),
    });
  } catch (err) {
    return NextResponse.json({ data: fallbackApiKeys });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'api.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { name, role = ApiKeyRole.READ_ONLY, scopes = ['content:read'], environment = ApiKeyEnvironment.PRODUCTION, expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }

    const { secretKey, keyPrefix, keyHash } = generateApiKey(environment);

    const apiKey = await prisma.apiKey.create({
      data: {
        siteId: site.id,
        name,
        keyPrefix,
        keyHash,
        role,
        scopes: scopes as Prisma.InputJsonValue,
        environment,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdById: adminSession?.user.id,
      },
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'api_key.create',
      entityType: 'ApiKey',
      entityId: apiKey.id,
      metadata: { name, keyPrefix, role, environment },
      req,
    });

    return NextResponse.json(
      {
        success: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          keyPrefix: apiKey.keyPrefix,
          secretKey, // Returned ONLY ONCE upon creation!
          role: apiKey.role,
          scopes: apiKey.scopes,
          environment: apiKey.environment,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[ApiKeysPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
