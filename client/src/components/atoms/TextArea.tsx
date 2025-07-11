import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/utils";

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
            "w-full px-3 py-3 rounded-md border transition-colors",
            "text-sm font-normal font-['Chivo'] leading-none",
            "bg-background dark:bg-card border-border placeholder:text-muted-foreground",
            "focus:outline-none focus:!border-sunset-300 focus:ring-2 focus:ring-sunset-300/20",
            "hover:!border-sunset-300",
            // Add top margin when label exists to make room for it
            label && "mt-[22px]",

            disabled && [
              "opacity-30 cursor-not-allowed",
              "hover:!border-border focus:!border-border",
            ],

            error && [
              "!border-sunset-500",
              "focus:!border-sunset-500 focus:ring-sunset-500/20",
            ],

            className,
          )}
          {...props}
        />

        {label && (
          <label
            className={cn(
              "absolute left-0 top-[-1px] text-sm font-normal font-['Chivo'] leading-none",
              "text-muted-foreground",
              disabled && "opacity-50",
              error && "text-sunset-500",
            )}
          >
            {label}
          </label>
        )}

        {error && errorMessage && (
          <div className="mt-1 text-xs text-sunset-500 font-normal font-['Chivo']">
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
