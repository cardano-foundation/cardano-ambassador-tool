import Card, { CardContent } from "../../../../components/atoms/Card";
import Title from "../../../../components/atoms/Title";
import React from "react";

export interface NetworkItem {
  icon: React.ReactNode;
  text: string;
  url?: string;
  platform: string;
}

interface NetworkSectionProps {
  items: NetworkItem[];
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({ items }) => {
  const SocialLink: React.FC<{ item: NetworkItem }> = ({ item }) => {
    const { url, icon, text, platform } = item;

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
        className="group flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-all duration-200 hover:bg-muted"
        aria-label={`Visit ${text}'s ${platform} profile`}
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

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-2">
        <Title level="6" className="text-neutral mb-4 text-lg">
          Network
        </Title>
        <div className="space-y-1">
          {items.map((item, index) => (
            <SocialLink key={`${item.platform}-${index}`} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
