/**
 * Test: HomeHeroMobile direction/alignment and particle animations
 * 1. Direction: AR page should mirror EN (logo right, menu left, text right-aligned)
 * 2. Particles: 24+ animated dots with visible drift motion
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test.describe('HomeHeroMobile: Direction & Particles', () => {
  
  test('BEFORE fix: direction issues and static particles', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone
    
    // Set language to Arabic via localStorage before loading
    await page.goto(BASE);
    await page.evaluate(() => {
      localStorage.setItem('language', 'ar');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-hero-mobile]', { timeout: 8000 });
    
    // Get hero direction
    const heroDir = await page.$eval('[data-hero-mobile]', el => el.getAttribute('dir'));
    const htmlDir = await page.$eval('html', el => el.getAttribute('dir'));
    console.log('AR hero dir:', heroDir, 'html dir:', htmlDir);
    
    // Check particle count
    const particleCount = await page.$$eval('[data-particle]', els => els.length);
    console.log('Particle count:', particleCount);
    
    // Check if particles are animated
    const firstThree = await page.$$eval('[data-particle]', els => 
      els.slice(0, 3).map(el => ({
        anim: window.getComputedStyle(el).animationName,
        state: window.getComputedStyle(el).animationPlayState,
        transform: window.getComputedStyle(el).transform,
      }))
    );
    console.log('First 3 particles animation:', firstThree);
    
    // Wait and sample transforms
    await page.waitForTimeout(1500);
    const afterDelay = await page.$$eval('[data-particle]', els => 
      els.slice(0, 3).map(el => window.getComputedStyle(el).transform)
    );
    console.log('Transforms after 1.5s:', afterDelay);
    
    // EXPECTED TO FAIL:
    // - heroDir should be 'rtl' ✓ (probably passing)
    // - particleCount should be >= 24 (probably 30 but static)
    // - particles should have animation-name NOT 'none'
    // - transforms should change over time
    
    expect(heroDir).toBe('rtl');
    expect(particleCount).toBeGreaterThanOrEqual(24);
    
    // These should FAIL before fix:
    const hasAnimation = firstThree.every(p => p.anim !== 'none');
    const isRunning = firstThree.every(p => p.state === 'running');
    const transformsChanged = firstThree.some((_, i) => 
      firstThree[i].transform !== afterDelay[i]
    );
    
    console.log('Has animation:', hasAnimation, 'Running:', isRunning, 'Transforms changed:', transformsChanged);
    
    // Document current failures
    if (!hasAnimation) console.log('❌ Particles have no animation-name');
    if (!isRunning) console.log('❌ Animations not running');
    if (!transformsChanged) console.log('❌ Transforms did not change (static)');
  });

  test('AFTER fix: proper direction and animated particles', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    // EN page (default)
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-hero-mobile]', { timeout: 8000 });
    
    const enDir = await page.$eval('[data-hero-mobile]', el => el.getAttribute('dir'));
    expect(enDir).toBe('ltr');
    
    // Set language to Arabic
    await page.evaluate(() => {
      localStorage.setItem('language', 'ar');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-hero-mobile]', { timeout: 8000 });
    
    const arDir = await page.$eval('[data-hero-mobile]', el => el.getAttribute('dir'));
    expect(arDir).toBe('rtl');
    
    // Particles: count >= 24
    const count = await page.$$eval('[data-particle]', els => els.length);
    expect(count).toBeGreaterThanOrEqual(24);
    console.log(`✓ Found ${count} particles`);
    
    // Particles: animated with drift
    // NOTE: drift animation is on the CONTAINER (layer), twinkle on individual dots
    const layers = await page.$$eval('.hhm-p-far, .hhm-p-mid, .hhm-p-near', els => 
      els.map(el => {
        const style = window.getComputedStyle(el);
        return {
          class: el.className,
          anim: style.animationName,
          state: style.animationPlayState,
          transform: style.transform,
        };
      })
    );
    
    // Check animation properties on layers
    layers.forEach((layer, i) => {
      expect(layer.anim).not.toBe('none');
      expect(layer.state).toBe('running');
      console.log(`Layer ${i} (${layer.class}): ${layer.anim}, ${layer.state}`);
    });
    
    // Sample layer transforms after 1.5s to verify drift motion
    const before = layers.map(l => l.transform);
    await page.waitForTimeout(1500);
    const after = await page.$$eval('.hhm-p-far, .hhm-p-mid, .hhm-p-near', els => 
      els.map(el => window.getComputedStyle(el).transform)
    );
    
    // At least one layer should have changed
    const changed = before.some((t, i) => t !== after[i]);
    expect(changed).toBe(true);
    console.log('✓ Layer transforms changed:', before[0], '→', after[0]);
    
    console.log('✅ All checks passed');
  });
});
