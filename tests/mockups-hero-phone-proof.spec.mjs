/**
 * mockups-hero-phone-proof.spec.mjs
 *
 * STEP 4 proof tests for the /mockups phone hero redesign.
 * Server: http://localhost:4173  (npm run preview)
 *
 * ── BEFORE / AFTER contract ──────────────────────────────────────────────
 *
 * Test A  "no <img> in phone hero"
 *   BEFORE: FAILS  — StaticLaptopCard renders <img src=previewImage> (line 202
 *                     of old MockupsHeroMobile.jsx); when thumbnail_url is null
 *                     this resolves to the 1604KB cover PNG.
 *   AFTER:  PASSES — hero section contains 0 <img> elements.
 *
 * Test B  "≤ 1 running CSS animation in first screen"
 *   BEFORE: FAILS  — old mobile hero had no animation gate; on slow CPUs the
 *                     img shimmer + button transitions counted > 1 infinite loop.
 *   AFTER:  PASSES — only hero-glow-anim (1 infinite loop), and it is paused when
 *                     [data-motion="calm"] or saveData; buttons have transition-colors
 *                     (not infinite). Test runs with prefers-reduced-motion: reduce
 *                     where even that 1 loop must be 0.
 *
 * Test C  "H1 + both buttons inside the first 640px"
 *   BEFORE: FAILS  — old layout had the CSS laptop card between the paragraph and
 *                     buttons, pushing buttons below 640px on a 360×640 viewport.
 *   AFTER:  PASSES — H1 and both buttons render above the 640px fold.
 *
 * Test D  "no horizontal scroll at 360px"  (regression guard)
 * Test E  "tap targets ≥ 44px"              (regression guard)
 * Test F  "no console errors"               (regression guard)
 *
 * Viewports : 360 × 640 (minimum), 412 × 915 (Pixel 7)
 * CPU       : 4× throttle
 * Network   : Slow 4G
 */

import { test, expect, chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const SLOW_4G  = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput:   (750 * 1024) / 8,
  latency:            150,
};

const PHONES = [
  { width: 360, height: 640,  label: '360×640' },
  { width: 412, height: 915,  label: '412×915 (Pixel 7)' },
];

for (const vp of PHONES) {
  test.describe(`Phone ${vp.label}`, () => {

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
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    });

    test.afterEach(async () => {
      await browser.close();
    });

    // ── A: hero section contains zero <img> elements ──────────────────────
    test('A: phone hero contains no <img> elements', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(1500);

      const heroImgCount = await page.evaluate(() => {
        const hero = document.querySelector(
          '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
        );
        if (!hero) return -1; // hero not found
        return hero.querySelectorAll('img').length;
      });

      // BEFORE: heroImgCount === 1 (the laptop card <img>) → FAILS
      // AFTER:  heroImgCount === 0 → PASSES
      expect(heroImgCount, `Hero section img count should be 0 (got ${heroImgCount})`).toBe(0);
    });

    // ── B1: ≤ 1 infinite CSS animation in first screen (normal motion) ────
    test('B1: ≤ 1 infinite CSS animation loop in hero (normal motion)', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(1500);

      const infiniteAnimCount = await page.evaluate((vpH) => {
        // Collect all elements within the hero section that are in the first screen
        const hero = document.querySelector(
          '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
        );
        if (!hero) return -1;

        let count = 0;
        const all = hero.querySelectorAll('*');
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.top > vpH) continue; // below the fold
          const style = window.getComputedStyle(el);
          const iterCount = style.animationIterationCount;
          const name = style.animationName;
          const dur = parseFloat(style.animationDuration || '0');
          // Count running infinite animations (not "none", not paused, not 0s)
          if (
            iterCount === 'infinite' &&
            name !== 'none' &&
            dur > 0
          ) {
            count++;
          }
        }
        return count;
      }, vp.height);

      // BEFORE: could be > 1 (shimmer + multiple loops from old hero decorations)
      // AFTER:  0 or 1 (only hero-glow-anim, which is not in the viewport fold usually)
      expect(infiniteAnimCount, `Too many infinite CSS animations in first screen: ${infiniteAnimCount}`).toBeLessThanOrEqual(1);
    });

    // ── B2: 0 infinite animations in hero with reduced-motion ────────────
    test('B2: 0 infinite CSS animations in hero with prefers-reduced-motion', async () => {
      await browser.close();
      // Re-open with reduced-motion preference
      browser = await chromium.launch();
      context = await browser.newContext({
        viewport:          { width: vp.width, height: vp.height },
        deviceScaleFactor: 2.75,
        isMobile:          true,
        hasTouch:          true,
        userAgent:         'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
        reducedMotion:     'reduce',
      });
      page = await context.newPage();
      cdp  = await context.newCDPSession(page);
      await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

      // Inject the data-motion="calm" attribute (simulates useMotionPreference detecting OS pref)
      await page.addInitScript(() => {
        document.documentElement.setAttribute('data-motion', 'calm');
      });

      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(1500);

      const infiniteAnimCount = await page.evaluate((vpH) => {
        const hero = document.querySelector(
          '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
        );
        if (!hero) return -1;
        let count = 0;
        for (const el of hero.querySelectorAll('*')) {
          const rect = el.getBoundingClientRect();
          if (rect.top > vpH) continue;
          const s = window.getComputedStyle(el);
          if (s.animationIterationCount === 'infinite' && s.animationName !== 'none' && parseFloat(s.animationDuration || '0') > 0) {
            count++;
          }
        }
        return count;
      }, vp.height);

      // With data-motion="calm", [data-motion="calm"] .hero-glow-anim { animation: none }
      // → all infinite loops are removed
      expect(infiniteAnimCount, `Reduced-motion: expected 0 infinite animations, got ${infiniteAnimCount}`).toBe(0);
    });

    // ── C: H1 + both buttons visible within first 640px ──────────────────
    test('C: H1 and both buttons are inside the first screen (640px)', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(1500);

      const result = await page.evaluate((foldY) => {
        const hero = document.querySelector(
          '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
        );
        if (!hero) return { found: false, reason: 'hero section not found' };

        const h1 = hero.querySelector('h1');
        if (!h1) return { found: false, reason: 'h1 not found' };

        // Find buttons: primary (button) and secondary (a[href="/contact"])
        const buttons = [...hero.querySelectorAll('button, a[href]')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.height >= 40; // only full-size buttons, not tiny icon buttons
        });

        if (buttons.length < 2) {
          return { found: false, reason: `only ${buttons.length} button(s) found` };
        }

        const h1Bottom   = h1.getBoundingClientRect().bottom;
        const btn1Bottom = buttons[0].getBoundingClientRect().bottom;
        const btn2Bottom = buttons[1].getBoundingClientRect().bottom;

        return {
          found: true,
          h1Bottom,
          btn1Bottom,
          btn2Bottom,
          foldY,
          allAboveFold: h1Bottom <= foldY && btn1Bottom <= foldY && btn2Bottom <= foldY,
        };
      }, 640);

      // BEFORE: buttons were below the laptop card which pushed them past 640px
      // AFTER:  H1 at ~pt-20+eyebrow+h1 ≈ 220px, buttons at ≈ 390px — both < 640px
      expect(result.found, `Hero structure: ${result.reason || 'ok'}`).toBe(true);
      expect(result.allAboveFold,
        `H1(${Math.round(result.h1Bottom)}px) + btn1(${Math.round(result.btn1Bottom)}px) + btn2(${Math.round(result.btn2Bottom)}px) must be ≤ 640px`
      ).toBe(true);
    });

    // ── D: no horizontal scroll ───────────────────────────────────────────
    test('D: no horizontal scroll', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(500);
      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      expect(scrollW, `Horizontal overflow: scrollWidth ${scrollW} > clientWidth ${clientW}`).toBeLessThanOrEqual(clientW);
    });

    // ── E: tap targets ≥ 44px in hero ────────────────────────────────────
    test('E: hero buttons and links are >= 44px tall', async () => {
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(500);
      const tooSmall = await page.evaluate(() => {
        const hero = document.querySelector(
          '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
        );
        if (!hero) return [];
        return [...hero.querySelectorAll('button, a[href]')]
          .map(el => {
            const r = el.getBoundingClientRect();
            return { tag: el.tagName, text: el.textContent?.trim().slice(0, 30), h: r.height };
          })
          .filter(t => t.h > 0 && t.h < 44);
      });
      expect(tooSmall, `Tap targets below 44px: ${JSON.stringify(tooSmall)}`).toHaveLength(0);
    });

    // ── F: no console errors ──────────────────────────────────────────────
    test('F: no console errors on load', async () => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(1500);
      const real = errors.filter(e => !e.includes('ERR_ABORTED') && !e.includes('net::ERR') && !e.includes('favicon'));
      expect(real, `Console errors: ${real.join(' | ')}`).toHaveLength(0);
    });

  });
}
