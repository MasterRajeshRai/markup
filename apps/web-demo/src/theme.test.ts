import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  cmsClient,
  FALLBACK_HOME,
  FALLBACK_ARTICLES,
} from './lib/cms-client';

describe('Restored Decoupled Frontend Client & Contract', () => {
  it('delivers home entry with visual block structure and metadata', async () => {
    const res = await cmsClient.getEntry('home');
    assert.ok(res.data);
    assert.strictEqual(res.data.slug, 'home');
    assert.ok(Array.isArray(res.data.blocks));
    assert.ok(res.data.blocks.length >= 4);

    const heroBlock = res.data.blocks.find((b: any) => b.type === 'hero');
    assert.ok(heroBlock);
    assert.ok(heroBlock.data.title);
    assert.ok(heroBlock.data.primaryCta);
  });

  it('delivers articles with taxonomy tagging and summaries', async () => {
    const res = await cmsClient.getEntries('articles');
    assert.ok(res.data);
    assert.ok(res.data.length > 0);

    const first = res.data[0];
    assert.ok(first.slug);
    assert.ok(first.title);
    assert.ok(first.data?.summary);
    assert.ok(Array.isArray(first.taxonomies));
  });

  it('delivers navigation menu items for header navigation', async () => {
    const nav = await cmsClient.getNavigation('main-navigation');
    assert.ok(nav.data?.items);
    assert.ok(nav.data.items.length >= 2);
    assert.strictEqual(nav.data.items[0].url, '/');
  });

  it('fetches single article by slug with blocks', async () => {
    const res = await cmsClient.getEntry('building-enterprise-headless-cms-with-nextjs');
    assert.ok(res.data);
    assert.strictEqual(res.data.slug, 'building-enterprise-headless-cms-with-nextjs');
    assert.ok(Array.isArray(res.data.blocks));
  });
});
