import { test, expect } from '@playwright/test';

test('Debug: find all logos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Find all elements with logo in aria-label
  const logos = await page.locator('[aria-label*="logo"], [aria-label*="Logo"]').all();
  
  console.log(`\nTotal logos found: ${logos.length}\n`);
  
  for (let i = 0; i < logos.length; i++) {
    const logo = logos[i];
    const tagName = await logo.evaluate(el => el.tagName);
    const ariaLabel = await logo.getAttribute('aria-label');
    const classList = await logo.evaluate(el => el.className);
    const parent = await logo.evaluate(el => el.parentElement?.tagName);
    const bbox = await logo.boundingBox();
    
    console.log(`Logo #${i + 1}:`);
    console.log(`  Tag: ${tagName}`);
    console.log(`  Aria-label: ${ariaLabel}`);
    console.log(`  Classes: ${classList}`);
    console.log(`  Parent: ${parent}`);
    console.log(`  BBox: ${bbox ? `x=${bbox.x}, y=${bbox.y}, w=${bbox.width}, h=${bbox.height}` : 'null'}`);
    console.log('');
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-logo.png', fullPage: true });
});
