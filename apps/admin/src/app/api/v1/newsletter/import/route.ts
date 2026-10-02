import { NextRequest, NextResponse } from 'next/server';
import { importSubscribers } from '@/lib/newsletter-service';

export async function POST(request: NextRequest) {
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
