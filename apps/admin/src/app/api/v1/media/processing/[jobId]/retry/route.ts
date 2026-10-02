import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'media.upload');
    if (!guard.authorized) return guard.response!;

    const job = await prisma.mediaProcessingJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'FAILED') {
      return NextResponse.json(
        { error: `Job is currently in "${job.status}" state, only FAILED jobs can be retried.` },
        { status: 400 }
      );
    }

    // Per enterprise security constraints, original file was deleted after upload failure or success.
    // If temp file was purged, notify client to re-upload.
    return NextResponse.json(
      {
        message: 'Per zero-orphan security policy, original image data is discarded upon processing failure. Please re-upload the image with your chosen crop presets.',
        jobId: job.id,
        canRetryInPlace: false,
      },
      { status: 410 }
    );
  } catch (err) {
    console.error('[MediaJobRetryPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to process job retry' }, { status: 500 });
  }
}
