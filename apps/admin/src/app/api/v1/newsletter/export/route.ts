import { NextResponse } from 'next/server';
import { exportSubscribersCsv } from '@/lib/newsletter-service';
import type { NextRequest } from 'next/server';
import { guard } from '@/lib/security/guard';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { permission: 'newsletter.manage' });
  if (!sec.ok) return sec.response;
  try {
    const csv = await exportSubscribersCsv();
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
