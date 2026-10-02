import { prisma } from '@headless/database';
import { getAdminSession } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    const searchParams = req.nextUrl.searchParams;
    const logoutAll = searchParams.get('all') === 'true';

    if (session) {
      try {
        if (logoutAll) {
          await prisma.session.deleteMany({
            where: { userId: session.user.id },
          });
        } else {
          await prisma.session.delete({
            where: { id: session.sessionId },
          });
        }
      } catch {
        // Handled by fallback store
      }

      try {
        const { invalidateSession } = await import('@/lib/auth-service');
        const token = req.cookies.get('cms_session')?.value;
        if (token) {
          await invalidateSession(token, logoutAll);
        }
      } catch {
        // Fallback cleanup
      }

      try {
        await recordAuditLog({
          actorId: session.user.id,
          action: logoutAll ? 'auth.logout_all' : 'auth.logout',
          entityType: 'User',
          entityId: session.user.id,
          req,
        });
      } catch {
        // Ignore audit log failure during logout
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('cms_session');
    return response;
  } catch (err) {
    console.error('[AuthLogout] Error:', err);
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.delete('cms_session');
    return response;
  }
}
