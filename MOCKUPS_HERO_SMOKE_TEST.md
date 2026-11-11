# Mockups Hero Smoke Test

Quick validation checklist to verify the new hero is working without automated tools.

## Prerequisites
- Dev server running: `npm run dev`
- Browser open at: `http://localhost:5173/mockups`

---

## 1. Basic Rendering (English)

**URL:** `http://localhost:5173/mockups`

- [ ] Hero section loads without errors (check browser console)
- [ ] Eyebrow text visible (e.g., "Premium UI/UX Designs")
- [ ] Main heading (`<h1>`) visible and not showing `{{` or `i18n:` keys
- [ ] Subtitle visible below heading
- [ ] Two CTA buttons visible: "Browse Designs" and "Request Custom Design"
- [ ] Animated background elements visible (aurora blobs, grid, floating shapes)
- [ ] Laptop showcase cycling through mockup previews OR showing wireframe fallback
- [ ] Floating device frames visible (phone, tablet, cards)
- [ ] Handwritten note with arrow visible (font: Caveat)
- [ ] Industry categories rotating/typewriter effect (e.g., "E-commerce", "SaaS", "Healthcare")
- [ ] Stats counters visible (e.g., "500+ Designs", "100+ Categories")

---

## 2. Basic Rendering (Arabic)

**URL:** `http://localhost:5173/mockups?lang=ar`

- [ ] Hero section loads without errors
- [ ] Text direction is RTL (right-to-left)
- [ ] Eyebrow text in Arabic
- [ ] Main heading in Arabic
- [ ] Subtitle in Arabic
- [ ] CTA buttons in Arabic
- [ ] Handwritten note in Arabic (font: Aref Ruqaa)
- [ ] Industry categories rotating in Arabic
- [ ] Layout mirrors correctly (laptop on left, text on right)

---

## 3. Accessibility (Manual Checks)

**Both EN & AR:**

- [ ] Buttons have `aria-label` attributes (inspect in DevTools)
- [ ] Heading structure: Page has only one `<h1>` (the main hero title)
- [ ] Focus visible: Tab through buttons - visible focus ring appears
- [ ] Animations pause when browser tab not active (check `document.hidden` behavior)
- [ ] Reduced motion: Enable OS reduced motion setting → animations should stop or become instant

**Color Contrast (Light Mode):**
- [ ] Hero title text readable against background
- [ ] Subtitle text readable against background
- [ ] Button text readable against button background

**Color Contrast (Dark Mode):**
- [ ] Toggle dark mode in site settings or use browser DevTools
- [ ] Hero title text readable against dark background
- [ ] Subtitle text readable against dark background
- [ ] Button text readable against button background

---

## 4. Interactive Elements

- [ ] "Browse Designs" button clickable (scrolls to grid section)
- [ ] "Request Custom Design" button clickable (opens contact form or modal)
- [ ] No horizontal scroll on any screen size (scroll left/right - page width shouldn't exceed viewport)
- [ ] Mobile sticky bar appears after scrolling down (~80vh)
- [ ] Mobile sticky bar "X" button dismisses the bar
- [ ] WhatsApp button not covered by sticky bar

---

## 5. Mobile Responsive (Manual Resize)

**360px (Galaxy S8):**
- [ ] Hero text fits without overflow
- [ ] Buttons stack vertically or shrink to fit
- [ ] Laptop showcase not cut off
- [ ] No horizontal scroll

**390px (iPhone 12 Pro):**
- [ ] Hero text fits without overflow
- [ ] Buttons fit comfortably
- [ ] Sticky bar fits without overflow

**430px (iPhone 14 Pro Max):**
- [ ] Hero layout looks balanced
- [ ] Text/buttons have breathing room

**768px (iPad Portrait):**
- [ ] Hero layout transitions to desktop-ish view
- [ ] Laptop showcase visible and proportional
- [ ] Text column width comfortable

**1024px (iPad Landscape / Desktop):**
- [ ] Full desktop layout active
- [ ] Two-column layout (text left, laptop showcase right)
- [ ] Mouse spotlight effect visible (move mouse over hero)

**1440px (Laptop):**
- [ ] Content centered, not stretched to edges
- [ ] Animations smooth

**1920px (Desktop):**
- [ ] Content max-width applied (not stretched)
- [ ] Visual balance maintained

---

## 6. Animation Performance

- [ ] Scroll down until hero off-screen → scroll back up
- [ ] Animations resume smoothly (IntersectionObserver working)
- [ ] No janky/stuttering animations (check with browser performance tab)
- [ ] CPU usage reasonable (< 50% on modern device)

---

## 7. Data Integration (Requires DB)

**Check browser console for errors:**

- [ ] No 404s for mockup images
- [ ] No Supabase query errors
- [ ] Attribution data captured in localStorage: `localStorage.getItem('attribution')`
- [ ] Analytics initialized (check `window.analytics` object exists)

**If mockups published:**
- [ ] Laptop showcase cycles through real mockup images
- [ ] Category chips match published mockup categories

**If no mockups published:**
- [ ] Wireframe fallbacks display (CSS-generated mockup previews)
- [ ] Fallbacks match category colors

---

## 8. Attribution & Analytics

**Test UTM tracking:**

1. Visit: `http://localhost:5173/mockups?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale`
2. [ ] URL cleans to: `http://localhost:5173/mockups` (no query params)
3. [ ] Open browser console → `localStorage.getItem('attribution')`
4. [ ] Should show JSON with `utm_source: "facebook"`, `utm_medium: "cpc"`, `utm_campaign: "summer_sale"`, `landing_page`, `attribution_timestamp`

**Test click IDs:**

1. Visit: `http://localhost:5173/mockups?gclid=abc123&fbclid=def456`
2. [ ] localStorage attribution includes `gclid` and `fbclid`

**Test analytics events (if tracking IDs configured):**

- [ ] Click "Browse Designs" → `hero_cta_click` event fires (check Network tab for pixel/GA4 requests)
- [ ] Click "Request Custom Design" → `hero_cta_click` event fires

---

## 9. Console Health Check

**Browser DevTools Console:**

- [ ] No React errors (red messages)
- [ ] No hydration errors
- [ ] No "Failed to fetch" errors
- [ ] No "Cannot read property of undefined" errors
- [ ] Only warnings (yellow) allowed: deprecation notices, etc.

---

## 10. Network Health Check

**Browser DevTools Network Tab:**

- [ ] Fonts load: `Caveat` (EN handwritten), `Aref Ruqaa` (AR handwritten)
- [ ] No 404s for images (unless no mockups published, which is expected)
- [ ] API calls to `/rest/v1/mockups` succeed (200 status) or gracefully fail (404)
- [ ] Supabase anon key valid (no 401 Unauthorized errors)

---

## Expected Failures (Before Migrations Applied)

These will show errors until user runs the migrations in Supabase:

- [ ] **Expected:** Console error: `column "utm_source" does not exist` → Run migration `20261113000001_add_attribution_tracking.sql`
- [ ] **Expected:** Console error: `column "hero_eyebrow" does not exist` → Run migration `20261113000002_add_mockups_hero_content.sql`
- [ ] **Expected:** Console error: `column "meta_pixel_id" does not exist` → Run migration `20261113000003_add_tracking_ids_to_settings.sql`
- [ ] **Expected:** Hero text shows placeholder/fallback → Populate `page_content` table with hero fields
- [ ] **Expected:** No tracking IDs loaded → Populate `site_settings` table with analytics IDs

---

## Pass Criteria

**Minimum to pass:**
- ✅ Hero renders without crashing
- ✅ All text visible (no `{{}}` or raw i18n keys)
- ✅ Both buttons clickable
- ✅ Animations run smoothly
- ✅ No horizontal scroll
- ✅ Responsive on mobile (360px+) and desktop (1024px+)
- ✅ Attribution captured in localStorage
- ✅ Dark mode works

**Full pass:**
- All checkboxes above checked ✅
- No console errors (except expected migration errors if DB not updated)
- Performance feels fast (LCP < 2s on 3G, subjective)

---

## Next Steps After Smoke Test

1. If hero not rendering → Check Supabase connection in `.env`
2. If text shows `{{key}}` → Run `CHECK_MOCKUPS_DATA.sql`, verify `page_content` table
3. If animations janky → Check browser performance tab, disable experimental features
4. If attribution not capturing → Check `src/main.jsx` calls `initAttribution()`
5. If ready for real testing → Run migrations, populate data, test on real device
6. For automated testing → Run Lighthouse, Playwright E2E tests (not included in this checklist)

---

## Notes

- This is a **manual smoke test** - not automated
- Use browser DevTools for all checks
- Test in Chrome/Edge for best DevTools experience
- Safari/Firefox checks optional but recommended
- Mobile device testing (real phone) recommended after passing on desktop
- Performance testing (Lighthouse) is separate - not included here
