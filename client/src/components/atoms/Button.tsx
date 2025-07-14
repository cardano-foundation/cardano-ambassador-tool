import React from "react";
import { cn } from "@/utils/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  rounded?: "lg" | "full";
  children: React.ReactNode;
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
        "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98] hover:scale-[1.02]",

        {
          "h-9 px-4 text-sm": size === "sm",
          "h-11 px-6 text-sm": size === "md",
          "h-12 px-8 text-base": size === "lg",
        },
        {
          "rounded-lg": rounded === "lg",
          "rounded-full": rounded === "full",
        },

        {
          "bg-sunset-500 text-white hover:bg-sunset-400 ":
            variant === "primary",

          "bg-sunset-50 text-sunset-500 border border-sunset-500 ":
            variant === "secondary",

          "bg-background border border-sunset-500 text-sunset-500 ":
            variant === "outline",

          "bg-background text-black-500 shadow-[0px_0px_8px_rgba(0,0,0,0.15)]":
            variant === "ghost",
        },

        fullWidth && "w-full",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
