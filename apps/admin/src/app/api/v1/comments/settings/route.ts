import { NextRequest, NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/comments-store';
import { guard } from '@/lib/security/guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sec = await guard(request, {});
  if (!sec.ok) return sec.response;
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
  const sec = await guard(req, { permission: 'comments.manage' });
  if (!sec.ok) return sec.response;
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
