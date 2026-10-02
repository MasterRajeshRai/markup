import { authenticateUser } from '@/lib/auth-service';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || undefined;

    const result = await authenticateUser(
      email,
      password,
      Boolean(rememberMe),
      ipAddress,
      userAgent
    );

    if (!result.success || !result.token || !result.user) {
      const status = result.lockedUntil ? 429 : 401;
      return NextResponse.json(
        {
          error: result.error || 'Invalid email or password',
          lockedUntil: result.lockedUntil,
        },
        { status }
      );
    }

    // Try recording audit log
    try {
      await recordAuditLog({
        actorId: result.user.id,
        action: 'auth.login',
        entityType: 'User',
        entityId: result.user.id,
        req,
      });
    } catch {
      // In-memory or offline audit log fallback
    }

    const response = NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
      expiresAt: result.expiresAt,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('cms_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.expiresAt,
    });

    return response;
  } catch (err: any) {
    console.error('[AuthLogin] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
