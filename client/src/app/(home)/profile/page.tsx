'use client';

import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import DiscordIcon from '@/components/atoms/DiscordIcon';
import { ExternalLink } from '@/components/atoms/ExternalLink';
import GithubIcon from '@/components/atoms/GithubIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import XIcon from '@/components/atoms/XIcon';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import { useApp } from '@/context';
import { useMyProfile } from '@/hooks/useMyProfile';
import { getCountryFlag } from '@/utils/countryFlags';
import Link from 'next/link';
import React from 'react';
import { StatCard } from '../_components/profile/StartCard';

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
        <div className="max-w-md text-center">
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-2 flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <UserAvatar size="size-30" name={profile.name} />
                  <div className="absolute right-0.5 bottom-0.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white">
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
              <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-2">
                <StatCard
                  label="Topics Created"
                  value={profile.stats.topicsCreated}
                />
                <StatCard label="Given" value={profile.stats.given} showHeart />
                <StatCard
                  label="Received"
                  value={profile.stats.received}
                  showHeart
                />
                <StatCard
                  label="Days Visited"
                  value={profile.stats.daysVisited}
                />
                <StatCard
                  label="Posts Created"
                  value={profile.stats.postsCreated}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-6">
            <div className="border-border border-b">
              <div className="mb-2 flex items-center justify-between">
                <Title level="5" className="text-neutral">
                  Profile details
                </Title>
                <Link href="#">
                  <Button variant="primary" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            <div className="max-w-full space-y-6">
              <div className="flex items-start gap-3 lg:gap-3">
                <div className="text-muted-foreground/60 mt-3 text-sm lg:w-60">
                  Photo:
                </div>
                <div className="border-primary-base relative flex h-15 w-15 items-center justify-center overflow-hidden rounded-full border">
                  <UserAvatar size="size-40" name={profile.name} />
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-3">
                <div className="text-muted-foreground/60 text-sm lg:w-60">
                  Full name:
                </div>
                <div className="text-foreground text-sm">{profile.name}</div>
              </div>

              <div className="flex items-start gap-4 sm:gap-3">
                <div className="text-muted-foreground/60 text-sm lg:w-60">
                  Display name:
                </div>
                <div className="text-foreground text-sm">
                  {profile.displayName}
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3">
                <div className="text-muted-foreground/60 text-sm lg:w-60">
                  Email:
                </div>
                <div className="text-foreground text-sm">{profile.email}</div>
              </div>

              <div className="flex items-start gap-4 sm:gap-3">
                <div className="text-muted-foreground/60 text-sm lg:w-60">
                  Bio:
                </div>
                <div className="sm:flex-1 lg:max-w-md">
                  <Paragraph className="text-foreground text-sm leading-relaxed">
                    {profile.bio || 'No bio'}
                  </Paragraph>
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-3">
                <div className="text-muted-foreground/60 text-sm lg:w-60">
                  Country:
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full text-base">
                    {getCountryFlag(profile.country)}
                  </span>
                  <span className="text-foreground text-sm">
                    {profile.country}
                  </span>
                </div>
              </div>

              {profile.wallet && (
                <div className="flex items-start gap-4 sm:gap-3">
                  <div className="text-muted-foreground/60 text-sm lg:w-60">
                    Wallet:
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-foreground text-sm break-all">
                      {profile.wallet}
                    </span>
                    <CopyIcon />
                    <Link
                      href="https://cardanoscan.io/address/${profile.wallet}"
                      className="text-foreground hover:text-primary-base text-sm break-all"
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
                  <div className="text-muted-foreground/60 text-sm lg:w-60">
                    Ambassador URL:
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2">
                    <span className="text-foreground text-sm break-all">
                      {profile.ambassadorUrl}
                    </span>
                    <Link
                      href={profile.ambassadorUrl}
                      className="text-foreground hover:text-primary-base text-sm break-all"
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
                  <div className="text-muted-foreground/60 text-sm lg:w-60">
                    SPO ID:
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-foreground font-mono text-sm break-all">
                      {profile.spoId}
                    </span>
                    <CopyIcon />
                  </div>
                </div>
              )}

              {profile.github && (
                <div className="flex items-start gap-4 sm:gap-3">
                  <div className="text-muted-foreground/60 text-sm lg:w-60">
                    Github:
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <GithubIcon size={15} />
                    <span className="text-foreground text-sm break-all">
                      {profile.github}
                    </span>
                    <Link
                      href={`https://github.com/${profile.github}`}
                      className="text-foreground hover:text-primary-base text-sm break-all"
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
                  <div className="text-muted-foreground/60 text-sm lg:w-60">
                    X:
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <XIcon size={15} />
                    <span className="text-foreground text-sm break-all">
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
                  <div className="text-muted-foreground/60 text-sm lg:w-60">
                    Discord:
                  </div>
                  <div className="flex items-center gap-2 sm:gap-1">
                    <DiscordIcon size={15} />
                    <span className="text-foreground text-sm break-all">
                      {profile.discord}
                    </span>
                    <ExternalLink />
                  </div>
                </div>
              )}
            </div>

            {profile.isActiveAmbassador && (
              <div className="border-border mt-8 border-t pt-6">
                <Paragraph className="text-muted-foreground mb-4 text-sm">
                  You are currently an active ambassador. If you no longer wish
                  to serve in this role, you may withdraw. This action is
                  reversible only through re-application.
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
