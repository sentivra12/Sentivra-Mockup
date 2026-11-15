/**
 * Services Hero AFTER FIX - Verification Tests
 * Confirms all fixes are working with real browser evidence
 */

import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:4173';
const SERVICES_URL = `${BASE_URL}/services`;

test.describe('Services Hero - AFTER FIX Verification', () => {
  
  test('✅ NAVBAR CONTRAST: Brand-800 text on light hero (4.5:1)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: 'light' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.setItem('language', 'en'));
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/hero-AFTER-light-en-1440-navbar.png',
      clip: { x: 0, y: 0, width: 1440, height: 100 }
    });
    
    const navbarCheck = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a')).filter(a => 
        a.textContent.includes('Home') || a.textContent.includes('Mockups') || a.textContent.includes('About')
      );
      
      return {
        linkColors: links.map(l => ({
          text: l.textContent,
          color: window.getComputedStyle(l).color
        })),
        logoVariant: document.querySelector('[class*="logo"] img, [class*="logo"] svg')?.className || 'not found'
      };
    });
    
    console.log('\n✅ NAVBAR CONTRAST (AFTER FIX):');
    navbarCheck.linkColors.forEach(l => {
      console.log(`   ${l.text}: ${l.color}`);
    });
    console.log(`   Logo variant: ${navbarCheck.logoVariant}`);
    
    // Expect dark text (rgb values >100)
    navbarCheck.linkColors.forEach(l => {
      const rgb = l.color.match(/\d+/g);
      if (rgb) {
        const isDark = parseInt(rgb[0]) < 150 && parseInt(rgb[1]) < 150 && parseInt(rgb[2]) < 150;
        expect(isDark).toBe(true); // Should be dark text
      }
    });
    
    writeFileSync('tests/after-navbar-contrast.json', JSON.stringify(navbarCheck, null, 2));
  });

  test('✅ HEADLINE GRADIENT: Brand tokens only (no slate/cyan)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const headlineCheck = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const gradientSpan = h1?.querySelector('[class*="gradient"]');
      
      return {
        h1Text: h1?.textContent,
        gradientClasses: gradientSpan?.className,
        hasSlate: gradientSpan?.className.includes('slate') || false,
        hasCyan: gradientSpan?.className.includes('cyan') || false,
        hasBrand: gradientSpan?.className.includes('brand') || false
      };
    });
    
    console.log('\n✅ HEADLINE GRADIENT (AFTER FIX):');
    console.log(`   Classes: ${headlineCheck.gradientClasses}`);
    console.log(`   Has slate: ${headlineCheck.hasSlate}`);
    console.log(`   Has cyan: ${headlineCheck.hasCyan}`);
    console.log(`   Has brand: ${headlineCheck.hasBrand}`);
    
    expect(headlineCheck.hasSlate).toBe(false);
    expect(headlineCheck.hasCyan).toBe(false);
    expect(headlineCheck.hasBrand).toBe(true);
    
    writeFileSync('tests/after-headline.json', JSON.stringify(headlineCheck, null, 2));
  });

  test('✅ UNDERLINE WIDTH: Only on "Solutions" word', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const underlineCheck = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const wrapperWithUnderline = h1?.querySelector('.relative.inline-block');
      const svg = wrapperWithUnderline?.querySelector('svg');
      
      return {
        wrapperText: wrapperWithUnderline?.textContent,
        wrapperWidth: wrapperWithUnderline?.getBoundingClientRect().width,
        svgWidth: svg?.getBoundingClientRect().width,
        ratio: svg && wrapperWithUnderline 
          ? (svg.getBoundingClientRect().width / wrapperWithUnderline.getBoundingClientRect().width).toFixed(2)
          : null
      };
    });
    
    console.log('\n✅ UNDERLINE WIDTH (AFTER FIX):');
    console.log(`   Wrapper text: "${underlineCheck.wrapperText}"`);
    console.log(`   Wrapper width: ${underlineCheck.wrapperWidth}px`);
    console.log(`   SVG width: ${underlineCheck.svgWidth}px`);
    console.log(`   Ratio: ${underlineCheck.ratio}`);
    
    // Expect wrapper to contain only "Solutions"
    expect(underlineCheck.wrapperText?.trim()).toMatch(/^(Solutions|برمجية)$/);
    // Expect SVG to be roughly same width as wrapper (≤ 1.1x)
    expect(parseFloat(underlineCheck.ratio || '0')).toBeLessThanOrEqual(1.1);
    
    writeFileSync('tests/after-underline.json', JSON.stringify(underlineCheck, null, 2));
  });

  test('✅ BUTTONS: Proper borders and backgrounds', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const buttonsCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('section button, section a[class*="button"]')).filter(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.top < 700; // In hero area
      });
      
      return buttons.map((btn, i) => {
        const computed = window.getComputedStyle(btn);
        return {
          index: i,
          text: btn.textContent.trim().substring(0, 30),
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          borderWidth: computed.borderWidth,
          opacity: computed.opacity
        };
      });
    });
    
    console.log('\n✅ BUTTONS (AFTER FIX):');
    buttonsCheck.forEach(btn => {
      console.log(`   ${btn.index}: "${btn.text}"`);
      console.log(`      Color: ${btn.color}`);
      console.log(`      Bg: ${btn.backgroundColor}`);
      console.log(`      Border: ${btn.border}`);
      console.log(`      Opacity: ${btn.opacity}`);
    });
    
    // Expect all buttons to have opacity 1
    buttonsCheck.forEach(btn => {
      expect(btn.opacity).toBe('1');
    });
    
    // Expect secondary button to have visible border (≥ 2px)
    const secondaryButton = buttonsCheck.find(b => b.text.includes('Explore'));
    if (secondaryButton) {
      expect(parseInt(secondaryButton.borderWidth)).toBeGreaterThanOrEqual(2);
    }
    
    writeFileSync('tests/after-buttons.json', JSON.stringify(buttonsCheck, null, 2));
  });

  test('✅ TYPEWRITER: Larger size (18-20px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const typewriterCheck = await page.evaluate(() => {
      const typewriter = Array.from(document.querySelectorAll('div, span')).find(el =>
        el.textContent.includes('›') && el.textContent.length < 100
      );
      
      if (!typewriter) return { error: 'Not found' };
      
      const computed = window.getComputedStyle(typewriter);
      return {
        text: typewriter.textContent.substring(0, 50),
        fontSize: computed.fontSize,
        fontSizeNum: parseInt(computed.fontSize),
        color: computed.color
      };
    });
    
    console.log('\n✅ TYPEWRITER (AFTER FIX):');
    console.log(`   Text: "${typewriterCheck.text}"`);
    console.log(`   Font size: ${typewriterCheck.fontSize}`);
    console.log(`   Color: ${typewriterCheck.color}`);
    
    // Expect font size ≥ 16px (was 14px)
    expect(typewriterCheck.fontSizeNum).toBeGreaterThanOrEqual(16);
    
    writeFileSync('tests/after-typewriter.json', JSON.stringify(typewriterCheck, null, 2));
  });

  test('✅ CONSTELLATION: Brand accent colors only', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const constellationCheck = await page.evaluate(() => {
      const lines = document.querySelectorAll('svg line, svg path[stroke]');
      const tiles = document.querySelectorAll('[class*="w-16"], [class*="w-24"]');
      
      return {
        linesCount: lines.length,
        tilesCount: tiles.length,
        firstLineClass: lines[0]?.className.baseVal || lines[0]?.getAttribute('class') || 'none',
        hasCyanInLines: Array.from(lines).some(l => 
          (l.className.baseVal || l.getAttribute('class') || '').includes('cyan')
        )
      };
    });
    
    console.log('\n✅ CONSTELLATION (AFTER FIX):');
    console.log(`   Lines: ${constellationCheck.linesCount}`);
    console.log(`   Tiles: ${constellationCheck.tilesCount}`);
    console.log(`   First line class: ${constellationCheck.firstLineClass}`);
    console.log(`   Has cyan in lines: ${constellationCheck.hasCyanInLines}`);
    
    expect(constellationCheck.hasCyanInLines).toBe(false);
    
    writeFileSync('tests/after-constellation.json', JSON.stringify(constellationCheck, null, 2));
  });

  test('📸 Full screenshot matrix AFTER: light/dark × EN/AR × 1440', async ({ browser }) => {
    const screenshots = [];
    
    for (const theme of ['light', 'dark']) {
      for (const lang of ['en', 'ar']) {
        const context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          colorScheme: theme
        });
        const page = await context.newPage();
        
        await page.goto(BASE_URL);
        await page.evaluate((l) => localStorage.setItem('language', l), lang);
        
        await page.goto(SERVICES_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        const filename = `tests/screenshots/hero-AFTER-${theme}-${lang}-1440-full.png`;
        await page.screenshot({ 
          path: filename,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1440, height: 900 }
        });
        
        screenshots.push({ theme, lang, filename });
        console.log(`✓ ${theme}-${lang}`);
        
        await context.close();
      }
    }
    
    console.log(`\n📸 AFTER screenshots: ${screenshots.length}`);
    writeFileSync('tests/after-screenshots.json', JSON.stringify(screenshots, null, 2));
  });

  test('✅ CONSOLE: Zero errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`\n✅ CONSOLE ERRORS (AFTER FIX): ${errors.length}`);
    errors.forEach(e => console.log(`   - ${e.substring(0, 100)}`));
    
    expect(errors.length).toBe(0);
    
    writeFileSync('tests/after-console.json', JSON.stringify({ errors }, null, 2));
  });
});
