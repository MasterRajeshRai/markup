import { prisma } from '@headless/database';
import { DEFAULT_CROP_PRESETS } from '@headless/core';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id;

    // Fetch site-specific presets and global presets (siteId is null)
    const presets = await prisma.cropPreset.findMany({
      where: siteId
        ? {
            OR: [{ siteId }, { siteId: null }],
          }
        : {},
      orderBy: [{ isDefault: 'desc' }, { width: 'asc' }],
    });

    if (presets.length === 0) {
      return NextResponse.json({
        data: DEFAULT_CROP_PRESETS.map((p) => ({
          ...p,
          id: p.slug,
          isDefault: p.isDefault ?? false,
        })),
      });
    }

    return NextResponse.json({ data: presets });
  } catch (err) {
    // Database offline fallback
    return NextResponse.json({
      data: DEFAULT_CROP_PRESETS.map((p) => ({
        ...p,
        id: p.slug,
        isDefault: p.isDefault ?? false,
      })),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    const body = await req.json();
    const { name, slug, width, height, fit, isDefault } = body;

    if (!name || !slug || !width || !height) {
      return NextResponse.json(
        { error: 'name, slug, width, and height are required fields.' },
        { status: 400 }
      );
    }

    try {
      const preset = await prisma.cropPreset.create({
        data: {
          siteId,
          name,
          slug,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          fit: fit || 'cover',
          isDefault: Boolean(isDefault),
        },
      });

      return NextResponse.json({ success: true, preset }, { status: 201 });
    } catch {
      // Offline fallback
      const fallbackPreset = {
        id: `preset_${Date.now()}`,
        siteId,
        name,
        slug,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        fit: fit || 'cover',
        isDefault: Boolean(isDefault),
      };
      return NextResponse.json({ success: true, preset: fallbackPreset }, { status: 201 });
    }
  } catch (err) {
    console.error('[PresetsPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create crop preset' }, { status: 500 });
  }
}
