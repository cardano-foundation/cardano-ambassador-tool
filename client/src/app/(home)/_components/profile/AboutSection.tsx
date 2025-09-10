import React from 'react';
import Title  from '@/components/atoms/Title';
import Paragraph  from '@/components/atoms/Paragraph';
import Card, { CardContent } from '@/components/atoms/Card';
import EditIcon  from '@/components/atoms/EditIcon';
import { CountryMap } from './CountryMap';

interface AboutSectionProps {
  profile: {
    username: string;
    country: string;
    bio_excerpt: string;
    created_at: string;
  };
  formatDate: (dateString: string) => string;
  cleanHtml: (html: string | null | undefined) => string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  profile, 
  formatDate, 
  cleanHtml 
}) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center border-b border-border/60 justify-between pb-2 mb-4">
          <Title level="6" className="text-neutral text-lg">About</Title>
          <div className="flex items-center gap-2 text-muted-foreground">
            <EditIcon className="w-4 h-4" />
            <span>Edit</span>
          </div>
        </div>
        <Paragraph className="text-foreground text-sm font-normal leading-snug mb-6 break-all">
          {cleanHtml(profile.bio_excerpt)}
        </Paragraph>
        <div className="space-y-3 text-sm">
          <div><span className="font-semibold text-neutral">Country:</span> <span className="text-muted-foreground">{profile.country}</span></div>
          <div><span className="font-semibold text-neutral">Username:</span> <span className="text-muted-foreground">{profile.username}</span></div>
          <div><span className="font-semibold text-neutral">Phone:</span> <span className="text-muted-foreground">{formatDate(profile.created_at)}</span></div>
          <div><span className="font-semibold text-neutral">Role:</span> <span className="text-muted-foreground"></span></div>
          <div><span className="font-semibold text-neutral">Website:</span> <span className="text-muted-foreground"></span></div>
          <div><span className="font-semibold text-neutral">Languages:</span> <span className="text-muted-foreground"></span></div>
        </div>
          <CountryMap country={profile.country} />
      </CardContent>
    </Card>
  );
};