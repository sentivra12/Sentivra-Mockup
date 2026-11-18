/**
 * Diagnose HomeHeroMobile autoplay & animation failures with RUNTIME logs
 */
import { test, expect } from '@playwright/test';

test.describe('HomeHeroMobile autoplay diagnosis', () => {
  test('no-preference: log autoplay & animation state every 500ms for 12s', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Sample state every 500ms for 12s
    const samples = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 12000) {
      const state = await page.evaluate(() => {
        const section = document.querySelector('[data-hero-mobile="true"]');
        if (!section) return { error: 'section not found' };
        
        const activeSlide = section.querySelector('.hhm-slide.hhm-active');
        const activeIndex = activeSlide ? 
          Array.from(section.querySelectorAll('.hhm-slide')).indexOf(activeSlide) : -1;
        
        // Active progress bar
        const activeBars = section.querySelectorAll('.hhm-bar.hhm-fill');
        const activeBar = activeBars[0];
        const barStyle = activeBar ? getComputedStyle(activeBar) : null;
        
        // Sparkle
        const sparkle = section.querySelector('.hhm-spk-anim');
        const sparkleStyle = sparkle ? getComputedStyle(sparkle) : null;
        
        // Particle layer
        const particle = section.querySelector('.hhm-p-far');
        const particleStyle = particle ? getComputedStyle(particle) : null;
        
        // Motion state
        const motionAttr = section.getAttribute('data-motion');
        const liveAttr = section.getAttribute('aria-live');
        
        return {
          time: Date.now(),
          activeIndex,
          progressBarCount: activeBars.length,
          bar: barStyle ? {
            animationName: barStyle.animationName,
            animationPlayState: barStyle.animationPlayState,
            animationDuration: barStyle.animationDuration,
            transform: barStyle.transform,
          } : null,
          sparkle: sparkleStyle ? {
            animationName: sparkleStyle.animationName,
            animationPlayState: sparkleStyle.animationPlayState,
            animationDuration: sparkleStyle.animationDuration,
          } : null,
          particle: particleStyle ? {
            animationName: particleStyle.animationName,
            animationPlayState: particleStyle.animationPlayState,
            animationDuration: particleStyle.animationDuration,
          } : null,
          motionAttr,
          liveAttr,
        };
      });
      
      samples.push(state);
      await page.waitForTimeout(500);
    }
    
    // Print table
    console.log('\n=== NO-PREFERENCE MODE (12s sampling) ===\n');
    console.log('Time | Idx | Bar.anim | Bar.state | Bar.dur | Sparkle.anim | Particle.anim | Particle.state | motion | live');
    console.log('-----|-----|----------|-----------|---------|--------------|---------------|----------------|--------|------');
    
    samples.forEach((s, i) => {
      const elapsed = ((i * 500) / 1000).toFixed(1);
      console.log(
        `${elapsed.padStart(4)}s | ` +
        `${String(s.activeIndex).padStart(3)} | ` +
        `${(s.bar?.animationName || 'none').padEnd(8)} | ` +
        `${(s.bar?.animationPlayState || 'n/a').padEnd(9)} | ` +
        `${(s.bar?.animationDuration || 'n/a').padEnd(7)} | ` +
        `${(s.sparkle?.animationName || 'none').padEnd(12)} | ` +
        `${(s.particle?.animationName || 'none').padEnd(13)} | ` +
        `${(s.particle?.animationPlayState || 'n/a').padEnd(14)} | ` +
        `${(s.motionAttr || 'n/a').padEnd(6)} | ` +
        `${s.liveAttr || 'n/a'}`
      );
    });
    
    // Check if index changed
    const indices = samples.map(s => s.activeIndex);
    const uniqueIndices = [...new Set(indices)];
    console.log(`\nUnique slide indices seen: [${uniqueIndices.join(', ')}]`);
    console.log(`Autoplay working: ${uniqueIndices.length > 1 ? 'YES' : 'NO'}`);
  });

  test('reduce mode: log autoplay state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(1000);
    
    const state = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-mobile="true"]');
      if (!section) return { error: 'section not found' };
      
      const motionAttr = section.getAttribute('data-motion');
      const liveAttr = section.getAttribute('aria-live');
      
      return { motionAttr, liveAttr };
    });
    
    console.log('\n=== REDUCED-MOTION MODE ===');
    console.log('data-motion:', state.motionAttr);
    console.log('aria-live:', state.liveAttr);
  });

  test('calm mode ON: log autoplay state', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Set calm mode in localStorage
    await page.evaluate(() => {
      localStorage.setItem('sentivra-motion-preference', 'reduced');
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    const state = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-mobile="true"]');
      if (!section) return { error: 'section not found' };
      
      const motionAttr = section.getAttribute('data-motion');
      const liveAttr = section.getAttribute('aria-live');
      
      return { motionAttr, liveAttr };
    });
    
    console.log('\n=== CALM MODE (user preference) ===');
    console.log('data-motion:', state.motionAttr);
    console.log('aria-live:', state.liveAttr);
  });
});
