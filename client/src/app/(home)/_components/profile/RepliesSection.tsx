import React from 'react';
import Link from 'next/link';
import Title  from '@/components/atoms/Title';
import Paragraph  from '@/components/atoms/Paragraph';
import Card, { CardContent } from '@/components/atoms/Card';
import TextLink  from '@/components/atoms/TextLink';

interface RepliesSectionProps {
  replies: Array<{
    title: string;
    url: string;
    like_count: number;
    created_at: string;
  }>;
  showAllReplies: boolean;
  onToggleShowAll: () => void;
  formatDate: (dateString: string) => string;
}

export const RepliesSection: React.FC<RepliesSectionProps> = ({
  replies,
  showAllReplies,
  onToggleShowAll,
  formatDate
}) => {
  const ReplyItem = ({ reply }: { reply: RepliesSectionProps['replies'][0] }) => (
    <div className="flex items-start space-x-3 py-2 border-l-2 border-primary-base pl-3">
      <div className="flex-1 pt-3">
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-primary-base">❤</span>
            <span className="text-xs text-muted-foreground">{reply.like_count}</span>
          </div>
        </div>
        <Link href={reply.url} target="_blank" rel="noopener noreferrer">
          <Paragraph className="text-sm font-medium text-foreground hover:text-primary-base transition-colors cursor-pointer">
            {reply.title}
          </Paragraph>
        </Link>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-4">
          <Title level="6" className="text-neutral text-lg">Top Replies</Title>
          {replies.length > 5 && (
            <TextLink 
              href="#" 
              variant="dotted" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleShowAll();
              }}
            >
              {showAllReplies ? 'Show Less' : 'View All'}
            </TextLink>
          )}
        </div>
        <div className="space-y-3">
          {(showAllReplies ? replies : replies.slice(0, 5)).map((reply, index) => (
            <ReplyItem key={index} reply={reply} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};