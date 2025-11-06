'use client';
import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  id?: string;
}

export default function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  indeterminate = false,
  className,
  id = 'checkbox',
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only" // Hide the default checkbox
      />
      <label
        htmlFor={id}
        className={cn(
          'relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200',
          checked
            ? 'bg-primary-base border-primary-base text-white'
            : ' border-gray-300 hover:border-gray-400',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {checked && (
          <Check className="h-3 w-3 text-white stroke-[4]" />
        )}
      </label>
    </div>
  );
}
