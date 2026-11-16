import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

const pages = [
  { name: 'Home', url: '/' },
  { name: 'Services', url: '/services' },
  { name: 'Mockups', url: '/mockups' },
  { name: 'MockupDetail', url: '/mockups/healthcare-admin' },
  { name: 'About', url: '/about' },
  { name: 'Contact', url: '/contact' }
];

async function measurePage(url, name) {
  const results = [];
  
  for (let run = 1; run <= 3; run++) {
    console.log(`\n[RUN ${run}/3] ${name}: ${url}`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Linux; Android 10; Moto G Power) AppleWebKit/537.36',
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true
    });
    
    const page = await context.newPage();
    
    // Track metrics
    let resourceSize = 0;
    let requestCount = 0;
    
    page.on('response', async (response) => {
      try {
        const body = await response.body();
        resourceSize += body.length;
        requestCount++;
      } catch {}
    });
    
    try {
      await page.goto(BASE_URL + url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Get Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Try to get LCP
          let lcp = 0;
          if (window.performance && performance.getEntriesByType) {
            const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
            if (lcpEntries.length > 0) {
              lcp = lcpEntries[lcpEntries.length - 1].renderTime || lcpEntries[lcpEntries.length - 1].loadTime;
            }
          }
          
          // Try to get CLS
          let cls = 0;
          if (window.performance && performance.getEntriesByType) {
            const clsEntries = performance.getEntriesByType('layout-shift');
            cls = clsEntries.reduce((sum, entry) => {
              if (!entry.hadRecentInput) {
                return sum + entry.value;
              }
              return sum;
            }, 0);
          }
          
          resolve({ lcp, cls });
        });
      });
      
      const data = {
        run,
        lcp: Math.round(metrics.lcp),
        cls: metrics.cls.toFixed(3),
        totalBytes: Math.round(resourceSize / 1024),
        requests: requestCount
      };
      
      results.push(data);
      console.log(`  LCP: ${data.lcp}ms, CLS: ${data.cls}, Size: ${data.totalBytes}KB, Reqs: ${data.requests}`);
      
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
    
    await browser.close();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Calculate median
  const sorted = (arr, key) => [...arr].sort((a, b) => a[key] - b[key]);
  const median = {
    name,
    url,
    lcp: sorted(results, 'lcp')[1].lcp,
    cls: sorted(results, 'cls')[1].cls,
    totalBytes: sorted(results, 'totalBytes')[1].totalBytes,
    requests: sorted(results, 'requests')[1].requests
  };
  
  console.log(`\n[MEDIAN] ${name}: LCP ${median.lcp}ms, CLS ${median.cls}, ${median.totalBytes}KB, ${median.requests} reqs`);
  
  return median;
}

async function main() {
  console.log('=== PERFORMANCE BASELINE (Mobile - 412x915) ===\n');
  
  const allResults = [];
  
  for (const page of pages) {
    const result = await measurePage(page.url, page.name);
    allResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n\n=== SUMMARY TABLE ===');
  console.log('Page         | LCP(ms) | CLS   | KB   | Reqs');
  console.log('-------------|---------|-------|------|------');
  allResults.forEach(r => {
    console.log(`${r.name.padEnd(12)} | ${String(r.lcp).padStart(7)} | ${r.cls} | ${String(r.totalBytes).padStart(4)} | ${String(r.requests).padStart(4)}`);
  });
}

main().catch(console.error);
