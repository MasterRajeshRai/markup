import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaigns,
  saveCampaign,
  sendCampaignBroadcast,
} from '@/lib/newsletter-service';

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an immediate broadcast dispatch
    if (body.action === 'send' && body.campaignId) {
      const result = await sendCampaignBroadcast(body.campaignId);
      return NextResponse.json(result);
    }

    const campaign = await saveCampaign(body);
    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
