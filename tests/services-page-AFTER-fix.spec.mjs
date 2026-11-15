/**
 * Services Page - AFTER FIX Verification
 * Confirms new emerald brand identity applied correctly
 */

import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:5173';
const SERVICES_URL = `${BASE_URL}/services`;

test.describe('Services Page - AFTER FIX', () => {
  
  test('✅ OLD PALETTE: Zero slate/cyan/hardcoded hex colors', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const paletteCheck = await page.evaluate(() => {
      const results = {
        slateClasses: [],
        cyanClasses: [],
        oldHexTokens: []
      };
      
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(el => {
        const classes = el.className;
        if (typeof classes !== 'string') return;
        
        // Check for slate-*
        if (classes.match(/\b(bg|text|border)-slate-\d+/)) {
          results.slateClasses.push({
            tag: el.tagName,
            classes: classes.split(' ').filter(c => c.includes('slate')).join(' ')
          });
        }
        
        // Check for cyan-*
        if (classes.match(/\b(bg|text|border)-cyan-\d+/)) {
          results.cyanClasses.push({
            tag: el.tagName,
            classes: classes.split(' ').filter(c => c.includes('cyan')).join(' ')
          });
        }
        
        // Check for bg-[#...]
        if (classes.match(/bg-\[#[0-9a-fA-F]{3,6}\]/)) {
          results.oldHexTokens.push({
            tag: el.tagName,
            classes: classes.split(' ').filter(c => c.includes('bg-[')).join(' ')
          });
        }
      });
      
      return {
        slateCount: results.slateClasses.length,
        cyanCount: results.cyanClasses.length,
        hexCount: results.oldHexTokens.length
      };
    });
    
    console.log('\n🎨 OLD PALETTE CHECK (AFTER FIX):');
    console.log(`   slate-* classes: ${paletteCheck.slateCount} (expected: 0)`);
    console.log(`   cyan-* classes: ${paletteCheck.cyanCount} (expected: 0)`);
    console.log(`   bg-[#...] hardcoded: ${paletteCheck.hexCount} (expected: 0)`);
    
    expect(paletteCheck.slateCount).toBe(0);
    expect(paletteCheck.cyanCount).toBe(0);
    expect(paletteCheck.hexCount).toBe(0);
    
    writeFileSync('tests/audit-AFTER-palette.json', JSON.stringify(paletteCheck, null, 2));
  });

  test('✅ BRAND TOKENS: Using brand-accent, brand-primary, text-muted', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const brandCheck = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      let brandAccentCount = 0;
      let brandPrimaryCount = 0;
      let textMutedCount = 0;
      let borderCount = 0;
      let surfaceCount = 0;
      
      allElements.forEach(el => {
        const classes = el.className;
        if (typeof classes !== 'string') return;
        
        if (classes.includes('brand-accent')) brandAccentCount++;
        if (classes.includes('brand-primary')) brandPrimaryCount++;
        if (classes.includes('text-muted')) textMutedCount++;
        if (classes.includes('border-border')) borderCount++;
        if (classes.includes('surface-elevated') || classes.includes('bg-surface')) surfaceCount++;
      });
      
      return {
        brandAccentCount,
        brandPrimaryCount,
        textMutedCount,
        borderCount,
        surfaceCount,
        totalBrandTokens: brandAccentCount + brandPrimaryCount + textMutedCount + borderCount + surfaceCount
      };
    });
    
    console.log('\n✨ NEW BRAND TOKENS (AFTER FIX):');
    console.log(`   brand-accent: ${brandCheck.brandAccentCount}`);
    console.log(`   brand-primary: ${brandCheck.brandPrimaryCount}`);
    console.log(`   text-muted: ${brandCheck.textMutedCount}`);
    console.log(`   border tokens: ${brandCheck.borderCount}`);
    console.log(`   surface tokens: ${brandCheck.surfaceCount}`);
    console.log(`   TOTAL: ${brandCheck.totalBrandTokens}`);
    
    expect(brandCheck.totalBrandTokens).toBeGreaterThan(50);
    
    writeFileSync('tests/audit-AFTER-brand-tokens.json', JSON.stringify(brandCheck, null, 2));
  });

  test('✅ CONSOLE ERRORS: Maximum 1 warning (helmet only)', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`\n🚨 CONSOLE ERRORS (AFTER FIX): ${errors.length}`);
    errors.forEach(e => console.log(`   - ${e.substring(0, 100)}`));
    
    expect(errors.length).toBeLessThanOrEqual(1);
    
    writeFileSync('tests/audit-AFTER-console.json', JSON.stringify({ errors }, null, 2));
  });

  test('✅ SERVICE CARDS: Bento grid visible with features', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const cardsCheck = await page.evaluate(() => {
      const bentoGrid = document.querySelector('[class*="bento"], [class*="Bento"], .grid');
      const featureChips = document.querySelectorAll('.px-2.py-1, [class*="rounded-md"], [class*="badge"]');
      
      return {
        bentoGridExists: !!bentoGrid,
        featureChipsCount: featureChips.length,
        firstChips: Array.from(featureChips).slice(0, 8).map(c => c.textContent.trim()).filter(t => t.length > 2 && t.length < 30)
      };
    });
    
    console.log('\n🎯 SERVICE CARDS (AFTER FIX):');
    console.log(`   Bento grid: ${cardsCheck.bentoGridExists ? '✅ Visible' : '❌ Missing'}`);
    console.log(`   Feature chips: ${cardsCheck.featureChipsCount}`);
    console.log(`   Sample: ${cardsCheck.firstChips.slice(0, 4).join(', ')}`);
    
    expect(cardsCheck.bentoGridExists).toBe(true);
    expect(cardsCheck.featureChipsCount).toBeGreaterThan(10);
    
    writeFileSync('tests/audit-AFTER-cards.json', JSON.stringify(cardsCheck, null, 2));
  });

  test('✅ ALL SECTIONS: Hero, Grid, How We Work, Why Us, FAQ, CTA', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const sectionsCheck = await page.evaluate(() => {
      const hasHero = !!document.querySelector('h1');
      const hasBentoGrid = document.body.textContent.includes('Responsive Design') || document.body.textContent.includes('SEO Optimized');
      const hasTimeline = document.body.textContent.includes('Understand') || document.body.textContent.includes('نفهم');
      const hasWhyUs = document.body.textContent.includes('Innovation') || document.body.textContent.includes('الابتكار');
      const hasFAQ = document.body.textContent.includes('questions') || document.body.textContent.includes('أسئلة');
      const hasCTA = document.body.textContent.includes('Ready to') || document.body.textContent.includes('Contact') || document.querySelectorAll('section').length >= 5;
      
      return {
        hasHero,
        hasBentoGrid,
        hasTimeline,
        hasWhyUs,
        hasFAQ,
        hasCTA,
        allPresent: hasHero && hasBentoGrid && hasTimeline && hasWhyUs && hasFAQ && hasCTA
      };
    });
    
    console.log('\n📋 SECTIONS PRESENT (AFTER FIX):');
    console.log(`   Hero: ${sectionsCheck.hasHero ? '✅' : '❌'}`);
    console.log(`   Bento Grid: ${sectionsCheck.hasBentoGrid ? '✅' : '❌'}`);
    console.log(`   How We Work: ${sectionsCheck.hasTimeline ? '✅' : '❌'}`);
    console.log(`   Why Choose Us: ${sectionsCheck.hasWhyUs ? '✅' : '❌'}`);
    console.log(`   FAQ: ${sectionsCheck.hasFAQ ? '✅' : '❌'}`);
    console.log(`   Final CTA: ${sectionsCheck.hasCTA ? '✅' : '❌'}`);
    
    expect(sectionsCheck.allPresent).toBe(true);
    
    writeFileSync('tests/audit-AFTER-sections.json', JSON.stringify(sectionsCheck, null, 2));
  });

  test('✅ SCREENSHOTS: light/dark × EN/AR at 1440px', async ({ browser }) => {
    const screenshots = [];
    
    for (const theme of ['light', 'dark']) {
      for (const lang of ['en', 'ar']) {
        const context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          colorScheme: theme
        });
        const page = await context.newPage();
        
        await page.goto(BASE_URL);
        await page.evaluate((l) => {
          localStorage.setItem('language', l);
        }, lang);
        
        await page.goto(SERVICES_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const filename = `tests/screenshots/services-AFTER-${theme}-${lang}-1440.png`;
        await page.screenshot({ 
          path: filename,
          fullPage: true
        });
        
        screenshots.push({ theme, lang, filename });
        console.log(`✓ Screenshot: ${theme}-${lang}`);
        
        await context.close();
      }
    }
    
    console.log(`\n📸 AFTER FIX: ${screenshots.length} screenshots captured`);
    
    writeFileSync('tests/audit-AFTER-screenshots.json', JSON.stringify(screenshots, null, 2));
  });
});
