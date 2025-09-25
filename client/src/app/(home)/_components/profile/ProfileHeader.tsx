import Button from '@/components/atoms/Button';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import { getCountryFlag } from '@/utils/countryFlags';
import React from 'react';
import { StatCard } from './StartCard';

interface ProfileHeaderProps {
  profile: {
    name: string;
    country: string;
    summary: {
      stats: {
        topics_created: number;
        likes_given: number;
        likes_received: number;
        days_visited: number;
        replies_created: number;
      };
    };
  };
}

const StatCardsGrid: React.FC<{ stats: ProfileHeaderProps['profile']['summary']['stats'] }> = ({ stats }) => (
  <>
    <StatCard label="Topics Created" value={stats.topics_created} />
    <StatCard label="Given" value={stats.likes_given} showHeart />
    <StatCard label="Received" value={stats.likes_received} showHeart />
    <StatCard label="Days Visited" value={stats.days_visited} />
    <StatCard label="Posts Created" value={stats.replies_created} />
  </>
);

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { name, country, summary: { stats } } = profile;

  return (
    <div className="px-4 sm:px-8">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <UserAvatar size="size-16" name={name} />
            <div className="text-primary-base absolute -right-1 -bottom-1 z-10 flex h-6 w-6 items-center justify-center rounded-xl border-2 border-white bg-white p-0.5">
              <CardanoIcon size={16} className="text-primary-base" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Title level="5" className="text-neutral text-xl font-bold truncate">
              {name}
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Ambassador
            </Paragraph>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base">{getCountryFlag(country)}</span>
              <span className="text-muted-foreground text-sm truncate">
                {country}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCardsGrid stats={stats} />
        </div>

        <Button variant="primary" className="w-full">
          Follow
        </Button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <UserAvatar size="size-30" name={name} />
            <div className=" text-primary-base absolute -right-1 -bottom-1 z-10 flex h-9 w-9 items-center justify-center rounded-2xl border-[3px] border-white bg-white p-[3px]">
              <CardanoIcon size={20} color="currentColor" />
            </div>
          </div>

          <div className="flex-1 flex items-start justify-between">
            <div className="space-y-2">
              <Title level="5" className="text-neutral text-2xl">
                {name}
              </Title>
              <Paragraph className="text-muted-foreground">
                Ambassador
              </Paragraph>
              <div className="flex items-center gap-2">
                <span className="text-base">{getCountryFlag(country)}</span>
                <span className="text-muted-foreground text-sm">
                  {country}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mx-8">
              <StatCardsGrid stats={stats} />
            </div>

            <Button variant="primary" size="md">
              Follow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};