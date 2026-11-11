# Database Migrations Guide

## New Migrations Created

### 1. `20261108000001_add_arabic_translations.sql`
**Purpose:** Populate empty `_ar` columns with professional Arabic translations

**What it does:**
- Adds Arabic translations for site settings, hero, trust badges, services, FAQs, process steps, why choose us, values, and stats
- Uses idempotent UPDATE statements (safe to run multiple times)
- Only updates rows where `_ar` columns are NULL
- Includes 500+ professional Arabic business translations

**Manual translation needed for:**
- Projects (client-specific content)
- Mockups (design titles)
- Testimonials (client quotes)
- Timeline milestones (company history)

### 2. `20261108000002_cleanup_duplicate_services.sql`
**Purpose:** Remove duplicate service entries while preserving correct ones

**What it does:**
- Identifies services with duplicate slugs
- Keeps the oldest entry (first created)
- Removes later duplicates
- Ensures unique constraint on `slug` column
- Standardizes display order
- Validates service categories

## How to Run (Supabase CLI)

### Prerequisites
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### Run Migrations

```bash
# Option 1: Run all pending migrations
supabase db push

# Option 2: Run specific migration
supabase db execute -f supabase/migrations/20261108000001_add_arabic_translations.sql
supabase db execute -f supabase/migrations/20261108000002_cleanup_duplicate_services.sql

# Option 3: Apply to local development
supabase db reset  # Resets and applies all migrations
```

## How to Run (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of each migration file
5. Paste and click **Run**
6. Check the success messages in the output

## Verify Migrations

After running migrations, verify the results:

```sql
-- Check Arabic translations
SELECT 
  slug, 
  title, 
  title_ar,
  short_description_ar IS NOT NULL as has_arabic_desc
FROM services
LIMIT 5;

-- Check for duplicate slugs
SELECT slug, COUNT(*) as count
FROM services
GROUP BY slug
HAVING COUNT(*) > 1;

-- Check stats
SELECT label, label_ar FROM stats;

-- Check hero
SELECT headline, headline_ar FROM hero;

-- Check why choose us
SELECT title, title_ar FROM why_choose_us;
```

## Rollback (if needed)

If you need to rollback these migrations:

```sql
-- Rollback Arabic translations (set all _ar columns back to NULL)
UPDATE services SET title_ar = NULL, short_description_ar = NULL, long_description_ar = NULL, features_ar = NULL;
UPDATE hero SET headline_ar = NULL, subheadline_ar = NULL;
UPDATE trust_badges SET title_ar = NULL, description_ar = NULL;
-- ... etc for other tables

-- Note: Cannot rollback deleted duplicates without a backup
```

## Safety Notes

✅ **Safe to run multiple times** - Both migrations are idempotent
✅ **Non-destructive** - Arabic translation migration only adds data
⚠️  **Duplicate cleanup** - Review duplicates before running (uses created_at to determine which to keep)
✅ **Unique constraint** - Prevents future duplicates

## Next Steps

After running migrations:
1. Verify Arabic content appears correctly in the app
2. Manually translate projects, mockups, testimonials
3. Test bilingual switching (EN ↔ AR)
4. Check all pages in both languages
