import { prisma } from '@headless/database';
import { getMockJob } from '@/lib/mock-media-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    let job: any = null;
    try {
      job = await prisma.mediaProcessingJob.findUnique({
        where: { id: jobId },
        include: {
          media: {
            include: {
              mediaVariants: true,
            },
          },
        },
      });
    } catch {
      // Prisma offline, fallback to mock store
    }

    if (!job) {
      job = getMockJob(jobId);
    }

    if (!job) {
      return NextResponse.json({ error: 'Processing job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      originalFilename: job.originalFilename,
      originalFileSize: job.originalFileSize,
      originalWidth: job.originalWidth,
      originalHeight: job.originalHeight,
      selectedPresets: job.selectedPresets,
      focalX: job.focalX,
      focalY: job.focalY,
      error: job.error,
      mediaId: job.mediaId,
      media: job.media,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  } catch (err) {
    console.error('[MediaJobGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve job status' }, { status: 500 });
  }
}
