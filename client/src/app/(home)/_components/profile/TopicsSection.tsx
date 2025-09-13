import React from 'react';
import Link from 'next/link';
import Title  from '@/components/atoms/Title';
import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph  from '@/components/atoms/Paragraph';
import TextLink from '@/components/atoms/TextLink';

interface TopicsSectionProps {
  topics: Array<{
    title: string;
    url: string;
    reply_count: number;
    like_count: number;
    created_at: string;
  }>;
  showAllTopics: boolean;
  onToggleShowAll: () => void;
  formatDate: (dateString: string) => string;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({
  topics,
  showAllTopics,
  onToggleShowAll,
  formatDate
}) => {
  const TopicItem = ({ topic }: { topic: TopicsSectionProps['topics'][0] }) => (
    <div className="flex items-start justify-between py-3 border-b border-border/60 last:border-b-0">
      <div className="flex-1">
        <Link href={topic.url} target="_blank" rel="noopener noreferrer">
          <Paragraph className="text-sm font-medium text-foreground mb-1 hover:text-primary-base transition-colors cursor-pointer">
            {topic.title}
          </Paragraph>
        </Link>
        <div className="flex items-center space-x-2">
          <Paragraph className="text-xs text-muted-foreground">{formatDate(topic.created_at)}</Paragraph>
          <span className="text-sm text-primary-base">❤</span>
          <span className="text-sm text-muted-foreground">{topic.like_count}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-4">
          <Title level="6" className="text-neutral text-lg">Top Topics</Title>
          {topics.length > 5 && (
            <TextLink 
              href="#" 
              variant="dotted" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleShowAll();
              }}
            >
              {showAllTopics ? 'Show Less' : 'View All'}
            </TextLink>
          )}
        </div>
        <div className="space-y-1">
          {(showAllTopics ? topics : topics.slice(0, 5)).map((topic, index) => (
            <TopicItem key={index} topic={topic} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};