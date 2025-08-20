import { cn } from '@/utils/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'nav'  | 'warning' | 'success' | 'primary-light';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'full';
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  rounded = 'lg',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variant === 'nav'
          ? 'flex items-start justify-start font-medium transition-all duration-200 ease-in-out'
          : 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out',

        'focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'cursor-pointer disabled:pointer-events-none disabled:opacity-50',

        variant !== 'nav' && 'hover:scale-[1.02] active:scale-[0.98]',

        variant === 'nav'
          ? {}
          : {
              'px-4 py-2 text-sm': size === 'sm',
              'px-6 py-3 text-sm': size === 'md',
              'px-8 py-4 text-base': size === 'lg',
            },

        {
          'rounded-lg': rounded === 'lg',
          'rounded-full': rounded === 'full',
        },

        {
          'bg-primary-base hover:bg-primary-400 primary text-white':
            variant === 'primary',
          'bg-primary-50 text-primary-base border-primary-base secondary border-2':
            variant === 'secondary',
          'border-primary-base text-primary-base border-2':
            variant === 'outline',
          'text-black-500 border-white-400 border': variant === 'ghost',
          'hover:bg-muted text-foreground bg-white-400': variant === 'nav',

          'bg-primary-200 hover:bg-primary-400 primary text-white':
              variant === 'primary-light',
          'bg-amber-500 hover:bg-amber-600 primary text-white':
             variant === 'warning',
           'bg-emerald-400 hover:bg-emerald-500 primary text-white':
              variant === 'success',
        },
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
