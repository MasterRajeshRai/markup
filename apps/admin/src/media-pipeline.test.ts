import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { prisma } from '@headless/database';
import { executeMediaPipeline } from '@headless/core/server';

describe('Media Library — Auto-Crop → JPEG → WebP → Cloudflare R2 Pipeline', () => {
  let siteId: string;
  let adminUserId: string;
  let mockR2Dir: string;
  let tempUploadDir: string;

  before(async () => {
    // Lookup seeded site and admin user
    const site = await prisma.site.findFirst({ where: { slug: 'acme-portal' } });
    assert.ok(site, 'Seeded site "acme-portal" must exist');
    siteId = site.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@headless.io' } });
    assert.ok(user, 'Seeded admin user must exist');
    adminUserId = user.id;

    mockR2Dir = path.join(os.tmpdir(), 'cms-integration-r2-' + Date.now());
    tempUploadDir = path.join(os.tmpdir(), 'cms-integration-temp-' + Date.now());
  });

  after(async () => {
    await prisma.$disconnect();
    try {
      await fs.rm(mockR2Dir, { recursive: true, force: true });
      await fs.rm(tempUploadDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  test('Database: seeded crop presets exist with dimensions and fit modes', async () => {
    const presets = await prisma.cropPreset.findMany({
      orderBy: { width: 'asc' },
    });

    assert.ok(presets.length >= 8, 'At least 8 default crop presets should be seeded');

    const thumbnail = presets.find((p) => p.slug === 'thumbnail');
    assert.ok(thumbnail, 'Thumbnail preset must exist');
    assert.equal(thumbnail?.width, 300);
    assert.equal(thumbnail?.height, 300);
    assert.equal(thumbnail?.fit, 'cover');

    const hero = presets.find((p) => p.slug === 'hero');
    assert.ok(hero, 'Hero preset must exist');
    assert.equal(hero?.width, 1920);
    assert.equal(hero?.height, 1080);
  });

  test('Pipeline: processes image to WebP variants and purges temporary files', async () => {
    // 1. Generate in-memory 1600x1200 JPEG
    const testImageBuffer = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 50, g: 120, b: 220 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const selectedPresets = ['thumbnail', 'card', 'medium'];
    const focalX = 0.7;
    const focalY = 0.3;

    // 2. Create MediaProcessingJob record
    const tempFileId = `test_${Date.now()}`;
    const job = await prisma.mediaProcessingJob.create({
      data: {
        siteId,
        userId: adminUserId,
        status: 'PROCESSING',
        tempFileId,
        originalFilename: 'mountain_landscape.jpg',
        originalMimeType: 'image/jpeg',
        originalFileSize: testImageBuffer.length,
        selectedPresets,
        focalX,
        focalY,
        progress: 10,
        currentStep: 'validating',
      },
    });
    assert.ok(job.id);

    // 3. Execute Pipeline
    const pipelineResult = await executeMediaPipeline({
      fileBuffer: testImageBuffer,
      originalFilename: 'mountain_landscape.jpg',
      siteId,
      userId: adminUserId,
      selectedPresets,
      focalX,
      focalY,
      tempDir: tempUploadDir,
      r2Config: { mockDir: mockR2Dir },
    });

    assert.equal(pipelineResult.originalName, 'mountain_landscape.jpg');
    assert.equal(pipelineResult.originalWidth, 1600);
    assert.equal(pipelineResult.originalHeight, 1200);
    assert.equal(pipelineResult.variants.length, 3);
    assert.equal(pipelineResult.tempOriginalDeleted, true);

    // 4. Save Media record in DB
    const media = await prisma.media.create({
      data: {
        siteId,
        filename: 'mountain_landscape.webp',
        originalName: 'mountain_landscape.jpg',
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
        originalMimeType: 'image/jpeg',
        storageDriver: pipelineResult.storageProvider,
        storageBucket: pipelineResult.storageBucket,
        storageKey: pipelineResult.primaryVariantKey,
        path: pipelineResult.primaryVariantKey,
        publicUrl: pipelineResult.primaryPublicUrl,
        altText: 'Scenic Mountain Landscape',
        createdById: adminUserId,
      },
    });

    // 5. Save MediaVariant records in DB
    for (const v of pipelineResult.variants) {
      await prisma.mediaVariant.create({
        data: {
          mediaId: media.id,
          presetSlug: v.presetSlug,
          width: v.width,
          height: v.height,
          format: 'webp',
          quality: v.quality,
          fileSize: v.fileSize,
          storageProvider: v.storageProvider,
          storageBucket: v.storageBucket,
          storageKey: v.storageKey,
          publicUrl: v.publicUrl,
        },
      });
    }

    // 6. Update Job
    await prisma.mediaProcessingJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        currentStep: 'completed',
        mediaId: media.id,
      },
    });

    // 7. Verify Database State
    const savedMedia = await prisma.media.findUnique({
      where: { id: media.id },
      include: {
        mediaVariants: true,
        jobs: true,
      },
    });

    assert.ok(savedMedia);
    assert.equal(savedMedia.mimeType, 'image/webp');
    assert.equal(savedMedia.focalX, 0.7);
    assert.equal(savedMedia.focalY, 0.3);
    assert.equal(savedMedia.mediaVariants.length, 3);

    for (const variant of savedMedia.mediaVariants) {
      assert.equal(variant.format, 'webp');
      assert.ok(variant.fileSize > 0);
      assert.ok(variant.storageKey.endsWith('.webp'));
    }

    assert.equal(savedMedia.jobs[0].status, 'COMPLETED');
    assert.equal(savedMedia.jobs[0].progress, 100);

    // 8. Verify Physical Storage: Variants exist on disk in mock R2
    for (const variant of savedMedia.mediaVariants) {
      const variantFilePath = path.join(mockR2Dir, variant.storageKey);
      const stat = await fs.stat(variantFilePath);
      assert.ok(stat.isFile(), `Variant file must exist in storage: ${variant.storageKey}`);
      assert.equal(stat.size, variant.fileSize);
    }

    // 9. Verify Zero-Retention: No original temporary files left in tempDir
    const remainingTempFiles = await fs.readdir(tempUploadDir);
    assert.equal(
      remainingTempFiles.length,
      0,
      'No temporary original files should remain after pipeline completion'
    );

    // 10. Clean up test records
    await prisma.media.delete({ where: { id: media.id } });
  });

  test('Acceptance Test: DSC_1234.JPG workflow (thumbnail, card, medium, hero @ x=0.65, y=0.35)', async () => {
    // 1. Generate test image DSC_1234.JPG (5200x3467 simulated or high-res test buffer)
    const testImageBuffer = await sharp({
      create: {
        width: 2600, // scaled representative of high-res 3:2 camera aspect ratio (5200x3467)
        height: 1734,
        channels: 3,
        background: { r: 240, g: 140, b: 80 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const selectedPresets = ['thumbnail', 'card', 'medium', 'hero'];
    const focalX = 0.65;
    const focalY = 0.35;

    // 2. Execute Pipeline
    const pipelineResult = await executeMediaPipeline({
      fileBuffer: testImageBuffer,
      originalFilename: 'DSC_1234.JPG',
      siteId,
      userId: adminUserId,
      selectedPresets,
      focalX,
      focalY,
      tempDir: tempUploadDir,
      r2Config: { mockDir: mockR2Dir },
    });

    assert.equal(pipelineResult.originalName, 'DSC_1234.JPG');
    assert.equal(pipelineResult.variants.length, 4);
    assert.equal(pipelineResult.tempOriginalDeleted, true);

    // Verify all 4 expected presets generated
    const slugs = pipelineResult.variants.map((v) => v.presetSlug).sort();
    assert.deepEqual(slugs, ['card', 'hero', 'medium', 'thumbnail']);

    // 3. Persist in database
    const media = await prisma.media.create({
      data: {
        siteId,
        filename: 'DSC_1234.webp',
        originalName: 'DSC_1234.JPG',
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
        originalMimeType: 'image/jpeg',
        storageDriver: pipelineResult.storageProvider,
        storageBucket: pipelineResult.storageBucket,
        storageKey: pipelineResult.primaryVariantKey,
        path: pipelineResult.primaryVariantKey,
        publicUrl: pipelineResult.primaryPublicUrl,
        altText: 'Acceptance Test Image',
        createdById: adminUserId,
      },
    });

    for (const v of pipelineResult.variants) {
      await prisma.mediaVariant.create({
        data: {
          mediaId: media.id,
          presetSlug: v.presetSlug,
          width: v.width,
          height: v.height,
          format: 'webp',
          quality: v.quality,
          fileSize: v.fileSize,
          storageProvider: v.storageProvider,
          storageBucket: v.storageBucket,
          storageKey: v.storageKey,
          publicUrl: v.publicUrl,
        },
      });
    }

    // 4. Verify all 4 variants exist in mock R2 storage and are valid WebP
    for (const variant of pipelineResult.variants) {
      const variantFilePath = path.join(mockR2Dir, variant.storageKey);
      const stat = await fs.stat(variantFilePath);
      assert.ok(stat.isFile());

      const meta = await sharp(await fs.readFile(variantFilePath)).metadata();
      assert.equal(meta.format, 'webp');
    }

    // 5. Query / verify variants response format
    const retrievedVariants = await prisma.mediaVariant.findMany({
      where: { mediaId: media.id },
      orderBy: { width: 'asc' },
    });
    assert.equal(retrievedVariants.length, 4);

    // 6. Cleanup
    await prisma.media.delete({ where: { id: media.id } });
  });
});
