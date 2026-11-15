import { motion } from 'framer-motion';

/**
 * GlassCard — SP brand edition
 * Glass morphism card: brand-tinted backdrop, emerald border on hover.
 */
export function GlassCard({
  children,
  className = '',
  hover = false,
  as: Component = 'div',
  ...props
}) {
  const base = [
    'relative overflow-hidden',
    'backdrop-blur-xl',
    'bg-white/80 dark:bg-brand-900/30',
    'border border-brand-100/60 dark:border-brand-700/40',
    'rounded-2xl',
    'shadow-md dark:shadow-lg',
    'transition-all duration-300',
  ].join(' ');

  const hoverCls = hover
    ? 'hover:shadow-glow-sm hover:border-brand-400/50 dark:hover:border-brand-500/50 hover:scale-[1.02]'
    : '';

  if (Component === motion.div || Component === motion.article) {
    return (
      <Component className={`${base} ${hoverCls} ${className}`} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component className={`${base} ${hoverCls} ${className}`} {...props}>
      {children}
    </Component>
  );
}

/**
 * GlassChip — small brand glass badge/chip
 */
export function GlassChip({ children, className = '', icon: Icon }) {
  return (
    <div
      className={[
        'inline-flex items-center gap-2 px-4 py-2',
        'backdrop-blur-md',
        'bg-white/70 dark:bg-brand-900/20',
        'border border-brand-200/60 dark:border-brand-700/40',
        'rounded-full',
        'text-sm font-medium text-brand-700 dark:text-brand-300',
        'shadow-sm',
        className,
      ].join(' ')}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </div>
  );
}
