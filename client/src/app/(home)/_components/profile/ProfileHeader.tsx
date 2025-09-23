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

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="px-8">
      <div className="block lg:hidden">
        <div className="mb-6 flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <UserAvatar size="size-20" name={profile.name} />
            <div className="absolute right-0.5 bottom-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-xl border-2 border-white bg-white p-[2px]">
              <div className="text-primary-base">
                <CardanoIcon size={16} color="currentColor" />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Title level="5" className="text-neutral text-xl font-bold">
              {profile.name}
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Ambassador
            </Paragraph>
            <div className="mt-1 flex items-center space-x-2">
              <span className="rounded-full text-base">
                {getCountryFlag(profile.country)}
              </span>
              <span className="text-muted-foreground text-sm">
                {profile.country}
              </span>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mb-6 ">
          <StatCard label="Topics Created" value={profile.summary.stats.topics_created} />
          <StatCard label="Given" value={profile.summary.stats.likes_given} showHeart />
          <StatCard label="Received" value={profile.summary.stats.likes_received} showHeart />
          <StatCard label="Days Visited" value={profile.summary.stats.days_visited} />
          <div className="col-span-2 flex justify-center">
            <div className="w-1/2">
              <StatCard label="Posts Created" value={profile.summary.stats.replies_created} />
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          className="bg-primary-base hover:bg-primary-400 w-full"
        >
          Follow
        </Button>
      </div>
      <div className="hidden lg:block">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start space-x-6">
            <div className="relative flex-shrink-0">
              <UserAvatar size="size-30" name={profile.name} />
              <div className="absolute right-1 bottom-1 z-10 flex h-9 w-9 items-center justify-center rounded-2xl border-[3px] border-white bg-white p-[3px]">
                <div className="text-primary-base">
                  <CardanoIcon size={20} color="currentColor" />
                </div>
              </div>
            </div>
            <div className="flex w-full items-start justify-between">
              <div className="flex-shrink-0">
                <Title level="5" className="text-neutral text-2xl">
                  {profile.name}
                </Title>
                <Paragraph className="text-muted-foreground">
                  Ambassador
                </Paragraph>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="rounded-full text-base">
                    {getCountryFlag(profile.country)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {profile.country}
                  </span>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mx-8">
                <StatCard label="Topics Created" value={profile.summary.stats.topics_created} />
                <StatCard label="Given" value={profile.summary.stats.likes_given} showHeart />
                <StatCard label="Received" value={profile.summary.stats.likes_received} showHeart />
                <StatCard label="Days Visited" value={profile.summary.stats.days_visited} />
                <StatCard label="Posts Created" value={profile.summary.stats.replies_created} />
              </div>
              <div className="flex-shrink-0  lg:mt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-primary-base hover:bg-primary-400"
                >
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
