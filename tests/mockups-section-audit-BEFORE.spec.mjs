/**
 * BEFORE Test: Mockups /mockups page - section below grid audit
 * 
 * Purpose: Document OLD state (cyan/blue palette, invisible FAQ text, etc.)
 * 
 * This test captures screenshots and analyzes the "How It Works", "FAQ",
 * and "Still have questions?" sections BEFORE fixing them.
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 }
];

const themes = ['light', 'dark'];
const languages = ['en', 'ar'];

test.describe('BEFORE: Mockups Sections Audit', () => {
  for (const vp of viewports) {
    for (const theme of themes) {
      for (const lang of languages) {
        test(`${vp.name}-${theme}-${lang}: OLD palette and invisible FAQ text`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          
          // Navigate and wait for content
          await page.goto(`http://localhost:5173/mockups?lang=${lang}`);
          await page.waitForLoadState('networkidle');
          
          // Set theme
          const isDark = theme === 'dark';
          if (isDark) {
            await page.evaluate(() => {
              localStorage.setItem('theme', 'dark');
              document.documentElement.classList.add('dark');
            });
            await page.reload();
            await page.waitForLoadState('networkidle');
          }
          
          // Wait for lazy components to load
          await page.waitForTimeout(2000);
          
          // Scroll to "How It Works" section
          const howItWorks = page.locator('text=/How It Works|كيف نعمل/i').first();
          await howItWorks.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          // Screenshot: How It Works section
          await page.screenshot({
            path: path.join(__dirname, `screenshots/BEFORE-how-it-works-${vp.name}-${theme}-${lang}.png`),
            fullPage: false
          });
          
          // Scroll to FAQ section
          const faq = page.locator('text=/FAQ|الأسئلة الشائعة/i').first();
          await faq.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          // Screenshot: FAQ section
          await page.screenshot({
            path: path.join(__dirname, `screenshots/BEFORE-faq-${vp.name}-${theme}-${lang}.png`),
            fullPage: false
          });
          
          // Collect OLD color usage evidence
          const oldColors = await page.evaluate(() => {
            const results = [];
            const elements = document.querySelectorAll('*');
            
            for (const el of elements) {
              const computed = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor'];
              
              for (const prop of props) {
                const value = computed[prop];
                // Check for cyan/blue/slate RGB values
                if (value && (
                  value.includes('rgb(6, 182, 212)') ||  // cyan-400
                  value.includes('rgb(111, 211, 216)') || // old #6FD3D8
                  value.includes('rgb(92, 126, 143)') ||  // old #5C7E8F
                  value.includes('rgb(31, 52, 64)') ||    // old #1F3440
                  value.includes('rgb(148, 163, 184)') || // slate-400
                  value.includes('rgb(100, 116, 139)')    // slate-500
                )) {
                  results.push({
                    tag: el.tagName,
                    text: el.textContent?.substring(0, 50),
                    prop,
                    value
                  });
                }
              }
            }
            
            return results.slice(0, 20); // Limit to first 20
          });
          
          // Check FAQ question visibility
          const faqQuestions = await page.locator('[id^="faq-button-"]').all();
          const visibilityResults = [];
          
          for (let i = 0; i < Math.min(faqQuestions.length, 5); i++) {
            const btn = faqQuestions[i];
            const text = await btn.textContent();
            const isVisible = await btn.isVisible();
            const bbox = await btn.boundingBox();
            
            // Check computed color of question text
            const questionSpan = btn.locator('span.font-semibold').first();
            const color = await questionSpan.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                display: computed.display,
                opacity: computed.opacity,
                visibility: computed.visibility
              };
            });
            
            visibilityResults.push({
              index: i + 1,
              text: text?.substring(0, 50),
              isVisible,
              hasHeight: bbox?.height > 10,
              computed: color
            });
          }
          
          // Log evidence
          console.log(`\n=== BEFORE Evidence: ${vp.name}-${theme}-${lang} ===`);
          console.log('\n1. OLD COLORS FOUND:');
          oldColors.forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.tag} - ${item.prop}: ${item.value}`);
            if (item.text) console.log(`     Text: "${item.text}"`);
          });
          
          console.log('\n2. FAQ QUESTION VISIBILITY:');
          visibilityResults.forEach(item => {
            console.log(`  Q${item.index}: visible=${item.isVisible}, height=${item.hasHeight}`);
            console.log(`     Text: "${item.text}"`);
            console.log(`     Color: ${item.computed.color}`);
          });
          
          // ASSERTIONS: These should PASS for BEFORE state (documenting the problem)
          
          // OLD colors should be present
          expect(oldColors.length).toBeGreaterThan(0);
          
          // FAQ questions should have visibility issues OR be using old colors
          // (This test documents the problem, not the fix)
        });
      }
    }
  }
});
