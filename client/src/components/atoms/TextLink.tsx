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
        'font-medium text-primary-base underline underline-offset-4 transition-colors duration-200',
        'hover:text-primary-base focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:outline-none',

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
