import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    // In production, integrate with SendGrid, Mailchimp, ConvertKit, or local subscriber table
    // For now, securely acknowledge subscription
    return NextResponse.json({
      success: true,
      message: `You're all set! ${email} has been subscribed to Media Bird Weekly.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription request.' },
      { status: 500 }
    );
  }
}
