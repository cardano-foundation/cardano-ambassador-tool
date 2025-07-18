import React from "react";
import { cn } from "@/utils/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "nav";
  size?: "sm" | "md" | "lg";
  rounded?: "lg" | "full";
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  rounded = "lg",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variant === "nav"
          ? "flex items-start justify-start font-medium transition-all duration-200 ease-in-out"
          : "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out",

        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",

        variant !== "nav" && "active:scale-[0.98] hover:scale-[1.02]",

        variant === "nav"
          ? {}
          : {
              "h-9 px-4 text-sm": size === "sm",
              "h-11 px-6 text-sm": size === "md",
              "h-12 px-8 text-base": size === "lg",
            },

        {
          "rounded-lg": rounded === "lg",
          "rounded-full": rounded === "full",
        },

        {
          "bg-primary-base text-white hover:bg-primary-400":
            variant === "primary",
          "bg-primary-50 text-primary-base border-2 border-primary-base":
            variant === "secondary",
          "bg-muted border-2 border-primary-base text-primary-base":
            variant === "outline",
          "bg-muted text-black-500 shadow-[0px_0px_8px_rgba(0,0,0,0.15)]":
            variant === "ghost",
          "bg-muted hover:bg-muted text-foreground":
            variant === "nav",
        },
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
