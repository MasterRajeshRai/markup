import { prisma, Prisma } from '@headless/database';
import { resolveSiteContext } from '@/lib/site-context';
import { getMockMedia } from '@/lib/mock-media-store';
import { getAdminSession } from '@/lib/auth';
import { canViewAllMedia } from '@headless/core';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const folderId = searchParams.get('folderId');
  const mimeType = searchParams.get('mimeType') || undefined;
  const search = searchParams.get('q') || undefined;
  const uploaderParam = searchParams.get('uploader');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const adminSession = await getAdminSession(req);
  const canViewAll = adminSession && canViewAllMedia(adminSession.user);

  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    const where: Prisma.MediaWhereInput = {
      siteId,
    };

    if (adminSession && !canViewAll) {
      where.createdById = adminSession.user.id;
    } else if (uploaderParam === 'me' && adminSession) {
      where.createdById = adminSession.user.id;
    }

    if (folderId === 'root') {
      where.folderId = null;
    } else if (folderId) {
      where.folderId = folderId;
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          folder: { select: { id: true, name: true, slug: true } },
          mediaVariants: {
            orderBy: { width: 'asc' },
            select: {
              id: true,
              presetSlug: true,
              width: true,
              height: true,
              format: true,
              quality: true,
              fileSize: true,
              storageProvider: true,
              storageBucket: true,
              storageKey: true,
              publicUrl: true,
            },
          },
          _count: { select: { usages: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: items.map((m) => {
        const meta = (m.metadata || {}) as Record<string, any>;
        return {
          id: m.id,
          filename: m.filename,
          originalName: m.originalName,
          seoName: meta.seoName || m.filename.replace(/\.[^/.]+$/, ''),
          r2ReferenceName: meta.r2ReferenceName || m.storageKey?.split('/').pop() || null,
          mimeType: m.mimeType,
          size: m.size,
          width: m.width,
          height: m.height,
          focalPoint: m.focalPoint,
          focalX: m.focalX,
          focalY: m.focalY,
          originalWidth: m.originalWidth,
          originalHeight: m.originalHeight,
          originalSize: m.originalSize,
          altText: m.altText,
          caption: m.caption,
          description: m.description,
          title: meta.title || null,
          focusKeyword: meta.focusKeyword || null,
          metadata: meta,
          publicUrl: m.publicUrl,
          storageDriver: m.storageDriver,
          storageBucket: m.storageBucket,
          storageKey: m.storageKey,
          variants: m.mediaVariants.map((v) => ({
            ...v,
            r2ReferenceName: v.storageKey ? v.storageKey.split('/').pop() : null,
          })),
          mediaVariants: m.mediaVariants.map((v) => ({
            ...v,
            r2ReferenceName: v.storageKey ? v.storageKey.split('/').pop() : null,
          })),
          folder: m.folder,
          usageCount: m._count.usages,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    // Graceful fallback to mock store when database is offline or unreachable
    const uploaderId =
      adminSession && !canViewAll
        ? adminSession.user.id
        : uploaderParam === 'me' && adminSession
        ? adminSession.user.id
        : undefined;

    const mockResult = getMockMedia({ folderId, mimeType, search, page, limit, uploaderId });
    return NextResponse.json(mockResult);
  }
}
