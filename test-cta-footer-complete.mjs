import { chromium } from 'playwright';

// Helper to calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const [rs, gs, bs] = [r, g, b].map(val => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

(async () => {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   TESTING CTA + FOOTER - COMPLETE VERIFICATION');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const results = { passed: 0, failed: 0, details: [] };

  const viewports = [
    { name: 'Mobile (360px)', width: 360, height: 640 },
    { name: 'Mobile (390px)', width: 390, height: 844 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1024px)', width: 1024, height: 768 },
    { name: 'Desktop (1440px)', width: 1440, height: 900 },
    { name: 'Desktop (1920px)', width: 1920, height: 1080 },
  ];

  const languages = [
    { code: 'en', name: 'English', path: '/services' },
    { code: 'ar', name: 'Arabic', path: '/ar/services' },
  ];

  for (const lang of languages) {
    for (const viewport of viewports) {
      const testName = `${lang.name} - ${viewport.name}`;
      console.log(`\n📱 Testing: ${testName}`);
      console.log('─'.repeat(50));

      const context = await browser.newContext({ 
        viewport: { width: viewport.width, height: viewport.height } 
      });
      const page = await context.newPage();

      try {
        await page.goto(`http://localhost:4174${lang.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);

        // === TEST 1: CTA has dark background ===
        const ctaSection = page.locator('section').filter({ hasText: /Like What You See|هل أعجبك ما/i }).first();
        const ctaCount = await ctaSection.count();
        
        if (ctaCount === 0) {
          console.log('❌ TEST 1 FAILED: CTA section not found');
          results.failed++;
          results.details.push(`${testName}: CTA not found`);
        } else {
          const ctaBg = await ctaSection.evaluate(el => {
            const computed = window.getComputedStyle(el);
            const bg = computed.backgroundColor;
            const bgImage = computed.backgroundImage;
            const hasInverseClass = el.classList.contains('inverse-surface') || 
                                   el.closest('.inverse-surface') !== null;
            return { bg, bgImage, hasInverseClass, classes: el.className };
          });

          const isDark = ctaBg.bg.includes('18, 35, 44') || // #12232C
                        ctaBg.bg.includes('7, 14, 18') ||   // #070E12
                        ctaBg.bg.includes('rgb(18, 35, 44)') ||
                        ctaBg.bg.includes('rgb(7, 14, 18)') ||
                        ctaBg.hasInverseClass;

          if (isDark) {
            console.log(`✅ TEST 1 PASSED: CTA has dark inverse background`);
            console.log(`   Background: ${ctaBg.bg}`);
            console.log(`   Has inverse class: ${ctaBg.hasInverseClass}`);
            results.passed++;
          } else {
            console.log(`❌ TEST 1 FAILED: CTA background is not dark`);
            console.log(`   Background: ${ctaBg.bg}`);
            console.log(`   Has inverse class: ${ctaBg.hasInverseClass}`);
            console.log(`   Classes: ${ctaBg.classes}`);
            results.failed++;
            results.details.push(`${testName}: CTA bg not dark (${ctaBg.bg})`);
          }

          // === TEST 2: CTA text contrast ===
          const ctaHeading = ctaSection.locator('h2').first();
          const headingCount = await ctaHeading.count();
          if (headingCount > 0) {
            const headingColors = await ctaHeading.evaluate(el => {
              const computed = window.getComputedStyle(el);
              const parent = el.closest('section') || el.parentElement;
              const parentBg = window.getComputedStyle(parent).backgroundColor;
              return { 
                color: computed.color, 
                bg: parentBg,
                text: el.textContent.trim().slice(0, 30)
              };
            });

            const contrast = getContrastRatio(headingColors.color, headingColors.bg);
            const passesAA = contrast >= 4.5; // Large text needs 3:1, we check 4.5:1 for normal
            
            if (passesAA) {
              console.log(`✅ TEST 2 PASSED: CTA heading contrast ${contrast.toFixed(2)}:1 (AA)`);
              results.passed++;
            } else {
              console.log(`❌ TEST 2 FAILED: CTA heading contrast ${contrast.toFixed(2)}:1 (needs 4.5:1)`);
              console.log(`   Color: ${headingColors.color}`);
              console.log(`   Background: ${headingColors.bg}`);
              results.failed++;
              results.details.push(`${testName}: CTA heading contrast ${contrast.toFixed(2)}:1`);
            }
          }
        }

        // === TEST 3: Footer has dark background ===
        const footer = page.locator('footer').first();
        const footerCount = await footer.count();
        
        if (footerCount === 0) {
          console.log('❌ TEST 3 FAILED: Footer not found');
          results.failed++;
          results.details.push(`${testName}: Footer not found`);
        } else {
          const footerBg = await footer.evaluate(el => {
            const computed = window.getComputedStyle(el);
            const bg = computed.backgroundColor;
            const hasInverseClass = el.classList.contains('inverse-surface') || 
                                   el.closest('.inverse-surface') !== null;
            return { bg, hasInverseClass, classes: el.className };
          });

          const isDark = footerBg.bg.includes('18, 35, 44') || 
                        footerBg.bg.includes('7, 14, 18') ||
                        footerBg.bg.includes('rgb(18, 35, 44)') ||
                        footerBg.bg.includes('rgb(7, 14, 18)') ||
                        footerBg.hasInverseClass;

          if (isDark) {
            console.log(`✅ TEST 3 PASSED: Footer has dark inverse background`);
            console.log(`   Background: ${footerBg.bg}`);
            results.passed++;
          } else {
            console.log(`❌ TEST 3 FAILED: Footer background is not dark`);
            console.log(`   Background: ${footerBg.bg}`);
            console.log(`   Classes: ${footerBg.classes}`);
            results.failed++;
            results.details.push(`${testName}: Footer bg not dark (${footerBg.bg})`);
          }

          // === TEST 4: Footer link contrast ===
          const footerLink = footer.locator('a').first();
          const linkCount = await footerLink.count();
          if (linkCount > 0) {
            const linkColors = await footerLink.evaluate(el => {
              const computed = window.getComputedStyle(el);
              const parent = el.closest('footer') || el.parentElement;
              const parentBg = window.getComputedStyle(parent).backgroundColor;
              return { 
                color: computed.color, 
                bg: parentBg,
                text: el.textContent.trim()
              };
            });

            const contrast = getContrastRatio(linkColors.color, linkColors.bg);
            const passesAA = contrast >= 4.5;
            
            if (passesAA) {
              console.log(`✅ TEST 4 PASSED: Footer link contrast ${contrast.toFixed(2)}:1 (AA)`);
              results.passed++;
            } else {
              console.log(`❌ TEST 4 FAILED: Footer link contrast ${contrast.toFixed(2)}:1`);
              console.log(`   Color: ${linkColors.color}`);
              console.log(`   Background: ${linkColors.bg}`);
              results.failed++;
              results.details.push(`${testName}: Footer link contrast ${contrast.toFixed(2)}:1`);
            }
          }
        }

        // === TEST 5: Device stage exists and has content ===
        const deviceStage = ctaSection.locator('div').filter({ has: page.locator('[class*="aspect"]') }).first();
        const stageCount = await deviceStage.count();
        
        if (stageCount > 0) {
          const stageInfo = await deviceStage.evaluate(el => {
            const images = el.querySelectorAll('img');
            const hasVisibleContent = el.querySelector('[class*="rounded"]') !== null;
            return { 
              hasImages: images.length > 0,
              imageCount: images.length,
              hasVisibleContent,
              innerHTML: el.innerHTML.slice(0, 100)
            };
          });

          if (stageInfo.hasVisibleContent) {
            console.log(`✅ TEST 5 PASSED: Device stage exists with content`);
            console.log(`   Images: ${stageInfo.imageCount}`);
            results.passed++;
          } else {
            console.log(`❌ TEST 5 FAILED: Device stage exists but no visible content`);
            results.failed++;
            results.details.push(`${testName}: Device stage empty`);
          }
        } else {
          console.log(`❌ TEST 5 FAILED: Device stage not found`);
          results.failed++;
          results.details.push(`${testName}: No device stage`);
        }

        // === TEST 6: CTA buttons exist ===
        const primaryBtn = ctaSection.locator('a, button').filter({ hasText: /Contact Us Now|تواصل معنا الآن/i }).first();
        const primaryCount = await primaryBtn.count();
        
        if (primaryCount > 0) {
          console.log(`✅ TEST 6 PASSED: Primary CTA button exists`);
          results.passed++;
        } else {
          console.log(`❌ TEST 6 FAILED: Primary CTA button not found`);
          results.failed++;
          results.details.push(`${testName}: No primary CTA button`);
        }

        // === TEST 7: Floating buttons positioned correctly ===
        const whatsappBtn = page.locator('[class*="whatsapp"], a[href*="wa.me"]').first();
        const scrollBtn = page.locator('button[aria-label*="Scroll"], button[aria-label*="top"]').first();
        
        const whatsappCount = await whatsappBtn.count();
        const scrollCount = await scrollBtn.count();
        
        let floatingButtonsOk = true;
        
        if (whatsappCount > 0 && scrollCount > 0) {
          const positions = await page.evaluate(() => {
            const whatsapp = document.querySelector('[class*="whatsapp"], a[href*="wa.me"]');
            const scroll = document.querySelector('button[aria-label*="Scroll"], button[aria-label*="top"]');
            
            if (!whatsapp || !scroll) return null;
            
            const whatsappRect = whatsapp.getBoundingClientRect();
            const scrollRect = scroll.getBoundingClientRect();
            
            return {
              whatsapp: { bottom: whatsappRect.bottom, left: whatsappRect.left, right: whatsappRect.right },
              scroll: { bottom: scrollRect.bottom, left: scrollRect.left, right: scrollRect.right },
              overlap: !(whatsappRect.right < scrollRect.left || whatsappRect.left > scrollRect.right)
            };
          });

          if (positions && !positions.overlap) {
            console.log(`✅ TEST 7 PASSED: Floating buttons positioned correctly, no overlap`);
            results.passed++;
          } else {
            console.log(`❌ TEST 7 FAILED: Floating buttons overlap`);
            floatingButtonsOk = false;
            results.failed++;
            results.details.push(`${testName}: Floating buttons overlap`);
          }
        } else {
          console.log(`⚠️  TEST 7 SKIPPED: One or both floating buttons not visible`);
        }

        // Take screenshot
        const filename = `services-cta-footer-${lang.code}-${viewport.width}-AFTER.png`;
        await page.screenshot({ path: filename, fullPage: true });
        console.log(`📸 Screenshot saved: ${filename}`);

      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        results.failed++;
        results.details.push(`${testName}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();

  // === FINAL SUMMARY ===
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('              FINAL TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`✅ PASSED: ${results.passed}`);
  console.log(`❌ FAILED: ${results.failed}`);
  console.log(`📊 TOTAL:  ${results.passed + results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n⚠️  FAILED TESTS:');
    results.details.forEach((detail, i) => {
      console.log(`   ${i + 1}. ${detail}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════\n');

  process.exit(results.failed > 0 ? 1 : 0);
})();
