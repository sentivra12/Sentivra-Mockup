/**
 * Client Logos Strip Diagnosis
 * 
 * Captures:
 * 1. Network request for client_logos table
 * 2. Response data (including the "rr34r" row)
 * 3. Screenshot of home page (hero → stats, no logos strip)
 * 4. Console logs/errors
 * 5. Whether TrustedBySection is mounted in DOM
 */

import { test, expect } from '@playwright/test';

test.describe('Client Logos Strip - Diagnosis', () => {
  test('diagnose missing logos strip with network capture', async ({ page }) => {
    console.log('\n🔍 DIAGNOSIS START\n');

    // Capture network requests
    const requests = [];
    const responses = [];

    page.on('request', req => {
      if (req.url().includes('client_logos')) {
        requests.push({
          url: req.url(),
          method: req.method(),
          headers: req.headers(),
        });
        console.log(`📤 REQUEST: ${req.method()} ${req.url()}`);
      }
    });

    page.on('response', async res => {
      if (res.url().includes('client_logos')) {
        const status = res.status();
        let body = null;
        try {
          body = await res.json();
        } catch {
          body = await res.text();
        }
        responses.push({
          url: res.url(),
          status,
          body,
        });
        console.log(`📥 RESPONSE: ${status} ${res.url()}`);
        console.log(`   Body:`, JSON.stringify(body, null, 2));
      }
    });

    // Capture console
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (text.includes('TrustedBy') || text.includes('client_logos') || text.includes('logo')) {
        console.log(`🖥️  CONSOLE [${msg.type()}]: ${text}`);
      }
    });

    // Navigate to home
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    // Wait a bit for React to render
    await page.waitForTimeout(2000);

    // Check if TrustedBySection is in DOM
    const trustedBySection = await page.locator('section[aria-label*="logo" i], section[aria-label*="trusted" i], section:has-text("Trusted By")').first();
    const sectionExists = await trustedBySection.count() > 0;
    console.log(`\n📍 TrustedBySection in DOM: ${sectionExists}`);

    if (sectionExists) {
      const sectionHTML = await trustedBySection.innerHTML();
      console.log(`   Section HTML (first 500 chars):`, sectionHTML.substring(0, 500));
      
      // Check for actual client badges
      const badges = await trustedBySection.locator('[role="listitem"]').count();
      console.log(`   Number of client badges in DOM: ${badges}`);
      
      // Check for "rr34r" text
      const hasRr34rText = await trustedBySection.locator('text="rr34r"').count();
      console.log(`   Contains "rr34r" text: ${hasRr34rText > 0}`);
      
      // Check for images
      const images = await trustedBySection.locator('img').count();
      console.log(`   Number of <img> tags: ${images}`);
      
      if (images > 0) {
        const firstImg = await trustedBySection.locator('img').first();
        const imgSrc = await firstImg.getAttribute('src');
        const imgAlt = await firstImg.getAttribute('alt');
        console.log(`   First image src: ${imgSrc}`);
        console.log(`   First image alt: ${imgAlt}`);
      }
    }

    // Check if section is visible
    if (sectionExists) {
      const isVisible = await trustedBySection.isVisible();
      console.log(`   Section visible: ${isVisible}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/client-logos-diagnosis.png', fullPage: true });
    console.log(`\n📸 Screenshot saved: tests/screenshots/client-logos-diagnosis.png`);

    // Summary
    console.log(`\n📊 DIAGNOSIS SUMMARY:`);
    console.log(`   Requests to client_logos: ${requests.length}`);
    console.log(`   Responses from client_logos: ${responses.length}`);
    
    if (responses.length > 0) {
      const res = responses[0];
      console.log(`\n   Response status: ${res.status}`);
      console.log(`   Response body:`, JSON.stringify(res.body, null, 2));
      
      if (Array.isArray(res.body)) {
        console.log(`   Number of rows returned: ${res.body.length}`);
        if (res.body.length > 0) {
          console.log(`   First row:`, res.body[0]);
          const hasRr34r = res.body.some(row => row.client_name === 'rr34r');
          console.log(`   Contains "rr34r": ${hasRr34r}`);
        }
      }
    } else {
      console.log(`   ❌ NO REQUEST TO client_logos TABLE`);
    }

    console.log(`\n   TrustedBySection mounted: ${sectionExists}`);
    console.log(`\n🔍 DIAGNOSIS END\n`);
  });
});
