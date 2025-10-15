import { cn } from '@/utils/utils';
import { HTMLAttributes } from 'react';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: '1' | '2' | '3' | '4' | '5' | '6';
}

const titleSizes = {
  '1': 'text-[48px] leading-[52px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[68px]',
  '2': 'text-[36px] leading-[40px] sm:text-[42px] sm:leading-[46px] lg:text-[48px] lg:leading-[52px]',
  '3': 'text-[32px] leading-[36px] sm:text-[38px] sm:leading-[44px] lg:text-[44px] lg:leading-[52px]',
  '4': 'text-[28px] leading-[32px] sm:text-[34px] sm:leading-[38px] lg:text-[40px] lg:leading-[44px]',
  '5': 'text-[24px] leading-[28px] sm:text-[28px] sm:leading-[34px] lg:text-[27px] lg:leading-[27px]',
  // '6': 'text-[20px] leading-[24px] sm:text-[24px] sm:leading-[28px] lg:text-[27px] lg:leading-[27px]',
  '6': 'text-[16px] leading-[20px]',
} as const;

export default function Title({
  level = '1',
  className,
  children,
  ...props
}: TitleProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' ;

  return (
    <Tag
      className={cn('font-bold tracking-normal', titleSizes[level], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
