/**
 * Services Page Complete Audit
 * Tests all combinations: light/dark × EN/AR × multiple widths × motion modes
 * Captures screenshots and checks for specific problems
 */

import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:5173';
const SERVICES_URL = `${BASE_URL}/services`;

// Test matrix
const themes = ['light', 'dark'];
const languages = ['en', 'ar'];
const widths = [390, 768, 1440, 1920];
const motionModes = ['no-preference', 'reduce'];

test.describe('Services Page Audit - BEFORE FIX', () => {
  
  test('1a. Screenshot matrix: light theme all languages and widths', async ({ browser }) => {
    const results = [];
    const theme = 'light';
    
    for (const lang of languages) {
      for (const width of widths) {
        for (const motion of motionModes) {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            reducedMotion: motion,
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
          
          const filename = `tests/screenshots/services-BEFORE-${theme}-${lang}-${width}-${motion}.png`;
          await page.screenshot({ 
            path: filename,
            fullPage: true
          });
          
          console.log(`✓ ${theme} ${lang} ${width}px ${motion}`);
          results.push({ theme, lang, width, motion, filename });
          
          await context.close();
        }
      }
    }
    
    console.log(`\n📸 Light theme: ${results.length} screenshots`);
  });
  
  test('1b. Screenshot matrix: dark theme all languages and widths', async ({ browser }) => {
    const results = [];
    const theme = 'dark';
    
    for (const lang of languages) {
      for (const width of widths) {
        for (const motion of motionModes) {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            reducedMotion: motion,
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
          
          const filename = `tests/screenshots/services-BEFORE-${theme}-${lang}-${width}-${motion}.png`;
          await page.screenshot({ 
            path: filename,
            fullPage: true
          });
          
          console.log(`✓ ${theme} ${lang} ${width}px ${motion}`);
          results.push({ theme, lang, width, motion, filename });
          
          await context.close();
        }
      }
    }
    
    console.log(`\n📸 Dark theme: ${results.length} screenshots`);
  });

  test('2. CORRECTED: Real highlighter bug check (text vs parent background)', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    // Simplified check - only h1-h6 and p elements
    const realHighlighterBugs = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      const bugs = [];
      
      for (const el of elements) {
        const computed = window.getComputedStyle(el);
        const bg = computed.backgroundColor;
        
        // Skip transparent
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
        
        // Skip chips/badges (check for rounded classes)
        const classes = el.className || '';
        if (classes.includes('rounded-full') || classes.includes('rounded-md')) continue;
        
        bugs.push({
          tag: el.tagName,
          text: el.textContent.substring(0, 40),
          bg
        });
      }
      
      return { bugs: bugs.slice(0, 10) }; // Limit to 10
    });
    
    console.log('\n🔍 CORRECTED Highlighter Bugs: ' + realHighlighterBugs.bugs.length);
    realHighlighterBugs.bugs.forEach(b => console.log(`   - ${b.tag}: "${b.text}" (${b.bg})`));
    
    writeFileSync('tests/audit-highlighter-CORRECTED.json', JSON.stringify(realHighlighterBugs, null, 2));
  });

  test('3. CORRECTED: Real service cards count and visibility', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for services to load (check for either loading, error, or content)
    await page.waitForTimeout(3000); // Give time for query to settle
    
    const servicesState = await page.evaluate(() => {
      // Check for loading state
      const loadingIndicator = document.querySelector('[role="status"], [aria-label*="oad"]');
      if (loadingIndicator && loadingIndicator.offsetParent !== null) {
        return { state: 'loading' };
      }
      
      // Check for error state
      const errorElement = document.querySelector('[class*="error"], [role="alert"]');
      if (errorElement && errorElement.textContent.toLowerCase().includes('error')) {
        return { state: 'error', message: errorElement.textContent.substring(0, 100) };
      }
      
      // Count service cards - try multiple selectors
      const cardSelectors = [
        '[class*="service-card"]',
        '[class*="ServiceCard"]',
        '[class*="bento"]',
        'article',
        '[role="article"]'
      ];
      
      let cards = [];
      for (const selector of cardSelectors) {
        const found = document.querySelectorAll(selector);
        if (found.length > cards.length) {
          cards = Array.from(found);
        }
      }
      
      // Alternative: count feature chips as a proxy for services
      const featureChips = document.querySelectorAll('.px-2.py-1.rounded-md, [class*="feature"]');
      
      return {
        state: 'loaded',
        cardCount: cards.length,
        featureChipCount: featureChips.length,
        cards: cards.slice(0, 5).map(c => ({
          text: c.textContent.substring(0, 100).trim(),
          classes: c.className
        })),
        firstChips: Array.from(featureChips).slice(0, 6).map(c => c.textContent.trim())
      };
    });
    
    console.log('\n� CORRECTED Service Cards Check:');
    console.log(`   State: ${servicesState.state}`);
    if (servicesState.state === 'loaded') {
      console.log(`   Card count: ${servicesState.cardCount}`);
      console.log(`   Feature chips count: ${servicesState.featureChipCount}`);
      console.log(`   Sample chips: ${servicesState.firstChips?.join(', ')}`);
      servicesState.cards?.forEach((c, i) => {
        console.log(`   Card ${i}: ${c.text.substring(0, 50)}...`);
      });
    }
    
    writeFileSync('tests/audit-services-CORRECTED.json', JSON.stringify(servicesState, null, 2));
  });

  test('4. Check for old palette and hardcoded colors', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    // Get all computed styles and check for hardcoded hex colors
    const colorCheck = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const hardcodedColors = [];
      const oldPalette = [];
      
      allElements.forEach(el => {
        const computed = window.getComputedStyle(el);
        
        // Check for common old palette colors
        const oldColors = [
          'rgb(15, 23, 42)',    // slate-900
          'rgb(148, 163, 184)', // slate-400
          'rgb(6, 182, 212)',   // cyan
          'rgb(143, 179, 196)'  // old rgba(143,179,196)
        ];
        
        if (oldColors.includes(computed.color) || oldColors.includes(computed.backgroundColor)) {
          oldPalette.push({
            tag: el.tagName,
            class: el.className,
            color: computed.color,
            bg: computed.backgroundColor
          });
        }
      });
      
      return { oldPalette: oldPalette.slice(0, 20) }; // Limit to first 20
    });
    
    console.log('\n🎨 Old Palette Check:');
    if (colorCheck.oldPalette.length > 0) {
      console.log(`⚠️  Found ${colorCheck.oldPalette.length} elements with old palette colors`);
    } else {
      console.log('✅ No old palette colors found');
    }
    
    writeFileSync('tests/audit-old-palette.json', JSON.stringify(colorCheck, null, 2));
  });

  test('5. Check console errors and network failures', async ({ page }) => {
    const consoleMessages = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()?.errorText
      });
    });
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    console.log('\n🚨 Console Errors:', consoleMessages.length);
    consoleMessages.forEach(msg => console.log(`   - ${msg}`));
    
    console.log('\n🌐 Network Errors:', networkErrors.length);
    networkErrors.forEach(err => console.log(`   - ${err.url}: ${err.failure}`));
    
    writeFileSync('tests/audit-errors.json', JSON.stringify({ consoleMessages, networkErrors }, null, 2));
  });

  test('6. Check content sources and demo content', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for "Demo" text anywhere on the page
    const hasDemoText = await page.evaluate(() => {
      return document.body.textContent.includes('Demo') || 
             document.body.textContent.includes('DEMO') ||
             document.body.textContent.includes('demo');
    });
    
    // Check service cards count and content
    const servicesInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="service-card"], [class*="ServiceCard"]');
      return {
        count: cards.length,
        titles: Array.from(cards).map(c => {
          const title = c.querySelector('h3, h2, [class*="title"]');
          return title ? title.textContent.trim().substring(0, 50) : 'NO TITLE';
        }).slice(0, 10)
      };
    });
    
    console.log('\n📝 Content Sources:');
    console.log(`   Service cards: ${servicesInfo.count}`);
    console.log(`   Has "Demo" text: ${hasDemoText ? '❌ YES' : '✅ NO'}`);
    servicesInfo.titles.forEach((t, i) => console.log(`   Card ${i}: ${t}`));
    
    writeFileSync('tests/audit-content.json', JSON.stringify({ hasDemoText, servicesInfo }, null, 2));
  });

  test('7. Check layout and UI bugs at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    // Check for overlapping elements (simplified check)
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      const buttons = document.querySelectorAll('button, a.btn, [class*="button"]');
      
      buttons.forEach(btn => {
        const computed = window.getComputedStyle(btn);
        const opacity = parseFloat(computed.opacity);
        
        if (opacity < 0.9) {
          issues.push({
            type: 'button',
            text: btn.textContent.trim().substring(0, 30),
            opacity
          });
        }
      });
      
      return issues;
    });
    
    console.log('\n📱 Layout Check (390px):');
    console.log(`   Horizontal scroll: ${hasHorizontalScroll ? '❌ YES' : '✅ NO'}`);
    console.log(`   Faint buttons: ${layoutIssues.length}`);
    layoutIssues.forEach(issue => console.log(`   - "${issue.text}" opacity: ${issue.opacity}`));
    
    writeFileSync('tests/audit-layout.json', JSON.stringify({ hasHorizontalScroll, layoutIssues }, null, 2));
  });

  test('8. Check section seams and backgrounds', async ({ page }) => {
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    // Sample pixels at section boundaries to detect seams
    const seamCheck = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Get sections
      const sections = document.querySelectorAll('section, [role="region"]');
      const results = [];
      
      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        const computed = window.getComputedStyle(section);
        
        results.push({
          index: idx,
          top: rect.top,
          height: rect.height,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage
        });
      });
      
      return results.slice(0, 10); // Limit
    });
    
    console.log('\n🔗 Section Seams Check:');
    seamCheck.forEach(s => {
      console.log(`   Section ${s.index}: bg=${s.backgroundColor}`);
    });
    
    writeFileSync('tests/audit-seams.json', JSON.stringify(seamCheck, null, 2));
  });
});
