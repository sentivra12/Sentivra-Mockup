import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const PUBLIC_PAGES = ['/', '/services', '/mockups', '/about', '/contact'];

test.describe('WhatsApp Float Button', () => {
  for (const page of PUBLIC_PAGES) {
    for (const lang of ['en', 'ar']) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
        test(`${page} ${lang} ${viewport.width}x${viewport.height}: exists, positioned correctly, no overlap`, async ({ page: pw }) => {
          await pw.setViewportSize(viewport);
          const url = lang === 'ar' ? `${BASE_URL}${page}?lang=ar` : `${BASE_URL}${page}`;
          await pw.goto(url);
          
          // Wait for content
          await pw.waitForTimeout(800);
          
          // Find WhatsApp FLOAT button (the one with position: fixed and round style)
          const wa = pw.locator('a[href*="wa.me"][style*="position: fixed"]');
          await expect(wa).toHaveCount(1);
          await expect(wa).toBeVisible();
          
          // Check href
          const href = await wa.getAttribute('href');
          expect(href).toMatch(/^https:\/\/wa\.me\/\d+/);
          
          // Check position
          const box = await wa.boundingBox();
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
          expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
          
          // Check RTL positioning
          if (lang === 'ar') {
            // Right side in AR
            expect(box.x + box.width).toBeGreaterThan(viewport.width - 100);
          } else {
            // Left side in EN
            expect(box.x).toBeLessThan(100);
          }
          
          // Check no overlap with scroll-to-top
          const scrollBtn = pw.locator('[aria-label*="scroll"], [aria-label*="top"]').first();
          if (await scrollBtn.count() > 0 && await scrollBtn.isVisible()) {
            const scrollBox = await scrollBtn.boundingBox();
            const noOverlap = 
              box.x + box.width < scrollBox.x || 
              box.x > scrollBox.x + scrollBox.width ||
              box.y + box.height < scrollBox.y ||
              box.y > scrollBox.y + scrollBox.height;
            expect(noOverlap).toBeTruthy();
          }
          
          // Element from point test (should be the button or its SVG icon)
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const elementAtCenter = await pw.evaluate(([x, y]) => {
            const el = document.elementFromPoint(x, y);
            return el?.getAttribute?.('aria-label') || el?.tagName || 'null';
          }, [centerX, centerY]);
          expect(elementAtCenter.toLowerCase()).toMatch(/whatsapp|واتساب|a|svg/i);
          
          // Scroll to bottom
          await pw.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await pw.waitForTimeout(200);
          
          // Check still visible and in same place
          const box2 = await wa.boundingBox();
          expect(Math.abs(box2.x - box.x)).toBeLessThan(5);
          expect(Math.abs(box2.y - box.y)).toBeLessThan(5);
        });
      }
    }
  }
  
  test('Admin route: no WhatsApp float button', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForTimeout(500);
    
    const wa = page.locator('a[href*="wa.me"][style*="position: fixed"]');
    await expect(wa).toHaveCount(0);
  });
});
