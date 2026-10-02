import { NextRequest, NextResponse } from 'next/server';
import { getSliders, saveSlider, duplicateSlider } from '@/lib/slider-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sliders = await getSliders();
    
    // Overview metrics
    const totalSliders = sliders.length;
    const publishedCount = sliders.filter((s) => s.status === 'PUBLISHED').length;
    const totalSlides = sliders.reduce((acc, s) => acc + s.slides.length, 0);
    const activeSlides = sliders.reduce(
      (acc, s) => acc + s.slides.filter((slide) => slide.isActive).length,
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalSliders,
        publishedCount,
        totalSlides,
        activeSlides,
      },
      sliders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'duplicate' && body.sourceSlug) {
      const cloned = await duplicateSlider(body.sourceSlug, body.name, body.slug);
      if (!cloned) {
        return NextResponse.json(
          { success: false, error: 'Source slider not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Slider duplicated successfully',
        slider: cloned,
      });
    }

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Slider name and unique slug are required' },
        { status: 400 }
      );
    }

    // Auto-format slug
    const cleanSlug = body.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    const saved = await saveSlider({
      ...body,
      slug: cleanSlug,
    });

    return NextResponse.json({
      success: true,
      message: 'Slider saved successfully',
      slider: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save slider' },
      { status: 500 }
    );
  }
}
