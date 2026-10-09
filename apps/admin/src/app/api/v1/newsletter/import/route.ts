import { NextRequest, NextResponse } from 'next/server';
import { importSubscribers } from '@/lib/newsletter-service';
import { guard } from '@/lib/security/guard';

export async function POST(request: NextRequest) {
  const sec = await guard(request, { permission: 'newsletter.manage' });
  if (!sec.ok) return sec.response;
  try {
    const body = await request.json();
    if (!body.rawText) {
      return NextResponse.json({ success: false, error: 'Raw text or CSV content is required.' }, { status: 400 });
    }

    const defaultTags = Array.isArray(body.tags) ? body.tags : [];
    const report = await importSubscribers(body.rawText, defaultTags);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
