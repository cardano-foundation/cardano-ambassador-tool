import Card, { CardContent } from '@/components/atoms/Card';
import GithubIcon from '@/components/atoms/GithubIcon';
import LinkedInIcon from '@/components/atoms/LinkedinIcon';
import Title from '@/components/atoms/Title';
import XIcon from '@/components/atoms/XIcon';
import React from 'react';

interface NetworkSectionProps {
  profileName: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  profileName,
  linkedinUrl,
  twitterUrl,
  githubUrl,
}) => {
  const SocialLink: React.FC<{
    url?: string;
    icon: React.ReactNode;
    text: string;
    platform: string;
  }> = ({ url, icon, text, platform }) => {
    if (!url) {
      return (
        <div className="flex items-center space-x-3 p-2">
          <div className="transition-transform duration-200 hover:scale-125">
            {icon}
          </div>
          <span className="text-neutral">{text}</span>
        </div>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100"
        aria-label={`Visit ${profileName}'s ${platform} profile`}
      >
        <div className="transition-transform duration-200 group-hover:scale-125">
          {icon}
        </div>
        <span className="text-neutral group-hover:text-primary-base transition-colors duration-200">
          {text}
        </span>
      </a>
    );
  };

  return (
    <Card>
      <CardContent className="p-2">
        <Title level="6" className="text-neutral mb-4 text-lg">
          Network
        </Title>
        <div className="space-y-1">
          <SocialLink
            url={linkedinUrl}
            icon={<LinkedInIcon size={15} />}
            text={profileName}
            platform="LinkedIn"
          />
          <SocialLink
            url={twitterUrl}
            icon={<XIcon size={15} />}
            text={profileName}
            platform="X (Twitter)"
          />
          <SocialLink
            url={githubUrl}
            icon={<GithubIcon size={15} />}
            text={profileName}
            platform="GitHub"
          />
        </div>
      </CardContent>
    </Card>
  );
};
