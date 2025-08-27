import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/utils";

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
    ref
  ) => {
    return (
      <div className="h-16 relative w-full">
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full h-10 px-3 py-3 absolute top-[22px] left-0 rounded-md border transition-colors",
            "text-sm font-normal leading-none",
            "bg-background dark:bg-card border-border placeholder:text-muted-foreground",
            "focus:outline-none focus:!border-primary-300 focus:ring-2 focus:ring-primary-300/20",
            "hover:!border-primary-300",
            disabled && [
              "opacity-30 cursor-not-allowed",
              "hover:!border-border focus:!border-border",
            ],

            error && [
              "!border-primary-500",
              "focus:!border-primary-500 focus:ring-primary-500/20",
            ],

            className
          )}
          {...props}
        />

        {label && (
          <label
            className={cn(
              "absolute left-0 top-[-1px] text-sm font-normal leading-none",
              "text-muted-foreground",
              disabled && "opacity-50",
              error && "text-primary-base"
            )}
          >
            {label}
          </label>
        )}

        {error && errorMessage && (
          <div className="absolute top-[60px] left-0 text-xs text-primary-base font-normal">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
