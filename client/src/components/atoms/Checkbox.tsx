"use client";
import React, { useState } from "react";
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
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-md border-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        isChecked || indeterminate
          ? "bg-primary-500 border-primary-500 text-white"
          : "border-border bg-white",

        isChecked || indeterminate
          ? "dark:bg-primary-500 dark:border-primary-500"
          : "dark:border-border dark:bg-neutral-700",

        disabled && "opacity-50 cursor-not-allowed",

        className
      )}
    >
      {isChecked && !indeterminate && (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
        </svg>
      )}
      {indeterminate && (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
        </svg>
      )}
    </button>
  );
}
