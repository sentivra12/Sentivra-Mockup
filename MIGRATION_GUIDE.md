# Migration Guide - Supabase Database Setup

## Overview
This guide provides exact steps to apply all necessary migrations to your Supabase database.

---

## Prerequisites
1. Access to Supabase Dashboard (https://supabase.com/dashboard)
2. Your project selected in Supabase
3. SQL Editor access

---

## Step 1: Check Current Tables

Run this query first to see which tables are already in your database:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected tables:**
- client_logos
- countries
- faqs
- hero
- marquee_items ⚠️ (if missing, see Step 2)
- messages
- mockup_categories
- mockups
- page_content
- page_sections ⚠️ (if missing, see Step 2)
- project_categories
- projects
- seo_settings
- service_categories
- services
- site_settings
- stats
- testimonials
- timeline_milestones
- values

---

## Step 2: Apply Missing Tables Migration (if needed)

If `marquee_items` or `page_sections` are missing, run this migration:

### Migration File: `20261102_create_missing_tables.sql`

**What it does:**
- Creates `marquee_items` table (for homepage marquee bands)
- Creates `page_sections` table (for section headers/subtitles)
- Sets up RLS policies
- Seeds initial data
- Reloads PostgREST schema cache

**How to apply:**

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the **ENTIRE** contents of `supabase/migrations/20261102_create_missing_tables.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Wait for completion (should see success message with table counts)
7. **Important:** Refresh your browser to reload the schema

**Verification:**
```sql
-- Check if tables were created
SELECT COUNT(*) as marquee_count FROM marquee_items;
SELECT COUNT(*) as sections_count FROM page_sections;

-- Should show:
-- marquee_count: 10 (seed data)
-- sections_count: 4 (seed data)
```

---

## Step 3: Check for Duplicate Services (Optional)

Run this query to identify duplicate service entries:

```sql
SELECT 
  slug,
  title_en,
  is_active,
  created_at,
  COUNT(*) as count
FROM services
WHERE is_active = true
GROUP BY slug, title_en, is_active, created_at
HAVING COUNT(*) > 1
ORDER BY slug;
```

If you see duplicates, proceed to Step 4. Otherwise, skip to Step 5.

---

## Step 4: Clean Up Duplicate Services (Optional)

⚠️ **WARNING:** This migration will DELETE duplicate service rows. Review carefully before running!

### Migration File: `20261108000002_cleanup_duplicate_services.sql`

**What it does:**
- Deletes duplicate services (keeps oldest entry per slug)
- Ensures unique slug constraint
- Recalculates display_order
- Standardizes categories

**How to apply:**

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the **ENTIRE** contents of `supabase/migrations/20261108000002_cleanup_duplicate_services.sql`
4. Paste into the SQL Editor
5. **Review the migration carefully** - it will delete data!
6. Click "Run" or press Ctrl+Enter
7. Check the success message showing service counts

**Verification:**
```sql
-- Should show no duplicates
SELECT slug, COUNT(*) as count 
FROM services 
GROUP BY slug 
HAVING COUNT(*) > 1;

-- Should return no rows
```

---

## Step 5: Verify All Admin Tables Exist

Run this comprehensive check:

```sql
-- Check all required tables and their row counts
SELECT 
  'hero' as table_name, COUNT(*) as row_count FROM hero
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'service_categories', COUNT(*) FROM service_categories
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'project_categories', COUNT(*) FROM project_categories
UNION ALL SELECT 'mockups', COUNT(*) FROM mockups
UNION ALL SELECT 'mockup_categories', COUNT(*) FROM mockup_categories
UNION ALL SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL SELECT 'client_logos', COUNT(*) FROM client_logos
UNION ALL SELECT 'marquee_items', COUNT(*) FROM marquee_items
UNION ALL SELECT 'page_sections', COUNT(*) FROM page_sections
UNION ALL SELECT 'stats', COUNT(*) FROM stats
UNION ALL SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'site_settings', COUNT(*) FROM site_settings
UNION ALL SELECT 'seo_settings', COUNT(*) FROM seo_settings
UNION ALL SELECT 'countries', COUNT(*) FROM countries
UNION ALL SELECT 'timeline_milestones', COUNT(*) FROM timeline_milestones
UNION ALL SELECT 'values', COUNT(*) FROM values
ORDER BY table_name;
```

**All tables should appear.** If any are missing, you need to run the initial schema migration:

---

## Step 6: Initial Schema Migration (if tables are missing)

If Step 5 shows missing tables, run the initial schema:

### Migration File: `20261104000001_initial_schema.sql`

**What it does:**
- Creates ALL base tables
- Sets up RLS policies
- Creates indexes
- Seeds initial data

**How to apply:**

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the **ENTIRE** contents of `supabase/migrations/20261104000001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Wait for completion (may take 30-60 seconds)
7. **Important:** Refresh your browser to reload the schema

---

## Step 7: Configure Site Settings

Update your site settings with real contact information:

```sql
-- Update contact information
UPDATE site_settings 
SET value = 'your-email@sentivra.com' 
WHERE key = 'primary_email';

UPDATE site_settings 
SET value = '+966-XXX-XXX-XXXX' 
WHERE key = 'primary_phone';

UPDATE site_settings 
SET value = '966XXXXXXXXX' 
WHERE key = 'whatsapp_number';

-- Update social media links
UPDATE site_settings 
SET value = 'https://facebook.com/yourpage' 
WHERE key = 'facebook_url';

UPDATE site_settings 
SET value = 'https://twitter.com/yourhandle' 
WHERE key = 'twitter_url';

UPDATE site_settings 
SET value = 'https://linkedin.com/company/yourcompany' 
WHERE key = 'linkedin_url';

UPDATE site_settings 
SET value = 'https://instagram.com/yourhandle' 
WHERE key = 'instagram_url';
```

---

## Step 8: Verify RLS Policies

Check that Row Level Security is enabled and policies exist:

```sql
-- Check RLS is enabled on all tables
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'services', 'projects', 'mockups', 'testimonials', 
    'hero', 'stats', 'client_logos', 'marquee_items', 
    'page_sections', 'countries', 'timeline_milestones', 'values'
  )
ORDER BY tablename;

-- All should show rowsecurity = true
```

```sql
-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should see policies like:
-- "Public can view active [table]"
-- "Authenticated users can manage [table]"
```

---

## Step 9: Test Database Connection

From your application, test the connection:

```javascript
// Test in browser console (after logging into admin)
const { data, error } = await supabase
  .from('marquee_items')
  .select('*')
  .limit(1);

console.log('Test result:', { data, error });
// Should return data, not PGRST205 error
```

---

## Common Errors and Solutions

### Error: PGRST205 (relation does not exist)
**Cause:** Table not created or schema not reloaded
**Solution:** 
1. Run the missing table migration
2. Refresh browser
3. Try: `NOTIFY pgrst, 'reload schema';`

### Error: RLS Policy Violation
**Cause:** Not authenticated or policy missing
**Solution:**
1. Check if logged into admin
2. Verify RLS policies exist (Step 8)
3. Check Supabase logs for details

### Error: Duplicate Key Violation
**Cause:** Trying to insert duplicate slug/key
**Solution:**
1. Check for existing records
2. Use unique slugs
3. Run duplicate cleanup migration (Step 4)

### Error: Column does not exist
**Cause:** Old code referencing removed columns
**Solution:**
1. Clear browser cache
2. Restart dev server
3. Check migration matches code expectations

---

## Migration Order Summary

**Recommended order:**
1. ✅ Initial schema (if starting fresh): `20261104000001_initial_schema.sql`
2. ✅ Missing tables (if needed): `20261102_create_missing_tables.sql`
3. ⚠️ Duplicate cleanup (optional): `20261108000002_cleanup_duplicate_services.sql`
4. ✅ Site settings (manual SQL from Step 7)
5. ✅ Verification queries (Steps 5, 8, 9)

---

## Post-Migration Checklist

After running migrations, verify in the Admin panel:

### Admin Panel Tests
- [ ] Login to `/admin` works
- [ ] Dashboard shows correct stats
- [ ] Hero Section: Edit → Save → Check HomePage
- [ ] Services: Create → Edit → Delete
- [ ] Mockups: Upload image → Add live_url → Save
- [ ] Testimonials: Edit → Check HomePage
- [ ] Client Logos: Edit → Check HomePage
- [ ] Marquee Items: Edit → Check HomePage
- [ ] Stats: Edit → Check HomePage/AboutPage
- [ ] Countries: Create → Check AboutPage
- [ ] Timeline: Create → Check AboutPage
- [ ] Values: Create → Check AboutPage
- [ ] FAQs: Edit → Check relevant pages
- [ ] Messages: Submit contact form → Check Admin Messages

### Public Site Tests
- [ ] Home page loads without errors
- [ ] Services page shows services from DB
- [ ] Mockups page shows mockups from DB
- [ ] Clicking mockup with live_url opens external URL
- [ ] Clicking mockup without live_url opens modal
- [ ] About page shows countries/timeline/values
- [ ] Contact form submits successfully
- [ ] WhatsApp button uses correct number from settings
- [ ] Footer shows contact info from settings
- [ ] No console errors on any page
- [ ] No raw translation keys visible

---

## Rollback Instructions

If something goes wrong, you can rollback:

### Rollback Missing Tables Migration
```sql
-- Backup data first!
-- Then drop tables
DROP TABLE IF EXISTS marquee_items CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;
```

### Rollback Duplicate Services Cleanup
⚠️ Cannot rollback - deleted data is gone. **Always backup first!**

---

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Check browser console for JavaScript errors
3. Verify environment variables (.env.local):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Check network tab for API errors (401, 403, 404, 500)

---

## Success Indicators

✅ **Migration successful when:**
- All tables exist (Step 5 query returns 19+ tables)
- No PGRST205 errors in browser console
- Admin panel loads all screens without errors
- Public pages display database content
- Contact form saves to messages table
- No raw translation keys visible (e.g., `nav.home`)

---

## Next Steps After Migration

1. **Add Real Content:**
   - Upload mockup screenshots
   - Add real client logos
   - Write service descriptions in EN/AR
   - Add company timeline milestones
   - Add company values

2. **Configure SEO:**
   - Admin → Settings → SEO tab
   - Update meta titles/descriptions for each page
   - Add OpenGraph images

3. **Test Thoroughly:**
   - Test all Admin CRUD operations
   - Test all public pages in EN/AR
   - Test light/dark themes
   - Test mobile responsive design
   - Test contact form end-to-end

4. **Deploy:**
   - Run `npm run build`
   - Test production preview: `npm run preview`
   - Deploy to hosting (Vercel/Netlify/etc)
   - Verify production site works with Supabase

---

## File Locations

All migration files are in: `d:\Sentivra-main\supabase\migrations\`

Key migrations:
- `20261104000001_initial_schema.sql` - Base schema
- `20261102_create_missing_tables.sql` - Marquee & page sections
- `20261108000002_cleanup_duplicate_services.sql` - Remove duplicates

---

## Contact

For migration issues specific to this codebase, refer to:
- `CONTENT_AUDIT_TABLE.md` - Complete content source audit
- `CHECK_MIGRATIONS.sql` - Quick verification queries
- `CHECK_SETUP.md` - Environment setup guide
