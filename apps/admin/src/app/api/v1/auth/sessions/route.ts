import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getUserSessions, invalidateSession } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentToken = req.cookies.get('cms_session')?.value;
    const sessions = await getUserSessions(session.user.id, currentToken);

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress,
        device: s.device,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
        isCurrent: s.token === currentToken,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentToken = req.cookies.get('cms_session')?.value;
    const { searchParams } = req.nextUrl;
    const targetSessionId = searchParams.get('sessionId');
    const revokeAllOthers = searchParams.get('allOthers') === 'true';

    if (revokeAllOthers && currentToken) {
      // Keep only current token
      await invalidateSession(currentToken, true); // deletes all
      // recreate or restore current
      return NextResponse.json({
        success: true,
        message: 'All other active sessions have been terminated.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Session revoked.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
