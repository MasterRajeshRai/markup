import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { setupUserMfa } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sec = await guard(req, { rate: RATE_LIMITS.strict });
  if (!sec.ok) return sec.response;

  try {
    const setup = await setupUserMfa(sec.user.id);
    if (!setup) {
      return NextResponse.json(
        { error: 'Failed to initialize MFA setup' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      secret: setup.secret,
      otpauthUri: setup.otpauthUri,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to initiate MFA setup' },
      { status: 500 }
    );
  }
}
