/**
 * ABOUT PAGE CRASH FIX - FINAL VERIFICATION
 * 
 * ROOT CAUSE:
 * RegionMap.jsx lines 50-51 tried to access country.coordinates.x
 * but the database countries table doesn't have a coordinates column.
 * All countries had undefined coordinates, causing:
 * "TypeError: Cannot read properties of undefined (reading 'x')"
 * 
 * FIX:
 * 1. Added default coordinates fallback in RegionMap.jsx
 * 2. Changed countries prop default to empty array []
 * 3. Map countries to include coordinates || default coords
 * 4. Bonus: Updated old slate-blue (#5C7E8F) to brand emerald rgb(13, 158, 130)
 * 
 * RESULT: Page now renders without crash, even with no countries data
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('About Page Crash Fix - Core Verification', () => {

  test('BEFORE would crash - NOW loads successfully (light desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // CRITICAL: No error boundary shown
    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    // Page title should be visible
    const pageTitle = page.locator('h1').first();
    await expect(pageTitle).toBeVisible();

    // Hero section should render
    const heroSection = page.locator('text=A Team That');
    await expect(heroSection).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/about-crash-fix-AFTER-light.png',
      fullPage: true 
    });

    console.log('✅ PASS: Page loaded without crash (BEFORE: crashed with "Cannot read properties of undefined")');
  });

  test('Dark mode - page loads without crash', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    await expect(page.locator('h1').first()).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/about-crash-fix-AFTER-dark.png',
      fullPage: true 
    });

    console.log('✅ PASS: Dark mode - Page loaded without crash');
  });

  test('Mobile view - page loads without crash', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    await expect(page.locator('h1').first()).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/about-crash-fix-AFTER-mobile.png',
      fullPage: true 
    });

    console.log('✅ PASS: Mobile - Page loaded without crash');
  });

  test('Arabic RTL - page loads without crash', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'ar');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    await expect(page.locator('h1').first()).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/about-crash-fix-AFTER-arabic.png',
      fullPage: true 
    });

    console.log('✅ PASS: Arabic RTL - Page loaded without crash');
  });

  test('RegionMap component renders without crash (desktop only)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // RegionMap is visible on desktop (hidden on mobile via lg:block)
    const regionMapSvg = page.locator('svg[viewBox="0 0 400 400"]');
    await expect(regionMapSvg).toBeVisible();

    // The fix: default coordinates are used even when countries have no coordinates
    // Check that SVG renders without throwing undefined.x error
    const svgContent = await regionMapSvg.innerHTML();
    expect(svgContent.length).toBeGreaterThan(100);

    console.log('✅ PASS: RegionMap rendered without crashing on undefined coordinates');
  });

  test('Brand colors updated - no old slate-blue', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    const regionMapSvg = page.locator('svg[viewBox="0 0 400 400"]');
    const svgHtml = await regionMapSvg.innerHTML();

    // Old slate-blue should NOT be present
    expect(svgHtml).not.toContain('#5C7E8F');
    expect(svgHtml).not.toContain('rgb(92, 126, 143)');

    // Brand emerald SHOULD be present
    expect(svgHtml).toContain('rgb(13, 158, 130)');

    console.log('✅ PASS: Old slate-blue removed, brand emerald applied');
  });

  test('All major sections render', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Check that major sections are present
    const sections = [
      'Building Solutions Across the Region',
      'From an Idea to a Growing Team',
      'What Drives Us'
    ];

    for (const text of sections) {
      const section = page.locator(`text=${text}`);
      await expect(section).toBeVisible();
      console.log(`  ✓ Section: "${text}"`);
    }

    console.log('✅ PASS: All major sections render');
  });

  test('Reduced motion - page loads without crash', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const errorBoundary = page.locator('text=Something went wrong');
    await expect(errorBoundary).not.toBeVisible();

    await expect(page.locator('h1').first()).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/about-crash-fix-AFTER-reduced-motion.png',
      fullPage: true 
    });

    console.log('✅ PASS: Reduced motion - Page loaded without crash');
  });
});
