import { chromium } from 'playwright';

async function diagnoseServiceCardsDetailed() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // Wait longer for animations
  
  console.log('🔍 DETAILED SERVICE CARDS DIAGNOSIS\n' + '='.repeat(70) + '\n');
  
  const analysis = await page.evaluate(() => {
    const servicesGrid = document.querySelector('#services-grid');
    if (!servicesGrid) return { error: 'Services grid section not found' };
    
    const grid = servicesGrid.querySelector('[class*="grid"]');
    if (!grid) return { error: 'Grid container not found' };
    
    const gridChildren = Array.from(grid.children);
    
    return {
      gridFound: true,
      gridChildCount: gridChildren.length,
      cards: gridChildren.map((child, idx) => {
        const computed = window.getComputedStyle(child);
        const rect = child.getBoundingClientRect();
        
        // Find visual container
        const visualContainer = child.querySelector('[class*="visual"], [class*="Visual"], [class*="icon"], [class*="Icon"]');
        let visualInfo = null;
        
        if (visualContainer) {
          const vComputed = window.getComputedStyle(visualContainer);
          const vRect = visualContainer.getBoundingClientRect();
          
          visualInfo = {
            found: true,
            tagName: visualContainer.tagName,
            className: visualContainer.className,
            width: Math.round(vRect.width),
            height: Math.round(vRect.height),
            opacity: vComputed.opacity,
            display: vComputed.display,
            visibility: vComputed.visibility,
            overflow: vComputed.overflow,
            animationPlayState: vComputed.animationPlayState,
            childCount: visualContainer.children.length,
            innerHTML: visualContainer.innerHTML.substring(0, 300),
            computedBg: vComputed.backgroundColor,
            computedBorder: vComputed.border
          };
        }
        
        // Find title, description, link
        const title = child.querySelector('h3, h2, [class*="title"], [class*="Title"]');
        const description = child.querySelector('p, [class*="description"]');
        const link = child.querySelector('a');
        const slug = link?.getAttribute('href')?.split('/').pop();
        
        return {
          index: idx + 1,
          tagName: child.tagName,
          className: child.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          opacity: computed.opacity,
          transform: computed.transform,
          display: computed.display,
          title: title?.textContent?.trim() || 'No title',
          description: description?.textContent?.trim().substring(0, 60) || 'No description',
          slug: slug || 'No slug',
          linkHref: link?.getAttribute('href') || 'No link',
          visualInfo
        };
      })
    };
  });
  
  if (analysis.error) {
    console.log(`❌ ERROR: ${analysis.error}\n`);
    await browser.close();
    return;
  }
  
  console.log(`✓ Grid found with ${analysis.gridChildCount} direct children\n`);
  
  analysis.cards.forEach(card => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`CARD #${card.index}: ${card.title}`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Slug: ${card.slug}`);
    console.log(`Link: ${card.linkHref}`);
    console.log(`\nCard Container:`);
    console.log(`  Tag: ${card.tagName}`);
    console.log(`  Size: ${card.width}×${card.height}px`);
    console.log(`  Opacity: ${card.opacity}`);
    console.log(`  Display: ${card.display}`);
    console.log(`  Transform: ${card.transform}`);
    console.log(`  Classes: ${card.className.substring(0, 100)}...`);
    
    if (card.opacity === '0') {
      console.log(`  ⚠️  CARD IS INVISIBLE (opacity: 0)`);
    }
    
    if (card.visualInfo) {
      const v = card.visualInfo;
      console.log(`\nVisual Container:`);
      console.log(`  Tag: ${v.tagName}`);
      console.log(`  Size: ${v.width}×${v.height}px`);
      console.log(`  Opacity: ${v.opacity}`);
      console.log(`  Display: ${v.display}`);
      console.log(`  Visibility: ${v.visibility}`);
      console.log(`  Overflow: ${v.overflow}`);
      console.log(`  Animation State: ${v.animationPlayState}`);
      console.log(`  Children: ${v.childCount}`);
      console.log(`  Background: ${v.computedBg}`);
      console.log(`  Border: ${v.computedBorder}`);
      console.log(`  Classes: ${v.className.substring(0, 100)}`);
      
      if (v.width === 0 || v.height === 0) {
        console.log(`  ❌ VISUAL HAS ZERO SIZE`);
      }
      if (v.opacity === '0') {
        console.log(`  ❌ VISUAL IS INVISIBLE`);
      }
      if (v.childCount === 0) {
        console.log(`  ❌ VISUAL IS EMPTY (no children)`);
        console.log(`  HTML: ${v.innerHTML || '(empty)'}`);
      }
    } else {
      console.log(`\n❌ NO VISUAL CONTAINER FOUND IN THIS CARD`);
    }
  });
  
  await page.screenshot({ path: 'services-cards-detailed.png', fullPage: true });
  console.log(`\n\n📸 Screenshot saved: services-cards-detailed.png`);
  
  await browser.close();
}

diagnoseServiceCardsDetailed().catch(console.error);
