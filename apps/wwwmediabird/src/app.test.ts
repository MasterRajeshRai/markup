import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getArticles, getArticleBySlug, getCategories, getPageBySlug } from './lib/cms';
import { ADSENSE_CONFIG, CURATED_AFFILIATE_PRODUCTS } from './lib/monetization';
import { calculateReadingTime, sanitizeEditorialHtml, formatDate } from './lib/utils';
import { EDITORIAL_CATEGORIES } from './data/categories';

describe('Media Bird Magazine Core Implementation Tests', () => {
  test('Category definitions match the 5 required verticals', () => {
    const slugs = EDITORIAL_CATEGORIES.map((c) => c.slug);
    assert.ok(slugs.includes('culture'), 'Culture vertical missing');
    assert.ok(slugs.includes('leisure'), 'Leisure vertical missing');
    assert.ok(slugs.includes('newscast'), 'Newscast vertical missing');
    assert.ok(slugs.includes('odyssey'), 'Odyssey vertical missing');
    assert.ok(slugs.includes('rendezvous'), 'Rendezvous vertical missing');
    assert.strictEqual(EDITORIAL_CATEGORIES.length, 5);
  });

  test('AdSense configuration preserves approved credentials', () => {
    assert.strictEqual(ADSENSE_CONFIG.publisherId, 'ca-pub-5273119900162802');
    assert.strictEqual(ADSENSE_CONFIG.hostId, 'ca-host-pub-2644536267352236');
    assert.ok(ADSENSE_CONFIG.slots.homeLeadAfter, 'Missing homeLeadAfter ad slot');
    assert.ok(ADSENSE_CONFIG.slots.articleInContent1, 'Missing in-article ad slot');
  });

  test('Affiliate marketing contains verified recommendation data', () => {
    assert.ok(CURATED_AFFILIATE_PRODUCTS.culture.length > 0);
    assert.ok(CURATED_AFFILIATE_PRODUCTS.leisure.length > 0);
    assert.ok(CURATED_AFFILIATE_PRODUCTS.odyssey.length > 0);
    const prod = CURATED_AFFILIATE_PRODUCTS.culture[0];
    assert.ok(prod.merchantUrl.startsWith('https://'), 'Merchant URL must be secure');
    assert.ok(prod.features && prod.features.length > 0, 'Features must be provided');
  });

  test('Editorial HTML sanitizer strips dangerous scripts and handlers', () => {
    const malicious = '<p>Normal text</p><script>alert("hacked")</script><a href="javascript:steal()" onclick="hack()">Link</a>';
    const sanitized = sanitizeEditorialHtml(malicious);
    assert.ok(!sanitized.includes('<script>'), 'Script tag was not stripped');
    assert.ok(!sanitized.includes('alert('), 'Script contents were not stripped');
    assert.ok(!sanitized.includes('onclick'), 'Inline onclick handler was not stripped');
    assert.ok(!sanitized.includes('javascript:'), 'javascript: URI protocol was not stripped');
    assert.ok(sanitized.includes('<p>Normal text</p>'), 'Safe paragraph content was corrupted');
  });

  test('Reading time calculator produces sensible results', () => {
    const text220Words = 'word '.repeat(220);
    assert.strictEqual(calculateReadingTime(text220Words), 1);
    const text440Words = 'word '.repeat(440);
    assert.strictEqual(calculateReadingTime(text440Words), 2);
  });

  test('CMS client retrieves articles with correct pagination and categories', async () => {
    const res = await getArticles({ limit: 5 });
    assert.ok(res.data.length > 0, 'No articles returned');
    assert.ok(res.meta.total >= 600, `Expected at least 600 articles, got ${res.meta.total}`);
    assert.strictEqual(res.meta.page, 1);
    assert.strictEqual(res.meta.limit, 5);

    const firstArticle = res.data[0];
    assert.ok(firstArticle.slug, 'Article slug missing');
    assert.ok(firstArticle.title, 'Article title missing');
  });

  test('CMS client retrieves single article by slug', async () => {
    const article = await getArticleBySlug('why-are-the-older-cartoons-still-appealing');
    assert.ok(article, 'Article not found by slug');
    assert.strictEqual(article.slug, 'why-are-the-older-cartoons-still-appealing');
    assert.ok(article.title.includes('cartoons'), 'Title does not match');
  });

  test('Institutional pages are accessible and complete', async () => {
    const about = await getPageBySlug('about');
    assert.ok(about, 'About page missing');
    assert.ok(about.content.includes('Telling It Slow, Saying It Right!'));

    const writeForUs = await getPageBySlug('guest-post');
    assert.ok(writeForUs, 'Guest post page missing');
    assert.ok(writeForUs.content.includes('Editorial Standards'));
  });

  test('Top 5 latest posts for Hero Slider are complete and distinct', async () => {
    const res = await getArticles({ limit: 5 });
    assert.strictEqual(res.data.length, 5, 'Should return exactly 5 posts for the hero slider');
    const slugs = new Set(res.data.map((a) => a.slug));
    assert.strictEqual(slugs.size, 5, 'All 5 hero slider articles must have unique slugs');
    for (const post of res.data) {
      assert.ok(post.title, 'Hero slide title is missing');
      assert.ok(post.slug, 'Hero slide slug is missing');
    }
  });
});
