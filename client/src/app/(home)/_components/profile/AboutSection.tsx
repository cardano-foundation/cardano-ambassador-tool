import Card, { CardContent } from '@/components/atoms/Card';
import EditIcon from '@/components/atoms/EditIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import React from 'react';
import { LocationMap } from './CountryMap';

interface AboutSectionProps {
  profile: {
    username: string;
    country: string;
    city: string;
    bio_excerpt: string;
    created_at: string;
  };
  formatDate: (dateString: string) => string;
  cleanHtml: (html: string | null | undefined) => string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  profile,
  formatDate,
  cleanHtml,
}) => {
  const hasLocation = profile.city || profile.country;

  return (
    <Card>
      <CardContent>
        <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-2">
          <Title level="6" className="text-neutral text-lg">
            About
          </Title>
          {/* <div className="text-muted-foreground flex items-center gap-2">
            <EditIcon className="h-4 w-4" />
            <span>Edit</span>
          </div> */}
        </div>
        <Paragraph className="text-foreground mb-6 text-sm leading-snug font-normal break-all">
          {cleanHtml(profile.bio_excerpt)}
        </Paragraph>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-neutral font-semibold">Country:</span>{' '}
            <span className="text-muted-foreground">{profile.country || '—'}</span>
          </div>
          <div>
            <span className="text-neutral font-semibold">City:</span>{' '}
            <span className="text-muted-foreground">{profile.city || '—'}</span>
          </div>
          <div>
            <span className="text-neutral font-semibold">Username:</span>{' '}
            <span className="text-muted-foreground">{profile.username}</span>
          </div>
          <div>
            <span className="text-neutral font-semibold">Role:</span>{' '}
            <span className="text-muted-foreground"></span>
          </div>
          <div>
            <span className="text-neutral font-semibold">Website:</span>{' '}
            <span className="text-muted-foreground"></span>
          </div>
          <div>
            <span className="text-neutral font-semibold">Languages:</span>{' '}
            <span className="text-muted-foreground"></span>
          </div>
        </div>
        {hasLocation && (
          <LocationMap city={profile.city} country={profile.country} />
        )}
      </CardContent>
    </Card>
  );
};