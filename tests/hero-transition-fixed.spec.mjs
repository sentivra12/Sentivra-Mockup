/**
 * Prove HomeHeroMobile transitions and motion FIXED
 */
import { test, expect } from '@playwright/test';

test.describe('HomeHeroMobile transitions - FIXED', () => {
  test('BEFORE FAIL → AFTER PASS: intermediate opacity/transform values', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(4000);
    
    const samples = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 800) {
      const state = await page.evaluate(() => {
        const section = document.querySelector('[data-hero-mobile="true"]');
        const slides = Array.from(section.querySelectorAll('.hhm-slide'));
        const active = slides.find(s => s.classList.contains('hhm-active'));
        const leaving = slides.find(s => s.classList.contains('hhm-leaving'));
        
        return {
          time: Date.now(),
          activeIndex: slides.indexOf(active),
          activeOpacity: active ? getComputedStyle(active).opacity : null,
          activeTransform: active ? getComputedStyle(active).transform : null,
          leavingIndex: leaving ? slides.indexOf(leaving) : null,
          leavingOpacity: leaving ? getComputedStyle(leaving).opacity : null,
          leavingTransform: leaving ? getComputedStyle(leaving).transform : null,
        };
      });
      
      samples.push(state);
      await page.waitForTimeout(80);
    }
    
    console.log('\n=== TRANSITION SAMPLES (every 80ms) ===');
    samples.forEach((s, i) => {
      console.log(`${i*80}ms: active=${s.activeIndex} op=${s.activeOpacity} | leaving=${s.leavingIndex} op=${s.leavingOpacity}`);
    });
    
    // Check for intermediate values (not instant 0→1)
    const activeOpacities = samples.map(s => parseFloat(s.activeOpacity)).filter(o => !isNaN(o));
    const leavingOpacities = samples.filter(s => s.leavingOpacity).map(s => parseFloat(s.leavingOpacity));
    
    const hasActiveTransition = activeOpacities.some(o => o > 0 && o < 1);
    const hasLeavingTransition = leavingOpacities.some(o => o > 0 && o < 1);
    
    console.log(`\nActive intermediate opacity: ${hasActiveTransition}`);
    console.log(`Leaving intermediate opacity: ${hasLeavingTransition}`);
    
    expect(hasActiveTransition || hasLeavingTransition).toBe(true);
  });

  test('progress bar scaleX increases over time', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(500);
    
    const scale1 = await page.evaluate(() => {
      const bar = document.querySelector('.hhm-bar.hhm-fill-full');
      if (!bar) return null;
      const matrix = getComputedStyle(bar).transform;
      if (matrix === 'none') return 1;
      const values = matrix.match(/matrix\(([^)]+)\)/)?.[1].split(', ');
      return values ? parseFloat(values[0]) : 1;
    });
    
    await page.waitForTimeout(1000);
    
    const scale2 = await page.evaluate(() => {
      const bar = document.querySelector('.hhm-bar.hhm-fill-full');
      if (!bar) return null;
      const matrix = getComputedStyle(bar).transform;
      if (matrix === 'none') return 1;
      const values = matrix.match(/matrix\(([^)]+)\)/)?.[1].split(', ');
      return values ? parseFloat(values[0]) : 1;
    });
    
    console.log(`Progress bar scaleX: ${scale1?.toFixed(3)} → ${scale2?.toFixed(3)}`);
    expect(scale2).toBeGreaterThan(scale1);
  });

  test('particle transform values change over 2s', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('sentivra-motion-preference', 'full');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(500);
    
    const transform1 = await page.evaluate(() => {
      const particle = document.querySelector('.hhm-p-far');
      return particle ? getComputedStyle(particle).transform : null;
    });
    
    await page.waitForTimeout(2000);
    
    const transform2 = await page.evaluate(() => {
      const particle = document.querySelector('.hhm-p-far');
      return particle ? getComputedStyle(particle).transform : null;
    });
    
    console.log(`Particle transform 1: ${transform1}`);
    console.log(`Particle transform 2: ${transform2}`);
    
    expect(transform1).not.toBe(transform2);
    expect(transform1).not.toBe('none');
    expect(transform2).not.toBe('none');
  });
});
