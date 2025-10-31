import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50 disabled:cursor-not-allowed',
	{
		variants: {
			variant: {
				default: 'bg-indigo-700 text-white hover:opacity-90',
				secondary: 'bg-white text-indigo-700 hover:opacity-90',
				ghost: 'bg-transparent text-white hover:bg-white/10',
			},
			size: {
				sm: 'h-9 px-3',
				md: 'h-10 px-4',
				lg: 'h-11 px-5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
		asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={twMerge(buttonVariants({ variant, size }), className)}
				ref={ref as any}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'


