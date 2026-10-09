import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/lib/auth-service';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.passwordReset });
  if (!sec.ok) return sec.response;
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(token, newPassword);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to reset password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
