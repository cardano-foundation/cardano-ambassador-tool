import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import TextLink from '@/components/atoms/TextLink';
import Title from '@/components/atoms/Title';
import Link from 'next/link';
import React from 'react';

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
  formatDate,
}) => {
  const ReplyItem = ({
    reply,
  }: {
    reply: RepliesSectionProps['replies'][0];
  }) => (
    <div className="border-primary-base flex items-start space-x-3 border-l-2 py-2 pl-3">
      <div className="flex-1 pt-3">
        <div className="mt-1 flex items-center space-x-4">
          <span className="text-muted-foreground text-xs">
            {formatDate(reply.created_at)}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-primary-base text-xs">❤</span>
            <span className="text-muted-foreground text-xs">
              {reply.like_count}
            </span>
          </div>
        </div>
        <Link href={reply.url} target="_blank" rel="noopener noreferrer">
          <Paragraph className="text-foreground hover:text-primary-base cursor-pointer text-sm font-medium transition-colors">
            {reply.title}
          </Paragraph>
        </Link>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="">
        <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
          <Title level="6" className="text-neutral text-lg">
            Top Replies
          </Title>
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
          {(showAllReplies ? replies : replies.slice(0, 5)).map(
            (reply, index) => (
              <ReplyItem key={index} reply={reply} />
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
};
