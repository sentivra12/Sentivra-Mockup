/**
 * Homepage Bug Diagnostics
 * 
 * Bug 1: Yellow DEMO box flashing
 * Bug 2: Blurred hero with reduced motion
 * Bug 3: Missing tables and console noise
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'screenshots-homepage-bugs';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function diagnose() {
  console.log('🔍 Starting Homepage Bug Diagnostics\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    // ========================================
    // BUG 1: DEMO Box Flashing
    // ========================================
    console.log('═══════════════════════════════════════');
    console.log('BUG 1: Yellow DEMO Box Investigation');
    console.log('═══════════════════════════════════════\n');
    
    const context1 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark'
    });
    
    const page1 = await context1.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page1.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    console.log('Loading homepage...');
    await page1.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Take multiple screenshots to capture flashing
    console.log('\n📸 Capturing DEMO box behavior:');
    await page1.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'demo-box-initial.png'),
      fullPage: true 
    });
    console.log('  ✓ Initial state captured');
    
    await page1.waitForTimeout(500);
    await page1.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'demo-box-500ms.png'),
      fullPage: true 
    });
    console.log('  ✓ 500ms state captured');
    
    await page1.waitForTimeout(1000);
    await page1.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'demo-box-1500ms.png'),
      fullPage: true 
    });
    console.log('  ✓ 1500ms state captured');
    
    // Check for DEMO box presence
    console.log('\n🔍 Checking for DEMO box:');
    const demoBox = await page1.locator('text=/DEMO|common\\.demoMode/i').first();
    const demoBoxExists = await demoBox.count() > 0;
    
    if (demoBoxExists) {
      console.log('  ⚠️  DEMO box found on page');
      const demoBoxText = await demoBox.textContent();
      console.log('  📝 Content:', demoBoxText);
      
      // Check if it's visible
      const isVisible = await demoBox.isVisible();
      console.log('  👁️  Visible:', isVisible);
      
      // Get computed styles
      try {
        const bbox = await demoBox.boundingBox();
        console.log('  📐 Position:', bbox);
      } catch (e) {
        console.log('  📐 Position: Could not determine');
      }
    } else {
      console.log('  ✅ No DEMO box found');
    }
    
    // Check translation key errors
    console.log('\n🔍 Translation key errors:');
    const translationErrors = consoleMessages.filter(msg => 
      msg.text.includes('Missing translation key') || 
      msg.text.includes('common.demoMode')
    );
    
    if (translationErrors.length > 0) {
      console.log(`  ⚠️  Found ${translationErrors.length} translation errors:`);
      translationErrors.forEach(err => {
        console.log(`     - ${err.text}`);
        if (err.location) {
          console.log(`       at ${err.location.url}:${err.location.lineNumber}`);
        }
      });
    } else {
      console.log('  ✅ No translation key errors');
    }
    
    // Check testimonials section
    console.log('\n🔍 Testimonials section state:');
    const testimonialsSection = await page1.locator('section:has-text("What Our Clients Say")').first();
    const hasTestimonials = await testimonialsSection.count() > 0;
    
    if (hasTestimonials) {
      console.log('  ✓ Testimonials section present');
      
      // Check for loading states
      const loadingIndicator = await page1.locator('[role="status"], .skeleton, .loading').count();
      console.log('  📊 Loading indicators:', loadingIndicator);
      
      // Check testimonial cards
      const testimonialCards = await page1.locator('[class*="testimonial"]').count();
      console.log('  🃏 Testimonial elements:', testimonialCards);
    }
    
    await context1.close();
    
    // ========================================
    // BUG 2: Blurred Hero with Reduced Motion
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('BUG 2: Blurred Hero Investigation');
    console.log('═══════════════════════════════════════\n');
    
    const pages = ['/', '/services', '/mockups', '/about'];
    const motionPrefs = [
      { name: 'reduce', value: 'reduce' },
      { name: 'no-preference', value: 'no-preference' }
    ];
    const themes = ['light', 'dark'];
    
    const results = [];
    
    for (const motionPref of motionPrefs) {
      console.log(`\n🎬 Testing with reducedMotion: '${motionPref.name}'`);
      console.log('─────────────────────────────────────\n');
      
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          colorScheme: theme,
          reducedMotion: motionPref.value
        });
        
        const page = await context.newPage();
        
        // Capture console for reduced motion messages
        const motionConsole = [];
        page.on('console', msg => {
          if (msg.text().includes('Reduced Motion')) {
            motionConsole.push(msg.text());
          }
        });
        
        for (const pagePath of pages) {
          console.log(`  Testing ${pagePath} (${theme})...`);
          
          await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000); // Wait for animations
          
          // Screenshot
          const filename = `hero-${pagePath.replace('/', 'home')}-${theme}-motion-${motionPref.name}.png`;
          await page.screenshot({ 
            path: path.join(SCREENSHOT_DIR, filename),
            fullPage: false // Just above fold
          });
          
          // Check hero elements
          const h1 = page.locator('h1').first();
          const paragraph = page.locator('h1 ~ p, h1 + p, [class*="hero"] p').first();
          const button = page.locator('a[class*="button"], button[class*="primary"]').first();
          
          const h1Exists = await h1.count() > 0;
          const pExists = await paragraph.count() > 0;
          const btnExists = await button.count() > 0;
          
          let h1Styles = null;
          let pStyles = null;
          let btnStyles = null;
          
          if (h1Exists) {
            h1Styles = await h1.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                opacity: computed.opacity,
                filter: computed.filter,
                transform: computed.transform
              };
            });
          }
          
          if (pExists) {
            pStyles = await paragraph.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                opacity: computed.opacity,
                filter: computed.filter,
                transform: computed.transform
              };
            });
          }
          
          if (btnExists) {
            btnStyles = await button.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                opacity: computed.opacity,
                filter: computed.filter,
                transform: computed.transform
              };
            });
          }
          
          const result = {
            page: pagePath,
            theme,
            motionPref: motionPref.name,
            h1: h1Styles,
            paragraph: pStyles,
            button: btnStyles,
            consoleMessages: [...motionConsole]
          };
          
          results.push(result);
          
          // Report issues
          if (h1Styles && parseFloat(h1Styles.opacity) < 1) {
            console.log(`    ⚠️  H1 opacity: ${h1Styles.opacity} (should be 1)`);
          }
          if (h1Styles && h1Styles.filter !== 'none') {
            console.log(`    ⚠️  H1 filter: ${h1Styles.filter} (should be none)`);
          }
          if (pStyles && parseFloat(pStyles.opacity) < 1) {
            console.log(`    ⚠️  Paragraph opacity: ${pStyles.opacity} (should be 1)`);
          }
          if (pStyles && pStyles.filter !== 'none') {
            console.log(`    ⚠️  Paragraph filter: ${pStyles.filter} (should be none)`);
          }
          
          // Check for white gradient strip
          const gradientStrip = await page.locator('[class*="gradient"], [class*="divider"]').count();
          if (gradientStrip > 0) {
            console.log(`    📊 Found ${gradientStrip} gradient/divider elements`);
          }
        }
        
        if (motionConsole.length > 0) {
          console.log(`  📝 Console: "${motionConsole[0]}"`);
        }
        
        await context.close();
      }
    }
    
    // Summary
    console.log('\n📊 SUMMARY - Hero Element Styles:');
    console.log('═══════════════════════════════════════\n');
    
    const issues = results.filter(r => 
      (r.h1 && parseFloat(r.h1.opacity) < 1) ||
      (r.h1 && r.h1.filter !== 'none') ||
      (r.paragraph && parseFloat(r.paragraph.opacity) < 1) ||
      (r.paragraph && r.paragraph.filter !== 'none')
    );
    
    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} pages with styling issues:\n`);
      issues.forEach(issue => {
        console.log(`${issue.page} (${issue.theme}, motion: ${issue.motionPref}):`);
        if (issue.h1) {
          console.log(`  H1: opacity=${issue.h1.opacity}, filter=${issue.h1.filter}`);
        }
        if (issue.paragraph) {
          console.log(`  P: opacity=${issue.paragraph.opacity}, filter=${issue.paragraph.filter}`);
        }
        console.log('');
      });
    } else {
      console.log('✅ All pages render with correct final states\n');
    }
    
    // ========================================
    // BUG 3: Missing Tables and Console Noise
    // ========================================
    console.log('═══════════════════════════════════════');
    console.log('BUG 3: Missing Tables Investigation');
    console.log('═══════════════════════════════════════\n');
    
    const context3 = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    
    const page3 = await context3.newPage();
    
    // Track all network requests
    const networkRequests = [];
    page3.on('response', async response => {
      const url = response.url();
      if (url.includes('supabase') || url.includes('rest')) {
        networkRequests.push({
          url,
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers()
        });
        
        if (response.status() === 404) {
          console.log(`  ⚠️  404: ${url}`);
          try {
            const body = await response.text();
            if (body.includes('PGRST')) {
              console.log(`     Error: ${body.substring(0, 200)}`);
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    });
    
    // Track console errors
    const consoleErrors = [];
    page3.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });
    
    console.log('Loading homepage and tracking requests...\n');
    await page3.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page3.waitForTimeout(3000);
    
    // Reload to check for repeated requests
    console.log('Reloading to check for duplicate requests...\n');
    const beforeReloadCount = networkRequests.length;
    await page3.reload({ waitUntil: 'networkidle' });
    await page3.waitForTimeout(2000);
    
    // Analysis
    console.log('📊 Network Request Analysis:');
    console.log('─────────────────────────────────────\n');
    
    const notFoundRequests = networkRequests.filter(r => r.status === 404);
    console.log(`Total requests: ${networkRequests.length}`);
    console.log(`404 errors: ${notFoundRequests.length}\n`);
    
    if (notFoundRequests.length > 0) {
      console.log('Missing tables/endpoints:');
      const uniqueUrls = [...new Set(notFoundRequests.map(r => {
        const url = new URL(r.url);
        return url.pathname;
      }))];
      
      uniqueUrls.forEach(url => {
        const count = notFoundRequests.filter(r => r.url.includes(url)).length;
        console.log(`  - ${url} (requested ${count} times)`);
      });
    }
    
    console.log('\n📊 Console Errors/Warnings:');
    console.log('─────────────────────────────────────\n');
    
    if (consoleErrors.length > 0) {
      const uniqueErrors = [...new Set(consoleErrors.map(e => e.text))];
      uniqueErrors.forEach(error => {
        const count = consoleErrors.filter(e => e.text === error).length;
        console.log(`  [${count}x] ${error.substring(0, 150)}`);
      });
    } else {
      console.log('  ✅ No console errors or warnings');
    }
    
    // Check for UNSAFE warnings
    const unsafeWarnings = consoleErrors.filter(e => 
      e.text.includes('UNSAFE_componentWillMount') ||
      e.text.includes('UNSAFE_')
    );
    
    if (unsafeWarnings.length > 0) {
      console.log('\n⚠️  UNSAFE component warnings:');
      unsafeWarnings.forEach(w => {
        console.log(`  ${w.text}`);
      });
    }
    
    await page3.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'homepage-console-state.png'),
      fullPage: true 
    });
    
    await context3.close();
    
    console.log('\n✅ Diagnostics complete!');
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}/\n`);
    
  } catch (error) {
    console.error('❌ Error during diagnostics:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

diagnose().catch(console.error);
