import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700',
        outline: 'border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50',
        secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
        ghost: 'text-slate-600 hover:bg-brand-50 hover:text-brand-800',
        link: 'text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'min-h-10 rounded-lg px-3 text-xs',
        lg: 'min-h-12 rounded-[14px] px-6',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = 'Button';
