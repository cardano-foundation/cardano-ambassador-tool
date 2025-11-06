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
              "flex-1 h-10 px-3 py-3 rounded-tr-md rounded-br-md  outline-1 outline-offset-[-1px] flex justify-start items-center gap-2.5",
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
      <div className="w-full space-y-2">
        {label && (
          <label className={cn(
            'block text-sm font-medium',
            error ? 'text-primary-base' : 'text-foreground',
            disabled && 'opacity-50'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3 py-2 rounded-md border transition-colors',
              'text-sm font-normal',
              'bg-background border-border placeholder:text-muted-foreground',
              'focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none',
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