import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testHeroFixes() {
  const browser = await chromium.launch({ headless: true });
  
  const testCases = [
    { theme: 'light', lang: 'en', width: 1440, height: 900, name: 'desktop-light-en' },
    { theme: 'dark', lang: 'en', width: 1440, height: 900, name: 'desktop-dark-en' },
    { theme: 'light', lang: 'ar', width: 1440, height: 900, name: 'desktop-light-ar' },
    { theme: 'dark', lang: 'ar', width: 1440, height: 900, name: 'desktop-dark-ar' },
    { theme: 'light', lang: 'en', width: 768, height: 1024, name: 'tablet-light-en' },
    { theme: 'light', lang: 'en', width: 390, height: 844, name: 'mobile-light-en' }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n📸 Testing: ${testCase.name} (${testCase.width}x${testCase.height})`);
    
    const page = await browser.newPage({ 
      viewport: { width: testCase.width, height: testCase.height }
    });
    
    // Set theme
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
    if (testCase.theme === 'dark') {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
    }
    
    // Set language
    if (testCase.lang === 'ar') {
      await page.goto('http://localhost:4174/ar/services', { waitUntil: 'networkidle' });
    } else {
      await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
    }
    
    await page.waitForTimeout(2000);
    
    // Analyze hero
    const analysis = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const p = document.querySelector('section p');
      const primaryBtn = document.querySelector('a[href*="contact"] button span, a[href*="contact"] button');
      const secondaryBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('Explore') || b.textContent.includes('استكشف')
      );
      const constellationSvg = document.querySelector('svg line[x1="50%"]');
      const constellationLines = document.querySelectorAll('svg line[x1="50%"]');
      
      const getComputedWeight = (el) => {
        if (!el) return null;
        return parseInt(window.getComputedStyle(el).fontWeight);
      };
      
      const getComputedColor = (el) => {
        if (!el) return null;
        const rgb = window.getComputedStyle(el).color;
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return null;
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          hex: '#' + [match[1], match[2], match[3]].map(x => 
            parseInt(x).toString(16).padStart(2, '0')
          ).join('')
        };
      };
      
      const h1Lines = h1 ? h1.clientHeight / parseInt(window.getComputedStyle(h1).lineHeight) : 0;
      
      return {
        h1: {
          weight: getComputedWeight(h1),
          color: getComputedColor(h1),
          fontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
          lineCount: Math.round(h1Lines),
          text: h1 ? h1.textContent.substring(0, 50) : null
        },
        paragraph: {
          weight: getComputedWeight(p),
          color: getComputedColor(p)
        },
        primaryButton: {
          weight: getComputedWeight(primaryBtn),
          color: getComputedColor(primaryBtn)
        },
        secondaryButton: {
          weight: getComputedWeight(secondaryBtn),
          color: getComputedColor(secondaryBtn)
        },
        constellation: {
          hasLines: constellationLines.length > 0,
          lineCount: constellationLines.length
        }
      };
    });
    
    // Take screenshot
    const screenshotPath = `hero-screenshot-${testCase.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  ✅ Screenshot: ${screenshotPath}`);
    
    // Validate
    const issues = [];
    
    if (analysis.h1.weight < 700) issues.push(`H1 weight too low: ${analysis.h1.weight} (expected ≥700)`);
    if (analysis.h1.lineCount > 3) issues.push(`H1 wraps to ${analysis.h1.lineCount} lines (expected 2-3)`);
    if (analysis.paragraph.weight < 500) issues.push(`Paragraph weight too low: ${analysis.paragraph.weight} (expected ≥500)`);
    if (analysis.primaryButton.weight < 500) issues.push(`Primary button weight too low: ${analysis.primaryButton.weight} (expected ≥500)`);
    if (analysis.secondaryButton.weight < 500) issues.push(`Secondary button weight too low: ${analysis.secondaryButton.weight} (expected ≥500)`);
    if (!analysis.constellation.hasLines) issues.push('Constellation lines missing');
    if (analysis.constellation.lineCount < 5) issues.push(`Too few constellation lines: ${analysis.constellation.lineCount} (expected ≥5)`);
    
    results.push({
      testCase: testCase.name,
      analysis,
      issues,
      passed: issues.length === 0
    });
    
    // Print results
    console.log(`  H1: weight ${analysis.h1.weight}, ${analysis.h1.lineCount} lines, ${analysis.h1.fontSize}`);
    console.log(`  Paragraph: weight ${analysis.paragraph.weight}`);
    console.log(`  Primary Button: weight ${analysis.primaryButton.weight}`);
    console.log(`  Secondary Button: weight ${analysis.secondaryButton.weight}`);
    console.log(`  Constellation: ${analysis.constellation.lineCount} lines`);
    
    if (issues.length > 0) {
      console.log(`  ❌ ISSUES:`);
      issues.forEach(issue => console.log(`     - ${issue}`));
    } else {
      console.log(`  ✅ All checks passed!`);
    }
    
    await page.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n\n📊 TEST SUMMARY\n' + '='.repeat(60));
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Passed: ${passedCount}/${results.length}`);
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`\n${status} ${result.testCase}`);
    if (!result.passed) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });
  
  // Write JSON report
  writeFileSync('hero-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Detailed results saved to: hero-test-results.json');
}

testHeroFixes().catch(console.error);
