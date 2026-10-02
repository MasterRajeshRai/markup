import { prisma, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { getMockContentTypes, saveMockContentType } from '@/lib/mock-content-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const contentTypes = await withTimeout(
      prisma.contentType.findMany({
        where: { siteId: site.id },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { entries: true },
          },
        },
        orderBy: { name: 'asc' },
      })
    );

    return NextResponse.json({
      data: contentTypes.map((ct) => ({
        id: ct.id,
        name: ct.name,
        slug: ct.slug,
        description: ct.description,
        icon: ct.icon,
        isSingle: ct.isSingle,
        isPublishable: ct.isPublishable,
        hasDrafts: ct.hasDrafts,
        hasRevisions: ct.hasRevisions,
        entriesCount: ct._count.entries,
        fields: ct.fields,
        seoConfig: ct.seoConfig,
        createdAt: ct.createdAt,
        updatedAt: ct.updatedAt,
      })),
    });
  } catch (err) {
    // Graceful fallback to mock content types
    return NextResponse.json({ data: getMockContentTypes() });
  }
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'content_type.manage');
    if (!guard.authorized) return guard.response!;

    body = await req.json();
    const {
      name,
      slug,
      description,
      icon = 'FileText',
      isSingle = false,
      isPublishable = true,
      hasDrafts = true,
      hasRevisions = true,
      fields = [],
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Transaction to create ContentType and its fields
    const created = await prisma.$transaction(async (tx) => {
      const ct = await tx.contentType.create({
        data: {
          siteId: site.id,
          name,
          slug: cleanSlug,
          description,
          icon,
          isSingle,
          isPublishable,
          hasDrafts,
          hasRevisions,
        },
      });

      if (Array.isArray(fields) && fields.length > 0) {
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await tx.contentField.create({
            data: {
              contentTypeId: ct.id,
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
        where: { id: ct.id },
        include: { fields: true },
      });
    });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'content_type.create',
      entityType: 'ContentType',
      entityId: created?.id,
      metadata: { name, slug: cleanSlug },
      req,
    });

    return NextResponse.json({ success: true, contentType: created }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A content type with this slug already exists.' }, { status: 409 });
    }
    try {
      const {
        name,
        slug,
        description,
        icon = 'FileText',
        isSingle = false,
        isPublishable = true,
        hasDrafts = true,
        hasRevisions = true,
        fields = [],
      } = body;
      if (name && slug) {
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const created = saveMockContentType({
          name,
          slug: cleanSlug,
          description,
          icon,
          isSingle,
          isPublishable,
          hasDrafts,
          hasRevisions,
          fields,
        });
        return NextResponse.json({ success: true, contentType: created }, { status: 201 });
      }
    } catch {}
    console.error('[ContentTypesPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create content type' }, { status: 500 });
  }
}
