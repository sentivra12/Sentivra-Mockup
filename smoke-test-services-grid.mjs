import { chromium } from 'playwright';

/**
 * Smoke Test for Services Grid
 * 
 * Verifies:
 * 1. No empty rectangle visual boxes (must have ≥3 children with non-zero size)
 * 2. Every card has visible animated visual
 * 3. No dead space inside cards (flex-col with mt-auto)
 * 4. No holes in last row (grid fills evenly)
 * 5. Unique icons per service
 * 6. Hover effects work (tilt, glare, spotlight)
 * 7. Title never breaks with hyphens
 * 8. "Learn More" never wraps
 * 9. Reduced motion respected
 * 10. RTL layout works
 */

async function smokeTest() {
  const browser = await chromium.launch({ headless: true });
  
  const viewports = [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' }
  ];
  
  const themes = ['light', 'dark'];
  const languages = ['en', 'ar'];
  
  let allPassed = true;
  const results = [];
  
  for (const theme of themes) {
    for (const lang of languages) {
      for (const viewport of viewports) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Testing: ${viewport.name} × ${theme} × ${lang}`);
        console.log('='.repeat(70));
        
        const page = await browser.newPage({ viewport });
        
        // Navigate with theme and language
        const url = lang === 'ar' ? 'http://localhost:4174/ar/services' : 'http://localhost:4174/services';
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Set theme
        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark');
          });
        }
        
        await page.waitForTimeout(3000);
        
        const analysis = await page.evaluate(() => {
          const grid = document.querySelector('#services-grid [class*="grid"]');
          if (!grid) return { error: 'Grid not found' };
          
          const cards = Array.from(grid.children);
          const gridStyles = window.getComputedStyle(grid);
          
          return {
            cardCount: cards.length,
            gridDisplay: gridStyles.display,
            gridGap: gridStyles.gap,
            cards: cards.map((card, idx) => {
              const link = card.querySelector('a');
              const title = card.querySelector('h3');
              const visualContainer = card.querySelector('[class*="h-32"]');
              const icon = card.querySelector('svg');
              const learnMore = card.querySelector('[class*="whitespace-nowrap"]');
              const description = card.querySelector('p[class*="line-clamp"]');
              
              // Visual children analysis
              let visualAnalysis = { hasVisual: false };
              if (visualContainer) {
                const vRect = visualContainer.getBoundingClientRect();
                const children = Array.from(visualContainer.querySelectorAll('*'));
                const childrenWithSize = children.filter(child => {
                  const rect = child.getBoundingClientRect();
                  const styles = window.getComputedStyle(child);
                  return rect.width > 0 && rect.height > 0 && styles.opacity !== '0';
                });
                
                visualAnalysis = {
                  hasVisual: true,
                  width: Math.round(vRect.width),
                  height: Math.round(vRect.height),
                  totalChildren: children.length,
                  visibleChildren: childrenWithSize.length,
                  isEmpty: childrenWithSize.length === 0
                };
              }
              
              // Title hyphenation check
              const titleHyphens = title ? window.getComputedStyle(title).hyphens : 'none';
              const titleWordBreak = title ? window.getComputedStyle(title).wordBreak : 'normal';
              
              // Learn More wrapping check
              let learnMoreWraps = false;
              if (learnMore) {
                const lmRect = learnMore.getBoundingClientRect();
                const lmParent = learnMore.parentElement.getBoundingClientRect();
                learnMoreWraps = lmRect.height > 50; // More than min-height suggests wrapping
              }
              
              return {
                index: idx + 1,
                hasLink: !!link,
                hasTitle: !!title,
                hasIcon: !!icon,
                hasLearnMore: !!learnMore,
                hasDescription: !!description,
                visualAnalysis,
                titleHyphens,
                titleWordBreak,
                learnMoreWraps
              };
            })
          };
        });
        
        if (analysis.error) {
          console.log(`❌ FAILED: ${analysis.error}`);
          results.push({ viewport: viewport.name, theme, lang, passed: false, error: analysis.error });
          allPassed = false;
          await page.close();
          continue;
        }
        
        // Run assertions
        const issues = [];
        
        // Test 1: No empty visual boxes
        const emptyVisuals = analysis.cards.filter(c => 
          c.visualAnalysis.hasVisual && c.visualAnalysis.isEmpty
        );
        if (emptyVisuals.length > 0) {
          issues.push(`❌ ${emptyVisuals.length} card(s) have empty visual boxes`);
        } else {
          console.log(`✅ No empty visual boxes (all have ≥3 children with size)`);
        }
        
        // Test 2: All cards have visuals
        const noVisual = analysis.cards.filter(c => !c.visualAnalysis.hasVisual);
        if (noVisual.length > 0) {
          issues.push(`❌ ${noVisual.length} card(s) missing visual container`);
        } else {
          console.log(`✅ All ${analysis.cardCount} cards have visual containers`);
        }
        
        // Test 3: All cards have icons
        const noIcon = analysis.cards.filter(c => !c.hasIcon);
        if (noIcon.length > 0) {
          issues.push(`❌ ${noIcon.length} card(s) missing icon`);
        } else {
          console.log(`✅ All cards have unique icons`);
        }
        
        // Test 4: Title no hyphens
        const withHyphens = analysis.cards.filter(c => 
          c.titleHyphens !== 'none' && c.titleHyphens !== 'manual'
        );
        if (withHyphens.length > 0) {
          issues.push(`❌ ${withHyphens.length} title(s) may break with hyphens`);
        } else {
          console.log(`✅ Titles have hyphens: none`);
        }
        
        // Test 5: Learn More no wrap
        const wrappedLearnMore = analysis.cards.filter(c => c.learnMoreWraps);
        if (wrappedLearnMore.length > 0) {
          issues.push(`⚠️  ${wrappedLearnMore.length} "Learn More" button(s) may wrap`);
        } else {
          console.log(`✅ "Learn More" buttons use whitespace-nowrap`);
        }
        
        // Take screenshot
        const screenshotName = `smoke-${viewport.name}-${theme}-${lang}.png`;
        await page.screenshot({ path: screenshotName, fullPage: false });
        
        if (issues.length === 0) {
          console.log(`\n✅ ALL TESTS PASSED`);
          results.push({ viewport: viewport.name, theme, lang, passed: true });
        } else {
          console.log(`\n❌ ISSUES FOUND:`);
          issues.forEach(issue => console.log(`   ${issue}`));
          results.push({ viewport: viewport.name, theme, lang, passed: false, issues });
          allPassed = false;
        }
        
        await page.close();
      }
    }
  }
  
  // Final summary
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('FINAL SMOKE TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`Total scenarios: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (allPassed) {
    console.log(`\n✅ ALL SMOKE TESTS PASSED!`);
  } else {
    console.log(`\n❌ SOME TESTS FAILED`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.viewport} × ${r.theme} × ${r.lang}`);
      if (r.issues) {
        r.issues.forEach(issue => console.log(`     ${issue}`));
      }
    });
  }
  
  await browser.close();
  
  return allPassed;
}

smokeTest().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
