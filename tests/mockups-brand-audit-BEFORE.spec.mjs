/**
 * Mockups Brand Identity Audit - BEFORE Fixes
 * Captures current state: old slate-blue/navy/cyan colors, contrast issues
 * Tests: /mockups list, /mockups/detail, Admin > Mockups
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

// Test matrix: light/dark × EN/AR × 390/768/1440 × reducedMotion
const testConfigs = [
  // Light theme
  { theme: 'light', lang: 'en', width: 1440, motion: 'no-preference' },
  { theme: 'light', lang: 'ar', width: 1440, motion: 'no-preference' },
  { theme: 'light', lang: 'en', width: 390, motion: 'reduce' },
  
  // Dark theme
  { theme: 'dark', lang: 'en', width: 1440, motion: 'no-preference' },
  { theme: 'dark', lang: 'ar', width: 1440, motion: 'no-preference' },
  { theme: 'dark', lang: 'en', width: 768, motion: 'reduce' },
];

test.describe('Mockups Brand Audit - BEFORE', () => {
  
  test('🔍 Audit: Grep old palette values in source files', async () => {
    console.log('\n=== OLD PALETTE USAGE IN SOURCE FILES ===\n');
    
    const oldColors = {
      'Slate-blue gradient button': '#5C7E8F, #4A6B7C',
      'Navy hero background': '#0A1525, #1F3440',
      'Cyan accent (dark mode)': '#6FD3D8, cyan-400',
      'Old blue default': '#3b82f6',
      'Slate grays': 'slate-400, slate-600, slate-800, slate-900',
    };
    
    Object.entries(oldColors).forEach(([name, values]) => {
      console.log(`❌ ${name}: ${values}`);
    });
    
    console.log('\nFiles affected:');
    console.log('- src/pages/MockupsPageRound5.jsx (public list)');
    console.log('- src/pages/MockupDetailPage.jsx (public detail)');
    console.log('- src/features/mockups/AdminMockupsPage.jsx (admin)');
    console.log('- src/admin/pages/MockupCategoriesPage.jsx (admin categories)');
    console.log('- src/components/mockups/* (shared cards/components)');
  });
  
  test('📸 MOCKUPS LIST: Capture all variants BEFORE', async ({ page }) => {
    for (const config of testConfigs) {
      await page.setViewportSize({ width: config.width, height: 900 });
      await page.emulateMedia({ reducedMotion: config.motion });
      
      await page.goto(`${BASE_URL}/mockups?lang=${config.lang}`);
      
      if (config.theme === 'dark') {
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        });
        await page.reload();
      }
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: `tests/screenshots/mockups-list-BEFORE-${config.theme}-${config.lang}-${config.width}-${config.motion}.png`,
        fullPage: true,
      });
      
      console.log(`✓ List: ${config.theme}-${config.lang}-${config.width}-${config.motion}`);
    }
  });
  
  test('🔍 MOCKUPS LIST: Check old colors in computed styles', async ({ page }) => {
    await page.goto(`${BASE_URL}/mockups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== MOCKUPS LIST - OLD COLORS ===\n');
    
    // Check "View Details" button
    const viewDetailsBtn = page.locator('a, button').filter({ hasText: /View Details|عرض التفاصيل/i }).first();
    if (await viewDetailsBtn.count() > 0) {
      const btnStyles = await viewDetailsBtn.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          background: computed.background,
          backgroundImage: computed.backgroundImage,
          color: computed.color,
          borderColor: computed.borderColor,
        };
      });
      console.log('❌ "View Details" button:', JSON.stringify(btnStyles, null, 2));
    }
    
    // Check search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    if (await searchInput.count() > 0) {
      const searchStyles = await searchInput.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          borderColor: computed.borderColor,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });
      console.log('❌ Search input:', JSON.stringify(searchStyles, null, 2));
    }
    
    // Check category filter chips
    const chips = await page.locator('button').filter({ hasText: /All|Web|Mobile|Dashboard/i }).evaluateAll(elements => {
      return elements.slice(0, 3).map(el => {
        const computed = window.getComputedStyle(el);
        return {
          text: el.textContent?.trim(),
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
        };
      });
    });
    console.log('❌ Category chips:', JSON.stringify(chips, null, 2));
  });
  
  test('📸 MOCKUP DETAIL: Capture all variants BEFORE', async ({ page }) => {
    // First, get a mockup slug
    await page.goto(`${BASE_URL}/mockups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstMockupLink = page.locator('a[href*="/mockups/"]').first();
    const href = await firstMockupLink.getAttribute('href');
    const slug = href?.split('/mockups/')[1] || 'e-commerce-dashboard';
    
    console.log(`Using mockup slug: ${slug}`);
    
    for (const config of testConfigs.slice(0, 4)) { // Fewer for detail page
      await page.setViewportSize({ width: config.width, height: 900 });
      await page.emulateMedia({ reducedMotion: config.motion });
      
      await page.goto(`${BASE_URL}/mockups/${slug}?lang=${config.lang}`);
      
      if (config.theme === 'dark') {
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        });
        await page.reload();
      }
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: `tests/screenshots/mockup-detail-BEFORE-${config.theme}-${config.lang}-${config.width}.png`,
        fullPage: true,
      });
      
      console.log(`✓ Detail: ${config.theme}-${config.lang}-${config.width}`);
    }
  });
  
  test('🔍 MOCKUP DETAIL: Check navy hero and old buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/mockups`);
    await page.waitForLoadState('networkidle');
    const firstLink = page.locator('a[href*="/mockups/"]').first();
    const href = await firstLink.getAttribute('href');
    const slug = href?.split('/mockups/')[1] || 'e-commerce-dashboard';
    
    await page.goto(`${BASE_URL}/mockups/${slug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== MOCKUP DETAIL - OLD COLORS ===\n');
    
    // Check hero section background
    const hero = page.locator('section').first();
    const heroStyles = await hero.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        background: computed.background,
      };
    });
    console.log('❌ Hero background:', JSON.stringify(heroStyles, null, 2));
    
    // Check category badge
    const categoryBadge = page.locator('span, a').filter({ hasText: /Dashboard|Web|Mobile/i }).first();
    if (await categoryBadge.count() > 0) {
      const badgeStyles = await categoryBadge.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const style = el.getAttribute('style');
        return {
          inlineStyle: style,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
        };
      });
      console.log('❌ Category badge:', JSON.stringify(badgeStyles, null, 2));
    }
    
    // Check CTA buttons
    const ctaButtons = await page.locator('section a, section button').evaluateAll(elements => {
      return elements.slice(0, 5).map(el => {
        const computed = window.getComputedStyle(el);
        const text = el.textContent?.trim().substring(0, 30);
        return {
          text,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor,
        };
      }).filter(btn => btn.text && btn.text.length > 2);
    });
    console.log('❌ CTA buttons:', JSON.stringify(ctaButtons, null, 2));
  });
  
  test('🔍 CONTRAST CHECK: Measure text vs background ratios', async ({ page }) => {
    await page.goto(`${BASE_URL}/mockups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== CONTRAST MEASUREMENTS ===\n');
    
    // Helper to calculate contrast ratio (simplified)
    const getContrast = (color1, color2) => {
      // Parse rgb() strings
      const parseRGB = (str) => {
        const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return [255, 255, 255];
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      };
      
      const [r1, g1, b1] = parseRGB(color1);
      const [r2, g2, b2] = parseRGB(color2);
      
      const l1 = 0.2126 * (r1/255) + 0.7152 * (g1/255) + 0.0722 * (b1/255);
      const l2 = 0.2126 * (r2/255) + 0.7152 * (g2/255) + 0.0722 * (b2/255);
      
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      
      return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
    };
    
    // Check page title
    const title = page.locator('h1, h2').first();
    if (await title.count() > 0) {
      const titleContrast = await title.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentComputed = parent ? window.getComputedStyle(parent) : computed;
        return {
          color: computed.color,
          background: parentComputed.backgroundColor,
        };
      });
      const ratio = getContrast(titleContrast.color, titleContrast.background);
      console.log(`Page title: ${ratio}:1 (needs 4.5:1) - ${parseFloat(ratio) >= 4.5 ? '✅' : '❌'}`);
    }
    
    // Check button text
    const button = page.locator('a, button').filter({ hasText: /View|Details/i }).first();
    if (await button.count() > 0) {
      const btnContrast = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          background: computed.backgroundColor,
        };
      });
      const ratio = getContrast(btnContrast.color, btnContrast.background);
      console.log(`Button text: ${ratio}:1 (needs 4.5:1) - ${parseFloat(ratio) >= 4.5 ? '✅' : '❌'}`);
    }
  });
  
  test('🔍 CHECK: Console errors and failed requests', async ({ page }) => {
    const errors = [];
    const failedRequests = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('response', response => {
      if (!response.ok() && response.url().includes(BASE_URL)) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto(`${BASE_URL}/mockups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== CONSOLE & NETWORK ===\n');
    console.log(`Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Errors:', errors.slice(0, 5));
    }
    
    console.log(`Failed requests: ${failedRequests.length}`);
    if (failedRequests.length > 0) {
      console.log('Failed:', failedRequests.slice(0, 5));
    }
  });
});
