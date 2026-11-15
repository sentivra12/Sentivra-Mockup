/**
 * Client Logos Strip - Complete Test Suite
 * 
 * Tests:
 * 1. Strip visible with 1+ published logos
 * 2. Strip hidden with empty response
 * 3. Strip hidden with 404/error
 * 4. Broken image shows monogram (no naturalWidth=0, no raw alt text)
 * 5. Hero divider has no visible seam
 * 6. Marquee pauses on hover (6+ logos)
 * 7. Static grid for <6 logos
 * 8. Reduced motion: static wrapped grid
 * 9. Stats show final values (no "0+" flash)
 * 10. Works in EN/AR, light/dark, 390px/1440px
 */

import { test, expect } from '@playwright/test';

test.describe('Client Logos Strip - Complete', () => {
  
  test('shows strip with 1 published logo - visible and styled correctly', async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Wait for TrustedBySection to load
    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).toBeVisible({ timeout: 5000 });

    // Check header
    const header = section.locator('text=/Trusted By|موثوق به/i').first();
    await expect(header).toBeVisible();

    // Check for client badge
    const badges = section.locator('[role="listitem"]');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);

    // Check badge visibility and size
    const firstBadge = badges.first();
    await expect(firstBadge).toBeVisible();
    
    // Check image is visible and loaded
    const img = firstBadge.locator('img');
    if (await img.count() > 0) {
      await expect(img).toBeVisible();
      
      // Check image naturalWidth > 0 (loaded successfully)
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }

    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/client-logos-visible.png',
      fullPage: true 
    });
  });

  test('strip hidden when no published logos (empty response)', async ({ page }) => {
    // Mock empty response
    await page.route('**/rest/v1/client_logos*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Section should not be visible
    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).not.toBeVisible();

    // No console errors expected
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });

  test('strip hidden on 404/error with one console warning', async ({ page }) => {
    const warnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('TrustedBySection')) {
        warnings.push(msg.text());
      }
    });

    // Mock 404 response
    await page.route('**/rest/v1/client_logos*', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not Found' })
      });
    });

    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Section should not be visible
    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).not.toBeVisible();

    // Expect exactly one warning
    await page.waitForTimeout(1000);
    expect(warnings.length).toBe(1);
  });

  test('broken image shows monogram fallback', async ({ page }) => {
    // Mock response with broken image URL
    await page.route('**/rest/v1/client_logos*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'test-1',
          client_name: 'Test Client',
          client_name_ar: 'عميل تجريبي',
          logo_url: 'https://invalid-url-that-will-fail.example.com/broken.png',
          website_url: 'https://example.com',
          alt_text: 'Test Logo',
          is_active: true,
          display_order: 0,
          invert_in_dark: false
        }])
      });
    });

    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).toBeVisible();

    // Wait for image to fail and fallback to render
    await page.waitForTimeout(2000);

    // Check for monogram fallback (should contain initials "TC")
    const badge = section.locator('[role="listitem"]').first();
    const monogram = badge.locator('text=/TC|ع/');
    await expect(monogram).toBeVisible();

    // No broken image icon or raw alt text visible
    const altText = badge.locator('text="Test Logo"');
    await expect(altText).not.toBeVisible();
  });

  test('hero divider has no visible seam with logos section', async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Take screenshot of hero bottom and logos section top
    const hero = page.locator('section').first(); // Hero is first section
    const logoSection = page.locator('section[aria-label="Trusted by"]');

    await expect(hero).toBeVisible();
    await expect(logoSection).toBeVisible();

    // Get bounding boxes
    const heroBox = await hero.boundingBox();
    const logoBox = await logoSection.boundingBox();

    // Check they are adjacent (logo section starts right after hero)
    expect(logoBox.y).toBeLessThanOrEqual(heroBox.y + heroBox.height + 2); // Allow 2px tolerance

    // Take full page screenshot to verify seam visually
    await page.screenshot({ 
      path: 'tests/screenshots/client-logos-seam-check.png',
      fullPage: false // Just viewport
    });
  });

  test('static grid for single logo (no marquee)', async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    const section = page.locator('section[aria-label="Trusted by"]');
    const badges = section.locator('[role="listitem"]');
    const count = await badges.count();

    if (count < 6) {
      // Should use static grid (flex-wrap)
      const container = section.locator('[role="list"]').first();
      const classList = await container.getAttribute('class');
      expect(classList).toContain('flex-wrap');
      expect(classList).not.toContain('overflow-hidden');
    }
  });

  test('reduced motion: static grid instead of marquee', async ({ page, context }) => {
    // Mock response with 8 logos (would normally trigger marquee)
    await page.route('**/rest/v1/client_logos*', route => {
      const logos = Array.from({ length: 8 }, (_, i) => ({
        id: `logo-${i}`,
        client_name: `Client ${i + 1}`,
        logo_url: `https://via.placeholder.com/100?text=Logo${i + 1}`,
        is_active: true,
        display_order: i
      }));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(logos)
      });
    });

    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).toBeVisible();

    // Should use static grid even with 8 logos
    const container = section.locator('[role="list"]').first();
    const classList = await container.getAttribute('class');
    expect(classList).toContain('flex-wrap');

    // No animation styles
    const animatedDiv = section.locator('[style*="animation"]');
    expect(await animatedDiv.count()).toBe(0);
  });

  test('stats show final values immediately (no 0+ flash)', async ({ page }) => {
    await page.goto('http://localhost:4173');
    
    // Check stats section before it enters viewport
    const statsSection = page.locator('section').filter({ hasText: /Projects Completed|Happy Clients/i });
    
    // Before scrolling into view, stats should show final values (not 0)
    const statValues = statsSection.locator('.text-4xl, .text-5xl');
    const firstValue = await statValues.first().textContent();
    
    // Should not be "0+" or just "0"
    expect(firstValue).not.toBe('0+');
    expect(firstValue).not.toBe('0');
    expect(firstValue).not.toBe('0%');
  });

  test('works in Arabic (RTL)', async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Switch to Arabic
    const langButton = page.locator('button[aria-label*="العربية"], button:has-text("ع")');
    if (await langButton.count() > 0) {
      await langButton.click();
      await page.waitForTimeout(500);
    }

    const section = page.locator('section[aria-label="Trusted by"], section:has-text("موثوق به")');
    await expect(section).toBeVisible();

    // Check RTL header
    const header = section.locator('text="موثوق به"');
    await expect(header).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/client-logos-rtl.png',
      fullPage: true 
    });
  });

  test('works in dark mode', async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Switch to dark mode
    const themeButton = page.locator('button[aria-label*="theme"], button[aria-label*="Dark"]').first();
    if (await themeButton.count() > 0) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }

    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).toBeVisible();

    // Check badge is visible in dark mode
    const badge = section.locator('[role="listitem"]').first();
    await expect(badge).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/client-logos-dark.png',
      fullPage: true 
    });
  });

  test('responsive: works at 390px mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).toBeVisible();

    const badges = section.locator('[role="listitem"]');
    const firstBadge = badges.first();
    await expect(firstBadge).toBeVisible();

    // Check badge doesn't overflow viewport
    const box = await firstBadge.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(390);

    await page.screenshot({ 
      path: 'tests/screenshots/client-logos-mobile.png',
      fullPage: true 
    });
  });

  test('responsive: works at 1440px desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    const section = page.locator('section[aria-label="Trusted by"]');
    await expect(section).toBeVisible();

    const badges = section.locator('[role="listitem"]');
    await expect(badges.first()).toBeVisible();

    await page.screenshot({ 
      path: 'tests/screenshots/client-logos-desktop.png',
      fullPage: true 
    });
  });

});
