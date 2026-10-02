import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetRequest } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
