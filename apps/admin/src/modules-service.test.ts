import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllModules,
  isModuleEnabledSync,
  setModuleEnabled,
  bulkSetModules,
  getModuleForRoute,
} from './lib/modules-service';

describe('CMS Modular Architecture & Plugin System', () => {
  it('registers all platform modules with metadata and route mappings', async () => {
    const modules = await getAllModules();
    assert.ok(modules.length >= 20, 'Should have at least 20 registered modules');

    // Verify key modules are present
    const adsense = modules.find((m) => m.id === 'adsense');
    assert.ok(adsense, 'AdSense module should be registered');
    assert.equal(adsense?.category, 'marketing');

    const forms = modules.find((m) => m.id === 'forms');
    assert.ok(forms, 'Forms module should be registered');

    const calendar = modules.find((m) => m.id === 'calendar');
    assert.ok(calendar, 'Calendar module should be registered');

    const comments = modules.find((m) => m.id === 'comments');
    assert.ok(comments, 'Comments module should be registered');

    const email = modules.find((m) => m.id === 'email');
    assert.ok(email, 'Email module should be registered');
    assert.equal(email?.category, 'developer');

    const newsletter = modules.find((m) => m.id === 'newsletter');
    assert.ok(newsletter, 'Newsletter module should be registered');
    assert.equal(newsletter?.category, 'community');

    const heroSlider = modules.find((m) => m.id === 'hero_slider');
    assert.ok(heroSlider, 'Hero slider module should be registered');
    assert.equal(heroSlider?.category, 'content');
  });

  it('protects core modules from deactivation', async () => {
    // Attempting to deactivate core module should throw
    await assert.rejects(
      async () => {
        await setModuleEnabled('content_core', false);
      },
      /cannot be deactivated/
    );

    // Synchronous check still reports true
    assert.equal(isModuleEnabledSync('content_core'), true);
  });

  it('enables and disables optional modules reactively', async () => {
    // Disable AdSense module
    const disabledMod = await setModuleEnabled('adsense', false);
    assert.equal(disabledMod.enabled, false);
    assert.equal(isModuleEnabledSync('adsense'), false);

    // Re-enable AdSense module
    const enabledMod = await setModuleEnabled('adsense', true);
    assert.equal(enabledMod.enabled, true);
    assert.equal(isModuleEnabledSync('adsense'), true);
  });

  it('handles bulk module toggling while preserving core safety', async () => {
    const result = await bulkSetModules({
      forms: false,
      calendar: false,
      content_core: false, // Core modules must remain active
    });

    const forms = result.find((m) => m.id === 'forms');
    const calendar = result.find((m) => m.id === 'calendar');
    const core = result.find((m) => m.id === 'content_core');

    assert.equal(forms?.enabled, false);
    assert.equal(calendar?.enabled, false);
    assert.equal(core?.enabled, true, 'Core modules must remain active');

    // Restore modules
    await bulkSetModules({
      forms: true,
      calendar: true,
    });

    assert.equal(isModuleEnabledSync('forms'), true);
    assert.equal(isModuleEnabledSync('calendar'), true);
  });

  it('correctly maps route paths to their governing module', () => {
    const adsMod = getModuleForRoute('/admin/ads');
    assert.equal(adsMod?.id, 'adsense');

    const calendarMod = getModuleForRoute('/admin/calendar');
    assert.equal(calendarMod?.id, 'calendar');

    const formsMod = getModuleForRoute('/admin/forms');
    assert.equal(formsMod?.id, 'forms');

    const graphqlMod = getModuleForRoute('/admin/graphql');
    assert.equal(graphqlMod?.id, 'graphql');

    const webhooksMod = getModuleForRoute('/admin/webhooks');
    assert.equal(webhooksMod?.id, 'webhooks');

    const emailMod = getModuleForRoute('/admin/emails');
    assert.equal(emailMod?.id, 'email');

    const newsletterMod = getModuleForRoute('/admin/newsletter');
    assert.equal(newsletterMod?.id, 'newsletter');

    const sliderMod = getModuleForRoute('/admin/sliders');
    assert.equal(sliderMod?.id, 'hero_slider');
  });
});
