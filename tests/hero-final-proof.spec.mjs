/**
 * Final proof: both full and calm modes with frame extraction
 */
import { test } from '@playwright/test';

test.describe('HomeHeroMobile FINAL PROOF (production)', () => {
  test('FULL mode: extract 10 frames 60ms apart', async ({ page, context }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('sentivra-motion-preference', 'full');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Check data-hhm-motion attribute
    const motionAttr = await page.evaluate(() => {
      return document.querySelector('[data-hero-mobile]')?.getAttribute('data-hhm-motion');
    });
    console.log(`\n=== FULL MODE ===`);
    console.log(`data-hhm-motion: ${motionAttr}`);
    
    // Wait until just before slide change
    await page.waitForTimeout(3900);
    
    // Extract 10 frames 60ms apart (600ms total)
    for (let i = 0; i < 10; i++) {
      await page.screenshot({ path: `test-results/full-frame-${i}.png` });
      
      // Sample opacity of active/leaving slides
      const state = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.hhm-slide'));
        const active = slides.find(s => s.classList.contains('hhm-active'));
        const leaving = slides.find(s => s.classList.contains('hhm-leaving'));
        return {
          activeIdx: slides.indexOf(active),
          activeOp: active ? getComputedStyle(active).opacity : 'n/a',
          leavingIdx: leaving ? slides.indexOf(leaving) : -1,
          leavingOp: leaving ? getComputedStyle(leaving).opacity : 'n/a',
        };
      });
      
      console.log(`Frame ${i} (${i*60}ms): active=${state.activeIdx} op=${state.activeOp} | leaving=${state.leavingIdx} op=${state.leavingOp}`);
      
      await page.waitForTimeout(60);
    }
    
    // Sparkle pixel diff proof
    await page.waitForTimeout(400);
    await page.screenshot({
      path: 'test-results/sparkle-full-1.png',
      clip: { x: 120, y: 180, width: 150, height: 150 }
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'test-results/sparkle-full-2.png',
      clip: { x: 120, y: 180, width: 150, height: 150 }
    });
    
    console.log('Sparkle crops: test-results/sparkle-full-1.png & sparkle-full-2.png');
  });

  test('CALM mode: extract 10 frames 60ms apart', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Check data-hhm-motion attribute
    const motionAttr = await page.evaluate(() => {
      return document.querySelector('[data-hero-mobile]')?.getAttribute('data-hhm-motion');
    });
    console.log(`\n=== CALM MODE ===`);
    console.log(`data-hhm-motion: ${motionAttr}`);
    
    // Check particles are visible
    const particlesVisible = await page.evaluate(() => {
      const particles = document.querySelectorAll('[data-particle]');
      if (particles.length === 0) return false;
      const firstParticle = particles[0];
      const style = getComputedStyle(firstParticle);
      return style.opacity !== '0' && style.display !== 'none';
    });
    console.log(`Particles visible: ${particlesVisible}`);
    
    // Wait until just before slide change
    await page.waitForTimeout(5500);
    
    // Extract 10 frames 60ms apart
    for (let i = 0; i < 10; i++) {
      await page.screenshot({ path: `test-results/calm-frame-${i}.png` });
      
      const state = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.hhm-slide'));
        const active = slides.find(s => s.classList.contains('hhm-active'));
        const leaving = slides.find(s => s.classList.contains('hhm-leaving'));
        return {
          activeIdx: slides.indexOf(active),
          activeOp: active ? getComputedStyle(active).opacity : 'n/a',
          leavingIdx: leaving ? slides.indexOf(leaving) : -1,
          leavingOp: leaving ? getComputedStyle(leaving).opacity : 'n/a',
        };
      });
      
      console.log(`Frame ${i} (${i*60}ms): active=${state.activeIdx} op=${state.activeOp} | leaving=${state.leavingIdx} op=${state.leavingOp}`);
      
      await page.waitForTimeout(60);
    }
    
    // Sparkle pixel diff proof (should pulse in calm mode)
    await page.waitForTimeout(400);
    await page.screenshot({
      path: 'test-results/sparkle-calm-1.png',
      clip: { x: 120, y: 180, width: 150, height: 150 }
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'test-results/sparkle-calm-2.png',
      clip: { x: 120, y: 180, width: 150, height: 150 }
    });
    
    console.log('Sparkle crops: test-results/sparkle-calm-1.png & sparkle-calm-2.png');
  });
});
