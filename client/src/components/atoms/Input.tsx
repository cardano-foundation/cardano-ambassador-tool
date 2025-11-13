import { cn } from '@/utils/utils';
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  icon?: ReactNode;
  prefix?: string;
  prefixClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      disabled = false,
      icon,
      prefix,
      prefixClassName,
      className,
      ...props
    },
    ref,
  ) => {
    if (prefix) {
      return (
        <div className="inline-flex flex-col items-start justify-start gap-1.5 self-stretch">
          {label && (
            <div className="justify-center text-sm leading-none font-normal text-neutral-500">
              {label}
            </div>
          )}
          <div className="inline-flex items-start justify-start self-stretch">
            <div
              className={cn(
                'border-border flex h-10 items-center justify-start gap-2.5 rounded-tl-md rounded-bl-md border-t border-b border-l py-3 pr-[5px] pl-3',
                disabled && 'bg-gray-100 opacity-50',
                error && 'border-primary-500',
                prefixClassName,
              )}
            >
              <div
                className={cn(
                  'justify-center text-base leading-normal font-normal text-neutral-500',
                  'focus:!border-primary-300 focus:ring-primary-300/20 focus:ring-2 focus:outline-none',
                  disabled && 'text-gray-400',
                  error && 'text-primary-500',
                )}
              >
                {prefix}
              </div>
            </div>
            <div
              className={cn(
                'flex h-10 flex-1 items-center justify-start gap-2.5 rounded-tr-md rounded-br-md px-3 py-3 outline-1 outline-offset-[-1px]',
                error ? 'outline-primary-base' : 'outline-border',
                disabled && 'cursor-not-allowed bg-gray-100 opacity-50',
                icon && 'pl-10',
              )}
            >
              {icon && (
                <div className="text-muted-foreground pointer-events-none absolute left-3 z-10 flex h-10 items-center">
                  {icon}
                </div>
              )}
              <input
                ref={ref}
                disabled={disabled}
                className={cn(
                  "w-full justify-center border-none bg-transparent font-['Chivo'] text-base leading-normal font-normal text-neutral-900 outline-none placeholder:text-neutral-400 focus:outline-none",
                  disabled && 'cursor-not-allowed text-gray-400',
                )}
                {...props}
              />
            </div>
          </div>

          {error && errorMessage && (
            <div className="text-primary-base mt-2 text-xs font-normal">
              {errorMessage}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            className={cn(
              'block text-sm font-medium',
              error ? 'text-primary-base' : 'text-foreground',
              disabled && 'opacity-50',
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'h-10 w-full rounded-md border px-3 py-2 transition-colors',
              'text-sm font-normal',
              'bg-background border-border placeholder:text-muted-foreground',
              'focus:border-primary-300 focus:ring-primary-300/20 focus:ring-2 focus:outline-none',
              'hover:border-primary-300',
              icon && 'pl-10',
              disabled && [
                'cursor-not-allowed opacity-50',
                'hover:border-border focus:border-border',
              ],
              error && [
                'border-primary-500',
                'focus:border-primary-500 focus:ring-primary-500/20',
              ],
              className,
            )}
            {...props}
          />
        </div>

        {error && errorMessage && (
          <p className="text-primary-base text-xs font-normal">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
