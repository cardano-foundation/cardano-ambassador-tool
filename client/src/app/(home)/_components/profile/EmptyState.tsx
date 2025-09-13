import React from 'react';
import Paragraph  from '@/components/atoms/Paragraph';
import NoNotificationsIcon  from '@/components/atoms/NoNotificationsIcon';

interface EmptyStateProps {
  message: string;
  showIcon?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, showIcon = true }) => {
  if (showIcon && message.includes('notifications')) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <NoNotificationsIcon className="mb-6" />
        <Paragraph size="sm" className="text-muted-foreground">{message}</Paragraph>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Paragraph size="sm" className="text-muted-foreground">{message}</Paragraph>
    </div>
  );
};