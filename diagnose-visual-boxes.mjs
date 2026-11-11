import { chromium } from 'playwright';

async function diagnoseVisualBoxes() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  
  console.log('🔍 DIAGNOSING EMPTY VISUAL BOXES\n' + '='.repeat(70) + '\n');
  
  const analysis = await page.evaluate(() => {
    const servicesGrid = document.querySelector('#services-grid');
    const grid = servicesGrid?.querySelector('[class*="grid"]');
    const cards = Array.from(grid?.children || []);
    
    return cards.map((card, idx) => {
      const title = card.querySelector('h3')?.textContent?.trim();
      const link = card.querySelector('a');
      
      // The visual is the first child with aspect-ratio or the div with bg-gradient
      const visualCandidates = [
        ...Array.from(card.querySelectorAll('[class*="aspect"]')),
        ...Array.from(card.querySelectorAll('[class*="bg-gradient"]')),
        ...Array.from(card.querySelectorAll('[class*="bg-frost-soft"]'))
      ];
      
      const visual = visualCandidates[0];
      
      if (!visual) return { index: idx + 1, title, visual: null };
      
      const vComputed = window.getComputedStyle(visual);
      const vRect = visual.getBoundingClientRect();
      
      // Check for image
      const img = visual.querySelector('img');
      const gradientDiv = visual.querySelector('[class*="bg-gradient"]');
      const icon = visual.querySelector('svg');
      
      return {
        index: idx + 1,
        title,
        slug: link?.href?.split('/').pop(),
        visual: {
          tagName: visual.tagName,
          className: visual.className.substring(0, 150),
          width: Math.round(vRect.width),
          height: Math.round(vRect.height),
          opacity: vComputed.opacity,
          display: vComputed.display,
          visibility: vComputed.visibility,
          background: vComputed.background.substring(0, 100),
          hasImage: !!img,
          imageLoaded: img ? img.complete && img.naturalHeight > 0 : null,
          imageSrc: img?.src || null,
          imageError: img?.getAttribute('src') ? (img.complete && img.naturalHeight === 0) : null,
          hasGradientFallback: !!gradientDiv,
          hasIcon: !!icon,
          childCount: visual.children.length,
          innerHTML: visual.innerHTML.substring(0, 200)
        }
      };
    });
  });
  
  analysis.forEach(card => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`CARD #${card.index}: ${card.title}`);
    console.log(`Slug: ${card.slug}`);
    console.log(`${'='.repeat(70)}`);
    
    if (!card.visual) {
      console.log('❌ NO VISUAL ELEMENT FOUND\n');
      return;
    }
    
    const v = card.visual;
    console.log(`\nVisual Container:`);
    console.log(`  Tag: ${v.tagName}`);
    console.log(`  Size: ${v.width}×${v.height}px`);
    console.log(`  Opacity: ${v.opacity}`);
    console.log(`  Display: ${v.display}`);
    console.log(`  Visibility: ${v.visibility}`);
    console.log(`  Children: ${v.childCount}`);
    console.log(`  Classes: ${v.className}`);
    
    console.log(`\nContent Analysis:`);
    console.log(`  Has image element: ${v.hasImage}`);
    if (v.hasImage) {
      console.log(`  Image src: ${v.imageSrc}`);
      console.log(`  Image loaded: ${v.imageLoaded}`);
      console.log(`  Image error: ${v.imageError}`);
    }
    console.log(`  Has gradient fallback: ${v.hasGradientFallback}`);
    console.log(`  Has icon: ${v.hasIcon}`);
    
    // Diagnosis
    if (v.width === 0 || v.height === 0) {
      console.log(`\n❌ ISSUE: VISUAL HAS ZERO SIZE`);
    } else if (v.opacity === '0') {
      console.log(`\n❌ ISSUE: VISUAL IS INVISIBLE (opacity 0)`);
    } else if (v.childCount === 0) {
      console.log(`\n❌ ISSUE: VISUAL IS EMPTY (no children)`);
    } else if (v.hasImage && v.imageError) {
      console.log(`\n⚠️  IMAGE FAILED TO LOAD, should show fallback`);
    } else if (!v.hasImage && !v.hasGradientFallback) {
      console.log(`\n❌ ISSUE: NO IMAGE AND NO FALLBACK VISUAL`);
    } else if (!v.hasIcon && v.hasGradientFallback) {
      console.log(`\n⚠️  FALLBACK VISUAL BUT NO ICON INSIDE`);
    } else {
      console.log(`\n✅ Visual appears to be rendering`);
    }
    
    if (v.innerHTML.length < 100) {
      console.log(`\nHTML: ${v.innerHTML}`);
    }
  });
  
  await page.screenshot({ path: 'visual-boxes-debug.png', fullPage: true });
  console.log(`\n\n📸 Screenshot saved: visual-boxes-debug.png`);
  
  await browser.close();
}

diagnoseVisualBoxes().catch(console.error);
