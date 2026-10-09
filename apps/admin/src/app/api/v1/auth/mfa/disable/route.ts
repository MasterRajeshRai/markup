import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { disableUserMfa } from '@/lib/auth-service';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sec = await guard(req, { rate: RATE_LIMITS.strict });
  if (!sec.ok) return sec.response;

  try {
    const body = await req.json();
    const { currentPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to disable two-factor authentication' },
        { status: 400 }
      );
    }

    const result = await disableUserMfa(sec.user.id, String(currentPassword));
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to disable two-factor authentication' },
        { status: 400 }
      );
    }

    try {
      await recordAuditLog({
        actorId: sec.user.id,
        action: 'auth.mfa_disabled',
        entityType: 'User',
        entityId: sec.user.id,
        req,
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been disabled.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}
