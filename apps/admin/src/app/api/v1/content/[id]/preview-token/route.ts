import { prisma } from '@headless/database';
import { createPreviewToken } from '@headless/core';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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

    const entry = await prisma.contentEntry.findFirst({
      where: { siteId: site.id, id },
    });

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    const secret = process.env.PREVIEW_SECRET || 'preview-secret';
    const previewToken = createPreviewToken(entry.id, secret, 120); // 2 hours

    return NextResponse.json({
      success: true,
      entryId: entry.id,
      previewToken,
      previewUrl: `/preview?token=${previewToken}&entryId=${entry.id}`,
    });
  } catch (err) {
    console.error('[PreviewTokenPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to generate preview token' }, { status: 500 });
  }
}
