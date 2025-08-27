import React from 'react';
import { cn } from '@/utils/utils';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function Radio({ className, ...props }: RadioProps) {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="radio"
        className={cn(
          "peer sr-only",
          className
        )}
        {...props}
      />
      <div className={cn(
        "w-6 h-6",
        "rounded-full",
        "border",
        "border-border dark:border-primary-base",
        "bg-background",
        "peer-checked:border-primary",
        "peer-focus-visible:ring-1",
        "peer-focus-visible:ring-primary",
        "peer-checked:bg-primary",
        "peer-focus-visible:ring-offset-2",
        "peer-focus-visible:ring-offset-background",
        "peer-disabled:opacity-50",
        "peer-disabled:cursor-not-allowed",
        "transition-all",
        "duration-200",
        "flex",
        "items-center",
        "justify-center",

        "after:content-['']",
        "after:w-3.5",
        "after:h-3.5",
        "after:rounded-full",
        "after:bg-white",
        "after:scale-0",
        "peer-checked:after:scale-100",
        "after:transition-transform",
        "after:duration-200"
      )} />
    </div>
  );
}
