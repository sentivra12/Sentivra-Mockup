# Test Data for Mockups Page

## Problem
The page shows "Something went wrong: categories is not iterable" because:
1. Categories data might be loading
2. Mockups data might be loading
3. Default values weren't set

## Solution Applied
Added safe defaults in:
1. `MockupsFilterBar.jsx` - checks if categories/mockups are arrays
2. `PremiumMockupCard.jsx` - safe URL parsing, safe field access

## To Test the Page

### Option 1: With Empty Data (should show empty state)
No action needed - page should now load with "No designs found" message

### Option 2: Add Test Mockup via Admin
1. Go to http://localhost:5173/admin/mockups
2. Click "Add Mockup"
3. Fill minimum fields:
   - Slug: `test-mockup`
   - Title (English): `Test E-commerce Website`
   - Title (Arabic): `موقع تجارة إلكترونية تجريبي`
   - Short Description (English): `A modern e-commerce website design`
   - Short Description (Arabic): `تصميم موقع تجارة إلكترونية حديث`
   - Category: Select any
   - Live URL: `https://www.example.com`
   - Upload a cover image (or leave empty to see CSS template fallback)
   - Published: Check ✓
4. Save

### Option 3: Direct SQL Insert (if Admin not working)
```sql
INSERT INTO mockups (
  slug,
  title_en,
  title_ar,
  short_description_en,
  short_description_ar,
  category_id,
  live_url,
  is_active,
  published,
  created_at,
  updated_at
) VALUES (
  'test-ecommerce-site',
  'Modern E-commerce Dashboard',
  'لوحة تحكم التجارة الإلكترونية الحديثة',
  'A beautiful and functional e-commerce website with modern design',
  'موقع تجارة إلكترونية جميل وعملي بتصميم حديث',
  (SELECT id FROM mockup_categories WHERE slug = 'ecommerce' LIMIT 1),
  'https://www.shopify.com',
  true,
  true,
  NOW(),
  NOW()
);
```

## Expected Behavior After Fix

### Loading State (initial):
- Shows spinner with "Loading mockups..."
- Light grey background

### Empty State (no mockups):
- Search icon in grey circle
- "No designs found" heading
- Description text
- "Show All Designs" button

### With Data:
- Filter bar appears (sticky at top)
- "All Designs" pill + category pills (only those with mockups)
- Grid shows cards:
  - Browser frame (dots + URL bar if live_url exists)
  - Image or CSS template fallback
  - Category badge
  - Featured/New badges (if applicable)
  - Title (2 lines max)
  - Description (2 lines max)
  - Tags (max 3)
  - "Visit Website" or "View Details" button
  - "Request Design" button
- Load More button if > 12 mockups

### Clicking Card:
- Opens live_url in new tab (if exists)
- Or navigates to /mockups/[slug] (if no live_url)

## Current Status
✅ Fixed: categories iteration error
✅ Fixed: safe URL parsing
✅ Fixed: safe field access
✅ Ready to test in browser

## Next Steps for User
1. Reload the page (http://localhost:5173/mockups)
2. Should see either:
   - Empty state (friendly message)
   - Or mockups if data exists
3. No more "Something went wrong" error
