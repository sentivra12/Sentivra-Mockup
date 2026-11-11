# Migration Instructions - Mockups Hero Setup
Step-by-step guide to apply database migrations and configure the new hero

## 📋 Prerequisites

Before starting:
- ✅ Access to Supabase Dashboard (https://app.supabase.com)
- ✅ Project admin/owner role in Supabase
- ✅ Code deployed to your environment (migrations files present)
- ✅ 10 minutes of uninterrupted time

**Important:** These migrations modify your production database. Always test in a staging environment first if available.

---

## 🚀 Step 1: Access Supabase SQL Editor

1. **Log into Supabase**
   - Go to: https://app.supabase.com
   - Sign in with your credentials

2. **Select Your Project**
   - Click on your project from the dashboard
   - Example: "Sentivra Production"

3. **Open SQL Editor**
   - Left sidebar → Click **"SQL Editor"**
   - Or use direct link: `https://app.supabase.com/project/YOUR_PROJECT_ID/sql`

4. **Create New Query**
   - Click **"+ New query"** button (top-right)
   - A blank SQL editor will open

---

## 🗄️ Step 2: Apply Migration 1 - Attribution Tracking

This migration adds UTM parameters and click IDs to the `messages` table for tracking ad campaign performance.

### What It Does
- Adds 11 new columns to `messages` table:
  - `utm_source` (e.g., "facebook", "google")
  - `utm_medium` (e.g., "cpc", "social")
  - `utm_campaign` (e.g., "summer_sale_2024")
  - `utm_content` (e.g., "hero_cta")
  - `utm_term` (e.g., "website design")
  - `gclid` (Google Click ID)
  - `fbclid` (Facebook Click ID)
  - `ttclid` (TikTok Click ID)
  - `referrer` (referring URL)
  - `landing_page` (first page visited)
  - `attribution_timestamp` (when attribution was captured)

### Instructions

1. **Open Migration File**
   - Navigate to: `supabase/migrations/20261113000001_add_attribution_tracking.sql`
   - Copy the entire contents

2. **Paste into SQL Editor**
   - In Supabase SQL Editor
   - Paste the SQL code
   - Review: Should see `ALTER TABLE public.messages ADD COLUMN ...`

3. **Run Migration**
   - Click **"Run"** button (bottom-right corner)
   - ⏳ Wait for execution (should take < 1 second)

4. **Verify Success**
   - ✅ Success message: `ALTER TABLE` appears in output pane
   - ✅ No error messages

5. **Check Columns Added**
   - Left sidebar → **"Table Editor"**
   - Select **"messages"** table
   - Scroll right to see new columns: `utm_source`, `utm_medium`, etc.

### Rollback (If Needed)
```sql
-- Only run if you need to undo this migration
ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_source;
ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_medium;
ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_campaign;
ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_content;
ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_term;
ALTER TABLE public.messages DROP COLUMN IF EXISTS gclid;
ALTER TABLE public.messages DROP COLUMN IF EXISTS fbclid;
ALTER TABLE public.messages DROP COLUMN IF EXISTS ttclid;
ALTER TABLE public.messages DROP COLUMN IF EXISTS referrer;
ALTER TABLE public.messages DROP COLUMN IF EXISTS landing_page;
ALTER TABLE public.messages DROP COLUMN IF EXISTS attribution_timestamp;
```

---

## 📄 Step 3: Apply Migration 2 - Hero Content Fields

This migration adds editable hero content fields to the `page_content` table.

### What It Does
- Adds 16 new columns to `page_content` table:
  - `hero_eyebrow` / `hero_eyebrow_ar` (small text above heading)
  - `hero_handwritten_note` / `hero_handwritten_note_ar` (annotation on laptop)
  - `hero_industry_lead` / `hero_industry_lead_ar` (text before categories)
  - `hero_primary_cta` / `hero_primary_cta_ar` (main button text)
  - `hero_secondary_cta` / `hero_secondary_cta_ar` (second button text)
  - `sticky_bar_text` / `sticky_bar_text_ar` (mobile sticky bar text)
  - `sticky_bar_cta` / `sticky_bar_cta_ar` (mobile sticky bar button)
  - `show_hero_stats` (boolean toggle for stats)
  - `show_industry_line` (boolean toggle for industry categories)

### Instructions

1. **Open Migration File**
   - Navigate to: `supabase/migrations/20261113000002_add_mockups_hero_content.sql`
   - Copy the entire contents

2. **Paste into SQL Editor**
   - Click **"+ New query"** (start fresh query)
   - Paste the SQL code
   - Review: Should see multiple `ALTER TABLE public.page_content ADD COLUMN ...`

3. **Run Migration**
   - Click **"Run"** button
   - ⏳ Wait for execution (should take < 1 second)

4. **Verify Success**
   - ✅ Success message: Multiple `ALTER TABLE` lines in output
   - ✅ No error messages

5. **Check Columns Added**
   - Table Editor → **"page_content"** table
   - Scroll right to see new columns: `hero_eyebrow`, `hero_handwritten_note`, etc.

### Rollback (If Needed)
```sql
-- Only run if you need to undo this migration
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_eyebrow;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_eyebrow_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_handwritten_note;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_handwritten_note_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_industry_lead;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_industry_lead_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_primary_cta;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_primary_cta_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_secondary_cta;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_secondary_cta_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_text;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_text_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_cta;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_cta_ar;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS show_hero_stats;
ALTER TABLE public.page_content DROP COLUMN IF EXISTS show_industry_line;
```

---

## 🎯 Step 4: Apply Migration 3 - Tracking IDs

This migration adds analytics tracking ID fields to the `site_settings` table.

### What It Does
- Adds 6 new columns to `site_settings` table:
  - `meta_pixel_id` (Facebook/Meta Pixel)
  - `ga4_measurement_id` (Google Analytics 4)
  - `google_ads_id` (Google Ads conversion tracking)
  - `google_ads_conversion_label` (Google Ads conversion label)
  - `tiktok_pixel_id` (TikTok Pixel)
  - `enable_cookie_banner` (boolean for GDPR compliance)

### Instructions

1. **Open Migration File**
   - Navigate to: `supabase/migrations/20261113000003_add_tracking_ids_to_settings.sql`
   - Copy the entire contents

2. **Paste into SQL Editor**
   - Click **"+ New query"**
   - Paste the SQL code
   - Review: Should see `ALTER TABLE public.site_settings ADD COLUMN ...`

3. **Run Migration**
   - Click **"Run"** button
   - ⏳ Wait for execution (should take < 1 second)

4. **Verify Success**
   - ✅ Success message: `ALTER TABLE` lines in output
   - ✅ No error messages

5. **Check Columns Added**
   - Table Editor → **"site_settings"** table
   - Scroll right to see new columns: `meta_pixel_id`, `ga4_measurement_id`, etc.

### Rollback (If Needed)
```sql
-- Only run if you need to undo this migration
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS meta_pixel_id;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS ga4_measurement_id;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS google_ads_id;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS google_ads_conversion_label;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS tiktok_pixel_id;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS enable_cookie_banner;
```

---

## ✅ Step 5: Verify All Migrations Applied

Run this verification query to check all migrations were successful:

### Verification SQL

**Copy and paste into SQL Editor:**

```sql
-- Check messages table has attribution columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'ttclid')
ORDER BY column_name;

-- Expected: 6 rows returned

-- Check page_content table has hero columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'page_content' 
  AND column_name LIKE 'hero_%' OR column_name LIKE 'sticky_bar_%' OR column_name LIKE 'show_%'
ORDER BY column_name;

-- Expected: 16 rows returned

-- Check site_settings table has tracking columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
  AND column_name IN ('meta_pixel_id', 'ga4_measurement_id', 'google_ads_id', 'tiktok_pixel_id', 'enable_cookie_banner')
ORDER BY column_name;

-- Expected: 5 rows returned
```

### Expected Results

**messages table:** 6 columns
- utm_source (text)
- utm_medium (text)
- utm_campaign (text)
- gclid (text)
- fbclid (text)
- ttclid (text)

**page_content table:** 16 columns
- hero_eyebrow (text)
- hero_eyebrow_ar (text)
- hero_handwritten_note (text)
- hero_handwritten_note_ar (text)
- hero_industry_lead (text)
- hero_industry_lead_ar (text)
- hero_primary_cta (text)
- hero_primary_cta_ar (text)
- hero_secondary_cta (text)
- hero_secondary_cta_ar (text)
- sticky_bar_text (text)
- sticky_bar_text_ar (text)
- sticky_bar_cta (text)
- sticky_bar_cta_ar (text)
- show_hero_stats (boolean)
- show_industry_line (boolean)

**site_settings table:** 5 columns
- meta_pixel_id (text)
- ga4_measurement_id (text)
- google_ads_id (text)
- google_ads_conversion_label (text)
- tiktok_pixel_id (text)
- enable_cookie_banner (boolean)

---

## 📊 Step 6: Check Current Data State

Run the provided data check queries to see what content exists:

### Data Check SQL

**Copy and paste from:** `CHECK_MOCKUPS_DATA.sql`

Or run manually:

```sql
-- 1. Check published mockups count
SELECT COUNT(*) as published_mockups_count
FROM mockups
WHERE is_published = true;

-- 2. Check categories with mockup counts
SELECT category_en, category_ar, COUNT(*) as mockup_count
FROM mockups
WHERE is_published = true
GROUP BY category_en, category_ar
ORDER BY mockup_count DESC;

-- 3. Check mockups with images
SELECT 
  slug,
  title_en,
  CASE WHEN cover_image_url IS NOT NULL THEN 'Yes' ELSE 'No' END as has_cover,
  CASE WHEN desktop_screenshot_url IS NOT NULL THEN 'Yes' ELSE 'No' END as has_desktop
FROM mockups
WHERE is_published = true
LIMIT 10;

-- 4. Check if page_content row for mockups exists
SELECT 
  page_key,
  title,
  title_ar,
  hero_eyebrow,
  hero_eyebrow_ar
FROM page_content
WHERE page_key = 'mockups';

-- 5. Check site_settings for tracking IDs
SELECT 
  meta_pixel_id,
  ga4_measurement_id,
  google_ads_id,
  tiktok_pixel_id,
  enable_cookie_banner
FROM site_settings
LIMIT 1;
```

### Record Results

**Copy this template and fill in:**

```
Migration Verification Report
=============================
Date: [Today's Date]
Performed By: [Your Name]

Published Mockups Count: [ ]
Categories Count: [ ]
Mockups with Cover Images: [ ] / [ ] total
Mockups with Desktop Screenshots: [ ] / [ ] total

Page Content - Mockups Row:
- Exists: [ ] Yes / [ ] No
- Title EN: [ ]
- Title AR: [ ]
- Hero Eyebrow EN: [ ] (empty expected)
- Hero Eyebrow AR: [ ] (empty expected)

Site Settings:
- Meta Pixel ID: [ ] (empty expected)
- GA4 ID: [ ] (empty expected)
- Google Ads ID: [ ] (empty expected)
- TikTok Pixel ID: [ ] (empty expected)
- Cookie Banner: [ ] (false expected)

All Migrations Applied: ✅ YES / ❌ NO

Issues Found:
- [ ]
```

---

## 🎨 Step 7: Populate Hero Content (Admin Dashboard)

Now that migrations are applied, populate the hero content via Admin Dashboard.

### Instructions

1. **Log into Admin Dashboard**
   - Go to: `https://yoursite.com/admin` (or `/admin` on your domain)
   - Sign in with admin credentials

2. **Navigate to Page Content**
   - Left sidebar → **"Content"** → **"Page Content"**
   - Or direct URL: `/admin/page-content`

3. **Find Mockups Page Row**
   - Look for row where `Page Key = "mockups"`
   - If not found, create it:
     - Click **"Add Page"**
     - Page Key: `mockups`
     - Save

4. **Edit Mockups Page Content**
   - Click **"Edit"** icon (pencil) on mockups row
   - Modal opens with all fields

5. **Fill Hero Fields - English**

Fill these fields (minimum required):

| Field | Suggested Value | Character Limit |
|-------|----------------|----------------|
| **Hero Eyebrow** | "Premium UI/UX Designs" | ~50 chars |
| **Hero Primary CTA** | "Browse Designs" | ~20 chars |
| **Hero Secondary CTA** | "Request Custom Design" | ~30 chars |
| **Hero Handwritten Note** | "See it in action!" | ~30 chars |
| **Hero Industry Lead** | "Perfect for" | ~20 chars |
| **Sticky Bar Text** | "Ready to transform your idea?" | ~50 chars |
| **Sticky Bar CTA** | "Get Started" | ~20 chars |

6. **Fill Hero Fields - Arabic**

| Field | Suggested Value | Character Limit |
|-------|----------------|----------------|
| **Hero Eyebrow AR** | "تصاميم UI/UX المميزة" | ~50 chars |
| **Hero Primary CTA AR** | "تصفح التصاميم" | ~20 chars |
| **Hero Secondary CTA AR** | "اطلب تصميم مخصص" | ~30 chars |
| **Hero Handwritten Note AR** | "شاهده بالعمل!" | ~30 chars |
| **Hero Industry Lead AR** | "مثالي لـ" | ~20 chars |
| **Sticky Bar Text AR** | "هل أنت مستعد لتحويل فكرتك؟" | ~50 chars |
| **Sticky Bar CTA AR** | "ابدأ الآن" | ~20 chars |

7. **Set Hero Options**
   - ✅ Check **"Show Hero Stats"** (displays "500+ Designs", etc.)
   - ✅ Check **"Show Industry Line"** (displays rotating categories)

8. **Fill Main Content (If Empty)**
   - **Title EN:** "Browse 500+ Premium Mockup Designs"
   - **Title AR:** "تصفح أكثر من 500 تصميم موك اب مميز"
   - **Subtitle EN:** "High-quality, customizable UI/UX designs for websites, apps, and digital products. Download instantly or request custom modifications."
   - **Subtitle AR:** "تصاميم عالية الجودة وقابلة للتخصيص لمواقع الويب والتطبيقات والمنتجات الرقمية. قم بالتنزيل فورًا أو اطلب تعديلات مخصصة."

9. **Save**
   - Click **"Save"** button at bottom of modal
   - ✅ Toast notification: "Page content updated!"

---

## 🎯 Step 8: Configure Analytics Tracking (Admin Dashboard)

Add your tracking IDs to enable analytics and conversion tracking.

### Instructions

1. **Navigate to Site Settings**
   - Admin sidebar → **"Settings"**
   - Or direct URL: `/admin/settings`

2. **Scroll to "Analytics & Tracking"**
   - Look for section with chart icon
   - Should see 5 input fields + 1 checkbox

3. **Paste Tracking IDs**

**Where to find each ID:** See `DASHBOARD_CONFIGURATION_GUIDE.md` Section "Analytics & Tracking Configuration"

| Field | Example Format | Required? |
|-------|---------------|-----------|
| **Meta Pixel ID** | `1234567890123456` | Optional |
| **GA4 Measurement ID** | `G-XXXXXXXXXX` | Optional |
| **Google Ads ID** | `AW-123456789` | Optional |
| **Google Ads Conversion Label** | `AbC123dEfGhIjKlMnOp` | Optional (with Ads ID) |
| **TikTok Pixel ID** | `C1234567890ABCDEFGHIJ` | Optional |

**Note:** Leave blank to disable a platform. At least ONE is recommended.

4. **Enable Cookie Banner (If Required)**
   - ✅ Check **"Enable Cookie Consent Banner"** if targeting EU users (GDPR)
   - Unchecked = scripts load immediately

5. **Save Settings**
   - Click **"Save Settings"** button at bottom
   - ✅ Toast notification: "Settings saved!"

---

## 🧪 Step 9: Test the New Hero

### Quick Smoke Test

1. **Visit Mockups Page**
   - Go to: `https://yoursite.com/mockups`
   - Or local dev: `http://localhost:5173/mockups`

2. **Visual Check**
   - ✅ Hero section visible (not blank)
   - ✅ Eyebrow text shows your content (not "{{key}}")
   - ✅ Heading shows your title
   - ✅ Two buttons visible with your CTA text
   - ✅ Laptop showcase cycling or showing wireframe
   - ✅ Handwritten note visible with arrow
   - ✅ Stats visible (if enabled)
   - ✅ Industry categories rotating (if enabled)

3. **Interactive Check**
   - ✅ Click "Browse Designs" → Scrolls to grid
   - ✅ Click "Request Custom Design" → Opens form or navigates
   - ✅ Scroll down on mobile → Sticky bar appears

4. **Console Check**
   - F12 → Console tab
   - ✅ No red errors (except expected if no mockups published)
   - ✅ Attribution captured: `localStorage.getItem('attribution')`

### Attribution Test

1. **Visit with UTM Parameters**
   ```
   https://yoursite.com/mockups?utm_source=test&utm_medium=manual&utm_campaign=migration_test
   ```

2. **Check Attribution Captured**
   - F12 → Console
   - Run: `JSON.parse(localStorage.getItem('attribution'))`
   - ✅ Should show: `{ utm_source: "test", utm_medium: "manual", utm_campaign: "migration_test", ... }`

3. **Submit Test Message**
   - Click "Request Custom Design"
   - Fill form
   - Submit

4. **Check Attribution in Dashboard**
   - Admin → Messages
   - Click your test message
   - Scroll to "Attribution Data" section
   - ✅ Should show: Source: test, Medium: manual, Campaign: migration_test

### Language Test

1. **Test Arabic**
   ```
   https://yoursite.com/mockups?lang=ar
   ```
   - ✅ Text in Arabic
   - ✅ RTL layout
   - ✅ Arabic fonts loaded

2. **Test Dark Mode**
   - Toggle dark mode in site
   - ✅ Text readable
   - ✅ Buttons have good contrast

---

## 📝 Step 10: Document Migration

### Record Migration Details

Create a migration log entry:

```
MIGRATION LOG
=============
Date: [Today's Date]
Performed By: [Your Name]
Environment: [Production/Staging]

Migrations Applied:
✅ 20261113000001_add_attribution_tracking.sql
✅ 20261113000002_add_mockups_hero_content.sql
✅ 20261113000003_add_tracking_ids_to_settings.sql

Database Changes:
- messages table: +11 columns (attribution fields)
- page_content table: +16 columns (hero content fields)
- site_settings table: +6 columns (tracking IDs)

Data Populated:
✅ Hero content (EN + AR)
✅ Tracking IDs: [List which platforms configured]

Testing Results:
✅ Visual rendering: PASS
✅ Interactive elements: PASS
✅ Attribution capture: PASS
✅ Analytics events: [PASS/FAIL/NOT TESTED]

Issues Found:
- [List any issues]

Rollback Plan:
- See "Rollback" sections in this document
- Backup taken: [YES/NO] [Backup location]

Sign-off:
- Developer: [Name]
- QA: [Name]
- Product Owner: [Name]
```

---

## 🔄 Rollback Instructions

### Full Rollback (Emergency)

**If something goes wrong and you need to undo all migrations:**

1. **Open SQL Editor**
   - Supabase → SQL Editor → New query

2. **Run Rollback SQL**
   ```sql
   -- Rollback Migration 3: Tracking IDs
   ALTER TABLE public.site_settings DROP COLUMN IF EXISTS meta_pixel_id;
   ALTER TABLE public.site_settings DROP COLUMN IF EXISTS ga4_measurement_id;
   ALTER TABLE public.site_settings DROP COLUMN IF EXISTS google_ads_id;
   ALTER TABLE public.site_settings DROP COLUMN IF EXISTS google_ads_conversion_label;
   ALTER TABLE public.site_settings DROP COLUMN IF EXISTS tiktok_pixel_id;
   ALTER TABLE public.site_settings DROP COLUMN IF EXISTS enable_cookie_banner;

   -- Rollback Migration 2: Hero Content
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_eyebrow;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_eyebrow_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_handwritten_note;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_handwritten_note_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_industry_lead;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_industry_lead_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_primary_cta;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_primary_cta_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_secondary_cta;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS hero_secondary_cta_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_text;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_text_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_cta;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS sticky_bar_cta_ar;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS show_hero_stats;
   ALTER TABLE public.page_content DROP COLUMN IF EXISTS show_industry_line;

   -- Rollback Migration 1: Attribution Tracking
   ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_source;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_medium;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_campaign;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_content;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS utm_term;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS gclid;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS fbclid;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS ttclid;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS referrer;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS landing_page;
   ALTER TABLE public.messages DROP COLUMN IF EXISTS attribution_timestamp;
   ```

3. **Verify Rollback**
   - Run verification queries (Step 5)
   - Should return 0 rows for each

4. **Revert Code**
   - Git checkout previous commit before hero changes
   - Redeploy application

**⚠️ Warning:** Rollback will NOT delete data already captured in these columns. Data remains but columns are removed.

---

## 🆘 Troubleshooting

### Error: "column already exists"

**Cause:** Migration already applied or partial application

**Fix:**
1. Check if column exists: `SELECT * FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'utm_source';`
2. If exists, skip that migration
3. Continue with next migration

### Error: "permission denied"

**Cause:** User doesn't have ALTER TABLE permission

**Fix:**
1. Check Supabase role: Must be project owner or database admin
2. Contact project owner to run migrations
3. Or grant ALTER permission: `GRANT ALTER ON ALL TABLES IN SCHEMA public TO your_user;`

### Error: "relation does not exist"

**Cause:** Table doesn't exist in database

**Fix:**
1. Verify table exists: `SELECT * FROM information_schema.tables WHERE table_name IN ('messages', 'page_content', 'site_settings');`
2. If missing, check if correct database selected
3. If table truly missing, run earlier migrations first

### Hero showing placeholder text

**Cause:** Hero content fields empty in database

**Fix:**
1. Go to Admin → Page Content → Edit mockups row
2. Fill all hero fields (see Step 7)
3. Save and refresh `/mockups` page

### Tracking not working

**Cause:** Tracking IDs not configured or incorrect format

**Fix:**
1. Admin → Settings → Analytics & Tracking
2. Click eye icon to reveal IDs
3. Verify format:
   - Meta Pixel: 15-16 digits only
   - GA4: Starts with `G-`
   - Google Ads: Starts with `AW-`
   - TikTok: Starts with `C`
4. Save and hard refresh browser (Ctrl+Shift+R)

---

## ✅ Post-Migration Checklist

After completing all steps:

- [ ] All 3 migrations applied successfully
- [ ] Verification queries return expected row counts
- [ ] Hero content populated (EN minimum)
- [ ] At least one tracking ID configured
- [ ] `/mockups` page loads new hero without errors
- [ ] Attribution test successful
- [ ] Message submitted and attribution visible in dashboard
- [ ] Migration logged in project documentation
- [ ] Team notified of new features
- [ ] Monitoring set up for analytics events

---

## 📞 Support

If you encounter issues:

1. **Check Troubleshooting Section** above
2. **Review Error Messages** in SQL Editor output
3. **Check Console Errors** in browser DevTools (F12)
4. **Consult Documentation:**
   - `DASHBOARD_CONFIGURATION_GUIDE.md` - Content & tracking config
   - `MOCKUPS_HERO_SMOKE_TEST.md` - Testing checklist
   - `MANUAL_TESTING_CHECKLIST.md` - Full testing matrix
5. **Contact Developer** with:
   - Error message (full text)
   - Screenshot of SQL Editor
   - Browser console screenshot
   - Migration step where error occurred

---

**Migration Complete! 🎉**

Your Mockups Hero is now ready for ad campaigns with full attribution tracking and analytics integration.

**Next Steps:**
1. Launch ad campaigns with UTM parameters
2. Monitor attribution data in Messages dashboard
3. Optimize hero content based on conversion rates
4. A/B test button text and messaging
