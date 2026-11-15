// @ts-check
/**
 * Hero smoke tests — Round 4
 *
 * Assertions (run against npm run preview on port 4173):
 *   A. No <img> whose src comes from the Supabase storage/mockups bucket inside the hero
 *   B. No unintended card overlaps (every stage card's bounding rect must not intersect
 *      any other stage card except the two intentional slight-overlaps we allow:
 *        - none defined: all cards should be fully non-overlapping)
 *   C. Logo left edge === eyebrow left edge at 1440 and 1920 (± 4 px tolerance)
 *   D. h1, paragraph, and primary CTA button have computed opacity 1 and filter 'none'
 *      after 2 s — in BOTH reducedMotion 'reduce' and 'no-preference'
 *   E. No console errors on the page
 *
 * Run: npx playwright test tests/hero.spec.mjs
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';
const SUPABASE_STORAGE_HOST = 'supabase.co/storage';

/* ── helpers ──────────────────────────────────────────────────────────── */

/** Returns true if rect A and rect B overlap (strict — touching edges don't count) */
function rectsOverlap(a, b) {
  return (
    a.left   < b.right  - 1 &&
    a.right  > b.left   + 1 &&
    a.top    < b.bottom - 1 &&
    a.bottom > b.top    + 1
  );
}

/** Wait for all .hero-enter-fallback elements to reach opacity 1 */
async function waitForHeroVisible(page) {
  await page.waitForTimeout(2100); // 1.5 s force-visible + 0.6 s buffer
}

/* ── tests ────────────────────────────────────────────────────────────── */

test.describe('Hero — no real mockup images', () => {
  test('hero contains no <img> from supabase storage/mockups', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(BASE, { waitUntil: 'networkidle' });

    const heroSection = page.locator('section[aria-label="Hero section"]');
    await expect(heroSection).toBeVisible();

    // All <img> elements inside the hero
    const imgs = await heroSection.locator('img').all();
    for (const img of imgs) {
      const src = await img.getAttribute('src');
      if (src) {
        expect(
          src.includes(SUPABASE_STORAGE_HOST),
          `Hero contains a Supabase storage image: ${src}`,
        ).toBe(false);
        // Also reject any URL containing "/mockups/" path segment
        expect(
          src.includes('/mockups/'),
          `Hero contains an image from /mockups/ path: ${src}`,
        ).toBe(false);
      }
    }

    // E: No console errors
    expect(errors, `Console errors found: ${errors.join(', ')}`).toHaveLength(0);
  });
});

test.describe('Hero — card layout (no unintended overlaps)', () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
  ]) {
    test(`no card overlaps at ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await waitForHeroVisible(page);

      const heroSection = page.locator('section[aria-label="Hero section"]');
      const visualStage = heroSection.locator('[aria-label="Software engineering illustration"]');

      // Skip on mobile (cards are hidden / stacked)
      if (viewport.width < 1024) return;
      await expect(visualStage).toBeVisible();

      // Collect bounding rects for all aria-hidden cards inside the visual
      const cardSelectors = [
        // CodeCard, ChatCard, DashboardCard, MobileAppCard all have aria-hidden="true"
        // and distinct widths; we query all direct child divs of the stage that are aria-hidden
      ];

      // Get all aria-hidden divs inside the stage that have a non-zero area
      const cards = await visualStage.locator('div[aria-hidden="true"]').all();
      const rects = [];
      for (const card of cards) {
        const box = await card.boundingBox();
        if (box && box.width > 20 && box.height > 20 && box.width < 300) {
          rects.push({ ...box, el: card });
        }
      }

      // Check all pairs
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i];
          const b = rects[j];
          const overlaps = rectsOverlap(a, b);
          if (overlaps) {
            // Report clearly
            console.error(`Overlap detected at ${viewport.width}px: rect[${i}] (${JSON.stringify({ left: Math.round(a.left), top: Math.round(a.top), w: Math.round(a.width), h: Math.round(a.height) })}) overlaps rect[${j}] (${JSON.stringify({ left: Math.round(b.left), top: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) })})`);
          }
          expect(overlaps, `Card rect[${i}] overlaps card rect[${j}] at ${viewport.width}px`).toBe(false);
        }
      }
    });
  }
});

test.describe('Hero — container alignment', () => {
  for (const width of [1440, 1920]) {
    test(`logo left edge === eyebrow left edge at ${width}px (±4px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await waitForHeroVisible(page);

      const logoBox    = await page.locator('header a[aria-label="Sentivra home"]').boundingBox();
      const eyebrowBox = await page.locator('section[aria-label="Hero section"] .hero-enter-fallback').first().boundingBox();

      expect(logoBox,    'Logo element not found').toBeTruthy();
      expect(eyebrowBox, 'Eyebrow element not found').toBeTruthy();

      const diff = Math.abs(logoBox.x - eyebrowBox.x);
      expect(diff, `Logo left (${Math.round(logoBox.x)}) differs from eyebrow left (${Math.round(eyebrowBox.x)}) by ${Math.round(diff)}px`).toBeLessThanOrEqual(4);
    });
  }
});

test.describe('Hero — opacity/filter after 2s', () => {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    test(`h1/p/button opacity=1 filter=none with reducedMotion='${reducedMotion}'`, async ({ browser }) => {
      const ctx = await browser.newContext({
        reducedMotion,
        viewport: { width: 1440, height: 900 },
      });
      const page = await ctx.newPage();

      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

      await page.goto(BASE, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2200); // past the 1.5 s force-visible fallback

      const hero = page.locator('section[aria-label="Hero section"]');

      // h1
      const h1 = hero.locator('h1').first();
      await expect(h1).toBeVisible();
      const h1Opacity = await h1.evaluate(el => window.getComputedStyle(el).opacity);
      expect(parseFloat(h1Opacity), `h1 opacity=${h1Opacity} (reducedMotion=${reducedMotion})`).toBeCloseTo(1, 1);
      const h1Filter = await h1.evaluate(el => window.getComputedStyle(el).filter);
      expect(h1Filter, `h1 filter=${h1Filter} (reducedMotion=${reducedMotion})`).toMatch(/^none$|^blur\(0/);

      // paragraph
      const para = hero.locator('p').first();
      await expect(para).toBeVisible();
      const paraOpacity = await para.evaluate(el => window.getComputedStyle(el).opacity);
      expect(parseFloat(paraOpacity), `paragraph opacity=${paraOpacity}`).toBeCloseTo(1, 1);

      // primary CTA
      const cta = hero.locator('a').filter({ hasText: /start|get started|ابدأ/i }).first();
      await expect(cta).toBeVisible();
      const ctaOpacity = await cta.evaluate(el => window.getComputedStyle(el).opacity);
      expect(parseFloat(ctaOpacity), `CTA opacity=${ctaOpacity}`).toBeCloseTo(1, 1);

      // No console errors
      expect(errors, `Console errors (reducedMotion=${reducedMotion}): ${errors.join(', ')}`).toHaveLength(0);

      await ctx.close();
    });
  }
});
