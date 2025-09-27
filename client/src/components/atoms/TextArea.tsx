import { cn } from '@/utils/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
      <div className="relative w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border px-3 py-3 transition-colors',
            'text-sm leading-none font-normal',
            'bg-background dark:bg-card border-border placeholder:text-muted-foreground/60',
            'focus:border-primary-300 focus:ring-primary-300/20 focus:ring-1 focus:outline-none',
            'hover:border-primary-300',
            label && 'mt-[22px]',

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
          <div className="text-primary-base mt-1 text-xs font-normal">
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';

export default TextArea;
