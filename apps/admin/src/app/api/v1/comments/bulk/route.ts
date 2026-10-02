import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateStatus } from '@/lib/comments-store';
import { CommentStatus } from '@headless/core';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { error: 'ids (array) and status (string) are required' },
        { status: 400 }
      );
    }

    const count = bulkUpdateStatus(ids, status as CommentStatus);

    return NextResponse.json({ success: true, count, status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk comment update' },
      { status: 500 }
    );
  }
}
