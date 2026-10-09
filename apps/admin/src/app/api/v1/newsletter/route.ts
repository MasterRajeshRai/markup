import { NextRequest, NextResponse } from 'next/server';
import {
  getNewsletterStats,
  getCampaigns,
  subscribePublic,
} from '@/lib/newsletter-service';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { permission: 'newsletter.read' });
  if (!sec.ok) return sec.response;
  try {
    const stats = await getNewsletterStats();
    const campaigns = await getCampaigns();

    return NextResponse.json({
      success: true,
      stats,
      campaigns,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sec = await guard(request, { public: true, rate: RATE_LIMITS.publicWrite });
  if (!sec.ok) return sec.response;
  try {
    const body = await request.json();
    const result = await subscribePublic(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
