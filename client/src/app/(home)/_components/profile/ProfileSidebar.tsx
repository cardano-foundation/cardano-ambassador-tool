import React from 'react';
import Paragraph  from '@/components/atoms/Paragraph';
import { AboutSection } from './AboutSection';
import { NetworkSection } from './NetworkSection';

interface ProfileSidebarProps {
  profile: {
    name: string;
    username: string;
    country: string;
    bio_excerpt: string;
    created_at: string;
  };
  formatDate: (dateString: string) => string;
  cleanHtml: (html: string | null | undefined) => string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  profile, 
  formatDate, 
  cleanHtml 
}) => {
  return (
    <div className="w-80 flex-shrink-0 p-2 space-y-6 sticky top-6 self-start h-fit">
      <AboutSection 
        profile={profile}
        formatDate={formatDate}
        cleanHtml={cleanHtml}
      />
      <NetworkSection profileName={profile.name} />
      <Paragraph className="text-base text-muted-foreground mt-4">
        Member Since: {formatDate(profile.created_at)}
      </Paragraph>
    </div>
  );
};