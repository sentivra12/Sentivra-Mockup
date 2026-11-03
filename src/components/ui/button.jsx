import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary-strong text-white hover:bg-primary-deep',
				destructive: 'bg-destructive text-white hover:bg-destructive/90',
				outline: 'border-2 border-primary-strong text-primary-strong bg-white hover:bg-primary-strong hover:text-white',
				'outline-white': 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary-deep',
				secondary: 'bg-frost-soft text-primary-deep hover:bg-frost',
				ghost: 'hover:bg-frost-soft hover:text-primary-deep',
				link: 'text-primary underline-offset-4 hover:underline',
				light: 'bg-white text-primary-deep hover:bg-frost-soft',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };


