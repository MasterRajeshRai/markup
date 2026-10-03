import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  cmsClient,
  FALLBACK_HOME,
  FALLBACK_SLIDER,
  FALLBACK_ARTICLES,
} from './lib/cms-client';

describe('Prince Public School Frontend Client & Contract', () => {
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

  it('delivers flagship hero slider with active slides and dual CTAs', async () => {
    const res = await cmsClient.getSlider('homepage-hero');
    assert.ok(res);
    assert.ok(res.slider);
    assert.strictEqual(res.slider.slug, 'homepage-hero');
    assert.ok(Array.isArray(res.slides));
    assert.ok(res.slides.length >= 5);

    const firstSlide = res.slides[0];
    assert.ok(firstSlide.title);
    assert.ok(firstSlide.imageUrl);
    assert.ok(firstSlide.primaryCta?.label);
    assert.ok(firstSlide.secondaryCta?.label);
    assert.strictEqual(firstSlide.isActive, true);

    const boardingSlide = res.slides.find((s: any) => s.title.includes('Day Scholar + Boarding') || s.subtitle.includes('Dormitories'));
    assert.ok(boardingSlide, 'Boarding slide must exist in hero slider');
  });

  it('delivers comprehensive school navigation with all required sections', async () => {
    const nav = await cmsClient.getNavigation('main-navigation');
    assert.ok(nav.data?.items);
    assert.ok(nav.data.items.length >= 8);

    const titles = nav.data.items.map((i: any) => i.title);
    assert.ok(titles.includes('Home'));
    assert.ok(titles.includes('About Us'));
    assert.ok(titles.includes('Academics'));
    assert.ok(titles.includes('Admissions'));
    assert.ok(titles.includes('Facilities'));
    assert.ok(titles.includes('Student Life'));
    assert.ok(titles.includes('Notices'));
    assert.ok(titles.includes('Contact'));
  });

  it('delivers school branding and settings metadata', async () => {
    const settings = await cmsClient.getSettings();
    assert.ok(settings);
    assert.ok(settings.site?.name?.includes('Prince Public School'));
    assert.ok(settings.branding?.logoUrl?.includes('pps-crest.svg'));
  });

  it('delivers articles with taxonomy tagging and summaries', async () => {
    const res = await cmsClient.getEntries('articles');
    assert.ok(res.data);
    assert.ok(res.data.length > 0);

    const first = res.data[0];
    assert.ok(first.slug);
    assert.ok(first.title);
    assert.ok(first.data?.summary);
  });

  it('fetches single article by slug with blocks', async () => {
    const res = await cmsClient.getEntry('building-enterprise-headless-cms-with-nextjs');
    assert.ok(res.data);
    assert.strictEqual(res.data.slug, 'building-enterprise-headless-cms-with-nextjs');
  });
});
