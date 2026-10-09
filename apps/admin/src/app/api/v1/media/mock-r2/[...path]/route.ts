import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { safePathSegments } from '@/lib/security/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.api });
  if (!sec.ok) return sec.response;
  try {
    const { path: pathSegments } = await params;
    const safeSegments = safePathSegments(pathSegments);
    if (!safeSegments) {
      return new NextResponse('Forbidden: Invalid path', { status: 403 });
    }

    const mockDir = path.resolve(process.cwd(), 'uploads/r2-mock');
    const fullPath = path.resolve(mockDir, safeSegments.join(path.sep));

    // Ensure resolved path is strictly contained within mockDir
    if (!fullPath.startsWith(mockDir + path.sep) && fullPath !== mockDir) {
      return new NextResponse('Forbidden: Path traversal detected', { status: 403 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.avif': 'image/avif',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    try {
      const fileBuffer = await fs.readFile(fullPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff',
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
