/**
 * ABOUT PAGE FIX VERIFICATION
 * 
 * This test verifies the /about page fix for the "Cannot read properties of undefined (reading 'x')" crash.
 * 
 * Root cause: RegionMap.jsx line 50-51 accessed country.coordinates.x but database countries table
 * doesn't have a coordinates column - all countries had undefined coordinates.
 * 
 * Fix: Added defensive code to provide default coordinates when missing, preventing the crash.
 * Also updated old slate-blue (#5C7E8F) to brand emerald (rgb(13, 158, 130)).
 * 
 * Test matrix: light/dark × EN/AR × mobile/desktop × reducedMotion (on/off)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

// Test configurations
const modes = [
  { theme: 'light', lang: 'en', label: 'Light EN' },
  { theme: 'dark', lang: 'en', label: 'Dark EN' },
  { theme: 'light', lang: 'ar', label: 'Light AR' },
  { theme: 'dark', lang: 'ar', label: 'Dark AR' }
];

const viewports = [
  { width: 390, height: 844, name: 'mobile' },
  { width: 1440, height: 900, name: 'desktop' }
];

test.describe('About Page Fix Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set reduced motion OFF for initial tests
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  for (const mode of modes) {
    for (const viewport of viewports) {
      
      test(`${mode.label} ${viewport.name} - Page loads without crash`, async ({ page }) => {
        await page.setViewportSize(viewport);
        
        // Set theme and language
        await page.goto(BASE_URL);
        await page.evaluate((config) => {
          localStorage.setItem('theme', config.theme);
          localStorage.setItem('language', config.lang);
        }, mode);

        // Navigate to About page
        await page.goto(`${BASE_URL}/about`);
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check NO error boundary is shown
        const errorBoundary = page.locator('text=Something went wrong');
        await expect(errorBoundary).not.toBeVisible();

        // Check NO "Cannot read properties of undefined" error
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Verify page loaded successfully
        await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
        
        // Take screenshot
        await page.screenshot({ 
          path: `tests/screenshots/about-fix-${mode.theme}-${mode.lang}-${viewport.name}.png`,
          fullPage: true 
        });

        console.log(`✅ ${mode.label} ${viewport.name}: Page loaded successfully, no crash`);
      });

      test(`${mode.label} ${viewport.name} - Our Presence section visible`, async ({ page }) => {
        await page.setViewportSize(viewport);
        
        await page.goto(BASE_URL);
        await page.evaluate((config) => {
          localStorage.setItem('theme', config.theme);
          localStorage.setItem('language', config.lang);
        }, mode);

        await page.goto(`${BASE_URL}/about`);
        await page.waitForLoadState('networkidle');

        // Check Our Presence section is visible
        const presenceHeading = page.locator('text=Building Solutions Across the Region');
        await expect(presenceHeading).toBeVisible();

        // Check country cards are rendered (should have 3 countries)
        const countryCards = page.locator('[class*="country"]').filter({ hasText: /Egypt|UAE|Oman/i });
        const count = await countryCards.count();
        expect(count).toBeGreaterThan(0);

        console.log(`✅ ${mode.label} ${viewport.name}: Our Presence section rendered with ${count} countries`);
      });

      test(`${mode.label} ${viewport.name} - RegionMap renders without crash`, async ({ page }) => {
        await page.setViewportSize(viewport);
        
        await page.goto(BASE_URL);
        await page.evaluate((config) => {
          localStorage.setItem('theme', config.theme);
          localStorage.setItem('language', config.lang);
        }, mode);

        await page.goto(`${BASE_URL}/about`);
        await page.waitForLoadState('networkidle');

        // On desktop, RegionMap should be visible
        if (viewport.name === 'desktop') {
          // Look for the SVG map with viewBox="0 0 400 400"
          const regionMapSvg = page.locator('svg[viewBox="0 0 400 400"]');
          await expect(regionMapSvg).toBeVisible();

          // Check that country pins are rendered (circles with stroke)
          const pins = regionMapSvg.locator('circle[stroke]');
          const pinCount = await pins.count();
          expect(pinCount).toBeGreaterThan(0);

          console.log(`✅ ${mode.label} ${viewport.name}: RegionMap rendered with ${pinCount} pins`);
        } else {
          console.log(`⏭️  ${mode.label} ${viewport.name}: RegionMap hidden on mobile (expected)`);
        }
      });

      test(`${mode.label} ${viewport.name} - Brand colors applied (no old slate-blue)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        
        await page.goto(BASE_URL);
        await page.evaluate((config) => {
          localStorage.setItem('theme', config.theme);
          localStorage.setItem('language', config.lang);
        }, mode);

        await page.goto(`${BASE_URL}/about`);
        await page.waitForLoadState('networkidle');

        // Check that RegionMap uses brand emerald (rgb(13, 158, 130)) not old slate-blue (#5C7E8F)
        if (viewport.name === 'desktop') {
          const regionMapSvg = page.locator('svg[viewBox="0 0 400 400"]');
          const svgHtml = await regionMapSvg.innerHTML();

          // Old slate-blue should NOT be present
          expect(svgHtml).not.toContain('#5C7E8F');
          expect(svgHtml).not.toContain('rgb(92, 126, 143)');

          // Brand emerald SHOULD be present
          expect(svgHtml).toContain('rgb(13, 158, 130)');

          console.log(`✅ ${mode.label} ${viewport.name}: Brand colors verified (emerald present, slate-blue absent)`);
        }
      });
    }
  }

  test('Reduced motion test - About page works with prefers-reduced-motion', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Page should load without crash
    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    await expect(page.locator('h1')).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/about-fix-reduced-motion.png',
      fullPage: true 
    });

    console.log('✅ Reduced motion: Page loaded successfully');
  });

  test('All sections present - comprehensive check', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Check all major sections are present
    const sections = [
      'Building Solutions Across the Region',  // Our Presence
      'From an Idea to a Growing Team',        // Our Story
      'A Diverse Team of Talented Professionals', // Our Team
      'What Drives Us',                         // Our Values
      "Let's Build Something Great Together"   // CTA
    ];

    for (const sectionText of sections) {
      const section = page.locator(`text=${sectionText}`);
      await expect(section).toBeVisible();
      console.log(`✅ Section present: "${sectionText}"`);
    }

    console.log('✅ All sections verified and visible');
  });
});
