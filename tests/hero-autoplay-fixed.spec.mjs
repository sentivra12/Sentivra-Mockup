/**
 * Prove HomeHeroMobile autoplay works after fix
 */
import { test, expect } from '@playwright/test';

test.describe('HomeHeroMobile autoplay - FIXED', () => {
  test('BEFORE fix would FAIL: autoplay advances within 6s', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    const initialIndex = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-mobile="true"]');
      const activeSlide = section?.querySelector('.hhm-slide.hhm-active');
      return activeSlide ? Array.from(section.querySelectorAll('.hhm-slide')).indexOf(activeSlide) : -1;
    });
    
    // Wait 6s and check index changed
    await page.waitForTimeout(6000);
    
    const newIndex = await page.evaluate(() => {
      const section = document.querySelector('[data-hero-mobile="true"]');
      const activeSlide = section?.querySelector('.hhm-slide.hhm-active');
      return activeSlide ? Array.from(section.querySelectorAll('.hhm-slide')).indexOf(activeSlide) : -1;
    });
    
    console.log(`Index change: ${initialIndex} → ${newIndex}`);
    expect(newIndex).not.toBe(initialIndex);
    expect(newIndex).toBeGreaterThan(-1);
  });

  test('progress bar scaleX increases over time', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(500);
    
    const scale1 = await page.evaluate(() => {
      const bar = document.querySelector('.hhm-bar.hhm-fill');
      if (!bar) return null;
      const matrix = getComputedStyle(bar).transform;
      if (matrix === 'none') return 1;
      const values = matrix.match(/matrix\(([^)]+)\)/)?.[1].split(', ');
      return values ? parseFloat(values[0]) : 1;
    });
    
    await page.waitForTimeout(1000);
    
    const scale2 = await page.evaluate(() => {
      const bar = document.querySelector('.hhm-bar.hhm-fill');
      if (!bar) return null;
      const matrix = getComputedStyle(bar).transform;
      if (matrix === 'none') return 1;
      const values = matrix.match(/matrix\(([^)]+)\)/)?.[1].split(', ');
      return values ? parseFloat(values[0]) : 1;
    });
    
    console.log(`Progress bar scaleX: ${scale1?.toFixed(3)} → ${scale2?.toFixed(3)}`);
    expect(scale2).toBeGreaterThan(scale1);
  });

  test('particles have running animation-play-state', async ({ page }) => {
    // Ensure full motion mode
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('sentivra-motion-preference', 'full');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(500);
    
    const state = await page.evaluate(() => {
      const particle = document.querySelector('.hhm-p-far');
      const dataMotion = document.documentElement.getAttribute('data-motion');
      if (!particle) return { error: 'particle not found', dataMotion };
      const style = getComputedStyle(particle);
      return {
        animationName: style.animationName,
        animationPlayState: style.animationPlayState,
        dataMotion,
      };
    });
    
    console.log('Particle state:', state);
    expect(state?.animationName).toBe('hhm-far');
    expect(state?.animationPlayState).toBe('running');
  });
});
