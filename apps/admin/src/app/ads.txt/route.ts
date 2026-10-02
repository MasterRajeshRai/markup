import { NextRequest, NextResponse } from 'next/server';
import { getAdsTxt } from '@/lib/ads-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adsTxt = getAdsTxt();

    return new NextResponse(adsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (e) {
    return new NextResponse('google.com, pub-7489201948271049, DIRECT, f08c47fec0942fa0\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
