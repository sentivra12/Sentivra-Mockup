# Migration Application Guide

Step-by-step instructions for applying new migrations to your Supabase production database.

## ⚠️ Important: Read Before Proceeding

**This guide helps you apply database changes safely to your production Supabase project.**

- Migrations modify your database structure and data
- Always backup before applying migrations
- Test in development first if possible
- Migrations cannot be automatically undone

---

## Prerequisites

✅ You have access to your Supabase Dashboard  
✅ You know your project URL (e.g., `abcdefgh.supabase.co`)  
✅ You have admin/owner permissions on the project  
✅ You have read this guide completely before starting  

---

## Migration to Apply

**File:** `supabase/migrations/20261117000001_complete_page_content_seed.sql`

**Purpose:**  
Seeds the `page_content` table with default content for all pages (Home, Services, Mockups, About, Contact) in both English and Arabic.

**What it does:**
- Inserts hero sections for each page
- Inserts content sections (process, cta, gallery, etc.)
- Uses current text from translation files (`locales/en.json` and `locales/ar.json`)
- Sets all sections as active by default

**Tables affected:**
- `page_content` (inserts only, no updates or deletes)

**Safe to run multiple times?**  
⚠️ **No** - Running twice will create duplicate entries. Only run once.

---

## Step 1: Backup Your Database

### Option A: Supabase Dashboard Backup

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Database Backups** section
4. Note: Supabase automatically creates daily backups
5. Verify latest backup exists and is recent

### Option B: Manual SQL Backup (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Run this command to export current page_content:

```sql
-- Export current page_content data
SELECT * FROM page_content ORDER BY page_key, section_key;
```

4. Click **Download CSV** to save current data
5. Store this file safely (e.g., `backup_page_content_2026-11-09.csv`)

---

## Step 2: Verify Prerequisites

Before applying the migration, check that required tables exist:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this verification query:

```sql
-- Check if required tables exist
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'page_content') as page_content_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'page_sections') as page_sections_exists;
```

**Expected result:**
```
page_content_exists: 1
page_sections_exists: 1
```

If both are `1`, proceed to Step 3.  
If either is `0`, **STOP** and contact support - required migrations are missing.

---

## Step 3: Review Current Data

Check what data currently exists:

```sql
-- See current page_content entries
SELECT page_key, section_key, title_en, is_active 
FROM page_content 
ORDER BY page_key, section_key;
```

**If the table is empty:** Good! The migration will populate it.

**If the table has data:** You have two options:

### Option A: Clear existing data (fresh start)
```sql
-- DELETE all existing page_content
DELETE FROM page_content;
```

### Option B: Keep existing data (may create duplicates)
- The migration uses INSERT statements
- If you already have entries for the same page_key + section_key, you'll get duplicates or conflicts
- **Recommended:** Only use this option if you know your current data is different from the migration

---

## Step 4: Apply the Migration

1. Open the migration file in VS Code or your editor:
   - Path: `supabase/migrations/20261117000001_complete_page_content_seed.sql`

2. **Copy the entire contents** of the file

3. Go to **SQL Editor** in Supabase Dashboard

4. Click **New Query**

5. **Paste** the migration SQL

6. **Review** the SQL carefully:
   - Check the page keys match your pages (home, services, mockups, about, contact)
   - Verify the English and Arabic text looks correct
   - Confirm all sections are what you expect

7. Click **Run** (or press Ctrl+Enter)

8. Wait for execution to complete

**Expected output:**
```
Success. No rows returned
```

Or:
```
INSERT 0 40
```
(40 = number of rows inserted: 5 pages × 8 sections per page)

---

## Step 5: Verify the Migration

Run these verification queries:

### 5.1 Count inserted rows
```sql
SELECT COUNT(*) as total_sections FROM page_content;
```
**Expected:** ~40 rows (varies by number of sections per page)

### 5.2 Check all pages are covered
```sql
SELECT DISTINCT page_key FROM page_content ORDER BY page_key;
```
**Expected:**
```
about
contact
home
mockups
services
```

### 5.3 Check sample content
```sql
-- View Services page hero section
SELECT 
  page_key,
  section_key,
  title_en,
  title_ar,
  is_active
FROM page_content
WHERE page_key = 'services' AND section_key = 'hero'
LIMIT 1;
```

**Expected:** Should show the Services hero content in both languages.

### 5.4 Check for duplicates (important!)
```sql
-- Find any duplicate page_key + section_key combinations
SELECT page_key, section_key, COUNT(*) as count
FROM page_content
GROUP BY page_key, section_key
HAVING COUNT(*) > 1;
```

**Expected:** No rows returned (no duplicates).

**If duplicates exist:** You'll need to manually delete the extras:
```sql
-- Delete duplicate entries (keeps the first one)
DELETE FROM page_content a USING page_content b
WHERE a.id > b.id 
  AND a.page_key = b.page_key 
  AND a.section_key = b.section_key;
```

---

## Step 6: Test in Admin Panel

1. Open your admin panel in browser
2. Navigate to **Admin** → **Page Content**
3. Select **Services** from the page selector
4. Verify you see sections:
   - Hero
   - Process
   - CTA
   - Gallery
   - (and others depending on page)

5. Click **Edit** on any section
6. Verify the English and Arabic content is correct
7. Make a small test edit and click **Save**
8. Verify the save succeeds with success toast

---

## Step 7: Verify Public Site

1. Open your public site (not admin)
2. Navigate to each page:
   - Home: `/`
   - Services: `/services`
   - Mockups: `/mockups`
   - About: `/about`
   - Contact: `/contact`

3. For each page, verify:
   - Hero section displays correctly
   - Content sections show proper text
   - CTAs work and link correctly
   - Both EN and AR languages work

4. If anything looks wrong:
   - Go back to Admin → Page Content
   - Edit the problematic section
   - Fix the text/links
   - Save and re-check public site

---

## Troubleshooting

### Problem: Migration fails with "relation does not exist"

**Cause:** The `page_content` or `page_sections` table doesn't exist.

**Solution:**
1. Check which migration created these tables:
   - `20261107000001_create_page_content.sql`
   - `20261109000003_ensure_marquee_and_page_sections.sql`
2. Apply those migrations first
3. Then retry the seed migration

---

### Problem: Migration fails with "duplicate key value"

**Cause:** You already have entries with the same page_key + section_key.

**Solution:**
```sql
-- Option 1: Delete existing data first
DELETE FROM page_content WHERE page_key IN ('home', 'services', 'mockups', 'about', 'contact');

-- Then re-run the migration

-- Option 2: Update the migration to use UPSERT (ON CONFLICT)
-- Contact support for help with this
```

---

### Problem: Admin shows sections but text is empty

**Cause:** Migration inserted rows but some fields are NULL.

**Solution:**
1. Check the migration SQL - verify all fields have values
2. Run this query to find empty fields:
```sql
SELECT id, page_key, section_key, title_en, title_ar
FROM page_content
WHERE title_en IS NULL OR title_en = '' OR title_ar IS NULL OR title_ar = '';
```
3. Manually fill in the missing content via Admin UI

---

### Problem: Public site still shows old content

**Cause:** Browser cache or React Query cache.

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check DevTools Network tab - verify API calls are returning new data
4. If still old data, check if there's a CDN cache that needs invalidating

---

## Rollback Procedure

If something goes wrong and you need to undo the migration:

### If you have the CSV backup from Step 1:
1. Delete all newly inserted data:
```sql
DELETE FROM page_content;
```

2. Re-import your CSV:
   - Go to **Table Editor** → `page_content`
   - Click **Import data**
   - Upload your CSV backup
   - Map columns correctly
   - Import

### If you don't have a backup:
```sql
-- Delete only the sections inserted by this migration
DELETE FROM page_content 
WHERE page_key IN ('home', 'services', 'mockups', 'about', 'contact')
  AND created_at >= '2026-11-09 00:00:00';  -- Adjust date to today
```

**Important:** This rollback is not perfect - you'll lose the seeded content but it won't restore any previous content.

---

## Post-Migration Checklist

After applying the migration successfully:

- [ ] Verified data in Supabase Table Editor
- [ ] Tested Admin → Page Content loads without errors
- [ ] Tested editing and saving a section in admin
- [ ] Verified public site displays correct content
- [ ] Tested language switching (EN ↔ AR)
- [ ] Checked all 5 pages (Home, Services, Mockups, About, Contact)
- [ ] Documented any manual changes made
- [ ] Updated team about new CMS capability

---

## Next Steps

After the migration is applied and verified:

1. **Customize content:** Edit sections in Admin → Page Content to match your brand
2. **Add images:** Upload background images via Media Library
3. **Configure CTAs:** Update button links to point to correct pages/sections
4. **Deactivate unused sections:** Uncheck "Active" for sections you don't need
5. **Test mobile:** Verify content looks good on mobile devices

---

## Need Help?

If you encounter issues:

1. **Check browser console:** Look for error messages
2. **Check Supabase logs:** Settings → Database → Logs
3. **Verify permissions:** Ensure your database user has INSERT permissions
4. **Review the SQL:** Make sure migration file wasn't corrupted
5. **Contact support:** Provide error messages and screenshots

---

## Additional Resources

- **Supabase SQL Editor:** https://supabase.com/dashboard/project/YOUR_PROJECT/sql
- **Table Editor:** https://supabase.com/dashboard/project/YOUR_PROJECT/editor
- **Database Logs:** https://supabase.com/dashboard/project/YOUR_PROJECT/logs/postgres-logs
- **Backups:** https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database

---

**Last Updated:** November 9, 2026  
**Migration Version:** 20261117000001  
**Safe to Apply:** ✅ Yes (with backup)
