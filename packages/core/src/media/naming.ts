import crypto from 'crypto';

/**
 * Normalizes any raw filename or user input into an SEO-friendly URL slug.
 *
 * Rules:
 * - Strips image/file extensions (.jpg, .jpeg, .png, .webp, .avif, etc.)
 * - Strips accents/diacritics (e.g. 'café' -> 'cafe', 'año' -> 'ano')
 * - Converts to lowercase
 * - Converts non-alphanumeric characters, spaces, and punctuation to single hyphens
 * - Collapses consecutive hyphens into a single hyphen
 * - Trims leading and trailing hyphens
 * - Truncates to a maximum length (default 100 characters) preserving whole words when possible
 */
export function toSeoFriendlyName(rawName: string, maxLength = 100): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'image';
  }

  // 1. Strip file extension if present (up to 6 chars)
  const nameWithoutExt = rawName.trim().replace(/\.[a-zA-Z0-9]{1,6}$/, '');

  // 2. Normalize Unicode diacritics / accents
  const decomposed = nameWithoutExt.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // 3. Lowercase & replace non-alphanumerics with hyphens
  let slug = decomposed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 4. Fallback if empty after sanitization
  if (!slug) {
    slug = 'image';
  }

  // 5. Truncate if exceeds max length
  if (slug.length > maxLength) {
    const trimmed = slug.substring(0, maxLength);
    const lastDash = trimmed.lastIndexOf('-');
    slug = lastDash > 20 ? trimmed.substring(0, lastDash) : trimmed;
  }

  return slug;
}

/**
 * Extracts or generates a compact 8-character Cloudflare R2 reference ID.
 */
export function generateR2ReferenceId(seed?: string): string {
  if (seed) {
    const cleanSeed = seed.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanSeed.length >= 8) {
      return cleanSeed.substring(0, 8).toLowerCase();
    }
  }
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Generates the Cloudflare R2 friendly image filename with the R2 reference at the end.
 * Format: {seo-friendly-name}-{preset-slug}-r2-{referenceId}.{format}
 *
 * Example:
 * SEO Name: "modern-minimalist-living-room"
 * Preset: "card"
 * Reference ID: "8f92a10b"
 * Output: "modern-minimalist-living-room-card-r2-8f92a10b.webp"
 */
export function generateR2ReferenceName(
  seoName: string,
  presetSlug: string,
  referenceId: string,
  format = 'webp'
): string {
  const cleanSeo = toSeoFriendlyName(seoName);
  const cleanPreset = presetSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const cleanRef = referenceId.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12);

  return `${cleanSeo}-${cleanPreset}-r2-${cleanRef}.${format}`;
}

export interface R2KeyGenerationOptions {
  siteId?: string;
  mediaId: string;
  presetSlug: string;
  seoName?: string;
  format?: string;
  year?: number;
  month?: string;
}

/**
 * Generates a standard partitioned Cloudflare R2 object key:
 * media/sites/{siteId}/images/{year}/{month}/{seoName}/{seoName}-{presetSlug}-r2-{referenceId}.webp
 */
export function generateR2StorageKey(options: R2KeyGenerationOptions): string {
  const now = new Date();
  const year = options.year ?? now.getFullYear();
  const month = options.month ?? String(now.getMonth() + 1).padStart(2, '0');
  const siteId = options.siteId ? options.siteId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'global';
  const format = options.format || 'webp';

  const seoName = toSeoFriendlyName(options.seoName || options.mediaId);
  const r2Ref = generateR2ReferenceId(options.mediaId);
  const r2Filename = generateR2ReferenceName(seoName, options.presetSlug, r2Ref, format);

  return `media/sites/${siteId}/images/${year}/${month}/${seoName}/${r2Filename}`;
}

/**
 * Extracts SEO name, preset, and Cloudflare R2 reference ID from a storage key or filename.
 */
export function parseR2ReferenceFromKey(keyOrFilename: string): {
  seoName: string;
  presetSlug: string;
  r2Ref: string;
  filename: string;
} | null {
  const filename = keyOrFilename.split('/').pop() || '';
  const match = filename.match(/^(.+)-([a-z0-9_]+)-r2-([a-z0-9]+)\.([a-z0-9]+)$/i);
  if (!match) {
    return null;
  }
  return {
    seoName: match[1],
    presetSlug: match[2],
    r2Ref: match[3],
    filename,
  };
}
