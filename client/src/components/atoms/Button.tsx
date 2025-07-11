import React from "react";
import { cn } from "@/utils/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform transition-all duration-200 ease-in-out active:scale-95 hover:shadow-lg",

        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 text-sm": size === "md",
          "h-12 px-6 text-base": size === "lg",
        },

        {
          "bg-sunset-500 text-white border-border": variant === "primary",

          "bg-sunset-100 border-sunset-500 text-sunset-500 ":
            variant === "secondary",

          "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800":
            variant === "outline",

          "text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800":
            variant === "ghost",
        },

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
