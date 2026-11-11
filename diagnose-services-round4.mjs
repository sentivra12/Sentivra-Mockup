import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const url = 'http://localhost:4173/services';

async function diagnose() {
  console.log('🔍 Starting Round 4 diagnosis...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  
  // Navigate and wait for page load
  console.log(`📄 Loading ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations
  
  const report = {
    timestamp: new Date().toISOString(),
    url,
    bugs: []
  };
  
  // BUG 1: HERO IS BLURRED AND FADED
  console.log('\n🐛 BUG 1: Checking hero blur/fade...');
  const heroContent = await page.locator('[class*="hero"] h1, [class*="Hero"] h1, main h1').first();
  if (await heroContent.count() > 0) {
    const heroBox = await heroContent.boundingBox();
    const heroStyles = await heroContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentComputed = parent ? window.getComputedStyle(parent) : null;
      const grandparent = parent?.parentElement;
      const grandparentComputed = grandparent ? window.getComputedStyle(grandparent) : null;
      
      return {
        element: el.className,
        filter: computed.filter,
        opacity: computed.opacity,
        transform: computed.transform,
        willChange: computed.willChange,
        backdropFilter: computed.backdropFilter,
        animationFillMode: computed.animationFillMode,
        animationPlayState: computed.animationPlayState,
        animationName: computed.animationName,
        animationDelay: computed.animationDelay,
        visibility: computed.visibility,
        parent: {
          className: parent?.className,
          filter: parentComputed?.filter,
          opacity: parentComputed?.opacity,
          transform: parentComputed?.transform,
          animationPlayState: parentComputed?.animationPlayState,
        },
        grandparent: {
          className: grandparent?.className,
          filter: grandparentComputed?.filter,
          opacity: grandparentComputed?.opacity,
          transform: grandparentComputed?.transform,
        }
      };
    });
    
    report.bugs.push({
      id: 1,
      name: 'HERO BLUR/FADE',
      element: heroStyles.element,
      position: heroBox,
      computedStyles: heroStyles,
      diagnosis: heroStyles.opacity < 1 ? 'OPACITY LOW' : 
                 heroStyles.filter !== 'none' ? 'FILTER APPLIED' : 
                 heroStyles.parent.opacity < 1 ? 'PARENT OPACITY LOW' : 
                 heroStyles.visibility !== 'visible' ? 'VISIBILITY HIDDEN' : 'OK'
    });
    
    console.log(`  Element: ${heroStyles.element}`);
    console.log(`  Opacity: ${heroStyles.opacity}`);
    console.log(`  Filter: ${heroStyles.filter}`);
    console.log(`  Parent opacity: ${heroStyles.parent.opacity}`);
    console.log(`  Animation: ${heroStyles.animationName} (${heroStyles.animationPlayState})`);
  }
  
  // BUG 2: HERO ALIGNMENT
  console.log('\n🐛 BUG 2: Checking hero alignment...');
  const navLogo = await page.locator('header img, header svg, nav img, nav svg').first();
  const heroEyebrow = await page.locator('[class*="hero"] p, [class*="Hero"] p, main section p').first();
  
  if (await navLogo.count() > 0 && await heroEyebrow.count() > 0) {
    const logoBox = await navLogo.boundingBox();
    const eyebrowBox = await heroEyebrow.boundingBox();
    const offset = Math.abs(logoBox.x - eyebrowBox.x);
    
    report.bugs.push({
      id: 2,
      name: 'HERO ALIGNMENT',
      navLogoX: logoBox.x,
      heroEyebrowX: eyebrowBox.x,
      offset: offset,
      diagnosis: offset > 10 ? `MISALIGNED BY ${offset.toFixed(1)}px` : 'OK'
    });
    
    console.log(`  Nav logo X: ${logoBox.x}`);
    console.log(`  Hero eyebrow X: ${eyebrowBox.x}`);
    console.log(`  Offset: ${offset.toFixed(1)}px`);
  }
  
  // BUG 3: HERO HEADLINE SIZE/WRAPPING
  console.log('\n🐛 BUG 3: Checking hero headline...');
  const headline = await page.locator('h1').first();
  if (await headline.count() > 0) {
    const headlineInfo = await headline.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        text: el.textContent,
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        maxWidth: computed.maxWidth,
        textWrap: computed.textWrap || 'n/a',
        width: el.offsetWidth,
        height: el.offsetHeight,
        lines: Math.round(el.offsetHeight / parseFloat(computed.lineHeight))
      };
    });
    
    report.bugs.push({
      id: 3,
      name: 'HERO HEADLINE',
      ...headlineInfo,
      diagnosis: headlineInfo.lines > 3 ? `TOO MANY LINES (${headlineInfo.lines})` : 'OK'
    });
    
    console.log(`  Text: ${headlineInfo.text.substring(0, 50)}...`);
    console.log(`  Font size: ${headlineInfo.fontSize}`);
    console.log(`  Lines: ${headlineInfo.lines}`);
    console.log(`  Max-width: ${headlineInfo.maxWidth}`);
  }
  
  // BUG 4: HERO CONSTELLATION
  console.log('\n🐛 BUG 4: Checking constellation...');
  const constellationNodes = await page.locator('[class*="constellation"] [class*="node"], [class*="Constellation"] [class*="node"]').all();
  const constellationLines = await page.locator('[class*="constellation"] line, [class*="Constellation"] line').all();
  
  if (constellationNodes.length > 0) {
    const nodeIcons = await Promise.all(
      constellationNodes.slice(0, 10).map(async node => {
        return await node.evaluate(el => {
          const svg = el.querySelector('svg');
          const path = svg?.querySelector('path');
          return {
            className: el.className,
            svgPresent: !!svg,
            pathD: path?.getAttribute('d')?.substring(0, 30)
          };
        });
      })
    );
    
    report.bugs.push({
      id: 4,
      name: 'CONSTELLATION',
      nodesCount: constellationNodes.length,
      linesCount: constellationLines.length,
      nodeIcons: nodeIcons,
      diagnosis: constellationLines.length === 0 ? 'NO LINES' : 
                 constellationNodes.length < 6 ? 'TOO FEW NODES' : 'OK'
    });
    
    console.log(`  Nodes: ${constellationNodes.length}`);
    console.log(`  Lines: ${constellationLines.length}`);
    console.log(`  Icons: ${nodeIcons.filter(n => n.svgPresent).length} have SVGs`);
  }
  
  // BUG 5: EMPTY MINI VISUALS
  console.log('\n🐛 BUG 5: Checking service card mini visuals...');
  const serviceCards = await page.locator('[class*="service"] [class*="card"], [class*="Service"] [class*="Card"]').all();
  
  if (serviceCards.length > 0) {
    const visualsData = await Promise.all(
      serviceCards.slice(0, 6).map(async (card, idx) => {
        return await card.evaluate((el, index) => {
          const visual = el.querySelector('[class*="visual"], [class*="Visual"], [class*="mini"]');
          if (!visual) return { index, error: 'NO VISUAL ELEMENT' };
          
          const computed = window.getComputedStyle(visual);
          const children = visual.children.length;
          const hasContent = visual.textContent.trim().length > 0 || children > 0;
          
          return {
            index,
            className: visual.className,
            children,
            hasContent,
            width: computed.width,
            height: computed.height,
            opacity: computed.opacity,
            overflow: computed.overflow,
            animationPlayState: computed.animationPlayState,
            innerHTML: visual.innerHTML.substring(0, 100)
          };
        }, idx);
      })
    );
    
    const emptyVisuals = visualsData.filter(v => !v.hasContent && !v.error);
    
    report.bugs.push({
      id: 5,
      name: 'MINI VISUALS',
      totalCards: serviceCards.length,
      checked: visualsData.length,
      emptyCount: emptyVisuals.length,
      visuals: visualsData,
      diagnosis: emptyVisuals.length > 0 ? `${emptyVisuals.length} EMPTY VISUALS` : 'OK'
    });
    
    console.log(`  Total cards: ${serviceCards.length}`);
    console.log(`  Empty visuals: ${emptyVisuals.length}/${visualsData.length}`);
    if (emptyVisuals.length > 0) {
      console.log(`  First empty:`, emptyVisuals[0]);
    }
  }
  
  // BUG 6: FIRST CARD TOO TALL
  console.log('\n🐛 BUG 6: Checking first card dimensions...');
  if (serviceCards.length > 0) {
    const firstCard = serviceCards[0];
    const firstCardInfo = await firstCard.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        width: el.offsetWidth,
        height: el.offsetHeight,
        gridColumn: computed.gridColumn,
        gridRow: computed.gridRow,
        className: el.className
      };
    });
    
    const otherCards = await Promise.all(
      serviceCards.slice(1, 4).map(async card => {
        return await card.evaluate(el => el.offsetHeight);
      })
    );
    const avgHeight = otherCards.reduce((a, b) => a + b, 0) / otherCards.length;
    
    report.bugs.push({
      id: 6,
      name: 'FIRST CARD SIZE',
      firstCardHeight: firstCardInfo.height,
      avgOtherHeight: avgHeight,
      ratio: firstCardInfo.height / avgHeight,
      gridColumn: firstCardInfo.gridColumn,
      gridRow: firstCardInfo.gridRow,
      diagnosis: firstCardInfo.height > avgHeight * 1.5 ? 'TOO TALL' : 'OK'
    });
    
    console.log(`  First card: ${firstCardInfo.height}px`);
    console.log(`  Avg others: ${avgHeight.toFixed(0)}px`);
    console.log(`  Grid: ${firstCardInfo.gridColumn} / ${firstCardInfo.gridRow}`);
  }
  
  // BUG 7: DUPLICATE SERVICES - check via DOM
  console.log('\n🐛 BUG 7: Checking for duplicate services...');
  const serviceTitles = await page.locator('[class*="service"] h2, [class*="service"] h3, [class*="Service"] h2, [class*="Service"] h3').allTextContents();
  const titleCounts = {};
  serviceTitles.forEach(title => {
    const normalized = title.toLowerCase().trim();
    titleCounts[normalized] = (titleCounts[normalized] || 0) + 1;
  });
  const duplicates = Object.entries(titleCounts).filter(([, count]) => count > 1);
  
  report.bugs.push({
    id: 7,
    name: 'DUPLICATE SERVICES',
    totalServices: serviceTitles.length,
    duplicates: duplicates,
    diagnosis: duplicates.length > 0 ? `${duplicates.length} DUPLICATES` : 'OK'
  });
  
  console.log(`  Total services: ${serviceTitles.length}`);
  console.log(`  Duplicates:`, duplicates);
  
  // BUG 8: WHY CHOOSE US CLIPPED
  console.log('\n🐛 BUG 8: Checking Why Choose Us clipping...');
  const whyChooseTiles = await page.locator('[class*="why"] [class*="card"], [class*="Why"] [class*="Card"], section:has-text("Why Choose") [class*="card"]').all();
  
  if (whyChooseTiles.length > 0) {
    const tilesInfo = await Promise.all(
      whyChooseTiles.slice(0, 4).map(async tile => {
        return await tile.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            height: computed.height,
            maxHeight: computed.maxHeight,
            overflow: computed.overflow,
            overflowY: computed.overflowY,
            clipPath: computed.clipPath,
            borderRadius: computed.borderRadius,
            scrollHeight: el.scrollHeight,
            offsetHeight: el.offsetHeight,
            isClipped: el.scrollHeight > el.offsetHeight
          };
        });
      })
    );
    
    const clippedTiles = tilesInfo.filter(t => t.isClipped);
    
    report.bugs.push({
      id: 8,
      name: 'WHY CHOOSE CLIPPED',
      tilesCount: whyChooseTiles.length,
      clippedCount: clippedTiles.length,
      tiles: tilesInfo,
      diagnosis: clippedTiles.length > 0 ? `${clippedTiles.length} TILES CLIPPED` : 'OK'
    });
    
    console.log(`  Tiles checked: ${tilesInfo.length}`);
    console.log(`  Clipped: ${clippedTiles.length}`);
  }
  
  // BUG 9: FINAL CTA UNREADABLE
  console.log('\n🐛 BUG 9: Checking Final CTA contrast...');
  const ctaSection = await page.locator('section:has-text("Get Started"), section:has-text("Contact"), main > section').last();
  
  if (await ctaSection.count() > 0) {
    const ctaInfo = await ctaSection.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const heading = el.querySelector('h2, h3');
      const headingComputed = heading ? window.getComputedStyle(heading) : null;
      
      return {
        sectionBg: computed.backgroundColor,
        sectionColor: computed.color,
        headingColor: headingComputed?.color,
        headingText: heading?.textContent.substring(0, 50),
        className: el.className
      };
    });
    
    report.bugs.push({
      id: 9,
      name: 'FINAL CTA CONTRAST',
      ...ctaInfo,
      diagnosis: ctaInfo.sectionBg.includes('255, 255, 255') && ctaInfo.headingColor?.includes('255, 255, 255') ? 
                 'WHITE ON WHITE' : 'OK'
    });
    
    console.log(`  Section bg: ${ctaInfo.sectionBg}`);
    console.log(`  Heading color: ${ctaInfo.headingColor}`);
  }
  
  // Take screenshot
  console.log('\n📸 Taking screenshot...');
  await page.screenshot({ path: 'diagnosis-round4-screenshot.png', fullPage: true });
  
  // Write report
  writeFileSync('diagnosis-round4-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n✅ Diagnosis complete!');
  console.log('📄 Report: diagnosis-round4-report.json');
  console.log('📸 Screenshot: diagnosis-round4-screenshot.png\n');
  
  // Print summary
  console.log('📊 SUMMARY:');
  report.bugs.forEach(bug => {
    console.log(`  ${bug.id}. ${bug.name}: ${bug.diagnosis}`);
  });
  
  await browser.close();
}

diagnose().catch(console.error);
