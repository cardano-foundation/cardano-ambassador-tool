import React from 'react';
import Title  from '@/components/atoms/Title';
import Paragraph  from '@/components/atoms/Paragraph';
import Button  from '@/components/atoms/Button';
import UserAvatar  from '@/components/atoms/UserAvatar';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';
import { getCountryFlag } from '@/utils/countryFlags';
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

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-6 flex-1">
          <div className="relative flex-shrink-0">
            <UserAvatar size="size-30" name={profile.name} />
            <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-6 h-6 sm:w-9 sm:h-9 p-[2px] sm:p-[3px] bg-white rounded-xl sm:rounded-2xl border-2 sm:border-[3px] border-white flex items-center justify-center z-10">
              <div className="text-primary-base">
                <CardanoIcon size={16} className="sm:w-5 sm:h-5" color="currentColor" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-start w-full">
            <div className="flex-shrink-0">
              <Title level="5" className="text-neutral text-2xl">{profile.name}</Title>
              <Paragraph className="text-muted-foreground">Ambassador</Paragraph>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-base rounded-full">
                  {getCountryFlag(profile.country)}
                </span>
                <span className="text-sm text-muted-foreground">{profile.country}</span>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mx-8">
              <StatCard label="Topics Created" value={profile.summary.stats.topics_created} />
              <StatCard label="Given" value={profile.summary.stats.likes_given} showHeart />
              <StatCard label="Received" value={profile.summary.stats.likes_received} showHeart />
              <StatCard label="Days Visited" value={profile.summary.stats.days_visited} />
              <StatCard label="Posts Created" value={profile.summary.stats.replies_created} />
            </div>
            <div className="flex-shrink-0">
              <Button variant="primary" size="md" className="bg-primary-base hover:bg-primary-400">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};