import React from "react";
import { cn } from "@/utils/utils";
import Title from "./Title";
import Paragraph from "./Paragraph";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  clickable?: boolean;
  onCardClick?: () => void;
  children: React.ReactNode;
}

export default function Card({
  padding = "md",
  clickable = false,
  onCardClick,
  className,
  children,
  ...props
}: CardProps) {
  const handleClick = () => {
    if (clickable && onCardClick) {
      onCardClick();
    }
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-[0px_3px_4px_rgba(0,0,0,0.03)]",
        "outline outline-1 outline-offset-[-1px] outline-border",
        "transition-all duration-200 ease-in-out",

        {
          "p-0": padding === "none",
          "p-4": padding === "sm",
          "p-6": padding === "md",
          "p-8": padding === "lg",
        },

        clickable && [
          "cursor-pointer",
          "hover:shadow-[0px_3px_8px_rgba(0,0,0,0.08)]",
          "hover:outline-muted",
          "active:scale-[0.98]",
        ],

        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        {title && (
          <Title level="4" className="text-card-foreground mb-2">
            {title}
          </Title>
        )}
        {subtitle && (
          <Paragraph size="body-3" className="text-muted-foreground">
            {subtitle}
          </Paragraph>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-6 pt-4", className)}>{children}</div>;
}
