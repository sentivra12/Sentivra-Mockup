import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

console.log('\n🔍 DIAGNOSING DARK BOXES ON /services PAGE\n');

// Start preview server on port 4173
console.log('Starting preview server...');
const serverProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
  shell: true,
  stdio: 'pipe'
});

// Wait for server to be ready
await new Promise((resolve) => setTimeout(resolve, 5000));

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Test in light mode
    console.log('\n━━━━ TESTING LIGHT MODE (1440px) ━━━━\n');
    const contextLight = await browser.newContext({ 
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light'
    });
    const pageLight = await contextLight.newPage();
    
    await pageLight.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for services-specific content to load
    try {
      // Wait for service cards or category filter (services page only)
      await pageLight.waitForSelector('[class*="service-card"], [class*="category-filter"], .grid:has(a[href*="/services/"])', { timeout: 10000 });
    } catch (e) {
      console.warn('⚠️  Service cards not found, page may still be loading');
    }
    
    await pageLight.waitForTimeout(2000);
    
    // Verify we're on the correct page
    const currentURL = pageLight.url();
    const pageTitle = await pageLight.title();
    const h1Text = await pageLight.locator('h1').first().textContent().catch(() => '');
    const serviceCardCount = await pageLight.locator('a[href*="/services/"]').count();
    
    console.log('Current URL:', currentURL);
    console.log('Page title:', pageTitle);
    console.log('H1 text:', h1Text);
    console.log('Service card count:', serviceCardCount);
    
    if (h1Text.includes('We Build Software') || serviceCardCount === 0) {
      console.error('❌ ERROR: Screenshot shows homepage content, not /services!');
      console.error('   This means: lazy route loading, redirect, or shared hero content');
    } else {
      console.log('✅ Confirmed: /services page loaded correctly');
    }
    
    // Take screenshot
    await pageLight.screenshot({ 
      path: 'services-light-1440.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: services-light-1440.png');
    
    // Inspect "How We Work" heading
    console.log('\n📌 INSPECTING: "How We Work" heading');
    const howWeWorkH2 = await pageLight.locator('h2:has-text("How We Work")').first();
    if (await howWeWorkH2.count() > 0) {
      const analysis = await howWeWorkH2.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentComputed = window.getComputedStyle(parent);
        
        // Walk up ancestors
        const ancestors = [];
        let current = el;
        while (current && ancestors.length < 5) {
          const c = window.getComputedStyle(current);
          const before = window.getComputedStyle(current, '::before');
          const after = window.getComputedStyle(current, '::after');
          
          ancestors.push({
            tag: current.tagName,
            classes: Array.from(current.classList),
            styles: {
              backgroundColor: c.backgroundColor,
              backgroundImage: c.backgroundImage,
              mixBlendMode: c.mixBlendMode,
              filter: c.filter,
              backdropFilter: c.backdropFilter,
              opacity: c.opacity,
              colorScheme: c.colorScheme,
              boxShadow: c.boxShadow,
              outline: c.outline,
              border: c.border
            },
            before: {
              content: before.content,
              backgroundColor: before.backgroundColor,
              backgroundImage: before.backgroundImage,
              position: before.position,
              inset: `${before.top} ${before.right} ${before.bottom} ${before.left}`
            },
            after: {
              content: after.content,
              backgroundColor: after.backgroundColor,
              backgroundImage: after.backgroundImage,
              position: after.position,
              inset: `${after.top} ${after.right} ${after.bottom} ${after.left}`
            }
          });
          current = current.parentElement;
        }
        
        return {
          element: {
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 50),
            classes: Array.from(el.classList),
            styles: {
              backgroundColor: computed.backgroundColor,
              backgroundImage: computed.backgroundImage,
              color: computed.color,
              textShadow: computed.textShadow,
              webkitTextStroke: computed.webkitTextStroke,
              outline: computed.outline,
              boxShadow: computed.boxShadow,
              border: computed.border
            }
          },
          parent: {
            tag: parent.tagName,
            classes: Array.from(parent.classList),
            backgroundColor: parentComputed.backgroundColor,
            textShadow: parentComputed.textShadow,
            boxShadow: parentComputed.boxShadow
          },
          ancestors
        };
      });
      
      console.log('Element:', analysis.element.tag, analysis.element.classes.join(' '));
      console.log('  color:', analysis.element.styles.color);
      console.log('  backgroundColor:', analysis.element.styles.backgroundColor);
      console.log('  backgroundImage:', analysis.element.styles.backgroundImage);
      console.log('  textShadow:', analysis.element.styles.textShadow);
      console.log('  boxShadow:', analysis.element.styles.boxShadow);
      console.log('\nParent:', analysis.parent.tag, analysis.parent.classes.join(' '));
      console.log('  backgroundColor:', analysis.parent.backgroundColor);
      
      console.log('\nAncestor chain:');
      analysis.ancestors.forEach((anc, i) => {
        console.log(`  ${i}. <${anc.tag}> ${anc.classes.join(' ')}`);
        console.log(`     bg: ${anc.styles.backgroundColor}`);
        console.log(`     bgImage: ${anc.styles.backgroundImage}`);
        console.log(`     mixBlendMode: ${anc.styles.mixBlendMode}`);
        console.log(`     filter: ${anc.styles.filter}`);
        console.log(`     backdropFilter: ${anc.styles.backdropFilter}`);
        console.log(`     boxShadow: ${anc.styles.boxShadow}`);
        if (anc.before.content !== 'none') {
          console.log(`     ::before content: ${anc.before.content}`);
          console.log(`     ::before bg: ${anc.before.backgroundColor}`);
          console.log(`     ::before position: ${anc.before.position}`);
        }
        if (anc.after.content !== 'none') {
          console.log(`     ::after content: ${anc.after.content}`);
          console.log(`     ::after bg: ${anc.after.backgroundColor}`);
          console.log(`     ::after position: ${anc.after.position}`);
        }
      });
    }
    
    // Inspect service card title
    console.log('\n\n📌 INSPECTING: Service card title');
    const cardTitle = await pageLight.locator('.service-card h3, [class*="service"] h3').first();
    if (await cardTitle.count() > 0) {
      const analysis = await cardTitle.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentComputed = window.getComputedStyle(parent);
        
        // Walk up ancestors
        const ancestors = [];
        let current = el;
        while (current && ancestors.length < 5) {
          const c = window.getComputedStyle(current);
          const before = window.getComputedStyle(current, '::before');
          const after = window.getComputedStyle(current, '::after');
          
          ancestors.push({
            tag: current.tagName,
            classes: Array.from(current.classList),
            styles: {
              backgroundColor: c.backgroundColor,
              backgroundImage: c.backgroundImage,
              mixBlendMode: c.mixBlendMode,
              filter: c.filter,
              backdropFilter: c.backdropFilter,
              opacity: c.opacity,
              colorScheme: c.colorScheme,
              boxShadow: c.boxShadow
            },
            before: {
              content: before.content,
              backgroundColor: before.backgroundColor,
              position: before.position
            },
            after: {
              content: after.content,
              backgroundColor: after.backgroundColor,
              position: after.position
            }
          });
          current = current.parentElement;
        }
        
        return {
          element: {
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 50),
            classes: Array.from(el.classList),
            styles: {
              backgroundColor: computed.backgroundColor,
              backgroundImage: computed.backgroundImage,
              color: computed.color,
              textShadow: computed.textShadow
            }
          },
          parent: {
            tag: parent.tagName,
            classes: Array.from(parent.classList),
            backgroundColor: parentComputed.backgroundColor
          },
          ancestors
        };
      });
      
      console.log('Element:', analysis.element.tag, analysis.element.classes.join(' '));
      console.log('  text:', `"${analysis.element.text}"`);
      console.log('  color:', analysis.element.styles.color);
      console.log('  backgroundColor:', analysis.element.styles.backgroundColor);
      console.log('  backgroundImage:', analysis.element.styles.backgroundImage);
      
      console.log('\nAncestor chain:');
      analysis.ancestors.forEach((anc, i) => {
        console.log(`  ${i}. <${anc.tag}> ${anc.classes.join(' ')}`);
        console.log(`     bg: ${anc.styles.backgroundColor}`);
        console.log(`     bgImage: ${anc.styles.backgroundImage}`);
        if (anc.before.content !== 'none') {
          console.log(`     ::before content: ${anc.before.content}, bg: ${anc.before.backgroundColor}`);
        }
        if (anc.after.content !== 'none') {
          console.log(`     ::after content: ${anc.after.content}, bg: ${anc.after.backgroundColor}`);
        }
      });
    }
    
    await contextLight.close();
    
    // Test mobile light
    console.log('\n\n━━━━ TESTING LIGHT MODE (390px) ━━━━\n');
    const contextMobile = await browser.newContext({ 
      viewport: { width: 390, height: 844 },
      colorScheme: 'light'
    });
    const pageMobile = await contextMobile.newPage();
    
    await pageMobile.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await pageMobile.waitForTimeout(3000);
    
    await pageMobile.screenshot({ 
      path: 'services-light-390.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: services-light-390.png');
    
    await contextMobile.close();
    
    // Test dark mode
    console.log('\n━━━━ TESTING DARK MODE (1440px) ━━━━\n');
    const contextDark = await browser.newContext({ 
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark'
    });
    const pageDark = await contextDark.newPage();
    
    await pageDark.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await pageDark.waitForTimeout(3000);
    
    await pageDark.screenshot({ 
      path: 'services-dark-1440.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: services-dark-1440.png');
    
    await contextDark.close();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ DIAGNOSTIC COMPLETE');
    console.log('\nScreenshots saved:');
    console.log('  - services-light-1440.png');
    console.log('  - services-light-390.png');
    console.log('  - services-dark-1440.png');
    console.log('\nPlease inspect these images to confirm if dark boxes appear.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    serverProcess.kill();
    process.exit(0);
  }
})();
