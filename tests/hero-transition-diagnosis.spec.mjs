/**
 * Diagnose HomeHeroMobile transition behavior with runtime evidence
 */
import { test } from '@playwright/test';

test.describe('HomeHeroMobile transition diagnosis', () => {
  test('no-preference: sample transition every 50ms', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Wait for first slide, then start sampling just before change
    await page.waitForTimeout(4000);
    
    const samples = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 1500) {
      const state = await page.evaluate(() => {
        const section = document.querySelector('[data-hero-mobile="true"]');
        if (!section) return { error: 'not found' };
        
        const slides = Array.from(section.querySelectorAll('.hhm-slide'));
        const activeSlide = section.querySelector('.hhm-slide.hhm-active');
        const activeIndex = activeSlide ? slides.indexOf(activeSlide) : -1;
        
        const slideStates = slides.map((slide, i) => {
          const style = getComputedStyle(slide);
          const kw = slide.querySelector('.hhm-kw');
          const kwStyle = kw ? getComputedStyle(kw) : null;
          return {
            index: i,
            isActive: slide.classList.contains('hhm-active'),
            opacity: style.opacity,
            transform: style.transform,
            transitionProperty: style.transitionProperty,
            transitionDuration: style.transitionDuration,
            kwOpacity: kwStyle?.opacity || 'n/a',
            kwTransform: kwStyle?.transform || 'n/a',
          };
        });
        
        const sparkle = section.querySelector('.hhm-spk-anim');
        const sparkleStyle = sparkle ? getComputedStyle(sparkle) : null;
        
        const activeBar = section.querySelector('.hhm-bar.hhm-fill');
        const barStyle = activeBar ? getComputedStyle(activeBar) : null;
        
        const particle = section.querySelector('.hhm-p-far');
        const particleStyle = particle ? getComputedStyle(particle) : null;
        
        return {
          time: Date.now(),
          activeIndex,
          slides: slideStates,
          sparkle: sparkleStyle ? {
            animationName: sparkleStyle.animationName,
            animationPlayState: sparkleStyle.animationPlayState,
            transform: sparkleStyle.transform,
          } : null,
          bar: barStyle ? {
            animationName: barStyle.animationName,
            animationPlayState: barStyle.animationPlayState,
            transform: barStyle.transform,
          } : null,
          particle: particleStyle ? {
            animationName: particleStyle.animationName,
            animationPlayState: particleStyle.animationPlayState,
            transform: particleStyle.transform,
          } : null,
          motionAttr: section.getAttribute('data-motion'),
        };
      });
      
      samples.push(state);
      await page.waitForTimeout(50);
    }
    
    console.log('\n=== NO-PREFERENCE MODE (1.5s around slide change) ===\n');
    console.log('Time | Idx | Active.opacity | Active.transform | Leaving.opacity | Leaving.transform | Sparkle.anim | Bar.transform | Particle.transform | motion');
    console.log('-----|-----|----------------|------------------|-----------------|-------------------|--------------|---------------|--------------------|---------');
    
    samples.forEach((s, i) => {
      const elapsed = (i * 50);
      const active = s.slides?.find(sl => sl.isActive);
      const leaving = s.slides?.find(sl => !sl.isActive && sl.opacity !== '0');
      console.log(
        `${String(elapsed).padStart(4)}ms | ` +
        `${String(s.activeIndex).padStart(3)} | ` +
        `${(active?.opacity || 'n/a').padEnd(14)} | ` +
        `${(active?.transform?.slice(0, 30) || 'n/a').padEnd(16)} | ` +
        `${(leaving?.opacity || 'n/a').padEnd(15)} | ` +
        `${(leaving?.transform?.slice(0, 30) || 'n/a').padEnd(17)} | ` +
        `${(s.sparkle?.animationName || 'none').padEnd(12)} | ` +
        `${(s.bar?.transform?.slice(0, 20) || 'n/a').padEnd(13)} | ` +
        `${(s.particle?.transform?.slice(0, 30) || 'n/a').padEnd(18)} | ` +
        `${s.motionAttr || 'n/a'}`
      );
    });
  });

  test('reduce mode: sample transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.waitForTimeout(5500);
    
    const samples = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 1000) {
      const state = await page.evaluate(() => {
        const section = document.querySelector('[data-hero-mobile="true"]');
        if (!section) return { error: 'not found' };
        
        const slides = Array.from(section.querySelectorAll('.hhm-slide'));
        const activeIndex = slides.findIndex(s => s.classList.contains('hhm-active'));
        
        const active = slides[activeIndex];
        const activeStyle = active ? getComputedStyle(active) : null;
        
        const kw = active?.querySelector('.hhm-kw');
        const kwStyle = kw ? getComputedStyle(kw) : null;
        
        return {
          activeIndex,
          activeOpacity: activeStyle?.opacity || 'n/a',
          activeTransform: activeStyle?.transform || 'n/a',
          activeTransition: activeStyle?.transitionProperty || 'n/a',
          kwOpacity: kwStyle?.opacity || 'n/a',
          kwTransform: kwStyle?.transform || 'n/a',
          kwTransitionDelay: kwStyle?.transitionDelay || 'n/a',
          motionAttr: section.getAttribute('data-motion'),
        };
      });
      
      samples.push(state);
      await page.waitForTimeout(50);
    }
    
    console.log('\n=== REDUCED-MOTION MODE ===\n');
    console.log('Idx | Active.opacity | Active.transform | Keyword.opacity | Keyword.delay | motion');
    console.log('----|----------------|------------------|-----------------|---------------|-------');
    
    samples.forEach((s) => {
      console.log(
        `${String(s.activeIndex).padStart(3)} | ` +
        `${String(s.activeOpacity).padEnd(14)} | ` +
        `${String(s.activeTransform).slice(0, 20).padEnd(16)} | ` +
        `${String(s.kwOpacity).padEnd(15)} | ` +
        `${String(s.kwTransitionDelay).padEnd(13)} | ` +
        `${s.motionAttr || 'n/a'}`
      );
    });
  });
});
