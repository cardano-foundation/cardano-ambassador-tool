import React, { HTMLAttributes } from "react";
import { cn } from "@/utils/utils";

interface ParagraphProps extends HTMLAttributes<HTMLElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  as?: "p" | "span" | "div" | "label";
}

const paragraphSizes = {
  xl: "text-xl font-medium leading-[30px]",
  lg: "text-lg font-normal leading-[28px]",
  base: "text-base font-normal leading-[16px]",
  sm: "text-sm font-normal leading-[16px]",
  xs: "text-xs font-normal leading-[16px]",
} as const;

export default function Paragraph({
  size = "base",
  as: Component = "p",
  className,
  children,
  ...props
}: ParagraphProps) {
  return (
    <Component
      className={cn(
        "",
        paragraphSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
