/**
 * Motion Modes Diagnosis - Reproduce reduced-motion issue
 * 
 * Compares two states:
 * 1. reducedMotion: 'no-preference' (animations should work)
 * 2. reducedMotion: 'reduce' (currently kills ALL animations - BUG)
 * 
 * Expected: Calm animations in reduce mode
 * Actual: Completely static page in reduce mode
 */

import { test, expect } from '@playwright/test';

test.describe('Motion Modes - Before Fix', () => {
  
  test('no-preference mode - animations should work', async ({ page }) => {
    // Set NO reduced motion preference (default)
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n🎬 TESTING: reducedMotion = no-preference\n');

    // Check hero section has animations
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Check for animated elements
    // 1. HeroVisual cards should have animations
    const visualCards = hero.locator('[class*="absolute"]').filter({ hasText: /AI|Analytics|Code/i });
    const cardCount = await visualCards.count();
    console.log(`   Hero cards found: ${cardCount}`);

    // 2. Check if framer-motion animations are present
    const motionElements = page.locator('[data-projection-id], [style*="transform"]');
    const motionCount = await motionElements.count();
    console.log(`   Elements with transform/motion: ${motionCount}`);

    // 3. Check for CSS animations
    const animatedCSS = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.animationName && style.animationName !== 'none') {
          count++;
        }
      });
      return count;
    });
    console.log(`   Elements with CSS animation: ${animatedCSS}`);

    // 4. Check Sparkle elements (should glow)
    const sparkles = page.locator('svg').filter({ has: page.locator('defs') });
    const sparkleCount = await sparkles.count();
    console.log(`   Sparkle elements: ${sparkleCount}`);

    // 5. Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/motion-no-preference.png',
      fullPage: true 
    });
    console.log(`\n📸 Screenshot: motion-no-preference.png`);
    console.log(`\n✅ Full animations mode - ${animatedCSS} animated elements\n`);

    // Assertions
    expect(motionCount).toBeGreaterThan(5); // Should have many animated elements
    expect(animatedCSS).toBeGreaterThan(0); // Should have CSS animations
  });

  test('reduce mode - currently KILLS all animations (BUG)', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n🛑 TESTING: reducedMotion = reduce\n');

    // Check console for reduced motion message
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.text().includes('Reduced Motion') || msg.text().includes('motion')) {
        console.log(`   Console: ${msg.text()}`);
      }
    });

    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Check for animated elements (should be ZERO due to bug)
    const animatedCSS = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.animationName && style.animationName !== 'none') {
          count++;
        }
      });
      return count;
    });
    console.log(`   Elements with CSS animation: ${animatedCSS}`);

    // Check if global CSS rule killed everything
    const hasGlobalKill = await page.evaluate(() => {
      // Check if media query is active
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    console.log(`   prefers-reduced-motion: reduce is ${hasGlobalKill ? 'ACTIVE' : 'inactive'}`);

    // Count transform elements (should be minimal)
    const motionElements = page.locator('[style*="transform"]');
    const motionCount = await motionElements.count();
    console.log(`   Elements with transform: ${motionCount}`);

    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/motion-reduce-BEFORE-fix.png',
      fullPage: true 
    });
    console.log(`\n📸 Screenshot: motion-reduce-BEFORE-fix.png`);
    console.log(`\n❌ BUG CONFIRMED: ${animatedCSS} animated elements (should have calm animations, not ZERO)\n`);

    // Document the bug
    expect(hasGlobalKill).toBe(true); // Media query IS active
    // This SHOULD fail before fix (animations killed):
    // expect(animatedCSS).toBeGreaterThan(0); 
  });

  test('compare side-by-side - count animated elements', async ({ page, context }) => {
    console.log('\n📊 COMPARISON: no-preference vs reduce\n');

    // Test 1: No preference
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const fullCount = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let animated = 0;
      let withTransition = 0;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.animationName && style.animationName !== 'none') animated++;
        if (style.transitionDuration && style.transitionDuration !== '0s') withTransition++;
      });
      return { animated, withTransition };
    });

    // Test 2: Reduced motion
    const page2 = await context.newPage();
    await page2.emulateMedia({ reducedMotion: 'reduce' });
    await page2.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page2.waitForTimeout(1500);

    const reducedCount = await page2.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let animated = 0;
      let withTransition = 0;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.animationName && style.animationName !== 'none') animated++;
        if (style.transitionDuration && style.transitionDuration !== '0s') withTransition++;
      });
      return { animated, withTransition };
    });

    console.log('   ┌─────────────────────────────────────────┐');
    console.log('   │ Mode            │ Animations │ Transitions │');
    console.log('   ├─────────────────────────────────────────┤');
    console.log(`   │ no-preference   │ ${fullCount.animated.toString().padStart(10)} │ ${fullCount.withTransition.toString().padStart(11)} │`);
    console.log(`   │ reduce (BEFORE) │ ${reducedCount.animated.toString().padStart(10)} │ ${reducedCount.withTransition.toString().padStart(11)} │`);
    console.log('   └─────────────────────────────────────────┘\n');

    console.log(`   📉 Difference: ${fullCount.animated - reducedCount.animated} animations killed`);
    console.log(`   📉 Difference: ${fullCount.withTransition - reducedCount.withTransition} transitions killed\n`);

    await page2.close();

    // Document the problem
    expect(fullCount.animated).toBeGreaterThan(0);
    expect(reducedCount.animated).toBe(0); // BUG: Should have SOME calm animations
  });

  test('check specific hero elements', async ({ page }) => {
    console.log('\n🎯 CHECKING SPECIFIC HERO ELEMENTS\n');

    // Test with reduce mode
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check HeroVisual canvas/cards
    const hero = page.locator('section').first();
    
    // 1. Check if orbit is animated
    const orbitCheck = await page.evaluate(() => {
      const orbits = document.querySelectorAll('[style*="transform"]');
      return Array.from(orbits).some(el => {
        const style = window.getComputedStyle(el);
        return style.animationName !== 'none';
      });
    });
    console.log(`   Orbit animated: ${orbitCheck ? 'YES' : 'NO (killed by reduce)'}`);

    // 2. Check Sparkle glow
    const sparkles = hero.locator('svg').filter({ has: page.locator('defs filter') });
    const sparkleCount = await sparkles.count();
    console.log(`   Sparkles with glow filter: ${sparkleCount}`);

    // 3. Check code tokens (should be hidden in reduce mode - OK)
    const codeTokens = hero.locator('[class*="code"], [class*="token"]').first();
    const codeVisible = await codeTokens.isVisible().catch(() => false);
    console.log(`   Code tokens visible: ${codeVisible ? 'YES' : 'NO (correctly hidden)'}`);

    // 4. Check analytics chart
    const chart = hero.locator('[class*="chart"], [class*="analytics"]').first();
    const chartVisible = await chart.isVisible().catch(() => false);
    console.log(`   Analytics chart visible: ${chartVisible ? 'YES' : 'NO'}`);

    // 5. Check if hero content is at least VISIBLE (not display:none)
    const heroContent = hero.locator('h1, h2, [class*="headline"]').first();
    await expect(heroContent).toBeVisible();
    console.log(`   Hero headline visible: YES\n`);

    console.log('   ⚠️  Elements exist but have NO animation (all static)\n');
  });

});
