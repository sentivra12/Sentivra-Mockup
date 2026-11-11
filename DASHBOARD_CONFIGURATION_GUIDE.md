# Dashboard Configuration Guide
Complete guide to configuring the Mockups Hero via Admin Dashboard

## Overview
The new Mockups Hero is fully editable via the admin dashboard. This guide shows:
1. Where to paste tracking IDs
2. What content is editable
3. How to apply migrations
4. Where to find each setting

---

## 🚀 Quick Start (First Time Setup)

### Step 1: Apply Database Migrations

**You MUST run these migrations in your Supabase SQL Editor before the hero works:**

1. **Log into Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Left sidebar → SQL Editor
   - Click "+ New query"

3. **Run Migration 1: Attribution Tracking**
   ```sql
   -- Paste contents of: supabase/migrations/20261113000001_add_attribution_tracking.sql
   ```
   - Click "Run"
   - ✅ Success: "ALTER TABLE" message appears

4. **Run Migration 2: Hero Content Fields**
   ```sql
   -- Paste contents of: supabase/migrations/20261113000002_add_mockups_hero_content.sql
   ```
   - Click "Run"
   - ✅ Success: "ALTER TABLE" message appears

5. **Run Migration 3: Tracking IDs**
   ```sql
   -- Paste contents of: supabase/migrations/20261113000003_add_tracking_ids_to_settings.sql
   ```
   - Click "Run"
   - ✅ Success: "ALTER TABLE" message appears

6. **Verify Migrations Applied**
   ```sql
   -- Paste contents of: CHECK_MOCKUPS_DATA.sql
   ```
   - Run each query individually
   - Report results (number of mockups, categories, images)

---

## 📊 Analytics & Tracking Configuration

### Where: Admin Dashboard → Site Settings

**Path:** `/admin/settings` (or click "Settings" in admin sidebar)

**Scroll to:** "Analytics & Tracking" section

### Fields to Configure

#### 1. Meta Pixel ID
- **Field Name:** Meta Pixel ID
- **Where to Find It:**
  1. Go to: https://business.facebook.com/events_manager2
  2. Select your Pixel
  3. Copy the Pixel ID (15-16 digits)
- **Example:** `1234567890123456`
- **Paste into:** Admin → Settings → Analytics & Tracking → Meta Pixel ID
- **Click eye icon** to show/hide (masked by default for security)

#### 2. Google Analytics 4 Measurement ID
- **Field Name:** Google Analytics 4 Measurement ID
- **Where to Find It:**
  1. Go to: https://analytics.google.com/
  2. Admin (bottom-left gear icon)
  3. Select Property → Data Streams
  4. Click your Web stream
  5. Copy "Measurement ID" (starts with `G-`)
- **Example:** `G-XXXXXXXXXX`
- **Paste into:** Admin → Settings → Analytics & Tracking → Google Analytics 4 Measurement ID

#### 3. Google Ads ID
- **Field Name:** Google Ads ID
- **Where to Find It:**
  1. Go to: https://ads.google.com/
  2. Tools & Settings → Conversions
  3. Click your conversion action
  4. Click "Tag setup" → "Use Google Tag Manager" → Copy ID (starts with `AW-`)
- **Example:** `AW-123456789`
- **Paste into:** Admin → Settings → Analytics & Tracking → Google Ads ID

#### 4. Google Ads Conversion Label
- **Field Name:** Google Ads Conversion Label
- **Where to Find It:**
  1. Same place as Google Ads ID
  2. Copy the conversion label (alphanumeric string after `/`)
- **Example:** `AbC123dEfGhIjKlMnOp`
- **Paste into:** Admin → Settings → Analytics & Tracking → Google Ads Conversion Label

#### 5. TikTok Pixel ID
- **Field Name:** TikTok Pixel ID
- **Where to Find It:**
  1. Go to: https://ads.tiktok.com/
  2. Assets → Events → Web Events
  3. Click your Pixel
  4. Copy "Pixel ID" (starts with `C`)
- **Example:** `C1234567890ABCDEFGHIJ`
- **Paste into:** Admin → Settings → Analytics & Tracking → TikTok Pixel ID

#### 6. Cookie Consent Banner
- **Field Name:** Enable Cookie Consent Banner
- **Checkbox:** Check to enable, uncheck to disable
- **Recommended:** Check if targeting EU users (GDPR compliance)
- **Note:** When enabled, tracking scripts won't load until user accepts

### Save Settings
- Click **"Save Settings"** button at bottom
- ✅ Toast notification: "Settings saved!"

---

## 📝 Hero Content Configuration

### Where: Admin Dashboard → Page Content

**Path:** `/admin/page-content` (or click "Content" → "Page Content" in admin sidebar)

**Find:** Row where `page_key = 'mockups'`

**Click:** "Edit" icon (pencil)

### Hero Fields (All Support EN & AR)

When you click "Edit" on the Mockups page row, you'll see these fields in the modal:

#### General Hero Fields

1. **Eyebrow Text (EN)**
   - **Field:** `hero_eyebrow`
   - **Description:** Small text above main heading
   - **Example EN:** "Premium UI/UX Designs"
   - **Character Limit:** ~50 chars
   - **Displays:** Top of hero, above heading

2. **Eyebrow Text (AR)**
   - **Field:** `hero_eyebrow_ar`
   - **Example AR:** "تصاميم UI/UX المميزة"

3. **Handwritten Note (EN)**
   - **Field:** `hero_handwritten_note`
   - **Description:** Casual annotation with arrow pointing at laptop
   - **Example EN:** "See it in action!"
   - **Font:** Caveat (handwritten)
   - **Character Limit:** ~30 chars
   - **Displays:** Floating near laptop showcase with SVG arrow

4. **Handwritten Note (AR)**
   - **Field:** `hero_handwritten_note_ar`
   - **Example AR:** "شاهده بالعمل!"
   - **Font:** Aref Ruqaa (Arabic handwritten)

5. **Industry Lead-in (EN)**
   - **Field:** `hero_industry_lead`
   - **Description:** Text before rotating industry categories
   - **Example EN:** "Perfect for"
   - **Displays:** Before typewriter effect (e.g., "Perfect for E-commerce | SaaS | Healthcare")

6. **Industry Lead-in (AR)**
   - **Field:** `hero_industry_lead_ar`
   - **Example AR:** "مثالي لـ"

#### Button Text

7. **Primary CTA (EN)**
   - **Field:** `hero_primary_cta`
   - **Description:** Main call-to-action button
   - **Example EN:** "Browse Designs"
   - **Action:** Scrolls to mockup grid
   - **Style:** Gradient button (primary)

8. **Primary CTA (AR)**
   - **Field:** `hero_primary_cta_ar`
   - **Example AR:** "تصفح التصاميم"

9. **Secondary CTA (EN)**
   - **Field:** `hero_secondary_cta`
   - **Description:** Second call-to-action button
   - **Example EN:** "Request Custom Design"
   - **Action:** Opens contact form or navigates to contact page
   - **Style:** Outline button (secondary)

10. **Secondary CTA (AR)**
    - **Field:** `hero_secondary_cta_ar`
    - **Example AR:** "اطلب تصميم مخصص"

#### Sticky Mobile Bar

11. **Sticky Bar Text (EN)**
    - **Field:** `sticky_bar_text`
    - **Description:** Text in mobile sticky bar (appears after scroll)
    - **Example EN:** "Ready to transform your idea?"
    - **Character Limit:** ~50 chars
    - **Displays:** Mobile only (<768px), after scrolling ~80vh

12. **Sticky Bar Text (AR)**
    - **Field:** `sticky_bar_text_ar`
    - **Example AR:** "هل أنت مستعد لتحويل فكرتك؟"

13. **Sticky Bar CTA (EN)**
    - **Field:** `sticky_bar_cta`
    - **Description:** Button text in sticky bar
    - **Example EN:** "Get Started"
    - **Action:** Opens contact form

14. **Sticky Bar CTA (AR)**
    - **Field:** `sticky_bar_cta_ar`
    - **Example AR:** "ابدأ الآن"

#### Hero Options (Toggles)

15. **Show Hero Stats**
    - **Field:** `show_hero_stats`
    - **Type:** Checkbox (boolean)
    - **Description:** Show/hide stats counters (e.g., "500+ Designs", "100+ Categories")
    - **Default:** Checked (true)
    - **Note:** Stats are auto-calculated from database

16. **Show Industry Line**
    - **Field:** `show_industry_line`
    - **Type:** Checkbox (boolean)
    - **Description:** Show/hide rotating industry categories line
    - **Default:** Checked (true)
    - **Note:** Categories are auto-generated from published mockups

### Main Content Fields (Existing)

**These fields control the main heading and subtitle:**

17. **Page Title (EN)**
    - **Field:** `title`
    - **Description:** Main hero heading (`<h1>`)
    - **Example EN:** "Browse 500+ Premium Mockup Designs"
    - **Character Limit:** ~80 chars
    - **SEO:** This is the H1 of the page

18. **Page Title (AR)**
    - **Field:** `title_ar`
    - **Example AR:** "تصفح أكثر من 500 تصميم موك اب مميز"

19. **Subtitle/Description (EN)**
    - **Field:** `subtitle` or `description`
    - **Description:** Supporting text below heading
    - **Example EN:** "High-quality, customizable UI/UX designs for websites, apps, and digital products. Download instantly or request custom modifications."
    - **Character Limit:** ~200 chars

20. **Subtitle/Description (AR)**
    - **Field:** `subtitle_ar` or `description_ar`
    - **Example AR:** "تصاميم عالية الجودة وقابلة للتخصيص لمواقع الويب والتطبيقات والمنتجات الرقمية. قم بالتنزيل فورًا أو اطلب تعديلات مخصصة."

### Save Page Content
- Click **"Save"** button in modal
- ✅ Toast notification: "Page content updated!"
- Refresh `/mockups` page to see changes

---

## 📨 Viewing Attribution Data (Messages)

### Where: Admin Dashboard → Messages

**Path:** `/admin/messages` (or click "Messages" in admin sidebar)

### New Features

#### Filter by Source
- **New dropdown:** "All Sources"
- **Options:** Dynamically populated from messages (e.g., "facebook", "google", "tiktok")
- **Use Case:** Filter messages by ad source to measure campaign performance

#### Attribution in Table
- **Type column:** Now shows source badge below type (e.g., 🔼 facebook)
- **Hover:** See full source name

#### Attribution in Detail View
- **Click:** Any message → Opens detail modal
- **Scroll down:** To "Attribution Data" section (blue background)
- **Fields Shown:**
  - Source (utm_source)
  - Medium (utm_medium)
  - Campaign (utm_campaign)
  - Content (utm_content)
  - Term (utm_term)
  - Google Click ID (gclid)
  - Facebook Click ID (fbclid)
  - TikTok Click ID (ttclid)
  - Referrer (clickable link)
  - Landing Page (clickable link)
  - First Visit (timestamp)

### Use Cases

**Measure campaign ROI:**
1. Run ad campaign with URL: `https://yoursite.com/mockups?utm_source=facebook&utm_campaign=summer_sale`
2. User visits, browses, submits contact form
3. Go to Admin → Messages
4. Filter by Source: "facebook"
5. See all leads from Facebook campaign
6. View attribution details to see campaign name, content, etc.

**Track conversions by click ID:**
- Google Ads: Use `gclid` to match conversions in Google Ads dashboard
- Facebook Ads: Use `fbclid` to match conversions in Meta Events Manager
- TikTok Ads: Use `ttclid` to match conversions in TikTok Ads Manager

---

## 🎨 What's NOT Editable in Dashboard

**These are code-level settings (require developer):**

### Hard-Coded in MockupsHero.jsx

- Animation speeds (Aurora blobs: 20s/25s, Floating shapes: 15-22s)
- Laptop showcase cycle interval (3.5s)
- Industry category rotation interval (2.5s)
- Number of floating devices (phone, tablet, cards)
- Color scheme (uses Tailwind theme)
- Background layers (Aurora, grid, shapes, code tokens)
- Stats calculation logic (auto from DB)

### Editable in Code Only

**To change these, edit `src/components/mockups/MockupsHero.jsx`:**

- Add/remove floating shapes: Modify `floatingShapes` array
- Change animation durations: Edit `animate` props in Framer Motion components
- Modify laptop showcase: Edit `MockupShowcase` component
- Change stats displayed: Edit stats array in hero component
- Customize colors: Edit Tailwind classes or `tailwind.config.js`

---

## 🔄 Connection Table: Content → Dashboard Location

| **Content** | **Dashboard Location** | **Field Name** | **Language Support** |
|-------------|------------------------|----------------|----------------------|
| **HERO SECTION** |
| Eyebrow text | Page Content → Mockups → Edit | `hero_eyebrow` / `hero_eyebrow_ar` | ✅ EN/AR |
| Main heading | Page Content → Mockups → Edit | `title` / `title_ar` | ✅ EN/AR |
| Subtitle | Page Content → Mockups → Edit | `subtitle` / `subtitle_ar` | ✅ EN/AR |
| Primary button | Page Content → Mockups → Edit | `hero_primary_cta` / `hero_primary_cta_ar` | ✅ EN/AR |
| Secondary button | Page Content → Mockups → Edit | `hero_secondary_cta` / `hero_secondary_cta_ar` | ✅ EN/AR |
| Handwritten note | Page Content → Mockups → Edit | `hero_handwritten_note` / `hero_handwritten_note_ar` | ✅ EN/AR |
| Industry lead-in | Page Content → Mockups → Edit | `hero_industry_lead` / `hero_industry_lead_ar` | ✅ EN/AR |
| Show stats toggle | Page Content → Mockups → Edit | `show_hero_stats` | ❌ Boolean |
| Show industry line | Page Content → Mockups → Edit | `show_industry_line` | ❌ Boolean |
| **STICKY BAR (MOBILE)** |
| Sticky bar text | Page Content → Mockups → Edit | `sticky_bar_text` / `sticky_bar_text_ar` | ✅ EN/AR |
| Sticky bar button | Page Content → Mockups → Edit | `sticky_bar_cta` / `sticky_bar_cta_ar` | ✅ EN/AR |
| **ANALYTICS** |
| Meta Pixel ID | Site Settings → Analytics & Tracking | `meta_pixel_id` | ❌ Code |
| GA4 Measurement ID | Site Settings → Analytics & Tracking | `ga4_measurement_id` | ❌ Code |
| Google Ads ID | Site Settings → Analytics & Tracking | `google_ads_id` | ❌ Code |
| Google Ads Label | Site Settings → Analytics & Tracking | `google_ads_conversion_label` | ❌ Code |
| TikTok Pixel ID | Site Settings → Analytics & Tracking | `tiktok_pixel_id` | ❌ Code |
| Cookie banner | Site Settings → Analytics & Tracking | `enable_cookie_banner` | ❌ Boolean |
| **ATTRIBUTION DATA** |
| View attribution | Messages → Click message → Attribution Data | Auto-captured | ❌ Read-only |
| Filter by source | Messages → "All Sources" dropdown | Auto-populated | ❌ Read-only |

---

## 📋 Pre-Launch Checklist

Before going live with the new hero:

### Database
- [ ] All 3 migrations applied in Supabase
- [ ] `CHECK_MOCKUPS_DATA.sql` run and results reviewed
- [ ] At least 5 mockups published with images
- [ ] At least 3 categories active

### Content (Page Content)
- [ ] `hero_eyebrow` filled (EN)
- [ ] `hero_eyebrow_ar` filled (AR)
- [ ] `title` filled (EN)
- [ ] `title_ar` filled (AR)
- [ ] `subtitle` filled (EN)
- [ ] `subtitle_ar` filled (AR)
- [ ] `hero_primary_cta` filled (EN)
- [ ] `hero_primary_cta_ar` filled (AR)
- [ ] `hero_secondary_cta` filled (EN)
- [ ] `hero_secondary_cta_ar` filled (AR)
- [ ] `hero_handwritten_note` filled (EN)
- [ ] `hero_handwritten_note_ar` filled (AR)
- [ ] `hero_industry_lead` filled (EN)
- [ ] `hero_industry_lead_ar` filled (AR)
- [ ] `sticky_bar_text` filled (EN)
- [ ] `sticky_bar_text_ar` filled (AR)
- [ ] `sticky_bar_cta` filled (EN)
- [ ] `sticky_bar_cta_ar` filled (AR)

### Analytics (Site Settings)
- [ ] At least ONE tracking ID configured (Meta/GA4/Google Ads/TikTok)
- [ ] Cookie banner enabled (if targeting EU)
- [ ] Test event fired successfully (check browser Network tab)

### Testing
- [ ] Smoke test passed (see `MOCKUPS_HERO_SMOKE_TEST.md`)
- [ ] Manual testing passed (see `MANUAL_TESTING_CHECKLIST.md`)
- [ ] Lighthouse score ≥ 90
- [ ] Real device testing on iOS + Android

### Ad Campaign Setup
- [ ] Ad URLs include UTM parameters
  - Example: `https://yoursite.com/mockups?utm_source=facebook&utm_medium=cpc&utm_campaign=launch_2024`
- [ ] Click IDs auto-append (gclid, fbclid, ttclid)
- [ ] Attribution tested: Visit URL → Submit form → Check Messages dashboard

---

## 🆘 Troubleshooting

### Hero not showing custom text

**Problem:** Hero shows placeholder text or "Untitled Page"

**Solution:**
1. Go to Admin → Page Content
2. Find row where `page_key = 'mockups'`
3. Click Edit
4. Scroll to find hero fields (`hero_eyebrow`, etc.)
5. Fill in all EN fields (minimum)
6. Save
7. Refresh `/mockups` page

**If fields don't exist:**
- Run migration 2: `20261113000002_add_mockups_hero_content.sql`

---

### Tracking IDs not loading

**Problem:** Analytics events not firing, no pixel requests in Network tab

**Solution:**
1. Go to Admin → Site Settings
2. Scroll to "Analytics & Tracking"
3. Click eye icon to show IDs (they're masked by default)
4. Verify IDs are correct format:
   - Meta Pixel: 15-16 digits
   - GA4: Starts with `G-`
   - Google Ads: Starts with `AW-`
   - TikTok: Starts with `C`
5. Save
6. Clear browser cache + localStorage
7. Refresh `/mockups`
8. Check DevTools → Network tab for pixel requests

**If fields don't exist:**
- Run migration 3: `20261113000003_add_tracking_ids_to_settings.sql`

---

### Attribution data not showing in Messages

**Problem:** Messages received but "Attribution Data" section empty

**Solution:**
1. Test attribution capture:
   - Visit: `http://localhost:5173/mockups?utm_source=test`
   - Open console: `localStorage.getItem('attribution')`
   - Should return JSON with `utm_source: "test"`
2. If empty:
   - Check `src/main.jsx` calls `initAttribution()` on line ~20
   - Clear localStorage and revisit with UTM params
3. Submit a test message
4. Go to Admin → Messages → Click message
5. Scroll to "Attribution Data" section
6. If still empty:
   - Run migration 1: `20261113000001_add_attribution_tracking.sql`
   - Check `src/components/ui/ContactForm.jsx` includes `getAttributionForSubmission()`

---

### Hero animations janky/slow

**Problem:** Animations stuttering, low FPS

**Solution:**
1. Check browser performance:
   - DevTools → Performance tab
   - Record 3 seconds
   - Look for red bars (frame drops)
2. Disable animations temporarily:
   - Enable OS "Reduce Motion" setting
   - Hero should still work (animations disabled)
3. Reduce animation complexity (developer task):
   - Edit `MockupsHero.jsx`
   - Decrease number of floating shapes
   - Increase animation durations (slower = smoother)
   - Remove code tokens layer

---

### Mobile sticky bar not showing

**Problem:** Sticky bar doesn't appear after scrolling on mobile

**Solution:**
1. Test on viewport < 768px (tablet breakpoint)
2. Scroll down at least 80vh (80% of viewport height)
3. Bar should slide up from bottom
4. Check:
   - `StickyMobileCTA.jsx` imported in `MockupsPage.jsx`
   - No CSS `display: none` overrides
   - Z-index not covered by other elements

---

## 📚 Additional Resources

- **Smoke Test Guide:** `MOCKUPS_HERO_SMOKE_TEST.md`
- **Manual Testing Checklist:** `MANUAL_TESTING_CHECKLIST.md`
- **Database Check Queries:** `CHECK_MOCKUPS_DATA.sql`
- **Migration Files:** `supabase/migrations/2026111300000*_*.sql`
- **Attribution Utility:** `src/lib/attribution.js`
- **Analytics Wrapper:** `src/lib/analytics.js`
- **Hero Component:** `src/components/mockups/MockupsHero.jsx`

---

## 🎉 You're Ready!

After completing this guide:
1. ✅ Migrations applied
2. ✅ Content filled in (EN + AR)
3. ✅ Tracking IDs configured
4. ✅ Attribution tested
5. ✅ Hero tested across devices

**Next Steps:**
1. Launch ad campaigns with UTM parameters
2. Monitor attribution data in Messages dashboard
3. Measure conversions in Meta/GA4/Google Ads
4. Iterate on hero content based on performance
5. A/B test button text, eyebrow, handwritten note

**Need help?** Refer to troubleshooting section or check migration files for DB schema.
