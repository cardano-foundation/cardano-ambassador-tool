'use client';
import { useEffect, useRef } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export default function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  indeterminate = false,
  className,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <input
      id="checkbox"
      type="checkbox"
      className="checked:bg-primary-400 focus:border-primary-300 focus:ring-primary-300/20 hover:border-primary-300 accent-primary-400 rounded-md border text-sm leading-none font-normal text-white! transition-colors focus:ring-2 focus:outline-none"
    />
  );
}
