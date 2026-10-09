import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetRequest } from '@/lib/auth-service';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.passwordReset });
  if (!sec.ok) return sec.response;
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || 'http://localhost:3001';
    const result = await createPasswordResetRequest(email, origin);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
