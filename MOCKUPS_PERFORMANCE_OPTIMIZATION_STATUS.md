# Mockups Page Performance Optimization - Status Report

## Goal
Make /mockups fast on mobile phones:
- **LCP Target**: <2000ms (currently ~5650ms)
- **CLS Target**: <0.05 (currently 0.337)
- **Page Weight Target**: <600KB (currently 1905KB)
- **Smooth 60fps scroll**: No frame drops

## Baseline Metrics (Before Optimization)
```
File: MockupsPageRound5
LCP: 5748ms (P element)
CLS: 0.317
Total: 1905KB (Images: 1679KB, 1604KB PNG oversized)
Cards visible: 4
Frame drops: 53.6% during scroll
Heavy effects: 34 backdrop-filters, 19 blurs, 34 multi-shadows
```

## Current Metrics (After Steps 0-5)
```
File: MockupsPageRound5
LCP: 5648ms (-100ms, -1.7%)
CLS: 0.337 (+0.02, +6.3%)
Total: 1905KB (unchanged - no images optimized yet)
Cards visible: 4
```

## Completed Steps

### ✅ STEP 0: Diagnostics
**Status**: Complete
- Created `tests/mockups-diagnose.spec.mjs` with PerformanceObserver
- Found real CLS sources: Footer shift (0.1111), filter bar minor shift
- Identified heavy effects: 34 backdrop-filters, 19 blurs, 53.6% frame drops
- No 0x0 image issues found

### ❌ STEP 1: CLS Fixes
**Status**: Attempted and Reverted
- Added minHeight to Footer and filter bar wrapper
- **Result**: LCP increased to 5952ms (+400ms WORSE), CLS unchanged
- **Decision**: Reverted all changes

### ✅ STEP 2a: Image Resize Utility
**Status**: Complete
- Created `src/utils/imageResize.js`
- Functions: `resizeImageToWebP(file, maxWidth, quality)`, `createOptimizedVersions(file)`
- Returns dual WebP: card (640px @ 0.75 quality), full (1600px @ 0.82 quality)
- No external dependencies, pure Canvas API

### ✅ STEP 2b: Admin Upload Enhancement
**Status**: Complete
- Modified `src/features/mockups/AdminMockupsPage.jsx`
- `handleImageUpload()` creates dual WebP on upload
- Uploads both card and full versions to storage
- Saves `thumbnail_url` + `desktop_screenshot_url` to database
- Toast shows before/after size savings
- File size limit: 10MB

### ✅ STEP 2c: Batch Optimization Tool
**Status**: Complete - Ready for Use
- Created `src/admin/pages/OptimizeImagesPage.jsx`
- Route: `/admin/optimize-images`
- Browser-based tool: downloads existing mockup images, creates 640px WebP thumbnails, uploads, updates DB
- Shows progress table with per-image savings
- **Action Required**: User must run this tool to optimize existing images

### ✅ STEP 2d: Component Image Optimization
**Status**: Complete
- Modified `src/components/mockups/DeviceFrame.jsx`:
  - Added `priority` prop for fetchpriority="high" + loading="eager"
  - Prefers `thumbnail_url` → `desktop_screenshot_url` → fallbacks
  - All three device types (laptop/tablet/mobile) support priority
- Modified `src/pages/MockupDetailPage.jsx`:
  - Hero image uses `priority={true}` for fast LCP
  - Screenshots prefer `thumbnail_url` first
- Modified `src/components/mockups/EnhancedMockupCard.jsx`:
  - Prefers `thumbnail_url` for card view (640px optimized)
- Modified `src/components/mockups/PremiumMockupCardRound5.jsx`:
  - Already had `isFirst` logic with fetchpriority="high" + loading="eager"
  - Prefers `thumbnail_url` → fallbacks

### ✅ STEP 3: Loading Order & Pagination
**Status**: Complete
- First card already uses `fetchpriority="high"` + `loading="eager"`
- Remaining cards use `loading="lazy"` + `decoding="async"`
- Pagination already set to 9 cards initially
- "Load More" button for additional cards
- Added preconnect to Supabase storage domain in MockupsPageRound5:
  ```html
  <link rel="preconnect" href="https://njovqwbptfhfzbfmwjgk.supabase.co" />
  <link rel="dns-prefetch" href="https://njovqwbptfhfzbfmwjgk.supabase.co" />
  ```

### ✅ STEP 4: Smooth Scroll Mobile
**Status**: Complete
- Modified `src/components/mockups/MockupsFilterBarPremium.jsx`:
  - Changed `backdrop-blur-xl` → `md:backdrop-blur-xl` (disabled on mobile)
  - Changed `backdrop-blur-md` → `md:backdrop-blur-md` (disabled on mobile)
- `PremiumMockupCardRound5` already respects `disableEffects` prop:
  - Disables tilt, spotlight, hover effects when `disableEffects={true}`
  - MockupsPageRound5 calculates `disableHeavyEffects = shouldReduceMotion || saveData`
  - Touch devices automatically skip tilt effects

### ✅ STEP 5: Network & JS Optimization
**Status**: Complete
- React Query already configured in `src/hooks/useContent.js`:
  - `staleTime: 5 * 60 * 1000` (5 minutes cache)
  - `refetchOnWindowFocus: false` (no unnecessary refetches)
- Lazy loading already implemented for heavy components:
  - `PremiumFAQAccordion` (lazy)
  - `PremiumFinalCTA` (lazy)

### ⏳ STEP 6: Final Proof & Measurement
**Status**: Pending - Blocked
- Cannot achieve target metrics without image optimization
- Current bottleneck: 1604KB PNG image still loading
- **Blocker**: No mockups have `thumbnail_url` populated yet

## Build Impact
```
Bundle size changes:
- MockupsPageRound5: 75.92 KB (+0.17KB, +0.2%)
- MockupDetailPage: 26.41 KB (+0.28KB, +1.1%)
- Total: Minimal impact (<1% increase)
```

## Blocked - Requires Action

### 🔴 Image Optimization Blocked
**Problem**: All mockups still load full-size images (1604KB PNG)
**Reason**: No mockups have `thumbnail_url` populated yet
**Solution**: Run `/admin/optimize-images` tool to batch-optimize existing images

**Expected Impact After Optimization**:
```
Before: 1604KB PNG
After:  ~120KB WebP card (88% reduction)
Expected LCP: ~2000ms (from 5650ms)
Expected Total: ~450KB (from 1905KB)
```

## Summary

### What's Working
- ✅ All infrastructure ready for optimized images
- ✅ Admin upload creates dual WebP (card + full)
- ✅ All components prefer thumbnail_url when available
- ✅ First image has priority loading
- ✅ Lazy loading for remaining images
- ✅ Heavy effects disabled on mobile
- ✅ React Query optimized (5min cache, no refocus)
- ✅ Preconnect to storage domain

### What's Needed
- 🔴 **Run optimization tool**: Navigate to `/admin/optimize-images` and click "Start Optimization"
- 🔴 **Verify optimization**: Confirm thumbnail_url populated for all mockups
- 🔴 **Re-measure**: Run performance test after optimization
- 🔴 **Compare results**: Document before/after metrics

## Next Steps

1. **User Action**: Login to admin panel → `/admin/optimize-images` → "Start Optimization"
2. **Verify**: Check database that thumbnail_url is populated
3. **Test**: Reload /mockups page, verify small images loading
4. **Measure**: Run `npx playwright test tests/mockups-perf-baseline-playwright.spec.mjs`
5. **Document**: Record final metrics (expect LCP <2s, Total <600KB)

## Technical Notes

- No external dependencies added
- No breaking changes to database schema (thumbnail_url already exists)
- Backward compatible: Falls back to full images if thumbnail missing
- Mobile-first optimizations: Effects disabled, blur removed on small screens
- Accessibility maintained: All images have proper alt text, loading attributes

## Files Modified

### Created
- `src/utils/imageResize.js`
- `src/admin/pages/OptimizeImagesPage.jsx`
- `tests/mockups-diagnose.spec.mjs`
- `MOCKUPS_PERFORMANCE_OPTIMIZATION_STATUS.md`

### Modified
- `src/App.jsx` (added OptimizeImagesPage route)
- `src/features/mockups/AdminMockupsPage.jsx` (dual WebP upload)
- `src/components/mockups/DeviceFrame.jsx` (priority prop, thumbnail_url preference)
- `src/components/mockups/EnhancedMockupCard.jsx` (thumbnail_url preference)
- `src/components/mockups/PremiumMockupCardRound5.jsx` (thumbnail_url preference)
- `src/pages/MockupDetailPage.jsx` (priority image, thumbnail_url preference)
- `src/pages/MockupsPageRound5.jsx` (preconnect links)
- `src/components/mockups/MockupsFilterBarPremium.jsx` (mobile blur removal)

### Reverted
- `src/components/Footer.jsx` (minHeight removal - made LCP worse)
- `src/pages/MockupsPageRound5.jsx` (filter bar wrapper minHeight removal)

---

**Date**: 2026-11-16
**Status**: Steps 0-5 Complete, Step 6 Blocked on Image Optimization
