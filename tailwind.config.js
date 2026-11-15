/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      /* ── Fonts ─────────────────────────────────────────────────────────── */
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'IBM Plex Sans Arabic',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Plus Jakarta Sans',
          'IBM Plex Sans Arabic',
          'system-ui',
          'sans-serif',
        ],
      },

      /* ── Brand colour scale ─────────────────────────────────────────────── */
      colors: {
        /* Static brand scale (always emerald, independent of theme) */
        brand: {
          50:  '#E6F7F3',
          100: '#C0EBE0',
          200: '#8FDBCA',
          300: '#55C8B1',
          400: '#26B59A',
          500: '#0D9E82',
          600: '#06796A',
          700: '#055A4F',
          800: '#044D40',
          900: '#02231E',
          950: '#01120F',
        },

        /* ── Semantic tokens — reference CSS vars so they flip with theme ── */
        'color-primary':          'var(--color-primary)',
        'color-primary-strong':   'var(--color-primary-strong)',
        'color-primary-deep':     'var(--color-primary-deep)',
        'color-primary-foreground': 'var(--color-primary-foreground)',

        'color-background':    'var(--color-background)',
        'color-foreground':    'var(--color-foreground)',
        'color-surface':       'var(--color-surface)',
        'color-surface-raised': 'var(--color-surface-raised)',

        'color-border':        'var(--color-border)',
        'color-border-strong': 'var(--color-border-strong)',

        'color-text':          'var(--color-text)',
        'color-text-muted':    'var(--color-text-muted)',
        'color-text-subtle':   'var(--color-text-subtle)',

        /* Frost aliases (kept for backward compat — resolve to brand tints) */
        frost: {
          DEFAULT: 'var(--color-frost)',
          soft:    'var(--color-frost-soft)',
        },
        'text-muted':  'var(--color-text-muted)',
        'muted-color': 'var(--color-text-muted)',

        /* ── Legacy flat aliases used widely in components ─────────────────── */
        primary: {
          DEFAULT:    'var(--color-primary)',
          strong:     'var(--color-primary-strong)',
          dark:       'var(--color-primary-deep)',
          deep:       'var(--color-primary-deep)',
          foreground: 'var(--color-primary-foreground)',
        },
        'primary-strong': 'var(--color-primary-strong)',
        'primary-dark':   'var(--color-primary-deep)',
        'primary-deep':   'var(--color-primary-deep)',

        /* ── Hero tokens ───────────────────────────────────────────────────── */
        'hero-deep':         'var(--hero-deep)',
        'hero-grade':        'var(--hero-grade)',
        'hero-frost':        'var(--hero-frost)',
        'hero-headline':     'var(--hero-headline)',
        'hero-accent':       'var(--hero-accent)',
        'hero-accent-light': 'var(--hero-accent-light)',
        'hero-pill-bg':      'var(--hero-pill-bg)',
        'hero-pill-border':  'var(--hero-pill-border)',
        'hero-chip-bg':      'var(--hero-chip-bg)',
        'hero-chip-border':  'var(--hero-chip-border)',

        /* ── Impact tokens ─────────────────────────────────────────────────── */
        'impact-start':     'var(--impact-start)',
        'impact-mid':       'var(--impact-mid)',
        'impact-end':       'var(--impact-end)',
        'impact-accent':    'var(--impact-accent)',
        'impact-muted':     'var(--impact-muted)',
        'impact-divider':   'var(--impact-divider)',
        'impact-icon-glow': 'var(--impact-icon-glow)',

        /* ── Marquee tokens ────────────────────────────────────────────────── */
        'marquee-deep':        'var(--marquee-deep)',
        'marquee-text':        'var(--marquee-text)',
        'marquee-accent':      'var(--marquee-accent)',
        'marquee-glow':        'var(--marquee-glow)',
        'marquee-chip':        'var(--marquee-chip)',
        'marquee-chip-border': 'var(--marquee-chip-border)',
        'marquee-chip-hover':  'var(--marquee-chip-hover)',

        /* ── Testimonial tokens ────────────────────────────────────────────── */
        'testimonial-surface':      'var(--testimonial-surface)',
        'testimonial-card':         'var(--testimonial-card)',
        'testimonial-border':       'var(--testimonial-border)',
        'testimonial-text':         'var(--testimonial-text)',
        'testimonial-name':         'var(--testimonial-name)',
        'testimonial-meta':         'var(--testimonial-meta)',
        'testimonial-accent':       'var(--testimonial-accent)',
        'testimonial-glow':         'var(--testimonial-glow)',
        'testimonial-heading':      'var(--testimonial-heading)',
        'testimonial-subtitle':     'var(--testimonial-subtitle)',
        'testimonial-avatar':       'var(--testimonial-avatar)',
        'testimonial-ring':         'var(--testimonial-ring)',
        'testimonial-nav-bg':       'var(--testimonial-nav-bg)',
        'testimonial-nav-border':   'var(--testimonial-nav-border)',
        'testimonial-nav-hover':    'var(--testimonial-nav-hover)',
        'testimonial-nav-icon':     'var(--testimonial-nav-icon)',
        'testimonial-dot':          'var(--testimonial-dot)',
        'testimonial-dot-hover':    'var(--testimonial-dot-hover)',
        'testimonial-progress-bg':  'var(--testimonial-progress-bg)',

        /* ── CTA tokens ────────────────────────────────────────────────────── */
        'cta-deep':                 'var(--cta-deep)',
        'cta-hairline':             'var(--cta-hairline)',
        'cta-aurora-1':             'var(--cta-aurora-1)',
        'cta-aurora-2':             'var(--cta-aurora-2)',
        'cta-accent':               'var(--cta-accent)',
        'cta-heading':              'var(--cta-heading)',
        'cta-subtitle':             'var(--cta-subtitle)',
        'cta-card-bg':              'var(--cta-card-bg)',
        'cta-card-border':          'var(--cta-card-border)',
        'cta-card-heading':         'var(--cta-card-heading)',
        'cta-channel-bg':           'var(--cta-channel-bg)',
        'cta-channel-border':       'var(--cta-channel-border)',
        'cta-channel-border-hover': 'var(--cta-channel-border-hover)',
        'cta-label':                'var(--cta-label)',
        'cta-value':                'var(--cta-value)',
        'cta-icon-bg':              'var(--cta-icon-bg)',
        'cta-icon-hover':           'var(--cta-icon-hover)',
        'cta-icon':                 'var(--cta-icon)',
        'cta-copy':                 'var(--cta-copy)',
        'cta-copy-hover':           'var(--cta-copy-hover)',
        'cta-glass-bg':             'var(--cta-glass-bg)',
        'cta-glass-border':         'var(--cta-glass-border)',
        'cta-glass-hover':          'var(--cta-glass-hover)',
        'cta-glass-text':           'var(--cta-glass-text)',

        /* ── Inverse surface tokens ────────────────────────────────────────── */
        'inverse-bg':                     'var(--inverse-bg)',
        'inverse-bg-gradient-start':      'var(--inverse-bg-gradient-start)',
        'inverse-bg-gradient-end':        'var(--inverse-bg-gradient-end)',
        'inverse-bg-raised':              'var(--inverse-bg-raised)',
        'inverse-fg':                     'var(--inverse-fg)',
        'inverse-fg-muted':               'var(--inverse-fg-muted)',
        'inverse-fg-subtle':              'var(--inverse-fg-subtle)',
        'inverse-border':                 'var(--inverse-border)',
        'inverse-border-subtle':          'var(--inverse-border-subtle)',
        'inverse-hairline':               'var(--inverse-hairline)',
        'inverse-accent':                 'var(--inverse-accent)',
        'inverse-accent-hover':           'var(--inverse-accent-hover)',
        'inverse-accent-strong':          'var(--inverse-accent-strong)',
        'inverse-glass-bg':               'var(--inverse-glass-bg)',
        'inverse-glass-border':           'var(--inverse-glass-border)',
        'inverse-glass-hover':            'var(--inverse-glass-hover)',
        'inverse-button-primary-bg':      'var(--inverse-button-primary-bg)',
        'inverse-button-primary-fg':      'var(--inverse-button-primary-fg)',
        'inverse-button-primary-hover':   'var(--inverse-button-primary-hover)',
        'inverse-button-secondary-bg':    'var(--inverse-button-secondary-bg)',
        'inverse-button-secondary-border':'var(--inverse-button-secondary-border)',
        'inverse-button-secondary-hover': 'var(--inverse-button-secondary-hover)',
        'inverse-ring':                   'var(--inverse-ring)',
        'inverse-input-bg':               'var(--inverse-input-bg)',
        'inverse-input-border':           'var(--inverse-input-border)',
        'inverse-input-focus':            'var(--inverse-input-focus)',
        'inverse-grid':                   'var(--inverse-grid)',
        'inverse-glow':                   'var(--inverse-glow)',

        /* ── shadcn semantic (HSL) ─────────────────────────────────────────── */
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      /* ── Border radius ──────────────────────────────────────────────────── */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      /* ── Spacing ────────────────────────────────────────────────────────── */
      spacing: { '18': '4.5rem', '88': '22rem', '128': '32rem' },

      /* ── Shadows (brand-tinted) ─────────────────────────────────────────── */
      boxShadow: {
        sm:           'var(--shadow-sm)',
        md:           'var(--shadow-md)',
        lg:           'var(--shadow-lg)',
        xl:           'var(--shadow-xl)',
        card:         'var(--shadow-md)',
        'card-hover': 'var(--shadow-lg)',
        dropdown:     'var(--shadow-xl)',
        /* Brand glow shadows */
        'glow-sm': '0 0 20px rgba(13,158,130,0.30)',
        'glow-md': '0 0 40px rgba(13,158,130,0.40)',
        'glow-lg': '0 0 60px rgba(13,158,130,0.35)',
        /* Sparkle glow */
        'sparkle': '0 0 24px rgba(178,240,224,0.60)',
      },

      /* ── Text colours ───────────────────────────────────────────────────── */
      textColor: {
        heading: 'var(--color-foreground)',
        body:    'var(--color-text-muted)',
      },

      /* ── Keyframes ──────────────────────────────────────────────────────── */
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: 0 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'sparkle-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%':       { opacity: '0.75', transform: 'scale(1.15) rotate(10deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:          'shimmer 3s linear infinite',
        'sparkle-pulse':  'sparkle-pulse 2.5s ease-in-out infinite',
        float:            'float 4s ease-in-out infinite',
        'pulse-slow':     'pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),

    /* Logical-property utilities for RTL support */
    function({ addUtilities, theme }) {
      const spacing = theme('spacing');
      const lu = {};

      Object.entries(spacing).forEach(([k, v]) => {
        lu[`.ms-${k}`] = { 'margin-inline-start': v };
        lu[`.me-${k}`] = { 'margin-inline-end': v };
        lu[`.ps-${k}`] = { 'padding-inline-start': v };
        lu[`.pe-${k}`] = { 'padding-inline-end': v };
        lu[`.start-${k}`] = { 'inset-inline-start': v };
        lu[`.end-${k}`]   = { 'inset-inline-end': v };
      });

      lu['.start-0']    = { 'inset-inline-start': '0' };
      lu['.end-0']      = { 'inset-inline-end': '0' };
      lu['.start-auto'] = { 'inset-inline-start': 'auto' };
      lu['.end-auto']   = { 'inset-inline-end': 'auto' };

      lu['.border-s']   = { 'border-inline-start-width': '1px' };
      lu['.border-e']   = { 'border-inline-end-width': '1px' };
      lu['.border-s-0'] = { 'border-inline-start-width': '0' };
      lu['.border-e-0'] = { 'border-inline-end-width': '0' };
      lu['.border-s-2'] = { 'border-inline-start-width': '2px' };
      lu['.border-e-2'] = { 'border-inline-end-width': '2px' };

      lu['.rounded-s']    = { 'border-start-start-radius': theme('borderRadius.DEFAULT'), 'border-end-start-radius': theme('borderRadius.DEFAULT') };
      lu['.rounded-e']    = { 'border-start-end-radius': theme('borderRadius.DEFAULT'), 'border-end-end-radius': theme('borderRadius.DEFAULT') };
      lu['.rounded-s-lg'] = { 'border-start-start-radius': theme('borderRadius.lg'), 'border-end-start-radius': theme('borderRadius.lg') };
      lu['.rounded-e-lg'] = { 'border-start-end-radius': theme('borderRadius.lg'), 'border-end-end-radius': theme('borderRadius.lg') };

      lu['.text-start'] = { 'text-align': 'start' };
      lu['.text-end']   = { 'text-align': 'end' };

      addUtilities(lu);
    },
  ],
};
