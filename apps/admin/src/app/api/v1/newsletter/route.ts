import { NextRequest, NextResponse } from 'next/server';
import {
  getNewsletterStats,
  getCampaigns,
  subscribePublic,
} from '@/lib/newsletter-service';

export async function GET() {
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
  try {
    const body = await request.json();
    const result = await subscribePublic(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
