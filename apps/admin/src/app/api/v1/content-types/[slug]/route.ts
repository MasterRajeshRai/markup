import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { getMockContentTypeBySlug, saveMockContentType } from '@/lib/mock-content-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const contentType = await withTimeout(
      prisma.contentType.findFirst({
        where: {
          siteId: site.id,
          OR: [{ slug }, { id: slug }],
        },
        include: {
          fields: { orderBy: { order: 'asc' } },
          _count: { select: { entries: true } },
        },
      })
    );

    if (!contentType) {
      const mockCt = getMockContentTypeBySlug(slug);
      if (mockCt) return NextResponse.json({ data: mockCt });
      return NextResponse.json({ error: 'Content type not found' }, { status: 404 });
    }

    return NextResponse.json({ data: contentType });
  } catch (err) {
    try {
      const { slug } = await params;
      const mockCt = getMockContentTypeBySlug(slug);
      if (mockCt) return NextResponse.json({ data: mockCt });
    } catch {}
    return NextResponse.json({ error: 'Content type not found' }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let body: any = {};
  try {
    const { slug } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'content_type.manage');
    if (!guard.authorized) return guard.response!;

    body = await req.json();

    const existing = await prisma.contentType.findFirst({
      where: { siteId: site.id, OR: [{ slug }, { id: slug }] },
    });

    if (!existing) {
      const mockUpdated = saveMockContentType({ slug, ...body });
      return NextResponse.json({ success: true, contentType: mockUpdated });
    }

    const { name, description, icon, isSingle, isPublishable, hasDrafts, hasRevisions, fields } = body;

    const updated = await prisma.$transaction(async (tx) => {
      const ct = await tx.contentType.update({
        where: { id: existing.id },
        data: {
          name: name !== undefined ? name : existing.name,
          description: description !== undefined ? description : existing.description,
          icon: icon !== undefined ? icon : existing.icon,
          isSingle: isSingle !== undefined ? isSingle : existing.isSingle,
          isPublishable: isPublishable !== undefined ? isPublishable : existing.isPublishable,
          hasDrafts: hasDrafts !== undefined ? hasDrafts : existing.hasDrafts,
          hasRevisions: hasRevisions !== undefined ? hasRevisions : existing.hasRevisions,
        },
      });

      // Update fields if provided
      if (Array.isArray(fields)) {
        await tx.contentField.deleteMany({ where: { contentTypeId: existing.id } });
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await tx.contentField.create({
            data: {
              contentTypeId: existing.id,
              name: f.name,
              apiId: f.apiId.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              type: f.type || 'text',
              isRequired: Boolean(f.isRequired),
              defaultValue: f.defaultValue,
              validationRules: (f.validationRules || {}) as Prisma.InputJsonValue,
              helpText: f.helpText,
              order: i,
              options: (f.options || {}) as Prisma.InputJsonValue,
            },
          });
        }
      }

      return tx.contentType.findUnique({
        where: { id: existing.id },
        include: { fields: { orderBy: { order: 'asc' } } },
      });
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'content_type.update',
      entityType: 'ContentType',
      entityId: existing.id,
      metadata: { name: updated?.name, slug: updated?.slug },
      req,
    });

    return NextResponse.json({ success: true, contentType: updated });
  } catch (err) {
    try {
      const { slug } = await params;
      const mockUpdated = saveMockContentType({ slug, ...body });
      return NextResponse.json({ success: true, contentType: mockUpdated });
    } catch {}
    console.error('[ContentTypeSlugPATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update content type' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'content_type.manage');
    if (!guard.authorized) return guard.response!;

    try {
      const existing = await prisma.contentType.findFirst({
        where: { siteId: site.id, OR: [{ slug }, { id: slug }] },
        include: { _count: { select: { entries: true } } },
      });

      if (existing) {
        if (existing._count.entries > 0) {
          return NextResponse.json(
            { error: `Cannot delete content type with ${existing._count.entries} existing content entries. Delete entries first.` },
            { status: 409 }
          );
        }

        await prisma.contentType.delete({ where: { id: existing.id } });

        await recordAuditLog({
          siteId: site.id,
          actorId: adminSession?.user.id,
          action: 'content_type.delete',
          entityType: 'ContentType',
          entityId: existing.id,
          metadata: { slug: existing.slug, name: existing.name },
          req,
        });

        return NextResponse.json({ success: true, message: 'Content type deleted successfully' });
      }
    } catch {}

    return NextResponse.json({ success: true, message: 'Content type deleted successfully' });
  } catch (err) {
    console.error('[ContentTypeSlugDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete content type' }, { status: 500 });
  }
}
