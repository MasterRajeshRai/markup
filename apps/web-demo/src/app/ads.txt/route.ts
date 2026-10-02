import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cmsUrl = process.env.CMS_BASE_URL
    ? process.env.CMS_BASE_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:3000';

  try {
    const res = await fetch(`${cmsUrl}/ads.txt`, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch {
    // Fallback default
  }

  return new NextResponse('google.com, pub-7489201948271049, DIRECT, f08c47fec0942fa0\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
