/**
 * Mockups Performance Baseline using Playwright
 * Measures: Performance metrics, network, images, long tasks
 */

import { test, expect, chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4173';

test.describe('Mockups Performance Baseline', () => {
  test('Measure /mockups performance', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    // Enable throttling
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 Kbps
      latency: 150, // 150ms RTT
    });

    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    // Track metrics
    const metrics = {
      url: `${BASE_URL}/mockups`,
      network: [],
      images: [],
      longTasks: [],
      cls: 0,
    };

    // Track network requests
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      
      try {
        const headers = await response.allHeaders();
        const contentType = headers['content-type'] || '';
        const contentLength = parseInt(headers['content-length'] || '0', 10);

        metrics.network.push({
          url,
          status,
          contentType,
          bytes: contentLength,
        });

        // Track images specifically
        if (contentType.includes('image')) {
          metrics.images.push({
            url,
            bytes: contentLength,
            format: contentType.split('/')[1] || 'unknown',
          });
        }
      } catch (e) {
        // Response might not have body
      }
    });

    // Navigate and measure
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/mockups`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Wait for content
    await page.waitForTimeout(3000);

    // Get Web Vitals using JS
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {
          lcp: 0,
          cls: 0,
          fcp: 0,
          lcpElement: '',
        };

        // Get LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          metrics.lcpElement = lastEntry.element?.tagName || 'unknown';
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Get CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metrics.cls = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });

        // Get FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            metrics.fcp = entries[0].startTime;
          }
        }).observe({ type: 'paint', buffered: true });

        setTimeout(() => resolve(metrics), 500);
      });
    });

    // Get long tasks
    const longTasks = await page.evaluate(() => {
      return performance.getEntriesByType('longtask').map(task => ({
        duration: Math.round(task.duration),
        startTime: Math.round(task.startTime),
      }));
    });

    // Count visible mockup cards
    const cardCount = await page.locator('[role="list"] > div').count();

    // Get image elements and their sizes
    const imageDetails = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src.substring(0, 100),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.width,
        displayHeight: img.height,
        loading: img.loading,
        fetchpriority: img.fetchPriority || 'auto',
      }));
    });

    // Aggregate by type
    const bytesByType = {
      js: 0,
      css: 0,
      images: 0,
      fonts: 0,
      other: 0,
    };

    metrics.network.forEach(req => {
      const { contentType, bytes } = req;
      if (contentType.includes('javascript')) bytesByType.js += bytes;
      else if (contentType.includes('css')) bytesByType.css += bytes;
      else if (contentType.includes('image')) bytesByType.images += bytes;
      else if (contentType.includes('font')) bytesByType.fonts += bytes;
      else bytesByType.other += bytes;
    });

    const totalBytes = Object.values(bytesByType).reduce((a, b) => a + b, 0);

    // Build report
    const report = {
      page: '/mockups',
      loadTime: `${loadTime}ms`,
      vitals: {
        lcp: `${Math.round(vitals.lcp)}ms`,
        lcpElement: vitals.lcpElement,
        cls: vitals.cls.toFixed(3),
        fcp: `${Math.round(vitals.fcp)}ms`,
      },
      network: {
        requests: metrics.network.length,
        totalBytes: `${Math.round(totalBytes / 1024)}KB`,
        byType: {
          js: `${Math.round(bytesByType.js / 1024)}KB`,
          css: `${Math.round(bytesByType.css / 1024)}KB`,
          images: `${Math.round(bytesByType.images / 1024)}KB`,
          fonts: `${Math.round(bytesByType.fonts / 1024)}KB`,
          other: `${Math.round(bytesByType.other / 1024)}KB`,
        },
      },
      images: {
        total: metrics.images.length,
        totalBytes: `${Math.round(bytesByType.images / 1024)}KB`,
        list: metrics.images.map(img => ({
          url: img.url.split('/').pop().substring(0, 60),
          bytes: `${Math.round(img.bytes / 1024)}KB`,
          format: img.format,
        })),
      },
      imageElements: imageDetails.slice(0, 15),
      longTasks: {
        total: longTasks.length,
        over50ms: longTasks.filter(t => t.duration > 50).length,
        longest: longTasks.length > 0 ? `${Math.max(...longTasks.map(t => t.duration))}ms` : '0ms',
        list: longTasks.filter(t => t.duration > 50).map(t => `${t.duration}ms at ${t.startTime}ms`),
      },
      mockupCards: cardCount,
    };

    // Log report
    console.log('\n' + '='.repeat(80));
    console.log('MOCKUPS PAGE BASELINE (/mockups)');
    console.log('='.repeat(80));
    console.log(`Load Time: ${report.loadTime}`);
    console.log(`\nWeb Vitals:`);
    console.log(`  LCP: ${report.vitals.lcp} (${report.vitals.lcpElement})`);
    console.log(`  CLS: ${report.vitals.cls}`);
    console.log(`  FCP: ${report.vitals.fcp}`);
    console.log(`\nNetwork:`);
    console.log(`  Requests: ${report.network.requests}`);
    console.log(`  Total: ${report.network.totalBytes}`);
    console.log(`  JS: ${report.network.byType.js}`);
    console.log(`  CSS: ${report.network.byType.css}`);
    console.log(`  Images: ${report.network.byType.images}`);
    console.log(`  Fonts: ${report.network.byType.fonts}`);
    console.log(`\nImages:`);
    console.log(`  Count: ${report.images.total}`);
    console.log(`  Total Size: ${report.images.totalBytes}`);
    report.images.list.slice(0, 10).forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.url} - ${img.bytes} (${img.format})`);
    });
    if (report.images.list.length > 10) {
      console.log(`  ... and ${report.images.list.length - 10} more`);
    }
    console.log(`\nImage Elements (first 15):`);
    report.imageElements.forEach((img, i) => {
      const oversized = img.naturalWidth > img.displayWidth * 1.5 ? ' ⚠️ OVERSIZED' : '';
      console.log(`  ${i + 1}. ${img.naturalWidth}x${img.naturalHeight} → ${img.displayWidth}x${img.displayHeight}${oversized}`);
      console.log(`     loading="${img.loading}", fetchpriority="${img.fetchpriority}"`);
    });
    console.log(`\nLong Tasks:`);
    console.log(`  Total: ${report.longTasks.total}, >50ms: ${report.longTasks.over50ms}, Longest: ${report.longTasks.longest}`);
    if (report.longTasks.list.length > 0) {
      report.longTasks.list.slice(0, 5).forEach((task, i) => {
        console.log(`  ${i + 1}. ${task}`);
      });
    }
    console.log(`\nMockup Cards Visible: ${report.mockupCards}`);
    console.log('='.repeat(80) + '\n');

    // Save to file
    const outputPath = join(process.cwd(), 'tests', 'mockups-baseline-playwright.json');
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved to: ${outputPath}\n`);

    await browser.close();

    // Assertions
    expect(report.mockupCards).toBeGreaterThan(0);
  });
});
