# Logical Properties Guide

## Overview
Logical properties provide a way to write CSS that automatically adapts to text direction (LTR/RTL) without conditional logic. Instead of `margin-left` and `margin-right`, you use `margin-inline-start` and `margin-inline-end`.

## Why Use Logical Properties?

### Before (Physical Properties + Conditionals)
```jsx
<div className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
  Content
</div>
```

### After (Logical Properties)
```jsx
<div className="ms-4">
  Content
</div>
```

The logical property automatically adapts:
- **LTR (English)**: `ms-4` = `margin-left: 1rem`
- **RTL (Arabic)**: `ms-4` = `margin-right: 1rem`

## Available Utilities

### Margin
| Logical | Physical (LTR) | Physical (RTL) | Description |
|---------|----------------|----------------|-------------|
| `ms-{n}` | `ml-{n}` | `mr-{n}` | Margin inline start |
| `me-{n}` | `mr-{n}` | `ml-{n}` | Margin inline end |

Examples:
- `ms-4` → margin-inline-start: 1rem
- `me-6` → margin-inline-end: 1.5rem
- `ms-auto` → margin-inline-start: auto

### Padding
| Logical | Physical (LTR) | Physical (RTL) | Description |
|---------|----------------|----------------|-------------|
| `ps-{n}` | `pl-{n}` | `pr-{n}` | Padding inline start |
| `pe-{n}` | `pr-{n}` | `pl-{n}` | Padding inline end |

Examples:
- `ps-4` → padding-inline-start: 1rem
- `pe-8` → padding-inline-end: 2rem

### Positioning
| Logical | Physical (LTR) | Physical (RTL) | Description |
|---------|----------------|----------------|-------------|
| `start-{n}` | `left-{n}` | `right-{n}` | Position inline start |
| `end-{n}` | `right-{n}` | `left-{n}` | Position inline end |

Examples:
- `start-0` → inset-inline-start: 0
- `end-4` → inset-inline-end: 1rem
- `start-auto` → inset-inline-start: auto

### Borders
| Logical | Physical (LTR) | Physical (RTL) | Description |
|---------|----------------|----------------|-------------|
| `border-s` | `border-l` | `border-r` | Border inline start |
| `border-e` | `border-r` | `border-l` | Border inline end |
| `border-s-0` | `border-l-0` | `border-r-0` | No border inline start |
| `border-s-2` | `border-l-2` | `border-r-2` | 2px border inline start |

### Rounded Corners
| Logical | Physical (LTR) | Physical (RTL) | Description |
|---------|----------------|----------------|-------------|
| `rounded-s` | `rounded-l` | `rounded-r` | Round start corners |
| `rounded-e` | `rounded-r` | `rounded-l` | Round end corners |
| `rounded-s-lg` | `rounded-l-lg` | `rounded-r-lg` | Round start corners (large) |

### Text Alignment
| Logical | Physical (LTR) | Physical (RTL) | Description |
|---------|----------------|----------------|-------------|
| `text-start` | `text-left` | `text-right` | Align text to start |
| `text-end` | `text-right` | `text-left` | Align text to end |

## When to Use Logical Properties

### ✅ Use Logical Properties For:
- **Static layouts** where direction should adapt automatically
- **Simple spacing** that should flip in RTL
- **New components** being built from scratch
- **Text containers** that need natural alignment

### ❌ Keep Physical Properties For:
- **Icons** that need explicit positioning (keep conditional logic)
- **Arrows and chevrons** that need to flip direction
- **Absolute positioning** where you need precise control
- **Animations** that explicitly move left/right
- **Third-party components** that expect physical properties

## Migration Strategy

### 1. Identify Candidates
Look for simple, static directional properties:
```jsx
// Good candidate
<div className="ml-4 pr-6">

// Not a candidate (conditional logic needed for icon)
<Icon className={language === 'ar' ? 'mr-2' : 'ml-2'} />
```

### 2. Convert Static Properties
```jsx
// Before
<div className="ml-4 mr-2 pl-6 pr-8">

// After
<div className="ms-4 me-2 ps-6 pe-8">
```

### 3. Test Both Directions
Always test in both English (LTR) and Arabic (RTL) modes to ensure layout works correctly.

## Common Patterns

### Card with Icon
```jsx
// Before
<div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
  <Icon className={language === 'ar' ? 'ml-3' : 'mr-3'} />
  <span>Text</span>
</div>

// After (simpler!)
<div className="flex items-center gap-3">
  <Icon />
  <span>Text</span>
</div>
```
**Note**: Using `gap` is often better than directional margins!

### Button with Icon
```jsx
// Keep conditional for explicit icon direction
<Button>
  {text}
  <ArrowRight className={language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} />
</Button>
```

### Form Field
```jsx
// Before
<input className="pl-11 pr-4" />

// After
<input className="ps-11 pe-4" />
```

### Sidebar Layout
```jsx
// Before
<div className="ml-64">Content</div>

// After
<div className="ms-64">Content</div>
```

## Implementation in Tailwind

We've added a custom Tailwind plugin in `tailwind.config.js` that generates all logical property utilities. The plugin:
1. Generates `ms-*`, `me-*`, `ps-*`, `pe-*` for all spacing values
2. Creates `start-*`, `end-*` for positioning
3. Adds border and rounded corner utilities
4. Provides text alignment utilities

## Browser Support

Logical properties are supported in all modern browsers:
- Chrome 89+
- Firefox 66+
- Safari 15+
- Edge 89+

For older browsers, consider adding a fallback using PostCSS or accept the limitation.

## Best Practices

1. **Start with `gap`**: Before reaching for margin, consider if `gap` on a flex/grid container works better
2. **Use logical for static layouts**: Convert simple, static spacing to logical properties
3. **Keep conditionals for semantics**: If something needs to flip (like arrows), keep conditional logic
4. **Test thoroughly**: Always verify in both LTR and RTL modes
5. **Document why**: If you keep physical properties, add a comment explaining why

## Examples in Codebase

### Form Fields
```jsx
// FormField.jsx - good use of logical properties
<input className="ps-11 pe-4" />
```

### Card Layouts
```jsx
// Good: using gap instead of directional margins
<div className="flex items-center gap-4">
  <Icon />
  <div>Content</div>
</div>
```

### Icons in Text
```jsx
// Keep conditional for explicit direction
<span>
  {text}
  <Icon className={language === 'ar' ? 'mr-2' : 'ml-2'} />
</span>
```

## Conversion Script

Use the provided script to convert files:
```bash
node scripts/convert-to-logical-properties.cjs <file-path>
```

**Note**: The script is a helper, not a replacement for manual review. Always verify the changes make sense for your use case.

## Further Reading

- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [W3C Specification](https://www.w3.org/TR/css-logical-1/)
- [Can I Use: Logical Properties](https://caniuse.com/css-logical-props)
