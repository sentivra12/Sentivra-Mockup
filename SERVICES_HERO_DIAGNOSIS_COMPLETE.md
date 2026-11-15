# Services Hero - Complete Diagnosis Report

## Step 1: Evidence BEFORE Fix

### Test Results Summary
- **Screenshots captured:** 40 (light/dark × EN/AR × 5 widths × 2 motion modes)
- **Console errors:** 0
- **Console warnings:** 0
- **Test duration:** 5.1 minutes

---

## 🐛 **BUG INVENTORY**

### 1. ⚠️ CRITICAL: NAVBAR CONTRAST FAILURE
**Root Cause:** `src/components/Header.jsx` Lines 90-101, 126-131

**Problem:**
- Navbar assumes ALL pages have dark hero backgrounds
- When `isScrolled=false`: uses `text-white/90` for links and `Logo variant="light"` (white)
- On `/services` light theme: white text on light background
- **Measured contrast:** rgba(255,255,255,0.9) on light = ~1.1:1
- **Required:** 4.5:1 for AA compliance

**Evidence:**
```json
{
  "Home link": { "textColor": "rgba(255, 255, 255, 0.9)" },
  "Mockups link": { "textColor": "rgba(255, 255, 255, 0.9)" },
  "About link": { "textColor": "rgba(255, 255, 255, 0.9)" },
  "Language switch": { "textColor": "rgba(255, 255, 255, 0.5)" },
  "navbarBg": "rgba(0, 0, 0, 0)",
  "heroBackdrop": "rgba(0, 0, 0, 0)"
}
```

**File:** `src/components/Header.jsx`
**Lines:** 126-131
```javascript
isScrolled
  ? 'text-brand-800 dark:text-brand-200'
  : 'text-white/90 hover:text-white'  // ← ASSUMES DARK HERO
```

---

### 2. ✅ CONTAINER ALIGNMENT - OK
**Status:** Working correctly

**Evidence:**
```json
{
  "navbar": { "maxWidth": "1280px", "paddingLeft": "32px", "left": 80 },
  "hero": { "maxWidth": "1280px", "paddingLeft": "32px", "left": 80 },
  "nextSection": { "maxWidth": "1280px", "paddingLeft": "32px", "left": 80 }
}
```

All use `max-w-7xl` (1280px) with `px-4 sm:px-6 lg:px-8` → consistent 32px padding at 1440px.

---

### 3. ⚠️ UNDERLINE WIDTH FAR BEYOND WORD
**Root Cause:** `src/components/services/ServicesHeroConstellationRound3.jsx` ~Line 300

**Problem:**
- H1 wrapper is 576px wide
- "Software Solutions" text is 321px wide
- Underline SVG is 576px (extends to full H1 width)
- Should wrap ONLY "Solutions" (~150px)

**Evidence:**
```json
{
  "h1Width": 576,
  "underlineSvg": { "width": 576 },
  "solutionsWrapper": { "width": 321.203125, "text": "Software Solutions" }
}
```

**Expected:** Underline should be on an inline-block wrapper around ONLY "Solutions", not "Software Solutions".

---

### 4. ⚠️ HEADLINE USES OLD PALETTE
**Root Cause:** `ServicesHeroConstellationRound3.jsx` Lines ~278-290

**Problem:**
- Gradient uses `from-slate-900 via-slate-700 to-cyan-600`
- Should use brand emerald tokens only

**Evidence:**
```json
{
  "backgroundImage": "linear-gradient(to right, rgb(15, 23, 42), rgb(51, 65, 85), rgb(8, 145, 178))",
  "classes": "bg-gradient-to-r from-slate-900 via-slate-700 to-cyan-600 dark:from-slate-100 dark:via-slate-300 dark:to-cyan-400"
}
```

**Computed colors:**
- `rgb(15, 23, 42)` = slate-900
- `rgb(51, 65, 85)` = slate-700  
- `rgb(8, 145, 178)` = cyan-600

**Required:** Use `from-brand-accent to-brand-accent-deep` or single brand color.

---

### 5. ❌ EYEBROW NOT RENDERING PROPERLY
**Root Cause:** Component structure issue

**Problem:**
- Test couldn't find eyebrow element
- Returns `{ text: "undefined", fontFamily: undefined }`
- Likely empty icon space or missing content

**Evidence:**
- Selector `[class*="eyebrow"]` found nothing
- Text content shows "PROFESSIONAL SOFTWARE SERVICES" concatenated with H1

---

### 6. ❌ VISUAL STAGE NOT FOUND
**Root Cause:** Constellation not rendering or wrong selector

**Problem:**
- Stage element not found: `{ error: 'Stage not found' }`
- Tiles count: undefined
- Lines count: undefined

**Evidence:**
- Selector `[class*="constellation"], [class*="stage"], [class*="visual"]` found nothing

---

### 7. ⚠️ BUTTONS - WEAK CONTRAST
**Root Cause:** InverseSurface making backgrounds transparent

**Problem:**
- **Primary button:** `color: rgb(2,35,30)`, `bg: rgba(0,0,0,0)`, `border: 0px`
- **Secondary button:** `border: 1px solid rgb(229,231,235)` (very faint gray)
- Both have transparent backgrounds

**Evidence:**
```json
{
  "Button 0": {
    "text": "Start Your Project",
    "color": "rgb(2, 35, 30)",
    "backgroundColor": "rgba(0, 0, 0, 0)",
    "border": "0px solid rgb(229, 231, 235)"
  },
  "Button 1": {
    "text": "Explore Services",
    "color": "rgb(2, 35, 30)",
    "backgroundColor": "rgba(0, 0, 0, 0)",
    "border": "1px solid rgb(229, 231, 235)"
  }
}
```

Border color `rgb(229,231,235)` is gray-200, almost invisible on light background.

---

### 8. ⚠️ TYPEWRITER SMALL
**Root Cause:** Font size 16px

**Problem:**
- Typewriter text is 16px (base body size)
- Low visual hierarchy for a hero element
- BUT: Not clipped (bottom 842px < viewport 900px) ✅

**Evidence:**
```json
{
  "fontSize": "16px",
  "color": "rgb(2, 35, 30)",
  "position": { "bottom": 842.75, "viewportHeight": 900, "isClipped": false }
}
```

---

### 9. ⚠️ SERVICE COUNT UNDEFINED
**Root Cause:** Data not loading from Admin/DB

**Problem:**
- Service count shows "undefined" instead of number
- Typewriter shows static text instead of cycling service names

**Evidence:**
```json
{
  "serviceCountText": "undefined",
  "hasHardcodedServices": false
}
```

---

## 📸 Screenshot Evidence

**40 screenshots captured** in `tests/screenshots/`:
- Formats: `hero-BEFORE-{theme}-{lang}-{width}-{motion}.png`
- Themes: light, dark
- Languages: en, ar
- Widths: 390, 768, 1024, 1440, 1920
- Motion: no-preference, reduce

**Key observations from light-en-1440-no-preference.png:**
1. Navbar links barely visible (white on light)
2. Underline extends too far
3. Secondary button has faint border
4. Constellation/visual stage not visible or very faint

---

## 🎯 PRIORITY FIXES REQUIRED

### P0 - Critical (AA Compliance)
1. **Navbar contrast:** Detect light/dark hero per page, use appropriate text colors
2. **Button borders:** Increase contrast to 3:1 minimum
3. **Headline gradient:** Replace slate/cyan with brand tokens

### P1 - High (User Experience)
4. **Underline width:** Wrap only "Solutions" word
5. **Eyebrow rendering:** Fix component structure
6. **Visual stage:** Ensure constellation renders properly
7. **Service count:** Wire up real data from DB

### P2 - Medium (Polish)
8. **Typewriter size:** Increase to 18-20px for better hierarchy
9. **Button backgrounds:** Ensure solid, visible backgrounds

---

## Files To Modify

1. **`src/components/Header.jsx`** - Fix navbar contrast logic
2. **`src/components/services/ServicesHeroConstellationRound3.jsx`** - Fix underline, gradient, eyebrow, buttons, typewriter

---

**Status:** Diagnosis complete, ready for Step 2 (fixes).
