import { getAdminSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    });
  } catch (err) {
    console.error('[AuthMe] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
