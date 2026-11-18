import { test } from '@playwright/test';

test('Debug Arabic stats', async ({ page }) => {
  await page.goto('http://localhost:4173/ar');
  
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/ar-stats-full.png', fullPage: true });
  
  // List all sections
  const sections = page.locator('section');
  const count = await sections.count();
  console.log(`Total sections: ${count}`);
  
  for (let i = 0; i < count; i++) {
    const ariaLabel = await sections.nth(i).getAttribute('aria-label');
    const text = await sections.nth(i).textContent();
    console.log(`Section ${i}: aria-label="${ariaLabel}", text preview: ${text?.substring(0, 100)}`);
  }
});
