import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = pathSegments.join('/');

    // Prevent directory traversal attacks
    if (relativePath.includes('..')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const mockDir = path.resolve(process.cwd(), 'uploads/r2-mock');
    const fullPath = path.join(mockDir, relativePath);

    try {
      const fileBuffer = await fs.readFile(fullPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return new NextResponse('File Not Found', { status: 404 });
    }
  } catch (err) {
    console.error('[MockR2GET] Error:', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
