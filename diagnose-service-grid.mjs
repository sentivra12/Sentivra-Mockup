import { chromium } from 'playwright';

async function diagnoseServiceGrid() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('🔍 DIAGNOSING SERVICE GRID\n' + '='.repeat(70));
  
  // Get service cards analysis
  const analysis = await page.evaluate(() => {
    const grid = document.querySelector('[id*="services-grid"], section:has(> div > article)');
    const cards = Array.from(document.querySelectorAll('article, .service-card, [class*="ServiceCard"]'));
    
    const results = {
      gridFound: !!grid,
      cardCount: cards.length,
      cards: []
    };
    
    cards.forEach((card, idx) => {
      const title = card.querySelector('h2, h3, [class*="title"]')?.textContent?.trim();
      const visual = card.querySelector('[class*="visual"], [class*="icon"], svg, img');
      const link = card.querySelector('a[href*="/services/"]');
      
      let visualInfo = null;
      if (visual) {
        const computed = window.getComputedStyle(visual);
        const rect = visual.getBoundingClientRect();
        
        visualInfo = {
          tagName: visual.tagName,
          className: visual.className,
          width: rect.width,
          height: rect.height,
          opacity: computed.opacity,
          display: computed.display,
          visibility: computed.visibility,
          overflow: computed.overflow,
          animationPlayState: computed.animationPlayState,
          childCount: visual.children.length,
          hasContent: visual.textContent?.trim().length > 0 || visual.children.length > 0,
          innerHTML: visual.innerHTML.substring(0, 200)
        };
      }
      
      // Try to find the slug from the link
      const slug = link?.href?.split('/services/').pop()?.replace(/[?#].*$/, '');
      
      results.cards.push({
        index: idx + 1,
        title,
        slug,
        visualFound: !!visual,
        visualInfo,
        linkHref: link?.href
      });
    });
    
    return results;
  });
  
  console.log(`\n✓ Grid found: ${analysis.gridFound}`);
  console.log(`✓ Total cards: ${analysis.cardCount}\n`);
  
  // Print each card analysis
  analysis.cards.forEach(card => {
    console.log(`\nCARD ${card.index}: ${card.title || 'No title'}`);
    console.log(`  Slug: ${card.slug || 'Not found'}`);
    console.log(`  Link: ${card.linkHref || 'Not found'}`);
    
    if (!card.visualFound) {
      console.log(`  ❌ NO VISUAL CONTAINER FOUND`);
    } else {
      const v = card.visualInfo;
      console.log(`  Visual container:`);
      console.log(`    Tag: ${v.tagName}`);
      console.log(`    Class: ${v.className}`);
      console.log(`    Size: ${Math.round(v.width)}×${Math.round(v.height)}px`);
      console.log(`    Opacity: ${v.opacity}`);
      console.log(`    Display: ${v.display}`);
      console.log(`    Visibility: ${v.visibility}`);
      console.log(`    Overflow: ${v.overflow}`);
      console.log(`    Animation: ${v.animationPlayState}`);
      console.log(`    Children: ${v.childCount}`);
      console.log(`    Has content: ${v.hasContent}`);
      
      if (v.width === 0 || v.height === 0) {
        console.log(`    ⚠️  ZERO SIZE`);
      }
      if (v.opacity === '0') {
        console.log(`    ⚠️  INVISIBLE (opacity 0)`);
      }
      if (v.display === 'none') {
        console.log(`    ⚠️  HIDDEN (display none)`);
      }
      if (v.childCount === 0 && !v.hasContent) {
        console.log(`    ❌ EMPTY (no children, no content)`);
      }
      if (v.innerHTML.length < 50 && v.childCount === 0) {
        console.log(`    HTML preview: ${v.innerHTML}`);
      }
    }
  });
  
  // Take screenshot
  await page.screenshot({ path: 'services-grid-debug.png', fullPage: true });
  console.log(`\n\n📸 Screenshot saved: services-grid-debug.png`);
  
  await browser.close();
  
  return analysis;
}

diagnoseServiceGrid().catch(console.error);
