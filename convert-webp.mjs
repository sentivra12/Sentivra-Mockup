/**
 * One-time script: convert public/hero/hands.png -> hands-720.webp + hands-360.webp
 * Uses Playwright's already-installed Chromium — no new dependency.
 * Run once: node convert-webp.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC  = path.join(__dirname, 'public/hero/hands.png');
const OUT  = path.join(__dirname, 'public/hero');
fs.mkdirSync(OUT, { recursive: true });

const pngData = fs.readFileSync(SRC);
const pngBase64 = pngData.toString('base64');

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();

// Use an empty HTML page with a canvas to convert
await page.setContent('<html><body></body></html>');

for (const [maxW, suffix, quality] of [
  [720, '720', 0.80],
  [360, '360', 0.78],
]) {
  const result = await page.evaluate(
    async ({ b64, maxW, quality }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // Calculate target dimensions keeping aspect ratio
          const scale = Math.min(1, maxW / img.naturalWidth);
          const w = Math.round(img.naturalWidth  * scale);
          const h = Math.round(img.naturalHeight * scale);

          const canvas = document.createElement('canvas');
          canvas.width  = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          // toDataURL with webp quality
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve({ dataUrl, w, h });
        };
        img.onerror = () => reject(new Error('img load failed'));
        img.src = 'data:image/png;base64,' + b64;
      });
    },
    { b64: pngBase64, maxW, quality }
  );

  // Strip the data URL header
  const base64 = result.dataUrl.replace(/^data:image\/webp;base64,/, '');
  const buf    = Buffer.from(base64, 'base64');
  const outPath = path.join(OUT, `hands-${suffix}.webp`);
  fs.writeFileSync(outPath, buf);
  console.log(`✓ hands-${suffix}.webp  ${result.w}×${result.h}  ${(buf.length/1024).toFixed(1)}KB`);
}

await browser.close();
console.log('Done.');
