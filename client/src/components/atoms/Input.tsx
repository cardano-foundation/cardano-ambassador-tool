import { cn } from '@/utils/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative h-16 w-full">
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'absolute top-[22px] left-0 h-10 w-full rounded-md border px-3 py-3 transition-colors',
            'text-sm leading-none font-normal',
            'bg-background dark:bg-card border-border placeholder:text-muted-foreground',
            'focus:!border-primary-300 focus:ring-primary-300/20 focus:ring-2 focus:outline-none',
            'hover:!border-primary-300',
            disabled && [
              'cursor-not-allowed opacity-30',
              'hover:!border-border focus:!border-border',
            ],

            error && [
              '!border-primary-500',
              'focus:!border-primary-500 focus:ring-primary-500/20',
            ],

            className,
          )}
          {...props}
        />

        {label && (
          <label
            className={cn(
              'absolute top-[-1px] left-0 text-sm leading-none font-normal',
              'text-muted-foreground',
              disabled && 'opacity-50',
              error && 'text-primary-base',
            )}
          >
            {label}
          </label>
        )}

        {error && errorMessage && (
          <div className="text-primary-base absolute top-[60px] left-0 text-xs font-normal mt-2">
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
