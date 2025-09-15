"use client";
import React, { useState, useEffect, useRef } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
    // Return focus to button after selection
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "relative inline-block text-left w-full min-w-0 sm:min-w-[200px]",
        className
      )}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex w-full justify-between items-center rounded-md border px-3 py-4 text-sm transition-colors focus-visible:outline-none cursor-pointer",
          "bg-background border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
          disabled && "opacity-50 cursor-not-allowed hover:border-border",
          isOpen && "border-primary ring-2 ring-primary/20"
        )}
      >
        <span
          className={cn(
            selectedOption ? "text-foreground" : "text-muted-foreground",
            "truncate mr-2"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            "h-4 w-4 transition-transform text-muted-foreground flex-shrink-0",
            isOpen && "rotate-180"
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
        <div className="absolute left-0 right-0 z-[9999] mt-1 origin-top rounded-md bg-background shadow-lg border border-border max-h-60 overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className={cn(
                    "flex w-full justify-between items-center px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                    "text-foreground hover:bg-muted hover:text-foreground",
                    value === option.value && "bg-muted text-primary font-medium"
                  )}
                >
                  <span className="flex-1 truncate mr-2">{option.label}</span>
                  {value === option.value && (
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-primary"
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
