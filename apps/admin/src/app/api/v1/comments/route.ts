import { NextRequest, NextResponse } from 'next/server';
import {
  getComments,
  addComment,
  GetCommentsOptions,
} from '@/lib/comments-store';
import { resolveSiteContext } from '@/lib/site-context';
import { CommentStatus } from '@headless/core';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req).catch(() => null);
    const { searchParams } = req.nextUrl;

    const contentEntryId = searchParams.get('contentEntryId') || undefined;
    const statusParam = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = (searchParams.get('sortBy') as any) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';
    const threaded = searchParams.get('threaded') === 'true';

    const options: GetCommentsOptions = {
      siteId: site?.id || 'site-default',
      contentEntryId,
      status: statusParam as CommentStatus | 'ALL',
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      threaded,
    };

    const result = getComments(options);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CommentsGET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve comments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req).catch(() => null);
    const body = await req.json();

    const {
      contentEntryId,
      contentEntryTitle,
      contentEntrySlug,
      parentId,
      author,
      content,
    } = body;

    if (!contentEntryId || !content || !author?.name || !author?.email) {
      return NextResponse.json(
        { error: 'contentEntryId, content, author.name, and author.email are required' },
        { status: 400 }
      );
    }

    // Capture telemetry
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    const newComment = addComment({
      siteId: site?.id || 'site-default',
      contentEntryId,
      contentEntryTitle,
      contentEntrySlug,
      parentId: parentId || null,
      author: {
        name: author.name,
        email: author.email,
        avatarUrl: author.avatarUrl,
        website: author.website,
        role: author.role || (author.isGuest ? 'guest' : 'member'),
        isGuest: author.isGuest ?? true,
        isVerified: author.isVerified ?? false,
      },
      content,
      clientIp,
      userAgent,
      location: 'Online Client',
    });

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
  } catch (error: any) {
    console.error('[CommentsPOST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit comment' },
      { status: 500 }
    );
  }
}
