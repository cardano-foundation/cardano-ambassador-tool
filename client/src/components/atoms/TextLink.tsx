import { cn } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';

interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  variant?: 'solid' | 'dotted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TextLink({
  href,
  children,
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-rose-500 font-medium underline underline-offset-4 transition-colors duration-200',
        'hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',

        {
          'decoration-solid': variant === 'solid',
          'decoration-dotted': variant === 'dotted',
        },

        {
          'text-sm': size === 'sm' || size === 'md',
          'text-base': size === 'lg',
        },

        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}