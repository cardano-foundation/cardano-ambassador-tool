'use client';

import React from 'react';
import Link from 'next/link';
import Card, { CardContent } from '@/components/atoms/Card';
import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import Button from '@/components/atoms/Button';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import { ExternalLink } from '@/components/atoms/ExternalLink';
import UserAvatar from '@/components/atoms/UserAvatar';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import { useMyProfile } from '@/hooks/useMyProfile';
import { getCountryFlag } from '@/utils/countryFlags';
import { StatCard } from '../_components/profile/StartCard';
import GithubIcon from '@/components/atoms/GithubIcon';
import XIcon from '@/components/atoms/XIcon';
import DiscordIcon from '@/components/atoms/DiscordIcon';
import { useApp } from '@/context';

const ProfilePage: React.FC = () => {
  const { profile, loading, error, refetch } = useMyProfile();
  const { isAuthenticated } = useApp();
    if (!isAuthenticated) {
      return <SimpleCardanoLoader />;
    }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleWithdrawRole = async () => {
    console.log('Withdraw role clicked');
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <SimpleCardanoLoader />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Title level="3" className="text-foreground mb-2">
            Profile Not Found
          </Title>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen lg:p-6">
      <div className="mb-6 px-6">
        <div className="mb-2">
          <Title level="5" className="text-neutral">
            Profile overview
          </Title>
                <Paragraph className="text-muted-foreground">
                    An overview of your ambassador profile
                </Paragraph>
            </div>
        </div>
        <div className="px-6">
            <Card className="mb-8">
            <CardContent className="">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="mb-2 flex items-start gap-4">
                <div className="relative flex-shrink-0">
                    <UserAvatar size="size-30" name={profile.name} />
                    <div className="absolute right-0.5 bottom-0.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white  border border-white">
                        <div className="text-primary-base">
                        <CardanoIcon size={20} color="currentColor" />
                        </div>
                    </div>
                </div>
    
                <div className="min-w-0 flex-1">
                    <Title level="5" className="text-neutral">
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
            <div className="grid grid-cols-2 lg:flex  gap-3 lg:gap-2">
              <StatCard label="Topics Created" value={profile.stats.topicsCreated} />
              <StatCard label="Given" value={profile.stats.given} showHeart />
              <StatCard label="Received" value={profile.stats.received} showHeart />
              <StatCard label="Days Visited" value={profile.stats.daysVisited} />
              <StatCard label="Posts Created" value={profile.stats.postsCreated} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-6">
            <div className='border-b border-border'>
                <div className="flex items-center justify-between mb-2">
                    <Title level="5" className="text-neutral">
                    Profile details
                    </Title>
                    <Link href="/profile/edit">
                    <Button variant="primary" size="sm">
                        Edit Profile
                    </Button>
                    </Link>
                </div>
            </div>
          
          <div className="space-y-6 max-w-full">
            <div className="flex items-start gap-3 lg:gap-3">
              <div className="lg:w-60 text-sm text-muted-foreground/60 mt-3">Photo:</div>
              <div className="w-15 h-15 rounded-full flex items-center justify-center overflow-hidden relative border border-primary-base">
                <UserAvatar size="size-40" name={profile.name} />
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-3">
              <div className="lg:w-60 text-sm text-muted-foreground/60">Full name:</div>
              <div className="text-sm text-foreground">{profile.name}</div>
            </div>

            <div className="flex items-start gap-4 sm:gap-3">
              <div className="lg:w-60 text-sm text-muted-foreground/60">Display name:</div>
              <div className="text-sm text-foreground">{profile.displayName}</div>
            </div>

            <div className="flex items-start gap-3 sm:gap-3">
              <div className="lg:w-60 text-sm text-muted-foreground/60">Email:</div>
              <div className="text-sm text-foreground">{profile.email}</div>
            </div>

            <div className="flex items-start gap-4 sm:gap-3">
              <div className="lg:w-60 text-sm text-muted-foreground/60">Bio:</div>
              <div className="lg:max-w-md sm:flex-1">
                <Paragraph className="text-sm text-foreground leading-relaxed">
                  {profile.bio || 'No bio'}
                </Paragraph>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-3">
              <div className="lg:w-60 text-sm text-muted-foreground/60">Country:</div>
              <div className="flex items-center space-x-2">
                <span className="rounded-full text-base">
                  {getCountryFlag(profile.country)}
                </span>
                <span className="text-sm text-foreground">{profile.country}</span>
              </div>
            </div>

            {profile.wallet && (
              <div className="flex items-start gap-4 sm:gap-3">
                <div className="lg:w-60 text-sm text-muted-foreground/60">Wallet:</div>
                <div className="flex items-center gap-2 sm:gap-3 flex">
                  <span className="text-sm text-foreground break-all">{profile.wallet}</span>
                    <CopyIcon />
                    <Link 
                    href="https://cardanoscan.io/address/${profile.wallet}"
                    className="text-sm text-foreground hover:text-primary-base break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                  </Link>
                </div>
              </div>
            )}

            {profile.ambassadorUrl && (
              <div className="flex items-start gap-4 sm:gap-3">
                <div className="lg:w-60 text-sm text-muted-foreground/60">Ambassador URL:</div>
                <div className="flex items-center gap-2 sm:gap-2 ">
                  <span className="text-sm text-foreground break-all">
                    {profile.ambassadorUrl}
                  </span>
                  <Link 
                    href={profile.ambassadorUrl}
                    className="text-sm text-foreground hover:text-primary-base break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                  </Link>
                </div>
              </div>
            )}

            {profile.spoId && (
              <div className="flex items-start gap-4 sm:gap-3">
                <div className="lg:w-60 text-sm text-muted-foreground/60">SPO ID:</div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-sm text-foreground font-mono break-all">{profile.spoId}</span>
                    <CopyIcon />
                </div>
              </div>
            )}

            {profile.github && (
              <div className="flex items-start gap-4 sm:gap-3">
                <div className="lg:w-60  text-sm text-muted-foreground/60">Github:</div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <GithubIcon size={15}/>
                  <span className="text-sm text-foreground break-all">
                    {profile.github}
                  </span>
                  <Link 
                    href={`https://github.com/${profile.github}`} 
                    className="text-sm text-foreground hover:text-primary-base break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                  </Link>
                </div>
              </div>
            )}

            {profile.twitter && (
              <div className="flex items-start gap-4 sm:gap-3">
                <div className="lg:w-60  text-sm text-muted-foreground/60">X:</div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <XIcon size={15}/>
                  <span className="text-sm text-foreground break-all">
                    {profile.twitter}
                  </span>
                  <Link 
                    href={`https://twitter.com/${profile.twitter}`} 
                    className="text-foreground hover:text-primary-base break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                  </Link>
                </div>
              </div>
            )}

            {profile.discord && (
              <div className="flex items-start gap-4 sm:gap-3">
                <div className="lg:w-60 text-sm text-muted-foreground/60">Discord:</div>
                <div className="flex items-center gap-2 sm:gap-1">
                  <DiscordIcon size={15}/>
                  <span className="text-sm text-foreground break-all">
                    {profile.discord}
                  </span>
                    <ExternalLink />
                </div>
              </div>
            )}
          </div>

          {profile.isActiveAmbassador && (
            <div className="mt-8 pt-6 border-t border-border">
              <Paragraph className="text-sm text-muted-foreground mb-4">
                You are currently an active ambassador. If you no longer wish to serve in this role, you may withdraw. This action is reversible only through re-application.
              </Paragraph>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleWithdrawRole}
              >
                Withdraw role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
    </div>
  );
};

export default ProfilePage;