import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  try {
    const { id, version: versionStr } = await params;
    const versionNum = parseInt(versionStr, 10);
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'content.update');
    if (!guard.authorized) return guard.response!;

    const entry = await prisma.contentEntry.findFirst({
      where: { siteId: site.id, id },
    });

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    const targetRevision = await prisma.contentRevision.findFirst({
      where: { entryId: id, version: versionNum },
    });

    if (!targetRevision) {
      return NextResponse.json({ error: `Revision version ${versionNum} not found` }, { status: 404 });
    }

    const newVersion = entry.currentVersion + 1;

    // 1. Update entry with snapshot from target revision
    const updated = await prisma.contentEntry.update({
      where: { id },
      data: {
        data: targetRevision.data as Prisma.InputJsonValue,
        blocks: targetRevision.blocks as Prisma.InputJsonValue,
        seo: targetRevision.seo as Prisma.InputJsonValue,
        currentVersion: newVersion,
      },
    });

    // 2. Create new revision acknowledging the restoration
    await prisma.contentRevision.create({
      data: {
        entryId: id,
        version: newVersion,
        authorId: adminSession?.user.id,
        changeSummary: `Restored from version ${versionNum}`,
        changedFields: ['all_restored'],
        data: targetRevision.data as Prisma.InputJsonValue,
        blocks: targetRevision.blocks as Prisma.InputJsonValue,
        seo: targetRevision.seo as Prisma.InputJsonValue,
      },
    });

    // 3. Audit log & webhook
    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'content.restore_revision',
      entityType: 'ContentEntry',
      entityId: id,
      metadata: { restoredFromVersion: versionNum, newVersion },
      req,
    });

    dispatchWebhooks({
      siteId: site.id,
      event: 'content.updated',
      payload: { id, version: newVersion, restoredFrom: versionNum },
    }).catch(() => {});

    return NextResponse.json({ success: true, entry: updated, version: newVersion });
  } catch (err) {
    console.error('[RestoreRevisionPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to restore revision' }, { status: 500 });
  }
}
