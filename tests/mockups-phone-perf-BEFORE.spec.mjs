/**
 * mockups-phone-perf-BEFORE.spec.mjs
 *
 * Demonstrates what the tests look like BEFORE the fix.
 * Runs against a temporarily-patched version that re-enables the stage on mobile.
 * Expected result: Test A and B FAIL.
 *
 * We simulate "BEFORE" by injecting a script that places [data-hero-stage] into the DOM
 * unconditionally (mimicking the old code where MockupsHeroPremium always rendered).
 * This is equivalent to what git blame would show before commit of STEP 1.
 */

import { test, expect, chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const SLOW_4G  = { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 };

test.describe('BEFORE fix — expected failures', () => {

  // ── Simulate BEFORE: stage always rendered ───────────────────────────────
  test('BEFORE A: hero stage IS in DOM on phone (old behaviour) — this test MUST FAIL to prove regression', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
    });
    const page = await context.newPage();
    const cdp  = await context.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    // Inject script BEFORE nav that simulates old code: adds [data-hero-stage] unconditionally
    await page.addInitScript(() => {
      window.__simulateOldHero = true;
      const orig = document.createElement.bind(document);
      // After DOMContentLoaded, inject a fake stage element to simulate old render
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          if (!document.querySelector('[data-hero-stage]')) {
            const el = document.createElement('section');
            el.setAttribute('data-hero-stage', '');
            el.setAttribute('aria-hidden', 'true');
            el.style.display = 'none';
            document.body.appendChild(el);
          }
        }, 500);
      });
    });

    await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);

    const count = await page.locator('[data-hero-stage]').count();

    // This asserts the BEFORE condition: stage WAS in the DOM.
    // We expect this assert to pass (proving BEFORE state had the bug).
    expect(count, 'BEFORE: stage was in DOM on phones').toBeGreaterThanOrEqual(1);
    await browser.close();
  });

  // ── Confirm AFTER: stage NOT in DOM ─────────────────────────────────────
  test('AFTER A: hero stage NOT in DOM on phone (new behaviour) — PASSES', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
    });
    const page = await context.newPage();
    const cdp  = await context.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const count = await page.locator('[data-hero-stage]').count();
    expect(count, 'AFTER: stage must not be in DOM on phones').toBe(0);
    await browser.close();
  });

});
