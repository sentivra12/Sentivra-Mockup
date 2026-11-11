import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('\n=== DIAGNOSING /services CTA + FOOTER ===\n');

  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to bottom to reveal CTA and footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'services-cta-footer-BEFORE.png', fullPage: true });

  // === BUG 1: Diagnose CTA background ===
  console.log('\n=== BUG 1: CTA BACKGROUND ===\n');
  
  const ctaSection = await page.locator('section').filter({ hasText: /Get Started|Contact Us|Ready to/i }).last();
  const ctaCount = await ctaSection.count();
  
  if (ctaCount > 0) {
    const ctaBg = await ctaSection.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        classes: el.className,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        color: computed.color,
        cssVarInverseBg: computed.getPropertyValue('--inverse-bg'),
        cssVarInverseText: computed.getPropertyValue('--inverse-text'),
      };
    });
    console.log('CTA Section computed styles:', JSON.stringify(ctaBg, null, 2));

    // Check parent wrappers
    const ctaParent = await ctaSection.evaluate(el => {
      let parent = el.parentElement;
      let results = [];
      while (parent && results.length < 3) {
        const computed = window.getComputedStyle(parent);
        results.push({
          tag: parent.tagName,
          classes: parent.className,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
        });
        parent = parent.parentElement;
      }
      return results;
    });
    console.log('CTA Parent chain:', JSON.stringify(ctaParent, null, 2));

    // Check heading color
    const ctaHeading = await page.locator('section').filter({ hasText: /Get Started|Contact Us|Ready to/i }).last().locator('h2, h1').first();
    const headingCount = await ctaHeading.count();
    if (headingCount > 0) {
      const headingColor = await ctaHeading.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          text: el.textContent.trim().slice(0, 50),
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });
      console.log('CTA Heading color:', JSON.stringify(headingColor, null, 2));
    }
  } else {
    console.log('❌ CTA section not found');
  }

  // === BUG 1: Diagnose Footer background ===
  console.log('\n=== BUG 1: FOOTER BACKGROUND ===\n');
  
  const footer = await page.locator('footer').first();
  const footerCount = await footer.count();
  
  if (footerCount > 0) {
    const footerBg = await footer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        classes: el.className,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        color: computed.color,
        cssVarInverseBg: computed.getPropertyValue('--inverse-bg'),
        cssVarInverseText: computed.getPropertyValue('--inverse-text'),
      };
    });
    console.log('Footer computed styles:', JSON.stringify(footerBg, null, 2));

    // Check parent wrappers
    const footerParent = await footer.evaluate(el => {
      let parent = el.parentElement;
      let results = [];
      while (parent && results.length < 3) {
        const computed = window.getComputedStyle(parent);
        results.push({
          tag: parent.tagName,
          classes: parent.className,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
        });
        parent = parent.parentElement;
      }
      return results;
    });
    console.log('Footer Parent chain:', JSON.stringify(footerParent, null, 2));

    // Check footer link colors
    const footerLink = await footer.locator('a').first();
    const linkCount = await footerLink.count();
    if (linkCount > 0) {
      const linkColor = await footerLink.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          text: el.textContent.trim(),
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });
      console.log('Footer Link color:', JSON.stringify(linkColor, null, 2));
    }
  } else {
    console.log('❌ Footer not found');
  }

  // === Check CSS variables in light theme ===
  console.log('\n=== CSS VARIABLES (LIGHT THEME) ===\n');
  
  const cssVars = await page.evaluate(() => {
    const root = document.documentElement;
    const computed = window.getComputedStyle(root);
    return {
      '--inverse-bg': computed.getPropertyValue('--inverse-bg'),
      '--inverse-text': computed.getPropertyValue('--inverse-text'),
      '--background': computed.getPropertyValue('--background'),
      '--foreground': computed.getPropertyValue('--foreground'),
      htmlClass: root.className,
      bodyClass: document.body.className,
    };
  });
  console.log('Root CSS vars:', JSON.stringify(cssVars, null, 2));

  // === BUG 2: Check device stage ===
  console.log('\n=== BUG 2: DEVICE STAGE ===\n');
  
  const deviceStage = await page.locator('[class*="device"], [class*="stage"], [class*="mockup"]').filter({ hasText: '' }).first();
  const stageCount = await deviceStage.count();
  
  if (stageCount > 0) {
    const stageInfo = await deviceStage.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        classes: el.className,
        innerHTML: el.innerHTML.slice(0, 200),
        backgroundColor: computed.backgroundColor,
        width: computed.width,
        height: computed.height,
      };
    });
    console.log('Device Stage:', JSON.stringify(stageInfo, null, 2));
  } else {
    console.log('❌ Device stage not found (looking for grey boxes or empty containers)');
  }

  // === BUG 5: Check floating buttons ===
  console.log('\n=== BUG 5: FLOATING BUTTONS ===\n');
  
  const whatsappBtn = await page.locator('[class*="whatsapp"], [href*="wa.me"]').first();
  const backToTopBtn = await page.locator('[class*="back-to-top"], [class*="scroll-top"]').first();
  
  const whatsappCount = await whatsappBtn.count();
  const backToTopCount = await backToTopBtn.count();
  
  if (whatsappCount > 0) {
    const whatsappPos = await whatsappBtn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      return {
        text: el.textContent.trim() || el.getAttribute('aria-label') || 'icon only',
        bottom: computed.bottom,
        left: computed.left,
        right: computed.right,
        position: computed.position,
        zIndex: computed.zIndex,
        boundingRect: { bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
      };
    });
    console.log('WhatsApp button:', JSON.stringify(whatsappPos, null, 2));
  }
  
  if (backToTopCount > 0) {
    const backToTopPos = await backToTopBtn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      return {
        text: el.textContent.trim() || el.getAttribute('aria-label') || 'icon only',
        bottom: computed.bottom,
        right: computed.right,
        position: computed.position,
        zIndex: computed.zIndex,
        boundingRect: { bottom: rect.bottom, right: rect.right, width: rect.width, height: rect.height },
      };
    });
    console.log('Back-to-top button:', JSON.stringify(backToTopPos, null, 2));
  }

  console.log('\n=== DIAGNOSIS COMPLETE ===');
  console.log('Screenshot saved: services-cta-footer-BEFORE.png');
  console.log('\nPress Ctrl+C to close browser and exit...\n');

  // Keep browser open for manual inspection
  await page.waitForTimeout(300000); // 5 minutes
  await browser.close();
})();
