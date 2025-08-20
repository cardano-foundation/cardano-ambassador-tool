import React from 'react';
import { cn } from '@/utils/utils';
import { X } from 'lucide-react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'inactive' | 'error' | 'warning';
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
        "inline-flex justify-center items-center gap-2 overflow-hidden rounded-3xl shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] outline outline-1 outline-offset-[-1px] font-['Chivo'] font-normal leading-none",

        {
          'px-2.5 py-1 text-xs': size === 'sm',
          'px-3.5 py-1.5 text-xs': size === 'md',
        },

        {
          'bg-rose-50 outline-rose-500 text-rose-500': variant === 'default',
          'bg-emerald-50 outline-emerald-400 text-emerald-400': variant === 'success',
          'bg-stone-50 outline-zinc-400 text-zinc-400': variant === 'inactive',
          'bg-pink-100 outline-rose-500 text-rose-500': variant === 'error',
          'bg-orange-50 outline-amber-500 text-amber-500': variant === 'warning',
        },

        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',

        className
      )}
      onClick={onClick}
    >
      <span className="text-center">{children}</span>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex items-center justify-center w-3 h-3 ml-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
          aria-label="Remove chip"
        >
          <X className="w-2 h-2 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}