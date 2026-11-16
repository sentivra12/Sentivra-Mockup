/**
 * mockups-phone-perf.spec.mjs  —  STEP 4 proof tests
 * Server: http://localhost:4173  (npm run preview)
 *
 * Test A: Hero stage ([data-hero-stage]) must NOT be in the DOM on a phone.
 *   BEFORE fix: FAILS  — MockupsHeroPremium renders on all viewports (no mobile split).
 *   AFTER  fix: PASSES — isMobile=true → MockupsHeroMobile; lazy chunk never downloads.
 *
 * Test B: No long task > 100ms fires WHILE scrolling (after page fully loaded).
 *   BEFORE fix: FAILS  — 12 Infinity framer-motion loops + setInterval(40ms) produce
 *                         tasks up to ~280ms on 4× CPU during scroll.
 *   AFTER  fix: PASSES — zero Infinity loops on phone, zero backdrop-filter, zero setInterval.
 *
 * Test C: ≥ 4 cards visible (regression guard).
 * Test D: No horizontal scroll at 360px.
 * Test E: Hero tap targets ≥ 44px.
 * Test F: No JS console errors.
 *
 * Viewports : 360 × 780, 412 × 915 (Pixel 7)
 * CPU       : 4× throttle via CDP
 * Network   : Slow 4G (1.6 Mbps / 750 Kbps / 150ms RTT)
 */

import { test, expect, chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const SLOW_4G  = { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 };
const CPU_SLOW = 4;

const PHONES = [
  { width: 360, height: 780,  label: '360' },
  { width: 412, height: 915,  label: '412 (Pixel 7)' },
];

for (const vp of PHONES) {
  test.describe(`Phone ${vp.label}px`, () => {

    let browser, context, page, cdp;

    test.beforeEach(async () => {
      browser = await chromium.launch();
      context = await browser.newContext({
        viewport:          { width: vp.width, height: vp.height },
        deviceScaleFactor: 2.75,
        isMobile:          true,
        hasTouch:          true,
        userAgent:         'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
      });
      page = await context.newPage();
      cdp  = await context.newCDPSession(page);
      await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOW });
    });

    test.afterEach(async () => {
      await browser.close();
    });

    // ── A: hero stage not in DOM ─────────────────────────────────────────────
    test('A: hero stage ([data-hero-stage]) is NOT in the DOM', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Wait for React to hydrate (mobile hero is synchronous, renders immediately)
      await page.waitForTimeout(2000);

      const count = await page.locator('[data-hero-stage]').count();
      // BEFORE: count === 1 (stage renders on all viewports) → FAILS
      // AFTER:  count === 0 (lazy chunk not loaded on phones) → PASSES
      expect(count, 'Hero stage must not render on a phone viewport').toBe(0);
    });

    // ── B: no long task > 100ms WHILE SCROLLING ─────────────────────────────
    test('B: no task > 100ms while scrolling the first 2 screens', async () => {
      // Inject collector BEFORE page load
      await page.addInitScript(() => {
        window.__longTasks = [];
        window.__collectingScrollTasks = false;
        try {
          const obs = new PerformanceObserver((list) => {
            if (!window.__collectingScrollTasks) return;
            for (const e of list.getEntries()) {
              if (e.duration > 100) window.__longTasks.push({ dur: Math.round(e.duration), start: Math.round(e.startTime) });
            }
          });
          obs.observe({ type: 'longtask', buffered: false });
        } catch (_) { /* longtask not supported */ }
      });

      // Load page and wait for cards to actually appear in DOM
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('[role="listitem"]', { timeout: 30000 });
      // Extra settle: let any post-render effects complete
      await page.waitForTimeout(1500);

      // Start collecting, then scroll
      await page.evaluate(() => {
        window.__longTasks = [];
        window.__collectingScrollTasks = true;
      });

      const screenH = vp.height;
      await page.evaluate((h) => window.scrollTo({ top: h * 2, behavior: 'smooth' }), screenH);
      await page.waitForTimeout(1500); // scroll + observer fire window

      const tasks = await page.evaluate(() => window.__longTasks ?? []);

      // BEFORE: 1–3 tasks > 100ms (Infinity loops + setInterval 40ms + useScroll physics)
      // AFTER:  0 tasks → PASSES
      expect(tasks.length,
        `${tasks.length} long task(s) > 100ms during scroll: ${JSON.stringify(tasks)}`
      ).toBe(0);
    });

    // ── C: ≥ 4 cards visible ────────────────────────────────────────────────
    test('C: at least 4 mockup cards visible', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Wait for listitem to appear — cards fetch from Supabase, may take a moment on Slow 4G
      await page.waitForSelector('[role="listitem"]', { timeout: 30000 });
      await page.waitForTimeout(500);

      const cards = await page.locator('[role="listitem"]').count();
      expect(cards, 'Expected at least 4 mockup cards').toBeGreaterThanOrEqual(4);
    });

    // ── D: no horizontal scroll ──────────────────────────────────────────────
    test('D: no horizontal scroll', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1000);

      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));

      expect(scrollW,
        `Horizontal scroll: scrollWidth ${scrollW} > clientWidth ${clientW}`
      ).toBeLessThanOrEqual(clientW);
    });

    // ── E: hero tap targets ≥ 44px ───────────────────────────────────────────
    test('E: hero buttons are >= 44px tall', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(500);

      const tooSmall = await page.evaluate(() => {
        // Look for the hero section — mobile hero has a <section> with aria-label
        const hero = document.querySelector(
          'section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
        );
        if (!hero) return [];
        return [...hero.querySelectorAll('button, a[href]')]
          .map(el => {
            const r = el.getBoundingClientRect();
            return { tag: el.tagName, text: el.textContent?.trim().slice(0, 30), h: r.height };
          })
          .filter(t => t.h > 0 && t.h < 44);
      });

      expect(tooSmall,
        `Tap targets below 44px: ${JSON.stringify(tooSmall)}`
      ).toHaveLength(0);
    });

    // ── F: no console errors ─────────────────────────────────────────────────
    test('F: no console errors on load', async () => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1500);

      const real = errors.filter(e =>
        !e.includes('ERR_ABORTED') &&
        !e.includes('net::ERR') &&
        !e.includes('favicon')
      );

      expect(real, `Console errors: ${real.join(' | ')}`).toHaveLength(0);
    });

  });
}
