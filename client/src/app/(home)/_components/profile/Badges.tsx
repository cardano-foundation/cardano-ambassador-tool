import React from 'react';
import Title  from '@/components/atoms/Title';
import Paragraph  from '@/components/atoms/Paragraph';
import BadgeIcon  from '@/components/atoms/BadgeIcon';
import Card, { CardContent } from '@/components/atoms/Card';

interface BadgesSectionProps {
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    granted_at: string;
  }>;
  cleanHtml: (html: string | null | undefined) => string;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({ badges, cleanHtml }) => {
  const BadgeCard = ({ badge }: { badge: BadgesSectionProps['badges'][0] }) => (
    <Card className="p-4">
      <CardContent>
        <div className="flex items-start space-x-4">
          <BadgeIcon className="flex-shrink-0" />
          <div className="flex-1">
            <Title level="6" className="mb-2 text-neutral">{badge.name}</Title>
            <Paragraph className="text-sm text-muted-foreground">
              {cleanHtml(badge.description)}
            </Paragraph>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {badges.map((badge, index) => (
        <BadgeCard key={index} badge={badge} />
      ))}
    </div>
  );
};