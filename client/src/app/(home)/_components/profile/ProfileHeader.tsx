import React from 'react';
import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import Button from '@/components/atoms/Button';
import UserAvatar from '@/components/atoms/UserAvatar';
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
    <div className="bg-card p-4 sm:p-6">
      <div className="block lg:hidden">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0">
            <UserAvatar size="size-20" name={profile.name} />
            <div className="absolute bottom-0.5 right-0.5 w-6 h-6 p-[2px] bg-white rounded-xl border-2 border-white flex items-center justify-center z-10">
              <div className="text-primary-base">
                <CardanoIcon size={16} color="currentColor" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Title level="5" className="text-neutral text-xl font-bold">{profile.name}</Title>
            <Paragraph className="text-muted-foreground text-sm">Ambassador</Paragraph>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-base rounded-full">
                {getCountryFlag(profile.country)}
              </span>
              <span className="text-sm text-muted-foreground">{profile.country}</span>
            </div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <StatCard label="Topics Created" value={profile.summary.stats.topics_created} />
            <StatCard label="Given" value={profile.summary.stats.likes_given} showHeart />
          </div>
          
          <div className="flex gap-2">
            <StatCard label="Received" value={profile.summary.stats.likes_received} showHeart />
            <StatCard label="Days Visited" value={profile.summary.stats.days_visited} />
          </div>
          <div className="flex">
            <StatCard label="Posts Created" value={profile.summary.stats.replies_created} />
          </div>
        </div>
        <Button variant="primary" className="bg-primary-base hover:bg-primary-400 w-full">
          Follow
        </Button>
      </div>
      <div className="hidden lg:block">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6 flex-1">
            <div className="relative flex-shrink-0">
              <UserAvatar size="size-30" name={profile.name} />
              <div className="absolute bottom-1 right-1 w-9 h-9 p-[3px] bg-white rounded-2xl border-[3px] border-white flex items-center justify-center z-10">
                <div className="text-primary-base">
                  <CardanoIcon size={20} color="currentColor" />
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
    </div>
  );
};