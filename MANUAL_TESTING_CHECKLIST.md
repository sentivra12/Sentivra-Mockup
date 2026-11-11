# Manual Testing Checklist - Mockups Hero
Complete cross-browser and cross-device testing matrix

## Test Matrix Overview
- **Browsers:** Chrome, Firefox, Safari, Edge
- **Themes:** Light Mode, Dark Mode
- **Languages:** EN, AR
- **Viewports:** 360, 390, 430, 768, 1024, 1440, 1920

**Total Combinations:** 2 themes × 2 languages × 7 viewports = **28 test scenarios per browser**

---

## Testing Environment Setup

### Prerequisites
```bash
# Start dev server
npm run dev

# Open browser DevTools (F12)
# - Console tab (watch for errors)
# - Network tab (check requests)
# - Elements tab (inspect DOM)
```

### Browser DevTools Responsive Mode
- **Chrome/Edge:** F12 → Toggle device toolbar (Ctrl+Shift+M)
- **Firefox:** F12 → Responsive Design Mode (Ctrl+Shift+M)
- **Safari:** Develop → Enter Responsive Design Mode

### Set Custom Viewport
In DevTools responsive mode:
1. Click viewport dropdown (e.g., "iPhone 12 Pro")
2. Select "Edit" → Add custom dimensions
3. Add: 360×740, 390×844, 430×932

---

## Test Scenarios

For each scenario below, test **ALL** checkpoints in the "Universal Checkpoints" section.

### Scenario Format
**[Browser] - [Theme] - [Language] - [Viewport]**

Example: `Chrome - Light - EN - 1920`

---

## Universal Checkpoints (Check for EVERY scenario)

### Visual Rendering
- [ ] Hero section visible (no white screen)
- [ ] Eyebrow text visible above heading
- [ ] Main heading (`<h1>`) visible
- [ ] Subtitle visible below heading
- [ ] Two CTA buttons visible: "Browse Designs" + "Request Custom Design"
- [ ] Laptop showcase visible (mockups or wireframe fallback)
- [ ] Floating shapes/devices visible
- [ ] Handwritten note with arrow visible
- [ ] Industry categories rotating
- [ ] Stats counters visible (e.g., "500+ Designs")
- [ ] Background animations playing (aurora blobs, grid)

### Layout & Spacing
- [ ] Content doesn't touch screen edges (has padding)
- [ ] Text readable (not too small, not cut off)
- [ ] Buttons don't overlap text or each other
- [ ] No horizontal scroll bar
- [ ] No vertical overflow (content doesn't leak outside container)
- [ ] Elements don't overlap inappropriately

### Interactivity
- [ ] "Browse Designs" button clickable
- [ ] "Request Custom Design" button clickable
- [ ] Buttons have hover state (color change)
- [ ] Buttons have focus ring when tabbed to
- [ ] WhatsApp button visible (bottom-right corner)

### Performance
- [ ] Hero loads in < 2 seconds
- [ ] Animations smooth (no stuttering)
- [ ] Scrolling smooth
- [ ] CPU usage reasonable (< 60% on modern device)

### Console Health
- [ ] No React errors (red messages)
- [ ] No 404 errors (except expected mockup images if DB empty)
- [ ] No JavaScript errors
- [ ] Attribution captured: `localStorage.getItem('attribution')` returns JSON

### Theme-Specific (Light Mode)
- [ ] Text readable (dark text on light background)
- [ ] Buttons have good contrast
- [ ] Background not too bright (comfortable to view)

### Theme-Specific (Dark Mode)
- [ ] Text readable (light text on dark background)
- [ ] Buttons have good contrast
- [ ] Background not too dark (elements distinguishable)
- [ ] Aurora blobs visible against dark background

### Language-Specific (EN)
- [ ] Text direction LTR (left-to-right)
- [ ] Text in English
- [ ] Handwritten note uses **Caveat** font
- [ ] Layout: Text left, laptop right

### Language-Specific (AR)
- [ ] Text direction RTL (right-to-left)
- [ ] Text in Arabic
- [ ] Handwritten note uses **Aref Ruqaa** font
- [ ] Layout mirrored: Text right, laptop left
- [ ] Numbers display correctly (not reversed)

---

## Viewport-Specific Checkpoints

### 360px (Galaxy S8) - Mobile Small
- [ ] All text fits without wrapping to 3+ lines
- [ ] Buttons stack vertically (if applicable) or fit side-by-side
- [ ] Laptop showcase scaled down but visible
- [ ] Floating devices don't cover text
- [ ] Sticky mobile bar fits when scrolled
- [ ] No horizontal scroll

### 390px (iPhone 12 Pro) - Mobile Medium
- [ ] Text has comfortable line length (not too squished)
- [ ] Buttons have adequate tap target size (44×44px min)
- [ ] Stats counters fit in one row or stack gracefully
- [ ] Handwritten note positioned well (not blocking key content)
- [ ] Sticky bar text readable

### 430px (iPhone 14 Pro Max) - Mobile Large
- [ ] Hero has breathing room (not cramped)
- [ ] Laptop showcase proportional to screen
- [ ] Floating chips visible and animated
- [ ] Text column width comfortable (~90% of screen)

### 768px (iPad Portrait) - Tablet
- [ ] Layout transitions to desktop-ish (two-column starts here)
- [ ] Laptop showcase on right side (EN) or left (AR)
- [ ] Text column width ~50% of screen
- [ ] Stats in single row
- [ ] No sticky bar (desktop layout)
- [ ] Industry categories have space to expand

### 1024px (iPad Landscape / Desktop Small) - Desktop Start
- [ ] Full desktop layout active
- [ ] Two-column layout clear: text | laptop
- [ ] Mouse spotlight effect active (move mouse to test)
- [ ] Animations at full detail (all layers visible)
- [ ] Laptop showcase large enough to see mockup details
- [ ] Code tokens floating (if implemented)

### 1440px (Laptop) - Desktop Standard
- [ ] Content centered (not stretched edge-to-edge)
- [ ] Max-width container applied (~1280px content width)
- [ ] Large Aurora blobs visible
- [ ] Laptop showcase prominent
- [ ] Text comfortable to read (not too wide)
- [ ] All floating elements visible in viewport

### 1920px (Desktop Large) - Full HD
- [ ] Content max-width maintained (not stretched)
- [ ] Hero centered horizontally
- [ ] Background covers full width
- [ ] No awkward empty space at edges
- [ ] Animations cover full background
- [ ] Text doesn't become too wide (max ~60ch line length)

---

## Browser-Specific Checks

### Chrome/Edge (Chromium)
- [ ] Animations use GPU acceleration (check DevTools Performance tab)
- [ ] Fonts render smoothly (no aliasing issues)
- [ ] Backdrop-filter effects work (if used)

### Firefox
- [ ] Animations smooth (Firefox sometimes slower)
- [ ] RTL layout works (Firefox has good RTL support)
- [ ] DevTools console clean

### Safari (Desktop)
- [ ] Animations smooth (Safari is finicky with CSS animations)
- [ ] Fonts load correctly (Caveat, Aref Ruqaa)
- [ ] -webkit prefixes working (if needed)
- [ ] No "bouncy scroll" issues

### Safari (iOS - Real Device Recommended)
- [ ] Touch targets large enough (44×44px min)
- [ ] Sticky bar doesn't cover content
- [ ] Viewport meta tag working (no zoom issues)
- [ ] Animations pause when app backgrounded
- [ ] WhatsApp button doesn't trigger accidentally

---

## Accessibility Checks (Do Once Per Browser)

### Keyboard Navigation
- [ ] Tab key moves focus through: Button 1 → Button 2 → WhatsApp
- [ ] Enter key activates focused button
- [ ] Focus ring visible on all focusable elements
- [ ] No focus traps (can tab out of hero section)

### Screen Reader (Optional - Advanced)
- [ ] Heading announced as heading level 1
- [ ] Button purpose announced clearly
- [ ] aria-labels present on interactive elements
- [ ] Alt text on decorative images (or aria-hidden="true")

### Reduced Motion
**Enable in OS Settings:**
- **Windows:** Settings → Accessibility → Visual effects → Animation effects OFF
- **macOS:** System Preferences → Accessibility → Display → Reduce motion ON
- **iOS:** Settings → Accessibility → Motion → Reduce Motion ON

**Expected Behavior:**
- [ ] Aurora blobs don't animate (static or removed)
- [ ] Floating shapes don't float
- [ ] Typewriter effect instant (no typing animation)
- [ ] Transitions instant or very short (<0.2s)
- [ ] Page still functional (motion not required for interaction)

---

## Performance Checks (Do Once Per Browser at 1920px)

### Lighthouse Audit (Chrome DevTools)
1. Open DevTools → Lighthouse tab
2. Select: Desktop, Performance, Accessibility, Best Practices
3. Run audit on `/mockups`

**Target Scores:**
- [ ] Performance: ≥ 90
- [ ] Accessibility: ≥ 90
- [ ] Best Practices: ≥ 90
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Network Throttling (3G)
1. DevTools → Network tab → Throttling dropdown → Slow 3G
2. Refresh `/mockups`

**Expected:**
- [ ] Hero visible in < 3 seconds
- [ ] Critical content loads first (text, buttons)
- [ ] Animations degrade gracefully (or load progressively)
- [ ] No "flash of unstyled content" (FOUC)

---

## Attribution & Analytics Testing

### UTM Parameter Capture
1. Visit: `http://localhost:5173/mockups?utm_source=test&utm_medium=smoke_test&utm_campaign=manual_qa`
2. [ ] URL cleans to: `http://localhost:5173/mockups` (params removed)
3. Console: `localStorage.getItem('attribution')`
4. [ ] Returns JSON with correct UTM values
5. [ ] `landing_page` field shows `/mockups`
6. [ ] `attribution_timestamp` present

### Click ID Capture
1. Visit: `http://localhost:5173/mockups?gclid=test123`
2. [ ] `gclid` captured in localStorage
3. Visit with: `?fbclid=test456`
4. [ ] `fbclid` captured

### Analytics Events (If Tracking IDs Configured)
1. Click "Browse Designs"
2. [ ] Network tab shows pixel/GA4 request
3. [ ] Event name: `hero_cta_click`
4. [ ] Event params include: `cta_text`, `destination`

---

## Real Device Testing (Recommended)

### Android Device
- [ ] Test on physical Android phone (Samsung, Pixel, etc.)
- [ ] Chrome browser
- [ ] Viewport: Native resolution
- [ ] Touch interactions smooth
- [ ] Sticky bar appears after scroll

### iOS Device
- [ ] Test on physical iPhone
- [ ] Safari browser
- [ ] Viewport: Native resolution
- [ ] Touch interactions smooth
- [ ] Sticky bar appears after scroll
- [ ] WhatsApp button works (opens WhatsApp app)

---

## Test Recording Template

Use this template to record results:

```
## Test Session: [Date] - [Tester Name]

Browser: [Chrome/Firefox/Safari/Edge]
Theme: [Light/Dark]
Language: [EN/AR]
Viewport: [360/390/430/768/1024/1440/1920]

### Results
- Visual Rendering: [PASS/FAIL]
- Layout & Spacing: [PASS/FAIL]
- Interactivity: [PASS/FAIL]
- Performance: [PASS/FAIL]
- Console Health: [PASS/FAIL]

### Issues Found
1. [Description of issue #1]
2. [Description of issue #2]

### Screenshots
- [Attach screenshot of any visual issues]

### Notes
- [Any additional observations]
```

---

## Priority Testing Order

**Phase 1: Critical (Do First)**
1. Chrome - Light - EN - 1440px (most common)
2. Chrome - Dark - EN - 390px (mobile + dark mode common)
3. Chrome - Light - AR - 1440px (RTL desktop)
4. Safari (iOS) - Light - EN - Native (real iPhone)

**Phase 2: High Priority**
5. Chrome - Light - EN - 360px (small mobile)
6. Firefox - Light - EN - 1440px (2nd most popular browser)
7. Chrome - Dark - AR - 390px (RTL mobile dark)
8. Safari (Desktop) - Light - EN - 1440px (Mac users)

**Phase 3: Medium Priority**
9. Edge - Light - EN - 1920px (large desktop)
10. Chrome - Light - EN - 768px (tablet)
11. Chrome - Light - EN - 1024px (desktop start)
12. Firefox - Dark - AR - 1440px

**Phase 4: Lower Priority (Nice to Have)**
13-28. Remaining combinations

---

## Pass/Fail Criteria

### Critical Failure (Block Release)
- Hero doesn't render at all
- JavaScript errors break functionality
- Buttons not clickable
- Horizontal scroll on any viewport
- Text unreadable (contrast < 3:1)
- Attribution not capturing

### Major Failure (Fix Before Release)
- Animations very janky (< 20 FPS)
- Layout broken on common viewport (390px, 1440px)
- Dark mode unreadable
- RTL layout broken
- Performance < 70 Lighthouse score

### Minor Failure (Fix If Time)
- Animations slightly janky (20-40 FPS)
- Layout suboptimal on edge case viewport (360px, 1920px)
- Hover states missing
- Focus rings hard to see
- Performance 70-89 Lighthouse score

### Pass
- All Critical checkpoints pass
- < 2 Major failures
- Performance ≥ 90 Lighthouse score
- No console errors (except expected DB errors)
- Attribution working
- Responsive 360px - 1920px

---

## Quick Test (5 Minutes)

If you only have 5 minutes:

1. Chrome - Light - EN - 1440px
2. Chrome - Dark - EN - 390px
3. Chrome - Light - AR - 1440px
4. Check: Visual rendering, interactivity, console, attribution
5. Run: Lighthouse audit

**If all 5-minute tests pass → Proceed to full testing**
**If any fail → Fix and retest**

---

## Notes

- Test in incognito/private mode to avoid cache/extension interference
- Clear localStorage before testing attribution: `localStorage.clear()`
- Use real device for touch testing (mouse hover ≠ touch)
- Record videos of animations if reporting performance issues
- Share console errors with full stack trace
- Take screenshots at each viewport for visual regression testing

---

## After Testing

1. **Document results** in this file or separate test report
2. **Log issues** in project tracker with:
   - Browser/Device
   - Viewport
   - Theme/Language
   - Expected vs Actual
   - Screenshot
3. **Prioritize fixes** using criteria above
4. **Retest** after fixes applied
5. **Sign off** when all Critical and Major issues resolved
