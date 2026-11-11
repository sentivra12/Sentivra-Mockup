# Round 6: Manual Steps Required

**Quick Start Guide** - Follow these steps in order to complete Round 6 deployment.

---

## Step 1: Run Database Migration ⚠️ REQUIRED

### Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your Sentivra project
3. Click **SQL Editor** in left sidebar

### Execute Migration
1. Click **"New Query"** button
2. Open file: `d:\Sentivra-main\supabase\migrations\20261116000001_add_faqs_arabic_and_unpublish_seed.sql`
3. Copy ALL contents (152 lines)
4. Paste into SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

### Verify Success
You should see: `Success. No rows returned`

**If you see an error:**
- Check that `faqs` table exists: `SELECT * FROM faqs LIMIT 1;`
- Check for syntax errors (look for red underlines)
- Check that you copied the ENTIRE file (should start with `-- =====` and end with `COMMENT ON COLUMN...`)

### Confirm Changes
Run these verification queries:

```sql
-- 1. Check Arabic columns added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'faqs' 
  AND column_name LIKE '%_ar';
```
**Expected result:** 2 rows (`question_ar`, `answer_ar`)

```sql
-- 2. Check new FAQs inserted
SELECT COUNT(*) as new_faqs
FROM faqs 
WHERE page_key = 'mockups' 
  AND is_active = true;
```
**Expected result:** 8 (the new business-focused FAQs)

```sql
-- 3. Check old seed FAQs unpublished
SELECT COUNT(*) as old_faqs
FROM faqs 
WHERE page_key = 'mockups' 
  AND is_active = false
  AND (question LIKE '%formats%' OR question LIKE '%purchase%');
```
**Expected result:** 8 (the old mockup purchase FAQs)

---

## Step 2: Update Route Configuration

### Option A: If using React Router v6
Open `src/App.jsx` and ensure:

```jsx
import MockupsPageRound5 from '@/pages/MockupsPageRound5';

// In your <Routes>:
<Route path="/mockups" element={<MockupsPageRound5 />} />
```

### Option B: If using file-based routing
Rename or update the default export:
```bash
# In terminal:
# mv src/pages/MockupsPage.jsx src/pages/MockupsPageOld.jsx
# mv src/pages/MockupsPageRound5.jsx src/pages/MockupsPage.jsx
```

### Verify
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173/mockups
3. Check browser console (F12) - should be no errors
4. Scroll down past gallery - you should see:
   - "How It Works" section with 3 steps
   - FAQ accordion (not the old simple accordion)
   - Final CTA with device stage (desktop)

---

## Step 3: Configure Site Settings (if not already set)

### Required for Contact Buttons to Work

The new FAQ and CTA components use these settings for contact buttons:

```sql
-- Check current settings
SELECT key, value 
FROM site_settings 
WHERE key IN ('email', 'phone', 'whatsapp');
```

**If any are missing, add them:**

```sql
-- Add email
INSERT INTO site_settings (key, value, category)
VALUES ('email', 'info@sentivra.com', 'contact')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Add phone
INSERT INTO site_settings (key, value, category)
VALUES ('phone', '+201558952126', 'contact')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Add WhatsApp (same as phone or different)
INSERT INTO site_settings (key, value, category)
VALUES ('whatsapp', '+201558952126', 'contact')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

**Note:** If any setting is NOT configured, the corresponding button will be hidden (not an error).

---

## Step 4: Test Admin FAQ Form

### Access Admin
1. Navigate to: http://localhost:5173/admin/faqs
2. Select **"Mockups Page"** from the page filter dropdown

### Verify New FAQs
You should see 8 FAQs listed:
1. What is a ready-made website design?
2. Can I customize it to my brand and content?
3. Can I change pages or add features?
4. Do you also build and launch the website?
5. Can it be bilingual (Arabic and English) with dark mode?
6. How do I request a design?
7. What do you need from me to start?
8. How much does it cost and how long does it take?

### Test Edit Form
1. Click the **edit icon (✏️)** on any FAQ
2. Modal should open with **4 fields:**
   - Question (English) * ← Required, left-to-right
   - Question (Arabic) ← Optional, right-to-left (RTL)
   - Answer (English) * ← Required, left-to-right
   - Answer (Arabic) ← Optional, right-to-left (RTL)
3. Type some Arabic text in "Question (Arabic)" field
4. **Verify:** Text aligns RIGHT (RTL direction)
5. Click "Update FAQ"
6. **Verify:** Success toast appears

### Test on Frontend
1. Navigate to: http://localhost:5173/mockups
2. Switch language to Arabic (header toggle)
3. Scroll to FAQ section
4. **Verify:** Arabic text appears in the FAQ you edited

---

## Step 5: Provide Real Answer for FAQ #8 ⚠️ REQUIRED

### Current Status
FAQ #8 "How much does it cost and how long does it take?" has a **placeholder answer**:
> "Pricing and timeline depend on the complexity and customization level. Contact us with your chosen design for a detailed quote and schedule."

This is **too vague** for an ad landing page. Visitors need real information.

### What You Need to Decide

**Option 1: Specific Pricing** (BEST for conversion)
```
Example:
"Customization starts from $500 for basic packages (logo, colors, content). 
Timeline: Most projects completed within 2-4 weeks. 
Contact us for a detailed quote based on your needs."
```

**Option 2: Range Pricing**
```
Example:
"Projects typically range from $500 to $2,500 depending on customization level. 
Basic: 2-3 weeks | Advanced: 4-6 weeks. 
Contact us for a free quote."
```

**Option 3: Keep Neutral** (if prices vary too much)
- Current answer is acceptable if you prefer case-by-case quotes
- Just ensure it's translated to Arabic

### How to Update

**Via Admin UI:**
1. Go to http://localhost:5173/admin/faqs
2. Select "Mockups Page"
3. Click edit on "How much does it cost..."
4. Update "Answer (English)" with your real information
5. Update "Answer (Arabic)" with Arabic translation (use Google Translate if needed)
6. Click "Update FAQ"

**Via SQL (if you prefer):**
```sql
UPDATE faqs
SET 
  answer = 'YOUR REAL ENGLISH ANSWER HERE',
  answer_ar = 'YOUR REAL ARABIC ANSWER HERE'
WHERE page_key = 'mockups'
  AND question = 'How much does it cost and how long does it take?';
```

---

## Step 6: Provide Mockup Images for Device Stage (Optional but Recommended)

### Current State
The device stage in `PremiumFinalCTA` cycles through mockup images from `mockups.image_url`.

**Issue:** These may be thumbnails or cropped previews, not full-page screenshots.

### What You Need

**Tall full-page screenshots:**
- Aspect ratio: Portrait or square (NOT landscape)
- Dimensions: 1200-1600px wide × 800-1200px tall (or taller)
- Shows: Complete homepage (hero + 2-3 sections visible)
- Format: WebP (best) or optimized JPG
- File size: <500KB per image (use TinyPNG, Squoosh, or ImageOptim)

### How to Create

**Method 1: Browser Screenshot (Full Page)**
1. Open mockup live URL in Chrome
2. Press F12 (DevTools)
3. Press Ctrl+Shift+P (Command palette)
4. Type "Capture full size screenshot"
5. Press Enter → PNG saves to Downloads
6. Optimize with TinyPNG or Squoosh
7. Convert to WebP (optional but recommended)

**Method 2: Browser Extension**
- Install: "GoFullPage" or "Full Page Screen Capture"
- Click extension icon on mockup page
- Download full-page screenshot
- Crop to show hero + 2-3 sections (not entire page)
- Optimize

### How to Upload

**Option A: Supabase Storage**
1. Go to Supabase Dashboard → Storage
2. Create bucket: `mockups` (if doesn't exist)
3. Create folder: `device-previews`
4. Upload images: `mockup-1-device.webp`, `mockup-2-device.webp`, etc.
5. Get public URLs: Right-click → Copy URL
6. Update database:

```sql
UPDATE mockups
SET image_url = 'https://[your-project].supabase.co/storage/v1/object/public/mockups/device-previews/mockup-1-device.webp'
WHERE id = 1;
```

**Option B: External CDN (Cloudinary, Cloudflare, etc.)**
1. Upload images to your CDN
2. Copy public URLs
3. Update `mockups.image_url` in database (same SQL as above)

### Alternative: Add Separate Column
If you want to keep existing thumbnails and add device-specific images:

```sql
-- Add new column
ALTER TABLE mockups ADD COLUMN device_preview_url TEXT;

-- Update specific mockups
UPDATE mockups
SET device_preview_url = 'https://...'
WHERE id = X;
```

Then update `PremiumFinalCTA.jsx` line ~180:
```jsx
// Change from:
const currentMockup = publishedMockups[currentIndex];

// To:
const currentMockup = {
  ...publishedMockups[currentIndex],
  image_url: publishedMockups[currentIndex].device_preview_url || publishedMockups[currentIndex].image_url
};
```

### If You Skip This Step
- Device stage will use existing `image_url` (may look cropped)
- If `image_url` is null, shows CSS fallback (gradient template)
- **Not broken, just less impressive**

---

## Step 7: Clear Cache and Test

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the **Refresh** button (next to address bar)
3. Select **"Empty Cache and Hard Reload"**

### Clear Vite Cache
```bash
# In terminal:
rm -rf node_modules/.vite
npm run dev
```

### Test Checklist
- [ ] Navigate to http://localhost:5173/mockups
- [ ] Scroll past design gallery
- [ ] **HowItWorksStrip** visible with 3 steps
- [ ] **FAQ Accordion** visible with 8 questions
- [ ] Click first FAQ → expands smoothly
- [ ] **PremiumFinalCTA** visible with device stage (desktop)
- [ ] No console errors (F12 → Console tab)

### Test Arabic
- [ ] Click language toggle in header (or add `?lang=ar` to URL)
- [ ] All 3 new sections display Arabic text
- [ ] FAQ questions/answers in Arabic
- [ ] Layout reversed (RTL)

### Test Mobile
- [ ] Open DevTools (F12)
- [ ] Click device icon (mobile emulator)
- [ ] Select "iPhone 12 Pro" or "Pixel 5"
- [ ] Reload page
- [ ] All 3 sections visible and readable
- [ ] No horizontal scroll

---

## Step 8: Production Build Test (Recommended)

### Build for Production
```bash
npm run build
```

**Check for errors:**
- [ ] Build completes without errors
- [ ] No TypeScript errors (if using TS)
- [ ] No missing imports
- [ ] File size warnings (acceptable if <500KB increase)

### Preview Production Build
```bash
npm run preview
```

Opens at http://localhost:4173 (or similar)

**Test again:**
- [ ] Navigate to /mockups
- [ ] All 3 sections work
- [ ] No console errors
- [ ] Performance feels smooth

### Lighthouse Audit
1. Open http://localhost:4173/mockups in Chrome
2. Open DevTools (F12)
3. Go to **Lighthouse** tab
4. Select: Mobile, Performance + Accessibility
5. Click **"Analyze page load"**

**Target scores:**
- Performance: ≥90
- Accessibility: ≥95
- CLS: <0.1
- LCP: <2.0s

**If scores are low:**
- Check for large images (optimize with TinyPNG)
- Check JS bundle size (may need code splitting)
- Check for missing width/height on images (causes CLS)

---

## Step 9: Deploy to Production

### If using Vercel
```bash
git add .
git commit -m "Round 6: Add conversion-focused sections to mockups page"
git push origin main
```

Vercel auto-deploys. Check deployment URL when done.

### If using Netlify
```bash
npm run build
# Drag /dist folder to Netlify dashboard
```

### If using custom server
```bash
npm run build
# Copy /dist folder to server
scp -r dist/* user@yourserver:/var/www/sentivra/
```

---

## Step 10: Post-Deployment Verification

### Check Production Site
1. Navigate to your production mockups page (e.g., https://sentivra.com/mockups)
2. **Verify all 3 sections visible:**
   - HowItWorksStrip
   - FAQ Accordion
   - PremiumFinalCTA
3. **Test interactions:**
   - Click FAQ → expands
   - Click WhatsApp button → opens WhatsApp
   - Switch to Arabic → content changes
4. **Check console:** F12 → Console → No errors
5. **Check mobile:** Real device or BrowserStack

### Update Search Console (Optional)
If using Google Search Console:
1. Request re-index of /mockups page
2. Check mobile usability
3. Check Core Web Vitals

---

## Troubleshooting

### "useSiteSettings is not a function"
**Cause:** Import missing in MockupsPageRound5.jsx  
**Fix:** Line 6 should be:
```jsx
import { useMockups, useMockupCategories, useFAQs, useSiteSettings } from '@/hooks/useContent';
```

### "Cannot find module '@/components/mockups/...'"
**Cause:** Component files not in correct location  
**Fix:** Verify these files exist:
- `src/components/mockups/HowItWorksStrip.jsx`
- `src/components/mockups/PremiumFAQAccordion.jsx`
- `src/components/mockups/PremiumFinalCTA.jsx`

### FAQ Section Empty
**Cause:** Migration not run, or no active FAQs  
**Fix:** Run Step 1 (database migration), verify with:
```sql
SELECT COUNT(*) FROM faqs WHERE page_key = 'mockups' AND is_active = true;
```
Should return 8.

### WhatsApp Button Missing
**Cause:** `siteSettings.whatsapp` not configured  
**Fix:** Run Step 3 (configure site settings)

### Device Stage Shows Fallback (no mockup images)
**Cause:** No published mockups, or `image_url` is null  
**Fix:** 
1. Check: `SELECT COUNT(*) FROM mockups WHERE (published = true OR is_active = true);`
2. If 0, publish some mockups in Admin
3. If >0 but still fallback, check `image_url` is not null

### Arabic Text Shows English
**Cause:** `question_ar` / `answer_ar` columns empty  
**Fix:** Edit FAQ in Admin, add Arabic text to Arabic fields

### Layout Broken on Mobile
**Cause:** May be CSS conflict or viewport meta tag missing  
**Fix:** Check `index.html` has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Performance Score Low (<90)
**Cause:** Large images, heavy JS, or missing optimizations  
**Fix:**
1. Optimize mockup images (TinyPNG, WebP format)
2. Check bundle size: `npm run build` → check dist/ folder size
3. Consider lazy loading: `import { lazy } from 'react';`

---

## Summary

**Minimum Required Steps:**
1. ✅ Run database migration (Step 1)
2. ✅ Update route to MockupsPageRound5 (Step 2)
3. ✅ Configure site settings (Step 3)
4. ✅ Test page loads without errors (Step 7)

**Recommended for Quality:**
5. ✅ Update FAQ #8 with real pricing/timeline (Step 5)
6. ✅ Provide tall mockup images (Step 6)
7. ✅ Production build test (Step 8)
8. ✅ Deploy and verify (Steps 9-10)

**Time Estimate:**
- Minimum (steps 1-4): 15-20 minutes
- Full (all steps): 1-2 hours

---

**Need Help?**
- Check `ROUND6_IMPLEMENTATION_REPORT.md` for detailed technical docs
- Check `ROUND6_VERIFICATION.md` for testing checklist
- Check browser console (F12) for error messages
- Check Supabase Dashboard → Logs for database errors

**Last Updated:** November 2, 2026
