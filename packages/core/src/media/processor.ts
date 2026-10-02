import sharp, { type Sharp } from 'sharp';
import type { CropPresetDefinition } from './presets';

export interface CropOptions {
  focalX?: number; // 0.0 - 1.0 (default 0.5)
  focalY?: number; // 0.0 - 1.0 (default 0.5)
  jpegQuality?: number; // default 90 or process.env.MEDIA_JPEG_QUALITY
  webpQuality?: number; // default 82 or process.env.MEDIA_WEBP_QUALITY
}

export interface ProcessedVariant {
  presetSlug: string;
  presetName: string;
  width: number;
  height: number;
  format: 'webp';
  quality: number;
  buffer: Buffer;
  size: number;
  intermediateJpegSize: number;
}

export interface CropCoordinates {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Calculates optimal crop coordinates for cover fit given image dimensions and focal point.
 * Ensures the focal point stays centered as much as possible while maintaining target aspect ratio.
 */
export function calculateFocalCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  focalX: number = 0.5,
  focalY: number = 0.5
): CropCoordinates {
  const clampedFocalX = Math.max(0, Math.min(1, focalX));
  const clampedFocalY = Math.max(0, Math.min(1, focalY));

  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceAspect > targetAspect) {
    // Source is wider than target -> crop sides (keep height, reduce width)
    cropWidth = Math.round(sourceHeight * targetAspect);
    cropHeight = sourceHeight;
  } else if (sourceAspect < targetAspect) {
    // Source is taller than target -> crop top/bottom (keep width, reduce height)
    cropWidth = sourceWidth;
    cropHeight = Math.round(sourceWidth / targetAspect);
  }

  // Ensure crop box does not exceed source dimensions
  cropWidth = Math.min(cropWidth, sourceWidth);
  cropHeight = Math.min(cropHeight, sourceHeight);

  // Position crop box centered around focal point
  const focalPixelX = clampedFocalX * sourceWidth;
  const focalPixelY = clampedFocalY * sourceHeight;

  let left = Math.round(focalPixelX - cropWidth / 2);
  let top = Math.round(focalPixelY - cropHeight / 2);

  // Clamp crop box within bounds
  left = Math.max(0, Math.min(left, sourceWidth - cropWidth));
  top = Math.max(0, Math.min(top, sourceHeight - cropHeight));

  return { left, top, width: cropWidth, height: cropHeight };
}

/**
 * Normalizes input image by auto-orienting EXIF tags.
 */
export async function normalizeImage(sourceBuffer: Buffer): Promise<{ buffer: Buffer; width: number; height: number }> {
  const pipeline = sharp(sourceBuffer).rotate(); // Auto-rotate by EXIF
  const buffer = await pipeline.toBuffer();
  const metadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Executes the full Auto-Crop -> JPEG -> WebP pipeline for a single preset.
 * 1. Auto-crops / resizes according to focal point and fit mode.
 * 2. Generates intermediate JPEG (default quality 90).
 * 3. Converts JPEG to WebP (default quality 82).
 * 4. Discards intermediate JPEG buffer from memory.
 */
export async function processVariant(
  normalizedBuffer: Buffer,
  sourceWidth: number,
  sourceHeight: number,
  preset: CropPresetDefinition,
  options: CropOptions = {}
): Promise<ProcessedVariant> {
  const focalX = options.focalX ?? 0.5;
  const focalY = options.focalY ?? 0.5;
  const jpegQuality = options.jpegQuality ?? Number(process.env.MEDIA_JPEG_QUALITY || 90);
  const webpQuality = options.webpQuality ?? Number(process.env.MEDIA_WEBP_QUALITY || 82);

  let croppedPipeline: Sharp;

  if (preset.fit === 'contain') {
    // Contain: resize with transparent/blank padding
    croppedPipeline = sharp(normalizedBuffer).resize(preset.width, preset.height, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });
  } else {
    // Cover: apply focal-point crop then resize
    const crop = calculateFocalCrop(sourceWidth, sourceHeight, preset.width, preset.height, focalX, focalY);

    croppedPipeline = sharp(normalizedBuffer)
      .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
      .resize(preset.width, preset.height, { fit: 'fill' });
  }

  // 1. Generate intermediate JPEG (optimizes colors, standardizes color profile)
  const intermediateJpegBuffer = await croppedPipeline
    .jpeg({
      quality: jpegQuality,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();

  const intermediateJpegSize = intermediateJpegBuffer.length;

  // 2. Convert JPEG -> WebP (final asset)
  const webpBuffer = await sharp(intermediateJpegBuffer)
    .webp({
      quality: webpQuality,
      effort: 4, // Balanced speed and compression
    })
    .toBuffer();

  // Verify actual output dimensions
  const finalMeta = await sharp(webpBuffer).metadata();

  return {
    presetSlug: preset.slug,
    presetName: preset.name,
    width: finalMeta.width || preset.width,
    height: finalMeta.height || preset.height,
    format: 'webp',
    quality: webpQuality,
    buffer: webpBuffer,
    size: webpBuffer.length,
    intermediateJpegSize,
  };
}

/**
 * Processes an image into multiple WebP variants based on an array of crop presets.
 */
export async function processAllVariants(
  sourceBuffer: Buffer,
  presets: CropPresetDefinition[],
  options: CropOptions = {},
  onProgress?: (completed: number, total: number, preset: CropPresetDefinition) => void
): Promise<ProcessedVariant[]> {
  // Normalize EXIF orientation once
  const { buffer: normalizedBuffer, width, height } = await normalizeImage(sourceBuffer);

  const results: ProcessedVariant[] = [];
  const total = presets.length;

  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    const variant = await processVariant(normalizedBuffer, width, height, preset, options);
    results.push(variant);

    if (onProgress) {
      onProgress(i + 1, total, preset);
    }
  }

  return results;
}
