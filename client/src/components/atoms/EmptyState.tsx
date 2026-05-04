import Empty from "./Empty";
import Paragraph from "./Paragraph";
import Title from "./Title";
import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  action,
  className = "",
}) => {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-4 px-4 py-16 text-center ${className}`}
    >
      <div className="opacity-90">{illustration ?? <Empty />}</div>
      <div className="space-y-1.5">
        <Title level="6" className="text-foreground">
          {title}
        </Title>
        {description && (
          <Paragraph
            size="sm"
            className="text-muted-foreground mx-auto max-w-md"
          >
            {description}
          </Paragraph>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
