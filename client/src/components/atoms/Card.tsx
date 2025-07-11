import React from "react";
import { cn } from "@/utils/utils";
import Title from "./Title";
import Paragraph from "./Paragraph";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "form" | "profile" | "content" | "stats" | "flat";
  size?: "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  clickable?: boolean;
  onCardClick?: () => void;
}

export default function Card({
  variant = "form",
  size = "md",
  padding = "md",
  rounded = "md",
  header,
  footer,
  children,
  clickable = false,
  onCardClick,
  className,
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
        "bg-card text-card-foreground",
        "transition-all duration-400 ease-out",

        {
          "border border-none": variant === "form",
          "border border-border shadow-md": variant === "profile",
          "border border-muted": variant === "content",
          "border border-border shadow-sm": variant === "stats",
          "border border-border": variant === "flat",
        },

        {
          "max-w-sm": size === "sm",
          "max-w-lg": size === "lg",
          "max-w-xl": size === "xl",
        },

        {
          "p-0": padding === "none",
          "p-3": padding === "sm",
          "p-6": padding === "md",
          "p-8": padding === "lg",
        },

        {
          "rounded-sm": rounded === "sm",
          "rounded-md": rounded === "md",
          "rounded-lg": rounded === "lg",
        },

        clickable &&
          "cursor-pointer hover:shadow-lg transform hover:scale-[1.02]",

        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {header && (
        <div
          className={cn(
            "border-b border-border pb-4 mb-4 transition-colors duration-400",
            padding === "none" && "px-6 pt-6 pb-4",
          )}
        >
          {header}
        </div>
      )}

      <div
        className={cn(
          padding === "none" && (header || footer) && "px-6",
          padding === "none" && !header && footer && "pt-6",
          padding === "none" && header && !footer && "pb-6",
        )}
      >
        {children}
      </div>

      {footer && (
        <div
          className={cn(
            "border-t border-border pt-4 mt-4 transition-colors duration-400",
            padding === "none" && "px-6 pb-6 pt-4",
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

interface FormCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function FormCard({
  title,
  subtitle,
  children,
  actions,
  className,
}: FormCardProps) {
  return (
    <Card variant="form" padding="lg" className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <Title
              level="4"
              className="text-card-foreground mb-2 transition-colors duration-400"
            >
              {title}
            </Title>
          )}
          {subtitle && (
            <Paragraph
              size="body-3"
              className="text-muted-foreground transition-colors duration-400"
            >
              {subtitle}
            </Paragraph>
          )}
        </div>
      )}

      <div className="space-y-4">{children}</div>

      {actions && <div className="mt-6">{actions}</div>}
    </Card>
  );
}

interface AmbassadorCardProps {
  name: string;
  country: string;
  avatar?: React.ReactNode;
  status?: "Follow" | "Following" | "Pending";
  initials?: string;
  className?: string;
  onProfileClick?: () => void;
}

export function AmbassadorCard({
  name,
  country,
  avatar,
  status = "Follow",
  initials,
  className,
  onProfileClick,
}: AmbassadorCardProps) {
  const statusColors = {
    Follow: "bg-sunset-500 text-white",
    Following: "bg-sunset-50 text-sunset-500",
    Pending: "bg-sunset-300 text-white",
  };

  return (
    <Card
      variant="profile"
      size="sm"
      padding="md"
      className={cn("text-center", className)}
      clickable={!!onProfileClick}
      onCardClick={onProfileClick}
    >
      <div className="space-y-3">
        <div className="flex justify-center">
          {avatar || (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sunset-400 to-sunset-600 flex items-center justify-center transition-all duration-300">
              <span className="text-white font-bold text-lg font-['Chivo']">
                {initials ||
                  name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        <div>
          <Title
            level="6"
            className="text-base font-semibold text-card-foreground mb-1 transition-colors duration-400"
          >
            {name}
          </Title>
          <Paragraph
            size="body-4"
            className="text-muted-foreground transition-colors duration-400"
          >
            {country}
          </Paragraph>
        </div>

        <div
          className={cn(
            "w-full py-1.5 px-3 rounded text-sm font-medium transition-all duration-400",
            statusColors[status],
          )}
        >
          {status}
        </div>
      </div>
    </Card>
  );
}

interface StatsCardProps {
  value: string | number;
  label: string;
  className?: string;
}

export function StatsCard({ value, label, className }: StatsCardProps) {
  return (
    <Card
      variant="stats"
      size="sm"
      padding="md"
      className={cn("text-center", className)}
    >
      <div className="space-y-1">
        <Title
          level="5"
          className="text-card-foreground font-bold transition-colors duration-400"
        >
          {value}
        </Title>
        <Paragraph
          size="body-4"
          className="text-muted-foreground transition-colors duration-400"
        >
          {label}
        </Paragraph>
      </div>
    </Card>
  );
}

interface ActivityCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp?: string;
  badge?: string;
  className?: string;
}

export function ActivityCard({
  icon,
  title,
  description,
  timestamp,
  badge,
  className,
}: ActivityCardProps) {
  return (
    <Card variant="content" size="xl" padding="md" className={className}>
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0 mt-1 transition-colors duration-400">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Title
                level="6"
                className="text-base font-medium text-card-foreground mb-1 transition-colors duration-400"
              >
                {title}
              </Title>

              {description && (
                <Paragraph
                  size="body-4"
                  className="text-muted-foreground transition-colors duration-400"
                >
                  {description}
                </Paragraph>
              )}
            </div>

            {badge && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-sunset-100 text-sunset-500 rounded-full flex-shrink-0 transition-all duration-400">
                {badge}
              </span>
            )}
          </div>

          {timestamp && (
            <Paragraph
              size="body-4"
              className="text-muted-foreground mt-2 text-xs transition-colors duration-400"
            >
              {timestamp}
            </Paragraph>
          )}
        </div>
      </div>
    </Card>
  );
}

interface InfoCardProps {
  title: string;
  data: Array<{
    label: string;
    value: string | React.ReactNode;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export function InfoCard({ title, data, actions, className }: InfoCardProps) {
  return (
    <Card size="lg" padding="lg" className={className}>
      <Title
        level="5"
        className="text-card-foreground mb-4 transition-colors duration-400"
      >
        {title}
      </Title>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <Paragraph
              size="body-4"
              className="text-muted-foreground transition-colors duration-400"
            >
              {item.label}:
            </Paragraph>
            <Paragraph
              size="body-4"
              className="text-card-foreground font-medium transition-colors duration-400"
            >
              {item.value}
            </Paragraph>
          </div>
        ))}
      </div>

      {actions && (
        <div className="mt-6 pt-4 border-t border-border transition-colors duration-400">
          {actions}
        </div>
      )}
    </Card>
  );
}
