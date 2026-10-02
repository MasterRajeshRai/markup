import sharp from 'sharp';

export interface ImageValidationOptions {
  maxFileSize?: number;      // Default 50MB
  maxWidth?: number;         // Default 25,000px
  maxHeight?: number;        // Default 25,000px
  maxPixels?: number;        // Default 100,000,000 (100 MP)
  allowedMimeTypes?: string[];
}

export interface ValidationSuccess {
  valid: true;
  format: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

export interface ValidationFailure {
  valid: false;
  error: string;
  details?: Record<string, unknown>;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const DEFAULT_MAX_DIMENSION = 25000;             // 25,000px
export const DEFAULT_MAX_PIXELS = 100_000_000;          // 100 MP (decompression bomb protection)

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
];

/**
 * Validates file buffer magic bytes to prevent spoofing/executable injection.
 * Rejects SVGs, executables, scripts, HTML, and unrecognized binaries.
 */
export function detectImageMagicBytes(buffer: Buffer): { format: string; mimeType: string } | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // Reject Windows PE executable (MZ)
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
    return null;
  }

  // Reject Linux ELF executable
  if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
    return null;
  }

  // Reject SVG / XML / HTML
  const headerSlice = buffer.subarray(0, 100).toString('utf-8').trim().toLowerCase();
  if (
    headerSlice.startsWith('<?xml') ||
    headerSlice.startsWith('<svg') ||
    headerSlice.startsWith('<!doctype html') ||
    headerSlice.startsWith('<html')
  ) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { format: 'jpeg', mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { format: 'png', mimeType: 'image/png' };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { format: 'webp', mimeType: 'image/webp' };
  }

  // GIF: GIF87a or GIF89a (47 49 46 38 [37|39] 61)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { format: 'gif', mimeType: 'image/gif' };
  }

  // TIFF: II*. (Little Endian: 49 49 2A 00) or MM.* (Big Endian: 4D 4D 00 2A)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
    (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)
  ) {
    return { format: 'tiff', mimeType: 'image/tiff' };
  }

  return null;
}

/**
 * Full image validation pipeline:
 * 1. Checks file buffer existence and size (< maxFileSize)
 * 2. Checks magic bytes (prevents SVG, EXE, scripts, spoofed extensions)
 * 3. Inspects metadata via Sharp (decompression bomb protection, dimension bounds)
 */
export async function validateImage(
  buffer: Buffer,
  options: ImageValidationOptions = {}
): Promise<ValidationResult> {
  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_DIMENSION;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_DIMENSION;
  const maxPixels = options.maxPixels ?? DEFAULT_MAX_PIXELS;
  const allowedMimes = options.allowedMimeTypes ?? ALLOWED_IMAGE_MIME_TYPES;

  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty or invalid file buffer provided.' };
  }

  if (buffer.length > maxFileSize) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    const limitMb = (maxFileSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed size of ${limitMb} MB.`,
      details: { size: buffer.length, maxFileSize },
    };
  }

  // Magic bytes check
  const magic = detectImageMagicBytes(buffer);
  if (!magic) {
    return {
      valid: false,
      error: 'Invalid file format or untrusted binary. Only JPEG, PNG, WebP, GIF, and TIFF images are supported. SVG and executables are rejected.',
    };
  }

  if (!allowedMimes.includes(magic.mimeType)) {
    return {
      valid: false,
      error: `MIME type ${magic.mimeType} is not in the allowed list: ${allowedMimes.join(', ')}`,
      details: { detectedMime: magic.mimeType },
    };
  }

  // Sharp metadata inspection
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Unable to determine image dimensions. File may be corrupted.',
      };
    }

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return {
        valid: false,
        error: `Image dimensions (${metadata.width}x${metadata.height}) exceed maximum allowed dimension limit (${maxWidth}x${maxHeight}).`,
        details: { width: metadata.width, height: metadata.height, maxWidth, maxHeight },
      };
    }

    const totalPixels = metadata.width * metadata.height;
    if (totalPixels > maxPixels) {
      return {
        valid: false,
        error: `Image pixel count (${totalPixels.toLocaleString()}) exceeds maximum decompression limit of ${maxPixels.toLocaleString()} pixels (decompression bomb protection).`,
        details: { totalPixels, maxPixels },
      };
    }

    return {
      valid: true,
      format: metadata.format || magic.format,
      mimeType: magic.mimeType,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
    };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to decode image: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
