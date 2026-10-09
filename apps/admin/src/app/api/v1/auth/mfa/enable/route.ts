import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { enableUserMfa } from '@/lib/auth-service';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sec = await guard(req, { rate: RATE_LIMITS.strict });
  if (!sec.ok) return sec.response;

  try {
    const body = await req.json();
    const { secret, code } = body;

    if (!secret || !code) {
      return NextResponse.json(
        { error: 'Secret and verification code are required' },
        { status: 400 }
      );
    }

    const result = await enableUserMfa(sec.user.id, String(secret).trim(), String(code).trim());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to verify and activate MFA' },
        { status: 400 }
      );
    }

    try {
      await recordAuditLog({
        actorId: sec.user.id,
        action: 'auth.mfa_enabled',
        entityType: 'User',
        entityId: sec.user.id,
        req,
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      backupCodes: result.backupCodes,
      message: 'Two-factor authentication successfully enabled.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to enable MFA' },
      { status: 500 }
    );
  }
}
