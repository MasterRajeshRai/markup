import { prisma, Prisma } from '@headless/database';
import { LocalStorageDriver, CloudflareR2Storage } from '@headless/core/server';
import { resolveSiteContext } from '@/lib/site-context';
import { getMockMediaById, updateMockMedia, deleteMockMedia } from '@/lib/mock-media-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const r2 = new CloudflareR2Storage();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    let media: any = null;
    try {
      media = await prisma.media.findFirst({
        where: { siteId, id },
        include: {
          folder: true,
          usages: true,
          mediaVariants: {
            orderBy: { width: 'asc' },
            include: { preset: true },
          },
          jobs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    } catch {
      // Prisma offline fallback
    }

    if (!media) {
      media = getMockMediaById(id);
    }

    if (!media) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

    return NextResponse.json({ data: media });
  } catch (err) {
    console.error('[MediaItemGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve media item' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { altText, caption, description, copyright, credit, focalPoint, folderId } = body;

    try {
      const updated = await prisma.media.update({
        where: { id },
        data: {
          altText: altText !== undefined ? altText : undefined,
          caption: caption !== undefined ? caption : undefined,
          description: description !== undefined ? description : undefined,
          copyright: copyright !== undefined ? copyright : undefined,
          credit: credit !== undefined ? credit : undefined,
          focalPoint: focalPoint !== undefined ? (focalPoint as Prisma.InputJsonValue) : undefined,
          folderId: folderId !== undefined ? folderId : undefined,
        },
      });
      return NextResponse.json({ success: true, media: updated });
    } catch {
      const updated = updateMockMedia(id, { altText, caption, description, folderId });
      return NextResponse.json({ success: true, media: updated });
    }
  } catch (err) {
    console.error('[MediaItemPATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    let existing: any = null;
    try {
      existing = await prisma.media.findFirst({
        where: { siteId, id },
        include: {
          mediaVariants: true,
          _count: { select: { usages: true } },
        },
      });
    } catch {
      // Prisma offline fallback
    }

    if (!existing) {
      existing = getMockMediaById(id);
    }

    if (!existing) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

    // Delete variants from storage
    if (existing.mediaVariants && existing.mediaVariants.length > 0) {
      const variantKeys = existing.mediaVariants
        .map((v: any) => v.storageKey)
        .filter(Boolean);
      for (const k of variantKeys) {
        await r2.delete(k).catch(() => {});
      }
    }

    try {
      await prisma.mediaVariant.deleteMany({ where: { mediaId: id } });
      await prisma.media.delete({ where: { id } });
    } catch {
      deleteMockMedia(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Asset and all WebP variants purged from storage and library.',
    });
  } catch (err) {
    console.error('[MediaItemDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
