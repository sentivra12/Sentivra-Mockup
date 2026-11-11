# 🧪 Mockups Redesign - Complete Test Checklist

## Prerequisites

### Database Setup
- [ ] All 6 migrations applied successfully in Supabase
- [ ] Run `CHECK_MOCKUPS_MIGRATIONS.sql` - all checks pass ✅
- [ ] At least 2-3 mockup categories created in admin
- [ ] At least 1 mockup created with all fields filled
- [ ] Mockup has desktop screenshot uploaded (required)
- [ ] Categories have icons and colors set

### Development Server
- [ ] `npm run dev` running without errors
- [ ] No console errors on page load
- [ ] Hot reload working

---

## Test Matrix: 8 Combinations

Test each major page in these 8 combinations:

| # | Language | Theme | Device | Pages to Test |
|---|----------|-------|--------|---------------|
| 1 | English | Light | Desktop | All |
| 2 | English | Light | Mobile | All |
| 3 | English | Dark | Desktop | All |
| 4 | English | Dark | Mobile | All |
| 5 | Arabic | Light | Desktop | All |
| 6 | Arabic | Light | Mobile | All |
| 7 | Arabic | Dark | Desktop | All |
| 8 | Arabic | Dark | Mobile | All |

**Pages:** Home, Services, Our Work, **Mockups**, **Mockup Detail**, About, Contact

---

## 1. Mockups Page Tests (`/mockups`)

### Hero Section
- [ ] Premium hero displays with aurora blobs and floating shapes
- [ ] Device showcase carousel shows 3 frames (laptop, tablet, phone)
- [ ] Frames auto-cycle every 3.5s with smooth transitions
- [ ] Mockup previews appear in device frames (fallback if no mockup)
- [ ] Floating category chips orbit around showcase (desktop only)
- [ ] Handwritten annotation appears with animated arrow
- [ ] Breadcrumb navigation works (Home → Mockups)
- [ ] Stats counters display real numbers from database
- [ ] CTA buttons work (Browse Designs scrolls, Request Design → /contact)
- [ ] All text is bilingual (EN/AR)

**Visual Checks:**
- [ ] Light mode: Airy frost-white background, high contrast text
- [ ] Dark mode: Deep navy background, proper contrast
- [ ] Arabic: RTL layout, Aref Ruqaa handwriting font
- [ ] English: LTR layout, Caveat handwriting font

### Category Filter Bar
- [ ] Sticky filter bar appears when scrolling past hero
- [ ] "All Designs" button shows total count
- [ ] Each category button shows count from database
- [ ] Active category has primary color background
- [ ] Clicking category filters mockups correctly
- [ ] URL updates with `?category=slug` parameter
- [ ] Search input filters by title and description
- [ ] Search is debounced (500ms delay)
- [ ] Sort dropdown works (Newest, Oldest, Price Low-High, Price High-Low)
- [ ] Clear search button (X) appears when typing

### Mockup Grid
- [ ] Grid shows filtered mockups (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Each card shows:
  - [ ] Browser frame with dots and address bar
  - [ ] Desktop screenshot or cover image
  - [ ] Fallback screen if no image (category-based gradient)
  - [ ] Scroll preview on hover (if full-page screenshot exists)
  - [ ] Category pill with database color
  - [ ] Mockup title (bilingual)
  - [ ] Short description (bilingual)
  - [ ] Badges: NEW, POPULAR, FEATURED, PREMIUM (if applicable)
  - [ ] Price or "Free" label
  - [ ] View button → detail page
  - [ ] Request button → /contact?design=slug
- [ ] Hover effects: scale, shadow, scroll animation
- [ ] Cards are responsive and adapt to screen size
- [ ] "Load More" button appears if more than 9 mockups
- [ ] Empty state shows if no mockups match filter

### Banners & Footer
- [ ] "Found a design you like?" banner appears mid-page
- [ ] FAQ section displays with accordion (from database)
- [ ] Final CTA band with gradient background
- [ ] Footer displays correctly
- [ ] WhatsApp floating button appears bottom-right

### Mobile-Specific
- [ ] Sticky mobile CTA appears at bottom (Can't find your design?)
- [ ] CTA is dismissible (X button)
- [ ] Dismissal remembered in localStorage
- [ ] CTA doesn't appear on desktop (lg+ screens)

---

## 2. Mockup Detail Page Tests (`/mockups/:slug`)

### Hero Section
- [ ] Breadcrumb: Home → Mockups → {Title}
- [ ] Large device preview (desktop frame)
- [ ] Device switcher buttons: Desktop, Tablet, Mobile
- [ ] Switching devices updates preview frame and image
- [ ] Fallback screen if screenshot missing for selected device
- [ ] Title displays (bilingual)
- [ ] Short description displays (bilingual)
- [ ] Category pill with color from database
- [ ] Badges display if applicable (NEW, POPULAR, FEATURED)
- [ ] Price displays or "Free"
- [ ] "Request This Design" button → /contact?design=slug
- [ ] "View Demo" button (if demo_url exists) opens in new tab
- [ ] WhatsApp button with mockup title prefilled

### What's Included Section
- [ ] Title: "What's Included" (bilingual)
- [ ] List of features from database (whats_included jsonb)
- [ ] Each item has checkmark icon
- [ ] List is responsive

### Long Description
- [ ] Long description displays if exists (bilingual)
- [ ] Proper line breaks and formatting

### Related Mockups
- [ ] Section shows 3 mockups from same category
- [ ] Excludes current mockup
- [ ] Each card is clickable → other mockup detail page
- [ ] Cards use EnhancedMockupCard component

### Final CTA
- [ ] CTA band: "Ready to bring this design to life?"
- [ ] "Request This Design" button → /contact?design=slug

### 404 Handling
- [ ] Invalid slug shows 404 message
- [ ] "Back to Mockups" button works

---

## 3. Contact Page Tests (`/contact`)

### Normal Contact (no design parameter)
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Contact form displays
- [ ] All fields work: Name, Country, Phone, WhatsApp, Email, Message
- [ ] "Same as phone" checkbox syncs WhatsApp with Phone
- [ ] Country dropdown loads from database
- [ ] Form validation works (required fields, email format, phone format)
- [ ] Submit sends to Supabase messages table
- [ ] Success toast appears
- [ ] Form clears after submit

### Design Request (with `?design=slug` parameter)
- [ ] URL: `/contact?design=e-commerce-dashboard`
- [ ] Mockup chip appears at top of form
- [ ] Chip shows:
  - [ ] Thumbnail (cover_image_url or desktop_screenshot_url)
  - [ ] "Design Request" badge (bilingual)
  - [ ] Mockup title (bilingual)
  - [ ] "View Design" button (external link icon) opens in new tab
  - [ ] "Remove" button (X icon) clears selection
- [ ] Form header changes to "Request This Design" (bilingual)
- [ ] Message field prefilled: "I'm interested in the "{title}" mockup design. "
- [ ] Prefill is bilingual based on language
- [ ] Clicking "Remove" clears chip and resets header
- [ ] Submit saves with `mockup_id` and `type='mockup_request'`

---

## 4. Admin Dashboard Tests

### Login
- [ ] Navigate to `/admin/login`
- [ ] Login with credentials
- [ ] Redirects to `/admin/dashboard`

### Mockup Categories Page (`/admin/mockup-categories`)
- [ ] Grid displays all categories
- [ ] Each card shows:
  - [ ] Icon (from Lucide)
  - [ ] Color badge
  - [ ] Name EN/AR
  - [ ] Description
  - [ ] Active/Inactive badge
  - [ ] Edit button
  - [ ] Delete button
- [ ] "Add Category" button opens modal
- [ ] Modal form has:
  - [ ] Name EN/AR (required)
  - [ ] Slug (auto-generated)
  - [ ] Description EN/AR (optional)
  - [ ] Icon picker with 20 icons
  - [ ] Color picker (visual + hex)
  - [ ] Display order
  - [ ] Active toggle
- [ ] Creating category saves to database
- [ ] Editing category updates database
- [ ] Deleting category works (with confirmation)
- [ ] Icon picker shows icons correctly
- [ ] Selected icon highlights in picker

### Mockups Page (`/admin/mockups`)
- [ ] Table displays all mockups with:
  - [ ] Thumbnail
  - [ ] Title EN/AR
  - [ ] 4 badges (NEW, POPULAR, FEATURED, PREMIUM)
  - [ ] Category name from database
  - [ ] Tags (first 2 + count)
  - [ ] Price or "Free"
  - [ ] Edit/Delete actions
- [ ] "Add Mockup" button opens modal
- [ ] Modal form has:
  - [ ] Slug (auto-generated from title_en)
  - [ ] Title EN/AR (required)
  - [ ] Category dropdown (from database)
  - [ ] Short Description EN/AR (required)
  - [ ] Long Description EN/AR (optional)
  - [ ] **5 Screenshot Upload Fields:**
    - [ ] Desktop Screenshot (required) + Alt Text EN/AR
    - [ ] Full-Page Screenshot
    - [ ] Tablet Screenshot
    - [ ] Mobile Screenshot
    - [ ] Cover Image
  - [ ] Demo URL
  - [ ] What's Included (JSON array editor)
  - [ ] Tags (comma-separated)
  - [ ] Badge toggles: NEW, POPULAR, FEATURED
  - [ ] Premium + Price
  - [ ] Display Order
  - [ ] Active toggle
- [ ] Creating mockup saves to database
- [ ] Editing mockup loads all fields correctly
- [ ] Image uploads work (MediaUploadField)
- [ ] JSON editor accepts valid JSON arrays
- [ ] Category dropdown shows database categories
- [ ] Deleting mockup works (with confirmation)

### Messages Page (`/admin/messages`)
- [ ] Table displays all messages
- [ ] Filter by status: All, New, Read, Replied, Archived
- [ ] Filter by type: All, Contact, Mockup Request, Quote Request
- [ ] Messages with `mockup_id` show:
  - [ ] Mockup thumbnail in "From" column
  - [ ] Mockup title below type badge
  - [ ] Pink "Mockup Request" badge
- [ ] Clicking message opens detail modal
- [ ] Modal shows:
  - [ ] Sender info (name, email, phone)
  - [ ] Type and status badges
  - [ ] Date
  - [ ] Message content
  - [ ] **If design request:** "Requested Design" section with:
    - [ ] Mockup thumbnail
    - [ ] Title EN/AR
    - [ ] "View Design" link (opens in new tab)
    - [ ] Pink border/background
- [ ] Status update buttons work
- [ ] Delete button works

---

## 5. Integration Tests

### Full Design Request Flow
1. [ ] Start at `/mockups`
2. [ ] Browse mockups
3. [ ] Click "Request This Design" on a card
4. [ ] Redirects to `/contact?design=slug`
5. [ ] Mockup chip appears in form
6. [ ] Message prefilled
7. [ ] Fill remaining fields
8. [ ] Submit form
9. [ ] Success toast appears
10. [ ] Go to `/admin/messages`
11. [ ] New message appears with mockup thumbnail
12. [ ] Type shows "Mockup Request"
13. [ ] Click message to view details
14. [ ] "Requested Design" section displays
15. [ ] Click "View Design" → opens mockup detail page

### Category Filter Flow
1. [ ] Start at `/mockups`
2. [ ] URL: `/mockups`
3. [ ] Click a category (e.g., "E-commerce")
4. [ ] URL updates to `/mockups?category=e-commerce`
5. [ ] Grid filters to show only that category
6. [ ] Count updates on category button
7. [ ] Click "All Designs"
8. [ ] URL returns to `/mockups`
9. [ ] All mockups show again

### Search Flow
1. [ ] Type in search box: "dashboard"
2. [ ] Results filter after 500ms
3. [ ] Only matching mockups show
4. [ ] Click X to clear search
5. [ ] All mockups return

### Quick View Modal
1. [ ] Click "View" button on a mockup card
2. [ ] Modal opens with device preview
3. [ ] Device switcher works
4. [ ] "Request This Design" button → /contact?design=slug
5. [ ] Previous/Next buttons navigate mockups
6. [ ] Close button (X) closes modal
7. [ ] Escape key closes modal
8. [ ] Clicking outside closes modal
9. [ ] Focus returns to trigger element

---

## 6. Responsive Tests

### Desktop (1440px+)
- [ ] 3-column mockup grid
- [ ] Floating category chips visible
- [ ] Device showcase large and prominent
- [ ] Filter bar fits all categories in one row
- [ ] Sticky CTA does NOT appear

### Tablet (768px - 1024px)
- [ ] 2-column mockup grid
- [ ] Floating chips hidden
- [ ] Device showcase slightly smaller
- [ ] Filter bar wraps categories if needed
- [ ] Sticky CTA appears at bottom

### Mobile (< 768px)
- [ ] 1-column mockup grid
- [ ] Floating chips hidden
- [ ] Device showcase stacks vertically
- [ ] Filter bar scrolls horizontally
- [ ] Sticky CTA appears at bottom
- [ ] Form fields stack vertically
- [ ] Mockup chip in contact form is compact

---

## 7. Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Skip to content link works
- [ ] Focus visible on all elements
- [ ] Modal traps focus
- [ ] Escape closes modal
- [ ] Arrow keys navigate mockups in modal

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Status changes announced
- [ ] Headings in correct hierarchy (h1 → h2 → h3)

### Color Contrast
- [ ] Text readable in light mode (WCAG AA)
- [ ] Text readable in dark mode (WCAG AA)
- [ ] Focus indicators visible
- [ ] Disabled states clear

---

## 8. Performance Tests

### Load Time
- [ ] Homepage loads in < 3s (3G)
- [ ] Mockups page loads in < 4s (3G)
- [ ] Images lazy load below fold
- [ ] Hero images load immediately

### Lighthouse Scores (Target)
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 100

### Bundle Size
- [ ] Initial JS < 500KB (gzipped)
- [ ] Admin pages lazy loaded
- [ ] Images optimized (WebP where possible)

---

## 9. Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 10. Edge Cases

### Empty States
- [ ] No mockups in database → shows empty message
- [ ] No mockups match search → shows "No results"
- [ ] No mockups in category → shows empty state
- [ ] No related mockups → section hidden

### Missing Data
- [ ] Mockup without full-page screenshot → no scroll animation
- [ ] Mockup without tablet/mobile screenshot → fallback screen
- [ ] Mockup without demo_url → button hidden
- [ ] Mockup without whats_included → section hidden
- [ ] Category without mockups → shows count 0

### Invalid URLs
- [ ] `/mockups/invalid-slug` → 404 page
- [ ] `/contact?design=invalid` → shows form normally (no chip)
- [ ] Invalid category in URL → shows all mockups

---

## 11. Database Verification

Run in Supabase SQL Editor:

```sql
-- Check mockup categories
SELECT COUNT(*) as total, 
       COUNT(*) FILTER (WHERE is_active = true) as active
FROM mockup_categories;
-- Expected: total >= 10, active >= 3

-- Check mockups
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE is_active = true) as active,
       COUNT(*) FILTER (WHERE mockup_id IS NOT NULL) as with_category
FROM mockups;
-- Expected: total >= 1, active >= 1, with_category = total

-- Check messages with mockup_id
SELECT COUNT(*) as design_requests
FROM messages
WHERE mockup_id IS NOT NULL;
-- Expected: >= 1 after testing

-- Verify join works
SELECT m.full_name, mo.title_en
FROM messages m
LEFT JOIN mockups mo ON m.mockup_id = mo.id
WHERE m.mockup_id IS NOT NULL
LIMIT 5;
-- Expected: Returns rows with mockup titles
```

---

## 12. Final Checklist

### Documentation
- [ ] README.md updated with new routes
- [ ] Migration instructions clear
- [ ] Admin usage documented
- [ ] Known issues documented (if any)

### Code Quality
- [ ] No console errors
- [ ] No console warnings (except third-party)
- [ ] No TypeScript errors (if applicable)
- [ ] Code formatted consistently
- [ ] Comments added where needed

### Deployment Readiness
- [ ] All migrations applied to production database
- [ ] Environment variables set
- [ ] Build succeeds (`npm run build`)
- [ ] Production bundle tested
- [ ] Error tracking configured (if using Sentry/etc)

---

## Summary Report Template

```
## Mockups Redesign Test Results

**Test Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Development / Staging / Production

### Overall Status
- [ ] PASS - Ready for production
- [ ] PARTIAL PASS - Minor issues, can deploy
- [ ] FAIL - Critical issues, cannot deploy

### Tests Passed: X / Y (Z%)

### Critical Issues:
1. [Issue description]
2. [Issue description]

### Minor Issues:
1. [Issue description]
2. [Issue description]

### Browser Compatibility:
- Chrome: PASS / FAIL
- Firefox: PASS / FAIL
- Safari: PASS / FAIL
- Mobile Safari: PASS / FAIL
- Chrome Mobile: PASS / FAIL

### Performance:
- Lighthouse Performance: XX / 100
- Lighthouse Accessibility: XX / 100
- Lighthouse Best Practices: XX / 100
- Lighthouse SEO: XX / 100

### Recommendations:
- [Recommendation 1]
- [Recommendation 2]

### Sign-off:
Developer: ___________  Date: __________
QA: ___________  Date: __________
Product Owner: ___________  Date: __________
```

---

## 🎉 Completion Criteria

The Mockups redesign is **COMPLETE** and **READY FOR PRODUCTION** when:

✅ All 8 test matrix combinations pass  
✅ Admin dashboard fully functional  
✅ Design request flow works end-to-end  
✅ No critical bugs or console errors  
✅ Lighthouse scores meet targets  
✅ Responsive on all devices  
✅ Accessible (keyboard, screen reader)  
✅ Database migrations applied  
✅ Real content uploaded (at least 5 mockups)  
✅ Documentation complete  

**Good luck with testing!** 🚀
