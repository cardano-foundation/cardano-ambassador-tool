import CardanoIcon from '@/components/atoms/CardanoIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import { StatCardPulse } from '@/components/PulseLoader';
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
      } | null;
    };
  };
  isLoading?: boolean;
}

const StatCardsGrid: React.FC<{
  stats: ProfileHeaderProps['profile']['summary']['stats'];
}> = ({ stats }) => {
  if (!stats) {
    return (
      <>
        <StatCardPulse />
        <StatCardPulse />
        <StatCardPulse />
        <StatCardPulse />
        <StatCardPulse />
        <StatCardPulse />
      </>
    );
  }

  return (
    <>
      <StatCard label="Topics Created" value={stats.topics_created} />
      <StatCard label="Given" value={stats.likes_given} showHeart />
      <StatCard label="Received" value={stats.likes_received} showHeart />
      <StatCard label="Days Visited" value={stats.days_visited} />
      <StatCard label="Posts Created" value={stats.replies_created} />
      <StatCard label="Proposals" value={0} />
    </>
  );
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isLoading,
}) => {
  const {
    name,
    country,
    summary: { stats },
  } = profile;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start px-6 pt-6">
      {/* Left column - user info */}
      <div className="flex h-full w-full items-start gap-6">
        <div className="relative">
          <UserAvatar size="size-30" name={name} />
          <div className="text-primary-base bg-card absolute -right-1 -bottom-1 z-10 flex h-9 w-9 items-center justify-center rounded-2xl p-[3px]">
            <CardanoIcon size={20} color="currentColor" />
          </div>
        </div>

        <div className="flex h-full flex-col justify-center space-y-2">
          <Title level="5" className="text-neutral text-2xl">
            {name}
          </Title>
          <Paragraph className="text-muted-foreground">Ambassador</Paragraph>
          <div className="flex items-center gap-2">
            <span className="text-base">{getCountryFlag(country)}</span>
            <span className="text-muted-foreground text-sm">{country}</span>
          </div>
        </div>
      </div>

      {/* Right column - stat cards */}
      <div className="flex h-full items-center justify-center">
        <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-6">
          <StatCardsGrid stats={stats} />
        </div>
      </div>
    </div>
  );
};
