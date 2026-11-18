/**
 * Prove particles are visible against dark background
 */
import { test } from '@playwright/test';

test('particles visible proof', async ({ page }) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('sentivra-motion-preference', 'full');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  
  await page.waitForTimeout(1000);
  
  // Take full screenshot
  await page.screenshot({ path: 'test-results/hero-particles-full.png' });
  
  // Take crop of upper area where particles are visible
  await page.screenshot({
    path: 'test-results/hero-particles-crop.png',
    clip: { x: 0, y: 80, width: 390, height: 300 }
  });
  
  console.log('\nParticle visibility proof screenshots saved');
  console.log('Full: test-results/hero-particles-full.png');
  console.log('Crop: test-results/hero-particles-crop.png');
});
