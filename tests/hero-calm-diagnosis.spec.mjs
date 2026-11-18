/**
 * Diagnose calm mode transitions with runtime sampling
 */
import { test } from '@playwright/test';

test.describe('Calm mode transition diagnosis', () => {
  test('reducedMotion reduce: sample transition every 80ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(5500);
    
    const samples = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 800) {
      const state = await page.evaluate(() => {
        const section = document.querySelector('[data-hero-mobile="true"]');
        const slides = Array.from(section.querySelectorAll('.hhm-slide'));
        const active = slides.find(s => s.classList.contains('hhm-active'));
        const leaving = slides.find(s => s.classList.contains('hhm-leaving'));
        
        const activeStyle = active ? getComputedStyle(active) : null;
        const leavingStyle = leaving ? getComputedStyle(leaving) : null;
        
        return {
          activeIndex: slides.indexOf(active),
          activeOpacity: activeStyle?.opacity || 'n/a',
          activeTransition: activeStyle?.transition || 'n/a',
          leavingIndex: leaving ? slides.indexOf(leaving) : -1,
          leavingOpacity: leavingStyle?.opacity || 'n/a',
          leavingTransition: leavingStyle?.transition || 'n/a',
          motionAttr: section.getAttribute('data-motion'),
        };
      });
      
      samples.push(state);
      await page.waitForTimeout(80);
    }
    
    console.log('\n=== REDUCED-MOTION MODE (80ms sampling) ===');
    console.log('Time | Idx | Active.opacity | Leaving.opacity | motion | Active.transition');
    console.log('-----|-----|----------------|-----------------|--------|------------------');
    
    samples.forEach((s, i) => {
      console.log(
        `${String(i*80).padStart(4)}ms | ` +
        `${String(s.activeIndex).padStart(3)} | ` +
        `${String(s.activeOpacity).padEnd(14)} | ` +
        `${String(s.leavingOpacity).padEnd(15)} | ` +
        `${String(s.motionAttr).padEnd(6)} | ` +
        `${s.activeTransition.slice(0, 50)}`
      );
    });
  });

  test('forced calm: sample transition every 80ms', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('sentivra-motion-preference', 'reduced');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(5500);
    
    const samples = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 800) {
      const state = await page.evaluate(() => {
        const section = document.querySelector('[data-hero-mobile="true"]');
        const slides = Array.from(section.querySelectorAll('.hhm-slide'));
        const active = slides.find(s => s.classList.contains('hhm-active'));
        const leaving = slides.find(s => s.classList.contains('hhm-leaving'));
        
        const activeStyle = active ? getComputedStyle(active) : null;
        const leavingStyle = leaving ? getComputedStyle(leaving) : null;
        
        return {
          activeIndex: slides.indexOf(active),
          activeOpacity: activeStyle?.opacity || 'n/a',
          activeTransition: activeStyle?.transition || 'n/a',
          leavingIndex: leaving ? slides.indexOf(leaving) : -1,
          leavingOpacity: leavingStyle?.opacity || 'n/a',
          motionAttr: section.getAttribute('data-motion'),
        };
      });
      
      samples.push(state);
      await page.waitForTimeout(80);
    }
    
    console.log('\n=== FORCED CALM MODE (80ms sampling) ===');
    console.log('Time | Idx | Active.opacity | Leaving.opacity | motion | Active.transition');
    console.log('-----|-----|----------------|-----------------|--------|------------------');
    
    samples.forEach((s, i) => {
      console.log(
        `${String(i*80).padStart(4)}ms | ` +
        `${String(s.activeIndex).padStart(3)} | ` +
        `${String(s.activeOpacity).padEnd(14)} | ` +
        `${String(s.leavingOpacity).padEnd(15)} | ` +
        `${String(s.motionAttr).padEnd(6)} | ` +
        `${s.activeTransition.slice(0, 50)}`
      );
    });
  });
});
