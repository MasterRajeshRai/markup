import { prisma, ApiKeyRole, ApiKeyEnvironment, Prisma } from '@headless/database';
import { generateApiKey } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'api.manage');
    if (!guard.authorized) return guard.response!;

    const apiKeys = await prisma.apiKey.findMany({
      where: { siteId: site.id },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

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
    console.error('[ApiKeysGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve API keys' }, { status: 500 });
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
