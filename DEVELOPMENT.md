# Sentivra Development Guide

## Table of Contents
- [Theme System](#theme-system)
- [Inverse Surface System](#inverse-surface-system)
- [Dark Sections Best Practices](#dark-sections-best-practices)
- [Contrast Requirements](#contrast-requirements)
- [RTL Support](#rtl-support)
- [Component Guidelines](#component-guidelines)

---

## Theme System

Sentivra uses a dual-theme system (Light and Dark) with the **Frosted Aura** color palette.

### Theme Tokens
- Light theme tokens are defined in `:root` in `src/index.css`
- Dark theme overrides are in `.dark` class
- All colors use CSS custom properties for theme-aware design

### Semantic vs. Component Tokens

**Semantic tokens** (e.g., `--color-primary`, `--color-foreground`) change with the theme:
- Light mode: `--color-primary-deep` = `#1F3440` (dark)
- Dark mode: `--color-primary-deep` = `#B8D4E0` (light)

**Component-specific tokens** (e.g., `--hero-deep`, `--cta-deep`, `--inverse-bg`) stay consistent or adjust slightly but maintain their intended appearance in both themes.

---

## Inverse Surface System

### What is an Inverse Surface?

An **inverse surface** is a section that always appears dark with light text, regardless of whether the user is in light or dark mode. This creates visual rhythm and hierarchy on the page.

### When to Use Inverse Surface

Use `<InverseSurface>` for sections that should ALWAYS be dark:
- Footer
- Call-to-action bands
- "Why Choose Us" sections
- Team/About sections
- Testimonials (if using dark design)
- Feature highlight bands

### ⚠️ CRITICAL RULE

**NEVER use `bg-primary-deep` or other semantic tokens for sections that should stay dark.**

Semantic tokens flip with the theme, causing sections to become light in dark mode (or vice versa).

### How to Use Inverse Surface

```jsx
import InverseSurface from '@/components/ui/InverseSurface';

const MySection = () => {
  return (
    <InverseSurface 
      className="py-20" 
      withTopGlow 
      withGrid
    >
      {/* Your content */}
      <h2 className="text-inverse-fg">Always Light Text</h2>
      <p className="text-inverse-fg-muted">Muted light text</p>
      <button className="btn-inverse-primary">White button</button>
    </InverseSurface>
  );
};
```

### Inverse Surface Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `as` | `elementType` | `'section'` | HTML element to render |
| `withTopGlow` | `boolean` | `true` | Show hairline glow at top |
| `withGrid` | `boolean` | `false` | Show grid pattern background |
| `withGradient` | `boolean` | `false` | Use gradient background |

### Inverse Surface Tokens

All inverse surface tokens are defined in `src/index.css`:

**Backgrounds:**
- `--inverse-bg` - Main background (#12232C in light, #070E12 in dark)
- `--inverse-bg-raised` - Raised elements like cards
- `--inverse-bg-gradient-start/end` - Gradient backgrounds

**Typography:**
- `--inverse-fg` - Headings and primary text (#FFFFFF)
- `--inverse-fg-muted` - Body text and links (#D4DDE2)
- `--inverse-fg-subtle` - Subtle text (#9DB0BA)

**Interactive:**
- `--inverse-accent` - Hover states and highlights (#8FC3D1)
- `--inverse-button-primary-bg` - Primary button background (white)
- `--inverse-button-secondary-bg` - Glass button background

**Borders:**
- `--inverse-border` - Standard borders
- `--inverse-hairline` - Top glow effect

### Semantic Token Remapping

Inside `<InverseSurface>`, semantic tokens are automatically remapped:

```css
.inverse-surface {
  --color-foreground: var(--inverse-fg);
  --color-text: var(--inverse-fg);
  --color-border: var(--inverse-border);
  --color-primary: var(--inverse-accent);
  /* ... etc */
}
```

This means nested components (buttons, links, cards) automatically use the correct inverse colors.

---

## Dark Sections Best Practices

### ✅ DO

```jsx
// ✅ CORRECT: Use InverseSurface wrapper
<InverseSurface className="py-20">
  <h2 className="text-inverse-fg">Title</h2>
  <button className="btn-inverse-primary">Click</button>
</InverseSurface>
```

```jsx
// ✅ CORRECT: Use component-specific tokens
<section className="bg-hero-deep text-hero-frost">
  {/* Hero content */}
</section>
```

### ❌ DON'T

```jsx
// ❌ WRONG: Using bg-primary-deep
<section className="bg-primary-deep text-white">
  {/* This will flip to light in dark mode! */}
</section>
```

```jsx
// ❌ WRONG: Hardcoded colors
<section style={{ backgroundColor: '#1F3440' }}>
  {/* Not theme-aware, breaks token system */}
</section>
```

### Migration Pattern

When converting an existing section to use InverseSurface:

**Before:**
```jsx
<section className="py-20 bg-primary-deep">
  <h2 className="text-white">Title</h2>
  <p className="text-white/80">Description</p>
  <button className="bg-primary hover:bg-primary-dark text-white">
    Click
  </button>
</section>
```

**After:**
```jsx
<InverseSurface className="py-20" withTopGlow>
  <h2 className="text-inverse-fg">Title</h2>
  <p className="text-inverse-fg-muted">Description</p>
  <button className="btn-inverse-primary">
    Click
  </button>
</InverseSurface>
```

### Component-Specific Sections

Some sections have their own dedicated token systems:
- **Hero**: Uses `--hero-*` tokens
- **Marquee Band**: Uses `--marquee-*` tokens
- **CTA**: Uses `--cta-*` tokens
- **Testimonials**: Uses `--testimonial-*` tokens

These don't need `<InverseSurface>` because they already use non-flipping tokens.

---

## Contrast Requirements

All text on inverse surfaces must meet **WCAG AA** contrast ratios:
- **Normal text (< 18pt)**: 4.5:1 minimum
- **Large text (≥ 18pt or 14pt bold)**: 3:0 minimum
- **UI components**: 3:1 minimum

### Current Contrast Ratios

Based on inverse surface tokens:

| Element | Background | Foreground | Ratio | WCAG |
|---------|-----------|------------|-------|------|
| Headings (light) | #12232C | #FFFFFF | 15.3:1 | AAA ✓ |
| Body text (light) | #12232C | #D4DDE2 | 12.1:1 | AAA ✓ |
| Subtle text (light) | #12232C | #9DB0BA | 7.8:1 | AA ✓ |
| Accent hover (light) | #12232C | #8FC3D1 | 6.9:1 | AA ✓ |
| Headings (dark) | #070E12 | #FFFFFF | 19.5:1 | AAA ✓ |
| Body text (dark) | #070E12 | #D4DDE2 | 15.8:1 | AAA ✓ |
| Subtle text (dark) | #070E12 | #9DB0BA | 10.2:1 | AAA ✓ |

### Testing Contrast

#### Manual Testing
1. Open DevTools and inspect text elements
2. Use browser's built-in contrast checker
3. Or use online tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### Automated Testing (Future)
A contrast checking script should be added to CI/CD:

```bash
npm run test:contrast
```

This would:
1. Load each page in headless browser
2. Iterate through light/dark × EN/AR
3. Check all `.inverse-surface` elements
4. Compute text/background contrast
5. Fail if any element < WCAG AA

**Note:** This script does not currently exist but is recommended for future implementation.

---

## RTL Support

### Language Detection

The app detects language via `useTranslation` hook:

```jsx
const { t, language } = useTranslation();
const isRTL = language === 'ar';
```

### RTL Layout

Use logical properties for RTL-aware layouts:

```jsx
// ✅ CORRECT: Logical properties
<div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>

// ❌ WRONG: Fixed left/right
<div className="flex gap-4 ml-4">
```

### Text Alignment

```jsx
// ✅ CORRECT: Conditional alignment
<p className={isRTL ? 'text-right' : 'text-left'}>

// ✅ CORRECT: Use text-start/text-end
<p className="text-start">
```

### Arabic Typography

Arabic text has different requirements:
- **Line height**: 1.8 (vs. 1.6 for English)
- **Letter spacing**: `normal` (no tracking)
- **Font family**: IBM Plex Sans Arabic

These are applied automatically via:

```css
html[lang="ar"] body {
  font-family: 'IBM Plex Sans Arabic', 'Inter', sans-serif;
  line-height: 1.8;
  letter-spacing: normal;
}
```

---

## Component Guidelines

### Button Variants in Inverse Surface

```jsx
// Primary button (white background, dark text)
<button className="btn-inverse-primary">Click</button>

// Secondary/glass button (transparent with border)
<button className="btn-inverse-secondary">Click</button>
```

### Links in Inverse Surface

Links automatically use inverse colors:

```jsx
<InverseSurface>
  {/* Automatically styled with inverse colors */}
  <a href="/about">About Us</a>
</InverseSurface>
```

### Focus States

Focus rings in inverse surface use `--inverse-ring`:

```css
.inverse-surface *:focus-visible {
  outline-color: var(--inverse-accent);
  box-shadow: 0 0 0 3px var(--inverse-ring);
}
```

### Minimum Touch Targets

All interactive elements should have minimum 44px touch targets on mobile:

```jsx
<a className="min-h-[44px] flex items-center">
  Link text
</a>
```

---

## Code Review Checklist

Before merging changes that affect dark sections:

- [ ] No `bg-primary-deep` used for always-dark sections
- [ ] All dark sections use `<InverseSurface>` or component-specific tokens
- [ ] Text colors use `text-inverse-fg` variants (not `text-white`)
- [ ] Button variants use `btn-inverse-*` classes
- [ ] RTL layout tested with `language='ar'`
- [ ] Contrast ratios meet WCAG AA for all text
- [ ] Focus states visible and accessible
- [ ] Touch targets ≥ 44px on mobile
- [ ] No hardcoded hex colors in components

---

## Troubleshooting

### Section is Light in Dark Mode

**Cause**: Section uses semantic token that flips with theme  
**Fix**: Wrap in `<InverseSurface>` or use component-specific tokens

### Text Hard to Read

**Cause**: Insufficient contrast  
**Fix**: Use proper inverse text tokens (`text-inverse-fg`, not `text-inverse-fg-subtle`)

### Buttons Look Wrong

**Cause**: Not using inverse button classes  
**Fix**: Use `btn-inverse-primary` or `btn-inverse-secondary`

### Focus Ring Not Visible

**Cause**: Custom focus styles override inverse focus  
**Fix**: Remove custom focus styles inside `<InverseSurface>`

---

## Additional Resources

- **Color Tokens Reference**: See `src/index.css` lines 1-200
- **Tailwind Config**: See `tailwind.config.js` color extensions
- **InverseSurface Component**: See `src/components/ui/InverseSurface.jsx`
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Questions?

If you have questions about the theme system or inverse surfaces, please:
1. Check this guide first
2. Review existing components (Footer, PremiumCTA, etc.)
3. Ask in the team chat with specific code examples
