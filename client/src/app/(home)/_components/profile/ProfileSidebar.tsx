import Paragraph from '@/components/atoms/Paragraph';
import React from 'react';
import { AboutSection } from './AboutSection';
import { NetworkSection } from './NetworkSection';

interface ProfileSidebarProps {
  profile: {
    name: string;
    username: string;
    country: string;
    city: string;
    bio_excerpt: string;
    created_at: string;
  };
  formatDate: (dateString: string) => string;
  cleanHtml: (html: string | null | undefined) => string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  formatDate,
  cleanHtml,
}) => {
  return (
    <div className="w-full space-y-6 p-2">
      <AboutSection
        profile={profile}
        formatDate={formatDate}
        cleanHtml={cleanHtml}
      />
      <NetworkSection profileName={profile.name} />
      <Paragraph className="text-muted-foreground mt-4 text-base">
        Member Since: {formatDate(profile.created_at)}
      </Paragraph>
    </div>
  );
};
