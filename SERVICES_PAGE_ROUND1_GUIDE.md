# Services Page Round 1 - Setup & Testing Guide

## ✅ What's Been Created

7 new premium components (total ~26 KB):

1. **ServicesHeroPremium.jsx** - Hero with services orbit visual
2. **PremiumServiceCardRound1.jsx** - Searchable service gallery
3. **HowWeWorkStrip.jsx** - 3-step process strip
4. **WhyUsSection.jsx** - 4 glass tiles (no fake stats)
5. **ServicesFAQAccordion.jsx** - Numbered accordion with smooth animations
6. **ServicesFinalCTA.jsx** - Final CTA with magnetic button + WhatsApp
7. **ServicesPageRound1.jsx** - Main page component

All components use:
- ✅ InverseSurface design tokens
- ✅ Bilingual support (EN/AR from database)
- ✅ RTL support
- ✅ Dark mode
- ✅ Accessibility (ARIA, keyboard, screen reader)
- ✅ Reduced motion support
- ✅ NO fake data or claims

---

## 🚀 Quick Start

### Step 1: Run Migration

The migration adds Arabic fields to `services` table and inserts 8 service FAQs.

**Option A: Using Supabase CLI**
```bash
cd d:\Sentivra-main
supabase db push
```

**Option B: Manual via Dashboard**
1. Go to https://app.supabase.com
2. Select your project
3. Open SQL Editor
4. Copy contents of `supabase/migrations/20261102000001_add_services_arabic_and_faqs.sql`
5. Paste and Run

### Step 2: Start Dev Server

```bash
npm run dev
```

Visit: `http://localhost:5173/services`

### Step 3: Test

- Test all 4 modes (light/dark × EN/AR)
- Test all breakpoints (360px → 1920px)
- Test search (type or press `/`)
- Test FAQ accordion
- Test magnetic button hover
- Test keyboard navigation

---

## 📋 Required Actions

### ⚠️ Action 1: Add Arabic Translations for 6 Services

Current services only have English. Add Arabic via SQL:

```sql
UPDATE services SET
  title_ar = 'تطوير تطبيقات الويب',
  short_description_ar = '...',
  long_description_ar = '...'
WHERE slug = 'web-application-development';

-- Repeat for all 6 services:
-- 1. web-application-development
-- 2. mobile-application-development
-- 3. erp-system-development
-- 4. crm-system-development
-- 5. data-analysis-and-business-intelligence
-- 6. ai-and-chatbot-solutions
```

### ⚠️ Action 2: Add Real Contact Info

```sql
UPDATE site_settings SET
  whatsapp_number = '+20 XXX XXX XXXX',
  primary_email = 'contact@sentivra.com',
  primary_phone = '+20 XXX XXX XXXX'
WHERE id = 1;
```

### ⚠️ Action 3: Complete FAQ Answers #7 and #8

FAQ #7 (Pricing/Timeline) and #8 (Tech/Hosting) need detailed answers:

```sql
-- Example for FAQ #7
UPDATE faqs SET
  answer = 'Detailed pricing answer with ranges and factors...',
  answer_ar = 'إجابة مفصلة بالعربية...'
WHERE page_key = 'services' AND display_order = 7;
```

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] Test 4 modes: Light/Dark × EN/AR
- [ ] Test 6 breakpoints: 360, 390, 768, 1024, 1440, 1920px
- [ ] Verify orbit animations (or disabled in reduced-motion)
- [ ] Verify equal-height cards
- [ ] Verify gradient borders appear on hover
- [ ] Verify pointer glare effect

### Functional Tests
- [ ] Search works (debounced 250ms)
- [ ] Press `/` focuses search
- [ ] FAQ opens/closes smoothly (grid-template-rows animation)
- [ ] Cards link to service detail pages
- [ ] Magnetic button pulls on hover (desktop)
- [ ] WhatsApp button appears (if number exists)

### Accessibility Tests
- [ ] Tab navigation works
- [ ] Enter/Space activates buttons
- [ ] Screen reader announces search results
- [ ] All interactive elements have ARIA labels
- [ ] Reduced motion disables animations

### Performance Tests
- [ ] Run Lighthouse (mobile)
- [ ] Performance ≥90
- [ ] Accessibility ≥90
- [ ] CLS ~0 (no layout shift)
- [ ] LCP <2s

### Contrast Tests
Required ratios (WCAG AA = 4.5:1 for normal text):
- Primary button: `#EEF2F4` / `#0A1525` ✅ ~12:1
- Body text (light): `#475569` / `#ffffff` ✅ ~7:1
- Body text (dark): `#94a3b8` / `#020617` ✅ ~8:1
- Cyan accent: used for icons/large text only

---

## 📁 Files Modified

### New Files
```
src/components/ui/
├── ServicesHeroPremium.jsx
├── PremiumServiceCardRound1.jsx
├── HowWeWorkStrip.jsx
├── WhyUsSection.jsx
├── ServicesFAQAccordion.jsx
└── ServicesFinalCTA.jsx

src/pages/
└── ServicesPageRound1.jsx

src/i18n/
└── useLanguage.js

supabase/migrations/
└── 20261102000001_add_services_arabic_and_faqs.sql
```

### Modified Files
- `src/App.jsx` - Added route for new page
- All components - Fixed imports to use `@/i18n/useLanguage`

---

## 🐛 Troubleshooting

### Issue: Page is blank or error

**Cause**: Migration not run

**Fix**: Run migration (see Step 1)

### Issue: Services show only in English in Arabic mode

**Cause**: Arabic fields are empty

**Fix**: Add translations (see Action 1)

### Issue: WhatsApp button not showing

**Cause**: whatsapp_number is empty

**Fix**: Add real number (see Action 2)

### Issue: FAQs not showing

**Cause**: Migration not run or FAQs inactive

**Fix**:
```sql
SELECT id, question, is_active 
FROM faqs 
WHERE page_key = 'services';

-- If is_active = false:
UPDATE faqs SET is_active = true WHERE page_key = 'services';
```

---

## 🎯 Pre-Launch Checklist

### Admin Tasks
- [ ] Migration run successfully
- [ ] Arabic translations added for 6 services
- [ ] Contact info updated (WhatsApp, email, phone)
- [ ] FAQ #7 and #8 answers completed

### Browser Tests
- [ ] 4 modes tested (light/dark × EN/AR)
- [ ] 6 breakpoints tested (360px → 1920px)
- [ ] Search tested (typing + `/` key)
- [ ] FAQ tested (open/close)
- [ ] Magnetic button tested (hover)
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (if possible)

### Performance Tests
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥90
- [ ] CLS ~0
- [ ] LCP <2s
- [ ] Contrast ratios checked (all ≥4.5:1)

### Visual Verification
- [ ] Orbits render correctly
- [ ] Cards equal height
- [ ] Gradient borders visible
- [ ] Glare effect works on mouse move
- [ ] Animations smooth (or disabled in reduced-motion)

---

## 📊 Component Features

### ServicesHeroPremium
- Eyebrow chip with pulsing dot
- Headline with gradient + shimmer + hand-drawn underline
- Central glass card with logo
- 6 orbiting service icons (max)
- 4 floating UI cards (desktop only)
- Animated connection lines

### PremiumServiceCardRound1
- Debounced search (250ms)
- `/` keyboard shortcut
- aria-live result count
- Grid: auto-fit, 4 cols at ≥1600px
- Featured card spans 2 cols (if 4+ services)
- Gradient border on hover
- Pointer glare effect
- Whole card clickable

### HowWeWorkStrip
- 3 steps with icons
- Dashed connector line (desktop)
- Numbered badges
- Subtle background

### WhyUsSection
- 4 glass tiles
- Icons with glow
- NO fake stats
- Hover effects

### ServicesFAQAccordion
- Numbered items
- One open at a time
- Smooth grid-template-rows animation
- Anchor links (#faq-1, etc.)
- Keyboard support (Enter/Space)
- Fetches from database (page_key='services')

### ServicesFinalCTA
- Eyebrow + heading
- Magnetic button (frost/white fill, deep text, shine)
- Glass WhatsApp button (real number)
- Email/phone links (LTR-isolated)
- Compact services orbit (6 icons)
- 2-column layout

---

## 🎨 Design Tokens

All components use InverseSurface tokens:

| Token | Light | Dark |
|-------|-------|------|
| canvas | `bg-white` | `bg-slate-950` |
| glass | `bg-white/80 backdrop-blur` | `bg-slate-900/80 backdrop-blur` |
| subtleCanvas | `bg-slate-50/50` | `bg-slate-900/30` |
| text | `text-slate-950` | `text-slate-50` |
| secondaryText | `text-slate-600` | `text-slate-400` |
| border | `border-slate-200` | `border-slate-800` |

Accent: `cyan-500` (light), `cyan-400` (dark)

---

## 🚀 Next Steps

1. Run migration
2. Test in browser
3. Add Arabic translations
4. Add contact info
5. Complete FAQ answers
6. Run Lighthouse
7. Deploy!

Good luck! 🎉
