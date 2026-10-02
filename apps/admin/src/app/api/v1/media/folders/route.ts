import { prisma } from '@headless/database';
import { resolveSiteContext } from '@/lib/site-context';
import { getMockFolders, addMockFolder, deleteMockFolder } from '@/lib/mock-media-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    const folders = await prisma.mediaFolder.findMany({
      where: { siteId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { media: true, children: true } },
      },
    });

    return NextResponse.json({ data: folders });
  } catch (err) {
    return NextResponse.json({ data: getMockFolders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    const body = await req.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    try {
      const folder = await prisma.mediaFolder.create({
        data: {
          siteId,
          name,
          slug,
          parentId: parentId || null,
        },
      });
      return NextResponse.json({ success: true, folder }, { status: 201 });
    } catch {
      const folder = addMockFolder({ name, parentId });
      return NextResponse.json({ success: true, folder }, { status: 201 });
    }
  } catch (err) {
    console.error('[MediaFoldersPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    try {
      await prisma.mediaFolder.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Folder deleted' });
    } catch {
      deleteMockFolder(id);
      return NextResponse.json({ success: true, message: 'Folder deleted' });
    }
  } catch (err) {
    console.error('[MediaFoldersDELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}

