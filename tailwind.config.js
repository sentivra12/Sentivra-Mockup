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
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: [
					'Inter',
					'IBM Plex Sans Arabic',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'sans-serif',
				],
				display: [
					'Inter',
					'IBM Plex Sans Arabic',
					'system-ui',
					'sans-serif',
				],
			},
			colors: {
				// Hero-specific tokens (cinematic dark hero)
				'hero-deep': 'var(--hero-deep)',
				'hero-grade': 'var(--hero-grade)',
				'hero-frost': 'var(--hero-frost)',
				'hero-headline': 'var(--hero-headline)',
				'hero-accent': 'var(--hero-accent)',
				'hero-accent-light': 'var(--hero-accent-light)',
				'hero-pill-bg': 'var(--hero-pill-bg)',
				'hero-pill-border': 'var(--hero-pill-border)',
				'hero-chip-bg': 'var(--hero-chip-bg)',
				'hero-chip-border': 'var(--hero-chip-border)',
				'hero-vignette': 'var(--hero-vignette)',
				
				// Impact section tokens (dark band)
				'impact-start': 'var(--impact-start)',
				'impact-mid': 'var(--impact-mid)',
				'impact-end': 'var(--impact-end)',
				'impact-accent': 'var(--impact-accent)',
				'impact-muted': 'var(--impact-muted)',
				'impact-divider': 'var(--impact-divider)',
				'impact-icon-glow': 'var(--impact-icon-glow)',
				
				// Marquee band tokens
				'marquee-deep': 'var(--marquee-deep)',
				'marquee-text': 'var(--marquee-text)',
				'marquee-accent': 'var(--marquee-accent)',
				'marquee-glow': 'var(--marquee-glow)',
				'marquee-chip': 'var(--marquee-chip)',
				'marquee-chip-border': 'var(--marquee-chip-border)',
				'marquee-chip-hover': 'var(--marquee-chip-hover)',
				
				// Testimonials tokens
				'testimonial-surface': 'var(--testimonial-surface)',
				'testimonial-card': 'var(--testimonial-card)',
				'testimonial-border': 'var(--testimonial-border)',
				'testimonial-text': 'var(--testimonial-text)',
				'testimonial-name': 'var(--testimonial-name)',
				'testimonial-meta': 'var(--testimonial-meta)',
				'testimonial-accent': 'var(--testimonial-accent)',
				'testimonial-glow': 'var(--testimonial-glow)',
				'testimonial-heading': 'var(--testimonial-heading)',
				'testimonial-subtitle': 'var(--testimonial-subtitle)',
				'testimonial-avatar': 'var(--testimonial-avatar)',
				'testimonial-ring': 'var(--testimonial-ring)',
				'testimonial-nav-bg': 'var(--testimonial-nav-bg)',
				'testimonial-nav-border': 'var(--testimonial-nav-border)',
				'testimonial-nav-hover': 'var(--testimonial-nav-hover)',
				'testimonial-nav-icon': 'var(--testimonial-nav-icon)',
				'testimonial-dot': 'var(--testimonial-dot)',
				'testimonial-dot-hover': 'var(--testimonial-dot-hover)',
				'testimonial-progress-bg': 'var(--testimonial-progress-bg)',
				
				// CTA tokens
				'cta-deep': 'var(--cta-deep)',
				'cta-hairline': 'var(--cta-hairline)',
				'cta-aurora-1': 'var(--cta-aurora-1)',
				'cta-aurora-2': 'var(--cta-aurora-2)',
				'cta-accent': 'var(--cta-accent)',
				'cta-heading': 'var(--cta-heading)',
				'cta-subtitle': 'var(--cta-subtitle)',
				'cta-card-bg': 'var(--cta-card-bg)',
				'cta-card-border': 'var(--cta-card-border)',
				'cta-card-heading': 'var(--cta-card-heading)',
				'cta-channel-bg': 'var(--cta-channel-bg)',
				'cta-channel-border': 'var(--cta-channel-border)',
				'cta-channel-border-hover': 'var(--cta-channel-border-hover)',
				'cta-label': 'var(--cta-label)',
				'cta-value': 'var(--cta-value)',
				'cta-icon-bg': 'var(--cta-icon-bg)',
				'cta-icon-hover': 'var(--cta-icon-hover)',
				'cta-icon': 'var(--cta-icon)',
				'cta-copy': 'var(--cta-copy)',
				'cta-copy-hover': 'var(--cta-copy-hover)',
				'cta-glass-bg': 'var(--cta-glass-bg)',
				'cta-glass-border': 'var(--cta-glass-border)',
				'cta-glass-hover': 'var(--cta-glass-hover)',
				'cta-glass-text': 'var(--cta-glass-text)',
				
				// Inverse surface tokens (always dark)
				'inverse-bg': 'var(--inverse-bg)',
				'inverse-bg-gradient-start': 'var(--inverse-bg-gradient-start)',
				'inverse-bg-gradient-end': 'var(--inverse-bg-gradient-end)',
				'inverse-bg-raised': 'var(--inverse-bg-raised)',
				'inverse-fg': 'var(--inverse-fg)',
				'inverse-fg-muted': 'var(--inverse-fg-muted)',
				'inverse-fg-subtle': 'var(--inverse-fg-subtle)',
				'inverse-border': 'var(--inverse-border)',
				'inverse-border-subtle': 'var(--inverse-border-subtle)',
				'inverse-hairline': 'var(--inverse-hairline)',
				'inverse-accent': 'var(--inverse-accent)',
				'inverse-accent-hover': 'var(--inverse-accent-hover)',
				'inverse-accent-strong': 'var(--inverse-accent-strong)',
				'inverse-glass-bg': 'var(--inverse-glass-bg)',
				'inverse-glass-border': 'var(--inverse-glass-border)',
				'inverse-glass-hover': 'var(--inverse-glass-hover)',
				'inverse-button-primary-bg': 'var(--inverse-button-primary-bg)',
				'inverse-button-primary-fg': 'var(--inverse-button-primary-fg)',
				'inverse-button-primary-hover': 'var(--inverse-button-primary-hover)',
				'inverse-button-secondary-bg': 'var(--inverse-button-secondary-bg)',
				'inverse-button-secondary-border': 'var(--inverse-button-secondary-border)',
				'inverse-button-secondary-hover': 'var(--inverse-button-secondary-hover)',
				'inverse-ring': 'var(--inverse-ring)',
				'inverse-input-bg': 'var(--inverse-input-bg)',
				'inverse-input-border': 'var(--inverse-input-border)',
				'inverse-input-focus': 'var(--inverse-input-focus)',
				'inverse-grid': 'var(--inverse-grid)',
				'inverse-glow': 'var(--inverse-glow)',
				
				// Semantic color system - uses CSS variables
				'color-primary': 'var(--color-primary)',
				'color-primary-strong': 'var(--color-primary-strong)',
				'color-primary-deep': 'var(--color-primary-deep)',
				'color-primary-foreground': 'var(--color-primary-foreground)',
				
				'color-background': 'var(--color-background)',
				'color-foreground': 'var(--color-foreground)',
				'color-surface': 'var(--color-surface)',
				'color-surface-raised': 'var(--color-surface-raised)',
				
				'color-border': 'var(--color-border)',
				'color-border-strong': 'var(--color-border-strong)',
				
				'color-text': 'var(--color-text)',
				'color-text-muted': 'var(--color-text-muted)',
				'color-text-subtle': 'var(--color-text-subtle)',
				
				// Legacy Frosted Aura (mapped to CSS variables for theme support)
				'primary': {
					DEFAULT: 'var(--color-primary)',
					strong: 'var(--color-primary-strong)',
					dark: 'var(--color-primary-deep)', // alias for deep
					deep: 'var(--color-primary-deep)',
					foreground: 'var(--color-primary-foreground)',
				},
				// Flat mappings for classes like bg-primary-strong, bg-primary-dark
				'primary-strong': 'var(--color-primary-strong)',
				'primary-dark': 'var(--color-primary-deep)',
				'primary-deep': 'var(--color-primary-deep)',
				'frost': {
					DEFAULT: 'var(--color-frost)',
					soft: 'var(--color-frost-soft)',
				},
				'text-muted': 'var(--color-text-muted)',
				'muted-color': 'var(--color-text-muted)',
				
				// Shadcn semantic tokens (excluding primary which conflicts with Frosted Aura)
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// primary: removed - using Frosted Aura primary instead
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'card': 'var(--shadow-md)',
				'card-hover': 'var(--shadow-lg)',
				'dropdown': 'var(--shadow-xl)',
				'glow-sm': '0 0 20px rgba(143, 179, 196, 0.3)',
				'glow-md': '0 0 40px rgba(143, 179, 196, 0.4)',
			},
			textColor: {
				'heading': '#1F3440', // primary-deep for headlines
				'body': '#5E6A71', // text-muted for body text
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'shimmer': {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 3s linear infinite',
			},
		},
	},
	plugins: [
		require('tailwindcss-animate'),
		// Logical Properties Plugin for RTL Support
		function({ addUtilities, theme }) {
			const spacing = theme('spacing');
			const logicalUtilities = {};

			// Generate margin-inline utilities (ms, me)
			Object.entries(spacing).forEach(([key, value]) => {
				logicalUtilities[`.ms-${key}`] = { 'margin-inline-start': value };
				logicalUtilities[`.me-${key}`] = { 'margin-inline-end': value };
			});

			// Generate padding-inline utilities (ps, pe)
			Object.entries(spacing).forEach(([key, value]) => {
				logicalUtilities[`.ps-${key}`] = { 'padding-inline-start': value };
				logicalUtilities[`.pe-${key}`] = { 'padding-inline-end': value };
			});

			// Positioning utilities
			logicalUtilities[`.start-0`] = { 'inset-inline-start': '0' };
			logicalUtilities[`.end-0`] = { 'inset-inline-end': '0' };
			logicalUtilities[`.start-auto`] = { 'inset-inline-start': 'auto' };
			logicalUtilities[`.end-auto`] = { 'inset-inline-end': 'auto' };

			Object.entries(spacing).forEach(([key, value]) => {
				logicalUtilities[`.start-${key}`] = { 'inset-inline-start': value };
				logicalUtilities[`.end-${key}`] = { 'inset-inline-end': value };
			});

			// Border utilities
			logicalUtilities[`.border-s`] = { 'border-inline-start-width': '1px' };
			logicalUtilities[`.border-e`] = { 'border-inline-end-width': '1px' };
			logicalUtilities[`.border-s-0`] = { 'border-inline-start-width': '0' };
			logicalUtilities[`.border-e-0`] = { 'border-inline-end-width': '0' };
			logicalUtilities[`.border-s-2`] = { 'border-inline-start-width': '2px' };
			logicalUtilities[`.border-e-2`] = { 'border-inline-end-width': '2px' };

			// Rounded corners
			logicalUtilities[`.rounded-s`] = {
				'border-start-start-radius': theme('borderRadius.DEFAULT'),
				'border-end-start-radius': theme('borderRadius.DEFAULT'),
			};
			logicalUtilities[`.rounded-e`] = {
				'border-start-end-radius': theme('borderRadius.DEFAULT'),
				'border-end-end-radius': theme('borderRadius.DEFAULT'),
			};
			logicalUtilities[`.rounded-s-lg`] = {
				'border-start-start-radius': theme('borderRadius.lg'),
				'border-end-start-radius': theme('borderRadius.lg'),
			};
			logicalUtilities[`.rounded-e-lg`] = {
				'border-start-end-radius': theme('borderRadius.lg'),
				'border-end-end-radius': theme('borderRadius.lg'),
			};

			// Text alignment
			logicalUtilities[`.text-start`] = { 'text-align': 'start' };
			logicalUtilities[`.text-end`] = { 'text-align': 'end' };

			addUtilities(logicalUtilities);
		},
	],
};
