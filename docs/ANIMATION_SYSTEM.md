# Animation System Documentation

## Overview

Sentivra uses a sophisticated animation system built on **Framer Motion** to create a premium, Stripe/Linear-quality user experience. All animations are performant, accessible, and respect user preferences.

---

## Core Philosophy

### Design Principles

1. **Purposeful**: Every animation serves a functional purpose
2. **Subtle**: Animations enhance, not distract
3. **Fast**: Most animations complete in 300-600ms
4. **Smooth**: Spring physics for natural motion
5. **Accessible**: Respects `prefers-reduced-motion`

### Performance Targets

- **First Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Animation FPS**: 60fps constant
- **Layout Shifts**: 0 (CLS = 0)

---

## Animation Categories

### 1. Page Transitions

**Purpose**: Smooth navigation between pages

**Implementation**:
```jsx
import PageTransition from '@/components/PageTransition';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

**Behavior**:
- Fade in: 400ms
- Fade out: 300ms
- Slight Y-axis movement (20px)
- Custom cubic-bezier easing

### 2. Scroll-Triggered Animations

**Purpose**: Reveal content as user scrolls

**Hooks Available**:

```javascript
import {
  useFadeInOnScroll,
  useParallax,
  useScrollProgress,
  useScrollDirection
} from '@/hooks/useScrollAnimation';

// Fade in when element enters viewport
const { ref, isInView } = useFadeInOnScroll();

// Parallax effect
const { ref, y } = useParallax(50); // 50px offset

// Track scroll progress
const { scrollYProgress } = useScrollProgress();

// Detect scroll direction
const { isScrollingDown } = useScrollDirection();
```

**Example**:
```jsx
const { ref, isInView } = useFadeInOnScroll({ threshold: 0.2 });

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 40 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### 3. Hover Animations

**Purpose**: Interactive feedback on hover

**Components Using Hover**:
- `PremiumServices` - Icon rotation + scale
- `PremiumProjects` - Image scale + overlay fade
- `PremiumStats` - Gradient glow
- All buttons - Scale + shadow

**Best Practices**:
```jsx
// ✅ Good - Smooth spring transition
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
>

// ❌ Bad - Too slow
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 1 }}
>
```

### 4. Stagger Animations

**Purpose**: Sequential reveal of list items

**Variants**:
```javascript
import {
  staggerContainerVariants,
  staggerItemVariants
} from '@/hooks/useScrollAnimation';

<motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Configuration**:
- Container delay: 200ms
- Stagger delay: 100ms per child
- Item duration: 500ms

### 5. Entrance Animations

**Purpose**: Initial page load animations

**Variants Available**:
```javascript
import {
  fadeInUpVariants,
  fadeInVariants,
  scaleInVariants,
  slideInVariants
} from '@/hooks/useScrollAnimation';

// Fade up from bottom
<motion.div variants={fadeInUpVariants} initial="hidden" animate="visible">

// Simple fade
<motion.div variants={fadeInVariants} initial="hidden" animate="visible">

// Scale from 95% to 100%
<motion.div variants={scaleInVariants} initial="hidden" animate="visible">

// Slide from direction
<motion.div variants={slideInVariants('left')} initial="hidden" animate="visible">
```

### 6. Micro-interactions

**Purpose**: Small delightful details

**Examples**:
- Animated counter numbers
- Gradient orb pulsing
- Scroll indicator bounce
- Button arrow slide
- Badge pulse animation

```jsx
// Animated arrow on CTA
<motion.span
  animate={{ x: [0, 4, 0] }}
  transition={{ duration: 1.5, repeat: Infinity }}
>
  →
</motion.span>

// Pulsing badge dot
<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
```

---

## Component-Specific Animations

### PremiumHero

**Animations**:
1. Stagger container for all content
2. Parallax video background
3. Animated gradient orbs (8s, 10s, 12s cycles)
4. Floating trust badges
5. Scroll indicator bounce
6. CTA arrow slide

**Performance**:
- Uses `will-change: transform` on parallax elements
- GPU-accelerated transforms
- Lazy video loading with poster

### PremiumServices

**Animations**:
1. Fade up on scroll (staggered by index)
2. Icon rotation on hover
3. Gradient accent fade
4. Arrow translate on hover

**Viewport Trigger**:
- Margin: -100px (triggers before visible)
- Once: true (no re-trigger on scroll up)

### PremiumStats

**Animations**:
1. Animated counters (2s duration)
2. Gradient glow on hover
3. Pulsing gradient orbs (3s cycle, offset by index)
4. Card fade + scale on scroll

**Counter Configuration**:
```javascript
<AnimatedCounter 
  end={150} 
  suffix="+" 
  duration={2}
/>
```

### PremiumProjects

**Animations**:
1. Image scale on hover (1 → 1.05)
2. Overlay fade in (0 → 1)
3. Tech stack badges slide up
4. Card lift on hover

**Image Optimization**:
- Lazy loading with `loading="lazy"`
- Placeholder blur
- Progressive enhancement

### PremiumTestimonials

**Animations**:
1. Auto-play carousel (5s intervals)
2. Slide transition (500ms)
3. Pause on hover
4. Dot navigation animation
5. Arrow button hover

**Carousel Config**:
```javascript
autoPlayRef.current = setInterval(() => {
  setCurrentIndex((prev) => (prev + 1) % testimonials.length);
}, 5000);
```

### PremiumCTA

**Animations**:
1. Animated gradient orbs (8s, 10s cycles)
2. Badge pulse
3. Button arrow slide
4. Contact icon hover scale

---

## Global Animation Components

### ScrollProgress

**Purpose**: Show page scroll progress

**Position**: Fixed at top, z-index 100

**Animation**:
```javascript
const scaleX = useSpring(scrollYProgress, {
  stiffness: 100,
  damping: 30,
  restDelta: 0.001
});
```

**Styling**:
- Height: 1px (4px on hover)
- Gradient: primary → blue → purple
- Origin: left (RTL: right)

### PageTransition

**Purpose**: Wrap pages for consistent transitions

**Variants**:
```javascript
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, duration: 0.4 },
  exit: { opacity: 0, y: -20, duration: 0.3 }
}
```

---

## Spring Physics Configuration

### Standard Springs

**Default (UI elements)**:
```javascript
{ stiffness: 100, damping: 30 }
```

**Fast (buttons, hovers)**:
```javascript
{ stiffness: 400, damping: 30 }
```

**Smooth (parallax, scroll)**:
```javascript
{ stiffness: 100, damping: 30, restDelta: 0.001 }
```

---

## Easing Functions

### Custom Cubic-Bezier

**Premium easing** (used throughout):
```javascript
ease: [0.22, 1, 0.36, 1]
```

This creates a smooth "ease-out-expo" feel similar to:
- Apple.com animations
- Stripe.com transitions
- Linear.app motion

---

## Accessibility

### Reduced Motion Support

All animations automatically respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Framer Motion automatically handles this via:
```javascript
const shouldReduceMotion = useReducedMotion();
```

### Keyboard Navigation

All interactive elements maintain:
- Visible focus states
- Tab order
- Skip links
- ARIA labels

---

## Performance Optimization

### GPU Acceleration

**Properties that trigger GPU**:
- `transform`
- `opacity`
- `filter`

**Avoid animating**:
- `width`, `height`
- `top`, `left`
- `margin`, `padding`

### Will-Change

Used sparingly on:
- Parallax elements
- Carousel slides
- Scroll-triggered content

```jsx
<motion.div style={{ willChange: 'transform' }}>
```

### Layout Shift Prevention

All animated elements have:
- Fixed dimensions
- `aspect-ratio` for images
- Skeleton loaders
- Proper spacing

---

## Testing Animations

### Visual Regression

```bash
npm run test:visual
```

### Performance Profiling

1. Open Chrome DevTools
2. Performance tab
3. Record while scrolling
4. Check for:
   - 60fps maintenance
   - Long tasks < 50ms
   - Layout shifts = 0

### Animation Testing

```javascript
// Test stagger timing
expect(element).toHaveStyle({ opacity: 0 });
await waitFor(() => {
  expect(element).toHaveStyle({ opacity: 1 });
}, { timeout: 1000 });
```

---

## Best Practices

### ✅ DO

- Use springs for natural motion
- Trigger animations on scroll
- Stagger list items
- Provide loading states
- Test on low-end devices
- Respect `prefers-reduced-motion`

### ❌ DON'T

- Animate layout properties
- Use `duration > 1s`
- Animate on every scroll frame
- Block user interaction
- Forget mobile performance
- Override user preferences

---

## Future Enhancements

### Planned

1. **Intersection Observer API** - Better scroll performance
2. **View Transitions API** - Native page transitions
3. **CSS `@starting-style`** - Entry animations without JS
4. **Scroll-driven animations** - Pure CSS scroll triggers

### Experimental

1. Physics-based springs (React Spring)
2. Gesture-based animations (swipe, drag)
3. 3D transforms for depth
4. Shared element transitions

---

## Quick Reference

### Import All Hooks

```javascript
import {
  useScrollProgress,
  useParallax,
  useFadeInOnScroll,
  useScrollDirection,
  fadeInUpVariants,
  staggerContainerVariants,
  pageTransitionVariants,
  smoothScrollTo
} from '@/hooks/useScrollAnimation';
```

### Import Components

```javascript
import PageTransition from '@/components/PageTransition';
import ScrollProgress from '@/components/ScrollProgress';
```

### Basic Scroll Animation

```jsx
const { ref, isInView } = useFadeInOnScroll();

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 40 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  Content
</motion.div>
```

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Web Animation Best Practices](https://web.dev/animations/)
- [Reduced Motion Guide](https://web.dev/prefers-reduced-motion/)
- [Animation Performance](https://web.dev/animations-guide/)
