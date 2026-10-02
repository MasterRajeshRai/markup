import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { validateImage } from './validation';
import { processVariant, normalizeImage } from './processor';
import { DEFAULT_CROP_PRESETS, type CropPresetDefinition } from './presets';
import { CloudflareR2Storage, type R2Config } from '../storage/r2';
import { toSeoFriendlyName } from './naming';

export type PipelineStep = 'validating' | 'cropping' | 'converting' | 'uploading' | 'verifying' | 'cleaning' | 'completed' | 'failed';

export interface PipelineProgressEvent {
  step: PipelineStep;
  progress: number; // 0 - 100
  message: string;
  presetSlug?: string;
}

export interface MediaPipelineInput {
  fileBuffer: Buffer;
  originalFilename: string;
  seoName?: string; // SEO-friendly name slug to keep
  siteId?: string;
  userId?: string;
  selectedPresets?: string[]; // Presets slugs to generate
  availablePresets?: CropPresetDefinition[]; // From DB or defaults
  focalX?: number; // 0.0 - 1.0 (default 0.5)
  focalY?: number; // 0.0 - 1.0 (default 0.5)
  tempDir?: string;
  r2Config?: R2Config;
  onProgress?: (event: PipelineProgressEvent) => void;
}

export interface UploadedVariantResult {
  presetSlug: string;
  presetName: string;
  width: number;
  height: number;
  format: 'webp';
  quality: number;
  fileSize: number;
  intermediateJpegSize: number;
  storageProvider: string;
  storageBucket: string;
  storageKey: string;
  publicUrl: string;
  seoName: string;
  r2ReferenceName: string;
}

export interface MediaPipelineResult {
  mediaId: string;
  tempFileId: string;
  originalName: string;
  seoName: string;
  filename: string;
  primaryR2ReferenceName: string;
  originalMimeType: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  focalX: number;
  focalY: number;
  primaryVariantKey: string;
  primaryPublicUrl: string;
  storageProvider: string;
  storageBucket: string;
  variants: UploadedVariantResult[];
  tempOriginalDeleted: boolean;
  durationMs: number;
}

/**
 * Enterprise Media Processing Pipeline
 * Coordinates:
 * Temp Storage -> Validation -> Crop -> JPEG -> WebP -> R2 Upload -> R2 Verify -> Cleanup
 * Original file is NEVER permanently stored!
 */
export async function executeMediaPipeline(input: MediaPipelineInput): Promise<MediaPipelineResult> {
  const startTime = Date.now();
  const tempFileId = crypto.randomUUID();
  const mediaId = crypto.randomUUID();
  const focalX = input.focalX ?? 0.5;
  const focalY = input.focalY ?? 0.5;
  const siteId = input.siteId || 'default';

  const tempDir = input.tempDir || path.join(os.tmpdir(), 'cms-temp-uploads');
  await fs.mkdir(tempDir, { recursive: true });

  const sanitizedFilename = input.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const tempOriginalPath = path.join(tempDir, `${tempFileId}_${sanitizedFilename}`);

  const r2 = new CloudflareR2Storage(input.r2Config);
  const uploadedKeys: string[] = [];
  let tempOriginalSaved = false;

  const emit = (step: PipelineStep, progress: number, message: string, presetSlug?: string) => {
    if (input.onProgress) {
      input.onProgress({ step, progress, message, presetSlug });
    }
  };

  try {
    // 1. Write file to temporary storage
    emit('validating', 10, 'Writing upload to temporary workspace and inspecting magic bytes...');
    await fs.writeFile(tempOriginalPath, input.fileBuffer);
    tempOriginalSaved = true;

    // 2. Validate original image (magic bytes, dimensions, bomb limit)
    const validation = await validateImage(input.fileBuffer);
    if (!validation.valid) {
      throw new Error(`Image validation failed: ${validation.error}`);
    }

    // 3. Resolve presets to apply
    const allPresets = input.availablePresets?.length ? input.availablePresets : DEFAULT_CROP_PRESETS;
    let targetPresets: CropPresetDefinition[];

    if (input.selectedPresets && input.selectedPresets.length > 0) {
      targetPresets = allPresets.filter((p) => input.selectedPresets!.includes(p.slug));
      if (targetPresets.length === 0) {
        targetPresets = allPresets.filter((p) => p.isDefault);
      }
    } else {
      targetPresets = allPresets.filter((p) => p.isDefault);
      if (targetPresets.length === 0) {
        targetPresets = allPresets.slice(0, 4); // Fallback to first 4 presets
      }
    }

    emit('cropping', 25, `Preparing ${targetPresets.length} crop variations with focal point (${focalX}, ${focalY})...`);

    // 4. Resolve SEO-friendly name and normalize EXIF orientation
    const seoName = toSeoFriendlyName(input.seoName || input.originalFilename);
    const { buffer: normalizedBuffer, width: origW, height: origH } = await normalizeImage(input.fileBuffer);

    // 5. Process each preset: Crop -> JPEG -> WebP -> R2 Upload -> Verify
    const variants: UploadedVariantResult[] = [];
    const totalPresets = targetPresets.length;

    for (let i = 0; i < totalPresets; i++) {
      const preset = targetPresets[i];
      const baseProgress = 25 + Math.round(((i) / totalPresets) * 65);

      emit('cropping', baseProgress, `Auto-cropping ${preset.name} (${preset.width}x${preset.height}, ${preset.fit})...`, preset.slug);

      // Crop and convert: Sharp pipeline: Crop -> JPEG -> WebP
      emit('converting', baseProgress + 5, `Converting ${preset.name} to WebP...`, preset.slug);
      const processed = await processVariant(normalizedBuffer, origW, origH, preset, {
        focalX,
        focalY,
      });

      // Storage Key: media/sites/{siteId}/images/{year}/{month}/{seoName}/{seoName}-{presetSlug}-r2-{referenceId}.webp
      // Keeps SEO-friendly name first, and Cloudflare R2 friendly reference name at last
      const storageKey = r2.generateKey(siteId, mediaId, preset.slug, 'webp', seoName);
      const r2ReferenceName = path.basename(storageKey);

      // Upload WebP buffer to Cloudflare R2
      emit('uploading', baseProgress + 10, `Uploading ${preset.name} WebP to Cloudflare R2...`, preset.slug);
      const uploadResult = await r2.upload(processed.buffer, storageKey, 'image/webp');
      uploadedKeys.push(storageKey);

      // Verify R2 Upload via HeadObject
      emit('verifying', baseProgress + 12, `Verifying ${preset.name} in R2 storage...`, preset.slug);
      const verified = await r2.verifyUpload(storageKey);
      if (!verified) {
        throw new Error(`R2 verification failed for key: ${storageKey}. Asset not found or zero length.`);
      }

      variants.push({
        presetSlug: preset.slug,
        presetName: preset.name,
        width: processed.width,
        height: processed.height,
        format: 'webp',
        quality: processed.quality,
        fileSize: processed.size,
        intermediateJpegSize: processed.intermediateJpegSize,
        storageProvider: uploadResult.provider,
        storageBucket: r2.getBucketName(),
        storageKey,
        publicUrl: uploadResult.publicUrl,
        seoName,
        r2ReferenceName,
      });
    }

    // 6. Mandatory Cleanup: Delete Temporary Original Uploaded File & Intermediate Artifacts
    emit('cleaning', 95, 'Purging temporary files and ensuring original image is deleted...');
    let tempOriginalDeleted = false;
    try {
      await fs.unlink(tempOriginalPath);
      tempOriginalDeleted = true;
    } catch {
      // File may already be unlinked
    }

    emit('completed', 100, `Successfully generated and uploaded ${variants.length} WebP variants.`);

    // Choose primary variant (hero > medium > card > thumbnail > first variant)
    const primary =
      variants.find((v) => v.presetSlug === 'card') ||
      variants.find((v) => v.presetSlug === 'medium') ||
      variants.find((v) => v.presetSlug === 'hero') ||
      variants[0];

    const primaryR2ReferenceName = path.basename(primary.storageKey);

    return {
      mediaId,
      tempFileId,
      originalName: input.originalFilename,
      seoName,
      filename: `${seoName}.webp`,
      primaryR2ReferenceName,
      originalMimeType: validation.mimeType,
      originalSize: input.fileBuffer.length,
      originalWidth: validation.width,
      originalHeight: validation.height,
      focalX,
      focalY,
      primaryVariantKey: primary.storageKey,
      primaryPublicUrl: primary.publicUrl,
      storageProvider: primary.storageProvider,
      storageBucket: r2.getBucketName(),
      variants,
      tempOriginalDeleted,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    emit('failed', 0, `Pipeline failed: ${err instanceof Error ? err.message : String(err)}`);

    // Compensating Rollback: Delete any WebP files already uploaded to R2
    if (uploadedKeys.length > 0) {
      try {
        await r2.deleteMany(uploadedKeys);
      } catch (rollbackErr) {
        console.error('Failed to rollback uploaded R2 files:', rollbackErr);
      }
    }

    // Always delete the temporary uploaded file on failure to prevent disk buildup
    if (tempOriginalSaved) {
      try {
        await fs.unlink(tempOriginalPath);
      } catch {
        // Ignore error if file doesn't exist
      }
    }

    throw err;
  }
}
