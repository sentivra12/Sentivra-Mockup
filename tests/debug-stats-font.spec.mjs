import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test('Debug stats font size', async ({ page }) => {
  await page.goto(`${BASE_URL}/about`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const label = page.locator('p').filter({ hasText: 'Projects Completed' }).first();
  
  // Get ALL computed styles
  const styles = await label.evaluate(el => {
    const computed = window.getComputedStyle(el);
    const parent = el.parentElement;
    const parentComputed = parent ? window.getComputedStyle(parent) : null;
    
    return {
      fontSize: computed.fontSize,
      computedFontSize: parseFloat(computed.fontSize),
      lineHeight: computed.lineHeight,
      transform: computed.transform,
      zoom: computed.zoom,
      parentFontSize: parentComputed ? parentComputed.fontSize : null,
      htmlFontSize: window.getComputedStyle(document.documentElement).fontSize,
      bodyFontSize: window.getComputedStyle(document.body).fontSize,
      inlineStyle: el.style.fontSize,
      classes: el.className
    };
  });
  
  console.log('Stats label styles:', JSON.stringify(styles, null, 2));
  
  // Check viewport meta
  const viewport = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    return meta ? meta.getAttribute('content') : null;
  });
  console.log('Viewport meta:', viewport);
});
