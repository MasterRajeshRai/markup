import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { changeUserPassword } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const result = await changeUserPassword(session.user.id, currentPassword, newPassword);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to change password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error changing password' },
      { status: 500 }
    );
  }
}
