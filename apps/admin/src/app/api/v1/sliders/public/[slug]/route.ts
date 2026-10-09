import { NextRequest, NextResponse } from 'next/server';
import { getPublicSlider } from '@/lib/slider-service';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const sec = await guard(_req, { public: true, rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;
  try {
    const { slug } = await params;
    const payload = await getPublicSlider(slug);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: `Slider with slug '${slug}' was not found or is currently inactive.`,
        },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ...payload,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error delivering slider' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
