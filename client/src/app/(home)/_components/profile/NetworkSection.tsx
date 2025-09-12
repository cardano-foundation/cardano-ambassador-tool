import React from 'react';
import Title  from '@/components/atoms/Title';
import Card, { CardContent } from '@/components/atoms/Card';
import LinkedInIcon  from '@/components/atoms/LinkedinIcon';
import XIcon  from '@/components/atoms/XIcon';
import GithubIcon  from '@/components/atoms/GithubIcon';

interface NetworkSectionProps {
  profileName: string;
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({ profileName }) => {
  return (
    <Card>
      <CardContent className="p-2">
        <Title level="6" className="text-neutral text-lg mb-4">Network</Title>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <LinkedInIcon size={15} />
            <span className="text-neutral">{profileName}</span>
          </div>
          <div className="flex items-center space-x-3">
            <XIcon size={15} />
            <span className="text-neutral">{profileName}</span>
          </div>
          <div className="flex items-center space-x-3">
            <GithubIcon size={15} />
            <span className="text-neutral">{profileName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};