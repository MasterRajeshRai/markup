import { NextRequest, NextResponse } from 'next/server';
import { verifyMfaChallenge } from '@/lib/auth-service';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.login });
  if (!sec.ok) return sec.response;

  try {
    const body = await req.json();
    const { mfaToken, code } = body;

    if (!mfaToken || !code) {
      return NextResponse.json(
        { error: 'mfaToken and verification code are required' },
        { status: 400 }
      );
    }

    const result = await verifyMfaChallenge(mfaToken, String(code).trim());
    if (!result.success || !result.token || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Invalid or expired verification code' },
        { status: 401 }
      );
    }

    try {
      await recordAuditLog({
        actorId: result.user.id,
        action: 'auth.mfa_login',
        entityType: 'User',
        entityId: result.user.id,
        req,
      });
    } catch {
      // Offline fallback
    }

    const response = NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
      expiresAt: result.expiresAt,
    });

    response.cookies.set('cms_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.expiresAt,
    });

    return response;
  } catch (err: any) {
    console.error('[MFAVerify] Error:', err);
    return NextResponse.json(
      { error: err.message || 'MFA challenge verification failed' },
      { status: 500 }
    );
  }
}
