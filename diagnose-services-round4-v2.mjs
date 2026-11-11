import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const url = 'http://localhost:4173/services';

async function diagnose() {
  console.log('🔍 Starting Round 4 DEEP diagnosis...\n');
  
  const browser = await chromium.launch({ headless: false }); // Show browser to see what's happening
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ BROWSER ERROR: ${msg.text()}`);
    }
  });
  
  // Navigate and wait for page load
  console.log(`📄 Loading ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for React hydration
  
  const report = {
    timestamp: new Date().toISOString(),
    url,
    findings: []
  };
  
  // Check if React rendered
  console.log('\n🔍 Checking React mount...');
  const hasReactRoot = await page.evaluate(() => {
    return !!document.querySelector('#root');
  });
  report.findings.push({ check: 'React Root', result: hasReactRoot ? 'FOUND' : 'MISSING' });
  console.log(`  React root: ${hasReactRoot ? '✓' : '✗'}`);
  
  // Check for loading state
  console.log('\n🔍 Checking loading state...');
  const loadingElement = await page.locator('[role="status"], .animate-spin').count();
  report.findings.push({ check: 'Loading Spinner', result: loadingElement > 0 ? 'STUCK IN LOADING' : 'NONE' });
  console.log(`  Loading spinners: ${loadingElement}`);
  
  // Check for error messages
  console.log('\n🔍 Checking for error messages...');
  const errorText = await page.locator('text=/error|Error|ERROR|went wrong|failed/i').allTextContents();
  report.findings.push({ check: 'Error Messages', result: errorText.length > 0 ? errorText : 'NONE' });
  if (errorText.length > 0) {
    console.log(`  ❌ Errors found:`, errorText);
  } else {
    console.log(`  ✓ No error messages`);
  }
  
  // BUG 1: HERO FADED/WASHED OUT
  console.log('\n🐛 BUG 1: Hero fade analysis...');
  const heroHeading = await page.locator('h1').first();
  const heroStyles = await heroHeading.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      opacity: computed.opacity,
      filter: computed.filter,
      fontWeight: computed.fontWeight,
      fontSize: computed.fontSize,
      textContent: el.textContent
    };
  });
  report.findings.push({ check: 'Hero Heading', ...heroStyles });
  console.log(`  Color: ${heroStyles.color}`);
  console.log(`  Opacity: ${heroStyles.opacity}`);
  console.log(`  Font weight: ${heroStyles.fontWeight}`);
  
  // Check all InverseSurface tokens
  console.log('\n🔍 Checking InverseSurface backgrounds...');
  const inverseSurfaces = await page.locator('[class*="InverseSurface"], [data-token]').count();
  console.log(`  InverseSurface elements: ${inverseSurfaces}`);
  
  // BUG 4: CONSTELLATION
  console.log('\n🐛 BUG 4: Constellation analysis...');
  const constellationContainer = await page.locator('[class*="constellation"], [class*="Constellation"]').first();
  if (await constellationContainer.count() > 0) {
    const constData = await constellationContainer.evaluate(el => {
      const nodes = el.querySelectorAll('[class*="node"]');
      const lines = el.querySelectorAll('line');
      const cards = el.querySelectorAll('[class*="card"], [class*="Card"]');
      
      return {
        nodesCount: nodes.length,
        linesCount: lines.length,
        cardsCount: cards.length,
        containerClass: el.className,
        innerHTML: el.innerHTML.substring(0, 500)
      };
    });
    report.findings.push({ check: 'Constellation', ...constData });
    console.log(`  Nodes: ${constData.nodesCount}`);
    console.log(`  Lines: ${constData.linesCount}`);
    console.log(`  Cards: ${constData.cardsCount}`);
  } else {
    console.log(`  ❌ Constellation container not found`);
    report.findings.push({ check: 'Constellation', result: 'NOT FOUND' });
  }
  
  // BUG 5 & 7: SERVICES DATA
  console.log('\n🐛 BUG 5 & 7: Services data analysis...');
  const servicesSection = await page.locator('[id*="service"], section:has-text("Services")').first();
  if (await servicesSection.count() > 0) {
    const servicesData = await servicesSection.evaluate(el => {
      const cards = el.querySelectorAll('[class*="card"], [class*="Card"]');
      const titles = Array.from(cards).map(card => {
        const h2 = card.querySelector('h2, h3');
        return h2 ? h2.textContent.trim() : 'NO TITLE';
      });
      
      return {
        cardsCount: cards.length,
        titles: titles,
        sectionHTML: el.innerHTML.substring(0, 800)
      };
    });
    report.findings.push({ check: 'Services Grid', ...servicesData });
    console.log(`  Service cards: ${servicesData.cardsCount}`);
    console.log(`  Titles:`, servicesData.titles);
  } else {
    console.log(`  ❌ Services section not found`);
    report.findings.push({ check: 'Services Grid', result: 'NOT FOUND' });
  }
  
  // Check network requests
  console.log('\n🔍 Checking API calls...');
  const apiCalls = await page.evaluate(() => {
    return window.performance.getEntriesByType('resource')
      .filter(r => r.name.includes('/services') || r.name.includes('supabase'))
      .map(r => ({
        url: r.name,
        status: r.responseStatus,
        duration: r.duration
      }));
  });
  report.findings.push({ check: 'API Calls', calls: apiCalls });
  console.log(`  API calls: ${apiCalls.length}`);
  apiCalls.forEach(call => {
    console.log(`    ${call.url} (${call.duration.toFixed(0)}ms)`);
  });
  
  // Check for Supabase client
  console.log('\n🔍 Checking Supabase...');
  const supabaseCheck = await page.evaluate(() => {
    return {
      hasSupabase: typeof window.supabase !== 'undefined',
      hasAuth: typeof window.supabase?.auth !== 'undefined'
    };
  });
  report.findings.push({ check: 'Supabase', ...supabaseCheck });
  console.log(`  Supabase client: ${supabaseCheck.hasSupabase ? '✓' : '✗'}`);
  
  // Take screenshots with annotations
  console.log('\n📸 Taking annotated screenshots...');
  
  // Full page
  await page.screenshot({ path: 'diagnosis-r4-fullpage.png', fullPage: true });
  
  // Hero section only
  const heroSection = await page.locator('section').first();
  if (await heroSection.count() > 0) {
    await heroSection.screenshot({ path: 'diagnosis-r4-hero.png' });
  }
  
  // Services grid
  const servicesGrid = await page.locator('[class*="grid"]').first();
  if (await servicesGrid.count() > 0) {
    await servicesGrid.screenshot({ path: 'diagnosis-r4-services.png' });
  }
  
  // Write report
  writeFileSync('diagnosis-round4-v2-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n✅ Deep diagnosis complete!');
  console.log('📄 Report: diagnosis-round4-v2-report.json');
  console.log('📸 Screenshots: diagnosis-r4-*.png\n');
  
  // Keep browser open for 30 seconds for manual inspection
  console.log('Browser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

diagnose().catch(console.error);
