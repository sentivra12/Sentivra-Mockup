import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test('Debug horizontal scroll at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/about`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Find all elements that are wider than viewport
  const wideElements = await page.evaluate(() => {
    const viewportWidth = 390;
    const elements = [];
    
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > viewportWidth) {
        const styles = window.getComputedStyle(el);
        elements.push({
          tag: el.tagName,
          class: el.className?.slice(0, 100),
          width: Math.round(rect.width),
          overflow: styles.overflow,
          overflowX: styles.overflowX,
          position: styles.position,
          top: Math.round(rect.top)
        });
      }
    });
    
    return elements.sort((a, b) => b.width - a.width).slice(0, 10);
  });
  
  console.log('Wide elements (>390px):', JSON.stringify(wideElements, null, 2));
  
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  
  console.log(`Scroll width: ${scrollWidth}, Client width: ${clientWidth}`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/horizontal-scroll-debug.png', fullPage: false });
});
