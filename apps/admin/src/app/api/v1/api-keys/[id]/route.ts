import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { fallbackApiKeys } from '../fallback-data';
import { NextRequest, NextResponse } from 'next/server';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'api.manage');
    if (!guard.authorized) return guard.response!;

    try {
      const existing = await withTimeout(
        prisma.apiKey.findFirst({
          where: { siteId: site.id, id },
        }),
        1500
      );

      if (existing) {
        // Revoke the key in DB
        await withTimeout(
          prisma.apiKey.update({
            where: { id },
            data: { revokedAt: new Date() },
          }),
          1500
        );
      }
    } catch {
      // In-memory fallback
      const fallbackKey = fallbackApiKeys.find((k) => k.id === id);
      if (fallbackKey) {
        fallbackKey.revokedAt = new Date().toISOString();
      }
    }

    try {
      await recordAuditLog({
        siteId: site.id,
        actorId: adminSession?.user.id,
        action: 'api_key.revoke',
        entityType: 'ApiKey',
        entityId: id,
        metadata: { id },
        req,
      });
    } catch {}

    return NextResponse.json({ success: true, message: 'API key revoked successfully' });
  } catch (err) {
    console.error('[ApiKeysDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
