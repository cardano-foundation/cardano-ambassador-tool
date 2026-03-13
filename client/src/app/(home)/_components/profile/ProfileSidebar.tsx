import DiscordIcon from "../../../../components/atoms/DiscordIcon";
import GithubIcon from "../../../../components/atoms/GithubIcon";
import XIcon from "../../../../components/atoms/XIcon";
import React from "react";
import { AboutSection } from "./AboutSection";
import { NetworkItem, NetworkSection } from "./NetworkSection";

interface ProfileSidebarProps {
  profile: {
    name: string;
    username: string;
    country: string;
    city: string;
    bio_excerpt: string;
    created_at: string;
    spo_id?: string;
    x_handle?: string;
    github?: string;
    discord?: string;
  };
  formatDate: (dateString: string) => string;
  cleanHtml: (html: string | null | undefined) => string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  formatDate,
  cleanHtml,
}) => {
  const networkItems: NetworkItem[] = [];

  if (profile.x_handle) {
    const isUrl = profile.x_handle.startsWith("http");
    const handle = isUrl
      ? profile.x_handle.split("/").pop() || "Profile"
      : profile.x_handle;
    networkItems.push({
      icon: <XIcon size={15} />,
      text: handle,
      url: isUrl ? profile.x_handle : `https://x.com/${profile.x_handle}`,
      platform: "X (Twitter)",
    });
  }

  if (profile.github) {
    const isUrl = profile.github.startsWith("http");
    const handle = isUrl
      ? profile.github.split("/").pop() || "Profile"
      : profile.github;
    networkItems.push({
      icon: <GithubIcon size={15} />,
      text: handle,
      url: isUrl ? profile.github : `https://github.com/${profile.github}`,
      platform: "GitHub",
    });
  }

  if (profile.discord) {
    const isUrl = profile.discord.startsWith("http");
    networkItems.push({
      icon: <DiscordIcon size={15} />,
      text: profile.discord,
      url: isUrl ? profile.discord : undefined,
      platform: "Discord",
    });
  }

  return (
    <div className="w-full space-y-6">
      <AboutSection
        profile={profile}
        formatDate={formatDate}
        cleanHtml={cleanHtml}
      />
      <NetworkSection items={networkItems} />
      {/* <Paragraph className="text-muted-foreground mt-4 text-base">
        Member Since: {formatDate(profile.created_at)}
      </Paragraph> */}
    </div>
  );
};
