import { EmptyState as SharedEmptyState } from "../../../../components/atoms/EmptyState";
import NoNotificationsIcon from "../../../../components/atoms/NoNotificationsIcon";
import React from "react";

interface EmptyStateProps {
  message: string;
  showIcon?: boolean;
}

// Profile-page wrapper around the shared EmptyState. Kept for the
// notifications variant which uses a different illustration.
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  showIcon = true,
}) => {
  if (showIcon && message.includes("notifications")) {
    return (
      <SharedEmptyState
        title={message}
        illustration={<NoNotificationsIcon />}
      />
    );
  }

  return <SharedEmptyState title={message} />;
};
