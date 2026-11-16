/**
 * Diagnostic test to find real CLS sources and jank causes
 */
import { test, expect } from '@playwright/test';

test.describe('Mockups Diagnostics', () => {
  test('Find CLS sources and jank causes', async ({ page }) => {
    // Enable detailed logging
    const shifts = [];
    const longTasks = [];
    
    // Track layout shifts
    await page.addInitScript(() => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          
          window.__clsShifts = window.__clsShifts || [];
          window.__clsShifts.push({
            value: entry.value,
            sources: entry.sources?.map(s => ({
              node: s.node?.tagName + (s.node?.className ? '.' + s.node.className.split(' ')[0] : ''),
              previousRect: s.previousRect,
              currentRect: s.currentRect,
            })) || []
          });
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      
      // Track long tasks
      const taskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            window.__longTasks = window.__longTasks || [];
            window.__longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      });
      taskObserver.observe({ type: 'longtask', buffered: true });
    });
    
    // Navigate to page
    await page.goto('http://localhost:4173/mockups', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for mockups to load
    await page.waitForSelector('article', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Get all image elements and their attributes
    const imageData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.slice(0, 10).map((img, i) => ({
        index: i + 1,
        src: img.src || '(empty)',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.clientWidth,
        displayHeight: img.clientHeight,
        loading: img.loading,
        fetchpriority: img.getAttribute('fetchpriority') || 'auto',
        hasError: img.complete && img.naturalWidth === 0,
      }));
    });
    
    // Get CLS shifts
    const clsShifts = await page.evaluate(() => window.__clsShifts || []);
    
    // Get long tasks
    const tasks = await page.evaluate(() => window.__longTasks || []);
    
    // Count framer-motion components
    const motionComponents = await page.evaluate(() => {
      return document.querySelectorAll('[class*="framer-"], [data-framer-name]').length;
    });
    
    // Count heavy CSS effects
    const heavyEffects = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return {
        backdropFilters: all.filter(el => {
          const style = window.getComputedStyle(el);
          return style.backdropFilter && style.backdropFilter !== 'none';
        }).length,
        blurs: all.filter(el => {
          const style = window.getComputedStyle(el);
          return style.filter && style.filter.includes('blur');
        }).length,
        shadows: all.filter(el => {
          const style = window.getComputedStyle(el);
          const shadow = style.boxShadow;
          return shadow && shadow !== 'none' && shadow.split(',').length > 2;
        }).length
      };
    });
    
    // Scroll test: measure performance during scroll
    const scrollMetrics = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        let frameCount = 0;
        let slowFrames = 0;
        let lastFrameTime = startTime;
        
        const measureFrame = () => {
          const now = performance.now();
          const delta = now - lastFrameTime;
          frameCount++;
          if (delta > 16.67) slowFrames++; // Dropped frame (>60fps)
          lastFrameTime = now;
          
          if (now - startTime < 2000) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve({
              totalFrames: frameCount,
              droppedFrames: slowFrames,
              dropRate: (slowFrames / frameCount * 100).toFixed(1) + '%'
            });
          }
        };
        
        requestAnimationFrame(measureFrame);
        
        // Trigger scroll
        window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
      });
    });
    
    // Print results
    console.log('\n' + '='.repeat(80));
    console.log('MOCKUPS DIAGNOSTICS');
    console.log('='.repeat(80));
    
    console.log('\n📊 IMAGE DATA:');
    imageData.forEach(img => {
      console.log(`  ${img.index}. ${img.naturalWidth}x${img.naturalHeight} → ${img.displayWidth}x${img.displayHeight}`);
      console.log(`     src: ${img.src.substring(0, 60)}...`);
      console.log(`     loading="${img.loading}" fetchpriority="${img.fetchpriority}"${img.hasError ? ' ❌ ERROR' : ''}`);
    });
    
    console.log('\n📐 LAYOUT SHIFTS (CLS sources):');
    if (clsShifts.length === 0) {
      console.log('  ✅ No layout shifts detected');
    } else {
      clsShifts.sort((a, b) => b.value - a.value).slice(0, 5).forEach((shift, i) => {
        console.log(`  ${i + 1}. Shift value: ${shift.value.toFixed(4)}`);
        shift.sources.slice(0, 2).forEach(source => {
          console.log(`     Element: ${source.node}`);
          console.log(`     Previous: ${JSON.stringify(source.previousRect)}`);
          console.log(`     Current: ${JSON.stringify(source.currentRect)}`);
        });
      });
    }
    
    console.log('\n⏱️  LONG TASKS (>50ms):');
    if (tasks.length === 0) {
      console.log('  ✅ No long tasks detected');
    } else {
      console.log(`  Total: ${tasks.length}, Longest: ${Math.max(...tasks.map(t => t.duration)).toFixed(0)}ms`);
      tasks.sort((a, b) => b.duration - a.duration).slice(0, 3).forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.duration.toFixed(0)}ms at ${task.startTime.toFixed(0)}ms - ${task.name}`);
      });
    }
    
    console.log('\n🎨 HEAVY EFFECTS:');
    console.log(`  Framer Motion components: ${motionComponents}`);
    console.log(`  backdrop-filter elements: ${heavyEffects.backdropFilters}`);
    console.log(`  blur() filters: ${heavyEffects.blurs}`);
    console.log(`  Multi-layer shadows: ${heavyEffects.shadows}`);
    
    console.log('\n🎬 SCROLL PERFORMANCE:');
    console.log(`  Total frames: ${scrollMetrics.totalFrames}`);
    console.log(`  Dropped frames: ${scrollMetrics.droppedFrames}`);
    console.log(`  Drop rate: ${scrollMetrics.dropRate}`);
    
    console.log('\n' + '='.repeat(80));
  });
});
