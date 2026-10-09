import { prisma } from '@headless/database';
import {
  LocalStorageDriver,
  executeMediaPipeline,
  DEFAULT_CROP_PRESETS,
  toSeoFriendlyName,
  detectImageMagicBytes,
  type CropPresetDefinition,
} from '@headless/core/server';
import { getAdminSession } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';
import { addMockMedia, upsertMockJob } from '@/lib/mock-media-store';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';
import { sanitizeFilename } from '@/lib/security/sanitize';
import path from 'node:path';
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

const localStorage = new LocalStorageDriver({
  uploadDir: process.env.STORAGE_LOCAL_PATH || path.join(process.cwd(), 'public/uploads'),
  publicPathPrefix: process.env.STORAGE_PUBLIC_URL || '/uploads',
});

// Dangerous extensions that could execute scripts if requested directly
const DANGEROUS_EXTENSIONS = /\.(html?|svg|xhtml|xml|php\d*|pht|phtml|phar|exe|dll|bat|cmd|sh|cgi|pl|py|jar|jsp|asp|aspx|vbs|js|mjs|cjs|ts)$/i;

// Allowed safe MIME types for upload (SVGs disallowed to prevent stored XSS attacks)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
  'application/zip',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const BITMAP_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const sec = await guard(req, { permission: 'media.upload', rate: RATE_LIMITS.upload });
  if (!sec.ok) return sec.response;
  const adminSession = sec.session;

  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    const formData = await req.formData();
    const folderId = formData.get('folderId') as string | null;
    const requestedSeoName = (formData.get('seoName') as string | null)?.trim() || null;
    const focalXStr = formData.get('focalX') as string | null;
    const focalYStr = formData.get('focalY') as string | null;
    const presetsParam = formData.get('presets') as string | null;

    const focalX = focalXStr ? Math.max(0, Math.min(1, parseFloat(focalXStr))) : 0.5;
    const focalY = focalYStr ? Math.max(0, Math.min(1, parseFloat(focalYStr))) : 0.5;

    // Parse presets list
    let selectedPresets: string[] = [];
    if (presetsParam) {
      selectedPresets = presetsParam
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);
    }

    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      const singleFile = formData.get('file') as File | null;
      if (singleFile) files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
    }

    // Load available crop presets from DB or fallback
    let dbPresets: any[] = [];
    let availablePresets: CropPresetDefinition[] = DEFAULT_CROP_PRESETS;
    try {
      dbPresets = await withTimeout(
        prisma.cropPreset.findMany({
          where: {
            OR: [{ siteId }, { siteId: null }],
          },
        }),
        1000
      );
      if (dbPresets.length > 0) {
        availablePresets = dbPresets.map((p) => ({
          name: p.name,
          slug: p.slug,
          width: p.width,
          height: p.height,
          fit: p.fit === 'contain' ? 'contain' : 'cover',
          isDefault: p.isDefault,
        }));
      }
    } catch {
      availablePresets = DEFAULT_CROP_PRESETS;
    }

    const uploadedAssets = [];
    const jobsCreated: string[] = [];

    for (const file of files) {
      if (DANGEROUS_EXTENSIONS.test(file.name)) {
        return NextResponse.json(
          { error: `File "${file.name}" has an unsafe file extension prohibited for security reasons.` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `File type "${file.type}" is not supported or prohibited for security reasons.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum 50MB size limit.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // If bitmap image, verify magic bytes and route through Auto-Crop -> JPEG -> WebP -> Cloudflare R2 Pipeline
      if (BITMAP_IMAGE_MIMES.has(file.type)) {
        const magic = detectImageMagicBytes(buffer);
        if (!magic || !BITMAP_IMAGE_MIMES.has(magic.mimeType)) {
          return NextResponse.json(
            { error: `File content for "${file.name}" does not match a valid bitmap image.` },
            { status: 400 }
          );
        }
        const tempFileId = crypto.randomUUID();
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        jobsCreated.push(jobId);

        // Record initial job in DB if available, and in mock store
        upsertMockJob({
          id: jobId,
          status: 'PROCESSING',
          progress: 5,
          currentStep: 'validating',
          originalFilename: file.name,
          originalFileSize: file.size,
          selectedPresets: selectedPresets.length > 0 ? selectedPresets : availablePresets.filter((p) => p.isDefault).map((p) => p.slug),
          focalX,
          focalY,
        });

        try {
          await withTimeout(
            prisma.mediaProcessingJob.create({
              data: {
                id: jobId,
                siteId,
                userId: adminSession?.user?.id,
                status: 'PROCESSING',
                tempFileId,
                originalFilename: file.name,
                originalMimeType: file.type,
                originalFileSize: file.size,
                selectedPresets: selectedPresets.length > 0 ? selectedPresets : availablePresets.filter((p) => p.isDefault).map((p) => p.slug),
                focalX,
                focalY,
                progress: 5,
                currentStep: 'validating',
              },
            }),
            1000
          );
        } catch {
          // Continue with in-memory job tracking
        }

        try {
          const seoName = requestedSeoName
            ? toSeoFriendlyName(requestedSeoName)
            : toSeoFriendlyName(file.name);

          const pipelineResult = await executeMediaPipeline({
            fileBuffer: buffer,
            originalFilename: file.name,
            seoName,
            siteId,
            userId: adminSession?.user?.id,
            selectedPresets: selectedPresets.length > 0 ? selectedPresets : undefined,
            availablePresets,
            focalX,
            focalY,
            onProgress: async (evt) => {
              upsertMockJob({
                id: jobId,
                progress: evt.progress,
                currentStep: evt.step,
              });
              try {
                await prisma.mediaProcessingJob.update({
                  where: { id: jobId },
                  data: {
                    progress: evt.progress,
                    currentStep: evt.step,
                  },
                });
              } catch {
                // Handled in mock store
              }
            },
          });

          // Save Media record with SEO friendly image name kept as primary filename
          const humanAltText = seoName
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          let createdMedia: any = null;

          try {
            createdMedia = await withTimeout(
              prisma.media.create({
                data: {
                  id: pipelineResult.mediaId,
                  siteId,
                  folderId: folderId || null,
                  filename: pipelineResult.filename, // SEO friendly image name kept
                  originalName: file.name,
                  mimeType: 'image/webp',
                  size: pipelineResult.originalSize,
                  width: pipelineResult.originalWidth,
                  height: pipelineResult.originalHeight,
                  focalPoint: { x: focalX, y: focalY },
                  focalX,
                  focalY,
                  originalWidth: pipelineResult.originalWidth,
                  originalHeight: pipelineResult.originalHeight,
                  originalSize: pipelineResult.originalSize,
                  originalMimeType: pipelineResult.originalMimeType,
                  storageDriver: pipelineResult.storageProvider,
                  storageBucket: pipelineResult.storageBucket,
                  storageKey: pipelineResult.primaryVariantKey,
                  path: pipelineResult.primaryVariantKey,
                  publicUrl: pipelineResult.primaryPublicUrl,
                  altText: humanAltText,
                  createdById: adminSession?.user?.id,
                  metadata: {
                    seoName: pipelineResult.seoName,
                    r2ReferenceName: pipelineResult.primaryR2ReferenceName,
                    variantsCount: pipelineResult.variants.length,
                    durationMs: pipelineResult.durationMs,
                    tempOriginalDeleted: pipelineResult.tempOriginalDeleted,
                  },
                },
              }),
              1000
            );

            // Save MediaVariant records in DB
            for (const variant of pipelineResult.variants) {
              const matchedPreset = dbPresets.find((p) => p.slug === variant.presetSlug);
              await prisma.mediaVariant.create({
                data: {
                  mediaId: createdMedia.id,
                  presetId: matchedPreset?.id,
                  presetSlug: variant.presetSlug,
                  width: variant.width,
                  height: variant.height,
                  format: 'webp',
                  quality: variant.quality,
                  fileSize: variant.fileSize,
                  storageProvider: variant.storageProvider,
                  storageBucket: variant.storageBucket,
                  storageKey: variant.storageKey,
                  publicUrl: variant.publicUrl,
                },
              });
            }

            // Mark job completed in DB
            await prisma.mediaProcessingJob.update({
              where: { id: jobId },
              data: {
                status: 'COMPLETED',
                progress: 100,
                currentStep: 'completed',
                mediaId: createdMedia.id,
                originalWidth: pipelineResult.originalWidth,
                originalHeight: pipelineResult.originalHeight,
              },
            });
          } catch (dbErr) {
            // Offline fallback: save to mock store
            createdMedia = {
              id: pipelineResult.mediaId,
              filename: pipelineResult.filename,
              originalName: file.name,
              seoName: pipelineResult.seoName,
              r2ReferenceName: pipelineResult.primaryR2ReferenceName,
              mimeType: 'image/webp',
              size: pipelineResult.originalSize,
              width: pipelineResult.originalWidth,
              height: pipelineResult.originalHeight,
              focalPoint: { x: focalX, y: focalY },
              focalX,
              focalY,
              originalWidth: pipelineResult.originalWidth,
              originalHeight: pipelineResult.originalHeight,
              originalSize: pipelineResult.originalSize,
              altText: humanAltText,
              storageDriver: pipelineResult.storageProvider,
              storageBucket: pipelineResult.storageBucket,
              storageKey: pipelineResult.primaryVariantKey,
              publicUrl: pipelineResult.primaryPublicUrl,
              variants: pipelineResult.variants,
              mediaVariants: pipelineResult.variants,
              folderId: folderId || null,
              usageCount: 0,
              metadata: {
                seoName: pipelineResult.seoName,
                r2ReferenceName: pipelineResult.primaryR2ReferenceName,
                variantsCount: pipelineResult.variants.length,
                durationMs: pipelineResult.durationMs,
                tempOriginalDeleted: pipelineResult.tempOriginalDeleted,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            addMockMedia(createdMedia);

            upsertMockJob({
              id: jobId,
              status: 'COMPLETED',
              progress: 100,
              currentStep: 'completed',
              mediaId: createdMedia.id,
              media: createdMedia,
            });
          }

          uploadedAssets.push({
            ...createdMedia,
            variants: pipelineResult.variants,
            jobId,
          });

          // Non-blocking audit log & webhooks
          recordAuditLog({
            siteId,
            actorId: adminSession?.user?.id,
            action: 'media.upload',
            entityType: 'Media',
            entityId: createdMedia.id,
            metadata: {
              filename: file.name,
              size: file.size,
              variantsCount: pipelineResult.variants.length,
              storageDriver: pipelineResult.storageProvider,
            },
            req,
          }).catch(() => {});

          dispatchWebhooks({
            siteId,
            event: 'media.uploaded',
            payload: {
              id: createdMedia.id,
              filename: createdMedia.filename,
              publicUrl: createdMedia.publicUrl,
              variants: pipelineResult.variants.map((v) => ({
                slug: v.presetSlug,
                url: v.publicUrl,
                dimensions: `${v.width}x${v.height}`,
              })),
            },
          }).catch(() => {});
        } catch (procErr) {
          const errorMessage = procErr instanceof Error ? procErr.message : String(procErr);
          upsertMockJob({
            id: jobId,
            status: 'FAILED',
            currentStep: 'failed',
            error: errorMessage,
          });
          try {
            await prisma.mediaProcessingJob.update({
              where: { id: jobId },
              data: {
                status: 'FAILED',
                currentStep: 'failed',
                error: errorMessage,
              },
            });
          } catch {
            // Handled
          }

          // Fallback to local storage so upload always succeeds even if pipeline fails
          try {
            const uploadResult = await localStorage.upload(buffer, file.name, file.type);
            let mediaRecord: any = null;
            try {
              mediaRecord = await withTimeout(
                prisma.media.create({
                  data: {
                    siteId,
                    folderId: folderId || null,
                    filename: path.basename(uploadResult.path),
                    originalName: file.name,
                    mimeType: file.type,
                    size: uploadResult.size,
                    storageDriver: 'local',
                    path: uploadResult.path,
                    publicUrl: uploadResult.publicUrl,
                    altText: file.name.replace(/\.[^/.]+$/, ''),
                    createdById: adminSession?.user?.id,
                  },
                }),
                1000
              );
            } catch {
              mediaRecord = {
                id: `med_${Date.now()}`,
                filename: path.basename(uploadResult.path),
                originalName: file.name,
                mimeType: file.type,
                size: uploadResult.size,
                storageDriver: 'local',
                publicUrl: uploadResult.publicUrl,
                altText: file.name.replace(/\.[^/.]+$/, ''),
                variants: [],
                mediaVariants: [],
                folderId: folderId || null,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              addMockMedia(mediaRecord);
            }
            uploadedAssets.push(mediaRecord);
          } catch (localErr) {
            throw procErr;
          }
        }
      } else {
        // Non-image upload: PDFs, docs, audio, video
        if (file.type === 'application/pdf') {
          if (buffer.length < 5 || buffer.subarray(0, 5).toString('utf-8') !== '%PDF-') {
            return NextResponse.json(
              { error: `File "${file.name}" is not a valid PDF document.` },
              { status: 400 }
            );
          }
        }

        const safeFilename = sanitizeFilename(file.name);
        const uploadResult = await localStorage.upload(buffer, safeFilename, file.type);
        let mediaRecord: any = null;

        try {
          mediaRecord = await withTimeout(
            prisma.media.create({
              data: {
                siteId,
                folderId: folderId || null,
                filename: path.basename(uploadResult.path),
                originalName: safeFilename,
                mimeType: file.type,
                size: uploadResult.size,
                storageDriver: 'local',
                path: uploadResult.path,
                publicUrl: uploadResult.publicUrl,
                altText: safeFilename.replace(/\.[^/.]+$/, ''),
                createdById: adminSession?.user?.id,
              },
            }),
            1000
          );
        } catch {
          mediaRecord = {
            id: `med_${Date.now()}`,
            filename: path.basename(uploadResult.path),
            originalName: safeFilename,
            mimeType: file.type,
            size: uploadResult.size,
            storageDriver: 'local',
            publicUrl: uploadResult.publicUrl,
            altText: safeFilename.replace(/\.[^/.]+$/, ''),
            variants: [],
            mediaVariants: [],
            folderId: folderId || null,
            usageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          addMockMedia(mediaRecord);
        }

        uploadedAssets.push(mediaRecord);
      }
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      jobIds: jobsCreated,
    });
  } catch (err) {
    console.error('[MediaUploadPOST] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process file upload. Please verify file integrity and try again.' },
      { status: 500 }
    );
  }
}
