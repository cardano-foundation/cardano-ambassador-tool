import React from 'react';
import Link from 'next/link';
import Title  from '@/components/atoms/Title';
import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph  from '@/components/atoms/Paragraph';
import Switch  from '@/components/atoms/Switch';
import Progress  from '@/components/atoms/Progress';
import TextLink from '@/components/atoms/TextLink';

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
  getRelativeTime
}) => {
  return (
    <Card>
      <CardContent className="p-2 border-b border-border/60">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <Title level="6" className="text-neutral text-lg">Recent Activities</Title>
          <div className="flex items-center gap-3">
            <Paragraph size="sm" className="text-muted-foreground">Enable Notifications:</Paragraph>
            <Paragraph size="sm" className="text-muted-foreground">{notificationsEnabled ? 'On' : 'Off'}</Paragraph>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={onNotificationsToggle}
            />
          </div>
        </div>
        <Progress
          steps={(showAllActivities ? activities : activities.slice(0, 5)).map((activity, index) => ({
            id: `activity-${index}`,
            title: (
              <Link href={activity.url} target="_blank" rel="noopener noreferrer" className="inline">
                <span className="hover:text-primary-base transition-colors cursor-pointer">
                  {activity.title}
                </span>
              </Link>
            ),
            description: getRelativeTime(activity.created_at),
            status: 'pending' as const
          }))}
        />
        {activities.length > 5 && (
          <div className="mt-4 text-center">
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