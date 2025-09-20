import Card, { CardContent } from '@/components/atoms/Card';
import GithubIcon from '@/components/atoms/GithubIcon';
import LinkedInIcon from '@/components/atoms/LinkedinIcon';
import Title from '@/components/atoms/Title';
import XIcon from '@/components/atoms/XIcon';
import React from 'react';

interface NetworkSectionProps {
  profileName: string;
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  profileName,
}) => {
  return (
    <Card>
      <CardContent className="p-2">
        <Title level="6" className="text-neutral mb-4 text-lg">
          Network
        </Title>
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
