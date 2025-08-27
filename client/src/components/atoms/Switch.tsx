"use client";
import React, { useState } from "react";
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
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        isChecked ? "bg-primary-500" : "bg-gray-300 dark:bg-black-500",

        disabled &&
          "opacity-70 cursor-not-allowed bg-gray-300 dark:bg-black-200",

        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
          disabled ? "bg-gray-200" : "bg-white",
          isChecked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
