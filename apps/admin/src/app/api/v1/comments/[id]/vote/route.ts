import { NextRequest, NextResponse } from 'next/server';
import { voteComment } from '@/lib/comments-store';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.publicWrite });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const delta = typeof body.delta === 'number' ? body.delta : 1;

    const updated = voteComment(id, delta);
    if (!updated) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, votesCount: updated.votesCount });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to vote on comment' },
      { status: 500 }
    );
  }
}
