# HomePage Testing Guide - Part C

## Overview

This guide covers comprehensive testing of the redesigned HomePage across all 4 combinations (Light/Dark × EN/AR), performance optimization, and quality assurance.

---

## Testing Matrix

### 4 Core Combinations

| # | Theme | Language | Dir | Test Priority |
|---|-------|----------|-----|---------------|
| 1 | Light | English  | LTR | High |
| 2 | Light | Arabic   | RTL | High |
| 3 | Dark  | English  | LTR | High |
| 4 | Dark  | Arabic   | RTL | High |

---

## Pre-Testing Checklist

### 1. Environment Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

### 2. Database Configuration

**Option A: With Supabase** (Recommended)
```bash
# Create .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Run migrations (via Supabase Dashboard SQL Editor)
# 1. 20261104000001_initial_schema.sql
# 2. 20261104000002_seed_data.sql
# 3. 20261107000001_add_arabic_columns.sql
# 4. 20261108000001_add_arabic_translations.sql
# 5. 20261108000002_cleanup_duplicate_services.sql
```

**Option B: Without Supabase** (Static Fallback)
```bash
# No .env.local file needed
# App will use static data from src/data/*.js files
```

### 3. Browser DevTools Setup

**Required Extensions**:
- React Developer Tools
- Lighthouse
- axe DevTools (Accessibility)

**Performance Monitoring**:
- Network tab (throttle to Fast 3G)
- Performance tab (CPU 4x slowdown)
- Coverage tab (unused code)

---

## Visual Testing

### Test 1: Light Mode + English (LTR)

**Steps**:
1. Open `http://localhost:5173`
2. Set theme to Light
3. Set language to English
4. Verify each section:

#### ✅ Hero Section
- [ ] Animated gradient orbs visible and smooth
- [ ] Video background plays (if configured)
- [ ] Headline uses Space Grotesk font
- [ ] Badge has pulsing dot animation
- [ ] CTAs properly aligned (Primary left, Secondary right)
- [ ] Scroll indicator bounces
- [ ] Trust badges float on right side
- [ ] Parallax effect works on scroll

#### ✅ Client Logos
- [ ] Logos display in grid
- [ ] Proper spacing and alignment
- [ ] Fade in animation on scroll

#### ✅ Services Section
- [ ] 6 services displayed in 3-column grid
- [ ] Glass morphism cards visible
- [ ] Hover: Icon rotates, gradient accent appears
- [ ] Arrow animates on hover
- [ ] "Learn more" link functional
- [ ] Stagger animation (100ms delay per card)

#### ✅ Stats Section
- [ ] 4 stat cards in grid
- [ ] Animated counters count up
- [ ] Numbers wrapped in <bdi> tags
- [ ] Gradient glow on hover
- [ ] Glass background visible

#### ✅ Projects Section
- [ ] 6 featured projects displayed
- [ ] Images load with lazy loading
- [ ] Hover: Image scales, overlay fades in
- [ ] Tech stack badges visible on hover
- [ ] Category badges displayed
- [ ] "View All" link at bottom

#### ✅ Testimonials Section
- [ ] Carousel auto-plays (5s interval)
- [ ] Star ratings display (5 stars)
- [ ] Client photo/avatar shows
- [ ] Navigation arrows functional
- [ ] Dots navigation updates
- [ ] Pauses on hover

#### ✅ CTA Section
- [ ] Animated gradient orbs
- [ ] Glass card with border
- [ ] Badge pulse animation
- [ ] CTAs properly spaced
- [ ] Contact icons (Email, Phone, WhatsApp)
- [ ] Social proof placeholders

#### ✅ Brand Bands
- [ ] Blue gradient bands between sections
- [ ] Proper spacing

---

### Test 2: Light Mode + Arabic (RTL)

**Steps**:
1. Click language switcher → Arabic (ع)
2. Verify **RTL layout**:

#### ✅ Layout Direction
- [ ] Entire page direction: RTL
- [ ] Text alignment: right
- [ ] Flex layouts reversed
- [ ] Margins/paddings: logical properties (ms-/me-)

#### ✅ Hero Section (RTL)
- [ ] Trust badges float on **left** side
- [ ] CTAs reversed (Primary right, Secondary left)
- [ ] Arrow points **left** (→ rotated 180°)
- [ ] Badge text aligned right

#### ✅ Services (RTL)
- [ ] Cards flow right-to-left
- [ ] Icons aligned correctly
- [ ] Text right-aligned
- [ ] Arrow points left on hover

#### ✅ Stats (RTL)
- [ ] Numbers display correctly (wrapped in <bdi>)
- [ ] Labels right-aligned
- [ ] Grid flows RTL

#### ✅ Projects (RTL)
- [ ] Cards flow right-to-left
- [ ] Tech badges right-aligned
- [ ] Arrow points left

#### ✅ Testimonials (RTL)
- [ ] Navigation arrows swapped (next on left, prev on right)
- [ ] Text right-aligned
- [ ] Client info aligned right

#### ✅ CTA (RTL)
- [ ] CTAs reversed
- [ ] Contact icons flow RTL
- [ ] Text centered and right-aligned

---

### Test 3: Dark Mode + English (LTR)

**Steps**:
1. Set language to English
2. Click theme toggle → Dark
3. Verify **dark theme colors**:

#### ✅ Color Verification
- [ ] Background: `bg-gray-900` or equivalent
- [ ] Text: Light colors (white/gray-100)
- [ ] Primary: Adjusted for dark (lighter shade)
- [ ] Glass cards: Dark backgrounds with transparency
- [ ] Borders: Lighter borders visible

#### ✅ Hero (Dark)
- [ ] Gradient orbs visible (adjusted opacity)
- [ ] Video overlay darker
- [ ] Text readable (white/light gray)
- [ ] Badge: `dark:bg-primary/20`
- [ ] Trust badges: Dark glass

#### ✅ Services (Dark)
- [ ] Glass cards visible with dark background
- [ ] Hover gradient accent visible
- [ ] Icons contrast properly
- [ ] Text readable

#### ✅ Stats (Dark)
- [ ] Glass backgrounds visible
- [ ] Gradient glows adjusted
- [ ] Numbers readable
- [ ] Gradient background subtle

#### ✅ Projects (Dark)
- [ ] Image overlays darker
- [ ] Text on images readable
- [ ] Cards have proper contrast
- [ ] Hover effects visible

#### ✅ Testimonials (Dark)
- [ ] Glass cards dark
- [ ] Stars visible (yellow)
- [ ] Text readable
- [ ] Navigation arrows visible

#### ✅ CTA (Dark)
- [ ] Gradient orbs adjusted
- [ ] Glass card visible
- [ ] Contact icons contrast
- [ ] Buttons visible

---

### Test 4: Dark Mode + Arabic (RTL)

**Steps**:
1. Keep theme as Dark
2. Switch language to Arabic
3. Verify **Dark + RTL**:

#### ✅ Combined Verification
- [ ] RTL layout maintained in dark mode
- [ ] All colors adjusted for dark
- [ ] Numbers display correctly (Bidi)
- [ ] Arrows point left
- [ ] Text right-aligned and readable
- [ ] Glass effects visible
- [ ] All previous RTL checks pass
- [ ] All previous Dark checks pass

---

## Responsive Testing

### Breakpoints to Test

| Device | Width | Viewport |
|--------|-------|----------|
| Mobile | 375px | iPhone SE |
| Mobile L | 428px | iPhone 14 Pro Max |
| Tablet | 768px | iPad |
| Tablet L | 1024px | iPad Pro |
| Desktop | 1440px | MacBook Pro |
| Desktop L | 1920px | Full HD |
| 4K | 2560px | iMac 27" |

### Mobile Testing (375px - 768px)

#### ✅ Hero
- [ ] Single column layout
- [ ] Trust badges hidden on mobile
- [ ] CTAs stack vertically
- [ ] Font sizes reduced
- [ ] Video covers properly
- [ ] Scroll indicator visible

#### ✅ Services
- [ ] Single column (1 card per row)
- [ ] Cards maintain aspect ratio
- [ ] Touch targets ≥ 44px
- [ ] Spacing comfortable

#### ✅ Stats
- [ ] 2 columns on mobile
- [ ] Numbers readable
- [ ] Cards stack properly

#### ✅ Projects
- [ ] Single column
- [ ] Images maintain aspect ratio
- [ ] Hover effects on tap

#### ✅ Testimonials
- [ ] Single testimonial visible
- [ ] Arrows positioned outside
- [ ] Swipe gesture works
- [ ] Text fits comfortably

#### ✅ CTA
- [ ] Stacked layout
- [ ] Contact icons wrap
- [ ] Touch targets adequate

### Tablet Testing (768px - 1024px)

#### ✅ Layout
- [ ] 2-column grid for services
- [ ] 2-column grid for projects
- [ ] Trust badges visible (3 cards)
- [ ] CTAs side-by-side
- [ ] Comfortable spacing

### Desktop Testing (1440px+)

#### ✅ Layout
- [ ] 3-column grid for services/projects
- [ ] Trust badges floating on right
- [ ] Max-width container (7xl: 80rem)
- [ ] Comfortable whitespace
- [ ] No horizontal scroll

---

## Performance Testing

### Core Web Vitals Targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Real user |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| FCP (First Contentful Paint) | < 1.8s | Lighthouse |
| TTI (Time to Interactive) | < 3.8s | Lighthouse |

### Lighthouse Audit

**Run Lighthouse**:
1. Open DevTools → Lighthouse tab
2. Select: Performance, Accessibility, Best Practices, SEO
3. Device: Mobile & Desktop
4. Run audit for each 4 combinations

**Expected Scores**:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

### Performance Checklist

#### ✅ Images
- [ ] All images use `loading="lazy"`
- [ ] Images have `width` and `height` attributes
- [ ] OptimizedImage component used
- [ ] WebP format where possible
- [ ] Proper aspect ratios (no CLS)

#### ✅ Fonts
- [ ] Space Grotesk preloaded
- [ ] IBM Plex Sans Arabic preloaded
- [ ] Font-display: swap
- [ ] No FOUT (Flash of Unstyled Text)

#### ✅ JavaScript
- [ ] Code splitting enabled
- [ ] Admin routes lazy loaded
- [ ] Framer Motion tree-shaken
- [ ] No console errors/warnings

#### ✅ Animations
- [ ] 60fps maintained
- [ ] No jank during scroll
- [ ] GPU-accelerated (transform/opacity)
- [ ] IntersectionObserver used
- [ ] prefers-reduced-motion respected

#### ✅ Data Fetching
- [ ] React Query caching works
- [ ] Static fallback loads instantly
- [ ] Loading states shown
- [ ] No waterfall requests

### Network Performance

**Throttling Test**:
1. DevTools → Network tab
2. Throttle: Fast 3G
3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

#### ✅ Checks
- [ ] Page loads in < 5s on Fast 3G
- [ ] Images lazy load progressively
- [ ] Critical CSS inlined
- [ ] Hero content visible immediately
- [ ] Skeleton loaders (if any) work

---

## Accessibility Testing

### Automated Testing

**Using axe DevTools**:
1. Install axe extension
2. Run scan on HomePage
3. Fix all Critical and Serious issues

#### ✅ WCAG 2.1 AA Compliance
- [ ] Color contrast ≥ 4.5:1 (text)
- [ ] Color contrast ≥ 3:1 (UI components)
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Skip to content link
- [ ] Semantic HTML (<header>, <main>, <section>)
- [ ] Alt text on images
- [ ] ARIA labels on controls

### Keyboard Navigation

**Test Flow**:
1. Tab through entire page
2. Verify focus order logical
3. No focus traps
4. All interactive elements reachable

#### ✅ Keyboard Checks
- [ ] Tab moves forward through elements
- [ ] Shift+Tab moves backward
- [ ] Enter activates buttons/links
- [ ] Space scrolls page
- [ ] Arrows navigate carousel
- [ ] Esc closes modals (if any)
- [ ] Focus visible at all times

### Screen Reader Testing

**Test with**:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac/iOS)
- TalkBack (Android)

#### ✅ Screen Reader Checks
- [ ] Page title announced
- [ ] Headings hierarchy correct (H1→H2→H3)
- [ ] Landmarks announced (<main>, <nav>, <footer>)
- [ ] Images have alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Form labels associated
- [ ] ARIA live regions for dynamic content

---

## Browser Compatibility

### Browsers to Test

| Browser | Version | OS | Priority |
|---------|---------|-----|----------|
| Chrome | Latest | Win/Mac | High |
| Firefox | Latest | Win/Mac | High |
| Safari | Latest | Mac | High |
| Edge | Latest | Win | Medium |
| Safari | Latest | iOS | High |
| Chrome | Latest | Android | Medium |

### Feature Support

#### ✅ Modern Features Used
- [ ] CSS Grid (check fallback)
- [ ] Flexbox (widely supported)
- [ ] CSS Custom Properties (check fallback)
- [ ] IntersectionObserver (polyfill if needed)
- [ ] Framer Motion animations
- [ ] ES6+ (transpiled by Vite)

---

## Bilingual Content Testing

### English Content

#### ✅ Verify Translations
- [ ] Hero headline/subheadline
- [ ] Service titles/descriptions
- [ ] Project titles/descriptions
- [ ] Testimonial text
- [ ] CTA buttons
- [ ] Navigation links
- [ ] Footer content

### Arabic Content

#### ✅ Verify Translations
- [ ] All text displays in Arabic
- [ ] No English fallback visible
- [ ] Numbers display correctly (Bidi)
- [ ] Punctuation correct
- [ ] Font: IBM Plex Sans Arabic
- [ ] No text overflow
- [ ] Proper line breaks

---

## Database Integration Testing

### With Supabase

#### ✅ Data Fetching
- [ ] Services load from database
- [ ] Projects load from database
- [ ] Testimonials load from database
- [ ] Stats load from database
- [ ] Hero loads from database
- [ ] Loading states shown
- [ ] Error states handled
- [ ] Bilingual data returned correctly

#### ✅ Fallback Behavior
- [ ] Empty data shows NoResults component
- [ ] Network errors show ErrorState
- [ ] Retry button works
- [ ] Static data never leaks through

### Without Supabase

#### ✅ Static Fallback
- [ ] Static data loads immediately
- [ ] No console errors about missing env
- [ ] All sections populate
- [ ] Functionality identical to database mode
- [ ] No "undefined" data

---

## Performance Optimization

### Implemented Optimizations

#### ✅ Code Splitting
```javascript
// Admin routes lazy loaded
const AdminLayout = lazy(() => import('@/admin/components/AdminLayout'));
```

#### ✅ Image Optimization
```jsx
<OptimizedImage
  src={image}
  alt={alt}
  loading="lazy"
  className="..."
/>
```

#### ✅ Animation Optimization
- GPU acceleration (transform, opacity)
- IntersectionObserver for scroll triggers
- Spring physics with restDelta
- will-change on animated elements

#### ✅ Data Caching
- React Query with 5min stale time
- Supabase response caching
- Static fallback instant

### Potential Improvements

#### 🔄 Future Optimizations
1. **Image CDN**: Serve images via CDN (Cloudinary, Imgix)
2. **Preload**: Preload hero image
3. **Service Worker**: Cache static assets
4. **Route Prefetching**: Prefetch on link hover
5. **Critical CSS**: Inline above-the-fold CSS
6. **Bundle Analysis**: Reduce bundle size

---

## Bug Tracking Template

### Issue Report Format

```markdown
## Bug Description
[Brief description]

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Theme: Dark
- Language: Arabic
- Viewport: 375px (Mobile)

## Steps to Reproduce
1. Navigate to homepage
2. Switch to Arabic
3. Switch to Dark mode
4. Scroll to Services section

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[Attach screenshots]

## Priority
- [ ] Critical (blocks testing)
- [ ] High (major visual/functional issue)
- [ ] Medium (minor visual issue)
- [ ] Low (enhancement)
```

---

## Testing Checklist Summary

### Quick Test (15 minutes)

- [ ] Run dev server
- [ ] Test all 4 combinations visually
- [ ] Check responsive (mobile, tablet, desktop)
- [ ] Verify animations smooth
- [ ] Check console for errors
- [ ] Run Lighthouse audit

### Full Test (1 hour)

- [ ] All visual tests (4 combinations)
- [ ] All responsive breakpoints
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (axe)
- [ ] Keyboard navigation
- [ ] Cross-browser testing
- [ ] Database integration
- [ ] Static fallback
- [ ] Network throttling
- [ ] Animation performance

### Production Ready Checklist

- [ ] All visual tests pass
- [ ] Lighthouse scores ≥ 90
- [ ] Accessibility score ≥ 95
- [ ] No console errors
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast load (LCP < 2.5s)
- [ ] Smooth animations (60fps)
- [ ] RTL layout perfect
- [ ] Bilingual content complete
- [ ] Database + fallback work
- [ ] Mobile optimized
- [ ] Cross-browser compatible

---

## Next Steps After Testing

### If Issues Found
1. Document all bugs
2. Prioritize by severity
3. Fix Critical → High → Medium → Low
4. Re-test after fixes
5. Repeat until all pass

### If All Tests Pass
1. ✅ Mark Part C as complete
2. Commit all changes to git
3. Create pull request (if applicable)
4. Deploy to staging environment
5. User acceptance testing (UAT)
6. Deploy to production

### After Part C
- **Part D**: Services Page redesign
- **Part E**: Projects/Work Page redesign
- **Part F**: About Page redesign
- **Part G**: Contact Page redesign
- **Part H**: Admin Dashboard integration

---

## Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

**Happy Testing! 🚀**
