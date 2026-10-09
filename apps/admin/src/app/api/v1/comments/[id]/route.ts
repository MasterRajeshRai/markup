import { NextRequest, NextResponse } from 'next/server';
import { loadComments, updateComment, deleteComment } from '@/lib/comments-store';
import { guard } from '@/lib/security/guard';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'comments.read' });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const comments = loadComments();
    const comment = comments.find((c) => c.id === id);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ comment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'comments.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = ['status', 'isPinned', 'content', 'votesCount'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const updated = updateComment(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, comment: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'comments.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const permanent = searchParams.get('permanent') === 'true';

    const success = deleteComment(id, permanent);
    if (!success) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, permanent });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
