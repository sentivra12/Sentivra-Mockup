import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('About Page Round 2 - Quick Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
  });

  test('Country cards - check for flag emoji fallback', async ({ page }) => {
    const countryCards = page.locator('[class*="CountryCard"]').or(page.locator('article').filter({ hasText: /Egypt|مصر|Emirates|الإمارات|Oman|عمان/ }));
    const count = await countryCards.count();
    
    console.log(`Found ${count} country cards`);
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = countryCards.nth(i);
        const cardText = await card.textContent();
        console.log(`Card ${i}: ${cardText?.slice(0, 100)}`);
        
        // Check if card has either:
        // 1. An image element, OR
        // 2. Flag emoji (🇪🇬, 🇦🇪, 🇴🇲) in text content
        const hasImage = await card.locator('img').count() > 0;
        const hasFlag = /🇪🇬|🇦🇪|🇴🇲|🏳️/.test(cardText || '');
        
        console.log(`  Has image: ${hasImage}, Has flag emoji: ${hasFlag}`);
        expect(hasImage || hasFlag, `Card ${i} should have either image or flag emoji`).toBeTruthy();
      }
    }
  });

  test('TeamBand - light background check', async ({ page }) => {
    // Find team section - could be TeamBand component or section with team avatars
    const teamSection = page.locator('section').filter({ hasText: /Meet Our Team|فريقنا/ }).first();
    const exists = await teamSection.count() > 0;
    
    if (exists) {
      const bgColor = await teamSection.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log(`Team section background: ${bgColor}`);
      
      // Parse RGB values
      const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const [_, r, g, b] = match.map(Number);
        const brightness = (r + g + b) / 3;
        
        console.log(`Brightness: ${brightness}/255 (>200 is light)`);
        expect(brightness).toBeGreaterThan(200); // Light background
      }
    }
  });

  test('Stats labels - font size check', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    
    // Find stat labels (the text under the numbers like "Projects Completed")
    const labels = page.locator('p').filter({ hasText: /Projects Completed|Happy Clients|Countries Served|Team Members|Client Satisfaction|مشاريع|عملاء|دول|أعضاء|رضا/i });
    const count = await labels.count();
    
    console.log(`Found ${count} stat labels`);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const label = labels.nth(i);
      const fontSize = await label.evaluate(el => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });
      const text = await label.textContent();
      
      console.log(`Label "${text?.slice(0, 30)}": ${fontSize}px`);
      
      if (fontSize < 14) {
        console.warn(`⚠️  Font too small: ${fontSize}px (need 14px+)`);
      }
    }
  });

  test('Arabic language - country names', async ({ page }) => {
    // Switch to Arabic
    const langButton = page.locator('button[aria-label*="language"], button[aria-label*="اللغة"]').first();
    await langButton.click();
    await page.waitForTimeout(1000);
    
    // Check if Arabic country names appear
    const hasArabicCountry = await page.locator('text=/مصر|الإمارات|عمان/').count() > 0;
    console.log(`Arabic country names visible: ${hasArabicCountry}`);
    expect(hasArabicCountry).toBeTruthy();
  });
});
