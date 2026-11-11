import { chromium } from 'playwright';
import { spawn } from 'child_process';

console.log('\n🔍 COMPLETE /services DIAGNOSIS\n');

// Start preview server
const serverProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
  shell: true,
  stdio: 'pipe'
});

await new Promise((resolve) => setTimeout(resolve, 5000));

(async () => {
  const browser = await chromium.launch({ headless: false });
  
  try {
    // Test light mode with system preference
    console.log('━━━━ TESTING: Light mode, saved theme=light ━━━━\n');
    const context1 = await browser.newContext({ 
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light'
    });
    const page1 = await context1.newPage();
    
    // Set theme to light in localStorage
    await page1.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page1.evaluate(() => {
      localStorage.setItem('sentivra-theme', 'light');
    });
    
    await page1.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for actual services content (service cards in bento grid)
    await page1.waitForTimeout(4000);
    
    // Check HTML class
    const htmlClass = await page1.evaluate(() => document.documentElement.className);
    const dataTheme = await page1.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const h1Text = await page1.locator('h1').first().textContent();
    
    console.log('HTML class:', htmlClass);
    console.log('data-theme:', dataTheme);
    console.log('H1:', h1Text);
    
    // Take screenshot
    await page1.screenshot({ 
      path: 'services-light-saved-light.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: services-light-saved-light.png\n');
    
    // Inspect service card title for dark boxes
    console.log('📌 Inspecting service card for dark backgrounds:\n');
    const serviceCard = page1.locator('[class*="service"] h3, .grid a h3').first();
    if (await serviceCard.count() > 0) {
      const analysis = await serviceCard.evaluate(el => {
        const computed = window.getComputedStyle(el);
        
        // Walk up ancestors looking for dark backgrounds
        const ancestors = [];
        let current = el;
        while (current && ancestors.length < 10) {
          const c = window.getComputedStyle(current);
          ancestors.push({
            tag: current.tagName,
            classes: Array.from(current.classList),
            bgColor: c.backgroundColor,
            bgImage: c.backgroundImage,
            color: c.color
          });
          current = current.parentElement;
        }
        
        return {
          elementText: el.textContent.trim(),
          elementBg: computed.backgroundColor,
          elementColor: computed.color,
          ancestors
        };
      });
      
      console.log('Service card title:', `"${analysis.elementText}"`);
      console.log('  backgroundColor:', analysis.elementBg);
      console.log('  color:', analysis.elementColor);
      console.log('\nAncestor chain (looking for dark backgrounds):');
      analysis.ancestors.forEach((anc, i) => {
        const hasDarkBg = anc.bgColor.includes('rgb') && 
          !anc.bgColor.includes('rgba(0, 0, 0, 0)') &&
          !anc.bgColor.includes('255, 255, 255');
        const marker = hasDarkBg ? ' ⚠️ DARK BG!' : '';
        console.log(`  ${i}. <${anc.tag}> ${anc.classes.join(' ')}${marker}`);
        if (hasDarkBg) {
          console.log(`     ➤ backgroundColor: ${anc.bgColor}`);
        }
      });
    }
    
    // Check "How We Work" section
    console.log('\n📌 Inspecting "How We Work" section:\n');
    const howWeWorkSection = page1.locator('section:has-text("How We Work"), section:has-text("Design & Develop")').first();
    if (await howWeWorkSection.count() > 0) {
      const sectionAnalysis = await howWeWorkSection.evaluate(section => {
        const computed = window.getComputedStyle(section);
        const title = section.querySelector('h2, h3');
        const titleComputed = title ? window.getComputedStyle(title) : null;
        
        return {
          sectionClasses: Array.from(section.classList),
          sectionBg: computed.backgroundColor,
          sectionBgImage: computed.backgroundImage,
          titleText: title ? title.textContent.trim() : 'N/A',
          titleBg: titleComputed ? titleComputed.backgroundColor : 'N/A',
          titleColor: titleComputed ? titleComputed.color : 'N/A'
        };
      });
      
      console.log('Section classes:', sectionAnalysis.sectionClasses.join(' '));
      console.log('Section backgroundColor:', sectionAnalysis.sectionBg);
      console.log('Title:', `"${sectionAnalysis.titleText}"`);
      console.log('Title backgroundColor:', sectionAnalysis.titleBg);
      console.log('Title color:', sectionAnalysis.titleColor);
    }
    
    await context1.close();
    
    // Test with saved theme = system
    console.log('\n━━━━ TESTING: Light mode, saved theme=system ━━━━\n');
    const context2 = await browser.newContext({ 
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light'
    });
    const page2 = await context2.newPage();
    
    await page2.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page2.evaluate(() => {
      localStorage.setItem('sentivra-theme', 'system');
    });
    
    await page2.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page2.waitForTimeout(4000);
    
    const htmlClass2 = await page2.evaluate(() => document.documentElement.className);
    console.log('HTML class:', htmlClass2);
    
    await page2.screenshot({ 
      path: 'services-light-saved-system.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: services-light-saved-system.png\n');
    
    await context2.close();
    
    // Test dark mode
    console.log('━━━━ TESTING: Dark mode ━━━━\n');
    const context3 = await browser.newContext({ 
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark'
    });
    const page3 = await context3.newPage();
    
    await page3.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page3.evaluate(() => {
      localStorage.setItem('sentivra-theme', 'dark');
    });
    
    await page3.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page3.waitForTimeout(4000);
    
    const htmlClass3 = await page3.evaluate(() => document.documentElement.className);
    console.log('HTML class:', htmlClass3);
    
    await page3.screenshot({ 
      path: 'services-dark.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: services-dark.png\n');
    
    await context3.close();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DIAGNOSTIC COMPLETE');
    console.log('\nScreenshots saved. Please inspect:');
    console.log('  1. services-light-saved-light.png');
    console.log('  2. services-light-saved-system.png');
    console.log('  3. services-dark.png');
    console.log('\nLook for dark boxes behind text in light mode screenshots.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    serverProcess.kill();
    process.exit(0);
  }
})();
