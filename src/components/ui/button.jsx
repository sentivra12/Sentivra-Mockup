import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

/**
 * Button — SP brand edition
 *
 * Variants:
 *   default   — deep-emerald gradient, white text (primary CTA)
 *   secondary — glass with brand border
 *   outline   — brand-bordered, transparent fill
 *   outline-white — white border/text (for inverse/dark surfaces)
 *   ghost     — transparent, brand hover
 *   destructive — red
 *   link      — underline
 *   light     — white fill, dark text (inverse CTA)
 *
 * Contrast audit (WCAG AA ≥ 4.5:1 for normal text):
 *   default:  white on #055A4F  → 7.3:1 ✓
 *   outline:  #055A4F on white  → 7.3:1 ✓
 *   outline-white: white on dark surface ≥ 4.5:1 ✓ (caller ensures bg)
 *   light:    #02231E on white  → 15:1 ✓
 */
const buttonVariants = cva(
  // Base — always full final state; never opacity-0
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-xl text-sm font-semibold',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary — deep emerald gradient with shine
        default: [
          'bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800',
          'text-white shadow-md shadow-brand-900/30',
          'hover:from-brand-500 hover:via-brand-600 hover:to-brand-700',
          'hover:shadow-lg hover:shadow-brand-700/40',
          'active:scale-[0.98]',
        ].join(' '),

        // Secondary — glass with brand border
        secondary: [
          'bg-brand-50 dark:bg-brand-900/40',
          'text-brand-700 dark:text-brand-300',
          'border border-brand-200 dark:border-brand-700',
          'hover:bg-brand-100 dark:hover:bg-brand-800/60',
          'hover:border-brand-400 dark:hover:border-brand-500',
        ].join(' '),

        // Outline — brand-bordered
        outline: [
          'border-2 border-brand-600 dark:border-brand-400',
          'text-brand-700 dark:text-brand-300',
          'bg-transparent',
          'hover:bg-brand-600 dark:hover:bg-brand-700',
          'hover:text-white',
        ].join(' '),

        // Outline-white — for use on dark/inverse surfaces
        'outline-white': [
          'border-2 border-white/70',
          'text-white',
          'bg-white/08',
          'backdrop-blur-sm',
          'hover:bg-white/15 hover:border-white',
        ].join(' '),

        // Ghost
        ghost: [
          'text-brand-700 dark:text-brand-300',
          'hover:bg-brand-50 dark:hover:bg-brand-900/40',
          'hover:text-brand-800 dark:hover:text-brand-200',
        ].join(' '),

        // Destructive
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'shadow-sm',
        ].join(' '),

        // Link
        link: 'text-brand-600 dark:text-brand-400 underline-offset-4 hover:underline p-0 h-auto',

        // Light — white fill for inverse CTA
        light: [
          'bg-white text-brand-900',
          'shadow-md shadow-brand-900/20',
          'hover:bg-brand-50',
          'hover:shadow-lg',
          'active:scale-[0.98]',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-9 px-4 py-1.5 text-xs rounded-lg',
        lg:      'h-12 px-7 py-3 text-base rounded-xl',
        xl:      'h-14 px-9 py-3.5 text-lg rounded-2xl',
        icon:    'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
