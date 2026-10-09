import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { getUserSessions, revokeAllOtherSessions, revokeSessionById } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sec = await guard(req, { rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;

  try {
    const currentToken = req.cookies.get('cms_session')?.value;
    const sessions = await getUserSessions(sec.user.id, currentToken);

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const sec = await guard(req, { rate: RATE_LIMITS.strict });
  if (!sec.ok) return sec.response;

  try {
    const currentToken = req.cookies.get('cms_session')?.value;
    const { searchParams } = req.nextUrl;
    const targetSessionId = searchParams.get('sessionId');
    const revokeAllOthers = searchParams.get('allOthers') === 'true';

    if (revokeAllOthers) {
      const revokedCount = await revokeAllOtherSessions(sec.user.id, currentToken);
      return NextResponse.json({
        success: true,
        message: 'All other active sessions have been terminated.',
        revokedCount,
      });
    }

    if (targetSessionId) {
      const success = await revokeSessionById(sec.user.id, targetSessionId);
      if (!success) {
        return NextResponse.json(
          { error: 'Session not found or cannot revoke active session' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Session revoked.',
      });
    }

    return NextResponse.json(
      { error: 'Missing sessionId or allOthers parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
