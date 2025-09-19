'use client';
import { cn } from '@/utils/utils';
import { useEffect, useRef, useState } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  noOptionsMessage?: string;
}

export default function SearchableDropdown({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className,
  noOptionsMessage = 'No options found',
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const selectedOption = options.find((opt) => opt.value === value);
  
  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    // Return focus to button after selection
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      buttonRef.current?.focus();
    } else if (event.key === 'Enter' && filteredOptions.length > 0) {
      event.preventDefault();
      handleSelect(filteredOptions[0].value);
    }
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
        <div className="bg-background border-border absolute right-0 left-0 z-[9999] mt-1 max-h-80 origin-top overflow-hidden rounded-md border shadow-lg">
          {/* Search Input */}
          <div className="border-b border-border p-2">
            <div className="relative">
              <svg
                className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full rounded-md border border-border bg-background px-3 py-2 pl-10 text-sm',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none'
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground px-4 py-3 text-sm text-center">
                {searchQuery ? noOptionsMessage : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => (
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
