'use client';
import Dropdown from './Dropdown';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Simple Select component wrapper around Dropdown
 * Provides a cleaner API for basic select functionality
 */
export default function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  className = 'w-48',
}: SelectProps) {
  return (
    <Dropdown
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
