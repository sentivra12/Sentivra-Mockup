/**
 * Services Hero DIAGNOSIS - Step 1: Evidence BEFORE fix
 * Captures all bugs with root cause data
 */

import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:4173';
const SERVICES_URL = `${BASE_URL}/services`;

test.describe('Services Hero - DIAGNOSIS BEFORE FIX', () => {
  
  test('📸 Full matrix: light/dark × EN/AR × 5 widths × 2 motion modes', async ({ browser }) => {
    const screenshots = [];
    const widths = [390, 768, 1024, 1440, 1920];
    
    for (const theme of ['light', 'dark']) {
      for (const lang of ['en', 'ar']) {
        for (const width of widths) {
          for (const motion of ['no-preference', 'reduce']) {
            const context = await browser.newContext({
              viewport: { width, height: 900 },
              colorScheme: theme,
              reducedMotion: motion
            });
            const page = await context.newPage();
            
            await page.goto(BASE_URL);
            await page.evaluate((l) => localStorage.setItem('language', l), lang);
            
            await page.goto(SERVICES_URL);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            
            const filename = `tests/screenshots/hero-BEFORE-${theme}-${lang}-${width}-${motion}.png`;
            await page.screenshot({ 
              path: filename,
              fullPage: false,
              clip: { x: 0, y: 0, width, height: 900 }
            });
            
            screenshots.push({ theme, lang, width, motion, filename });
            console.log(`✓ ${theme}-${lang}-${width}-${motion}`);
            
            await context.close();
          }
        }
      }
    }
    
    console.log(`\n📸 Total screenshots: ${screenshots.length}`);
    writeFileSync('tests/diagnosis-screenshots.json', JSON.stringify(screenshots, null, 2));
  });

  test('BUG 1: NAVBAR contrast - light theme items on light background', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: 'light' });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.setItem('language', 'en'));
    
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const navbarData = await page.evaluate(() => {
      const navbar = document.querySelector('nav, header');
      if (!navbar) return { error: 'Navbar not found' };
      
      // Get navbar computed styles
      const navbarComputed = window.getComputedStyle(navbar);
      const navbarRect = navbar.getBoundingClientRect();
      
      // Sample backdrop color behind navbar center
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Get all navbar text elements
      const logo = navbar.querySelector('[class*="logo"], img[alt*="Sentivra"]');
      const homeLink = Array.from(navbar.querySelectorAll('a')).find(a => a.textContent.includes('Home'));
      const mockupsLink = Array.from(navbar.querySelectorAll('a')).find(a => a.textContent.includes('Mockups'));
      const aboutLink = Array.from(navbar.querySelectorAll('a')).find(a => a.textContent.includes('About'));
      const langSwitch = Array.from(navbar.querySelectorAll('button, a')).find(el => el.textContent.includes('عربي') || el.textContent.includes('AR'));
      const themeButton = navbar.querySelector('[aria-label*="theme"], [class*="theme"]');
      const ctaButton = Array.from(navbar.querySelectorAll('a, button')).find(el => el.textContent.includes('Contact'));
      
      const items = [];
      
      [
        { name: 'Logo', el: logo },
        { name: 'Home link', el: homeLink },
        { name: 'Mockups link', el: mockupsLink },
        { name: 'About link', el: aboutLink },
        { name: 'Language switch', el: langSwitch },
        { name: 'Theme button', el: themeButton },
        { name: 'CTA button', el: ctaButton }
      ].forEach(({ name, el }) => {
        if (!el) {
          items.push({ name, error: 'Not found' });
          return;
        }
        
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        items.push({
          name,
          textColor: computed.color,
          bgColor: computed.backgroundColor,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          opacity: computed.opacity,
          visibility: computed.visibility
        });
      });
      
      return {
        navbarBg: navbarComputed.backgroundColor,
        navbarOpacity: navbarComputed.opacity,
        navbarRect: {
          top: navbarRect.top,
          left: navbarRect.left,
          right: navbarRect.right,
          height: navbarRect.height
        },
        navbarClasses: navbar.className,
        items,
        heroBackdrop: window.getComputedStyle(document.querySelector('section, main')?.firstElementChild || document.body).backgroundColor
      };
    });
    
    console.log('\n🐛 BUG 1: NAVBAR CONTRAST');
    console.log(`   Navbar bg: ${navbarData.navbarBg}`);
    console.log(`   Hero backdrop: ${navbarData.heroBackdrop}`);
    console.log(`   Navbar classes: ${navbarData.navbarClasses}`);
    navbarData.items.forEach(item => {
      console.log(`   ${item.name}:`);
      console.log(`      Color: ${item.textColor}`);
      console.log(`      Bg: ${item.bgColor}`);
      console.log(`      Position: x=${item.x?.toFixed(1)}, y=${item.y?.toFixed(1)}`);
    });
    
    writeFileSync('tests/diagnosis-navbar-contrast.json', JSON.stringify(navbarData, null, 2));
  });

  test('BUG 2: NAVBAR layout - edge touching', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const layoutData = await page.evaluate(() => {
      const navbar = document.querySelector('nav, header');
      const logo = navbar?.querySelector('[class*="logo"], img');
      const ctaButton = Array.from(navbar?.querySelectorAll('a, button') || []).find(el => el.textContent.includes('Contact'));
      const heroSection = document.querySelector('section');
      const heroEyebrow = heroSection?.querySelector('[class*="eyebrow"], span');
      const heroH1 = heroSection?.querySelector('h1');
      
      return {
        viewportWidth: window.innerWidth,
        navbar: navbar?.getBoundingClientRect(),
        logo: logo?.getBoundingClientRect(),
        cta: ctaButton?.getBoundingClientRect(),
        heroEyebrow: heroEyebrow?.getBoundingClientRect(),
        heroH1: heroH1?.getBoundingClientRect()
      };
    });
    
    console.log('\n🐛 BUG 2: NAVBAR LAYOUT');
    console.log(`   Viewport: ${layoutData.viewportWidth}px`);
    console.log(`   Navbar: top=${layoutData.navbar?.top}, height=${layoutData.navbar?.height}`);
    console.log(`   Logo: left=${layoutData.logo?.left}, width=${layoutData.logo?.width}`);
    console.log(`   CTA: right=${layoutData.cta?.right}, viewport_right=${layoutData.viewportWidth}`);
    console.log(`   Hero eyebrow: left=${layoutData.heroEyebrow?.left}`);
    console.log(`   Hero h1: left=${layoutData.heroH1?.left}`);
    console.log(`   Logo vs Eyebrow delta: ${Math.abs((layoutData.logo?.left || 0) - (layoutData.heroEyebrow?.left || 0)).toFixed(1)}px`);
    
    writeFileSync('tests/diagnosis-navbar-layout.json', JSON.stringify(layoutData, null, 2));
  });

  test('BUG 3: CONTAINER alignment', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const containerData = await page.evaluate(() => {
      const navbar = document.querySelector('nav, header');
      const navbarContainer = navbar?.querySelector('[class*="container"], [class*="max-w"]');
      const heroSection = document.querySelector('section');
      const heroContainer = heroSection?.querySelector('[class*="container"], [class*="max-w"]');
      const secondSection = document.querySelectorAll('section')[1];
      const secondContainer = secondSection?.querySelector('[class*="container"], [class*="max-w"]');
      
      const getContainerInfo = (el, name) => {
        if (!el) return { name, error: 'Not found' };
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          name,
          maxWidth: computed.maxWidth,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          marginLeft: computed.marginLeft,
          marginRight: computed.marginRight,
          left: rect.left,
          width: rect.width,
          classes: el.className
        };
      };
      
      return {
        navbar: getContainerInfo(navbarContainer || navbar, 'Navbar container'),
        hero: getContainerInfo(heroContainer || heroSection, 'Hero container'),
        nextSection: getContainerInfo(secondContainer || secondSection, 'Next section container')
      };
    });
    
    console.log('\n🐛 BUG 3: CONTAINER ALIGNMENT');
    Object.entries(containerData).forEach(([key, data]) => {
      console.log(`   ${data.name}:`);
      console.log(`      max-width: ${data.maxWidth}`);
      console.log(`      padding: ${data.paddingLeft} / ${data.paddingRight}`);
      console.log(`      left edge: ${data.left}px`);
      console.log(`      classes: ${data.classes}`);
    });
    
    writeFileSync('tests/diagnosis-containers.json', JSON.stringify(containerData, null, 2));
  });

  test('BUG 4: UNDERLINE width far beyond word', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const underlineData = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return { error: 'H1 not found' };
      
      // Find underline SVG
      const underlineSvg = h1.querySelector('svg') || document.querySelector('[class*="underline"] svg');
      
      // Find the word "Solutions" or the wrapper
      const textNodes = [];
      const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes('Solutions') || node.textContent.includes('حلول')) {
          textNodes.push(node);
        }
      }
      
      // Try to find wrapper around "Solutions"
      const solutionsSpan = Array.from(h1.querySelectorAll('span, div')).find(el => 
        el.textContent.includes('Solutions') && !el.querySelector('svg')
      );
      
      return {
        h1Width: h1.getBoundingClientRect().width,
        h1Text: h1.textContent.substring(0, 100),
        underlineSvg: underlineSvg ? {
          width: underlineSvg.getBoundingClientRect().width,
          height: underlineSvg.getBoundingClientRect().height,
          viewBox: underlineSvg.getAttribute('viewBox'),
          parent: underlineSvg.parentElement?.className
        } : null,
        solutionsWrapper: solutionsSpan ? {
          width: solutionsSpan.getBoundingClientRect().width,
          text: solutionsSpan.textContent,
          classes: solutionsSpan.className
        } : null
      };
    });
    
    console.log('\n🐛 BUG 4: UNDERLINE WIDTH');
    console.log(`   H1 width: ${underlineData.h1Width}px`);
    console.log(`   H1 text: "${underlineData.h1Text}"`);
    if (underlineData.underlineSvg) {
      console.log(`   Underline SVG: ${underlineData.underlineSvg.width}px × ${underlineData.underlineSvg.height}px`);
      console.log(`   SVG parent: ${underlineData.underlineSvg.parent}`);
    }
    if (underlineData.solutionsWrapper) {
      console.log(`   "Solutions" wrapper: ${underlineData.solutionsWrapper.width}px`);
      console.log(`   Wrapper text: "${underlineData.solutionsWrapper.text}"`);
    }
    
    writeFileSync('tests/diagnosis-underline.json', JSON.stringify(underlineData, null, 2));
  });

  test('BUG 5: COLORS - headline tones and gradient', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const colorData = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return { error: 'H1 not found' };
      
      // Get all child elements with their colors
      const children = Array.from(h1.querySelectorAll('*'));
      const colorMap = children.map(el => {
        const computed = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent.substring(0, 30),
          color: computed.color,
          background: computed.background,
          backgroundImage: computed.backgroundImage,
          WebkitBackgroundClip: computed.webkitBackgroundClip,
          WebkitTextFillColor: computed.webkitTextFillColor,
          classes: el.className
        };
      });
      
      // Also check h1 itself
      const h1Computed = window.getComputedStyle(h1);
      
      return {
        h1Color: h1Computed.color,
        h1Background: h1Computed.background,
        childElements: colorMap
      };
    });
    
    console.log('\n🐛 BUG 5: HEADLINE COLORS');
    console.log(`   H1 base color: ${colorData.h1Color}`);
    colorData.childElements?.forEach((el, i) => {
      console.log(`   Child ${i}: ${el.tag} "${el.text}"`);
      console.log(`      color: ${el.color}`);
      if (el.backgroundImage !== 'none') {
        console.log(`      gradient: ${el.backgroundImage?.substring(0, 80)}`);
        console.log(`      clip: ${el.WebkitBackgroundClip}`);
      }
    });
    
    writeFileSync('tests/diagnosis-colors.json', JSON.stringify(colorData, null, 2));
  });

  test('BUG 6: EYEBROW pill - empty icon space', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const eyebrowData = await page.evaluate(() => {
      const heroSection = document.querySelector('section');
      const eyebrow = heroSection?.querySelector('[class*="eyebrow"], [class*="badge"], span[class*="pill"]');
      
      if (!eyebrow) return { error: 'Eyebrow not found' };
      
      const computed = window.getComputedStyle(eyebrow);
      const rect = eyebrow.getBoundingClientRect();
      
      // Check for icon
      const icon = eyebrow.querySelector('svg, img, [class*="icon"]');
      const spans = Array.from(eyebrow.querySelectorAll('span'));
      
      return {
        text: eyebrow.textContent,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        padding: computed.padding,
        gap: computed.gap,
        display: computed.display,
        alignItems: computed.alignItems,
        hasIcon: !!icon,
        iconInfo: icon ? {
          tag: icon.tagName,
          width: icon.getBoundingClientRect().width,
          height: icon.getBoundingClientRect().height,
          opacity: window.getComputedStyle(icon).opacity
        } : null,
        spans: spans.map(s => ({
          text: s.textContent,
          width: s.getBoundingClientRect().width,
          classes: s.className
        })),
        classes: eyebrow.className
      };
    });
    
    console.log('\n🐛 BUG 6: EYEBROW PILL');
    console.log(`   Text: "${eyebrowData.text}"`);
    console.log(`   Font: ${eyebrowData.fontFamily}`);
    console.log(`   Has icon: ${eyebrowData.hasIcon}`);
    if (eyebrowData.iconInfo) {
      console.log(`   Icon: ${eyebrowData.iconInfo.tag} ${eyebrowData.iconInfo.width}×${eyebrowData.iconInfo.height}`);
    }
    console.log(`   Spans: ${eyebrowData.spans?.length}`);
    eyebrowData.spans?.forEach((s, i) => {
      console.log(`      Span ${i}: "${s.text}" (${s.width}px)`);
    });
    
    writeFileSync('tests/diagnosis-eyebrow.json', JSON.stringify(eyebrowData, null, 2));
  });

  test('BUG 7: VISUAL stage - faint tiles, random lines, clipping', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const visualData = await page.evaluate(() => {
      const stage = document.querySelector('[class*="constellation"], [class*="stage"], [class*="visual"]');
      if (!stage) return { error: 'Stage not found' };
      
      const stageRect = stage.getBoundingClientRect();
      const stageComputed = window.getComputedStyle(stage);
      
      // Find all tiles/nodes
      const tiles = Array.from(stage.querySelectorAll('[class*="tile"], [class*="node"], [class*="card"]'));
      
      const tileData = tiles.map((tile, i) => {
        const computed = window.getComputedStyle(tile);
        const rect = tile.getBoundingClientRect();
        
        return {
          index: i,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          borderRadius: computed.borderRadius,
          opacity: computed.opacity,
          boxShadow: computed.boxShadow,
          transform: computed.transform,
          zIndex: computed.zIndex,
          isClipped: rect.right > window.innerWidth || rect.bottom > window.innerHeight,
          classes: tile.className
        };
      });
      
      // Find connector lines
      const lines = Array.from(stage.querySelectorAll('line, path, [class*="line"], [class*="connector"]'));
      
      return {
        stage: {
          width: stageRect.width,
          height: stageRect.height,
          x: stageRect.x,
          y: stageRect.y,
          overflow: stageComputed.overflow,
          position: stageComputed.position,
          classes: stage.className
        },
        tilesCount: tiles.length,
        tiles: tileData,
        linesCount: lines.length,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };
    });
    
    console.log('\n🐛 BUG 7: VISUAL STAGE');
    console.log(`   Stage: ${visualData.stage?.width}×${visualData.stage?.height} at (${visualData.stage?.x}, ${visualData.stage?.y})`);
    console.log(`   Tiles count: ${visualData.tilesCount}`);
    console.log(`   Lines count: ${visualData.linesCount}`);
    visualData.tiles?.forEach(tile => {
      console.log(`   Tile ${tile.index}:`);
      console.log(`      Position: (${tile.x.toFixed(1)}, ${tile.y.toFixed(1)})`);
      console.log(`      Size: ${tile.width.toFixed(1)}×${tile.height.toFixed(1)}`);
      console.log(`      Bg: ${tile.backgroundColor}`);
      console.log(`      Border: ${tile.border}`);
      console.log(`      Opacity: ${tile.opacity}`);
      console.log(`      Shadow: ${tile.boxShadow?.substring(0, 50)}`);
      console.log(`      Clipped: ${tile.isClipped}`);
    });
    
    writeFileSync('tests/diagnosis-visual.json', JSON.stringify(visualData, null, 2));
  });

  test('BUG 8: SECONDARY BUTTON faint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    
    const buttonData = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('section button, section a[class*="button"]'));
      const heroButtons = buttons.filter(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.top < 700; // In hero area
      });
      
      return heroButtons.map((btn, i) => {
        const computed = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        
        return {
          index: i,
          text: btn.textContent.trim().substring(0, 30),
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          opacity: computed.opacity,
          width: rect.width,
          height: rect.height,
          classes: btn.className
        };
      });
    });
    
    console.log('\n🐛 BUG 8: BUTTONS');
    buttonData.forEach(btn => {
      console.log(`   Button ${btn.index}: "${btn.text}"`);
      console.log(`      Color: ${btn.color}`);
      console.log(`      Bg: ${btn.backgroundColor}`);
      console.log(`      Border: ${btn.border}`);
      console.log(`      Opacity: ${btn.opacity}`);
      console.log(`      Size: ${btn.width.toFixed(1)}×${btn.height.toFixed(1)}`);
    });
    
    writeFileSync('tests/diagnosis-buttons.json', JSON.stringify(buttonData, null, 2));
  });

  test('BUG 9: TYPEWRITER clipped and small', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const typewriterData = await page.evaluate(() => {
      const heroSection = document.querySelector('section');
      if (!heroSection) return { error: 'Hero not found' };
      
      const heroRect = heroSection.getBoundingClientRect();
      
      // Find typewriter (usually near bottom of hero)
      const allText = Array.from(heroSection.querySelectorAll('div, span, p'));
      const typewriter = allText.find(el => 
        el.textContent.includes('ERP') || 
        el.textContent.includes('Web') || 
        el.textContent.includes('›') ||
        el.className.includes('typewriter')
      );
      
      if (!typewriter) return { error: 'Typewriter not found' };
      
      const computed = window.getComputedStyle(typewriter);
      const rect = typewriter.getBoundingClientRect();
      
      return {
        text: typewriter.textContent,
        fontSize: computed.fontSize,
        color: computed.color,
        opacity: computed.opacity,
        position: {
          bottom: rect.bottom,
          viewportHeight: window.innerHeight,
          isClipped: rect.bottom > window.innerHeight
        },
        heroHeight: heroRect.height,
        classes: typewriter.className
      };
    });
    
    console.log('\n🐛 BUG 9: TYPEWRITER');
    console.log(`   Text: "${typewriterData.text?.substring(0, 50)}"`);
    console.log(`   Font size: ${typewriterData.fontSize}`);
    console.log(`   Color: ${typewriterData.color}`);
    console.log(`   Opacity: ${typewriterData.opacity}`);
    console.log(`   Bottom: ${typewriterData.position?.bottom}`);
    console.log(`   Viewport height: ${typewriterData.position?.viewportHeight}`);
    console.log(`   Clipped: ${typewriterData.position?.isClipped}`);
    console.log(`   Hero height: ${typewriterData.heroHeight}`);
    
    writeFileSync('tests/diagnosis-typewriter.json', JSON.stringify(typewriterData, null, 2));
  });

  test('BUG 10: Dark theme and console checks', async ({ page }) => {
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    
    // Light theme first
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(SERVICES_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const lightData = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const serviceCount = document.querySelector('[class*="count"], [class*="stat"]');
      
      return {
        h1Text: h1?.textContent,
        serviceCountText: serviceCount?.textContent,
        hasHardcodedServices: document.body.innerHTML.includes('const services = [')
      };
    });
    
    // Dark theme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/hero-dark-check.png',
      clip: { x: 0, y: 0, width: 1440, height: 800 }
    });
    
    const darkData = await page.evaluate(() => {
      const navbar = document.querySelector('nav, header');
      const h1 = document.querySelector('h1');
      const hero = document.querySelector('section');
      
      const navbarComputed = navbar ? window.getComputedStyle(navbar) : null;
      const heroComputed = hero ? window.getComputedStyle(hero) : null;
      const h1Computed = h1 ? window.getComputedStyle(h1) : null;
      
      return {
        navbarBg: navbarComputed?.backgroundColor,
        heroBg: heroComputed?.backgroundColor,
        h1Color: h1Computed?.color
      };
    });
    
    console.log('\n🐛 BUG 10: DARK THEME & CONSOLE');
    console.log(`   Console errors: ${errors.length}`);
    console.log(`   Console warnings: ${warnings.length}`);
    console.log(`   H1 text: "${lightData.h1Text?.substring(0, 50)}"`);
    console.log(`   Service count: "${lightData.serviceCountText}"`);
    console.log(`   Has hardcoded services: ${lightData.hasHardcodedServices}`);
    console.log('\n   Dark theme:');
    console.log(`   Navbar bg: ${darkData.navbarBg}`);
    console.log(`   Hero bg: ${darkData.heroBg}`);
    console.log(`   H1 color: ${darkData.h1Color}`);
    
    writeFileSync('tests/diagnosis-dark-console.json', JSON.stringify({
      errors: errors.slice(0, 5),
      warnings: warnings.slice(0, 5),
      lightData,
      darkData
    }, null, 2));
  });
});
