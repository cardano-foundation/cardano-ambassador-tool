import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import TextLink from '@/components/atoms/TextLink';
import Title from '@/components/atoms/Title';
import Link from 'next/link';
import React from 'react';

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
  formatDate,
}) => {
  const TopicItem = ({ topic }: { topic: TopicsSectionProps['topics'][0] }) => (
    <div className="border-border/60 flex items-start justify-between border-b py-3 last:border-b-0">
      <div className="flex-1">
        <Link href={topic.url} target="_blank" rel="noopener noreferrer">
          <Paragraph className="text-foreground hover:text-primary-base mb-1 cursor-pointer text-sm font-medium transition-colors">
            {topic.title}
          </Paragraph>
        </Link>
        <div className="flex items-center space-x-2">
          <Paragraph className="text-muted-foreground text-xs">
            {formatDate(topic.created_at)}
          </Paragraph>
          <span className="text-primary-base text-sm">❤</span>
          <span className="text-muted-foreground text-sm">
            {topic.like_count}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-2">
        <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
          <Title level="6" className="text-neutral text-lg">
            Top Topics
          </Title>
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
