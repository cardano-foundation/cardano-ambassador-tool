import { cn } from '@/utils/utils';
import { HTMLAttributes } from 'react';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: '1' | '2' | '3' | '4' | '5' | '6';
}

const titleSizes = {
  '1': 'text-[72px] leading-[68px]',
  '2': 'text-[48px] leading-[52px]',
  '3': 'text-[44px] leading-[52px]',
  '4': 'text-[40px] leading-[44px]',
  '5': 'text-[32px] leading-[40px]',
  '6': 'text-[27px] leading-[32px]',
  '7': 'text-[24px] leading-[32px]',
} as const;

export default function Title({
  level = '1',
  className,
  children,
  ...props
}: TitleProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag
      className={cn('font-bold tracking-normal', titleSizes[level], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
