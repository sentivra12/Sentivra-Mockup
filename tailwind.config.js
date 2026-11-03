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
			colors: {
				// Frosted Aura Palette - Direct hex values
				'primary': {
					DEFAULT: '#5C7E8F',
					strong: '#476574',
					deep: '#1F3440',
					foreground: '#FFFFFF',
				},
				'frost': {
					DEFAULT: '#D4DDE2',
					soft: '#EEF2F4',
				},
				'text-muted': '#5E6A71',
				'muted-color': '#A2A2A2',
				
				// Shadcn semantic tokens - mapped to CSS variables
				border: 'hsl(0 0% 83%)', // #D4DDE2 approximation
				input: 'hsl(0 0% 83%)',
				ring: 'hsl(199 23% 46%)', // #5C7E8F approximation
				background: 'hsl(0 0% 100%)',
				foreground: 'hsl(200 35% 19%)', // #1F3440 approximation
				secondary: {
					DEFAULT: 'hsl(200 26% 94%)', // #EEF2F4 approximation
					foreground: 'hsl(200 35% 19%)',
				},
				muted: {
					DEFAULT: 'hsl(200 26% 94%)',
					foreground: 'hsl(199 10% 39%)', // #5E6A71 approximation
				},
				accent: {
					DEFAULT: 'hsl(200 26% 94%)',
					foreground: 'hsl(200 35% 19%)',
				},
				popover: {
					DEFAULT: 'hsl(0 0% 100%)',
					foreground: 'hsl(200 35% 19%)',
				},
				card: {
					DEFAULT: 'hsl(0 0% 100%)',
					foreground: 'hsl(200 35% 19%)',
				},
				destructive: {
					DEFAULT: 'hsl(0 84% 60%)', // #EF4444
					foreground: 'hsl(0 0% 100%)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			boxShadow: {
				'card': '0 1px 3px 0 rgba(92, 126, 143, 0.12), 0 1px 2px 0 rgba(92, 126, 143, 0.06)',
				'card-hover': '0 4px 6px -1px rgba(92, 126, 143, 0.14), 0 2px 4px -1px rgba(92, 126, 143, 0.08)',
				'dropdown': '0 10px 15px -3px rgba(92, 126, 143, 0.14), 0 4px 6px -2px rgba(92, 126, 143, 0.08)',
				'lg-primary': '0 10px 20px -5px rgba(92, 126, 143, 0.18)',
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
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
