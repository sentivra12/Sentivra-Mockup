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
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; Moto G Power) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    let totalBytes = 0;
    let reqCount = 0;
    
    page.on('response', async (r) => {
      try {
        const buffer = await r.body();
        totalBytes += buffer.length;
        reqCount++;
      } catch {}
    });
    
    await page.goto(BASE_URL + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      let lcp = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          lcp = entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
        }
      });
      
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        lcp = lcpEntries[lcpEntries.length - 1].renderTime || lcpEntries[lcpEntries.length - 1].loadTime;
      }
      
      let cls = 0;
      const shifts = performance.getEntriesByType('layout-shift');
      shifts.forEach(entry => {
        if (!entry.hadRecentInput) cls += entry.value;
      });
      
      let tbt = 0;
      const tasks = performance.getEntriesByType('longtask');
      tasks.forEach(task => {
        if (task.duration > 50) tbt += task.duration - 50;
      });
      
      return {
        fcp: Math.round(fcp),
        lcp: Math.round(lcp),
        cls: cls,
        tbt: Math.round(tbt),
        domInteractive: Math.round(perf.domInteractive),
        loadComplete: Math.round(perf.loadEventEnd)
      };
    });
    
    results.push({
      ...metrics,
      totalBytes: Math.round(totalBytes / 1024),
      requests: reqCount
    });
    
    console.log(`[${run}/3] ${name}: LCP ${metrics.lcp}ms, CLS ${metrics.cls.toFixed(3)}, ${Math.round(totalBytes/1024)}KB`);
    
    await browser.close();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  const median = (arr, key) => [...arr].sort((a,b) => a[key] - b[key])[1][key];
  
  return {
    name,
    lcp: median(results, 'lcp'),
    cls: median(results, 'cls').toFixed(3),
    fcp: median(results, 'fcp'),
    tbt: median(results, 'tbt'),
    bytes: median(results, 'totalBytes'),
    reqs: median(results, 'requests')
  };
}

(async () => {
  console.log('=== PERFORMANCE BASELINE ===\n');
  const all = [];
  for (const p of pages) {
    const r = await measurePage(p.url, p.name);
    all.push(r);
    console.log(`[MEDIAN] ${r.name}: LCP ${r.lcp}ms, CLS ${r.cls}, ${r.bytes}KB\n`);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Page         | LCP(ms) | CLS   | FCP(ms) | TBT(ms) | KB   | Reqs');
  console.log('-------------|---------|-------|---------|---------|------|-----');
  all.forEach(r => {
    console.log(`${r.name.padEnd(12)} | ${String(r.lcp).padStart(7)} | ${r.cls} | ${String(r.fcp).padStart(7)} | ${String(r.tbt).padStart(7)} | ${String(r.bytes).padStart(4)} | ${r.reqs}`);
  });
})();
