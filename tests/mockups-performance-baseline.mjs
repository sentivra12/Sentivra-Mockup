/**
 * Mockups Performance Baseline - Phase 1 Measurement
 * 
 * Lighthouse mobile (Moto G Power, Slow 4G)
 * 3 runs, report median
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4173';
const PAGES = [
  { url: `${BASE_URL}/mockups`, name: 'mockups-list' },
  { url: `${BASE_URL}/mockups/modern-dashboard`, name: 'mockups-detail' },
];

const config = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1600,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36',
  },
};

function runLighthouse(url) {
  return new Promise((resolve, reject) => {
    const configJson = JSON.stringify(config);
    const args = [
      url,
      '--output=json',
      '--output-path=stdout',
      '--only-categories=performance',
      '--chrome-flags="--headless --no-sandbox"',
      `--config=${configJson}`,
    ];

    const child = spawn('lighthouse', args, { shell: true });
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Lighthouse failed: ${errorOutput}`));
      } else {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse output: ${e.message}`));
        }
      }
    });
  });
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function measurePage(page) {
  console.log(`\n📊 Measuring: ${page.name}`);
  console.log(`   URL: ${page.url}`);
  console.log(`   Running 3 Lighthouse audits...`);

  const results = [];

  for (let i = 1; i <= 3; i++) {
    console.log(`   Run ${i}/3...`);
    try {
      const result = await runLighthouse(page.url);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between runs
    } catch (error) {
      console.error(`   ❌ Run ${i} failed:`, error.message);
    }
  }

  if (results.length === 0) {
    console.error(`   ❌ All runs failed for ${page.name}`);
    return null;
  }

  // Extract metrics
  const scores = results.map(r => r.categories.performance.score * 100);
  const lcpValues = results.map(r => r.audits['largest-contentful-paint'].numericValue);
  const clsValues = results.map(r => r.audits['cumulative-layout-shift'].numericValue);
  const tbtValues = results.map(r => r.audits['total-blocking-time'].numericValue);
  const inpValues = results.map(r => r.audits['max-potential-fid']?.numericValue || 0);
  
  // Network requests from last run
  const lastRun = results[results.length - 1];
  const networkRequests = lastRun.audits['network-requests'].details.items;
  
  // Calculate bytes by type
  const bytesByType = {
    js: 0,
    css: 0,
    images: 0,
    fonts: 0,
    total: 0,
  };

  networkRequests.forEach(req => {
    const bytes = req.transferSize || 0;
    bytesByType.total += bytes;

    const url = req.url || '';
    const mimeType = req.mimeType || '';

    if (mimeType.includes('javascript') || url.endsWith('.js')) {
      bytesByType.js += bytes;
    } else if (mimeType.includes('css') || url.endsWith('.css')) {
      bytesByType.css += bytes;
    } else if (mimeType.includes('image') || /\.(png|jpg|jpeg|webp|svg|gif)/.test(url)) {
      bytesByType.images += bytes;
    } else if (mimeType.includes('font') || /\.(woff|woff2|ttf|otf)/.test(url)) {
      bytesByType.fonts += bytes;
    }
  });

  // LCP element
  const lcpElement = lastRun.audits['largest-contentful-paint-element']?.displayValue || 'N/A';

  // Long tasks
  const longTasks = lastRun.audits['long-tasks']?.details?.items || [];
  const longTasksOver50 = longTasks.filter(t => t.duration > 50);

  // Image details
  const images = networkRequests.filter(req => {
    const mime = req.mimeType || '';
    const url = req.url || '';
    return mime.includes('image') || /\.(png|jpg|jpeg|webp|svg|gif)/.test(url);
  }).map(img => ({
    url: img.url,
    bytes: img.transferSize,
    format: (img.mimeType || 'unknown').split('/')[1],
  }));

  const report = {
    name: page.name,
    url: page.url,
    runs: results.length,
    performance: {
      median: Math.round(median(scores)),
      runs: scores.map(s => Math.round(s)),
    },
    lcp: {
      median: Math.round(median(lcpValues)),
      runs: lcpValues.map(v => Math.round(v)),
      element: lcpElement,
    },
    cls: {
      median: median(clsValues).toFixed(3),
      runs: clsValues.map(v => v.toFixed(3)),
    },
    tbt: {
      median: Math.round(median(tbtValues)),
      runs: tbtValues.map(v => Math.round(v)),
    },
    inp: {
      median: Math.round(median(inpValues)),
      runs: inpValues.map(v => Math.round(v)),
    },
    bytes: {
      js: Math.round(bytesByType.js / 1024),
      css: Math.round(bytesByType.css / 1024),
      images: Math.round(bytesByType.images / 1024),
      fonts: Math.round(bytesByType.fonts / 1024),
      total: Math.round(bytesByType.total / 1024),
    },
    requests: networkRequests.length,
    longTasks: {
      total: longTasks.length,
      over50ms: longTasksOver50.length,
      longest: longTasks.length > 0 ? Math.round(Math.max(...longTasks.map(t => t.duration))) : 0,
    },
    images: images,
  };

  return report;
}

async function main() {
  console.log('🚀 Mockups Performance Baseline - Phase 1\n');
  console.log('Device: Moto G Power');
  console.log('Network: Slow 4G (1.6 Mbps, 150ms RTT, 4x CPU)');
  console.log('='.repeat(60));

  const reports = [];

  for (const page of PAGES) {
    const report = await measurePage(page);
    if (report) {
      reports.push(report);
    }
  }

  // Generate table
  console.log('\n\n' + '='.repeat(80));
  console.log('BASELINE RESULTS (MEDIAN OF 3 RUNS)');
  console.log('='.repeat(80) + '\n');

  reports.forEach(report => {
    console.log(`📄 ${report.name.toUpperCase()}`);
    console.log(`   URL: ${report.url}`);
    console.log(`   Performance Score: ${report.performance.median} (runs: ${report.performance.runs.join(', ')})`);
    console.log(`   LCP: ${report.lcp.median}ms (runs: ${report.lcp.runs.join(', ')}ms)`);
    console.log(`   LCP Element: ${report.lcp.element}`);
    console.log(`   CLS: ${report.cls.median} (runs: ${report.cls.runs.join(', ')})`);
    console.log(`   TBT: ${report.tbt.median}ms (runs: ${report.tbt.runs.join(', ')}ms)`);
    console.log(`   INP: ${report.inp.median}ms (runs: ${report.inp.runs.join(', ')}ms)`);
    console.log(`   Total Bytes: ${report.bytes.total}KB`);
    console.log(`     - JS: ${report.bytes.js}KB`);
    console.log(`     - CSS: ${report.bytes.css}KB`);
    console.log(`     - Images: ${report.bytes.images}KB`);
    console.log(`     - Fonts: ${report.bytes.fonts}KB`);
    console.log(`   Requests: ${report.requests}`);
    console.log(`   Long Tasks: ${report.longTasks.total} total, ${report.longTasks.over50ms} >50ms, longest: ${report.longTasks.longest}ms`);
    console.log(`   Images Loaded: ${report.images.length}`);
    report.images.slice(0, 10).forEach((img, i) => {
      const url = img.url.split('/').pop().substring(0, 60);
      console.log(`     ${i + 1}. ${url} - ${Math.round(img.bytes / 1024)}KB (${img.format})`);
    });
    if (report.images.length > 10) {
      console.log(`     ... and ${report.images.length - 10} more images`);
    }
    console.log('');
  });

  // Save to file
  const outputPath = join(process.cwd(), 'tests', 'mockups-baseline-results.json');
  writeFileSync(outputPath, JSON.stringify(reports, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}\n`);
}

main().catch(console.error);
