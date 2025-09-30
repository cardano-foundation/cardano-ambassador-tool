import { cn } from '@/utils/utils';
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

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
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1.5">
          {label && (
            <div className="justify-center text-neutral-500 text-sm font-normal  leading-none">
              {label}
            </div>
          )}
          <div className="self-stretch inline-flex justify-start items-start">
            <div className={cn(
              "h-10 pl-3 pr-[5px] py-3 rounded-tl-md rounded-bl-md border-l border-t border-b border-border flex justify-start items-center gap-2.5",
              disabled && "opacity-50 bg-gray-100",
              error && "border-primary-500",
              prefixClassName
            )}>
              <div className={cn(
                "justify-center text-neutral-500 text-base font-normal leading-normal",
                'focus:!border-primary-300 focus:ring-primary-300/20 focus:ring-2 focus:outline-none',
                disabled && "text-gray-400",
                error && "text-primary-500"
              )}>
                {prefix}
              </div>
            </div>
            <div className={cn(
              "flex-1 h-10 px-3 py-3 rounded-tr-md rounded-br-md outline outline-1 outline-offset-[-1px] flex justify-start items-center gap-2.5",
              error ? 'outline-primary-base' : 'outline-border',
              disabled && "opacity-50 bg-gray-100 cursor-not-allowed",
              icon && "pl-10"
            )}>
              {icon && (
                <div className="absolute left-3 h-10 flex items-center z-10 text-muted-foreground pointer-events-none">
                  {icon}
                </div>
              )}
              <input
                ref={ref}
                disabled={disabled}
                className={cn(
                  "w-full justify-center text-neutral-900 text-base font-normal font-['Chivo'] leading-normal bg-transparent border-none outline-none focus:outline-none placeholder:text-neutral-400",
                  disabled && "cursor-not-allowed text-gray-400"
                )}
                {...props}
              />
            </div>
          </div>

          {error && errorMessage && (
            <div className="text-primary-base text-xs font-normal mt-2">
              {errorMessage}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="relative h-16 w-full">
        {icon && (
          <div className="absolute top-[22px] left-3 h-10 flex items-center z-10 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'absolute top-[22px] left-0 h-10 w-full rounded-md border px-3 py-3 transition-colors',
            'text-sm leading-none font-normal',
            'bg-background dark:bg-card border-border placeholder:text-muted-foreground/60',
            'focus:!border-primary-300 focus:ring-primary-300/20 focus:ring-2 focus:outline-none',
            'hover:!border-primary-300',
            icon && 'pl-10',
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
              'absolute top-[-1px] left-0 text-sm leading-none font-normal text-muted-foreground px-1 bg-background dark:bg-card transition-all',
              'text-primary-base',
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