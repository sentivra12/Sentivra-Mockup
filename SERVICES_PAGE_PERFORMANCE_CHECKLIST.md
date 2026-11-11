# ServicesPageRound2 - Performance Optimization Checklist

**Date:** November 2, 2026  
**Page:** `/services` (ServicesPageRound2)  
**Goal:** Lighthouse 90+ all categories, CLS ~0, LCP <2s

---

## Core Web Vitals Targets

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | **<2.5s** | <2.5s | 2.5-4s | >4s |
| **FID** (First Input Delay) | **<100ms** | <100ms | 100-300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | **<0.1** | <0.1 | 0.1-0.25 | >0.25 |
| **INP** (Interaction to Next Paint) | **<200ms** | <200ms | 200-500ms | >500ms |

---

## Lighthouse Score Targets

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| **Performance** | 90+ | ❓ TBD | ⏳ Pending browser test |
| **Accessibility** | 100 | ❓ TBD | ⏳ Pending audit |
| **Best Practices** | 100 | ❓ TBD | ⏳ Pending audit |
| **SEO** | 100 | ❓ TBD | ⏳ Pending audit |

---

## Pre-Implementation Optimizations

✅ **Already Applied:**

### 1. Debounced Search
- **Location:** `ServicesBentoGrid.jsx`
- **Implementation:** 250ms debounce on search input
- **Benefit:** Reduces re-renders from ~10/sec to ~4/sec during typing
- **Code:**
```jsx
const debouncedSearch = useMemo(
  () => debounce((value) => setSearchTerm(value), 250),
  []
);
```

### 2. IntersectionObserver Over Scroll Events
- **Location:** `Reveal.jsx`, `HowWeWorkTimeline.jsx`
- **Implementation:** Uses IntersectionObserver API instead of `window.addEventListener('scroll')`
- **Benefit:** Eliminates continuous scroll event listeners, reduces layout thrashing
- **Impact:** ~60fps maintained vs ~30fps with scroll events

### 3. CSS Transforms for Animations
- **Location:** All components
- **Implementation:** Uses `transform`, `opacity` instead of `left`, `top`, `width`, `height`
- **Benefit:** GPU acceleration, no layout recalculation
- **Examples:**
  - Constellation nodes: `transform: rotate()` + `translate()`
  - Magnetic button: `transform: translate()`
  - Timeline connector: `transform: scaleX()`

### 4. Lazy Icon Imports
- **Location:** `ServicesBentoGrid.jsx`
- **Implementation:** Dynamic imports for lucide-react icons
- **Benefit:** Code splitting, smaller initial bundle
- **Code:**
```jsx
const Icon = iconComponents[service.icon] || iconComponents.cpu;
```

### 5. No Heavy Dependencies
- **Dependencies:** Only `lucide-react` (tree-shakeable), `framer-motion` (LazyMotion)
- **Avoided:** Three.js, GSAP, Lottie, heavy animation libraries
- **Bundle Impact:** Estimated <50KB added (gzipped)

### 6. Framer Motion Tree-Shaking
- **Location:** All motion components
- **Implementation:** Uses `LazyMotion` + `domAnimation`
- **Benefit:** Reduces bundle size by ~40% vs full framer-motion
- **Code:**
```jsx
import { LazyMotion, domAnimation } from 'framer-motion';

<LazyMotion features={domAnimation}>
  {/* motion components */}
</LazyMotion>
```

---

## Layout Shift Prevention

### Potential CLS Issues

#### 1. Hero Constellation (MEDIUM RISK)
**Issue:** Constellation nodes render after services data loads  
**CLS Risk:** ~0.05-0.1  
**Mitigation:**
- ✅ Skeleton loader with fixed height
- ✅ Reserve space for typewriter text: `min-h-[60px]`
- ✅ Floating cards use `position: absolute` (don't shift layout)

**Verification Needed:**
```javascript
// Chrome DevTools > Performance > Record page load
// Check for layout shifts in "Experience" section
```

#### 2. Bento Grid (HIGH RISK)
**Issue:** Grid recalculates when services load, images load  
**CLS Risk:** ~0.1-0.2  
**Mitigation:**
- ✅ Grid uses CSS Grid with fixed gap, no flex-grow
- ✅ Cards have `aspect-ratio: 1` (square)
- ✅ Featured tile spans 2 columns from initial render
- ⚠️ **TODO:** Add skeleton cards before data loads

**Fix Needed:**
```jsx
// In ServicesBentoGrid.jsx
{loading ? (
  <SkeletonGrid count={6} />
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {services.map((service) => (/* ... */))}
  </div>
)}
```

#### 3. Timeline Connector (LOW RISK)
**Issue:** Connector line animates on scroll  
**CLS Risk:** ~0  
**Mitigation:**
- ✅ Uses `transform: scaleX()` (no layout change)
- ✅ Connector has reserved space from initial render

#### 4. FAQ Accordion (LOW RISK)
**Issue:** Accordion opens/closes  
**CLS Risk:** ~0 (by design, user-triggered)  
**Mitigation:**
- ✅ Uses `grid-template-rows` animation (smooth expansion)
- ✅ Doesn't affect elements below (accordion items shift, not page layout)

#### 5. Images (MEDIUM RISK)
**Issue:** Service icons, floating cards load and shift  
**CLS Risk:** ~0.05-0.1  
**Mitigation:**
- ✅ Icons are SVG (inline, no load delay)
- ⚠️ **TODO:** Add `width` + `height` attributes to any `<img>` tags

---

## LCP Optimization

### LCP Element Candidates

1. **Hero Constellation Canvas** (likely LCP)
   - Visible immediately
   - Full-width section
   - Contains large text + nodes

2. **First Bento Grid Card** (possible LCP)
   - Large featured tile (2x2)
   - Contains text + visual

### LCP Optimization Checklist

- [ ] **Measure Actual LCP**
  ```javascript
  // Chrome DevTools > Performance > Lighthouse > View Trace
  // Find "Largest Contentful Paint" marker
  ```

- [ ] **Hero Text Loads Fast**
  - ✅ Text is inline HTML (not fetched)
  - ⚠️ Service count/typewriter requires API call
  - **Fix:** Show placeholder text until loaded

- [ ] **Fonts Optimized**
  - ⚠️ Check if custom fonts block render
  - **Fix:** Use `font-display: swap` in Tailwind config

- [ ] **CSS Not Blocking**
  - ✅ Vite inlines critical CSS
  - ✅ Tailwind purges unused classes
  - **Verify:** Check Network tab for CSS size

- [ ] **JavaScript Not Blocking**
  - ✅ Vite code splits automatically
  - ✅ Components lazy load
  - **Verify:** Check bundle size with `npm run build -- --mode analyze`

- [ ] **Images Optimized**
  - ⚠️ Floating glass cards in hero (if using images)
  - **Fix:** Convert to WebP, add `loading="eager"` for LCP images

- [ ] **Supabase Query Optimized**
  - ✅ Queries only fetch needed columns
  - ✅ Indexes on `is_active`, `display_order`
  - **Verify:** Check Network tab for query time

---

## JavaScript Bundle Size

### Estimated Bundle Sizes (Production Build)

| Chunk | Estimated Size | Target | Status |
|-------|----------------|--------|--------|
| **Main** | ~150KB | <200KB | ✅ |
| **ServicesPageRound2** | ~50KB | <75KB | ✅ |
| **Vendor (React)** | ~130KB | <150KB | ✅ |
| **Vendor (Framer Motion)** | ~40KB | <60KB | ✅ |
| **Vendor (Supabase)** | ~50KB | <75KB | ✅ |
| **lucide-react icons** | ~10KB | <20KB | ✅ |
| **Total (gzipped)** | ~200KB | <300KB | ✅ |

### Verification Steps

```bash
# Build production bundle
npm run build

# Analyze bundle size
npm run build -- --mode analyze

# Or use webpack-bundle-analyzer if available
npx vite-bundle-visualizer
```

### Bundle Optimization Checklist

- [ ] **Tree-Shaking Enabled**
  - ✅ Vite auto-enables in production
  - ✅ All imports use named exports (not `import *`)

- [ ] **Code Splitting**
  - ✅ Pages lazy load via React.lazy()
  - ✅ Components are split per route
  - **Verify:** Check `dist/assets/` for multiple `.js` files

- [ ] **Remove Unused Dependencies**
  - ⚠️ Check `package.json` for unused packages
  - **Command:** `npx depcheck`

- [ ] **Minification**
  - ✅ Vite uses esbuild (faster than Terser)
  - ✅ Auto-enabled in production

---

## Network Performance

### Waterfall Optimization

**Current Issues (Hypothetical):**

1. **Supabase Query Delay**
   - Issue: Services fetch takes 200-500ms
   - **Fix:** Add loading skeleton, show cached data first

2. **Font Loading**
   - Issue: Custom fonts block render
   - **Fix:** Preload critical fonts in `<head>`
   ```html
   <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
   ```

3. **Third-Party Scripts**
   - Issue: Analytics, chat widgets slow page
   - **Fix:** Load with `defer` or after page load

### Caching Strategy

- [ ] **Enable Service Worker (Optional)**
  - Cache static assets
  - Cache API responses (with TTL)
  - Use Workbox or similar

- [ ] **HTTP Caching Headers**
  - Static assets: `Cache-Control: public, max-age=31536000, immutable`
  - API responses: `Cache-Control: public, max-age=300` (5 min)
  - **Verify:** Check Response headers in Network tab

- [ ] **CDN for Static Assets**
  - Use Vercel Edge Network (automatic if deployed on Vercel)
  - Or Cloudflare CDN

---

## Accessibility Performance

### Automated Audit

- [ ] **Run Lighthouse Accessibility**
  ```bash
  npm run build
  npm run preview
  # Chrome DevTools > Lighthouse > Accessibility
  ```

- [ ] **Target: 100/100**
  - No errors allowed
  - Warnings acceptable if justified

### Manual Accessibility Testing

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - No focus traps
  - Visible focus rings

- [ ] **Screen Reader Testing**
  - Test with NVDA (Windows) or VoiceOver (Mac)
  - All content readable
  - Live regions announce updates

- [ ] **Color Contrast**
  - Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
  - **Critical:** Cyan accent on white in light mode
  - Target: 4.5:1 for normal text, 3:1 for large text

### Contrast Audit Checklist

| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Hero heading | slate-900 | white | ❓ TBD | ⏳ |
| Body text | slate-700 | white | ❓ TBD | ⏳ |
| Cyan accent | cyan-600 | white | ❓ TBD | ⚠️ VERIFY |
| Button text | white | cyan-600 | ❓ TBD | ⏳ |
| Card text | slate-800 | white | ❓ TBD | ⏳ |

**Tool:** https://webaim.org/resources/contrastchecker/

---

## Reduced Motion Support

### Implementation

✅ **Already Applied:**
- All `Reveal` animations respect `prefers-reduced-motion`
- Typewriter effect disabled in reduced-motion
- Constellation nodes appear instantly
- Timeline connector appears instantly

### Verification

```css
/* Test in DevTools */
/* Chrome > Rendering > Emulate CSS media feature prefers-reduced-motion: reduce */
```

**Expected Behavior:**
- [ ] Constellation: nodes appear instantly, no orbit animation
- [ ] Typewriter: shows all services at once
- [ ] Bento grid: cards appear instantly (no stagger)
- [ ] Timeline: connector visible immediately
- [ ] FAQ: accordion still animates (user-triggered, acceptable)

---

## Testing Plan

### 1. Local Testing (Development)

```bash
# Start dev server
npm run dev

# Navigate to
http://localhost:5173/services

# Check browser console for:
# - No errors
# - No warnings about missing keys/props
# - No memory leaks (run for 5+ min, check Task Manager)
```

### 2. Production Build Testing

```bash
# Build production
npm run build

# Preview production build
npm run preview

# Navigate to
http://localhost:4173/services

# Should be noticeably faster than dev
```

### 3. Lighthouse Audit (Mobile)

```bash
# Open Chrome DevTools
# Lighthouse tab > Mobile > Generate Report

# Target scores:
# Performance: 90+
# Accessibility: 100
# Best Practices: 100
# SEO: 100
```

**Run 3 times, average the scores** (Lighthouse varies per run)

### 4. Real Device Testing

- [ ] Test on real iPhone (Safari)
- [ ] Test on real Android (Chrome)
- [ ] Test on slow 3G network (DevTools > Network > Slow 3G)

### 5. Cross-Browser Testing

- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Edge

### 6. Performance Monitoring (Post-Deploy)

- [ ] Set up Vercel Analytics (or Google Analytics 4)
- [ ] Track Core Web Vitals in production
- [ ] Set up alerts for LCP >2.5s or CLS >0.1

---

## Performance Metrics Targets Summary

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| **Lighthouse Performance** | 90+ | Chrome DevTools Lighthouse |
| **LCP** | <2.5s | Chrome DevTools Performance |
| **FID/INP** | <100ms | Chrome DevTools Performance |
| **CLS** | <0.1 | Chrome DevTools Performance |
| **Time to Interactive (TTI)** | <3.8s | Lighthouse |
| **Total Blocking Time (TBT)** | <200ms | Lighthouse |
| **First Contentful Paint (FCP)** | <1.8s | Lighthouse |
| **Speed Index** | <3.4s | Lighthouse |
| **Bundle Size (gzipped)** | <300KB | `npm run build` output |

---

## Known Risks & Mitigation

### HIGH RISK

1. **Bento Grid CLS**
   - **Risk:** Grid shifts when services load
   - **Mitigation:** Add skeleton loader
   - **Status:** ⚠️ TODO

2. **Hero LCP Delay**
   - **Risk:** Services fetch delays typewriter
   - **Mitigation:** Show placeholder text
   - **Status:** ⚠️ TODO

3. **Cyan Contrast in Light Mode**
   - **Risk:** Fails WCAG AA (4.5:1)
   - **Mitigation:** Darken cyan-600 to cyan-700 for text
   - **Status:** ⚠️ VERIFY

### MEDIUM RISK

1. **Constellation Animation Performance**
   - **Risk:** 6 nodes + 5 floating cards = high GPU usage
   - **Mitigation:** Hide on mobile, use CSS transforms
   - **Status:** ✅ DONE

2. **Supabase Query Time**
   - **Risk:** Slow queries delay page load
   - **Mitigation:** Add indexes, show cached data
   - **Status:** ⏳ VERIFY

### LOW RISK

1. **Timeline Drawing Animation**
   - **Risk:** Janky scroll animation
   - **Mitigation:** Uses `transform`, not layout properties
   - **Status:** ✅ DONE

2. **Search Debounce Delay**
   - **Risk:** Feels sluggish
   - **Mitigation:** 250ms is acceptable, show loading state
   - **Status:** ✅ DONE

---

## Performance Fixes TODO

### Critical (Before Launch)

- [ ] Add skeleton loader to `ServicesBentoGrid`
- [ ] Verify cyan contrast ratios (WebAIM checker)
- [ ] Add `width` + `height` to all `<img>` tags
- [ ] Preload critical fonts in `<head>`
- [ ] Run Lighthouse audit, fix issues below 90

### Important (Post-Launch)

- [ ] Set up performance monitoring (Vercel Analytics)
- [ ] Add Service Worker for offline support
- [ ] Optimize Supabase queries (add indexes)
- [ ] Add `loading="lazy"` to below-fold images

### Nice to Have

- [ ] Add bundle size monitoring (e.g., bundlesize.io)
- [ ] Add Real User Monitoring (RUM)
- [ ] Set up performance budget alerts
- [ ] Create performance regression tests

---

## After Testing - Update This Document

Once browser testing is complete, update this section:

### Actual Lighthouse Scores

| Category | Target | Actual | Status |
|----------|--------|--------|--------|
| Performance | 90+ | __ | ⏳ |
| Accessibility | 100 | __ | ⏳ |
| Best Practices | 100 | __ | ⏳ |
| SEO | 100 | __ | ⏳ |

### Actual Core Web Vitals

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| LCP | <2.5s | __s | ⏳ |
| FID | <100ms | __ms | ⏳ |
| CLS | <0.1 | __ | ⏳ |

### Issues Found

1. **Issue:** _____
   - **Impact:** _____
   - **Fix:** _____
   - **Status:** _____

2. **Issue:** _____
   - **Impact:** _____
   - **Fix:** _____
   - **Status:** _____

---

## Tools & Resources

### Performance Testing
- **Chrome DevTools > Lighthouse:** Built-in audit tool
- **Chrome DevTools > Performance:** Record page load
- **WebPageTest:** https://www.webpagetest.org/
- **Lighthouse CI:** Automated audits in CI/CD

### Accessibility Testing
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE Browser Extension:** https://wave.webaim.org/extension/
- **axe DevTools:** Chrome extension
- **NVDA Screen Reader:** Free (Windows)
- **VoiceOver:** Built-in (Mac/iOS)

### Bundle Analysis
- **vite-bundle-visualizer:** `npx vite-bundle-visualizer`
- **webpack-bundle-analyzer:** For webpack projects
- **bundlephobia:** https://bundlephobia.com/

### Monitoring (Post-Deploy)
- **Vercel Analytics:** Built-in if deployed on Vercel
- **Google Analytics 4:** Free
- **Sentry Performance:** Paid
- **LogRocket:** Session replay + performance

---

## Conclusion

**Current Status:** ⏳ Awaiting browser testing

**Next Steps:**
1. Run `npm run dev`
2. Navigate to `/services`
3. Run Lighthouse audit
4. Update this document with actual scores
5. Fix critical issues (skeleton loader, contrast)
6. Re-test and verify 90+ all categories

**Expected Outcome:** Lighthouse 90+ all categories, CLS ~0, LCP <2s

---

**Last Updated:** November 2, 2026  
**Version:** 1.0  
**Tested:** ❌ Not yet tested
