import * as React from 'react'
import { twMerge } from 'tailwind-merge'

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={twMerge('bg-white/10 backdrop-blur rounded-2xl ring-1 ring-white/20', className)} {...props} />
}

export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={twMerge('p-6 pb-2', className)} {...props} />
}

export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={twMerge('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={twMerge('p-6 pt-0', className)} {...props} />
}


