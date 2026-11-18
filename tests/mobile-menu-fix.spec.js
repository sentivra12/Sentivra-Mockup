import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
];
const SCROLL_POSITIONS = [0, 600, 1500, 'bottom'];

test.describe('Mobile Menu Portal Fix', () => {
  for (const viewport of VIEWPORTS) {
    for (const lang of ['en', 'ar']) {
      for (const theme of ['light', 'dark']) {
        for (const scrollPos of SCROLL_POSITIONS) {
          test(`${viewport.width}x${viewport.height} ${lang} ${theme} scroll=${scrollPos}`, async ({ page }) => {
            await page.setViewportSize(viewport);
            
            // Set theme
            if (theme === 'dark') {
              await page.emulateMedia({ colorScheme: 'dark' });
            }
            
            const url = lang === 'ar' ? `${BASE_URL}/?lang=ar` : BASE_URL;
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(500);
            
            // Scroll to position
            if (scrollPos === 'bottom') {
              await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            } else {
              await page.evaluate((y) => window.scrollTo(0, y), scrollPos);
            }
            await page.waitForTimeout(300);
            
            // Take before screenshot
            await page.screenshot({
              path: `test-results/menu-before-${viewport.width}x${viewport.height}-${lang}-${theme}-${scrollPos}.png`,
              fullPage: false
            });
            
            // Open menu
            const hamburger = page.locator('button[aria-expanded="false"]').filter({ hasText: '' }).first();
            await hamburger.click();
            await page.waitForTimeout(400);
            
            // Take after screenshot
            await page.screenshot({
              path: `test-results/menu-open-${viewport.width}x${viewport.height}-${lang}-${theme}-${scrollPos}.png`,
              fullPage: false
            });
            
            // Check panel fills viewport
            const panel = page.locator('#mobile-menu-panel');
            await expect(panel).toBeVisible();
            const box = await panel.boundingBox();
            expect(box.x).toBeCloseTo(0, 1);
            expect(box.y).toBeCloseTo(0, 1);
            expect(box.width).toBeCloseTo(viewport.width, 1);
            expect(box.height).toBeCloseTo(viewport.height, 1);
            
            // Check all nav links visible and tall enough
            const navLinks = page.locator('#mobile-menu-panel nav a');
            const count = await navLinks.count();
            expect(count).toBeGreaterThanOrEqual(4);
            
            for (let i = 0; i < count; i++) {
              const link = navLinks.nth(i);
              await expect(link).toBeVisible();
              const linkBox = await link.boundingBox();
              expect(linkBox.height).toBeGreaterThanOrEqual(44);
              
              // elementFromPoint check
              const centerX = linkBox.x + linkBox.width / 2;
              const centerY = linkBox.y + linkBox.height / 2;
              const elementAtCenter = await page.evaluate(([x, y]) => {
                const el = document.elementFromPoint(x, y);
                return el?.tagName;
              }, [centerX, centerY]);
              expect(elementAtCenter).toBe('A');
            }
            
            // Check WhatsApp button hidden
            const waButton = page.locator('a[href*="wa.me"][style*="position: fixed"]');
            await expect(waButton).toHaveCount(0);
            
            // Check close button works
            const closeButton = panel.locator('button[aria-label*="Close"], button[aria-label*="إغلاق"]').first();
            await closeButton.click();
            await page.waitForTimeout(300);
            await expect(panel).not.toBeVisible();
            
            // Check focus returned to hamburger
            const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
            expect(focusedTag).toBe('BUTTON');
            
            // Reopen for Esc test
            await hamburger.click();
            await page.waitForTimeout(300);
            await expect(panel).toBeVisible();
            
            // Check Esc closes
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
            await expect(panel).not.toBeVisible();
            
            // Check body scroll lock (reopen)
            await hamburger.click();
            await page.waitForTimeout(300);
            const scrollBefore = await page.evaluate(() => window.scrollY);
            await page.evaluate(() => {
              for (let i = 0; i < 10; i++) {
                window.scrollBy(0, 100);
              }
            });
            await page.waitForTimeout(100);
            const scrollAfter = await page.evaluate(() => window.scrollY);
            expect(scrollAfter).toBe(scrollBefore);
            
            // Close
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
            
            // Check no console errors
            const errors = [];
            page.on('console', msg => {
              if (msg.type() === 'error') errors.push(msg.text());
            });
            expect(errors.length).toBe(0);
          });
        }
      }
    }
  }
});
