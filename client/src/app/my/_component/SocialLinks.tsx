import DiscordIcon from '@/components/atoms/DiscordIcon';
import GithubIcon from '@/components/atoms/GithubIcon';
import XIcon from '@/components/atoms/XIcon';
import Link from 'next/link';
import ProfileField from './ProfileField';

interface SocialLinksProps {
  github?: string;
  twitter?: string;
  discord?: string;
}

export default function SocialLinks({
  github,
  twitter,
  discord,
}: SocialLinksProps) {
  if (!github && !twitter && !discord) {
    return null;
  }

  return (
    <>
      {github && (
        <ProfileField label="Github">
          <Link
            href={`https://github.com/${github}`}
            className="text-foreground hover:text-primary-base break-all"
            target="_blank"
          >
            <GithubIcon size={15} />
          </Link>
        </ProfileField>
      )}

      {twitter && (
        <ProfileField label="X formally twitter">
          <Link
            href={`https://twitter.com/${twitter}`}
            className="text-foreground hover:text-primary-base break-all"
            target="_blank"
          >
            <XIcon size={15} />
          </Link>
        </ProfileField>
      )}

      {discord && (
        <ProfileField label="Discord">
          <Link
            href={`https://twitter.com/${twitter}`}
            className="text-foreground hover:text-primary-base break-all"
            target="_blank"
          >
            <DiscordIcon size={15} />
          </Link>
        </ProfileField>
      )}
    </>
  );
}
