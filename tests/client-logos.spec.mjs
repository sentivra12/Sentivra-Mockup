// @ts-check
/**
 * Client Logos Strip — Smoke Tests
 *
 * Assertions:
 *   A. No <img> with naturalWidth = 0 (broken image) inside the client logos section
 *   B. No raw alt text visible (if image fails, fallback initials monogram must show instead)
 *   C. Strip hidden when 0 published logos
 *   D. Marquee animation pauses on hover (transform style changes to 'none')
 *   E. Reduced motion: static grid (no animation, all items visible)
 *   F. No console errors
 *
 * Run: npx playwright test tests/client-logos.spec.mjs
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';

test.describe('Client Logos Strip', () => {
  test('no broken images — all <img> have naturalWidth > 0 or fallback initials show', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(BASE, { waitUntil: 'networkidle' });

    const section = page.locator('section[aria-label="Trusted by"]');
    
    // If section is not visible, that means 0 published logos → pass (strip correctly hidden)
    const sectionVisible = await section.isVisible().catch(() => false);
    if (!sectionVisible) {
      console.log('✓ Strip correctly hidden (0 published logos)');
      expect(errors).toHaveLength(0);
      return;
    }

    // Section is visible → check all images
    const images = await section.locator('img').all();
    
    for (const img of images) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const alt = await img.getAttribute('alt');
      
      if (naturalWidth === 0) {
        // Image failed to load — check if fallback initials monogram is visible instead
        const badge = img.locator('xpath=ancestor::div[contains(@class, "group")]');
        const fallbackVisible = await badge.locator('div').filter({ hasText: /^[A-Z]{1,2}$/ }).isVisible().catch(() => false);
        
        expect(
          fallbackVisible,
          `Broken image detected (alt="${alt}") and no fallback initials visible`
        ).toBe(true);
      }
    }

    // B. No raw alt text visible as plain text (fallback must be initials in a styled div, not alt text)
    const badges = await section.locator('[role="listitem"]').all();
    for (const badge of badges) {
      const text = await badge.textContent();
      // Check if raw alt text is showing (more than 3 chars usually means a sentence, not initials)
      if (text && text.trim().length > 3 && !/^[A-Z]{1,2}$/.test(text.trim())) {
        const hasImage = await badge.locator('img').count() > 0;
        if (hasImage) {
          const imgNaturalWidth = await badge.locator('img').evaluate(el => el.naturalWidth);
          expect(
            imgNaturalWidth,
            `Raw alt text visible: "${text.trim()}" — image failed and fallback didn't render`
          ).toBeGreaterThan(0);
        }
      }
    }

    // F. No console errors
    expect(errors, `Console errors: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('marquee pauses on hover at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const section = page.locator('section[aria-label="Trusted by"]');
    const sectionVisible = await section.isVisible().catch(() => false);
    if (!sectionVisible) {
      console.log('✓ Strip hidden (0 logos) — hover test skipped');
      return;
    }

    // Find the animated marquee row (has animation style)
    const marqueeRow = section.locator('div[style*="animation"]').first();
    const marqueeExists = await marqueeRow.count() > 0;
    
    if (!marqueeExists) {
      console.log('✓ Static grid (< 6 logos or reduced motion) — hover test not applicable');
      return;
    }

    // Get animation style before hover
    const styleBefore = await marqueeRow.getAttribute('style');
    expect(styleBefore).toContain('animation');
    expect(styleBefore).not.toContain('animation: none');

    // Hover over the section
    await section.hover();
    await page.waitForTimeout(200); // allow animation-play-state to update

    // Animation should pause (style becomes 'animation: none' or empty)
    const styleAfter = await marqueeRow.getAttribute('style');
    expect(
      styleAfter.includes('animation: none') || styleAfter.includes('animation:none'),
      `Marquee did not pause on hover. Style after hover: ${styleAfter}`
    ).toBe(true);
  });

  test('reduced motion: static grid, no animation', async ({ browser }) => {
    const ctx = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();

    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(BASE, { waitUntil: 'networkidle' });

    const section = page.locator('section[aria-label="Trusted by"]');
    const sectionVisible = await section.isVisible().catch(() => false);
    if (!sectionVisible) {
      console.log('✓ Strip hidden (0 logos)');
      await ctx.close();
      return;
    }

    // Should NOT have any animated marquee rows
    const animatedRows = await section.locator('div[style*="animation"]').count();
    expect(animatedRows, 'Animated marquee found with reducedMotion=reduce').toBe(0);

    // Should have a static flex-wrap grid
    const staticGrid = section.locator('div.flex.flex-wrap');
    await expect(staticGrid).toBeVisible();

    // All badges should be visible (not hidden by overflow)
    const badges = await section.locator('[role="listitem"]').all();
    for (const badge of badges) {
      await expect(badge).toBeVisible();
    }

    expect(errors).toHaveLength(0);
    await ctx.close();
  });

  test('strip hidden when 0 published logos', async ({ page }) => {
    // This test assumes the migration unpublished all seed logos.
    // If you add real logos, this test will fail (which is correct behavior).
    
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const section = page.locator('section[aria-label="Trusted by"]');
    const sectionVisible = await section.isVisible().catch(() => false);

    // With the current DB state (all logos unpublished), section should be hidden
    expect(sectionVisible, 'Strip should be hidden when no published logos exist').toBe(false);
  });
});
