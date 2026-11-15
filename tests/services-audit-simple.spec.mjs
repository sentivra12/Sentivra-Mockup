/**
 * Simplified Services Page Audit - Single screenshots at a time
 */

import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:5173';
const SERVICES_URL = `${BASE_URL}/services`;

test.describe('Services Audit - Simple', () => {
  
  test('Screenshot: light-en-1440-no-preference', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('language', 'en');
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/services-light-en-1440-full.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot captured: light-en-1440-full');
  });
  
  test('Screenshot: dark-en-1440-no-preference', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('language', 'en');
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/services-dark-en-1440-full.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot captured: dark-en-1440-full');
  });
  
  test('Screenshot: light-ar-1440-no-preference', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('language', 'ar');
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/services-light-ar-1440-full.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot captured: light-ar-1440-full');
  });
  
  test('Screenshot: dark-ar-1440-no-preference', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('language', 'ar');
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/services-dark-ar-1440-full.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot captured: dark-ar-1440-full');
  });

  test('Check: Palette and classes in DOM', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const paletteCheck = await page.evaluate(() => {
      const results = {
        hexColors: [],
        slateClasses: [],
        cyanClasses: [],
        oldTokens: []
      };
      
      // Find all elements
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(el => {
        const classes = el.className;
        if (typeof classes !== 'string') return;
        
        // Check for slate-*
        if (classes.match(/\b(bg|text|border)-slate-\d+/)) {
          results.slateClasses.push({
            tag: el.tagName,
            classes: classes.split(' ').filter(c => c.includes('slate')).join(' '),
            text: el.textContent.substring(0, 40).trim()
          });
        }
        
        // Check for cyan-*
        if (classes.match(/\b(bg|text|border)-cyan-\d+/)) {
          results.cyanClasses.push({
            tag: el.tagName,
            classes: classes.split(' ').filter(c => c.includes('cyan')).join(' '),
            text: el.textContent.substring(0, 40).trim()
          });
        }
        
        // Check for hardcoded hex in style attribute
        const style = el.getAttribute('style');
        if (style && style.match(/#[0-9a-fA-F]{3,6}/)) {
          results.hexColors.push({
            tag: el.tagName,
            style: style.substring(0, 100)
          });
        }
        
        // Check for bg-[#...]
        if (classes.match(/bg-\[#[0-9a-fA-F]{3,6}\]/)) {
          results.oldTokens.push({
            tag: el.tagName,
            classes: classes.split(' ').filter(c => c.includes('bg-[')).join(' '),
            text: el.textContent.substring(0, 40).trim()
          });
        }
      });
      
      return {
        hexCount: results.hexColors.length,
        slateCount: results.slateClasses.length,
        cyanCount: results.cyanClasses.length,
        oldTokensCount: results.oldTokens.length,
        hexSample: results.hexColors.slice(0, 5),
        slateSample: results.slateClasses.slice(0, 10),
        cyanSample: results.cyanClasses.slice(0, 10),
        oldTokensSample: results.oldTokens.slice(0, 5)
      };
    });
    
    console.log('\n🎨 OLD PALETTE CHECK:');
    console.log(`   Hardcoded hex in styles: ${paletteCheck.hexCount}`);
    console.log(`   slate-* classes: ${paletteCheck.slateCount}`);
    console.log(`   cyan-* classes: ${paletteCheck.cyanCount}`);
    console.log(`   bg-[#...] tokens: ${paletteCheck.oldTokensCount}`);
    
    if (paletteCheck.slateSample.length > 0) {
      console.log('\n   SLATE CLASSES FOUND:');
      paletteCheck.slateSample.forEach(s => {
        console.log(`   - ${s.tag}: ${s.classes} ("${s.text}")`);
      });
    }
    
    if (paletteCheck.cyanSample.length > 0) {
      console.log('\n   CYAN CLASSES FOUND:');
      paletteCheck.cyanSample.forEach(c => {
        console.log(`   - ${c.tag}: ${c.classes} ("${c.text}")`);
      });
    }
    
    if (paletteCheck.oldTokensSample.length > 0) {
      console.log('\n   HARDCODED HEX bg-[#...] FOUND:');
      paletteCheck.oldTokensSample.forEach(t => {
        console.log(`   - ${t.tag}: ${t.classes} ("${t.text}")`);
      });
    }
    
    writeFileSync('tests/audit-palette-DOM.json', JSON.stringify(paletteCheck, null, 2));
  });

  test('Check: Service cards and features', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const cardsCheck = await page.evaluate(() => {
      // Check bento grid specifically
      const bentoGrid = document.querySelector('[class*="bento"], [class*="Bento"], .grid');
      
      const featureChips = document.querySelectorAll('.px-2.py-1, [class*="rounded-md"], [class*="badge"]');
      const firstChips = Array.from(featureChips).slice(0, 12).map(c => c.textContent.trim());
      
      // Count service mini visuals/icons
      const visuals = document.querySelectorAll('svg, img, canvas, [class*="visual"], [class*="icon"]');
      
      // Check for "Why Choose" section
      const whyChoose = document.querySelector('[class*="WhyUs"], [class*="why-choose"]');
      const whyChooseNumbers = whyChoose ? whyChoose.querySelectorAll('[class*="number"], [class*="badge"]') : [];
      
      return {
        bentoGridExists: !!bentoGrid,
        featureChipsCount: featureChips.length,
        firstChips,
        visualsCount: visuals.length,
        whyChooseExists: !!whyChoose,
        whyChooseNumbersCount: whyChooseNumbers.length
      };
    });
    
    console.log('\n🎯 SERVICE CARDS CHECK:');
    console.log(`   Bento grid exists: ${cardsCheck.bentoGridExists ? '✅' : '❌'}`);
    console.log(`   Feature chips: ${cardsCheck.featureChipsCount}`);
    console.log(`   Service visuals: ${cardsCheck.visualsCount}`);
    console.log(`   Why Choose section: ${cardsCheck.whyChooseExists ? '✅' : '❌'}`);
    console.log(`   Why Choose numbers: ${cardsCheck.whyChooseNumbersCount}`);
    
    console.log('\n   Sample feature chips:');
    cardsCheck.firstChips.forEach((c, i) => console.log(`   ${i + 1}. ${c}`));
    
    writeFileSync('tests/audit-cards.json', JSON.stringify(cardsCheck, null, 2));
  });

  test('Check: Console errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    console.log(`\n🚨 CONSOLE ERRORS: ${errors.length}`);
    errors.forEach(e => console.log(`   - ${e}`));
    
    writeFileSync('tests/audit-console.json', JSON.stringify({ errors }, null, 2));
  });
});
