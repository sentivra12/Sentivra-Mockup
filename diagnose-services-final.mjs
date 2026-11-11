import { chromium } from 'playwright';
import { spawn } from 'child_process';

console.log('\n🔍 FINAL /services DIAGNOSIS\n');

const serverProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
  shell: true,
  stdio: 'pipe'
});

await new Promise((resolve) => setTimeout(resolve, 5000));

(async () => {
  const browser = await chromium.launch({ headless: false });
  
  try {
    const context = await browser.newContext({ 
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light'
    });
    const page = await context.newPage();
    
    // Set theme to light
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('sentivra-theme', 'light'));
    
    // Navigate to /services
    await page.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for services-specific content
    try {
      await page.waitForSelector('input[placeholder*="search" i], input[type="search"], .grid a[href*="/services/"]', { timeout: 10000 });
      console.log('✅ Services content detected\n');
    } catch (e) {
      console.warn('⚠️  Service cards or search not found\n');
    }
    
    await page.waitForTimeout(3000);
    
    // Verify page content
    const h1Text = await page.locator('h1').first().textContent().catch(() => '');
    const serviceCardCount = await page.locator('a[href*="/services/"]').count();
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    
    console.log('H1:', h1Text);
    console.log('Service cards:', serviceCardCount);
    console.log('HTML class:', htmlClass);
    console.log('');
    
    if (serviceCardCount === 0) {
      console.error('❌ ERROR: No service cards found - page may not have loaded correctly\n');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'services-final-light.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: services-final-light.png\n');
    
    // Inspect "Comprehensive Software Solutions" heading
    console.log('━━━━ INSPECTING: "Comprehensive Software Solutions" ━━━━\n');
    const gridHeader = await page.locator('h2:has-text("Comprehensive Software Solutions"), h2:has-text("Software Solutions")').first();
    if (await gridHeader.count() > 0) {
      const analysis = await gridHeader.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const before = window.getComputedStyle(el, '::before');
        const after = window.getComputedStyle(el, '::after');
        
        const ancestors = [];
        let current = el;
        while (current && ancestors.length < 8) {
          const c = window.getComputedStyle(current);
          ancestors.push({
            tag: current.tagName,
            classes: Array.from(current.classList),
            id: current.id,
            bgColor: c.backgroundColor,
            bgImage: c.backgroundImage,
            bgClip: c.backgroundClip,
            webkitBgClip: c.webkitBackgroundClip,
            color: c.color,
            mixBlendMode: c.mixBlendMode,
            filter: c.filter
          });
          current = current.parentElement;
        }
        
        return {
          text: el.textContent.trim(),
          computed: {
            backgroundColor: computed.backgroundColor,
            backgroundImage: computed.backgroundImage,
            backgroundClip: computed.backgroundClip,
            webkitBackgroundClip: computed.webkitBackgroundClip,
            color: computed.color,
            mixBlendMode: computed.mixBlendMode,
            filter: computed.filter
          },
          before: {
            content: before.content,
            backgroundColor: before.backgroundColor,
            backgroundImage: before.backgroundImage
          },
          after: {
            content: after.content,
            backgroundColor: after.backgroundColor,
            backgroundImage: after.backgroundImage
          },
          ancestors
        };
      });
      
      console.log('Text:', analysis.text);
      console.log('Element styles:');
      console.log('  backgroundColor:', analysis.computed.backgroundColor);
      console.log('  backgroundImage:', analysis.computed.backgroundImage);
      console.log('  backgroundClip:', analysis.computed.backgroundClip);
      console.log('  -webkit-background-clip:', analysis.computed.webkitBackgroundClip);
      console.log('  color:', analysis.computed.color);
      console.log('  mixBlendMode:', analysis.computed.mixBlendMode);
      
      if (analysis.before.content !== 'none') {
        console.log('::before:', analysis.before);
      }
      if (analysis.after.content !== 'none') {
        console.log('::after:', analysis.after);
      }
      
      console.log('\nAncestor chain:');
      analysis.ancestors.forEach((anc, i) => {
        const hasInverse = anc.classes.some(c => c.includes('inverse'));
        const hasBg = anc.bgColor !== 'rgba(0, 0, 0, 0)' && anc.bgColor !== 'transparent';
        const marker = hasInverse ? ' [INVERSE]' : (hasBg ? ' [HAS BG]' : '');
        console.log(`  ${i}. <${anc.tag}>${anc.id ? '#' + anc.id : ''} ${anc.classes.join(' ')}${marker}`);
        if (hasBg || hasInverse) {
          console.log(`     bgColor: ${anc.bgColor}`);
        }
      });
    }
    
    // Inspect "How We Work With You" heading
    console.log('\n━━━━ INSPECTING: "How We Work With You" ━━━━\n');
    const howWeWorkH2 = await page.locator('h2:has-text("How We Work"), h3:has-text("How We Work")').first();
    if (await howWeWorkH2.count() > 0) {
      const analysis = await howWeWorkH2.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const ancestors = [];
        let current = el;
        while (current && ancestors.length < 8) {
          const c = window.getComputedStyle(current);
          ancestors.push({
            tag: current.tagName,
            classes: Array.from(current.classList),
            bgColor: c.backgroundColor,
            color: c.color
          });
          current = current.parentElement;
        }
        
        return {
          text: el.textContent.trim(),
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          ancestors
        };
      });
      
      console.log('Text:', analysis.text);
      console.log('backgroundColor:', analysis.backgroundColor);
      console.log('color:', analysis.color);
      
      console.log('\nAncestor chain:');
      analysis.ancestors.forEach((anc, i) => {
        const hasInverse = anc.classes.some(c => c.includes('inverse'));
        const hasBg = anc.bgColor !== 'rgba(0, 0, 0, 0)';
        const marker = hasInverse ? ' [INVERSE]' : (hasBg ? ' [HAS BG]' : '');
        console.log(`  ${i}. <${anc.tag}> ${anc.classes.join(' ')}${marker}`);
        if (hasBg || hasInverse) {
          console.log(`     bgColor: ${anc.bgColor}`);
        }
      });
    }
    
    // Check search box
    console.log('\n━━━━ INSPECTING: Search box ━━━━\n');
    const searchBox = await page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchBox.count() > 0) {
      const analysis = await searchBox.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          border: computed.border,
          parentClasses: Array.from(el.parentElement?.classList || [])
        };
      });
      
      console.log('backgroundColor:', analysis.backgroundColor);
      console.log('color:', analysis.color);
      console.log('Parent classes:', analysis.parentClasses.join(' '));
    }
    
    console.log('\n✅ Diagnosis complete\n');
    
    await context.close();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    serverProcess.kill();
    process.exit(0);
  }
})();
