"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/utils/utils";

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
//     <input
//   type="checkbox"
//   class="h-5 w-5 accent-white rounded-lg border border-border text-white focus:ring-primary-500 dark:border-border dark:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
// />
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className={cn(
        "h-5 w-5 accent-primary-400 rounded-lg  text-white focus:ring-primary-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}
