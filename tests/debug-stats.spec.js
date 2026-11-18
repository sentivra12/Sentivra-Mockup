import { test, expect } from '@playwright/test';

test('Debug stats section', async ({ page }) => {
  // Listen to console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  // Listen to page errors
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  await page.goto('http://localhost:4173');
  
  // Wait a bit
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-stats-full-page.png', fullPage: true });
  
  // Check if CompactStats component rendered anything
  const allSections = await page.locator('section').count();
  console.log(`Total sections on page: ${allSections}`);
  
  // List all sections
  const sections = page.locator('section');
  for (let i = 0; i < await sections.count(); i++) {
    const ariaLabel = await sections.nth(i).getAttribute('aria-label');
    console.log(`Section ${i}: aria-label="${ariaLabel}"`);
  }
  
  // Check if stats data was loaded
  const pageHTML = await page.content();
  if (pageHTML.includes('Happy Clients') || pageHTML.includes('Projects Completed')) {
    console.log('✓ Stats data found in HTML');
  } else {
    console.log('✗ No stats data found in HTML');
  }
});
