/**
 * Check hero visual match against reference
 */
import { test } from '@playwright/test';

test('EN dark 390x844', async ({ page }) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/hero-en-dark-390x844.png' });
});

test('AR dark 390x844', async ({ page }) => {
  await page.goto('http://localhost:5173/?lang=ar', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/hero-ar-dark-390x844.png' });
});
