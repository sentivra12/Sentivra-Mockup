# ✅ Services Page Round 1 - Setup Checklist

## Pre-Flight Checklist

Before testing in browser, verify these files exist:

### ✅ Component Files
- [ ] `src/components/ui/ServicesHeroPremium.jsx` (15.5 KB)
- [ ] `src/components/ui/PremiumServiceCardRound1.jsx` (14 KB)
- [ ] `src/components/ui/HowWeWorkStrip.jsx` (6.8 KB)
- [ ] `src/components/ui/WhyUsSection.jsx` (6.4 KB)
- [ ] `src/components/ui/ServicesFAQAccordion.jsx` (8.8 KB)
- [ ] `src/components/ui/ServicesFinalCTA.jsx` (14.8 KB)

### ✅ Page File
- [ ] `src/pages/ServicesPageRound1.jsx` (6.6 KB)

### ✅ Helper File
- [ ] `src/i18n/useLanguage.js` (new hook)

### ✅ Config Files
- [ ] `src/App.jsx` (modified - route added)

### ✅ Database Files
- [ ] `supabase/migrations/20261102000001_add_services_arabic_and_faqs.sql`
- [ ] `QUICK_SETUP.sql` (helper queries)

### ✅ Documentation
- [ ] `SERVICES_PAGE_ROUND1_GUIDE.md` (English)
- [ ] This file: `CHECK_SETUP.md`

---

## Database Setup Checklist

### Step 1: Run Migration
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy contents of `supabase/migrations/20261102000001_add_services_arabic_and_faqs.sql`
- [ ] Paste and run
- [ ] Check for success message (no errors)

### Step 2: Add Arabic Translations
- [ ] Open `QUICK_SETUP.sql`
- [ ] Replace Arabic text with your translations
- [ ] Run section 1 (Arabic translations)
- [ ] Verify: All 6 services have `title_ar`, `short_description_ar`, `long_description_ar`

### Step 3: Add Contact Info
- [ ] Update section 2 in `QUICK_SETUP.sql` with real numbers/email
- [ ] Run section 2
- [ ] Verify: `site_settings` has real `whatsapp_number`, `primary_email`, `primary_phone`

### Step 4: (Optional) Enhance FAQ Answers
- [ ] Customize FAQ #7 and #8 in section 3
- [ ] Run section 3

### Step 5: Verify
- [ ] Run section 4 (verification queries)
- [ ] Check output:
  - All services show "✅ Set" for arabic_status
  - Contact info shows "✅ Set"
  - All FAQs show "✅ Has Arabic"

---

## Browser Testing Checklist

### Start Dev Server
```bash
cd d:\Sentivra-main
npm run dev
```

### Visual Tests

#### Test URL: `http://localhost:5173/services`

**Desktop (≥1024px):**
- [ ] Hero orbit displays with 6 service icons
- [ ] Hero orbit has 4 floating UI cards (code, dashboard, mobile, database)
- [ ] Search box works (type to filter)
- [ ] Press `/` focuses search box
- [ ] Service cards display in grid (3 cols at 1024px, 4 cols at 1600px+)
- [ ] If first service is `is_featured = true`, it spans 2 columns (at 4-col layout)
- [ ] Hover on cards shows gradient border
- [ ] Hover on cards shows pointer glare effect (radial gradient follows mouse)
- [ ] "How We Work" strip shows 3 steps with dashed connector
- [ ] "Why Choose Us" shows 4 tiles
- [ ] FAQ accordion: clicking opens/closes smoothly (grid animation)
- [ ] Only one FAQ open at a time
- [ ] Final CTA: hover on primary button pulls it toward mouse (magnetic)
- [ ] Final CTA: compact orbit shows 6 service icons
- [ ] WhatsApp button appears (bottom right) if number is set

**Mobile (360px-767px):**
- [ ] Hero orbit responsive (icons smaller, no floating cards)
- [ ] Search box full width
- [ ] Service cards stack (1 column)
- [ ] "How We Work" steps stack (3 rows, no connector)
- [ ] "Why Choose Us" tiles: 2 columns (mobile) → 4 columns (desktop)
- [ ] FAQ accordion full width
- [ ] Final CTA stacks: content top, orbit bottom

### Functional Tests

**Search:**
- [ ] Type "web" → filters to "Web Application Development"
- [ ] Type "mobile" → filters to "Mobile Application Development"
- [ ] Type "xyz" → shows "No services match your search"
- [ ] Clear search → shows all services
- [ ] Press `/` → search box gets focus
- [ ] Result count updates (e.g., "Found 1 service")

**FAQ:**
- [ ] First FAQ is open by default
- [ ] Click another FAQ → opens it, closes first
- [ ] Click same FAQ again → closes it (all closed)
- [ ] Smooth animation (no jump)
- [ ] Press Enter/Space on FAQ → toggles open/close
- [ ] Hover on FAQ → link icon appears
- [ ] Click link icon → URL updates to `#faq-1`, `#faq-2`, etc.
- [ ] Visit `http://localhost:5173/services#faq-3` → FAQ #3 opens, scrolls into view

**Cards:**
- [ ] Click on any service card → navigates to `/services/[slug]`
- [ ] Hover on card → slight lift animation
- [ ] Hover on "Learn More" arrow → moves right

**Buttons:**
- [ ] Click "Start Your Project" → navigates to `/contact`
- [ ] Click "WhatsApp" → opens `https://wa.me/[number]` in new tab
- [ ] Click email link → opens email client
- [ ] Click phone link → initiates call (mobile)

### Language & Theme Tests

**English Light:**
- [ ] Visit `http://localhost:5173/services`
- [ ] All text in English
- [ ] Light background (white, slate-50)
- [ ] Text readable (dark on light)

**English Dark:**
- [ ] Toggle dark mode in browser/OS
- [ ] Dark background (slate-950, slate-900)
- [ ] Text readable (light on dark)
- [ ] Cyan accent color: `#22d3ee` (brighter in dark)

**Arabic Light:**
- [ ] Visit `http://localhost:5173/services?lang=ar`
- [ ] All text in Arabic (if translations added)
- [ ] Direction: RTL (text flows right-to-left)
- [ ] Arrows flip (point left instead of right)
- [ ] Layout mirrors correctly

**Arabic Dark:**
- [ ] Visit `http://localhost:5173/services?lang=ar` + dark mode
- [ ] Arabic + dark mode work together
- [ ] Readable, mirrored correctly

### Accessibility Tests

**Keyboard Navigation:**
- [ ] Press Tab → moves to next interactive element (visible focus ring)
- [ ] Press Shift+Tab → moves to previous element
- [ ] Press Enter/Space on buttons → activates
- [ ] Press `/` → focuses search
- [ ] Press Escape in search → blurs search (if implemented)

**Screen Reader (Optional):**
- [ ] Install NVDA (Windows) or use VoiceOver (Mac)
- [ ] Navigate page
- [ ] Search result count announced (aria-live)
- [ ] FAQ state announced (expanded/collapsed)
- [ ] Links/buttons have clear labels

**Reduced Motion:**
- [ ] Enable reduced motion in OS
- [ ] Reload page
- [ ] Orbit rotation stops (icons static)
- [ ] FAQ animation instant (no transition)
- [ ] Shine effect disabled
- [ ] Magnetic button disabled (no pull)
- [ ] All other animations disabled or instant

### Performance Tests

**Lighthouse:**
- [ ] Build for production: `npm run build`
- [ ] Preview: `npm run preview`
- [ ] Open `http://localhost:4173/services` in Chrome
- [ ] Open DevTools (F12) → Lighthouse tab
- [ ] Run audit (Mobile, all categories)
- [ ] Check scores:
  - Performance: ≥90 (target: 95+)
  - Accessibility: ≥90 (target: 95+)
  - Best Practices: ≥90
  - SEO: ≥90
  - **CLS** (Cumulative Layout Shift): ≤0.1 (target: ~0)
  - **LCP** (Largest Contentful Paint): <2.5s (target: <2s)

**Network:**
- [ ] Open DevTools → Network tab
- [ ] Reload page
- [ ] Check total transfer size (should be reasonable, ~100-300 KB initial)
- [ ] Check JS bundle size (new components add ~26 KB)
- [ ] Check if images lazy-load (icons are inline SVG, should be instant)

### Contrast Tests (WCAG)

Use: https://webaim.org/resources/contrastchecker/

**Light Mode:**
- [ ] Heading text (`#020617` on `#ffffff`): ≥7:1 ✅
- [ ] Body text (`#475569` on `#ffffff`): ≥4.5:1 ✅
- [ ] Secondary text (`#64748b` on `#ffffff`): ≥4.5:1 ✅
- [ ] Primary button (`#0A1525` on `#EEF2F4`): ≥7:1 ✅
- [ ] Cyan icon (`#06b6d4` on `#ffffff`): ≥3:1 (icons/large text only) ⚠️

**Dark Mode:**
- [ ] Heading text (`#f8fafc` on `#020617`): ≥7:1 ✅
- [ ] Body text (`#94a3b8` on `#020617`): ≥4.5:1 ✅
- [ ] Secondary text (`#64748b` on `#020617`): ≥4.5:1 ✅
- [ ] Cyan icon (`#22d3ee` on `#020617`): ≥7:1 ✅

---

## Issue Troubleshooting

### Issue: Page is blank
**Check:**
1. Console errors (F12)
2. Network tab: 404 for component files?
3. Migration run? Services table has `title_ar` column?

### Issue: Services only in English (in Arabic mode)
**Check:**
1. `title_ar`, `short_description_ar`, `long_description_ar` populated?
2. Run `QUICK_SETUP.sql` section 1

### Issue: WhatsApp button not showing
**Check:**
1. `site_settings.whatsapp_number` set? Not `+20 123 456 7890`?
2. Run `QUICK_SETUP.sql` section 2

### Issue: FAQ not showing
**Check:**
1. Migration run? FAQs with `page_key='services'` exist?
2. FAQs active? `UPDATE faqs SET is_active = true WHERE page_key = 'services';`

### Issue: Search not working
**Check:**
1. Console errors?
2. Typing in search box? Try refreshing page

### Issue: Orbit not animated
**Check:**
1. Reduced motion enabled in OS? (Expected behavior - animations disabled)
2. Console errors?

### Issue: Card click doesn't navigate
**Check:**
1. `/services/[slug]` route exists in App.jsx?
2. `ServiceDetailPage` component exists?
3. Console errors?

---

## Final Checklist Before Deploy

### Content Complete:
- [ ] All 6 services have Arabic translations
- [ ] Contact info (WhatsApp, email, phone) is real
- [ ] FAQ #7 and #8 have detailed answers
- [ ] All services `is_active = true`

### Testing Complete:
- [ ] All 4 modes tested (light/dark × EN/AR)
- [ ] All 6 breakpoints tested (360px → 1920px)
- [ ] All functional tests passed
- [ ] Lighthouse scores ≥90
- [ ] Accessibility tests passed
- [ ] Contrast ratios verified

### Performance Verified:
- [ ] CLS ~0 (no layout shift)
- [ ] LCP <2s
- [ ] JS bundle size acceptable
- [ ] No console errors
- [ ] No console warnings (or documented/acceptable)

### Ready to Deploy:
- [ ] All above checked
- [ ] Stakeholders reviewed and approved visual design
- [ ] Content reviewed and approved
- [ ] Backup of database taken
- [ ] Deploy plan ready

---

## Success Criteria

✅ **Premium Quality**: Matches /mockups page level (7 rounds of refinement)
✅ **Conversion-Focused**: Clear CTAs, easy contact, trust signals
✅ **Bilingual**: Full EN/AR support from database
✅ **Accessible**: WCAG AA compliant, keyboard/screen reader friendly
✅ **Performant**: Lighthouse ≥90, CLS ~0, LCP <2s
✅ **No Fake Data**: Real services, real contact, real FAQs only

If all checkboxes above are ✅, you're ready to deploy! 🚀
