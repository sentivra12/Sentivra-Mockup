# Bidi Component Integration Guide

## Overview
The `Bidi` component wraps content in `<bdi>` HTML tags to prevent RTL/LTR text direction issues. This is crucial for proper display of numbers, emails, phone numbers, and mixed content in bilingual applications.

## What is `<bdi>`?
The Bidirectional Isolate element (`<bdi>`) tells the browser's bidirectional algorithm to treat the text it contains in isolation from its surrounding text. This prevents numbers like "+50" from displaying as "50+" in RTL languages.

## Component Location
```
src/components/ui/Bidi.jsx
```

## Updated Components

### Counter Components
These components now wrap their output in `<Bidi>` to ensure numbers display correctly:

1. **StatCounter** (`src/components/ui/StatCounter.jsx`)
   - Used for large stat displays with icons
   - Wraps: `{displayValue}{suffix}`
   - Example: "200+" stays as "200+" not "200+" in Arabic

2. **AnimatedCounter** (`src/components/AnimatedCounter.jsx`)
   - Used for animated number counting
   - Wraps: `{displayValue}`
   - Handles formatted numbers with commas

3. **StatsStrip** (`src/components/ui/StatsStrip.jsx`)
   - Inline stat items in horizontal strip
   - Wraps: `{displayValue}{stat.suffix}`

### Timeline Component
**Timeline** (`src/components/ui/Timeline.jsx`)
- Wraps year displays: `{milestone.year}`
- Ensures years like "2022" don't get reversed in RTL
- Applied to both desktop and mobile layouts

### Contact Components
1. **Footer** (`src/components/Footer.jsx`)
   - Wraps phone number: `+201558952126`
   - Already has `dir="ltr"` on the link

2. **ContactInfoCard** (`src/components/ui/ContactInfoCard.jsx`)
   - Wraps all contact values (email, phone, WhatsApp, address)
   - Handles both link and non-link displays

3. **FormField** (`src/components/ui/FormField.jsx`)
   - Added `dir="ltr"` to `tel` and `email` input types
   - Ensures phone/email inputs always display left-to-right

## Usage Examples

### Wrapping Numbers with Suffixes
```jsx
import { Bidi } from '@/components/ui/Bidi';

<div className="text-2xl font-bold">
  <Bidi>200+</Bidi>
</div>
```

### Wrapping Phone Numbers
```jsx
<a href="tel:+201558952126" dir="ltr">
  <Bidi>+201558952126</Bidi>
</a>
```

### Wrapping Years
```jsx
<span className="text-xl font-bold">
  <Bidi>2022</Bidi>
</span>
```

### Form Inputs (dir attribute)
```jsx
<input
  type="tel"
  dir="ltr"
  value="{phone}"
/>
```

## When to Use Bidi

✅ **Use Bidi for:**
- Numbers with suffixes ("+", "K", "M", "%")
- Phone numbers (especially with country codes)
- Email addresses
- Years and dates
- Mixed Latin/Arabic content
- Brand names with numbers

❌ **Don't use Bidi for:**
- Pure text content (handled by `dir` on parent)
- Icons and images
- Already isolated content (like separate `dir="ltr"` containers)

## Testing RTL Display

### Before Bidi:
- English: "200+ Projects" ✓
- Arabic: "مشروع +200" ✗ (suffix moved to wrong side)

### After Bidi:
- English: "200+ Projects" ✓
- Arabic: "200+ مشروع" ✓ (number stays together)

## Implementation Checklist

- [x] StatCounter component
- [x] AnimatedCounter component
- [x] StatsStrip component
- [x] Timeline years
- [x] Footer phone number
- [x] ContactInfoCard values
- [x] FormField tel/email inputs (dir="ltr")
- [ ] Add to additional numeric displays (if found)
- [ ] Test all pages in Arabic mode
- [ ] Verify stats display correctly
- [ ] Check phone numbers in all components

## Related Files
- `src/components/ui/Bidi.jsx` - Component definition
- `src/components/ui/StatCounter.jsx`
- `src/components/AnimatedCounter.jsx`
- `src/components/ui/StatsStrip.jsx`
- `src/components/ui/Timeline.jsx`
- `src/components/Footer.jsx`
- `src/components/ui/ContactInfoCard.jsx`
- `src/components/ui/FormField.jsx`

## Future Improvements
- Add Bidi to any additional numeric displays found during testing
- Consider adding Bidi to prices if e-commerce features are added
- Monitor for any RTL display issues with mixed content
