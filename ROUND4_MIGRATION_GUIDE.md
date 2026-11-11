# Round 4 Migration Guide - Mockups Live Website Links

## Overview
This migration adds the ability for mockup cards to link to real live websites managed from the Admin panel, along with extended project metadata fields.

## Database Migration

### Step 1: Apply SQL Migration

Run the migration file on your Supabase project:

```bash
# Location: supabase/migrations/20261115000001_add_mockup_website_fields.sql
```

Or apply manually via Supabase SQL Editor:

```sql
-- Add live website URL field
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS live_url TEXT;

-- Add client and project metadata
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS project_year INTEGER;

-- Add structured data fields
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Add behavior toggles
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS open_in_new_tab BOOLEAN DEFAULT TRUE;

-- Add validation constraint for live_url (must be https if provided)
ALTER TABLE mockups ADD CONSTRAINT check_live_url_https 
  CHECK (live_url IS NULL OR live_url ~* '^https://.*');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mockups_industry ON mockups(industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mockups_project_year ON mockups(project_year) WHERE project_year IS NOT NULL;

-- Update existing rows to ensure arrays are initialized
UPDATE mockups 
SET 
  features = COALESCE(features, '[]'::jsonb),
  technologies = COALESCE(technologies, '[]'::jsonb),
  tags = COALESCE(tags, '[]'::jsonb),
  gallery_images = COALESCE(gallery_images, '[]'::jsonb),
  open_in_new_tab = COALESCE(open_in_new_tab, TRUE)
WHERE features IS NULL OR technologies IS NULL OR tags IS NULL OR gallery_images IS NULL OR open_in_new_tab IS NULL;
```

### Step 2: Verify Migration Success

Check that all columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mockups'
AND column_name IN (
  'live_url', 
  'client_name', 
  'industry', 
  'project_year',
  'features',
  'technologies',
  'tags',
  'gallery_images',
  'open_in_new_tab'
)
ORDER BY column_name;
```

Expected result: 9 rows

### Step 3: Test Constraint

Try to insert an invalid URL (should fail):

```sql
-- This should FAIL (not https)
INSERT INTO mockups (title_en, live_url) 
VALUES ('Test', 'http://example.com');

-- This should SUCCEED
INSERT INTO mockups (title_en, live_url) 
VALUES ('Test', 'https://example.com');

-- Clean up test
DELETE FROM mockups WHERE title_en = 'Test';
```

## Admin Panel Updates

The Admin > Mockups form now includes:

### New Fields (All Optional except as noted):

1. **Live Website URL**
   - HTTPS validation (enforced at DB level)
   - "Test" button to open URL in new tab
   - When provided: card opens this URL instead of details page
   - When empty: card opens internal details/preview page

2. **Open in New Tab**
   - Checkbox toggle (default: checked)
   - Controls whether live_url opens in new tab or same tab

3. **Client & Project Info**
   - Client Name (text)
   - Industry (text)
   - Project Year (number, 2000-2099)

4. **Features** (JSON array)
   - List of key features
   - Example: `["Responsive Design", "Dark Mode", "Multi-language"]`
   - Shows on detail page

5. **Technologies** (JSON array)
   - Tech stack used
   - Example: `["React", "Node.js", "PostgreSQL"]`
   - Shows on detail page

6. **Tags** now stored as JSON array
   - Previously comma-separated string
   - Automatically converted on save
   - Max 3 shown on card

7. **Gallery Images** (JSON array)
   - Future use for detail page gallery
   - Format: `[{"url": "...", "alt_en": "...", "alt_ar": "..."}]`

## Public Site Updates

### Card Behavior:

- **Whole card is clickable** (not just buttons)
- **Primary button changes based on live_url presence:**
  - With live_url: "Visit Website" (external link icon)
  - Without live_url: "View Details" (no icon)
- **Secondary button:** "Request Design" (opens WhatsApp)
- **Browser frame design** with:
  - Colored dots (red, yellow, green)
  - URL bar showing domain from live_url
- **Badges:**
  - Category (always shown if available)
  - Featured (⭐ only if is_featured = true)
  - New (✨ only if is_new = true OR created < 14 days ago)
- **Tags:** Max 3 shown below description
- **CSS Template Fallback:** If image missing/broken, shows a generated mini website preview (no broken icon ever)

### Grid Improvements:

- **Responsive columns:**
  - 1 col: < 640px
  - 2 cols: 640-1023px
  - 3 cols: 1024-1439px
  - 4 cols: ≥ 1440px
- **Equal heights:** All cards in a row have same height
- **Balanced layout:** With few items (like 3), cards are centered and don't leave empty right space
- **24px gap:** Consistent spacing

### Performance:

- First card: `loading="eager"` + `fetchpriority="high"`
- Rest: `loading="lazy"`
- Skeleton shimmer while loading
- 16:10 fixed aspect ratio (no layout shift)
- Reduced motion support

## What You Must Provide

For each mockup you want to add/update:

1. **Real Website URL (live_url)**
   - Must be HTTPS
   - Example: `https://www.client-website.com`
   - Leave empty if website not live yet

2. **Screenshot/Cover Image**
   - Recommended size: 1440x900px (16:10 ratio)
   - Upload via Admin > Mockups > Cover Image field
   - Or use desktop_screenshot_url

3. **Arabic Translations**
   - title_ar
   - short_description_ar
   - long_description_ar (if using detail page)

4. **Optional but Recommended:**
   - Client name
   - Industry
   - Project year
   - 3-5 features as JSON array
   - Technologies used as JSON array
   - 3-5 searchable tags

## Testing Checklist

After migration:

- [ ] Open Admin > Mockups
- [ ] Create a new mockup with live_url
- [ ] Try invalid URL (http://...) - should show error
- [ ] Try valid URL (https://...) - should save
- [ ] Click "Test" button - opens URL in new tab
- [ ] Visit public /mockups page
- [ ] Click card - opens live_url in new tab
- [ ] Test card without live_url - opens details page
- [ ] Verify "Visit Website" vs "View Details" button label
- [ ] Check browser frame shows correct domain
- [ ] Verify Featured/New badges only show when appropriate
- [ ] Test with missing image - CSS template fallback shows
- [ ] Test responsive grid at all breakpoints
- [ ] Test dark mode
- [ ] Test Arabic (RTL layout, proper fonts)
- [ ] Test with 3 mockups - grid is balanced/centered
- [ ] Test with 12+ mockups - Load More works
- [ ] Test search (debounced 250ms)
- [ ] Test category filter with URL state (?category=slug)

## Rollback Plan

If issues arise:

```sql
-- Remove new columns (CAREFUL: this deletes data!)
ALTER TABLE mockups 
  DROP COLUMN IF EXISTS live_url,
  DROP COLUMN IF EXISTS client_name,
  DROP COLUMN IF EXISTS industry,
  DROP COLUMN IF EXISTS project_year,
  DROP COLUMN IF EXISTS features,
  DROP COLUMN IF EXISTS technologies,
  DROP COLUMN IF EXISTS gallery_images,
  DROP COLUMN IF EXISTS open_in_new_tab;

-- Note: tags column existed before, don't drop it
-- Just convert back to array if needed

-- Drop indexes
DROP INDEX IF EXISTS idx_mockups_industry;
DROP INDEX IF EXISTS idx_mockups_project_year;

-- Drop constraint
ALTER TABLE mockups DROP CONSTRAINT IF EXISTS check_live_url_https;
```

Then revert to MockupsPageFixed in App.jsx:

```jsx
import MockupsPageFixed from '@/pages/MockupsPageFixed';
// ...
<Route path="/mockups" element={<MockupsPageFixed />} />
```

## Performance Targets

- LCP < 2s (first card image)
- CLS ~ 0 (no layout shifts)
- Lighthouse Performance ≥ 90
- Lighthouse Accessibility ≥ 90

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs for SQL errors
3. Verify migration applied successfully
4. Check that storage bucket is public
5. Verify image URLs are accessible

## Notes

- Existing mockups continue to work (all new fields are optional)
- If live_url is null/empty, card behavior is unchanged (opens details page)
- Tags were converted from comma-separated string to JSON array
- All JSONB fields default to empty arrays, never null
- HTTPS validation is enforced at database level (constraint)
- Browser frame only shows when mockup has a live_url with valid domain
