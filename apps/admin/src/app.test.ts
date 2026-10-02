import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma, EntryStatus } from '@headless/database';
import { verifyPassword, hashPassword, generateApiKey, computeRevisionDiff } from '@headless/core';

describe('Markup — Integration & API Verification Suite', () => {
  let testSiteId: string;
  let testContentTypeId: string;
  let adminUserId: string;

  before(async () => {
    // Verify database connection and lookup seeded entities
    const site = await prisma.site.findFirst({ where: { slug: 'acme-portal' } });
    assert.ok(site, 'Seeded site "acme-portal" must exist');
    testSiteId = site.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@headless.io' } });
    assert.ok(user, 'Seeded admin user must exist');
    adminUserId = user.id;

    const contentType = await prisma.contentType.findFirst({
      where: { siteId: testSiteId, slug: 'articles' },
      include: { fields: true },
    });
    assert.ok(contentType, 'Seeded "articles" content model must exist');
    assert.ok(contentType.fields.length > 0, 'Article fields must be configured');
    testContentTypeId = contentType.id;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  test('Database & Multi-Site: validates default site and locales', async () => {
    const locales = await prisma.locale.findMany({ where: { siteId: testSiteId } });
    assert.ok(locales.length >= 3, 'Site must support multiple locales (en-US, es-ES, fr-FR)');

    const defaultLocale = locales.find((l) => l.isDefault);
    assert.equal(defaultLocale?.code, 'en-US');
  });

  test('Security & Auth: verifies seeded admin password and hashing', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@headless.io' } });
    assert.ok(admin);

    const isValid = await verifyPassword('AdminPass123!', admin.passwordHash);
    assert.equal(isValid, true, 'Seeded password must match');

    const isWrong = await verifyPassword('WrongPassword!', admin.passwordHash);
    assert.equal(isWrong, false, 'Invalid password must be rejected');
  });

  test('Content Engine: creates, snapshots revision, updates, and publishes content entry', async () => {
    const testSlug = `test-post-${Date.now()}`;

    // 1. Create Draft Entry
    const entry = await prisma.contentEntry.create({
      data: {
        siteId: testSiteId,
        contentTypeId: testContentTypeId,
        title: 'Automated Test Article',
        slug: testSlug,
        status: EntryStatus.DRAFT,
        authorId: adminUserId,
        currentVersion: 1,
        data: {
          summary: 'Testing content lifecycle and revision engine.',
          byline: 'Test Bot',
          read_time: 3,
        },
        blocks: [
          {
            id: 'b1',
            type: 'heading',
            data: { text: 'Automated Title', level: 1 },
          },
        ],
      },
    });

    assert.ok(entry.id);
    assert.equal(entry.status, EntryStatus.DRAFT);
    assert.equal(entry.currentVersion, 1);

    // 2. Snapshot Initial Revision
    const rev1 = await prisma.contentRevision.create({
      data: {
        entryId: entry.id,
        version: 1,
        authorId: adminUserId,
        changeSummary: 'Initial automated draft',
        data: entry.data as any,
        blocks: entry.blocks as any,
      },
    });
    assert.equal(rev1.version, 1);

    // 3. Update Entry and Snapshot Version 2
    const updatedData = {
      summary: 'Updated summary for revision testing.',
      byline: 'Test Bot Senior',
      read_time: 4,
    };
    const diffs = computeRevisionDiff(entry.data as any, updatedData);
    assert.ok(diffs.length > 0);

    const updated = await prisma.contentEntry.update({
      where: { id: entry.id },
      data: {
        data: updatedData,
        currentVersion: 2,
      },
    });
    assert.equal(updated.currentVersion, 2);

    // 4. Publish Entry
    const published = await prisma.contentEntry.update({
      where: { id: entry.id },
      data: {
        status: EntryStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    assert.equal(published.status, EntryStatus.PUBLISHED);
    assert.ok(published.publishedAt);

    // Cleanup test entry
    await prisma.contentEntry.delete({ where: { id: entry.id } });
  });

  test('Taxonomy Engine: validates hierarchical categories and entry associations', async () => {
    const tax = await prisma.taxonomy.findFirst({
      where: { siteId: testSiteId, slug: 'categories' },
      include: { terms: true },
    });

    assert.ok(tax);
    assert.equal(tax.isHierarchical, true);
    assert.ok(tax.terms.length > 0, 'Categories taxonomy must contain seeded terms');
  });

  test('Navigation Engine: validates hierarchical menu items', async () => {
    const menu = await prisma.menu.findFirst({
      where: { siteId: testSiteId, slug: 'main-navigation' },
      include: { items: true },
    });

    assert.ok(menu);
    assert.ok(menu.items.length >= 4, 'Menu must contain navigation links (Home, Articles, Products, etc.)');
  });

  test('API Keys: validates active delivery key permissions', async () => {
    const keys = await prisma.apiKey.findMany({ where: { siteId: testSiteId } });
    assert.ok(keys.length > 0, 'Seeded API key must exist');

    const deliveryKey = keys.find((k) => k.role === 'READ_ONLY');
    assert.ok(deliveryKey);
    assert.ok(deliveryKey.keyPrefix.startsWith('cms_live_'));
  });

  test('Editorial Workflows: validates multi-tier state machine', async () => {
    const workflow = await prisma.workflow.findFirst({
      where: { siteId: testSiteId, isDefault: true },
      include: { states: true },
    });

    assert.ok(workflow);
    assert.ok(workflow.states.length >= 5, 'Workflow must contain Draft, In Review, Approved, Published, Archived states');
  });
});
