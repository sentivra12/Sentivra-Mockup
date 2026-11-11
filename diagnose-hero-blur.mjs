import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function diagnoseHero() {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('🔍 Diagnosing Hero Blur Issue...\n');
  
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  
  // Wait 2 seconds to see final state
  await page.waitForTimeout(2000);
  
  const analysis = await page.evaluate(() => {
    // Find elements
    const h1 = document.querySelector('h1');
    const paragraph = document.querySelector('main p, section p');
    const primaryButton = document.querySelector('a[href="/contact"]');
    const secondaryButton = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent.includes('Explore') || b.textContent.includes('استكشف')
    );
    const eyebrow = document.querySelector('section p:first-child, section span:first-child');
    const factsRow = document.querySelector('[class*="fact"], [class*="count"]');
    
    const getComputedProps = (el, name) => {
      if (!el) return { name, error: 'Element not found' };
      
      const computed = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentComputed = parent ? window.getComputedStyle(parent) : null;
      const grandparent = parent?.parentElement;
      const grandparentComputed = grandparent ? window.getComputedStyle(grandparent) : null;
      
      return {
        name,
        element: el.className,
        computed: {
          opacity: computed.opacity,
          filter: computed.filter,
          transform: computed.transform,
          animationName: computed.animationName,
          animationFillMode: computed.animationFillMode,
          animationPlayState: computed.animationPlayState,
          animationDelay: computed.animationDelay,
          animationDuration: computed.animationDuration,
          transition: computed.transition,
          willChange: computed.willChange,
          visibility: computed.visibility,
          display: computed.display
        },
        parent: {
          className: parent?.className,
          opacity: parentComputed?.opacity,
          filter: parentComputed?.filter,
          transform: parentComputed?.transform,
          animationName: parentComputed?.animationName,
          animationPlayState: parentComputed?.animationPlayState
        },
        grandparent: {
          className: grandparent?.className,
          opacity: grandparentComputed?.opacity,
          filter: grandparentComputed?.filter,
          transform: grandparentComputed?.transform
        },
        boundingBox: {
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          width: el.offsetWidth,
          height: el.offsetHeight
        }
      };
    };
    
    return {
      timestamp: Date.now(),
      h1: getComputedProps(h1, 'h1'),
      paragraph: getComputedProps(paragraph, 'paragraph'),
      primaryButton: getComputedProps(primaryButton, 'primaryButton'),
      secondaryButton: getComputedProps(secondaryButton, 'secondaryButton'),
      eyebrow: getComputedProps(eyebrow, 'eyebrow'),
      factsRow: getComputedProps(factsRow, 'factsRow')
    };
  });
  
  // Print analysis
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 COMPUTED STYLES AFTER 2 SECONDS:\n');
  
  Object.entries(analysis).forEach(([key, data]) => {
    if (key === 'timestamp') return;
    
    console.log(`\n${data.name.toUpperCase()}:`);
    if (data.error) {
      console.log(`  ❌ ${data.error}`);
      return;
    }
    
    console.log(`  Element: ${data.element.substring(0, 80)}`);
    console.log(`  Opacity: ${data.computed.opacity}`);
    console.log(`  Filter: ${data.computed.filter}`);
    console.log(`  Transform: ${data.computed.transform}`);
    console.log(`  Animation Name: ${data.computed.animationName}`);
    console.log(`  Animation Fill Mode: ${data.computed.animationFillMode}`);
    console.log(`  Animation Play State: ${data.computed.animationPlayState}`);
    console.log(`  Animation Delay: ${data.computed.animationDelay}`);
    console.log(`  Animation Duration: ${data.computed.animationDuration}`);
    console.log(`  Visibility: ${data.computed.visibility}`);
    
    if (data.parent.animationName !== 'none') {
      console.log(`  \n  PARENT ANIMATION:`);
      console.log(`    Class: ${data.parent.className?.substring(0, 60)}`);
      console.log(`    Animation: ${data.parent.animationName}`);
      console.log(`    Play State: ${data.parent.animationPlayState}`);
    }
    
    // Flag issues
    const issues = [];
    if (parseFloat(data.computed.opacity) < 1) issues.push('LOW OPACITY');
    if (data.computed.filter !== 'none') issues.push('FILTER ACTIVE');
    if (data.computed.transform !== 'none' && data.computed.transform !== 'matrix(1, 0, 0, 1, 0, 0)') issues.push('TRANSFORM ACTIVE');
    if (data.computed.animationPlayState === 'paused') issues.push('ANIMATION PAUSED');
    
    if (issues.length > 0) {
      console.log(`  \n  🚨 ISSUES: ${issues.join(', ')}`);
    } else {
      console.log(`  \n  ✅ CLEAR (no blur/fade)`);
    }
  });
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  // Compare primary vs secondary button
  console.log('🔍 COMPARISON: Primary Button vs Secondary Button (Sharp)\n');
  
  if (!analysis.primaryButton.error && !analysis.secondaryButton.error) {
    console.log('Primary Button:');
    console.log(`  Opacity: ${analysis.primaryButton.computed.opacity}`);
    console.log(`  Filter: ${analysis.primaryButton.computed.filter}`);
    console.log(`  Animation: ${analysis.primaryButton.computed.animationName}`);
    
    console.log('\nSecondary Button (SHARP):');
    console.log(`  Opacity: ${analysis.secondaryButton.computed.opacity}`);
    console.log(`  Filter: ${analysis.secondaryButton.computed.filter}`);
    console.log(`  Animation: ${analysis.secondaryButton.computed.animationName}`);
    
    console.log('\n📌 KEY DIFFERENCE:');
    const primaryParentAnim = analysis.primaryButton.parent.animationName;
    const secondaryParentAnim = analysis.secondaryButton.parent.animationName;
    
    if (primaryParentAnim !== secondaryParentAnim) {
      console.log(`  Primary parent animation: ${primaryParentAnim}`);
      console.log(`  Secondary parent animation: ${secondaryParentAnim}`);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'hero-blur-diagnosis.png', fullPage: false });
  console.log('\n📸 Screenshot: hero-blur-diagnosis.png');
  
  // Write report
  writeFileSync('hero-blur-report.json', JSON.stringify(analysis, null, 2));
  console.log('📄 Report: hero-blur-report.json');
  
  console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  
  return analysis;
}

diagnoseHero().catch(console.error);
