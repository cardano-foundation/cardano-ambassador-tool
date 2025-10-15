import { cn } from '@/utils/utils';
import { X } from 'lucide-react';
import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'inactive' | 'error' | 'warning' ;
  size?: 'sm' | 'md';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  onClick?: () => void;
}

export default function Chip({
  children,
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  className,
  onClick,
}: ChipProps) {
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-2 overflow-hidden rounded-3xl font-['Chivo'] leading-none font-normal shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] outline outline-1 outline-offset-[-1px]",

        {
          'px-2.5 py-1 text-xs': size === 'sm',
          'px-3.5 py-1.5 text-xs': size === 'md',
        },

        {
          'outline-primary-base text-primary-base bg-rose-50':
            variant === 'default',
          'bg-emerald-50 text-emerald-400 outline-emerald-400':
            variant === 'success',
          'bg-zinc-50 text-zinc-400 outline-zinc-400': variant === 'inactive',
          'outline-primary-base text-primary-base bg-pink-100':
            variant === 'error',
          'bg-orange-50 text-amber-500 outline-amber-500':
            variant === 'warning',
        },

        onClick && 'cursor-pointer transition-opacity hover:opacity-80',

        className,
      )}
      onClick={onClick}
    >
      <span className="text-center">{children}</span>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="hover:bg-opacity-10 ml-1 flex h-3 w-3 items-center justify-center rounded-full transition-colors hover:bg-black"
          aria-label="Remove chip"
        >
          <X className="text-muted-foreground h-2 w-2" />
        </button>
      )}
    </div>
  );
}
