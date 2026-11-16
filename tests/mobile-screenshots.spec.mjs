// @ts-check
import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';
const widths = [360, 390, 430];
const themes = ['light', 'dark'];
const langs = ['en', 'ar'];

const pages = [
  { name: 'home', url: '/' },
  { name: 'services', url: '/services' },
  { name: 'mockups', url: '/mockups' },
  { name: 'mockup-detail', url: '/mockups/healthcare-admin' },
  { name: 'about', url: '/about' },
  { name: 'contact', url: '/contact' }
];

test.describe('Mobile Screenshots', () => {
  
  for (const page of pages) {
    for (const width of widths) {
      for (const theme of themes) {
        for (const lang of langs) {
          
          test(`${page.name}-${width}w-${theme}-${lang}`, async ({ browser }) => {
            const context = await browser.newContext({
              viewport: { width, height: 844 },
              deviceScaleFactor: 2,
              isMobile: true,
              hasTouch: true,
              colorScheme: theme
            });
            
            const p = await context.newPage();
            
            // Set language cookie
            await context.addCookies([{
              name: 'language',
              value: lang,
              domain: 'localhost',
              path: '/'
            }]);
            
            await p.goto(`${BASE_URL}${page.url}`, { waitUntil: 'networkidle', timeout: 30000 });
            await p.waitForTimeout(2000);
            
            // Screenshot
            await p.screenshot({
              path: `test-results/mobile-${page.name}-${width}w-${theme}-${lang}.png`,
              fullPage: true
            });
            
            await context.close();
          });
          
        }
      }
    }
  }
  
});
