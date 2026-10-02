import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

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

    const existing = await prisma.apiKey.findFirst({
      where: { siteId: site.id, id },
    });

    if (!existing) return NextResponse.json({ error: 'API key not found' }, { status: 404 });

    // Revoke the key
    await prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'api_key.revoke',
      entityType: 'ApiKey',
      entityId: id,
      metadata: { keyPrefix: existing.keyPrefix },
      req,
    });

    return NextResponse.json({ success: true, message: 'API key revoked successfully' });
  } catch (err) {
    console.error('[ApiKeysDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
