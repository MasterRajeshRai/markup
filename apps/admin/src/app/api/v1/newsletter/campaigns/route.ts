import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaigns,
  saveCampaign,
  sendCampaignBroadcast,
  deleteCampaign,
} from '@/lib/newsletter-service';
import { guard } from '@/lib/security/guard';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { permission: 'newsletter.manage' });
  if (!sec.ok) return sec.response;
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sec = await guard(request, { permission: 'newsletter.manage' });
  if (!sec.ok) return sec.response;
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

export async function DELETE(request: NextRequest) {
  const sec = await guard(request, { permission: 'newsletter.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Campaign ID is required.' }, { status: 400 });

    const deleted = await deleteCampaign(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
