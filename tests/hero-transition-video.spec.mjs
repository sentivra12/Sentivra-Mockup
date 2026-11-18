/**
 * Record video of slide transition and extract frames
 */
import { test } from '@playwright/test';

test('record slide transition and extract 8 frames 80ms apart', async ({ page }) => {
  // Start recording
  const context = page.context();
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Wait until just before slide change
  await page.waitForTimeout(3800);
  
  // Take 8 frames 80ms apart (640ms total)
  for (let i = 0; i < 8; i++) {
    await page.screenshot({ path: `test-results/hero-transition-frame-${i}.png` });
    await page.waitForTimeout(80);
  }
  
  console.log('\nExtracted 8 frames (80ms apart) from slide transition');
  console.log('Files: test-results/hero-transition-frame-0.png through frame-7.png');
});
