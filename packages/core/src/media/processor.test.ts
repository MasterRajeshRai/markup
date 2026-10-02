import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  validateImage,
  detectImageMagicBytes,
  DEFAULT_MAX_FILE_SIZE,
} from './validation';
import {
  calculateFocalCrop,
  normalizeImage,
  processVariant,
  processAllVariants,
} from './processor';
import { DEFAULT_CROP_PRESETS } from './presets';
import { CloudflareR2Storage } from '../storage/r2';
import { executeMediaPipeline } from './pipeline';
import { cleanStaleTempFiles } from './cleanup';
import {
  toSeoFriendlyName,
  generateR2ReferenceName,
  generateR2StorageKey,
  parseR2ReferenceFromKey,
} from './naming';

// Helper to generate a valid test image in memory
async function createTestImage(width = 800, height = 600, format: 'jpeg' | 'png' = 'png'): Promise<Buffer> {
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 100, g: 150, b: 200 },
    },
  });

  if (format === 'jpeg') {
    return image.jpeg().toBuffer();
  }
  return image.png().toBuffer();
}

describe('Media Validation Engine', () => {
  test('detects magic bytes for JPEG and PNG', async () => {
    const pngBuffer = await createTestImage(100, 100, 'png');
    const jpegBuffer = await createTestImage(100, 100, 'jpeg');

    const pngMagic = detectImageMagicBytes(pngBuffer);
    assert.equal(pngMagic?.format, 'png');
    assert.equal(pngMagic?.mimeType, 'image/png');

    const jpegMagic = detectImageMagicBytes(jpegBuffer);
    assert.equal(jpegMagic?.format, 'jpeg');
    assert.equal(jpegMagic?.mimeType, 'image/jpeg');
  });

  test('rejects SVG and executable files', async () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>');
    const xmlBuffer = Buffer.from('<?xml version="1.0"?><svg></svg>');
    const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);

    assert.equal(detectImageMagicBytes(svgBuffer), null);
    assert.equal(detectImageMagicBytes(xmlBuffer), null);
    assert.equal(detectImageMagicBytes(exeBuffer), null);

    const svgValidation = await validateImage(svgBuffer);
    assert.equal(svgValidation.valid, false);

    const exeValidation = await validateImage(exeBuffer);
    assert.equal(exeValidation.valid, false);
  });

  test('rejects file larger than maxFileSize', async () => {
    const validBuffer = await createTestImage(50, 50, 'jpeg');
    const res = await validateImage(validBuffer, { maxFileSize: 50 }); // limit to 50 bytes
    assert.equal(res.valid, false);
    assert.ok(res.error.includes('exceeds maximum allowed size'));
  });

  test('validates valid image and returns dimensions and MIME', async () => {
    const buffer = await createTestImage(640, 480, 'jpeg');
    const res = await validateImage(buffer);
    assert.equal(res.valid, true);
    if (res.valid) {
      assert.equal(res.width, 640);
      assert.equal(res.height, 480);
      assert.equal(res.mimeType, 'image/jpeg');
    }
  });

  test('rejects decompression bomb images', async () => {
    const buffer = await createTestImage(100, 100, 'png');
    // Set maxPixels to 5,000 (100x100 = 10,000 > 5,000)
    const res = await validateImage(buffer, { maxPixels: 5000 });
    assert.equal(res.valid, false);
    assert.ok(res.error.includes('decompression limit'));
  });
});

describe('Smart Cropping & Focal Point Math', () => {
  test('centers crop when focal point is 0.5, 0.5', () => {
    // 1000x500 (2:1 aspect) cropped to 500x500 (1:1 aspect)
    // Needs to crop width from 1000 to 500. Left should be 250.
    const crop = calculateFocalCrop(1000, 500, 500, 500, 0.5, 0.5);
    assert.equal(crop.width, 500);
    assert.equal(crop.height, 500);
    assert.equal(crop.left, 250);
    assert.equal(crop.top, 0);
  });

  test('shifts crop to left when focalX is 0.0', () => {
    const crop = calculateFocalCrop(1000, 500, 500, 500, 0.0, 0.5);
    assert.equal(crop.left, 0);
    assert.equal(crop.width, 500);
  });

  test('shifts crop to right when focalX is 1.0', () => {
    const crop = calculateFocalCrop(1000, 500, 500, 500, 1.0, 0.5);
    assert.equal(crop.left, 500); // 1000 - 500 = 500
    assert.equal(crop.width, 500);
  });

  test('clamps out-of-bounds focal points gracefully', () => {
    const cropNegative = calculateFocalCrop(1000, 500, 500, 500, -0.5, -0.5);
    assert.equal(cropNegative.left, 0);
    assert.equal(cropNegative.top, 0);

    const cropOverflow = calculateFocalCrop(1000, 500, 500, 500, 2.5, 2.5);
    assert.equal(cropOverflow.left, 500);
  });
});

describe('Variant Processor & WebP Conversion', () => {
  test('converts image to WebP with exact preset dimensions', async () => {
    const sourceBuffer = await createTestImage(1200, 800, 'jpeg');
    const { buffer: normalized, width, height } = await normalizeImage(sourceBuffer);

    const preset = {
      name: 'Thumbnail',
      slug: 'thumbnail',
      width: 300,
      height: 300,
      fit: 'cover' as const,
    };

    const variant = await processVariant(normalized, width, height, preset, {
      focalX: 0.5,
      focalY: 0.5,
      jpegQuality: 85,
      webpQuality: 80,
    });

    assert.equal(variant.format, 'webp');
    assert.equal(variant.width, 300);
    assert.equal(variant.height, 300);
    assert.ok(variant.buffer.length > 0);
    assert.ok(variant.intermediateJpegSize > 0);

    // Verify Sharp detects the output buffer as webp
    const meta = await sharp(variant.buffer).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.width, 300);
    assert.equal(meta.height, 300);
  });

  test('processes multiple presets with progress tracking', async () => {
    const sourceBuffer = await createTestImage(800, 600, 'png');
    const testPresets = DEFAULT_CROP_PRESETS.slice(0, 2);

    let progressCount = 0;
    const variants = await processAllVariants(sourceBuffer, testPresets, {}, () => {
      progressCount++;
    });

    assert.equal(variants.length, 2);
    assert.equal(progressCount, 2);
    assert.equal(variants[0].presetSlug, testPresets[0].slug);
    assert.equal(variants[1].presetSlug, testPresets[1].slug);
  });
});

describe('Cloudflare R2 Storage Driver', () => {
  test('generates partitioned storage keys with SEO friendly name and Cloudflare R2 reference at last', () => {
    const r2 = new CloudflareR2Storage();
    const keyWithSeo = r2.generateKey('site-123', 'media-456', 'hero', 'webp', 'Modern Living Room Decor');
    assert.ok(keyWithSeo.startsWith('media/sites/site-123/images/'));
    assert.ok(keyWithSeo.includes('/modern-living-room-decor/'));
    assert.ok(keyWithSeo.endsWith('modern-living-room-decor-hero-r2-media456.webp'));

    const parsed = parseR2ReferenceFromKey(keyWithSeo);
    assert.equal(parsed?.seoName, 'modern-living-room-decor');
    assert.equal(parsed?.presetSlug, 'hero');
    assert.equal(parsed?.r2Ref, 'media456');
  });

  test('handles local mock upload, verification, and deletion', async () => {
    const mockDir = path.join(os.tmpdir(), 'cms-r2-test-' + Date.now());
    const r2 = new CloudflareR2Storage({ mockDir });

    assert.equal(r2.isMockMode(), true);

    const testBuffer = Buffer.from('test webp payload content');
    const key = 'test/asset.webp';

    // 1. Upload
    const uploadResult = await r2.upload(testBuffer, key, 'image/webp');
    assert.equal(uploadResult.key, key);
    assert.equal(uploadResult.size, testBuffer.length);

    // 2. Verify
    const verified = await r2.verifyUpload(key);
    assert.equal(verified, true);

    // 3. Delete
    const deleted = await r2.delete(key);
    assert.equal(deleted, true);

    // 4. Verify gone
    const verifyAfter = await r2.verifyUpload(key);
    assert.equal(verifyAfter, false);

    // Clean up test dir
    await fs.rm(mockDir, { recursive: true, force: true });
  });

  test('batch deletes keys on rollback', async () => {
    const mockDir = path.join(os.tmpdir(), 'cms-r2-batch-' + Date.now());
    const r2 = new CloudflareR2Storage({ mockDir });

    const key1 = 'test/1.webp';
    const key2 = 'test/2.webp';
    await r2.upload(Buffer.from('one'), key1);
    await r2.upload(Buffer.from('two'), key2);

    assert.equal(await r2.verifyUpload(key1), true);
    assert.equal(await r2.verifyUpload(key2), true);

    await r2.deleteMany([key1, key2]);

    assert.equal(await r2.verifyUpload(key1), false);
    assert.equal(await r2.verifyUpload(key2), false);

    await fs.rm(mockDir, { recursive: true, force: true });
  });
});

describe('Full Media Pipeline Coordinator', () => {
  test('executes end-to-end pipeline and deletes temporary original file', async () => {
    const mockDir = path.join(os.tmpdir(), 'cms-pipeline-r2-' + Date.now());
    const tempDir = path.join(os.tmpdir(), 'cms-pipeline-temp-' + Date.now());

    const fileBuffer = await createTestImage(1000, 800, 'jpeg');
    const stepsEmitted: string[] = [];

    const result = await executeMediaPipeline({
      fileBuffer,
      originalFilename: 'hero-banner.jpg',
      siteId: 'site_test',
      selectedPresets: ['thumbnail', 'card'],
      focalX: 0.6,
      focalY: 0.4,
      tempDir,
      r2Config: { mockDir },
      onProgress: (evt) => {
        stepsEmitted.push(evt.step);
      },
    });

    assert.equal(result.originalName, 'hero-banner.jpg');
    assert.equal(result.originalWidth, 1000);
    assert.equal(result.originalHeight, 800);
    assert.equal(result.variants.length, 2);
    assert.equal(result.tempOriginalDeleted, true);

    // Confirm variants are webp
    for (const v of result.variants) {
      assert.equal(v.format, 'webp');
      assert.ok(v.fileSize > 0);
      assert.ok(v.storageKey.endsWith('.webp'));
    }

    // Confirm original temporary file was purged
    const tempFiles = await fs.readdir(tempDir);
    assert.equal(tempFiles.length, 0, 'Temporary original file must be deleted upon pipeline completion');

    // Confirm pipeline steps were emitted in sequence
    assert.ok(stepsEmitted.includes('validating'));
    assert.ok(stepsEmitted.includes('cropping'));
    assert.ok(stepsEmitted.includes('uploading'));
    assert.ok(stepsEmitted.includes('verifying'));
    assert.ok(stepsEmitted.includes('cleaning'));
    assert.ok(stepsEmitted.includes('completed'));

    // Clean test dirs
    await fs.rm(mockDir, { recursive: true, force: true });
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('performs compensating rollback if upload or verification fails', async () => {
    const mockDir = path.join(os.tmpdir(), 'cms-fail-r2-' + Date.now());
    const tempDir = path.join(os.tmpdir(), 'cms-fail-temp-' + Date.now());

    // Send an invalid buffer pretending to be an image
    const invalidBuffer = Buffer.from('not an image binary payload');

    await assert.rejects(
      async () => {
        await executeMediaPipeline({
          fileBuffer: invalidBuffer,
          originalFilename: 'bad-file.png',
          tempDir,
          r2Config: { mockDir },
        });
      },
      /Image validation failed/
    );

    // Verify temporary files are deleted even on failure
    const tempFiles = await fs.readdir(tempDir);
    assert.equal(tempFiles.length, 0, 'No orphaned temporary files on validation failure');

    await fs.rm(mockDir, { recursive: true, force: true });
    await fs.rm(tempDir, { recursive: true, force: true });
  });
});

describe('Stale Temp File Cleaner', () => {
  test('scans and purges files older than max age', async () => {
    const tempDir = path.join(os.tmpdir(), 'cms-cleanup-test-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });

    const staleFile = path.join(tempDir, 'stale_upload.tmp');
    const freshFile = path.join(tempDir, 'fresh_upload.tmp');

    await fs.writeFile(staleFile, 'stale content');
    await fs.writeFile(freshFile, 'fresh content');

    // Set stale file mtime to 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await fs.utimes(staleFile, twoHoursAgo, twoHoursAgo);

    const cleanup = await cleanStaleTempFiles(tempDir, 60); // 60 minutes limit
    assert.equal(cleanup.deletedCount, 1);
    assert.equal(cleanup.scannedCount, 2);

    const remaining = await fs.readdir(tempDir);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0], 'fresh_upload.tmp');

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});

describe('SEO Friendly Image Naming & Cloudflare R2 Reference Engine', () => {
  test('normalizes messy filenames and accents into clean SEO slugs', () => {
    assert.equal(toSeoFriendlyName('Modern Living Room (Interior Decor) 2026!.png'), 'modern-living-room-interior-decor-2026');
    assert.equal(toSeoFriendlyName('Café & Restaurant Showcase #1.JPG'), 'cafe-restaurant-showcase-1');
    assert.equal(toSeoFriendlyName('IMG_20261001_031542.jpeg'), 'img-20261001-031542');
    assert.equal(toSeoFriendlyName('---lots---of---dashes---.webp'), 'lots-of-dashes');
    assert.equal(toSeoFriendlyName(''), 'image');
  });

  test('keeps SEO name first and puts Cloudflare R2 reference at last in filename', () => {
    const filename = generateR2ReferenceName('best-hiking-boots-2026', 'card', '8f92a10b', 'webp');
    assert.equal(filename, 'best-hiking-boots-2026-card-r2-8f92a10b.webp');
    assert.ok(filename.startsWith('best-hiking-boots-2026'));
    assert.ok(filename.endsWith('-r2-8f92a10b.webp'));
  });

  test('generates full partitioned Cloudflare R2 key with SEO directory and R2 reference', () => {
    const key = generateR2StorageKey({
      siteId: 'site_tech_blog',
      mediaId: 'cuid_abcdef123456',
      presetSlug: 'hero',
      seoName: 'nextjs-performance-benchmarks',
      year: 2026,
      month: '10',
    });

    assert.equal(
      key,
      'media/sites/site_tech_blog/images/2026/10/nextjs-performance-benchmarks/nextjs-performance-benchmarks-hero-r2-cuidabcd.webp'
    );

    const parsed = parseR2ReferenceFromKey(key);
    assert.equal(parsed?.seoName, 'nextjs-performance-benchmarks');
    assert.equal(parsed?.presetSlug, 'hero');
    assert.equal(parsed?.r2Ref, 'cuidabcd');
    assert.equal(parsed?.filename, 'nextjs-performance-benchmarks-hero-r2-cuidabcd.webp');
  });
});
