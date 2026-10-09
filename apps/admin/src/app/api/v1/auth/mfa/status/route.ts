import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sec = await guard(req, { rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;

  return NextResponse.json({
    success: true,
    enabled: Boolean(sec.user.twoFactorEnabled),
  });
}
