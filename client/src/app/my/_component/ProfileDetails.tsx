import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import Copyable from '@/components/Copyable';
import { getCountryFlag } from '@/utils';
import { CopyIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import ProfileField from './ProfileField';
import SocialLinks from './SocialLinks';

interface ProfileDetailsProps {
  profile: {
    name: string;
    username: string;
    email: string;
    bio?: string;
    country?: string;
    city?: string;
    spoId?: string;
    github?: string;
    twitter?: string;
    discord?: string;
    href?: string;
  };
  walletAddress?: string;
  onWithdrawRole: () => void;
  onEditProfile?: () => void;
}

export default function ProfileDetails({
  profile,
  walletAddress,
  onWithdrawRole,
  onEditProfile,
}: ProfileDetailsProps) {
  return (
    <Card>
      <CardContent className="px-6">
        <div className="border-border border-b">
          <div className="mb-2 flex items-center justify-between">
            <Title level="5" className="text-neutral">
              Profile details
            </Title>
            <Button
              variant="primary"
              size="sm"
              onClick={onEditProfile}
              disabled={!onEditProfile}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="max-w-full space-y-6">
          <ProfileField label="Photo" className="gap-3 lg:gap-3">
            <div className="border-primary-base relative flex h-15 w-15 items-center justify-center overflow-hidden rounded-full border">
              <UserAvatar size="size-40" name={profile.name} />
            </div>
          </ProfileField>

          <ProfileField label="Full name">{profile.name}</ProfileField>

          <ProfileField label="Display name">{profile.username}</ProfileField>

          <ProfileField label="Email" className="gap-3 sm:gap-3">
            {profile.email}
          </ProfileField>

          <ProfileField label="Bio">
            <div className="sm:flex-1 lg:max-w-md">
              <Paragraph className="text-foreground text-sm leading-relaxed">
                {profile.bio || 'No bio'}
              </Paragraph>
            </div>
          </ProfileField>

          {profile.country && (
            <ProfileField label="Country">
              <div className="flex items-center space-x-2">
                <span className="rounded-full text-base">
                  {getCountryFlag(profile.country)}
                </span>
                <span>{profile.country}</span>
              </div>
            </ProfileField>
          )}

          {profile.city && (
            <ProfileField label="City">{profile.city}</ProfileField>
          )}

          {walletAddress && (
            <ProfileField label="Wallet">
              <Copyable value={walletAddress} withKey={false} />
            </ProfileField>
          )}

          {profile.href && (
            <ProfileField label="Ambassador URL">
              <div className="flex items-center gap-2 sm:gap-2">
                <span className="break-all">{profile.href}</span>
                <Link
                  href={profile.href}
                  className="text-foreground hover:text-primary-base break-all"
                  target="_blank"
                >
                  <ExternalLink />
                </Link>
              </div>
            </ProfileField>
          )}

          {profile.spoId && (
            <ProfileField label="SPO ID">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-mono break-all">{profile.spoId}</span>
                <CopyIcon />
              </div>
            </ProfileField>
          )}

          <SocialLinks
            github={profile.github}
            twitter={profile.twitter}
            discord={profile.discord}
          />
        </div>

        {profile.username && (
          <div className="border-border mt-8 border-t pt-6">
            <Paragraph className="text-muted-foreground mb-4 text-sm">
              You are currently an active ambassador. If you no longer wish to
              serve in this role, you may withdraw. This action is reversible
              only through re-application.
            </Paragraph>
            <Button variant="primary" size="sm" onClick={onWithdrawRole}>
              Withdraw role
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
