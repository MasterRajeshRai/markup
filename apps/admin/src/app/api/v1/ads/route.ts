import { NextRequest, NextResponse } from 'next/server';
import {
  AdUnitItem,
  AdSenseSettings,
  getAdsConfig,
  updateAdsConfig,
  getAdUnits,
  setAdUnitsList,
  addAdUnit,
  deleteAdUnit,
  getAdsTxt,
  setAdsTxtContent,
  getAdsAnalytics,
} from '@/lib/ads-service';
import { guard } from '@/lib/security/guard';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { permission: 'ads.manage', apiKeyScope: 'content:read' });
  if (!sec.ok) return sec.response;
  const settings = getAdsConfig();
  const adUnits = getAdUnits();
  const adsTxt = getAdsTxt();
  const analytics = getAdsAnalytics();

  return NextResponse.json({
    success: true,
    settings,
    adUnits,
    adsTxt,
    analytics,
  });
}

export async function PUT(req: NextRequest) {
  const sec = await guard(req, { permission: 'ads.manage' });
  if (!sec.ok) return sec.response;
  try {
    const body = await req.json();
    const { settings, adUnits, adsTxt } = body;

    if (settings) {
      updateAdsConfig(settings);
    }
    if (Array.isArray(adUnits)) {
      setAdUnitsList(adUnits);
    }
    if (typeof adsTxt === 'string') {
      setAdsTxtContent(adsTxt);
    }

    return NextResponse.json({
      success: true,
      message: 'AdSense settings & ad units updated successfully.',
      settings: getAdsConfig(),
      adUnits: getAdUnits(),
      adsTxt: getAdsTxt(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update ads config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sec = await guard(req, { permission: 'ads.manage' });
  if (!sec.ok) return sec.response;
  try {
    const body = await req.json();
    const { name, slotId, placement, format, deviceTargeting, customFallbackHtml } = body;

    if (!name || !slotId) {
      return NextResponse.json({ error: 'Name and Slot ID are required' }, { status: 400 });
    }

    const currentUnits = getAdUnits();
    const newUnit: AdUnitItem = {
      id: `ad_${Date.now()}`,
      name,
      slotId,
      placement: placement || 'in_article',
      format: format || 'responsive',
      deviceTargeting: deviceTargeting || 'all',
      isActive: true,
      priority: currentUnits.length + 1,
      impressions30d: 0,
      clicks30d: 0,
      ctr: 0,
      earnings30d: 0,
      customFallbackHtml: customFallbackHtml || undefined,
    };

    addAdUnit(newUnit);

    return NextResponse.json({ success: true, adUnit: newUnit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create ad unit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sec = await guard(req, { permission: 'ads.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ad unit id is required' }, { status: 400 });
    }

    const removed = deleteAdUnit(id);
    if (!removed) {
      return NextResponse.json({ error: 'Ad unit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Ad unit ${id} deleted successfully.`,
      adUnits: getAdUnits(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete ad unit' }, { status: 500 });
  }
}
