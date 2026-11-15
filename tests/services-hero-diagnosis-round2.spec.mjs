/**
 * Services Hero Diagnosis - Round 2
 * Real browser testing against npm run preview
 * Light/Dark x EN/AR x 390/1440 x reducedMotion reduce/no-preference
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('Services Hero - Round 2 Diagnosis', () => {
  
  // Test 1: "Solutions" word visibility and gradient
  test('🔍 BUG 1: "Solutions" word INVISIBLE - check gradient, opacity, text-fill', async ({ page }) => {
    // Test with no-preference first
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for animations
    
    console.log('\n=== BUG 1: "Solutions" word visibility (reducedMotion: no-preference) ===');
    
    // Find the headline
    const headline = page.locator('h1').first();
    const headlineText = await headline.textContent();
    console.log('Headline text:', headlineText);
    
    // Find the gradient span (should contain "Solutions")
    const gradientSpan = headline.locator('.bg-gradient-to-r').first();
    const exists = await gradientSpan.count() > 0;
    console.log('Gradient span exists:', exists);
    
    if (exists) {
      const spanText = await gradientSpan.textContent();
      console.log('Gradient span text:', spanText);
      
      const box = await gradientSpan.boundingBox();
      console.log('Bounding box:', box);
      
      // Get computed styles
      const styles = await gradientSpan.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          webkitTextFillColor: computed.webkitTextFillColor || computed['-webkit-text-fill-color'],
          backgroundImage: computed.backgroundImage,
          backgroundClip: computed.backgroundClip,
          webkitBackgroundClip: computed['-webkit-background-clip'],
          opacity: computed.opacity,
          display: computed.display,
          visibility: computed.visibility,
        };
      });
      console.log('Computed styles:', JSON.stringify(styles, null, 2));
      
      // Check if text node exists
      const textNode = await gradientSpan.evaluate((el) => {
        return el.childNodes[0]?.nodeType === 3 ? el.childNodes[0].textContent : null;
      });
      console.log('Text node content:', textNode);
      
      // Sample pixel at center
      if (box) {
        const screenshot = await page.screenshot();
        console.log('Screenshot taken for visual inspection');
      }
    }
    
    // Now test with reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('\n=== BUG 1: "Solutions" word visibility (reducedMotion: reduce) ===');
    
    const gradientSpanReduced = page.locator('h1 .bg-gradient-to-r').first();
    if (await gradientSpanReduced.count() > 0) {
      const stylesReduced = await gradientSpanReduced.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          color: computed.color,
          webkitTextFillColor: computed.webkitTextFillColor || computed['-webkit-text-fill-color'],
        };
      });
      console.log('Reduced motion styles:', JSON.stringify(stylesReduced, null, 2));
    }
  });
  
  // Test 2: Service count "6" visibility
  test('🔍 BUG 2: Service count "6" INVISIBLE - check DOM value, opacity, gradient', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n=== BUG 2: Service count visibility ===');
    
    // Look for stat/count elements
    const statElements = await page.locator('[class*="text-"]').evaluateAll((elements) => {
      return elements
        .filter(el => {
          const text = el.textContent?.trim() || '';
          return /^\d+$/.test(text) || text.includes('Services Available') || text.includes('Available');
        })
        .map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          tagName: el.tagName,
          computed: {
            opacity: window.getComputedStyle(el).opacity,
            color: window.getComputedStyle(el).color,
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            backgroundImage: window.getComputedStyle(el).backgroundImage,
          }
        }));
    });
    
    console.log('Stat elements found:', JSON.stringify(statElements, null, 2));
    
    // Check for the number specifically
    const numberElement = page.locator('text=/^\\d+$/').first();
    if (await numberElement.count() > 0) {
      const numText = await numberElement.textContent();
      const numStyles = await numberElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          text: el.textContent,
          opacity: computed.opacity,
          color: computed.color,
          webkitTextFillColor: computed.webkitTextFillColor || computed['-webkit-text-fill-color'],
          backgroundImage: computed.backgroundImage,
          backgroundClip: computed.backgroundClip,
        };
      });
      console.log('Number element:', JSON.stringify(numStyles, null, 2));
    } else {
      console.log('❌ No number element found');
    }
  });
  
  // Test 3: Typewriter text clipping
  test('🔍 BUG 3: Typewriter shows "ERP Sy" (clipped) - check overflow, width, animation', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n=== BUG 3: Typewriter clipping ===');
    
    // Find typewriter element (likely has animation or contains service names)
    const typewriterCandidates = await page.locator('[class*="text-"]').evaluateAll((elements) => {
      return elements
        .filter(el => {
          const text = el.textContent?.trim() || '';
          return text.includes('ERP') || text.includes('Web') || text.includes('Mobile') || text.includes('›');
        })
        .map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          computed: {
            overflow: window.getComputedStyle(el).overflow,
            overflowX: window.getComputedStyle(el).overflowX,
            width: window.getComputedStyle(el).width,
            maxWidth: window.getComputedStyle(el).maxWidth,
            minWidth: window.getComputedStyle(el).minWidth,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            whiteSpace: window.getComputedStyle(el).whiteSpace,
          }
        }));
    });
    
    console.log('Typewriter candidates:', JSON.stringify(typewriterCandidates, null, 2));
    
    // Check for the faint pill below
    const allElements = await page.locator('body *').evaluateAll((elements) => {
      return elements
        .filter(el => {
          const computed = window.getComputedStyle(el);
          const opacity = parseFloat(computed.opacity);
          return opacity > 0 && opacity < 0.5 && el.textContent?.trim().length < 20;
        })
        .slice(0, 5)
        .map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          opacity: window.getComputedStyle(el).opacity,
        }));
    });
    console.log('Faint elements (opacity < 0.5):', JSON.stringify(allElements, null, 2));
  });
  
  // Test 4: Stage tiles not painted (glass cards missing)
  test('🔍 BUG 4: Stage TILES not painted - check background, border, backdrop-filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n=== BUG 4: Stage tiles visibility ===');
    
    // Find tile elements (likely have icons inside)
    const tiles = await page.locator('[class*="glass"], [class*="tile"], [class*="node"]').evaluateAll((elements) => {
      return elements
        .slice(0, 10)
        .map(el => {
          const computed = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            className: el.className,
            hasIcon: !!el.querySelector('svg'),
            size: { width: rect.width, height: rect.height },
            computed: {
              backgroundColor: computed.backgroundColor,
              backgroundImage: computed.backgroundImage,
              border: computed.border,
              borderColor: computed.borderColor,
              borderWidth: computed.borderWidth,
              boxShadow: computed.boxShadow,
              opacity: computed.opacity,
              backdropFilter: computed.backdropFilter || computed['-webkit-backdrop-filter'],
            }
          };
        });
    });
    
    console.log('Tile candidates:', JSON.stringify(tiles, null, 2));
    
    // Check for ancestor opacity/filter issues
    const ancestorIssues = await page.evaluate(() => {
      const heroSection = document.querySelector('section') || document.querySelector('div[class*="hero"]');
      if (!heroSection) return { found: false };
      
      let current = heroSection;
      const ancestors = [];
      while (current && current !== document.body) {
        const computed = window.getComputedStyle(current);
        const opacity = parseFloat(computed.opacity);
        const filter = computed.filter;
        if (opacity < 1 || (filter && filter !== 'none')) {
          ancestors.push({
            tagName: current.tagName,
            className: current.className,
            opacity: computed.opacity,
            filter: computed.filter,
          });
        }
        current = current.parentElement;
      }
      return { found: true, ancestors };
    });
    
    console.log('Ancestor opacity/filter issues:', JSON.stringify(ancestorIssues, null, 2));
  });
  
  // Test 5: Eyebrow icon missing
  test('🔍 BUG 5: Eyebrow pill has empty icon slot', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== BUG 5: Eyebrow icon ===');
    
    // Find eyebrow element
    const eyebrow = await page.locator('span').filter({ hasText: /Enterprise|Services|Premium/i }).first();
    if (await eyebrow.count() > 0) {
      const hasIcon = await eyebrow.locator('svg').count() > 0;
      const children = await eyebrow.evaluate((el) => {
        return Array.from(el.children).map(child => ({
          tagName: child.tagName,
          className: child.className,
          isEmpty: child.textContent?.trim().length === 0,
        }));
      });
      console.log('Eyebrow has icon:', hasIcon);
      console.log('Eyebrow children:', JSON.stringify(children, null, 2));
    } else {
      console.log('❌ Eyebrow not found');
    }
  });
  
  // Test 6: "Explore Services" button faint
  test('🔍 BUG 6: "Explore Services" button faint - check border/text contrast', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== BUG 6: Button contrast ===');
    
    const exploreBtn = page.locator('button, a').filter({ hasText: /Explore Services/i }).first();
    if (await exploreBtn.count() > 0) {
      const styles = await exploreBtn.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          borderColor: computed.borderColor,
          borderWidth: computed.borderWidth,
          opacity: computed.opacity,
        };
      });
      console.log('Explore Services button styles:', JSON.stringify(styles, null, 2));
      
      // Get parent background for contrast calculation
      const bgColor = await page.evaluate(() => {
        const hero = document.querySelector('section') || document.body;
        return window.getComputedStyle(hero).backgroundColor;
      });
      console.log('Hero background color:', bgColor);
    }
  });
  
  // Test 7: Container alignment (hero vs navbar)
  test('🔍 BUG 7: Hero content alignment vs navbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== BUG 7: Container alignment ===');
    
    // Get navbar logo position
    const logo = page.locator('nav img, nav svg').first();
    const logoBox = await logo.boundingBox();
    console.log('Logo left edge:', logoBox?.x);
    
    // Get hero eyebrow position
    const eyebrow = page.locator('section span').filter({ hasText: /Enterprise|Services/i }).first();
    const eyebrowBox = await eyebrow.boundingBox();
    console.log('Eyebrow left edge:', eyebrowBox?.x);
    
    // Get hero container
    const heroContainer = await page.evaluate(() => {
      const hero = document.querySelector('section');
      if (!hero) return null;
      const container = hero.querySelector('[class*="container"], [class*="max-w"]');
      const computed = window.getComputedStyle(container || hero);
      return {
        maxWidth: computed.maxWidth,
        paddingLeft: computed.paddingLeft,
        paddingRight: computed.paddingRight,
        marginLeft: computed.marginLeft,
        marginRight: computed.marginRight,
      };
    });
    console.log('Hero container styles:', JSON.stringify(heroContainer, null, 2));
    
    // Get navbar container
    const navContainer = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      const computed = window.getComputedStyle(nav);
      return {
        maxWidth: computed.maxWidth,
        paddingLeft: computed.paddingLeft,
        paddingRight: computed.paddingRight,
      };
    });
    console.log('Nav container styles:', JSON.stringify(navContainer, null, 2));
  });
  
  // Test 8: Underline and sparkle missing
  test('🔍 BUG 8: Underline and sparkle gone', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== BUG 8: Underline and sparkle ===');
    
    // Check for SVG underline
    const svgUnderline = await page.locator('h1 svg').count();
    console.log('SVG underline count:', svgUnderline);
    
    if (svgUnderline > 0) {
      const svgStyles = await page.locator('h1 svg').first().evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          opacity: computed.opacity,
          visibility: computed.visibility,
          display: computed.display,
          width: rect.width,
          height: rect.height,
          color: computed.color,
          stroke: el.querySelector('path')?.getAttribute('stroke'),
        };
      });
      console.log('SVG styles:', JSON.stringify(svgStyles, null, 2));
    }
    
    // Check for Sparkle component
    const sparkles = await page.locator('[class*="sparkle"], svg').evaluateAll((elements) => {
      return elements
        .filter(el => {
          const viewBox = el.getAttribute('viewBox');
          const paths = el.querySelectorAll('path').length;
          return viewBox && paths > 0;
        })
        .slice(0, 5)
        .map(el => ({
          viewBox: el.getAttribute('viewBox'),
          className: el.className.baseVal || el.className,
          opacity: window.getComputedStyle(el).opacity,
        }));
    });
    console.log('Sparkle candidates:', JSON.stringify(sparkles, null, 2));
  });
  
  // Screenshot matrix
  test('📸 Screenshot matrix: light/dark x EN/AR x 1440', async ({ page }) => {
    const configs = [
      { theme: 'light', lang: 'en', width: 1440 },
      { theme: 'light', lang: 'ar', width: 1440 },
      { theme: 'dark', lang: 'en', width: 1440 },
      { theme: 'dark', lang: 'ar', width: 1440 },
    ];
    
    for (const config of configs) {
      await page.setViewportSize({ width: config.width, height: 900 });
      await page.goto(`${BASE_URL}/services?lang=${config.lang}`);
      
      // Set theme
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
        path: `tests/screenshots/hero-round2-BEFORE-${config.theme}-${config.lang}-${config.width}.png`,
        fullPage: false,
      });
      
      console.log(`✓ Screenshot: ${config.theme}-${config.lang}-${config.width}`);
    }
  });
});
