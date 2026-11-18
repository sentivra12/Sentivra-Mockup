/**
 * STEP 0: Capture current state and document deviations
 */
import { test } from '@playwright/test';

const BASE = 'http://localhost:4173';

test('STEP 0: Capture current 390x844 dark EN', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Set dark theme and EN
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'en');
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'test-results/CURRENT-390x844-dark-EN.png',
    fullPage: true,
  });
  
  console.log('✅ Captured: CURRENT-390x844-dark-EN.png');
});

test('STEP 0: Capture current 390x844 dark AR', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Set dark theme and AR
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'ar');
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'test-results/CURRENT-390x844-dark-AR.png',
    fullPage: true,
  });
  
  console.log('✅ Captured: CURRENT-390x844-dark-AR.png');
});
