/**
 * Screenshots showing autoplay working
 */
import { test } from '@playwright/test';

test('dark EN autoplay 3 frames 2s apart', async ({ page }) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/hero-autoplay-frame1.png', fullPage: false });
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/hero-autoplay-frame2.png', fullPage: false });
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/hero-autoplay-frame3.png', fullPage: false });
});
