import { NextRequest, NextResponse } from 'next/server';
import { getSliderBySlug, saveSlider, deleteSlider } from '@/lib/slider-service';
import { guard } from '@/lib/security/guard';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const sec = await guard(_req, { permission: 'sliders.read', apiKeyScope: 'content:read' });
  if (!sec.ok) return sec.response;
  try {
    const { slug } = await params;
    const slider = await getSliderBySlug(slug);

    if (!slider) {
      return NextResponse.json(
        { success: false, error: 'Slider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      slider,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch slider' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const sec = await guard(req, { permission: 'sliders.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { slug } = await params;
    const body = await req.json();

    const existing = await getSliderBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Slider not found' },
        { status: 404 }
      );
    }

    const updated = await saveSlider({
      ...existing,
      ...body,
      id: existing.id,
      slug: existing.slug, // keep consistent slug or update if explicitly specified
    });

    return NextResponse.json({
      success: true,
      message: 'Slider updated successfully',
      slider: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update slider' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const sec = await guard(_req, { permission: 'sliders.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { slug } = await params;
    const deleted = await deleteSlider(slug);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Slider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slider deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete slider' },
      { status: 500 }
    );
  }
}
