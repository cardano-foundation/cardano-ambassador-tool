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
      <CardContent className="p-3 sm:p-4 lg:p-4">
        <div className="block sm:hidden border-b border-border/60 pb-3">
          <Title level="6" className="text-neutral text-base mb-2">Recent Activities</Title>
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm mr-1">Enable Notifications: {notificationsEnabled ? 'On' : 'Off'}</span>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={onNotificationsToggle}
            />
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden sm:flex items-center justify-between border-b border-border/60 pb-4">
          <Title level="6" className="text-neutral text-lg">Recent Activities</Title>
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm mr-1">Enable Notifications: {notificationsEnabled ? 'On' : 'Off'}</span>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={onNotificationsToggle}
            />
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4">
          <Progress
            steps={(showAllActivities ? activities : activities.slice(0, 5)).map((activity, index) => ({
              id: `activity-${index}`,
              title: (
                <Link href={activity.url} target="_blank" rel="noopener noreferrer" className="inline">
                  <span className="hover:text-primary-base transition-colors cursor-pointer text-sm sm:text-base">
                    {activity.title}
                  </span>
                </Link>
              ),
              description: getRelativeTime(activity.created_at),
              status: 'pending' as const
            }))}
          />
        </div>
        
        {activities.length > 5 && (
          <div className="mt-3 sm:mt-4 text-center">
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