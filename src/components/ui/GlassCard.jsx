import { motion } from 'framer-motion';

/**
 * GlassCard - Glassmorphism card component
 * Features: backdrop blur, frosted glass effect, theme-aware
 */
export function GlassCard({
  children,
  className = '',
  hover = false,
  as: Component = 'div',
  ...props
}) {
  const baseClasses = `
    relative overflow-hidden
    backdrop-blur-xl
    bg-color-background/80 dark:bg-color-background/5
    border border-white/20 dark:border-white/10
    rounded-2xl
    shadow-lg dark:shadow-2xl
    transition-all duration-300
  `;

  const hoverClasses = hover
    ? 'hover:shadow-xl dark:hover:shadow-glow-sm hover:scale-[1.02] hover:bg-color-background/90 dark:hover:bg-color-background/10'
    : '';

  if (Component === motion.div || Component === motion.article) {
    return (
      <Component className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </Component>
  );
}

/**
 * GlassChip - Small glass badge/chip component
 */
export function GlassChip({ children, className = '', icon: Icon }) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2
        backdrop-blur-md
        bg-color-background/70 dark:bg-color-background/10
        border border-white/30 dark:border-white/20
        rounded-full
        text-sm font-medium text-color-text dark:text-white
        shadow-sm
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </div>
  );
}
