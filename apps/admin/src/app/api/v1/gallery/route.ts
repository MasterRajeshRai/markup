import { NextRequest, NextResponse } from 'next/server';
import { galleryService } from '@/lib/gallery-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumSlug = searchParams.get('album') || searchParams.get('slug');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (albumSlug) {
      const album = await galleryService.getAlbumBySlug(albumSlug);
      if (!album) {
        return NextResponse.json({ success: false, error: 'Album not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, album });
    }

    let albums = await galleryService.getAllAlbums();

    if (category && category !== 'all') {
      albums = albums.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      albums = albums.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      total: albums.length,
      albums,
    });
  } catch (error: any) {
    console.error('Gallery API GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check for R2 sync trigger
    if (body.action === 'sync_r2') {
      const result = await galleryService.triggerR2Sync(body.slug);
      return NextResponse.json({ success: true, result });
    }

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Album name is required' }, { status: 400 });
    }

    const created = await galleryService.createAlbum({
      name: body.name,
      slug: body.slug,
      category: body.category,
      subtitle: body.subtitle,
      description: body.description,
      coverImage: body.coverImage,
      eventDate: body.eventDate,
      photos: body.photos,
    });

    return NextResponse.json({ success: true, album: created }, { status: 201 });
  } catch (error: any) {
    console.error('Gallery API POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.slug) {
      return NextResponse.json({ success: false, error: 'Album slug is required' }, { status: 400 });
    }

    const updated = await galleryService.updateAlbum(body.slug, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, album: updated });
  } catch (error: any) {
    console.error('Gallery API PUT error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Album slug is required' }, { status: 400 });
    }

    const deleted = await galleryService.deleteAlbum(slug);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Gallery API DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
