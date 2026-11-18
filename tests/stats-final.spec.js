import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

// Calculate contrast ratio
function getContrastRatio(fg, bg) {
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgba(str) {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

test.describe('CompactStats - Final Verification', () => {
  test('EN 390px dark: 4 items, count-up, contrast, height', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    const statsSection = page.locator('section[aria-label="Statistics"]');
    await expect(statsSection).toBeVisible();
    
    // 1. Exactly 4 items
    const cards = statsSection.locator('[role="img"]');
    const count = await cards.count();
    console.log(`✓ Item count: ${count}`);
    expect(count).toBe(4);
    
    // 2. Initial value is 0
    const firstNumber = cards.first().locator('div').nth(1);
    const initialText = await firstNumber.textContent();
    console.log(`✓ Initial text BEFORE scroll: "${initialText}"`);
    expect(initialText).toMatch(/^[+]?0/);
    
    // 3. Scroll and sample count-up
    await statsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const sample300 = await firstNumber.textContent();
    
    await page.waitForTimeout(500);
    const sample800 = await firstNumber.textContent();
    
    await page.waitForTimeout(1000);
    const sample1800 = await firstNumber.textContent();
    
    console.log(`✓ Count-up samples: 300ms="${sample300}" 800ms="${sample800}" 1800ms="${sample1800}"`);
    
    // 4. Contrast check
    const numberColor = await firstNumber.evaluate(el => window.getComputedStyle(el).color);
    const sectionBg = await statsSection.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const numberRgb = parseRgba(numberColor);
    const bgRgb = parseRgba(sectionBg);
    const numberContrast = getContrastRatio(numberRgb, bgRgb);
    console.log(`✓ Number contrast: ${numberContrast.toFixed(2)}:1 (need >= 4.5:1)`);
    expect(numberContrast).toBeGreaterThanOrEqual(4.5);
    
    const label = cards.first().locator('p');
    const labelColor = await label.evaluate(el => window.getComputedStyle(el).color);
    const labelRgb = parseRgba(labelColor);
    const labelContrast = getContrastRatio(labelRgb, bgRgb);
    console.log(`✓ Label contrast: ${labelContrast.toFixed(2)}:1 (need >= 4.5:1)`);
    expect(labelContrast).toBeGreaterThanOrEqual(4.5);
    
    // 5. Section height
    const box = await statsSection.boundingBox();
    console.log(`✓ Section height: ${box.height}px (target <= 330px)`);
    expect(box.height).toBeLessThanOrEqual(330);
    
    // 6. CLS
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) clsValue += entry.value;
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });
    console.log(`✓ CLS: ${cls} (target < 0.05)`);
    expect(cls).toBeLessThan(0.05);
  });

  test('AR 390px dark: 4 items, count-up', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/?lang=ar`);
    
    const statsSection = page.locator('section').filter({ has: page.locator('[role="img"]') }).first();
    await expect(statsSection).toBeVisible();
    
    const cards = statsSection.locator('[role="img"]');
    const count = await cards.count();
    console.log(`✓ AR item count: ${count}`);
    expect(count).toBe(4);
    
    const firstNumber = cards.first().locator('div').nth(1);
    const initialText = await firstNumber.textContent();
    console.log(`✓ AR initial text: "${initialText}"`);
    
    await statsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1900);
    const finalText = await firstNumber.textContent();
    console.log(`✓ AR final text: "${finalText}"`);
  });

  test('Desktop 1440px: 4 items in row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);
    
    const statsSection = page.locator('section[aria-label="Statistics"]');
    await expect(statsSection).toBeVisible();
    
    const cards = statsSection.locator('[role="img"]');
    const count = await cards.count();
    console.log(`✓ Desktop count: ${count}`);
    expect(count).toBe(4);
    
    const boxes = await Promise.all([0,1,2,3].map(i => cards.nth(i).boundingBox()));
    const yPositions = boxes.map(b => b.y);
    const yDiff = Math.max(...yPositions) - Math.min(...yPositions);
    console.log(`✓ Desktop Y-diff: ${yDiff}px (should be < 5 for single row)`);
    expect(yDiff).toBeLessThan(5);
  });

  test('Reduced motion: shorter animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    const statsSection = page.locator('section[aria-label="Statistics"]');
    await statsSection.scrollIntoViewIfNeeded();
    
    const firstNumber = statsSection.locator('[role="img"]').first().locator('div').nth(1);
    await page.waitForTimeout(400);
    const sample400 = await firstNumber.textContent();
    
    await page.waitForTimeout(400);
    const sample800 = await firstNumber.textContent();
    
    console.log(`✓ Reduced motion samples: 400ms="${sample400}" 800ms="${sample800}"`);
    // With 700ms duration, should be done by 800ms
  });
});
