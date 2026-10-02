import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'content.read');
    if (!guard.authorized) return guard.response!;
    if (!adminSession?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const entry = await prisma.contentEntry.findFirst({
      where: { siteId: site.id, id },
    });

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    const { canViewAllRevisions } = await import('@headless/core');
    const canViewAll = canViewAllRevisions(adminSession.user);
    if (!canViewAll && entry.authorId !== adminSession.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view revisions on content you have worked on' },
        { status: 403 }
      );
    }

    const revisions = await prisma.contentRevision.findMany({
      where: { entryId: id },
      orderBy: { version: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({
      data: revisions.map((r) => ({
        id: r.id,
        version: r.version,
        changeSummary: r.changeSummary,
        changedFields: r.changedFields,
        createdAt: r.createdAt,
        author: r.author,
        data: r.data,
        blocks: r.blocks,
        seo: r.seo,
      })),
    });
  } catch (err) {
    console.error('[RevisionsGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve revisions' }, { status: 500 });
  }
}
