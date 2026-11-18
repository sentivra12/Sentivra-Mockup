/**
 * Take screenshots of all 4 slides in EN and AR
 */
import { test } from '@playwright/test';

test('EN slides: ERP, CRM, WEB, MOBILE', async ({ page }) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  
  // Take screenshots of first 4 slides
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(500);
    const keyword = await page.evaluate(() => {
      return document.querySelector('.hhm-kw-text')?.textContent?.trim() || 'slide';
    });
    await page.screenshot({ path: `test-results/hero-en-${keyword.toLowerCase()}.png` });
    console.log(`EN: ${keyword}`);
    
    // Next slide
    if (i < 3) {
      await page.evaluate(() => {
        document.querySelector('button[aria-label*="Next"]')?.click();
      });
      await page.waitForTimeout(700);
    }
  }
});

test('AR slides: ERP, CRM, WEB, MOBILE', async ({ page }) => {
  await page.goto('http://localhost:5173/?lang=ar', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  
  // Take screenshots of first 4 slides
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(500);
    const keyword = await page.evaluate(() => {
      return document.querySelector('.hhm-kw-text')?.textContent?.trim() || 'slide';
    });
    await page.screenshot({ path: `test-results/hero-ar-${keyword.toLowerCase()}.png` });
    console.log(`AR: ${keyword}`);
    
    // Next slide
    if (i < 3) {
      await page.evaluate(() => {
        document.querySelector('button[aria-label*="السابق"]')?.click();
      });
      await page.waitForTimeout(700);
    }
  }
});
