import { chromium } from 'playwright';

async function testEnhancedCards() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  
  console.log('🔍 TESTING ENHANCED SERVICE CARDS\n' + '='.repeat(70) + '\n');
  
  const analysis = await page.evaluate(() => {
    const grid = document.querySelector('#services-grid [class*="grid"][class*="grid-cols"]');
    if (!grid) return { error: 'Grid not found' };
    
    const cards = Array.from(grid.children);
    
    return {
      totalCards: cards.length,
      cards: cards.map((card, idx) => {
        const link = card.querySelector('a');
        const title = card.querySelector('h3')?.textContent?.trim();
        const slug = link?.href?.split('/').pop();
        
        // Find visual container (w-full h-32)
        const visualContainer = card.querySelector('[class*="h-32"]');
        
        let visualInfo = { found: false };
        if (visualContainer) {
          const vComputed = window.getComputedStyle(visualContainer);
          const vRect = visualContainer.getBoundingClientRect();
          
          // Check for visual children
          const browserFrame = visualContainer.querySelector('[class*="border-2"][class*="rounded"]');
          const mobileFrame = visualContainer.querySelector('[class*="w-16"][class*="h-full"]');
          const svgElements = visualContainer.querySelectorAll('svg');
          const motionDivs = visualContainer.querySelectorAll('[class*="bg-"]');
          
          visualInfo = {
            found: true,
            width: Math.round(vRect.width),
            height: Math.round(vRect.height),
            opacity: vComputed.opacity,
            childCount: visualContainer.children.length,
            hasBrowserFrame: !!browserFrame,
            hasMobileFrame: !!mobileFrame,
            svgCount: svgElements.length,
            motionDivCount: motionDivs.length,
            classes: visualContainer.className.substring(0, 100)
          };
        }
        
        // Check icon
        const iconContainer = card.querySelector('[class*="w-14"][class*="h-14"]');
        const hasIcon = iconContainer && iconContainer.querySelector('svg');
        
        // Check description
        const description = card.querySelector('p[class*="line-clamp-3"]')?.textContent?.trim().substring(0, 50);
        
        // Check Learn More button
        const learnMore = card.querySelector('[class*="whitespace-nowrap"]')?.textContent?.trim();
        
        return {
          index: idx + 1,
          title,
          slug,
          description,
          visualInfo,
          hasIcon: !!hasIcon,
          hasLearnMore: !!learnMore,
          learnMoreText: learnMore
        };
      })
    };
  });
  
  if (analysis.error) {
    console.log(`❌ ERROR: ${analysis.error}\n`);
    await browser.close();
    return;
  }
  
  console.log(`✓ Found ${analysis.totalCards} service cards\n`);
  
  let passedCount = 0;
  let failedCount = 0;
  
  analysis.cards.forEach(card => {
    console.log(`${'='.repeat(70)}`);
    console.log(`CARD #${card.index}: ${card.title}`);
    console.log(`Slug: ${card.slug}`);
    console.log(`${'='.repeat(70)}`);
    
    const issues = [];
    
    // Check visual
    if (!card.visualInfo.found) {
      issues.push('❌ NO VISUAL CONTAINER FOUND');
    } else {
      const v = card.visualInfo;
      console.log(`\nVisual Container:`);
      console.log(`  Size: ${v.width}×${v.height}px`);
      console.log(`  Opacity: ${v.opacity}`);
      console.log(`  Children: ${v.childCount}`);
      console.log(`  Browser frame: ${v.hasBrowserFrame ? '✅' : '❌'}`);
      console.log(`  Mobile frame: ${v.hasMobileFrame ? '✅' : '❌'}`);
      console.log(`  SVG elements: ${v.svgCount}`);
      console.log(`  Motion divs: ${v.motionDivCount}`);
      
      if (v.width === 0 || v.height === 0) {
        issues.push('❌ Visual has zero size');
      }
      if (v.opacity === '0') {
        issues.push('❌ Visual is invisible');
      }
      if (v.childCount === 0) {
        issues.push('❌ Visual is EMPTY (no children)');
      }
      if (!v.hasBrowserFrame && !v.hasMobileFrame && v.svgCount === 0 && v.motionDivCount < 2) {
        issues.push('⚠️  Visual has minimal content');
      }
    }
    
    // Check icon
    console.log(`\nIcon: ${card.hasIcon ? '✅' : '❌'}`);
    if (!card.hasIcon) {
      issues.push('❌ No icon found');
    }
    
    // Check description
    console.log(`Description: ${card.description ? card.description + '...' : '❌ Missing'}`);
    if (!card.description) {
      issues.push('❌ No description');
    }
    
    // Check Learn More
    console.log(`Learn More: ${card.hasLearnMore ? `✅ "${card.learnMoreText}"` : '❌'}`);
    if (!card.hasLearnMore) {
      issues.push('❌ No Learn More button');
    }
    
    if (issues.length === 0) {
      console.log(`\n✅ ALL CHECKS PASSED`);
      passedCount++;
    } else {
      console.log(`\n❌ ISSUES FOUND:`);
      issues.forEach(issue => console.log(`   ${issue}`));
      failedCount++;
    }
    
    console.log('');
  });
  
  console.log('\n' + '='.repeat(70));
  console.log(`📊 SUMMARY: ${passedCount} passed, ${failedCount} failed`);
  console.log('='.repeat(70));
  
  await page.screenshot({ path: 'enhanced-cards-test.png', fullPage: true });
  console.log('\n📸 Screenshot saved: enhanced-cards-test.png');
  
  await browser.close();
  
  return { passed: passedCount === analysis.totalCards, passedCount, failedCount, total: analysis.totalCards };
}

testEnhancedCards().then(result => {
  if (result && !result.passed) {
    process.exit(1);
  }
}).catch(err => {
  console.error(err);
  process.exit(1);
});
