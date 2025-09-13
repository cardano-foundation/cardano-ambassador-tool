"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/utils/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <button
  role="switch"
  aria-checked={isChecked}
  disabled={disabled}
  onClick={handleToggle}
  style={{ width: '44px', height: '24px', minWidth: '44px', minHeight: '24px' }}
  className={cn(
    "inline-flex items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out flex-shrink-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isChecked ? "bg-primary-base" : "bg-gray-300 dark:bg-black-500",
    disabled && "opacity-70 cursor-not-allowed bg-gray-300 dark:bg-black-200",
    className
  )}
>
  <span
    style={{ width: '20px', height: '20px' }}
    className={cn(
      "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
      disabled ? "bg-gray-200" : "bg-white",
      isChecked ? "translate-x-5" : "translate-x-0"
    )}
  />
</button>
  );
}