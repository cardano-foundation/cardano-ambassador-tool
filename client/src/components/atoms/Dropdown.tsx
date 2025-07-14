"use client";
import React, { useState } from "react";
import { cn } from "@/utils/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "relative inline-block text-left w-full min-w-0 sm:min-w-[200px]",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "inline-flex w-full justify-between items-center rounded-md border px-3 py-4 text-sm transition-colors focus-visible:outline-none",
          "bg-background  dark:bg-card border-border",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && " ",
        )}
      >
        <span
          className={cn(
            selectedOption ? "text-foreground" : "text-muted-foreground",
            "truncate mr-2",
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            "h-4 w-4 transition-transform text-muted-foreground flex-shrink-0",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-full min-w-0 sm:min-w-[200px] origin-top rounded-md bg-background shadow-lg border border-border">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full justify-between items-center px-4 py-3 text-left text-sm transition-colors",
                  "text-muted-foreground hover:bg-muted",
                  value === option.value && "bg-sunset-100 text-sunset-500",
                )}
              >
                <span className="flex-1 truncate mr-2">{option.label}</span>
                {value === option.value && (
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
