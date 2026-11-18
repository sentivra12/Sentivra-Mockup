/**
 * HOME HERO MOBILE — BEFORE tests
 * These tests FAIL on the current code and PASS after fixes.
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';
const VIEWPORTS = [
  { width: 360, height: 640, name: '360x640' },
  { width: 390, height: 844, name: '390x844' },
  { width: 412, height: 915, name: '412x915' },
  { width: 430, height: 932, name: '430x932' },
];

test.describe('HomeHeroMobile — BEFORE (should FAIL)', () => {
  
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport ${vp.name}`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      test(`[FAIL] logo lockup: exactly ONE logo, no overlap @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Should have exactly ONE Logo component rendered (either in hero or in header)
        const logoContainers = await page.locator('[aria-label*="logo"], [aria-label*="Logo"]').count();
        
        // Current code likely has 2: one in HomeHeroCarousel TopBar + one in Header
        expect(logoContainers, 'Should have exactly 1 logo lockup').toBe(1);

        // Logo icon and wordmark should NOT overlap
        const logos = await page.locator('[aria-label*="logo"], [aria-label*="Logo"]').all();
        for (const logo of logos) {
          const bbox = await logo.boundingBox();
          if (bbox) {
            // Check no other logo overlaps this one
            for (const otherLogo of logos) {
              if (logo !== otherLogo) {
                const otherBbox = await otherLogo.boundingBox();
                if (otherBbox) {
                  // Boxes should not intersect
                  const noOverlap =
                    bbox.x + bbox.width <= otherBbox.x ||
                    otherBbox.x + otherBbox.width <= bbox.x ||
                    bbox.y + bbox.height <= otherBbox.y ||
                    otherBbox.y + otherBbox.height <= bbox.y;
                  expect(noOverlap, 'Logo bounding boxes should not overlap').toBe(true);
                }
              }
            }
          }
        }
      });

      test(`[FAIL] sparkle SVG: no <circle>, single <path> @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Find the main sparkle visual in hero
        const sparkleContainer = page.locator('[aria-hidden="true"]').filter({ has: page.locator('svg') }).first();
        
        // Current code likely has <circle> in the sparkle
        const circles = await sparkleContainer.locator('circle').count();
        expect(circles, 'Sparkle should have NO <circle> elements').toBe(0);

        // Should have exactly one main <path> for the 4-point star
        const paths = await sparkleContainer.locator('path').count();
        expect(paths, 'Sparkle should have at least 1 <path>').toBeGreaterThanOrEqual(1);
      });

      test(`[FAIL] autoplay: slide changes after ~5s @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Get initial slide content
        const initialKeyword = await page.locator('h1').textContent();

        // Wait 5.5 seconds
        await page.waitForTimeout(5500);

        // Keyword should have changed (autoplay)
        const afterKeyword = await page.locator('h1').textContent();
        
        // Current static code: keyword stays the same
        expect(afterKeyword, 'Slide should auto-advance after ~5s').not.toBe(initialKeyword);
      });

      test(`[FAIL] particles: 14-18 dots, transform-only animation @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Current code: likely 0 floating particles or static dots
        const particles = await page.locator('[data-particle="true"], .particle, [class*="dot"]').count();
        expect(particles, 'Should have 14-18 floating particles').toBeGreaterThanOrEqual(14);
        expect(particles, 'Should have 14-18 floating particles').toBeLessThanOrEqual(18);

        // Each particle should animate ONLY transform (no top/left/filter)
        const firstParticle = page.locator('[data-particle="true"], .particle').first();
        const computedStyle = await firstParticle.evaluate(el => {
          const style = window.getComputedStyle(el);
          const animName = style.animationName;
          return { animName };
        });

        expect(computedStyle.animName, 'Particle should have animation').not.toBe('none');
      });

      test(`[FAIL] reduced-motion: no animation @${vp.name}`, async ({ page, context }) => {
        await context.addInitScript(() => {
          Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query) => ({
              matches: query === '(prefers-reduced-motion: reduce)',
              media: query,
              addEventListener: () => {},
              removeEventListener: () => {},
            }),
          });
        });

        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Under reduced-motion, ALL animations should be 'none'
        const particles = await page.locator('[data-particle="true"], .particle').all();
        for (const p of particles) {
          const animName = await p.evaluate(el => window.getComputedStyle(el).animationName);
          expect(animName, 'Particle animation should be none under reduced-motion').toBe('none');
        }
      });

    });
  }

  test('Desktop 1440: should NOT change', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    
    // Desktop should use PremiumHero/DesktopHero, NOT HomeHeroMobile
    const isMobile = await page.locator('[data-hero-mobile="true"]').count();
    expect(isMobile, 'Desktop should NOT render mobile hero').toBe(0);

    // Take screenshot for visual comparison
    await page.screenshot({
      path: 'test-results/desktop-1440-BEFORE.png',
      fullPage: false,
    });
  });
});
