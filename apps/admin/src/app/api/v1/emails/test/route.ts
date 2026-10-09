import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getEmailSettings } from '@/lib/email-service';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const sec = await guard(request, { permission: 'email.manage', rate: RATE_LIMITS.email });
  if (!sec.ok) return sec.response;
  try {
    const body = await request.json();
    const toEmail = body.to || 'test@example.com';
    const settings = await getEmailSettings();

    const res = await sendEmail({
      to: toEmail,
      subject: 'Resend Email Gateway Verification Ping',
      templateSlug: 'system-test-ping',
      variables: {
        timestamp: new Date().toLocaleString(),
        senderDomain: settings.fromEmail.split('@')[1] || 'updates.headless-cms.io',
        resendEnvironment: settings.sandboxMode ? 'Sandbox / Simulator Mode' : 'Live Production API',
      },
    });

    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
