/**
 * Demo Logos Diagnosis - Find where TC, IL, DS, EC, GS, SA, B come from
 */

import { test } from '@playwright/test';

test('diagnose demo logos in dev mode', async ({ page }) => {
  console.log('\n🔍 DEMO LOGOS DIAGNOSIS\n');

  // Capture network requests
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('client_logos')) {
      requests.push({ url: req.url(), method: req.method() });
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
      console.log(`📥 RESPONSE: ${status}`);
      console.log(`   Body:`, JSON.stringify(body, null, 2));
    }
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check for logos section
  const section = await page.locator('section[aria-label*="Trusted" i], section[aria-label*="logo" i]').first();
  const sectionVisible = await section.count() > 0 && await section.isVisible();
  console.log(`\n📍 Logos section visible: ${sectionVisible}`);

  if (sectionVisible) {
    // Count badges
    const badges = section.locator('[role="listitem"]');
    const count = await badges.count();
    console.log(`   Number of badges: ${count}`);

    // Check for DEMO badges
    const demoBadges = section.locator('text=/DEMO/i');
    const demoCount = await demoBadges.count();
    console.log(`   DEMO badges found: ${demoCount}`);

    // List all client names
    console.log(`\n   Client initials found:`);
    for (let i = 0; i < Math.min(count, 10); i++) {
      const badge = badges.nth(i);
      const text = await badge.textContent();
      console.log(`     ${i + 1}. ${text.trim().substring(0, 50)}`);
    }
  }

  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/demo-logos-dev.png',
    fullPage: true 
  });
  console.log(`\n📸 Screenshot: tests/screenshots/demo-logos-dev.png\n`);
});
