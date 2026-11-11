/**
 * ServicesPageRound3 - Comprehensive smoke test
 * Tests all bug fixes at multiple breakpoints and themes
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:4173';
const SERVICES_URL = `${BASE_URL}/services`;

// Viewport configurations to test
const VIEWPORTS = [
  { name: '360px Mobile', width: 360, height: 800 },
  { name: '390px Mobile', width: 390, height: 844 },
  { name: '768px Tablet', width: 768, height: 1024 },
  { name: '1024px Laptop', width: 1024, height: 768 },
  { name: '1440px Desktop', width: 1440, height: 900 },
  { name: '1920px Large', width: 1920, height: 1080 }
];

// Theme and language combinations
const COMBINATIONS = [
  { theme: 'light', lang: 'en', label: 'Light EN' },
  { theme: 'light', lang: 'ar', label: 'Light AR' },
  { theme: 'dark', lang: 'en', label: 'Dark EN' },
  { theme: 'dark', lang: 'ar', label: 'Dark AR' }
];

async function testServicesPage() {
  console.log('\n🚀 ServicesPageRound3 - Comprehensive Test\n');
  console.log('=' .repeat(70));
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    const page = await browser.newPage();
    
    // Test each viewport and theme combination
    for (const viewport of VIEWPORTS) {
      console.log(`\n📱 Testing ${viewport.name}...`);
      await page.setViewport({ width: viewport.width, height: viewport.height });
      
      for (const combo of COMBINATIONS) {
        const testLabel = `${viewport.name} - ${combo.label}`;
        console.log(`  ⏳ ${combo.label}...`);
        
        try {
          // Navigate to services page
          await page.goto(SERVICES_URL, { waitUntil: 'networkidle0', timeout: 30000 });
          
          // Set theme and language
          if (combo.theme === 'dark') {
            await page.evaluate(() => {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            });
          } else {
            await page.evaluate(() => {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            });
          }
          
          if (combo.lang === 'ar') {
            await page.evaluate(() => {
              document.documentElement.lang = 'ar';
              document.documentElement.dir = 'rtl';
              localStorage.setItem('language', 'ar');
            });
          } else {
            await page.evaluate(() => {
              document.documentElement.lang = 'en';
              document.documentElement.dir = 'ltr';
              localStorage.setItem('language', 'en');
            });
          }
          
          // Reload with new settings
          await page.reload({ waitUntil: 'networkidle0' });
          
          // Wait for main sections to load
          await page.waitForSelector('section', { timeout: 10000 });
          
          // BUG CHECK 1: Hero text alignment (not at x=0)
          const heroText = await page.evaluate(() => {
            const heading = document.querySelector('h1');
            if (!heading) return null;
            const rect = heading.getBoundingClientRect();
            const container = heading.closest('.max-w-7xl');
            const containerRect = container?.getBoundingClientRect();
            return {
              headingLeft: rect.left,
              headingText: heading.textContent?.substring(0, 50),
              containerLeft: containerRect?.left || 0,
              containerPadding: containerRect ? window.getComputedStyle(container).paddingLeft : '0px'
            };
          });
          
          if (heroText && heroText.headingLeft < 10) {
            results.failed.push(`${testLabel}: Hero text at x=${heroText.headingLeft} (should have padding)`);
          } else if (heroText) {
            results.passed.push(`${testLabel}: Hero text properly padded (x=${Math.round(heroText.headingLeft)})`);
          }
          
          // BUG CHECK 2: No dark boxes behind text (check computed backgrounds)
          const darkBoxesCheck = await page.evaluate(() => {
            const textElements = Array.from(document.querySelectorAll('h1, h2, h3, p'));
            const darkBoxes = textElements.filter(el => {
              const bg = window.getComputedStyle(el).backgroundColor;
              // Check if background is dark (rgb values < 50)
              const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (match) {
                const [_, r, g, b] = match.map(Number);
                return r < 50 && g < 50 && b < 50;
              }
              return false;
            });
            return {
              total: textElements.length,
              darkBoxCount: darkBoxes.length,
              examples: darkBoxes.slice(0, 3).map(el => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 30),
                bg: window.getComputedStyle(el).backgroundColor
              }))
            };
          });
          
          if (darkBoxesCheck.darkBoxCount > 0) {
            results.failed.push(`${testLabel}: Found ${darkBoxesCheck.darkBoxCount} dark boxes behind text`);
          } else {
            results.passed.push(`${testLabel}: No dark boxes behind text ✓`);
          }
          
          // BUG CHECK 3: Constellation visible and has connections (desktop only)
          if (viewport.width >= 1024) {
            const constellation = await page.evaluate(() => {
              const stage = document.querySelector('[class*="aspect-square"]');
              if (!stage) return { visible: false };
              
              const nodes = stage.querySelectorAll('[class*="w-16 h-16"]');
              const svgLines = stage.querySelectorAll('svg line');
              const centerCore = stage.querySelector('[class*="w-24 h-24"]');
              
              return {
                visible: true,
                nodeCount: nodes.length,
                lineCount: svgLines.length,
                hasCenterCore: !!centerCore,
                stageWidth: stage.getBoundingClientRect().width
              };
            });
            
            if (!constellation.visible) {
              results.warnings.push(`${testLabel}: Constellation not found (desktop)`);
            } else if (constellation.lineCount === 0) {
              results.failed.push(`${testLabel}: Constellation has ${constellation.nodeCount} nodes but NO connection lines`);
            } else {
              results.passed.push(`${testLabel}: Constellation has ${constellation.nodeCount} nodes with ${constellation.lineCount} lines ✓`);
            }
          }
          
          // BUG CHECK 4: Service cards have visible mini visuals (not empty white boxes)
          const serviceCards = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('[id="services-grid"] [class*="rounded-2xl"]'));
            return cards.slice(0, 3).map(card => {
              const visual = card.querySelector('[class*="h-32"]');
              if (!visual) return { hasVisual: false };
              
              const rect = visual.getBoundingClientRect();
              const styles = window.getComputedStyle(visual);
              const bg = styles.backgroundColor;
              
              // Check for animations/transforms in children
              const animatedChildren = visual.querySelectorAll('[class*="motion"]').length;
              
              return {
                hasVisual: true,
                width: rect.width,
                height: rect.height,
                backgroundColor: bg,
                animatedChildren,
                isEmpty: rect.width === 0 || rect.height === 0
              };
            });
          });
          
          const emptyVisuals = serviceCards.filter(c => c.hasVisual && c.isEmpty);
          if (emptyVisuals.length > 0) {
            results.failed.push(`${testLabel}: ${emptyVisuals.length} service cards have empty/invisible visuals`);
          } else if (serviceCards.length > 0) {
            results.passed.push(`${testLabel}: All ${serviceCards.length} service cards have visible mini visuals ✓`);
          }
          
          // BUG CHECK 5: Grid layout - no holes, reasonable card count per row
          const gridLayout = await page.evaluate(() => {
            const grid = document.querySelector('[id="services-grid"] [class*="grid"]');
            if (!grid) return null;
            
            const styles = window.getComputedStyle(grid);
            const cards = grid.querySelectorAll('[class*="rounded-2xl"]').length;
            
            return {
              gridTemplateColumns: styles.gridTemplateColumns,
              gap: styles.gap,
              cardCount: cards,
              gridWidth: grid.getBoundingClientRect().width
            };
          });
          
          if (gridLayout && gridLayout.cardCount > 0) {
            results.passed.push(`${testLabel}: Grid has ${gridLayout.cardCount} cards, layout: ${gridLayout.gridTemplateColumns.split(' ').length} columns`);
          } else if (gridLayout) {
            results.warnings.push(`${testLabel}: Grid layout found but no cards visible`);
          }
          
          // BUG CHECK 6: Text readability (font size check)
          const textSizes = await page.evaluate(() => {
            const descriptions = Array.from(document.querySelectorAll('[id="services-grid"] p'));
            return descriptions.slice(0, 3).map(p => {
              const size = parseFloat(window.getComputedStyle(p).fontSize);
              return Math.round(size);
            });
          });
          
          const tooSmall = textSizes.filter(size => size < 14);
          if (tooSmall.length > 0) {
            results.failed.push(`${testLabel}: Text too small: ${tooSmall.join('px, ')}px (should be ≥14px)`);
          } else if (textSizes.length > 0) {
            results.passed.push(`${testLabel}: Text sizes OK: ${textSizes.join('px, ')}px ✓`);
          }
          
          // BUG CHECK 7: Sections not clipped (full height visible)
          const sectionsClipped = await page.evaluate(() => {
            const sections = Array.from(document.querySelectorAll('section'));
            return sections.map(section => {
              const rect = section.getBoundingClientRect();
              const styles = window.getComputedStyle(section);
              const heading = section.querySelector('h2')?.textContent?.substring(0, 30);
              
              return {
                heading: heading || 'Unnamed',
                height: rect.height,
                overflow: styles.overflow,
                isClipped: styles.overflow === 'hidden' && rect.height < 200
              };
            }).filter(s => s.isClipped);
          });
          
          if (sectionsClipped.length > 0) {
            results.failed.push(`${testLabel}: ${sectionsClipped.length} sections appear clipped: ${sectionsClipped.map(s => s.heading).join(', ')}`);
          } else {
            results.passed.push(`${testLabel}: No clipped sections ✓`);
          }
          
          // BUG CHECK 8: Light theme is actually light (body background)
          if (combo.theme === 'light') {
            const bgColor = await page.evaluate(() => {
              const body = document.body;
              const bg = window.getComputedStyle(body).backgroundColor;
              const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (match) {
                const [_, r, g, b] = match.map(Number);
                return { r, g, b, isLight: r > 200 && g > 200 && b > 200 };
              }
              return { isLight: false };
            });
            
            if (!bgColor.isLight) {
              results.failed.push(`${testLabel}: Light theme has dark background rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
            } else {
              results.passed.push(`${testLabel}: Light theme background is light rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b}) ✓`);
            }
          }
          
          // Performance check: measure CLS and LCP
          const metrics = await page.evaluate(() => {
            return new Promise((resolve) => {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lcp = entries.filter(e => e.entryType === 'largest-contentful-paint').slice(-1)[0];
                resolve({
                  lcp: lcp ? Math.round(lcp.renderTime) : null
                });
              });
              observer.observe({ entryTypes: ['largest-contentful-paint'] });
              setTimeout(() => resolve({ lcp: null }), 2000);
            });
          });
          
          if (metrics.lcp && metrics.lcp < 2000) {
            results.passed.push(`${testLabel}: LCP = ${metrics.lcp}ms (target <2000ms) ✓`);
          } else if (metrics.lcp) {
            results.warnings.push(`${testLabel}: LCP = ${metrics.lcp}ms (target <2000ms)`);
          }
          
          console.log(`    ✓ ${combo.label} completed`);
          
        } catch (error) {
          results.failed.push(`${testLabel}: Test error - ${error.message}`);
          console.log(`    ✗ ${combo.label} failed: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal test error:', error);
  } finally {
    await browser.close();
  }

  // Print results
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 TEST RESULTS\n');
  
  console.log(`✅ PASSED: ${results.passed.length}`);
  if (results.passed.length > 0 && results.passed.length <= 10) {
    results.passed.forEach(p => console.log(`  ✓ ${p}`));
  } else if (results.passed.length > 10) {
    console.log(`  (Showing first 10 of ${results.passed.length})`);
    results.passed.slice(0, 10).forEach(p => console.log(`  ✓ ${p}`));
  }
  
  console.log(`\n⚠️  WARNINGS: ${results.warnings.length}`);
  results.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  
  console.log(`\n❌ FAILED: ${results.failed.length}`);
  results.failed.forEach(f => console.log(`  ✗ ${f}`));
  
  console.log('\n' + '='.repeat(70));
  
  if (results.failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED!\n');
    return true;
  } else {
    console.log(`\n⚠️  ${results.failed.length} tests failed\n`);
    return false;
  }
}

// Run tests
testServicesPage()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
