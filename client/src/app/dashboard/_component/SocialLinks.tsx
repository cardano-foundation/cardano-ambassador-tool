import DiscordIcon from '@/components/atoms/DiscordIcon';
import { ExternalLink, GithubIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import ProfileField from './ProfileField';

interface SocialLinksProps {
  github?: string;
  twitter?: string;
  discord?: string;
}

export default function SocialLinks({ github, twitter, discord }: SocialLinksProps) {
  if (!github && !twitter && !discord) {
    return null;
  }

  return (
    <>
      {github && (
        <ProfileField label="Github">
          <div className="flex items-start gap-2 sm:gap-3">
            <GithubIcon size={15} />
            <span className="break-all">
              {github}
            </span>
            <Link
              href={`https://github.com/${github}`}
              className="text-foreground hover:text-primary-base break-all"
              target="_blank"
            >
              <ExternalLink />
            </Link>
          </div>
        </ProfileField>
      )}

      {twitter && (
        <ProfileField label="X">
          <div className="flex items-center gap-2 sm:gap-3">
            <XIcon size={15} />
            <span className="break-all">
              {twitter}
            </span>
            <Link
              href={`https://twitter.com/${twitter}`}
              className="text-foreground hover:text-primary-base break-all"
              target="_blank"
            >
              <ExternalLink />
            </Link>
          </div>
        </ProfileField>
      )}

      {discord && (
        <ProfileField label="Discord">
          <div className="flex items-center gap-2 sm:gap-1">
            <DiscordIcon size={15} />
            <span className="break-all">
              {discord}
            </span>
            <ExternalLink />
          </div>
        </ProfileField>
      )}
    </>
  );
}