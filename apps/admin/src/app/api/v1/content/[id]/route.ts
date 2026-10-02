import { prisma, EntryStatus, Prisma } from '@headless/database';
import { validateEntryFields, computeRevisionDiff, verifyPreviewToken } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { authenticateApiRequest } from '@/lib/api-auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/content/:id
 * Retrieve a single content entry with full relational population and SEO schema
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const previewToken = req.nextUrl.searchParams.get('previewToken');
    const secret = process.env.PREVIEW_SECRET || 'preview-secret';

    let isPreviewValid = false;
    if (previewToken) {
      const res = verifyPreviewToken(previewToken, secret);
      if (res.valid && res.entryId === id) isPreviewValid = true;
    }

    const entry = await prisma.contentEntry.findFirst({
      where: {
        siteId: site.id,
        OR: [{ id }, { slug: id }],
      },
      include: {
        contentType: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        taxonomyTerms: {
          include: {
            term: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Content entry not found' }, { status: 404 });
    }

    // If not published, require admin session or valid preview token
    if (entry.status !== EntryStatus.PUBLISHED && !adminSession && !isPreviewValid) {
      return NextResponse.json({ error: 'Content is not published' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        status: entry.status,
        locale: entry.locale,
        contentType: entry.contentType.slug,
        currentVersion: entry.currentVersion,
        data: entry.data,
        blocks: entry.blocks,
        seo: entry.seo,
        publishedAt: entry.publishedAt,
        scheduledPublishAt: entry.scheduledPublishAt,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        author: entry.author,
        taxonomies: entry.taxonomyTerms.map((t) => ({ id: t.term.id, name: t.term.name, slug: t.term.slug })),
      },
    });
  } catch (err) {
    console.error('[ContentItemGET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/content/:id
 * Updates entry, creates revision with diff summary, and dispatches webhooks
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const apiAuth = await authenticateApiRequest(req, 'content:update');

    if (!adminSession && (!apiAuth.authenticated || apiAuth.role === 'READ_ONLY')) {
      return NextResponse.json({ error: 'Unauthorized: content.update permission required' }, { status: 401 });
    }

    if (adminSession) {
      const guard = requirePermission(adminSession, 'content.update');
      if (!guard.authorized) return guard.response!;
    }

    const existing = await prisma.contentEntry.findFirst({
      where: { siteId: site.id, id },
      include: {
        contentType: { include: { fields: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Content entry not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, slug, data, blocks, seo, status, scheduledPublishAt, taxonomyTermIds, changeSummary } = body;

    // Validate dynamic fields if provided
    if (data) {
      const validation = validateEntryFields(
        existing.contentType.fields.map((f) => ({
          name: f.name,
          apiId: f.apiId,
          type: f.type,
          isRequired: f.isRequired,
          defaultValue: f.defaultValue,
          validationRules: f.validationRules as any,
        })),
        data
      );

      if (!validation.valid) {
        return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 422 });
      }
    }

    const newVersion = existing.currentVersion + 1;
    const oldData = (existing.data || {}) as Record<string, unknown>;
    const updatedData = (data !== undefined ? data : existing.data) as Record<string, unknown>;
    const diffs = computeRevisionDiff(oldData, updatedData);
    const changedFieldKeys = diffs.map((d) => d.field);

    const authorId = adminSession?.user.id || existing.authorId;

    // 1. Update ContentEntry
    const updated = await prisma.contentEntry.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: slug !== undefined ? slug.toLowerCase().trim() : existing.slug,
        status: status !== undefined ? status : existing.status,
        data: (data !== undefined ? data : existing.data) as Prisma.InputJsonValue,
        blocks: (blocks !== undefined ? blocks : existing.blocks) as Prisma.InputJsonValue,
        seo: (seo !== undefined ? seo : existing.seo) as Prisma.InputJsonValue,
        scheduledPublishAt: scheduledPublishAt !== undefined ? (scheduledPublishAt ? new Date(scheduledPublishAt) : null) : existing.scheduledPublishAt,
        currentVersion: newVersion,
      },
    });

    // 2. Manage taxonomy terms if provided
    if (Array.isArray(taxonomyTermIds)) {
      await prisma.entryTaxonomyTerm.deleteMany({ where: { entryId: id } });
      for (const termId of taxonomyTermIds) {
        await prisma.entryTaxonomyTerm.create({ data: { entryId: id, termId } });
      }
    }

    // 3. Create ContentRevision snapshot
    await prisma.contentRevision.create({
      data: {
        entryId: id,
        version: newVersion,
        authorId,
        changeSummary: changeSummary || `Updated fields: ${changedFieldKeys.join(', ') || 'metadata'}`,
        changedFields: changedFieldKeys as Prisma.InputJsonValue,
        data: updated.data as Prisma.InputJsonValue,
        blocks: updated.blocks as Prisma.InputJsonValue,
        seo: updated.seo as Prisma.InputJsonValue,
      },
    });

    // 4. Record audit log
    await recordAuditLog({
      siteId: site.id,
      actorId: authorId || undefined,
      action: 'content.update',
      entityType: 'ContentEntry',
      entityId: id,
      metadata: { changedFields: changedFieldKeys, version: newVersion },
      req,
    });

    // 5. Dispatch Webhook
    dispatchWebhooks({
      siteId: site.id,
      event: 'content.updated',
      payload: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        version: newVersion,
        updatedAt: updated.updatedAt.toISOString(),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, entry: updated });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A content entry with this slug already exists.' }, { status: 409 });
    }
    console.error('[ContentItemPATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update content entry' }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/content/:id
 * Delete content entry
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const apiAuth = await authenticateApiRequest(req, 'content:delete');

    if (!adminSession && (!apiAuth.authenticated || apiAuth.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: content.delete permission required' }, { status: 401 });
    }

    if (adminSession) {
      const guard = requirePermission(adminSession, 'content.delete');
      if (!guard.authorized) return guard.response!;
    }

    const existing = await prisma.contentEntry.findFirst({
      where: { siteId: site.id, id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Content entry not found' }, { status: 404 });
    }

    await prisma.contentEntry.delete({ where: { id } });

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'content.delete',
      entityType: 'ContentEntry',
      entityId: id,
      metadata: { title: existing.title, slug: existing.slug },
      req,
    });

    dispatchWebhooks({
      siteId: site.id,
      event: 'content.deleted',
      payload: { id, slug: existing.slug, title: existing.title },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Content entry deleted successfully' });
  } catch (err) {
    console.error('[ContentItemDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete content entry' }, { status: 500 });
  }
}
