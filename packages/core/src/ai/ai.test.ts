import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { getAiProvider } from './index';

describe('AI Extension Framework & Provider Adapters', () => {
  const provider = getAiProvider('mock');

  test('generates content with specified prompt and structure', async () => {
    const text = await provider.generateText({
      prompt: 'Headless CMS Architecture',
      type: 'outline',
    });
    assert.match(text, /Comprehensive Guide/);
    assert.match(text, /Architecture Principles/);
  });

  test('rewrites text for clarity and formality', async () => {
    const text = await provider.rewriteText({
      text: 'We utilize state of the art tools',
      instruction: 'clarity',
    });
    assert.match(text, /use/);
  });

  test('suggests SEO meta tags and focus keywords', async () => {
    const suggestion = await provider.suggestSeo({
      title: 'Next.js 16 Web Development',
      content: 'Building headless web applications...',
      focusKeyword: 'Next.js',
    });
    assert.ok(suggestion.metaTitle.length > 0);
    assert.ok(suggestion.metaDescription.length > 0);
    assert.ok(suggestion.focusKeywords.includes('Next.js'));
  });

  test('generates alt text and caption for media assets', async () => {
    const result = await provider.generateAltText({
      filename: 'enterprise_cloud_dashboard.png',
    });
    assert.match(result.altText, /enterprise cloud dashboard/);
    assert.ok(result.tags.length > 0);
  });

  test('translates text to target locale', async () => {
    const translated = await provider.translateText({
      text: 'Hello World',
      targetLocale: 'es-ES',
    });
    assert.match(translated, /\[ES\] Hello World/);
  });
});
