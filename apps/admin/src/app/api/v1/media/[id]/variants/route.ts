import { prisma } from '@headless/database';
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

    let media: any = null;
    try {
      media = await prisma.media.findFirst({
        where: { id, siteId: site.id },
        include: {
          mediaVariants: {
            orderBy: { width: 'asc' },
            include: { preset: true },
          },
        },
      });
    } catch {
      // Prisma offline fallback
    }

    if (!media) {
      const { getMockMediaById } = await import('@/lib/mock-media-store');
      media = getMockMediaById(id);
    }

    if (!media) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
    }

    const variantsList = media.mediaVariants || media.variants || [];

    return NextResponse.json({
      mediaId: media.id,
      filename: media.filename,
      originalName: media.originalName,
      seoName: media.seoName || media.filename?.replace(/\.[^/.]+$/, ''),
      originalWidth: media.originalWidth,
      originalHeight: media.originalHeight,
      originalSize: media.originalSize,
      focalX: media.focalX,
      focalY: media.focalY,
      variants: variantsList.map((v: any) => ({
        id: v.id,
        presetSlug: v.presetSlug,
        presetName: v.preset?.name || v.presetName || v.presetSlug,
        width: v.width,
        height: v.height,
        format: v.format,
        quality: v.quality,
        fileSize: v.fileSize,
        storageProvider: v.storageProvider,
        storageBucket: v.storageBucket,
        storageKey: v.storageKey,
        r2ReferenceName: v.r2ReferenceName || (v.storageKey ? v.storageKey.split('/').pop() : null),
        publicUrl: v.publicUrl,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) {
    console.error('[MediaVariantsGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve media variants' }, { status: 500 });
  }
}
