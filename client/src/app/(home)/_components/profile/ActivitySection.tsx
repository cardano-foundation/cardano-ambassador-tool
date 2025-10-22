import Card, { CardContent } from '@/components/atoms/Card';
import Switch from '@/components/atoms/Switch';
import TextLink from '@/components/atoms/TextLink';
import Progress from '@/components/atoms/Timeline';
import Title from '@/components/atoms/Title';
import Link from 'next/link';
import React from 'react';

interface ActivitySectionProps {
  activities: Array<{
    type: 'topic' | 'reply';
    title: string;
    url: string;
    created_at: string;
  }>;
  showAllActivities: boolean;
  onToggleShowAll: () => void;
  notificationsEnabled: boolean;
  onNotificationsToggle: (enabled: boolean) => void;
  getRelativeTime: (dateString: string) => string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  activities,
  showAllActivities,
  onToggleShowAll,
  notificationsEnabled,
  onNotificationsToggle,
  getRelativeTime,
}) => {
  return (
    <Card>
      <CardContent className="">
        <div className="border-border/60 block border-b pb-3 sm:hidden">
          <Title level="6" className="text-neutral mb-2 text-base">
            Recent Activities
          </Title>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1 text-sm">
              Enable Notifications: {notificationsEnabled ? 'On' : 'Off'}
            </span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={onNotificationsToggle}
            />
          </div>
        </div>
        <div className="border-border/60 hidden items-center justify-between border-b pb-4 sm:flex">
          <Title level="6" className="text-neutral text-lg">
            Recent Activities
          </Title>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1 text-sm">
              Enable Notifications: {notificationsEnabled ? 'On' : 'Off'}
            </span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={onNotificationsToggle}
            />
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <Progress
              steps={(showAllActivities ? activities : activities.slice(0, 5)).map(
                (activity, index) => ({
                  id: `activity-${index}`,
                  title: (
                    <Link
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline"
                    >
                      <span className="hover:text-primary-base cursor-pointer text-sm transition-colors sm:text-base">
                        {activity.title}
                      </span>
                    </Link>
                  ),
                  content: (
                    <div className="text-muted-foreground text-xs">
                      {getRelativeTime(activity.created_at)}
                    </div>
                  ),
                  status: 'pending' as const,
                })
              )}
            />

        </div>

        {activities.length > 5 && (
          <div className="mt-3 text-center sm:mt-4">
            <TextLink
              href="#"
              variant="dotted"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleShowAll();
              }}
            >
              {showAllActivities ? 'Show Less' : 'View All'}
            </TextLink>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
