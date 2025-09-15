import { copyToClipboard, shortenString } from '@/utils';
import { Copy, ExternalLink } from 'lucide-react';

const Copyable = ({
  keyLabel,
  value,
  link = '',
  withKey = true,
}: {
  keyLabel?: string;
  value: string;
  link?: string;
  withKey?: boolean;
}) => {

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-neutral">{`${withKey ? keyLabel + ';' : ''} ${shortenString(value, 12)}`}</span>
        <span className="flex items-center gap-2">
          <Copy
            className="text-neutral size-4 hover:cursor-pointer"
            onClick={() => copyToClipboard(shortenString(value))}
          />
          <a
            href={link}
            target="_blank"
            className={`${link.length ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed'}`}
          >
            <ExternalLink className="text-neutral size-4" />
          </a>
        </span>
      </div>
    </>
  );
};

export default Copyable;
