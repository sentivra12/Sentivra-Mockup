/**
 * Validate hero slide content and typography
 */
import { test, expect } from '@playwright/test';

const SLIDES = ['ERP', 'CRM', 'WEB', 'MOBILE'];

test.describe('Hero content validation', () => {
  for (const keyword of SLIDES) {
    test(`EN ${keyword}: headline unique, italic serif, no letter-spacing on AR`, async ({ page }) => {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 390, height: 844 });
      
      // Navigate to this slide
      let found = false;
      for (let attempt = 0; attempt < 6 && !found; attempt++) {
        const currentKeyword = await page.evaluate(() => {
          return document.querySelector('.hhm-kw-text')?.textContent?.trim();
        });
        if (currentKeyword === keyword) {
          found = true;
          break;
        }
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          document.querySelector('button[aria-label*="Next"]')?.click();
        });
        await page.waitForTimeout(200);
      }
      
      if (!found) {
        console.log(`${keyword} slide not found in EN`);
        return;
      }
      
      await page.waitForTimeout(500);
      
      const validation = await page.evaluate((kw) => {
        const keywordEl = document.querySelector('.hhm-kw-text');
        const headlineEl = document.querySelector('.hhm-headline');
        const descEl = document.querySelector('.hhm-desc');
        
        const keyword = keywordEl?.textContent?.trim() || '';
        const headline = headlineEl?.textContent?.trim() || '';
        const desc = descEl?.textContent?.trim() || '';
        
        const headlineStyle = headlineEl ? getComputedStyle(headlineEl) : null;
        const descStyle = descEl ? getComputedStyle(descEl) : null;
        
        return {
          keyword,
          headline,
          description: desc,
          headlineExists: !!headlineEl,
          headlineNotEqualsKeyword: headline.toLowerCase() !== keyword.toLowerCase(),
          headlineNotStartsWithKeyword: !headline.toLowerCase().startsWith(keyword.toLowerCase() + ' '),
          headlineFontStyle: headlineStyle?.fontStyle || 'n/a',
          headlineFontFamily: headlineStyle?.fontFamily || 'n/a',
          headlineLetterSpacing: headlineStyle?.letterSpacing || 'n/a',
          descLetterSpacing: descStyle?.letterSpacing || 'n/a',
          noLatinInHeadline: !/[A-Za-z]/.test(headline),
          noLatinInDesc: !/[A-Za-z]/.test(desc),
        };
      }, keyword);
      
      console.log(`EN ${keyword}:`, validation);
      
      // Assertions
      if (validation.headlineExists) {
        expect(validation.headlineNotEqualsKeyword).toBe(true);
        expect(validation.headlineNotStartsWithKeyword).toBe(true);
        expect(validation.headlineFontStyle).toBe('italic');
        expect(validation.headlineFontFamily).toContain('Cormorant');
      }
      
      await page.screenshot({ path: `test-results/hero-en-${keyword.toLowerCase()}.png` });
    });

    test(`AR ${keyword}: headline unique, Aref Ruqaa, normal letter-spacing`, async ({ page }) => {
      await page.goto('http://localhost:5173/?lang=ar', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 390, height: 844 });
      
      // Navigate to this slide
      let found = false;
      for (let attempt = 0; attempt < 6 && !found; attempt++) {
        const currentKeyword = await page.evaluate(() => {
          return document.querySelector('.hhm-kw-text')?.textContent?.trim();
        });
        if (currentKeyword === keyword) {
          found = true;
          break;
        }
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          document.querySelector('button[aria-label*="السابق"]')?.click();
        });
        await page.waitForTimeout(200);
      }
      
      if (!found) {
        console.log(`${keyword} slide not found in AR`);
        return;
      }
      
      await page.waitForTimeout(500);
      
      const validation = await page.evaluate((kw) => {
        const keywordEl = document.querySelector('.hhm-kw-text');
        const headlineEl = document.querySelector('.hhm-headline');
        const descEl = document.querySelector('.hhm-desc');
        
        const keyword = keywordEl?.textContent?.trim() || '';
        const headline = headlineEl?.textContent?.trim() || '';
        const desc = descEl?.textContent?.trim() || '';
        
        const headlineStyle = headlineEl ? getComputedStyle(headlineEl) : null;
        const descStyle = descEl ? getComputedStyle(descEl) : null;
        
        return {
          keyword,
          headline,
          description: desc,
          headlineExists: !!headlineEl,
          headlineNotEqualsKeyword: headline.toLowerCase() !== keyword.toLowerCase(),
          headlineNotStartsWithKeyword: !headline.toLowerCase().startsWith(keyword.toLowerCase() + ' '),
          headlineFontFamily: headlineStyle?.fontFamily || 'n/a',
          headlineLetterSpacing: headlineStyle?.letterSpacing || 'n/a',
          descLetterSpacing: descStyle?.letterSpacing || 'n/a',
          noLatinInHeadline: !/[A-Za-z]/.test(headline),
          noLatinInDesc: !/[A-Za-z]/.test(desc),
        };
      }, keyword);
      
      console.log(`AR ${keyword}:`, validation);
      
      // Assertions
      if (validation.headlineExists) {
        expect(validation.headlineNotEqualsKeyword).toBe(true);
        expect(validation.headlineNotStartsWithKeyword).toBe(true);
        expect(validation.headlineFontFamily).toContain('Aref');
        expect(validation.headlineLetterSpacing).toBe('normal');
        expect(validation.descLetterSpacing).toBe('normal');
        expect(validation.noLatinInHeadline).toBe(true);
        expect(validation.noLatinInDesc).toBe(true);
      }
      
      await page.screenshot({ path: `test-results/hero-ar-${keyword.toLowerCase()}.png` });
    });
  }
});
