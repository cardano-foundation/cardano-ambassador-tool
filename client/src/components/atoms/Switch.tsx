'use client';
import { cn } from '@/utils/utils';
import { useEffect, useState } from 'react';

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
      style={{
        width: '44px',
        height: '24px',
        minWidth: '44px',
        minHeight: '24px',
      }}
      className={cn(
        'inline-flex flex-shrink-0 items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out',
        'hover:cursor-pointer focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        isChecked ? 'bg-primary-base' : 'dark:bg-black-500 bg-gray-300',
        disabled &&
          'dark:bg-black-200 cursor-not-allowed bg-gray-300 opacity-70',
        className,
      )}
    >
      <span
        style={{ width: '20px', height: '20px' }}
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
          disabled ? 'bg-gray-200' : 'bg-white',
          isChecked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
