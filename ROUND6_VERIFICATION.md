# Round 6 Verification Checklist

Quick verification steps after running the migration and deploying Round 6.

## 1. Database Verification

### Check Arabic Columns Added
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'faqs' 
  AND column_name IN ('question_ar', 'answer_ar');
```
**Expected:** 2 rows (question_ar TEXT, answer_ar TEXT)

---

### Check Old Seed FAQs Unpublished
```sql
SELECT id, question, is_active 
FROM faqs 
WHERE page_key = 'mockups' 
  AND (
    question LIKE '%formats%' 
    OR question LIKE '%purchase%' 
    OR question LIKE '%refund%'
    OR question LIKE '%bundles%'
  );
```
**Expected:** 8 rows with `is_active = false`

---

### Check New FAQs Inserted
```sql
SELECT id, question, question_ar, is_active, display_order
FROM faqs 
WHERE page_key = 'mockups' 
  AND question LIKE '%ready-made%'
ORDER BY display_order;
```
**Expected:** 1 row with `is_active = true`, `question_ar` populated

---

### Check All Active Mockup FAQs
```sql
SELECT display_order, question, question_ar, is_active
FROM faqs 
WHERE page_key = 'mockups' 
  AND is_active = true
ORDER BY display_order;
```
**Expected:** 8 rows (new business-focused FAQs)

---

## 2. Visual Verification

### Desktop (1440px)
- [ ] Navigate to `/mockups`
- [ ] Scroll past design gallery
- [ ] **HowItWorksStrip** appears with 3 steps in horizontal row
- [ ] Connector line animates left-to-right over ~1.5s
- [ ] **FAQ Accordion** appears in 2-column grid
- [ ] Click first FAQ - expands smoothly, plus icon rotates to X
- [ ] Click second FAQ - first closes, second opens (one open at a time)
- [ ] **PremiumFinalCTA** appears with device stage on right
- [ ] Device stage shows mockup image cycling every 4s
- [ ] Move mouse over device - subtle tilt effect (max ~3°)
- [ ] Hover primary button - slight magnetic pull toward cursor
- [ ] Hover secondary WhatsApp button - glass effect visible

### Mobile (390px)
- [ ] Repeat `/mockups` on mobile
- [ ] HowItWorksStrip shows 3 steps vertically stacked
- [ ] Connector line vertical (not horizontal)
- [ ] FAQ Accordion single column
- [ ] PremiumFinalCTA shows CTA only (no device stage)
- [ ] Buttons stack vertically
- [ ] All text readable (no overflow)

### Arabic (Desktop)
- [ ] Switch language to Arabic (header toggle or `/mockups?lang=ar`)
- [ ] HowItWorksStrip: Steps reversed (right-to-left)
- [ ] Connector line animates right-to-left
- [ ] FAQ Accordion: Text aligns right, numbers on right
- [ ] FAQ questions/answers in Arabic (question_ar / answer_ar)
- [ ] PremiumFinalCTA: Text RTL, buttons reversed

### Dark Mode
- [ ] Toggle dark mode (header icon)
- [ ] HowItWorksStrip: InverseSurface dark blue background
- [ ] FAQ Accordion: Glass cards with dark background
- [ ] PremiumFinalCTA: InverseSurface dark slate background
- [ ] All text readable (sufficient contrast)

---

## 3. Interaction Verification

### Anchor Links
- [ ] Navigate to `/mockups#faq-1`
- [ ] **Expected:** Page loads, FAQ #1 opens automatically, scrolls into view
- [ ] Navigate to `/mockups#faq-5`
- [ ] **Expected:** FAQ #5 opens automatically

### Keyboard Navigation
- [ ] Tab to first FAQ
- [ ] Press Enter or Space
- [ ] **Expected:** FAQ toggles open/close
- [ ] Tab through all FAQs
- [ ] **Expected:** Focus indicators visible on each

### WhatsApp Links
- [ ] Scroll to FAQ "Still have questions?" card
- [ ] Click "Chat on WhatsApp" button
- [ ] **Expected:** Opens WhatsApp with prefilled message:
  - EN: "Hi! I have a question about your ready-made website designs. Can you help?"
  - AR: "مرحباً! لدي سؤال حول تصاميم مواقعكم الجاهزة. هل يمكنكم المساعدة؟"
- [ ] Scroll to PremiumFinalCTA
- [ ] Click secondary "Chat on WhatsApp" button
- [ ] **Expected:** Opens WhatsApp with message:
  - EN: "Hi! I'm interested in your ready-made website designs. Let's discuss!"
  - AR: "مرحباً! أنا مهتم بتصاميم مواقعكم الجاهزة. دعونا نناقش!"

### Email/Phone Links
- [ ] Click email icon in FAQ card (if `siteSettings.email` set)
- [ ] **Expected:** Opens email client with `mailto:` link
- [ ] Click phone icon in FAQ card (if `siteSettings.phone` set)
- [ ] **Expected:** Opens dialer with `tel:` link

### Device Stage Cycling
- [ ] Watch device stage in PremiumFinalCTA for 12 seconds (3 cycles)
- [ ] **Expected:** Mockup image changes every 4 seconds
- [ ] **Note:** If no published mockups, shows CSS fallback gradient

---

## 4. Admin Form Verification

### Access Admin
- [ ] Navigate to `/admin/faqs`
- [ ] Select "Mockups Page" from filter dropdown
- [ ] **Expected:** 8 FAQs listed (new business-focused questions)

### Create New FAQ
- [ ] Click "Add FAQ"
- [ ] **Expected:** Modal opens with 4 fields:
  - Question (English) * - LTR
  - Question (Arabic) - RTL with `dir="rtl"`
  - Answer (English) * - LTR
  - Answer (Arabic) - RTL with `dir="rtl"`
- [ ] Fill all 4 fields with test content
- [ ] Click "Create FAQ"
- [ ] **Expected:** Success toast, FAQ appears in list

### Edit Existing FAQ
- [ ] Click edit icon on first FAQ
- [ ] **Expected:** Modal opens with all 4 fields populated
- [ ] Change `question_ar` text
- [ ] Click "Update FAQ"
- [ ] **Expected:** Success toast
- [ ] Verify change on frontend: `/mockups?lang=ar` shows updated text

---

## 5. Performance Verification

### Lighthouse Audit (Production Build)
```bash
npm run build
npm run preview
# Then open browser to localhost:4173/mockups
```

**In Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Mobile" + "Performance" + "Accessibility"
4. Click "Analyze page load"

**Target Scores:**
- [ ] Performance: ≥90 (mobile)
- [ ] Accessibility: ≥95
- [ ] CLS (Cumulative Layout Shift): <0.1
- [ ] LCP (Largest Contentful Paint): <2.0s
- [ ] No console errors
- [ ] No 404s for images/fonts

**Check Added Weight:**
- [ ] Open Network tab, reload page
- [ ] Filter by JS: Check total JS size (should be <200KB increase)
- [ ] Filter by CSS: Check total CSS size (should be <50KB increase)

---

## 6. Accessibility Verification

### Screen Reader Test (NVDA, JAWS, or VoiceOver)
- [ ] Navigate to FAQ accordion with Tab key
- [ ] **Expected:** Screen reader announces "Question 1 of 8: [question text]"
- [ ] Press Enter to expand
- [ ] **Expected:** Announces "Expanded" or "Open", reads answer
- [ ] Tab to next FAQ
- [ ] **Expected:** Announces "Collapsed" on previous FAQ

### Contrast Check
**Tool:** Use browser extension (e.g., WAVE, axe DevTools)
- [ ] Run on `/mockups` (light mode)
- [ ] **Expected:** All text passes WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] Switch to dark mode, run again
- [ ] **Expected:** All text passes WCAG AA

### Keyboard-Only Navigation
- [ ] Unplug mouse (or don't use it)
- [ ] Tab through entire /mockups page
- [ ] **Expected:** All interactive elements reachable and operable
- [ ] Focus indicators visible on all focusable elements
- [ ] No keyboard traps

---

## 7. Reduced Motion Verification

### Enable Reduced Motion
**Windows:** Settings → Ease of Access → Display → Show animations  
**macOS:** System Preferences → Accessibility → Display → Reduce motion  
**Linux:** GNOME Settings → Universal Access → Reduce Animation

**Then:**
- [ ] Reload `/mockups` page
- [ ] **Expected Effects Disabled:**
  - [ ] No connector line animation in HowItWorksStrip
  - [ ] No aurora blob animations in PremiumFinalCTA
  - [ ] No floating shapes animation
  - [ ] No device tilt effect
  - [ ] FAQ accordion expands instantly (no height animation)
  - [ ] Staged reveals appear immediately (no fade-in)

---

## 8. Save Data / Lite Mode Verification

### Enable Data Saver
**Chrome Mobile:** Settings → Lite mode → Enable  
**Chrome Desktop:** Chrome flags: `chrome://flags/#enable-save-data`

**Then:**
- [ ] Reload `/mockups` page
- [ ] **Expected Effects Disabled:**
  - [ ] Same as reduced motion (heavy effects disabled)
  - [ ] Aurora animations not running
  - [ ] Device tilt effect disabled

---

## 9. Cross-Browser Verification

### Safari (macOS/iOS)
- [ ] Navigate to `/mockups`
- [ ] Check glass morphism (backdrop-filter) renders
- [ ] Check gradient text renders
- [ ] Check FAQ accordion animation (grid-template-rows)
- [ ] Check smooth scroll for anchor links

### Firefox
- [ ] Navigate to `/mockups`
- [ ] Check FAQ accordion height animation
- [ ] Check device stage tilt effect
- [ ] Check all interactions work

### Edge
- [ ] Navigate to `/mockups`
- [ ] Same checks as Chrome (Chromium-based)

---

## 10. Console Error Check

**Open Browser DevTools Console (F12) and check for:**
- [ ] No React errors ("Cannot read property...")
- [ ] No Supabase errors ("Invalid API key...")
- [ ] No 404s for components, images, or fonts
- [ ] No CORS errors
- [ ] No unhandled promise rejections

**Common Errors to Watch:**
- `useSiteSettings is not a function` → Check import in MockupsPageRound5.jsx
- `faqs.question_ar is undefined` → Run migration to add columns
- `Cannot find module '@/components/mockups/...'` → Check file paths

---

## Quick Smoke Test (5 minutes)

If short on time, run this minimal test:

1. **Database:** Run migration SQL, check `SELECT * FROM faqs WHERE page_key = 'mockups' AND is_active = true;` returns 8 new FAQs
2. **Page Load:** Visit `/mockups` in browser - no console errors, all 3 sections visible
3. **FAQ:** Click first FAQ - expands smoothly
4. **WhatsApp:** Click WhatsApp button in final CTA - opens with message
5. **Admin:** Open `/admin/faqs`, click "Edit" on mockup FAQ - 4 fields visible (EN/AR)

If all 5 pass → ✅ Core functionality working

---

## Report Template

After verification, document results:

```markdown
## Verification Results - [Date]

**Browser:** [Chrome 118 / Safari 17 / Firefox 120]  
**Device:** [Desktop 1440px / iPhone 14 Pro / Samsung S23]  
**Mode:** [Light / Dark] × [EN / AR]

### ✅ Working
- Database migration successful
- All 3 components rendering
- FAQ accordion interactions
- WhatsApp links with prefilled message
- Admin form shows 4 fields

### ⚠️ Issues Found
- [Issue 1]: [Description] → [Fix/Workaround]
- [Issue 2]: [Description] → [Fix/Workaround]

### 📊 Performance
- Lighthouse Performance: [Score]
- Lighthouse Accessibility: [Score]
- CLS: [Value]
- LCP: [Value]
- JS Bundle Increase: [+XXkB]

### 🚫 Could Not Verify
- [Reason, e.g., "Real device testing not available"]
```

---

**Verification Guide Version:** 1.0  
**Last Updated:** November 2, 2026
