import { chromium } from 'playwright';
import { spawn } from 'child_process';

// Start preview server
const serverProcess = spawn('npm', ['run', 'preview'], {
  shell: true,
  stdio: 'pipe'
});

// Wait for server to be ready
await new Promise((resolve) => setTimeout(resolve, 3000));

(async () => {
  console.log('\n🔍 DIAGNOSING /services PAGE BACKGROUND ISSUE\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light'
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:4173/services', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: INSPECT COMPUTED STYLES\n');

    // 1. Check service card title
    const cardTitle = page.locator('.service-card h3, .premium-service-card h3').first();
    if (await cardTitle.count() > 0) {
      const styles = await cardTitle.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const rules = [];
        for (let sheet of document.styleSheets) {
          try {
            for (let rule of sheet.cssRules || []) {
              if (rule.selectorText && el.matches(rule.selectorText)) {
                rules.push({
                  selector: rule.selectorText,
                  href: sheet.href || 'inline',
                  cssText: rule.style.cssText
                });
              }
            }
          } catch (e) {}
        }
        return {
          computed: {
            backgroundColor: computed.backgroundColor,
            backgroundImage: computed.backgroundImage,
            backgroundClip: computed.backgroundClip,
            webkitBackgroundClip: computed.webkitBackgroundClip,
            color: computed.color
          },
          classList: Array.from(el.classList),
          parent: {
            backgroundColor: window.getComputedStyle(el.parentElement).backgroundColor,
            classList: Array.from(el.parentElement.classList)
          },
          matchingRules: rules.slice(0, 5) // First 5 matching rules
        };
      });
      
      console.log('📌 SERVICE CARD TITLE (<h3>):');
      console.log('   Classes:', styles.classList.join(' '));
      console.log('   Computed background-color:', styles.computed.backgroundColor);
      console.log('   Computed background-image:', styles.computed.backgroundImage);
      console.log('   Computed background-clip:', styles.computed.backgroundClip);
      console.log('   Computed -webkit-background-clip:', styles.computed.webkitBackgroundClip);
      console.log('   Computed color:', styles.computed.color);
      console.log('   Parent classes:', styles.parent.classList.join(' '));
      console.log('   Parent background:', styles.parent.backgroundColor);
      if (styles.matchingRules.length > 0) {
        console.log('   Matching CSS rules:');
        styles.matchingRules.forEach(r => {
          console.log(`     ${r.selector} { ${r.cssText} }`);
          console.log(`     from: ${r.href}`);
        });
      }
      console.log('');
    }

    // 2. Check "How We Work" section heading
    const howWeWorkH2 = page.locator('section:has-text("How We Work") h2, h2:has-text("How We Work")').first();
    if (await howWeWorkH2.count() > 0) {
      const styles = await howWeWorkH2.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          computed: {
            backgroundColor: computed.backgroundColor,
            backgroundImage: computed.backgroundImage,
            backgroundClip: computed.backgroundClip,
            color: computed.color
          },
          classList: Array.from(el.classList),
          section: {
            backgroundColor: window.getComputedStyle(el.closest('section')).backgroundColor,
            classList: Array.from(el.closest('section').classList)
          }
        };
      });
      
      console.log('📌 "HOW WE WORK" HEADING (<h2>):');
      console.log('   Classes:', styles.classList.join(' '));
      console.log('   Computed background-color:', styles.computed.backgroundColor);
      console.log('   Computed background-image:', styles.computed.backgroundImage);
      console.log('   Computed color:', styles.computed.color);
      console.log('   Section classes:', styles.section.classList.join(' '));
      console.log('   Section background:', styles.section.backgroundColor);
      console.log('');
    }

    // 3. Check "Why Choose" tiles
    const whyTile = page.locator('.why-choose-card, .value-card').first();
    if (await whyTile.count() > 0) {
      const styles = await whyTile.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          computed: {
            backgroundColor: computed.backgroundColor,
            backgroundImage: computed.backgroundImage,
            color: computed.color
          },
          classList: Array.from(el.classList),
          title: {
            backgroundColor: window.getComputedStyle(el.querySelector('h3, h4')).backgroundColor,
            color: window.getComputedStyle(el.querySelector('h3, h4')).color
          }
        };
      });
      
      console.log('📌 "WHY CHOOSE" TILE:');
      console.log('   Classes:', styles.classList.join(' '));
      console.log('   Tile background-color:', styles.computed.backgroundColor);
      console.log('   Title background-color:', styles.title.backgroundColor);
      console.log('   Title color:', styles.title.color);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: SEARCH FOR CULPRIT PATTERNS\n');

    // Search for text elements with non-transparent backgrounds
    const textWithBg = await page.evaluate(() => {
      const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, li';
      const elements = document.querySelectorAll(textSelectors);
      const culprits = [];
      
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const bg = computed.backgroundColor;
        const bgImage = computed.backgroundImage;
        
        // Check if has non-transparent background
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          culprits.push({
            tag: el.tagName,
            text: el.textContent.slice(0, 50),
            classes: Array.from(el.classList),
            backgroundColor: bg,
            backgroundImage: bgImage
          });
        }
      });
      
      return culprits.slice(0, 20); // First 20
    });

    console.log('Found', textWithBg.length, 'text elements with non-transparent backgrounds:');
    textWithBg.forEach((el, i) => {
      console.log(`  ${i + 1}. <${el.tag}> "${el.text.trim().substring(0, 30)}..."`);
      console.log(`     Classes: ${el.classes.join(' ')}`);
      console.log(`     Background: ${el.backgroundColor}`);
      if (el.backgroundImage !== 'none') {
        console.log(`     Background-image: ${el.backgroundImage.substring(0, 80)}`);
      }
    });
    console.log('');

    // Take screenshot
    await page.screenshot({ 
      path: 'services-page-diagnosis.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: services-page-diagnosis.png\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Keep browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    serverProcess.kill();
    process.exit(0);
  }
})();
