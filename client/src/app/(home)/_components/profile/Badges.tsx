import BadgeIcon from '@/components/atoms/BadgeIcon';
import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import React from 'react';

interface BadgesSectionProps {
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    granted_at: string;
  }>;
  cleanHtml: (html: string | null | undefined) => string;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  badges,
  cleanHtml,
}) => {
  const BadgeCard = ({ badge }: { badge: BadgesSectionProps['badges'][0] }) => (
    <Card className="p-4">
      <CardContent>
        <div className="flex items-start space-x-4">
          <BadgeIcon className="flex-shrink-0" />
          <div className="flex-1">
            <Title level="6" className="text-neutral mb-2">
              {badge.name}
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              {cleanHtml(badge.description)}
            </Paragraph>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge, index) => (
        <BadgeCard key={index} badge={badge} />
      ))}
    </div>
  );
};
