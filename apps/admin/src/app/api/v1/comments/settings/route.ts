import { NextRequest, NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/comments-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = loadSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load comment settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const current = loadSettings();
    const updated = { ...current, ...body };
    saveSettings(updated);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update comment settings' },
      { status: 500 }
    );
  }
}
