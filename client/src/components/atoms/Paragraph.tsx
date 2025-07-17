import React, { HTMLAttributes } from "react";
import { cn } from "@/utils/utils";

interface ParagraphProps extends HTMLAttributes<HTMLElement> {
  size?: "body-1" | "body-2" | "body-3" | "body-4";
  as?: "p" | "span" | "div" | "label";
}

const paragraphSizes = {
  "body-1": "text-[20px] font-medium leading-[30px]",
  "body-2": "text-[18px] font-normal leading-[28px]",
  "body-3": "text-[16px] font-normal leading-[24px]",
  "body-4": "text-[16px] font-normal leading-[24px]",
  "body-5": "text-[12px] font-normal leading-[24px]",
} as const;

export default function Paragraph({
  size = "body-2",
  as: Component = "p",
  className,
  children,
  ...props
}: ParagraphProps) {
  return (
    <Component
      className={cn(
        "font-['Chivo'] text-foreground ",
        paragraphSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
