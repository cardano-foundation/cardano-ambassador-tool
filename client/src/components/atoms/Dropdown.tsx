'use client';
import { cn } from '@/utils/utils';
import { useEffect, useRef, useState } from 'react';

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
  placeholder = 'Select option...',
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
        'relative inline-block w-full min-w-0 text-left sm:min-w-[200px]',
        className,
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
          'inline-flex w-full cursor-pointer items-center justify-between rounded-md border px-3 py-4 text-sm transition-colors focus-visible:outline-none',
          'bg-background border-border hover:border-primary/50 focus:border-primary focus:ring-primary/20 focus:ring-2',
          disabled && 'hover:border-border cursor-not-allowed opacity-50',
          isOpen && 'border-primary ring-primary/20 ring-2',
        )}
      >
        <span
          className={cn(
            selectedOption ? 'text-foreground' : 'text-muted-foreground',
            'mr-2 truncate',
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            'text-muted-foreground h-4 w-4 flex-shrink-0 transition-transform',
            isOpen && 'rotate-180',
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
        <div className="bg-background border-border absolute right-0 left-0 z-[9999] mt-1 max-h-60 origin-top overflow-hidden rounded-md border shadow-lg">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="text-muted-foreground px-4 py-3 text-sm">
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
                    'flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm transition-colors',
                    'text-foreground hover:bg-muted hover:text-foreground',
                    value === option.value &&
                      'bg-muted text-primary font-medium',
                  )}
                >
                  <span className="mr-2 flex-1 truncate">{option.label}</span>
                  {value === option.value && (
                    <svg
                      className="text-primary h-4 w-4 flex-shrink-0"
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
