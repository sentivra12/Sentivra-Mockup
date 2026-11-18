import { test } from '@playwright/test';
const BASE = 'http://localhost:4173';

// Static layout screenshots
const VPs = [
  { w:360, h:640, name:'360x640' },
  { w:390, h:844, name:'390x844' },
];
for (const vp of VPs) {
  for (const [lang, label] of [['en','EN'],['ar','AR']]) {
    test(`static ${vp.name} dark ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.addInitScript((l) => {
        localStorage.setItem('theme', 'dark');
        localStorage.setItem('language', l);
      }, lang);
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 12000 });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `test-results/polish-${vp.name}-dark-${label}.png`,
        clip: { x:0, y:0, width: vp.w, height: vp.h },
      });
    });
  }
}

// Motion proof: 3 frames 1.5s apart at 390x844 dark EN
test('motion 3-frames 390x844 EN', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'en');
  });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 12000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test-results/motion-frame1.png', clip: { x:0,y:0,width:390,height:844 } });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/motion-frame2.png', clip: { x:0,y:0,width:390,height:844 } });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/motion-frame3.png', clip: { x:0,y:0,width:390,height:844 } });
});
