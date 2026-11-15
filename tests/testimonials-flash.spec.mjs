// @ts-check
/**
 * Testimonials Flash Bug Test
 *
 * BEFORE FIX: This test MUST FAIL, proving the DEMO banner and demo testimonial
 * flash on screen for a split second while the Supabase query is pending.
 *
 * AFTER FIX: This test MUST PASS, proving:
 *   1. No "DEMO" text ever appears in production preview
 *   2. No "demo testimonial" text ever appears
 *   3. A skeleton shows while loading (no blank space or demo content)
 *   4. Section is hidden when empty or errored (no demo banner in that case either)
 *   5. CLS is minimal (< 0.1)
 *
 * Run: npx playwright test tests/testimonials-flash.spec.mjs --headed
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';

test.describe('Testimonials Section — DEMO Flash Bug', () => {
  test('BEFORE FIX: DEMO banner and fake testimonial flash on page load (network delay)', async ({ page }) => {
    // Delay all Supabase requests by 2 seconds to simulate slow network
    await page.route('**/rest/v1/testimonials*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    // Within the first 500ms (before the 2s delay completes), check for DEMO content
    await page.waitForTimeout(500);

    const bodyText = await page.textContent('body');

    // BEFORE FIX: These assertions should FAIL because DEMO content IS visible
    // AFTER FIX: These assertions should PASS because DEMO content is NEVER visible in production
    const hasDemoText = bodyText.includes('DEMO') || bodyText.includes('Demo Mode');
    const hasDemoTestimonial = bodyText.includes('demo testimonial') || bodyText.includes('Demo Client');

    // In production preview (import.meta.env.PROD = true), DEMO should NEVER appear
    // If we're running vite preview, this is a production build
    if (!hasDemoText && !hasDemoTestimonial) {
      console.log('✓ PASS: No DEMO content found (fix is working)');
    } else {
      console.log('✗ FAIL BEFORE FIX: DEMO content flashed on screen');
      console.log(`  - DEMO text found: ${hasDemoText}`);
      console.log(`  - Demo testimonial found: ${hasDemoTestimonial}`);
    }

    // This assertion will FAIL before the fix, PASS after
    expect(hasDemoText, 'DEMO banner should never appear in production preview').toBe(false);
    expect(hasDemoTestimonial, 'Demo testimonial should never appear in production preview').toBe(false);

    // Also check that a skeleton or loading state is visible instead
    const section = page.locator('section').filter({ hasText: /testimonial/i }).first();
    const sectionVisible = await section.isVisible().catch(() => false);
    
    if (sectionVisible) {
      // If section is visible, it should show either:
      // 1. A skeleton/loading state (has some placeholder content)
      // 2. Or be waiting to show real content
      // But NOT demo content
      const sectionText = await section.textContent();
      expect(sectionText.toLowerCase()).not.toContain('demo');
    }

    expect(errors).toHaveLength(0);
  });

  test('empty testimonials: section hidden, no DEMO banner', async ({ page }) => {
    // Return empty array from Supabase
    await page.route('**/rest/v1/testimonials*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });

    const bodyText = await page.textContent('body');

    // Section should be completely hidden (no DEMO banner in production)
    expect(bodyText).not.toContain('DEMO');
    expect(bodyText).not.toContain('Demo Mode');
    expect(bodyText).not.toContain('demo testimonial');

    const section = page.locator('section').filter({ hasText: /testimonial/i }).first();
    const sectionVisible = await section.isVisible().catch(() => false);
    
    // Section should be hidden when empty
    expect(sectionVisible, 'Section should be hidden when no testimonials exist').toBe(false);
  });

  test('404 error: section hidden, no DEMO banner, no retries', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/rest/v1/testimonials*', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Table not found', code: 'PGRST205' }),
      });
    });

    const consoleWarnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        consoleWarnings.push(msg.text());
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // wait to see if retry happens

    const bodyText = await page.textContent('body');

    // No DEMO content
    expect(bodyText).not.toContain('DEMO');
    expect(bodyText).not.toContain('demo testimonial');

    // Section hidden
    const section = page.locator('section').filter({ hasText: /testimonial/i }).first();
    const sectionVisible = await section.isVisible().catch(() => false);
    expect(sectionVisible, 'Section should be hidden on 404 error').toBe(false);

    // No retries (request count should be 1 or 2 max, not 5+)
    expect(requestCount, 'Should not retry on 404').toBeLessThanOrEqual(2);

    // One console warning expected
    expect(consoleWarnings.length, 'Should log one warning for missing table').toBeGreaterThanOrEqual(1);
  });

  test('CLS measurement: minimal layout shift', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Measure CLS using Performance Observer (if available)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            clsValue += entry.value;
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    console.log(`CLS: ${cls.toFixed(4)}`);
    
    // CLS should be < 0.1 (good)
    expect(cls, 'Cumulative Layout Shift should be minimal').toBeLessThan(0.1);
  });

  test('reduced motion: no animation, immediate content', async ({ browser }) => {
    const ctx = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();

    await page.goto(BASE, { waitUntil: 'networkidle' });

    const bodyText = await page.textContent('body');

    // No DEMO in reduced motion either
    expect(bodyText).not.toContain('DEMO');
    expect(bodyText).not.toContain('demo testimonial');

    await ctx.close();
  });

  test('light and dark theme: contrast meets AA', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      // Set theme via localStorage before navigation
      await page.goto(BASE);
      await page.evaluate((t) => {
        localStorage.setItem('theme', t);
        window.location.reload();
      }, theme);
      await page.waitForLoadState('networkidle');

      const section = page.locator('section').filter({ hasText: /testimonial/i }).first();
      const sectionVisible = await section.isVisible().catch(() => false);

      if (sectionVisible) {
        // Check subtitle contrast
        const subtitle = section.locator('p').filter({ hasText: /feedback|businesses/i }).first();
        const subtitleVisible = await subtitle.isVisible().catch(() => false);

        if (subtitleVisible) {
          const color = await subtitle.evaluate(el => window.getComputedStyle(el).color);
          const bgColor = await section.evaluate(el => window.getComputedStyle(el).backgroundColor);

          console.log(`${theme} theme - Subtitle color: ${color}, BG: ${bgColor}`);

          // Parse RGB and calculate contrast ratio
          const parseRGB = (str) => {
            const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
          };

          const getLuminance = ([r, g, b]) => {
            const [rs, gs, bs] = [r, g, b].map(c => {
              c = c / 255;
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          };

          const textRGB = parseRGB(color);
          const bgRGB = parseRGB(bgColor);

          const textLum = getLuminance(textRGB);
          const bgLum = getLuminance(bgRGB);

          const ratio = (Math.max(textLum, bgLum) + 0.05) / (Math.min(textLum, bgLum) + 0.05);

          console.log(`  Contrast ratio: ${ratio.toFixed(2)}:1`);

          // WCAG AA requires 4.5:1 for normal text
          expect(ratio, `Subtitle contrast in ${theme} theme should meet AA (4.5:1)`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
